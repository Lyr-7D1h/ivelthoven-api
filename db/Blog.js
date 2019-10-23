const settings = require('./settings')

const blogSchema = new settings.Schema({
  id: {
    type: settings.ObjectId,
    required: true,
    unique: true
  },
  createdOn: {
    type: Date,
    required: true
  },
  modifiedOn: {
    type: Date
  },
  category: {
    type: [settings.ObjectId]
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
})

module.exports = settings.connection.model('Blog', blogSchema)
