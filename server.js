const express = require('express')

const db = require('./models')

const PORT = 3000

const app = express()
app.use(express.urlencoded())


app.get('/', function (req, res) {
  res.send(`
<form action="./people" method="POST">
  <div>
    <label for="person-email">Email</label>
    <input name="email" type="text" id="person-email"/>
  </div>
  <div>
    <label for="person-first-name">First Name</label>
    <input name="first_name" type="text" id="person-first-name"/>
  </div>
  <div>
    <label for="person-last-name">Last Name</label>
    <input name="last_name" type="text" id="person-last-name"/>
  </div>
  <div>
    <input type="submit" value="Add Person!"/>
  </div>
</form>
  `)
})

app.post('/people', function (req, res) {
  db.User.create(req.body)
    .then(function (person) {
      res.redirect('/people')
    })
})

app.get('/people', function (req, res) {
  db.User.findAll({
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



app.listen(3000, function () {
  console.log(`App listening on port ${3000}!`)
})