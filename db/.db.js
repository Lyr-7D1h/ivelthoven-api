const MongoClient = require("mongodb").MongoClient;
const got = require("got");

require("dotenv").config();

const mongoConString = process.env.MONGO_CONNECTION_STRING;

const github = {
  username: "ivelthoven",
  baseURL: "https://api.github.com/",
  repos: "users/ivelthoven/repos",
  rateLimit: "rate_limit",
  auth: `?client_id=${process.env.GITHUB_API_CLIENT}&client_secret=${process.env.GITHUB_API_SECRET}`
};

const init = () => {
  const client = new MongoClient(mongoConString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  client.connect((err, db) => {
    console.log("\x1b[36m%s\x1b[0m", "Creating Database..");
    const dbo = db.db("ivelthovenDB");

    createCollections(dbo)
      .then(
        Promise.all([updateGithub(dbo)]).then(values => {
          enableAutoUpdate();
          client.close();
        })
      )
      .catch(err => {
        errHandler(err);
        client.close();
      });
  });
};

const enableAutoUpdate = () => {
  console.log("\x1b[36m%s\x1b[0m", "Updating Database..");
  // Update Collections every hour
  setInterval(function() {
    client.connect((err, db) => {
      Promise.all([updateGithub(dbo)])
        .then(values => {
          client.close();
        })
        .catch(err => {
          errHandler(err);
          client.close();
        });
    });
  }, 3600 * 1000);
};

const createCollections = db => {
  return new Promise((res, rej) => {
    db.createCollection("github", function(err, result) {
      if (err) throw rej(err);
      console.log("\x1b[36m%s\x1b[0m", "  Github Collection Created..");
      res(result);
    });
  });
};

/**
 *  EXTERNAL FUNCTIONS
 */

const getJson = (url, cb) => {
  // console.log(`request to ${url}`)
  got(url, { json: true })
    .then(response => {
      if (typeof response.body !== "undefined") {
        return cb(response.body);
      }
    })
    .catch(err => {
      errHandler(err);
    });
  return cb();
};

/**
 * Initialize
 */
init();
