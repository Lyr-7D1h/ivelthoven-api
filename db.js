const sqlite3 = require('sqlite3').verbose();
const got = require('got');
const db = new sqlite3.Database('./api.ivelthoven.db');

const github = {
    username: "ivelthoven",
    baseURL: "https://api.github.com/",
    repos: "users/ivelthoven/repos",
    rateLimit: "rate_limit",
    auth: "?client_id=23296032&client_secret=b80393c7ebb68b8f6eae6bc051ccd8e9792bf637" 
}

class apiDB {
    constructor() {
        // super();
        this.db = new sqlite3.Database('./api.ivelthoven.db');

        // Only do it if we have the rate to complete task
        Promise.all([this.checkRate(), this.getGithubCount()])
            .then((values) => {
                // values[1] + 1 to make sure it also works when an repository has been added.
                // console.log(values);
                if (values[0] > values[1] + 1) {
                    this.createGithub();
                }
            })
            .catch( err => errHandler(err)); 
    }

    checkRate() {
        return new Promise((resolve, reject) => {
            getJson(github.baseURL + github.rateLimit, (data) => {
                if (data) {
                    resolve( data.rate.remaining );
                }
            })
        })
    }
    
    getGithubCount() {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all("SELECT Count(*) FROM github", (err, rows) => {
                    errHandler(err);
                    resolve( rows[0]['Count(*)'] );
                })
            })
        })
    }
    createGithub() {
        console.log('\x1b[36m%s\x1b[0m', "Updating github pages..")

        // Creating github table if it doesn't exsist
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS github (
                id INT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                description TEXT,
                created_at TEXT DATE,
                url TEXT NOT NULL,
                deployments TEXT
            )`, err => {errHandler(err)});
        })
        
        // Inserting data from url
        getJson(github.baseURL + github.repos + github.auth, (data) => {
            if ( typeof data != "undefined" ) {
                db.serialize(() => {
                    for (let i in data) {
                        let repo = data[i];
                        getJson(repo.deployments_url + github.auth, (data) => {
                            const stmt = db.prepare("REPLACE INTO github(id, name, description, created_at, url, deployments) VALUES (?, ?, ?, ?, ?, ?)", err => errHandler(err));
                            let is_deploy = false;
                            if (data && typeof data[0] !== "undefined") {
                                is_deploy = true;
                                stmt.run([
                                    repo.id,
                                    repo.name,
                                    repo.description,
                                    repo.created_at,
                                    repo.url,
                                    data[0].environment
                                ], err => {errHandler(err)});
                            } else {
                                stmt.run([
                                    repo.id,
                                    repo.name,
                                    repo.description,
                                    repo.created_at,
                                    repo.url,
                                    null
                                ], err => {errHandler(err)});
                            }
                            stmt.finalize();
                        })
                    }
                })
            }
        })
    }
    getGithub() {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.all("SELECT * FROM github", (err, rows) => {
                    errHandler(err);
                    resolve( rows );
                })
            })
        })
    }
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


console.log('\x1b[36m%s\x1b[0m', "setting up db..")
module.exports = new apiDB();