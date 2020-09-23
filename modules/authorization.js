const Auth = require('../db/Auth')
const AuthCookie = require('../db/AuthCookie')
var httpBasic = require('basic-auth')

Auth.find({}).then(items => {
  if (items.length === 0) {
    new Auth({
      name: 'admin',
      secret: 'admin'
    }).save()
  }
})

const basicAuth = (req, res, next) => {
  const user = httpBasic(req)
  if (user && user.name && user.pass) {
    Auth.find({ name: user.name }, 'secret').then(auth => {
      if (auth.length > 0) {
        if (auth[0].secret === user.pass) {
          return next()
        }
      }
      res.statusCode = 401
      res.send({ error: 'unauthorized' })
    })
  } else {
    res.statusCode = 401
    res.send({ error: 'unauthorized' })
  }
}

const cookieAuth = (req, res, next) => {
  if (req.cookies && req.cookies.admin) {
    const [key, secret] = req.cookies.admin.toString('hex').split(':')
    if (key && secret) {
      AuthCookie.find({ key: key })
        .then(docs => {
          const doc = docs[0]
          if (doc) {
            if (doc.secret.toString('hex') === secret) {
              return next()
            }
          }
          res.statusCode = 401
          res.send({ error: 'unauthorized' })
        })
        .catch(err => {
          console.error(err)
          res.statusCode = 500
          res.send()
        })
    } else {
      res.statusCode = 401
      res.send({ error: 'unauthorized' })
    }
  } else {
    res.statusCode = 401
    res.send({ error: 'unauthorized' })
  }
}

module.exports = {
  basic: basicAuth,
  cookie: cookieAuth
}
