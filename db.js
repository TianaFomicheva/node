const Promise = require('bluebird');
const initOptions = {
    promiseLib: Promise
};
const pgp = require('pg-promise')(initOptions);
// console.log(pgp);
const db = pgp("postgres://nodetest:nodetest@127.0.0.1/nodetest");
// console.log(db);

db.connect()
    .then(function (obj) {
        obj.done(); // success, release connection;
    })
    .catch(function (error) {
        console.log("ERROR:", error.message);
    });



module.exports = db;