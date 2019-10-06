const server = require("../index");
const Repositories = require("../db/Repositories");

server.get("/github", (req, res, next) => {
  Repositories.find({}, (err, repos) => {
    if (err) {
      res.statusCode = 501;
      res.send("something went wrong");
    }
    res.send(repos);
  });
});
