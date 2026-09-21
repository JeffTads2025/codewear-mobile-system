'use strict';

module.exports = {
  async up(queryInterface) {
    const tables = await queryInterface.showAllTables();
    for (const tableName of ['colors', 'color']) {
      const hasColorsTable = tables.some((table) => String(table).toLowerCase() === tableName);
      if (hasColorsTable) {
        await queryInterface.dropTable(tableName);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('colors', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
};