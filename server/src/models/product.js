import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
    }
    
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
  }
);

export default Product;
