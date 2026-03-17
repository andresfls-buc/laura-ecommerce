"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add creditCardSurcharge column
    await queryInterface.addColumn("orders", "creditCardSurcharge", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });

    // Add credit_card to paymentMethod ENUM
    await queryInterface.changeColumn("orders", "paymentMethod", {
      type: Sequelize.ENUM(
        "wompi",
        "nequi",
        "daviplata",
        "bank_transfer",
        "credit_card"
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("orders", "creditCardSurcharge");

    // Revert paymentMethod ENUM back to original
    await queryInterface.changeColumn("orders", "paymentMethod", {
      type: Sequelize.ENUM("wompi", "nequi", "daviplata", "bank_transfer"),
      allowNull: false,
    });
  },
};
