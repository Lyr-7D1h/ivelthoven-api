const mongoose = require("mongoose");

require("dotenv").config();

if (!process.env.CONNECTION_STRING) {
  throw new Error("no connection string defined");
}

exports.Schema = mongoose.Schema;
exports.connection = mongoose.createConnection(process.env.CONNECTION_STRING, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});
