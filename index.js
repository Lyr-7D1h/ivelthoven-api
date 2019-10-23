const restify = require('restify')
const corsMiddleware = require('restify-cors-middleware')
const restifyLogger = require('restify-logger')
const fs = require('fs')

// require("./db");

const PORT = process.env.PORT || 5000

const cors = corsMiddleware({
  preflightMaxAge: 5, // Optional
  origins: [
    'https://*.ivelthoven.nl'
    // 'https://projects.ivelthoven.nl',
    // 'https://ivelthoven.github.io',
    // 'https://blog.ivelthoven.nl',
    'http://localhost:3000'
  ]
})

const server = restify.createServer({
  name: 'api-ivelthoven',
  version: '1.0.0'
})

module.exports = server

server.pre(cors.preflight)
server.use(cors.actual)

server.use(restifyLogger('short'))

// Index
server.get('/', (req, res) => {
  res.send('Welcome to IVelthoven API')
})

// Routes
fs.readdir(`${__dirname}/routes`, (err, files) => {
  if (err) {
    throw err
  }
  files.forEach(file => {
    if (file.endsWith('.js')) {
      console.log('\x1b[34m%s\x1b[0m', `Loaded route ${file}`)
      require(`${__dirname}/routes/${file}`)
    }
  })
  console.log('\n=====================\n')
})

// Scheduler
require('./scheduler')

// Start server
server.listen(PORT, () => {
  console.log('\x1b[34m%s\x1b[0m', `Ready on ${server.url}`)
})
