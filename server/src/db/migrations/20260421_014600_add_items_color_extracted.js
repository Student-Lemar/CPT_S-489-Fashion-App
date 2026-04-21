'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('items', 'color_extracted', {
      type: Sequelize.STRING(64),
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('items', 'color_extracted');
  }
};

