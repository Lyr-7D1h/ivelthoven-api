const settings = require("./settings");

const EtagsSchema = new settings.Schema({
  name: {
    required: true,
    unique: true,
    type: String
  },
  etag: String
});

module.exports = settings.connection.model("Etags", EtagsSchema);
