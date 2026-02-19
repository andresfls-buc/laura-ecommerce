import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },  

    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    customerPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    shippingCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    shippingPostalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    totalUnits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

   

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

     status: {
      type: DataTypes.ENUM(
        "pending", 
        "paid",
        "shipped",
        "completed", 
        "cancelled"
    ),
      defaultValue: "pending",
    },

    paymentMethod: {
      type: DataTypes.ENUM(
        "wompi", 
        "nequi", 
        "daviplata", 
        "bank_transfer"
      ),
      allowNull: false,
    },

    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    paymentStatus: {
      type: DataTypes.ENUM(
        "unpaid", 
        "paid", 
        "refunded"
    ),
    defaultValue: "unpaid",
    },

  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
  }
);

export default Order;
