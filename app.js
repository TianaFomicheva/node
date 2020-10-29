import express from 'express';
import watcher from './watcher';

const app = express(),
    PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Express started...');
    watcher(true)
});
