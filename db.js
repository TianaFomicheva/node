import Promise from 'bluebird'
const initOptions = {
    promiseLib: Promise
};
// import * as pgPromise from 'pg-promise'
import pg from 'pg-promise'
const pgp = pg(initOptions)

// export default function () {

    // const pgp1 = pgPromise.default;
    // const pgp = pgp1(initOptions);
    const db = pgp("postgres://nodetest:nodetest@127.0.0.1/nodetest");
    db.connect()
        .then(function (obj) {

            obj.done(); // success, release connection;
        })
        .catch(function (error) {
            console.log("ERROR:", error.message);
        });
//     return db;
// }


export  {db};