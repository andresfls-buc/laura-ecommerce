import sequelize from "../config/sequelize.js";
import Boom from "@hapi/boom";
import {
  User,
  Order,
  Order_items,
  ProductVariant,
  Product,
} from "../models/index.js";
import { SHIPPING_COST, SURCHARGE_RATE } from "../config/constants.js";

class OrderService {
  static async createOrder(userId, orderData) {
    const transaction = await sequelize.transaction();

    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        shippingPostalCode,
        paymentMethod,
        items,
      } = orderData;

      if (!items || items.length === 0) {
        throw Boom.badRequest("Order must contain at least one item");
      }

      if (userId) {
        const user = await User.findByPk(userId, { transaction });
        if (!user) throw Boom.notFound("User not found");
      }

      let subtotal = 0;
      let totalUnits = 0;
      const variantsMap = {};

      for (const item of items) {
        const variant = await ProductVariant.findByPk(item.productVariantId, {
          transaction,
        });

        if (!variant) {
          throw Boom.notFound(
            `Product variant ${item.productVariantId} not found`
          );
        }

        if (variant.stock < item.quantity) {
          throw Boom.conflict(`Not enough stock for variant ${variant.id}`);
        }

        subtotal += Number(variant.price) * item.quantity;
        totalUnits += item.quantity;
        variantsMap[item.productVariantId] = variant;
      }

      // ── SHIPPING ─────────────────────────────────────────────
      const freeShipping = totalUnits >= 3;
      const shippingCost = freeShipping ? 0 : SHIPPING_COST;

      // ── SURCHARGE ─────────────────────────────────────────────
      const isCardPayment = paymentMethod === "credit_card";
      const baseAmount = subtotal + shippingCost;
      const creditCardSurcharge = isCardPayment
        ? Number((baseAmount * SURCHARGE_RATE).toFixed(2))
        : 0;

      const totalAmount = baseAmount + creditCardSurcharge;

      const reference = `ORDER-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      const order = await Order.create(
        {
          userId: userId || null,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          shippingAddress,
          shippingCity,
          shippingPostalCode,
          paymentMethod: null, // updated by webhook with actual Wompi payment type
          totalUnits,
          subtotal,
          shippingCost,
          creditCardSurcharge,
          totalAmount,
          reference,
          status: "pending",
          paymentStatus: "unpaid",
        },
        { transaction }
      );

      for (const item of items) {
        const variant = variantsMap[item.productVariantId];

        await Order_items.create(
          {
            orderId: order.id,
            productVariantId: variant.id,
            quantity: item.quantity,
            priceAtPurchase: variant.price,
          },
          { transaction }
        );
        // Stock is decremented only after payment is confirmed (see webhookController)
      }

      await transaction.commit();

      return {
        order,
        checkout: {
          reference,
          amountInCents: Math.round(totalAmount * 100),
          currency: "COP",
        },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getAllOrders() {
    return await Order.findAll({
      include: [
        {
          model: Order_items,
          as: "items",
          include: [
            {
              model: ProductVariant,
              as: "productVariant",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "name", "description"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  static async getOrderById(orderId) {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Order_items,
          as: "items",
          include: [
            {
              model: ProductVariant,
              as: "productVariant",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "name", "description"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) throw Boom.notFound("Order not found");
    return order;
  }

  static async updateOrderStatus(orderId, newStatus) {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, {
        include: [{ model: Order_items, as: "items" }],
        transaction,
      });

      if (!order) throw Boom.notFound("Order not found");

      const ALLOWED_STATUSES = [
        "pending",
        "paid",
        "shipped",
        "completed",
        "cancelled",
      ];

      if (!ALLOWED_STATUSES.includes(newStatus)) {
        throw Boom.badRequest("Invalid status");
      }

      const allowedTransitions = {
        pending: ["paid", "cancelled"],
        paid: ["shipped", "cancelled"],
        shipped: ["completed", "cancelled"],
        completed: [],
        cancelled: [],
      };

      if (!allowedTransitions[order.status]?.includes(newStatus)) {
        throw Boom.badRequest("Invalid status transition");
      }

      // Only restore stock if payment was already confirmed (stock was decremented at webhook)
      if (newStatus === "cancelled" && order.paymentStatus === "paid") {
        for (const item of order.items) {
          const variant = await ProductVariant.findByPk(item.productVariantId, {
            transaction,
          });

          if (variant) {
            variant.stock += item.quantity;
            await variant.save({ transaction });
          }
        }
      }

      order.status = newStatus;
      await order.save({ transaction });

      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default OrderService;
