const Etags = require("../db/Etags");
const requester = require("./helpers/requester");

const github = {
  username: "ivelthoven",
  baseURL: "https://api.github.com/",
  repos: "users/ivelthoven/repos",
  rateLimit: "rate_limit",
  auth: `?client_id=${process.env.GITHUB_API_CLIENT}&client_secret=${process.env.GITHUB_API_SECRET}`
};

const getRate = () => {
  return new Promise((resolve, reject) => {
    requester
      .getJsonBody(github.baseURL + github.rateLimit)
      .then(data => {
        if (data.rate || data.rate) {
          resolve({
            limit: data.rate.remaining,
            remaining: data.rate.remaining
          });
        } else {
          reject();
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

const getAllWithoutDeployments = () => {
  return new Promise((res, rej) => {
    requester
      .getJsonResponse(github.baseURL + github.repos + github.auth)
      .then(response => {
        if (typeof response.body != "undefined") {
          if (response.headers["etag"]) {
            Etags.find(
              { name: "github", etag: response.headers["etag"] },
              (err, etags) => {
                if (err) rej(err);

                // if did not find etag create or update
                if (!etags) {
                  Etags.updateOne(
                    { name: "github" },
                    {
                      name: "github",
                      etag: response.headers["etag"]
                    },
                    { upsert: true },
                    err => {
                      if (err) rej(err);
                    }
                  );
                }

                const hasUpdates = !etags;
                const repos = response.body.map(repo => {
                  return {
                    id: repo.id,
                    name: repo.name,
                    description: repo.description,
                    created_at: repo.created_at,
                    url: repo.html_url,
                    api_url: repo.url,
                    deployment: null,
                    deployment_url: null,
                    api_deployments_url: repo.deployments_url
                  };
                });
                res({ hasUpdates: hasUpdates, repos: repos });
              }
            );
          }
        }
      })
      .catch(err => rej(err));
  });
};

const getAllWithDeployments = () => {
  return new Promise((res, rej) => {
    getAllWithoutDeployments()
      .then(data => {
        if (data.hasUpdates) {
          // get deployment for all repos
          const repos = Promise.all(
            data.repos.map(async repo => {
              if (repo.api_deployments_url) {
                return requester
                  .getJsonBody(repo.api_deployments_url)
                  .then(body => {
                    if (body) {
                      if (body[0]) {
                        repo.deployment = body[0].environment;
                        if (body[0].environment === "github-pages") {
                          repo.deployment_url =
                            "https://projects.ivelthoven.nl/" + repo.name;
                        }
                      }
                    }
                    return repo;
                  })
                  .catch(err => rej(err));
              }
            })
          );
          res(repos);
        } else {
          // do nothing if no updates
          res();
        }
      })
      .catch(err => {
        rej(err);
      });
  });
};

module.exports = { getAllWithoutDeployments, getAllWithDeployments, getRate };
