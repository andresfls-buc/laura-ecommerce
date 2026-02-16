import sequelize from "../config/sequelize.js";

import User from "./user.js";
import Product from "./product.js";
import ProductVariant from "./products_variants.js";

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

export{
    sequelize,
    User,
    Product,
    ProductVariant
}