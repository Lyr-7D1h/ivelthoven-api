const settings = require("./settings");

const RepositoriesSchema = new settings.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  created_at: {
    type: Date
  },
  url: String,
  api_url: String,
  api_deployments_url: String,
  deployment: String,
  deployment_url: String
});
module.exports = settings.connection.model("Repositories", RepositoriesSchema);
