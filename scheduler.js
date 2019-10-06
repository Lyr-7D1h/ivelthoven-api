const githubModule = require("./modules/github");
const Repositories = require("./db/Repositories");
const cron = require("node-cron");

// Tasks
const updateGithub = () => {
  return new Promise((res, rej) => {
    githubModule.getRate().then(rate => {
      if (rate.remaining) {
        githubModule
          .getAllWithDeployments()
          .then(repos => {
            if (repos) {
              repos.forEach((repo, i) => {
                Repositories.updateOne(
                  { id: repo.id },
                  repo,
                  { upsert: true },
                  err => {
                    if (err) rej(err);
                    // check if last
                    if (repos.length === i + 1) {
                      res();
                    }
                  }
                );
              });
            } else {
              console.log("nothing to update..");
            }
          })
          .catch(err => {
            rej(err);
          });
      }
    });
  });
};

// Schedule tasks
module.exports = () => {
  console.log("\x1b[34m%s\x1b[0m", "setup scheduler");

  cron.schedule("*/5 * * * *", () => {
    console.log("running updateGithub");
    updateGithub()
      .then(() => {
        console.log("success");
      })
      .catch(err => errHandler(err));
  });
};

const errHandler = err => {
  if (err) {
    console.error("\x1b[31m%s\x1b[0m", err);
    return;
  }
};
