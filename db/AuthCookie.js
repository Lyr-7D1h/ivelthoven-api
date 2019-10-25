const settings = require('./settings')

const authCookieSchema = new settings.Schema({
  key: {
    type: String,
    required: true
  },
  secret: {
    type: Buffer,
    unique: true,
    required: true
  },
  createdOn: {
    type: Date,
    required: true
  },
  ip: {
    type: String,
    required: true
  }
})

module.exports = settings.connection.model('AuthCookie', authCookieSchema)
