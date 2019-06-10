const server = require("../index");
const got = require('got');
const db = require('../db');


// const cleanData = (data) => {
//     let newData = [];
//     for (i in data) {
//         let rep = data[i];

//         let deployments = [];
//         getRequest(rep.deployments_url + auth, (data) => {
//             if (data) {
//                 deployments.push(data);
//             }
//         }).then(
//             newData.push({
//                 id: rep.id,
//                 name: rep.full_name,
//                 description: rep.description,
//                 created_at: rep.created_at,
//                 url: rep.html_url,
//                 deployments: rep.deployments_url,
//             })
//         ) 
//     }
//     return newData;
// }

server.get("/github", (req, res, next) => {
    db.getGithub().then((data) => {
        res.send(data);
    })

    setTimeout(() => {
        if (!res.headersSent) {
            res.send("Nothing found");
        }
    }, 2000);
})
