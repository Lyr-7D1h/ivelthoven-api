const server = require("../index");
const Blog = require("../db/Blog");
const authorization = require("../modules/authorization");

server.get("/blog", (req, res, next) => {
  Blog.find({})
    .then(blogs => {
      res.send(blogs);
    })
    .catch(err => {
      console.error(err);
      res.statusCode = 501;
      res.send({ error: err.message });
    });
});

server.post("/blog", authorization, (req, res, next) => {
  let blog;
  try {
    blog = new Blog(req.body);
  } catch {
    res.statusMessage = 400;
    res.send({ error: "bad request" });
  }

  blog
    .save()
    .then(t => {
      console.log(t);
      res.send(t);
    })
    .catch(err => {
      console.error(err);
      res.statusMessage = 501;
      res.send({ error: err.message });
    });
});
