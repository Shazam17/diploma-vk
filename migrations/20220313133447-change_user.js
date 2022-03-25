'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'Users',
          'token',
          {
            type: Sequelize.STRING,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'Users',
          'status',
          {
            type: Sequelize.STRING,
          },
          { transaction: t },
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('Users', 'status', { transaction: t }),
        queryInterface.removeColumn('Users', 'token', {
          transaction: t,
        }),
      ]);
    });
  },
};
