const server = require("../index");
const authorization = require("../modules/authorization");

server.post("/auth", authorization, (req, res, next) => {
  res.send({ isValid: true });
});
