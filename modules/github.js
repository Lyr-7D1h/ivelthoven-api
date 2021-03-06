const Etags = require('../db/Etags')
const requester = require('./helpers/requester')

const github = {
  username: 'lyr-7d1h',
  baseURL: 'https://api.github.com/',
  repos: 'users/lyr-7d1h/repos',
  rateLimit: 'rate_limit',
  auth: `?client_id=${process.env.GITHUB_API_CLIENT}&client_secret=${process.env.GITHUB_API_SECRET}`
}

const getRate = () => {
  return new Promise((resolve, reject) => {
    requester
      .getJsonBody(github.baseURL + github.rateLimit)
      .then(data => {
        if (data.rate || data.rate) {
          resolve({
            limit: data.rate.remaining,
            remaining: data.rate.remaining
          })
        } else {
          reject(new Error('Github is down'))
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

const getAllWithoutDeployments = () => {
  return new Promise((resolve, reject) => {
    requester
      .getJsonResponse(github.baseURL + github.repos + github.auth)
      .then(response => {
        if (typeof response.body !== 'undefined') {
          if (response.headers.etag) {
            Etags.find(
              { name: 'github', etag: response.headers.etag },
              (err, etags) => {
                if (err) reject(err)

                // has updates if it could not find anything
                const hasUpdates = etags.length === 0

                // update or create etag if could not find etag
                if (hasUpdates) {
                  Etags.updateOne(
                    { name: 'github' },
                    {
                      name: 'github',
                      etag: response.headers.etag
                    },
                    { upsert: true },
                    err => {
                      if (err) reject(err)
                    }
                  )
                }

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
                  }
                })
                resolve({ hasUpdates: hasUpdates, repos: repos })
              }
            )
          }
        }
      })
      .catch(err => reject(err))
  })
}

const getAllWithDeployments = () => {
  return new Promise((resolve, reject) => {
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
                        repo.deployment = body[0].environment
                        if (body[0].environment === 'github-pages') {
                          repo.deployment_url =
                            'https://projects.ivelthoven.nl/' + repo.name
                        }
                      }
                    }
                    return repo
                  })
                  .catch(err => reject(err))
              }
            })
          )
          resolve(repos)
        } else {
          // do nothing if no updates
          resolve()
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports = { getAllWithoutDeployments, getAllWithDeployments, getRate }
