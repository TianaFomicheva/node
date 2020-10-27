const initOptions = {
    promiseLib: Promise
};
import pg from 'pg-promise'
const pgp = pg(initOptions)

const db = pgp("postgres://nodetest:nodetest@127.0.0.1/nodetest");
db.connect()
    .then(function (obj) {

        obj.done(); // success, release connection;
    })
    .catch(function (error) {
        console.log("ERROR:", error.message);
    });

export {db};