import { DataTypes } from 'sequelize';
import sequelize from "../config/sequelize.js"

const ProductImage = sequelize.define('ProductImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    imageUrl: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    publicId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'product_variants',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
}, 
{
    tableName: 'product_images',
    timestamps: false
});

export default ProductImage;