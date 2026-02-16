import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";


class ProductVariant extends Model {}

ProductVariant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
    },
    color: {
      type: DataTypes.STRING,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "ProductVariant",
    tableName: "product_variants",
    timestamps: true,
  }
);

export default ProductVariant;
