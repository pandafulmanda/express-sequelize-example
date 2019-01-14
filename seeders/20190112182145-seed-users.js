'use strict';

const readCSV = require('../utils/read-csv')
const db = require('../models')

module.exports = {
  up: (queryInterface, Sequelize) => {

    return readCSV('../data/mock-users.csv')
      .then(function (users) {
        const usersWithoutIds = users.map(function(user) {
          const userCopy = Object.assign({}, user)
          delete userCopy.id
          return userCopy
        })

        return queryInterface.bulkInsert('Users', usersWithoutIds)
      })

  },

  down: (queryInterface, Sequelize) => {

    return readCSV('../data/mock-users.csv')
      .then(function (users) {
        const mockUserEmails = users.map(function(user) {
          return user.email
        })

        return db.User.destroy({
          where: {
            email: mockUserEmails
          }
        })

      })
  }
};
