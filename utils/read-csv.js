const csvParse = require('csv-parse')

const path = require('path')
const fs = require('fs')

function readCSV(relativeFilePath) {
  return new Promise(function (resolve, reject) {
    let results = []

    fs.createReadStream(path.join(__dirname, relativeFilePath))
      .pipe(csvParse({ columns: true }))
      .on('data', function (row) {
        results.push(row)
      })
      .on('end', function (){
        resolve(results)
      })
      .on('error', reject)
  })
}

module.exports = readCSV