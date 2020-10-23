import  express from 'express'
 const  router = express.Router();


    router.get('/', (req, res) => {
        res.send('Главная');
    })

    router.get('/add', async (req, res) => {
        try {
            require('../watcher.js')
        } catch {
        }
    })


export {router}
