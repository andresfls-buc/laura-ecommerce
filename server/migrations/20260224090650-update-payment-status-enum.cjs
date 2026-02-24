'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('orders', 'paymentStatus', {
      type: Sequelize.ENUM(
        'unpaid',
        'pending',
        'paid',
        'failed',
        'refunded'
      ),
      allowNull: false,
      defaultValue: 'unpaid',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('orders', 'paymentStatus', {
      type: Sequelize.ENUM(
        'unpaid',
        'paid',
        'refunded'
      ),
      allowNull: false,
      defaultValue: 'unpaid',
    });
  }
};