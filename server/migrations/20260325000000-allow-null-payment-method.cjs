"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("orders", "paymentMethod", {
      type: Sequelize.ENUM(
        "wompi",
        "nequi",
        "daviplata",
        "bank_transfer",
        "credit_card"
      ),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
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
};
