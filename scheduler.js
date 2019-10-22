const cron = require('node-cron')

// Tasks
const githubModule = require('./modules/github')
const Repositories = require('./db/Repositories')
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
                      resolve('Updated Repositories')
                    }
                  }
                )
              })
            } else {
              resolve('nothing to update')
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
  return new Promise((resolve, reject) => {
    http.get(process.env.HEROKU_URL, res => {
      if (res.statusCode === 200) {
        resolve('success')
      }
    })
  })
}

// Random Id Gen
const randomId = () => {
  return `${Math.floor(Math.random() * 1000 + 1000)} || `
}
// Schedule tasks
console.log('\x1b[34m%s\x1b[0m', 'setup scheduler')

// every 5 minutes check github for updates
cron.schedule('*/1 * * * *', () => {
  const id = randomId()
  console.log('\x1b[34m%s\x1b[0m', id + 'running updateGithub')
  updateGithub()
    .then(message => console.log('\x1b[32m%s\x1b[0m', id + message))
    .catch(err => errHandler(err))
})

// every 4 minutes make request to heroku endpoint so it stays awake
cron.schedule('*/5 * * * *', () => {
  const id = randomId()
  console.log('\x1b[34m%s\x1b[0m', id + 'running stayAwake')
  stayAwake()
    .then(message => console.log('\x1b[32m%s\x1b[0m', id + message))
    .catch(err => errHandler(err))
})

const errHandler = err => {
  if (err) {
    console.error('\x1b[31m%s\x1b[0m', err)
  }
}
