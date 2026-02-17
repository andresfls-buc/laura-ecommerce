import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

class Order_items extends Model {}

Order_items.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
    productVariantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },


    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    priceAtPurchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    

  },
  {
    sequelize,
    modelName: "Order_items",
    tableName: "orders_items",
    timestamps: true,
  }
);

export default Order_items;
