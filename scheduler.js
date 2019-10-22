const githubModule = require('./modules/github')
const Repositories = require('./db/Repositories')
const cron = require('node-cron')

// Tasks
const updateGithub = () => {
  return new Promise((resolve, reject) => {
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
                    if (err) reject(err)
                    // check if last
                    if (repos.length === i + 1) {
                      resolve()
                    }
                  }
                )
              })
            } else {
              console.log('nothing to update..')
            }
          })
          .catch(err => {
            reject(err)
          })
      }
    })
  })
}

const http = require('https')
const stayAwake = () => {
  http.get(process.env.HEROKU_URL, res => {
    if (res.statusCode === 200) {
      console.log('success')
    }
  })
}

// Schedule tasks
module.exports = () => {
  console.log('\x1b[34m%s\x1b[0m', 'setup scheduler')

  // every 5 minutes check github for updates
  cron.schedule('*/5 * * * *', () => {
    console.log('running updateGithub')
    updateGithub()
      .then(() => {
        console.log('success')
      })
      .catch(err => errHandler(err))
  })
  cron.schedule('*/4 * * * *', () => {
    console.log('running stayAwake')
    stayAwake()
  })
}

const errHandler = err => {
  if (err) {
    console.error('\x1b[31m%s\x1b[0m', err)
  }
}
