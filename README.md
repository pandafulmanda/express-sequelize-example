# Example express-sequelize app

## To Use

https://github.com/pandafulmanda/express-sequelize-example

Navigate into the directory you want this cloned into. Copy and paste following code into the terminal:
```
git clone https://github.com/pandafulmanda/express-sequelize-example.git
```
Navigate into express-sequelize-example directory.
```
npm install
```
```
npm start
```

This example has an implementation of form CRUD submission with input validation in `server.js` and in put `models/user.js` and how to seed from a CSV file using Sequelize.

## Seeding

### What Is Seeding?

Suppose we want to insert some data into a few tables by default, to manage
this we use something called seeders, with seed files such as this one. In general,
seed files are some change in data that can be used to populate database table with
sample data or test data. It is particularly useful whenever a db migration occurs,
since you can easily seed the new db.

### Creating A Seed File

These seed files (in our case) are generated using Sequelize from the command line. For example,
to generate a seed file to load seed data for a User table, we would enter the following command
into our command line (in the directory where we are currently working).
```
$ node_modules/.bin/sequelize seed:generate --name demo-user
```

This command will create a seed file in a `seeders` folder. File name will look something like `XXXXXXXXXXXXXX-demo-user.js`.
It follows the same `up / down` semantics as the migration files.

In this example repo, our seeder file is [20190112182145-seed-users.js](https://github.com/pandafulmanda/express-sequelize-example/blob/master/seeders/20190112182145-seed-users.js)

This file has been modified to read dummy data from a csv file already added to this repo. Normally, however,
the generated file will only include a single dummy user data. The generated file before modification,
would look something like this:

```javascript
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
        firstName: 'John',
        lastName: 'Doe',
        email: 'demo@demo.com'
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
```

### Running Seeds

To run all seed generated seed files, we must enter the following command into our command line:
```
$ node_modules/.bin/sequelize db:seed:all
```

This will execute each seed file in the seeders folder. In our case this would execute the seeder file
for users and you would now have a demo user inserted into your User table.

### Undoing Seeds

Seeders can always be undone.

To undo the most recent seeding, simply enter the command:
```
node_modules/.bin/sequelize db:seed:undo
```

To undo all seeds, enter this command:
```
node_modules/.bin/sequelize db:seed:undo:all
```