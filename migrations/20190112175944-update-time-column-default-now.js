'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      This migration updates the time columns to use Postgres's NOW() function
      to generate the time automatically when entries are inserted without
      createdAt and updatedAt values.
    */
    const upTimeOptions = {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }

    return queryInterface.changeColumn(
      'Users',
      'createdAt',
      upTimeOptions,
    ).then(function() {
      return queryInterface.changeColumn(
        'Users',
        'updatedAt',
        upTimeOptions,
      )
    })
  },

  down: (queryInterface, Sequelize) => {
    /*
      Reverse of the up migration which will change the default value for the time
      columns back to null.
    */

    const downTimeOptions = {
      allowNull: false,
      type: Sequelize.DATE,
    }

    return queryInterface.changeColumn(
      'Users',
      'createdAt',
      downTimeOptions,
    ).then(function() {
      return queryInterface.changeColumn(
        'Users',
        'updatedAt',
        downTimeOptions,
      )
    })
  }
};
