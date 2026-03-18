import sequelize from "../config/sequelize.js";
import Boom from "@hapi/boom";
import { User, Order, Order_items, ProductVariant } from "../models/index.js";
import { SHIPPING_COST } from "../config/constants.js";

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
        if (!variant)
          throw Boom.notFound(
            `Product variant ${item.productVariantId} not found`
          );
        if (variant.stock < item.quantity)
          throw Boom.conflict(`Not enough stock for variant ${variant.id}`);

        subtotal += Number(variant.price) * item.quantity;
        totalUnits += item.quantity;
        variantsMap[item.productVariantId] = variant;
      }

      // ── FREE SHIPPING: 3 or more units ──────────────────────────────────
      const freeShipping = totalUnits >= 3;
      const shippingCost = freeShipping ? 0 : SHIPPING_COST;

      // ── CREDIT CARD SURCHARGE: 5% on (subtotal + shippingCost) ──────────
      const isCreditCard = paymentMethod === "credit_card";
      const baseAmount = subtotal + shippingCost;
      const creditCardSurcharge = isCreditCard
        ? Math.round(baseAmount * 0.05)
        : 0;
      const totalAmount = baseAmount + creditCardSurcharge;

      const reference = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const order = await Order.create(
        {
          userId: userId || null,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          shippingAddress,
          shippingCity,
          shippingPostalCode,
          paymentMethod,
          totalUnits,
          subtotal,
          shippingCost, // 0 if free shipping
          creditCardSurcharge, // 0 if not credit card — ⚠️ needs DB column
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

        variant.stock -= item.quantity;
        await variant.save({ transaction });
      }

      await transaction.commit();

      return {
        order: order,
        checkout: {
          reference: reference,
          amountInCents: Math.round(totalAmount * 100),
          currency: "COP",
        },
      };
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  static async getAllOrders() {
    return await Order.findAll({
      include: [
        {
          model: Order_items,
          as: "items",
          include: [{ model: ProductVariant, as: "productVariant" }],
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
          include: [{ model: ProductVariant, as: "productVariant" }],
        },
      ],
    });
    if (!order) throw Boom.notFound("Order not found");
    return order;
  }

  static async updateOrderStatus(orderId, newStatus) {
    const order = await Order.findByPk(orderId);
    if (!order) throw Boom.notFound("Order not found");

    // Define allowed statuses
    const ALLOWED_STATUSES = [
      "pending",
      "paid",
      "shipped",
      "completed",
      "cancelled",
    ];

    // Validate that the new status is valid
    if (!ALLOWED_STATUSES.includes(newStatus)) {
      throw Boom.badRequest(
        `Invalid status '${newStatus}'. Allowed statuses: ${ALLOWED_STATUSES.join(", ")}`
      );
    }

    // Define allowed transitions
    const allowedTransitions = {
      pending: ["paid", "cancelled"],
      paid: ["shipped", "cancelled"],
      shipped: ["completed", "cancelled"],
      completed: [], // Cannot change from completed
      cancelled: [], // Cannot change from cancelled
    };

    // Check if current status exists in transitions map
    if (!allowedTransitions[order.status]) {
      // If current status is not in the map, allow any valid status change
      // This handles legacy orders or edge cases
      console.warn(
        `Unknown order status '${order.status}', allowing transition to '${newStatus}'`
      );
      order.status = newStatus;
      await order.save();
      return order;
    }

    // Check if transition is allowed
    if (!allowedTransitions[order.status].includes(newStatus)) {
      throw Boom.badRequest(
        `Cannot change order status from '${order.status}' to '${newStatus}'. Allowed transitions: ${allowedTransitions[order.status].join(", ") || "none"}`
      );
    }

    order.status = newStatus;
    await order.save();
    return order;
  }

  static async cancelOrder(orderId) {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.findByPk(orderId, {
        include: [{ model: Order_items, as: "items" }],
        transaction,
      });
      if (!order) throw Boom.notFound("Order not found");
      if (order.status === "cancelled")
        throw Boom.badRequest("Order already cancelled");
      for (const item of order.items) {
        const variant = await ProductVariant.findByPk(item.productVariantId, {
          transaction,
        });
        variant.stock += item.quantity;
        await variant.save({ transaction });
      }
      order.status = "cancelled";
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
