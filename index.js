const restify = require('restify');
const fs = require('fs');
require("./db");

const server = restify.createServer();

module.exports = server;

// Load routes
fs.readdir("./routes", (err,files) => {
    if (err) console.log(err);

    let jsFile = files.filter(f => f.split(".").pop() === "js")
    if(jsFile.length <= 0){
        console.log("Couldn't find routes..")
        return;
    }

    jsFile.forEach((f, i) => {
        require(`./routes/${f}`);
        console.log('\x1b[34m%s\x1b[0m', `${f} route loaded..`);
    });
})

// Index
server.get("/", (req, res, next) => {
    res.send("Welcome to IVelthoven API");
})

// Start server
server.listen(8080, function () {
  console.log('\x1b[34m%s\x1b[0m', `Ready on ${server.url}`);
});