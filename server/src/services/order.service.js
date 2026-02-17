import sequelize from "../config/sequelize.js";
import { User, Order, Order_items, ProductVariant } from "../models/index.js";
import { SHIPPING_COST } from "../config/constants.js";

class OrderService {
  static async createOrder(userId, items) {
    const transaction = await sequelize.transaction();

    try {
      // 1️⃣ Validate user
      const user = await User.findByPk(userId, { transaction });
      if (!user) throw new Error("User not found");

      if (!items || items.length === 0) {
        throw new Error("Order must contain at least one item");
      }

      let subtotal = 0;
      const variantsMap = {};

      // 2️⃣ Validate items & calculate subtotal
      for (const item of items) {
        if (!item.quantity || item.quantity <= 0) {
          throw new Error("Invalid quantity");
        }

        const variant = await ProductVariant.findByPk(
          item.productVariantId,
          { transaction }
        );

        if (!variant) {
          throw new Error(
            `Product variant ${item.productVariantId} not found`
          );
        }

        if (variant.stock < item.quantity) {
          throw new Error(
            `Not enough stock for variant ${variant.id}`
          );
        }

        subtotal += Number(variant.price) * item.quantity;

        variantsMap[item.productVariantId] = variant;
      }

      // 3️⃣ Calculate totals
      const shippingCost = SHIPPING_COST;
      const totalAmount = subtotal + shippingCost;

      // 4️⃣ Create order
      const order = await Order.create(
        {
          userId,
          subtotal,
          shippingCost,
          totalAmount,
          status: "pending",
          paymentStatus: "unpaid",
        },
        { transaction }
      );

      // 5️⃣ Create order items & update stock
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

      return order;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default OrderService;
