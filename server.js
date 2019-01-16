const express = require('express')
const Sequelize = require('sequelize')

const db = require('./models')

// Read the port to run on using the environment variable PORT if it exists, or default to 3000.
const PORT = (process.env.PORT || 3000)


// Some rendering functions based on JavaScript template literals.
function buildErrorHTML(error) {
  if (!error) {
    return ``
  }

  return `
<span>${error.message}</span>
    `
}

function buildErrorsHTML(errors) {
  if (!errors) {
    return ''
  }

  return errors.map(buildErrorHTML).join('')
}

function buildFormHTML(user, errors, formError) {
  const actionRoute = `/people/${user.id || ''}`
  return `
${buildErrorHTML(formError)}
<form action="${actionRoute}" method="POST">
  <div>
    <label for="person-email">Email</label>
    <input name="email" type="text" id="person-email" value="${user.email}"/>
    ${buildErrorsHTML(errors.email)}
  </div>
  <div>
    <label for="person-first-name">First Name</label>
    <input name="first_name" type="text" id="person-first-name" value="${user.first_name}"/>
    ${buildErrorsHTML(errors.first_name)}
  </div>
  <div>
    <label for="person-last-name">Last Name</label>
    <input name="last_name" type="text" id="person-last-name" value="${user.last_name}"/>
    ${buildErrorsHTML(errors.last_name)}
  </div>
  <div>
    <input type="submit" value="Submit!"/>
  </div>
</form>
  `
}

// A function for parsing through Sequelize validation errors.  We'll comment more on this below.
function groupSequelizeValidationErrorsByAttribute(sequelizeValidationErrors) {
  const errorsByPath = sequelizeValidationErrors.map(function(error) {
      return {
        name: error.validatorName,
        path: error.path,
        value: error.value,
        message: error.message
      }
    })
    .reduce(function (collector, error) {
      if (!collector[error.path]) {
        collector[error.path] = []
      }
      collector[error.path].push(error)
      return collector
    }, {})

  return errorsByPath
}

// Express app initialization.
const app = express()

// This line adds middleware for the express server to understand
// input from forms: https://expressjs.com/en/api.html#express.urlencoded
app.use(express.urlencoded())

// App routes here.
app.get('/', function (req, res) {
  res.send(buildFormHTML({}, {}))
})

app.post('/people', function (req, res) {

  // You can check for the validation errors here if you want to do it
  // manually or with a library other than Sequelize.
  //
  // It could be as simple as something like:
  // if (!req.body.first_name) {
  //   res.status(422).send(`
  // Please include a value for the first name!
  //   `)
  // }
  // for each of the different inputs to the form.


  // The code below uses the Sequelize validation model definition to
  // catch validation errors with the form inputs or the request body.

  db.User.create(req.body)
    .then(function (person) {
      // When the creation is successful, redirect to the GET /people
      // route where the collection of people is listed.
      res.redirect('/people')
    })
    .catch(function (error) {
      // If the error is not a validation error, the error is likely to be
      // some kind of database or other kind of server error.  Throw
      // the error onwards.

      // Learn more about defining Sequelize model validation here:
      //    http://docs.sequelizejs.com/manual/tutorial/models-definition.html#validations
      if (!(error instanceof Sequelize.ValidationError)) {
        throw error
      }

      // Otherwise, the error is a validation error returned from
      // sequelize as defined by our model.
      // Group validation errors by the path or data attribute to
      // pass into the form builder.
        return groupSequelizeValidationErrorsByAttribute(error.errors)
    })
    .then(function (inputErrors) {
      // Send back an error code for 422 Unprocessable Entity
      // with the form and validation errors rendered.
      res.status(422).send(buildFormHTML(req.body, inputErrors))
    })
    // This type of error could be a database error or some
    // other type of error not related to user input.  This kind
    // of error handling should be on your forms even if you
    // are using something other than Sequelize to validate your inputs!
    .catch(function (formError) {
      // Send back an error code for 500 Internal Server Error
      // with the form and form error message rendered.
      res.status(500).send(buildFormHTML(req.body, {}, formError))
    })
})

app.get('/people', function (req, res) {
  db.User.findAll({
      // Sequelize's way to ORDER BY
      // http://docs.sequelizejs.com/manual/tutorial/querying.html#ordering
      order: [
        ['createdAt', 'DESC'],
      ],
    })
    .then(function (users) {
      const peopleHTML = users.map(function (user) {
        return `
<li>
  <h3>${user.first_name} ${user.last_name}</h3>
  <p>${user.email}</p>
  <a href="./people/${user.id}">Edit</a>
</li>
        `
      })

      res.send(`
<ul>
  ${peopleHTML.join('')}
</ul>
      `)
    })

})

// The next two routes about about updating an existing user.
app.get('/people/:userId', function (req, res) {
  db.User.findOne({
    where: {
      id: parseInt(req.params.userId)
    }
  })
  .then(function (user) {
    res.send(buildFormHTML(user, {}))
  })
  .catch(function () {
    res.status(404).send(`User ${req.params.userId} not found.`)
  })
})

app.post('/people/:userId', function (req, res) {
  db.User.findOne({
    where: {
      id: parseInt(req.params.userId)
    }
  })
  .catch(function () {
    res.status(404).send(`User ${req.params.userId} not found.`)
    
  })
  .then(function (user) {
    return user.update(req.body)
  })
  // Below, we can use the same handling code as the above create route.
  // We could refactor to reduce the copy and paste.  One way would be to use
  // nextFn and middleware.
  .then(function (person) {
    res.redirect('/people')
  })
  .catch(function (error) {
    if (!(error instanceof Sequelize.ValidationError)) {
      throw error
    }
    return groupSequelizeValidationErrorsByAttribute(error.errors)
  })
  .then(function (inputErrors) {
    res.status(422).send(buildFormHTML(req.body, inputErrors))
  })
  .catch(function (formError) {
    res.status(500).send(buildFormHTML(req.body, {}, formError))
  })
})

// Start up the app!
app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`)
})