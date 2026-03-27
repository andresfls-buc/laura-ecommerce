'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Users
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: true },
      isGuest: { type: Sequelize.BOOLEAN, defaultValue: false },
      role: { type: Sequelize.ENUM("customer", "admin"), allowNull: false, defaultValue: "customer" },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    // Products
    await queryInterface.createTable("products", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      image: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    // ProductVariants
    await queryInterface.createTable("product_variants", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      size: { type: Sequelize.STRING },
      color: { type: Sequelize.STRING },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    // Orders
    await queryInterface.createTable("orders", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      customerName: { type: Sequelize.STRING, allowNull: false },
      customerEmail: { type: Sequelize.STRING, allowNull: false },
      customerPhone: { type: Sequelize.STRING, allowNull: true },
      shippingAddress: { type: Sequelize.STRING, allowNull: false },
      shippingCity: { type: Sequelize.STRING, allowNull: false },
      shippingPostalCode: { type: Sequelize.STRING, allowNull: false },
      totalUnits: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      shippingCost: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      totalAmount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      status: { type: Sequelize.ENUM("pending", "paid", "shipped", "completed", "cancelled"), defaultValue: "pending" },
      paymentMethod: { type: Sequelize.ENUM("wompi", "nequi", "daviplata", "bank_transfer"), allowNull: false },
      transactionId: { type: Sequelize.STRING, allowNull: true },
      paymentStatus: { type: Sequelize.ENUM("unpaid", "paid", "refunded"), defaultValue: "unpaid" },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    // Order Items
    await queryInterface.createTable("orders_items", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      productVariantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "product_variants", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      priceAtPurchase: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("orders_items");
    await queryInterface.dropTable("orders");
    await queryInterface.dropTable("product_variants");
    await queryInterface.dropTable("products");
    await queryInterface.dropTable("users");
  }
};
