import express from 'express'
import watcher from './watcher.js'

const app = express(),
    PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Express started...');
    watcher(true)
});
