const MongoClient = require('mongodb').MongoClient;
const got = require('got');

require("dotenv").config();

const mongoConString = process.env.MONGO_CONNECTION_STRING;

const github = {
    username: "ivelthoven",
    baseURL: "https://api.github.com/",
    repos: "users/ivelthoven/repos",
    rateLimit: "rate_limit",
    auth: `?client_id=${process.env.GITHUB_API_CLIENT}&client_secret=${process.env.GITHUB_API_SECRET}`
}

const init = () => {
    const client = new MongoClient(mongoConString, { useNewUrlParser: true });
    client.connect((err, db) => {
        console.log('\x1b[36m%s\x1b[0m', "Creating Database..")
        const dbo = db.db("ivelthovenDB");

        createCollections(dbo).then(
            Promise.all([updateGithub(dbo)]).then((values) => {
                enableAutoUpdate();
                client.close();
            })
        ).catch(err => {errHandler(err); client.close();});
    });
}

const enableAutoUpdate = () => {
    console.log('\x1b[36m%s\x1b[0m', "Updating Database..");
    // Update Collections every hour
    setInterval(function() {
        client.connect((err, db) => {
            Promise.all([updateGithub(dbo)]).then((values) => {
                client.close();
            }).catch(err => {errHandler(err); client.close();})
        })
    }, 3600 * 1000); 
}


const createCollections = (db) => {
    return new Promise((res, rej) => {
        db.createCollection("github", function(err, result) {
            if (err) throw rej(err);
            console.log('\x1b[36m%s\x1b[0m', "  Github Collection Created..");
            res(result);
        });
    });
}


const checkGithubRate = () => {
    return new Promise((resolve, reject) => {
        getJson(github.baseURL + github.rateLimit, (data) => {
            if (data) {
                getGithubCount().then(count => {
                    if (data.rate.remaining > count + 1) {
                        resolve(true)
                    } else {
                        resolve(false);
                    }
                }).catch(err => {reject(err)})
            }
        })
    })
}

const updateGithub = (db) => {
    console.log('\x1b[36m%s\x1b[0m', "  Updating github pages..");
    return new Promise((res, rej) => {
        checkGithubRate().then((check) => {
            if (check) {
                getJson(github.baseURL + github.repos + github.auth, (data) => {
                    if ( typeof data != "undefined" ) {
                        const sanitizedData = data.map((repo) => {
                            return {
                                "_id": repo.id,
                                "name": repo.name,  
                                "description": repo.description,        
                                "created_at": repo.created_at,
                                "url": repo.html_url,
                                "api_url": repo.url,
                                "deployment": null,
                                "deployments_url": repo.deployments_url
                            }
                        })
        
                        sanitizedData.forEach((repo,i) => {
                            getJson(repo.deployments_url, (data) => {
                                if (data && typeof data[0] !== "undefined") { 
                                    repo.deployment = data[0].environment
                                }
                                db.collection("github").replaceOne({"_id": repo._id}, repo, { upsert: true }, (err, result) => {
                                    if (err) {rej(err)}
                                    if (i === sanitizedData.length - 1) {
                                        res();
                                    }
                                });
                            })
                        });
                    }
                })
            } else {
                rej(new Error("Github API rate limit exceeded"))
            }
        }).catch(err => errHandler(err));
    })
}

/**
 * exported functions
 */
getGithub = () => {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(mongoConString, { useNewUrlParser: true });
        client.connect((err, db) => {
            if (err) {
                rej(err);
            }
            const dbo = db.db("ivelthovenDB");
            dbo.collection("github").find({}).toArray(function(err, result) {
                if (err) throw reject(err);
                resolve(result);
                db.close();
              });
        })
    })
}
getGithubCount = () => {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(mongoConString, { useNewUrlParser: true });
        client.connect((err, db) => {
            const dbo = db.db("ivelthovenDB");
            dbo.collection("github").countDocuments((err, result) => {
                if (err){reject(err)};
                resolve(result);
            });
        })
    })
}


/**
 *  EXTERNAL FUNCTIONS 
 */
const errHandler = (err, ignore) => {
    if (err && !ignore) {
        console.error('\x1b[31m%s\x1b[0m', err);
        console.error(err);
        return;
    }
}
const getJson = (url, cb) => {
    // console.log(`request to ${url}`)
    got(url, { json: true }).then(response => {
        if (typeof response.body !== "undefined") {
            return cb(response.body);
        }
    }).catch(err => {errHandler(err)});
    return cb();
}

/**
 * Initialize
 */
init();

module.exports = {getGithub, getGithubCount};