import  express from 'express'
import {router} from './routes/index.js'
 import watcher from './watcher.js'
const  app = express(),
       PORT = process.env.PORT || 3000;


app.use(router);
watcher(true)



  app.listen(PORT, ()=> {
    console.log('Express started...');

    //запуск вотчера

  });
