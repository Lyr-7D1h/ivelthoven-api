const Auth = require("../db/Auth");
var basicAuth = require("basic-auth");

Auth.find({}).then(items => {
  if (items.length === 0) {
    new Auth({
      name: "admin",
      secret: "admin"
    }).save();
  }
});

module.exports = (req, res, next) => {
  const user = basicAuth(req);
  if (user && user.name && user.pass) {
    Auth.find({ name: user.name }, "secret").then(auth => {
      if (auth.length > 0) {
        if (auth[0].secret === user.pass) {
          return next();
        }
      }
      res.statusCode = 401;
      res.send({ error: "unauthorized" });
    });
  } else {
    res.statusCode = 401;
    res.send({ error: "unauthorized" });
  }
};
