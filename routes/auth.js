const crypto = require('crypto')
const AuthCookie = require('../db/AuthCookie')
const server = require('../index')
const auth = require('../modules/authorization')

server.post('/auth', auth.basic, (req, res, next) => {
  const key = crypto.randomBytes(16).toString('hex')
  const secret = crypto.randomBytes(32)

  new AuthCookie({
    key: key,
    secret: secret,
    createdOn: Date.now(),
    ip: req.connection.remoteAddress.toString()
  })
    .save()
    .then(() => {
      const token = `${key}:${secret.toString('hex')}`.toString('base64')
      if (process.env === 'development') {
        res.header('Set-Cookie', `admin=${token}; Path=/;`)
      } else {
        res.header(
          'Set-Cookie',
          `admin=${token}; Path=/; Domain=.ivelthoven.nl; HttpOnly; Secure`
        )
      }
      res.header('Set-Cookie', `admin=${token}; Path=/;`)
      res.header('Access-Control-Allow-Credentials', true)
      res.send({ isValid: true })
    })
    .catch(err => {
      console.error(err)
      res.statusCode = 500
      res.send()
    })
})
