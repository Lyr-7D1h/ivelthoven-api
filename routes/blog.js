const server = require('../index')
const Blog = require('../db/Blog')
const authorization = require('../modules/authorization')

server.get('/blog', (req, res, next) => {
  Blog.find({})
    .then(blogs => {
      res.send(blogs)
    })
    .catch(err => {
      console.error(err)
      res.statusCode = 500
      res.send({ error: err.message })
    })
})

server.post('/blog', authorization, (req, res, next) => {
  req.body.createdOn = Date.now()
  const blog = new Blog(req.body)

  blog
    .validate()
    .then(() => {
      // if valid save
      blog
        .save()
        .then(t => {
          console.log(t)
          res.send(t)
        })
        .catch(err => {
          res.statusCode = 500
          res.send({ error: err.message })
        })
    })
    .catch(err => {
      res.statusCode = 400
      res.send({ error: err.message })
    })
})

server.put('/blog/:id', authorization, (req, res, next) => {
  Blog.updateOne({ _id: req.params.id }, req.body)
    .then(() => {
      res.send()
    })
    .catch(err => {
      res.statusCode = 400
      res.send(err.message)
    })
})
