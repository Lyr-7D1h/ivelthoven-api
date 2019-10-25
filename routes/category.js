const server = require('../index')
const BlogCategory = require('../db/BlogCategory')
const authorization = require('../modules/authorization')

server.get('/blog/category', (req, res, next) => {
  BlogCategory.find({})
    .then(categories => {
      res.send(categories)
    })
    .catch(err => {
      console.error(err)
      res.statusCode = 500
      res.send({ error: err.message })
    })
})

server.post('/blog/category', authorization, (req, res, next) => {
  const category = new BlogCategory(req.body)

  category
    .save()
    .then(t => {
      res.send(t)
    })
    .catch(err => {
      console.error(err)
      res.statusCode = 500
      res.send({ error: err.message })
    })
})

server.put('/blog/category/:id', authorization, (req, res, next) => {
  BlogCategory.updateOne({ _id: req.params.id }, req.body)
    .then(() => {
      res.send()
    })
    .catch(err => {
      console.log(err)
      res.statusCode = 400
      res.send(err.message)
    })
})
