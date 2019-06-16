const restify = require('restify');

// require("./db");

const server = restify.createServer({
  name: 'api-ivelthoven',
  version: '1.0.0'
});

module.exports = server;

// Index
server.get("/", (req, res) => {
    res.send("Welcome to IVelthoven API");
})

// Github Routes
require("./routes/github");

// Start server
server.listen(8080, () => {
  console.log('\x1b[34m%s\x1b[0m', `Ready on ${server.url}`);
});