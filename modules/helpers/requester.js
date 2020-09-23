const got = require("got");
const tokenGen = require("basic-auth-token");

//todo: make class with different auth if mutiple modules
const token = tokenGen(
  process.env.GITHUB_API_CLIENT,
  process.env.GITHUB_API_SECRET
);
authHeaders = {
  Authorization: `Basic ${token}`
};

const getJsonResponse = url => {
  return new Promise((res, rej) => {
    got(url, { json: true, headers: authHeaders })
      .then(response => {
        res(response);
      })
      .catch(err => {
        rej(err);
      });
  });
};

const getJsonBody = url => {
  return new Promise((res, rej) => {
    getJsonResponse(url)
      .then(response => {
        if (typeof response.body !== "undefined") {
          res(response.body);
        }
        rej("no body");
      })
      .catch(err => rej(err));
  });
};

const head = url => {
  return got.head(url);
};

module.exports = { getJsonResponse, getJsonBody, head };
