import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js"

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,

        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },

        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
         type: DataTypes.ENUM("admin", "customer"),
         defaultValue: "customer",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },

    },

    {
        timestamps: true,
    }
);

export default User;