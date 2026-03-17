"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_orders_paymentMethod" ADD VALUE 'credit_card';
    `);
  },

  async down(queryInterface) {
    // PostgreSQL does not support removing values from an ENUM natively
    // To rollback you would need to recreate the type — safe to leave empty
  },
};
