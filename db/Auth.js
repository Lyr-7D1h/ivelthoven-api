const settings = require("./settings");

const authSchema = new settings.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  secret: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = settings.connection.model("Auth", authSchema);
