'use strict';
const csvParse = require('csv-parse')

const path = require('path')
const fs = require('fs')

const db = require('../models')

function readMock(relativeFilePath) {
  return new Promise(function (resolve, reject) {
    let results = []

    fs.createReadStream(path.join(__dirname, relativeFilePath))
      .pipe(csvParse({ columns: true }))
      .on('data', function (row) {
        // delete the row id from the CSV file so that the
        // database can autogenerate the id
        delete row.id
        results.push(row)
      })
      .on('end', function (){
        resolve(results)
      })
      .on('error', reject)
  })
}

module.exports = {
  up: (queryInterface, Sequelize) => {

    return readMock('../data/mock-users.csv')
      .then(function (users) {
        return queryInterface.bulkInsert('Users', users)
      })

  },

  down: (queryInterface, Sequelize) => {


    return readMock('../data/mock-users.csv')
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
