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
      res.statusCode = 501
      res.send({ error: err.message })
    })
})

server.post('/blog/category', authorization, (req, res, next) => {
  const category = new BlogCategory(req.body)

  category
    .validate()
    .then(() => {
      // if valid save
      category
        .save()
        .then(t => {
          console.log(t)
          res.send(t)
        })
        .catch(err => {
          res.statusMessage = 501
          res.send({ error: err.message })
        })
    })
    .catch(err => {
      res.statusMessage = 400
      res.send({ error: err.message })
    })
})

server.put('/blog/category/:id', authorization, (req, res, next) => {
  BlogCategory.updateOne({ _id: req.params.id }, req.body)
    .then(() => {
      res.send()
    })
    .catch(err => {
      res.statusMessage = 400
      res.send(err.message)
    })
})
