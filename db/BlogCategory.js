const settings = require('./settings')

const blogCategorySchema = new settings.Schema({
  id: {
    type: settings.ObjectId,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  parent: {
    type: settings.ObjectId
  }
})

module.exports = settings.connection.model('BlogCategory', blogCategorySchema)
