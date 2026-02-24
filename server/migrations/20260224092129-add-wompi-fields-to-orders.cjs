'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'reference', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('orders', 'wompiTransactionId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'reference');
    await queryInterface.removeColumn('orders', 'wompiTransactionId');
  }
};