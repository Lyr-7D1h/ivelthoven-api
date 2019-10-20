const settings = require("./settings");

const blogSchema = new settings.Schema({
  createdOn: {
    type: Date,
    required: true
  },
  modifiedON: {
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
});

module.exports = settings.connection.model("Blog", blogSchema);
