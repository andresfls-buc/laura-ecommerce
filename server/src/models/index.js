import sequelize from "../config/sequelize.js";

import User from "./user.js";
import Product from "./product.js";
import ProductVariant from "./products_variants.js";
import Order from "./orders.js";
import Order_items from "./orders_items.js";

// Establecer relaciones entre modelos
// Product can have many variants 1 -> N
Product.hasMany(ProductVariant, { 
    foreignKey: "productId", 
    as: "variants" ,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

ProductVariant.belongsTo(Product, { 
    foreignKey: "productId", 
    as: "product" ,
    
});

Order.hasMany(Order_items, {
    foreignKey: "orderId",
    as: "items",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Order_items.belongsTo(Order, {
    foreignKey: "orderId",
    as: "order",
});

ProductVariant.hasMany(Order_items, {
    foreignKey: "productVariantId",
    as: "orderItems",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Order_items.belongsTo(ProductVariant, {
    foreignKey: "productVariantId",
    as: "productVariant",
});


export{
    sequelize,
    User,
    Product,
    ProductVariant,
    Order,
    Order_items,
}