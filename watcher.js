import chokidar from 'chokidar'
import dirtree from 'directory-tree'
import {db} from './db.js'
const directory = './images'
let prevstate, newstate, checkstate, action



export default function (onstart = false) {
    prevstate = getState(directory)
    checkstate = async function getLastState() {
        try {
            const result = await db.query('SELECT state FROM dirtree_states ORDER BY id  DESC LIMIT 1')
            await new Promise((res, rej) => res(JSON.parse(result[0]["state"]))).then(data => parsing(data))
                .then(data => {
                    checkAndInsert(data, prevstate)
                })
        } catch (error) {
            console.log('ERROR:', error);
        }
    }

    if (onstart) {
        checkstate()
    }

    function parsing(parse, state = []) {
        Object.keys(parse).forEach(function (key) {
            if (typeof (parse[key]) == 'string' && key == 'path' && (parse[key].indexOf('.') !== 0 && parse[key].indexOf('.') !== -1)) {
                state.push(parse[key])
            } else if (key == 'children') {
                Object.keys(parse[key]).forEach(function (key1) {
                    parsing(parse[key][key1], state);
                });
            }
        })
        return state;

    }


    let watcher = chokidar.watch(directory, {
        persistent: true,
        alwaysState: true
    })

    function extract(x, arr = []) {
        if (typeof (x) == 'object') {
            Object.keys(x).forEach(function (key) {
                extract(x[key], arr);
            });
        } else {
            arr.push(x);
        }
        return arr
    }


    function getState(dirname) {
        let state = [];

        dirtree(dirname, {normalizePath: false}, (item) => {
            if (item.children) {
                let point = extract(item.children);
                point.forEach(function (child) {
                    if (state.indexOf(child) === -1) {
                        state.push(child);
                    }
                });
            } else if (item.type !== 'directory') {
                state.push(item.path);
            }
        });
        return state;
    }


    watcher.on('all', () => {
        newstate = getState(directory);
        checkAndInsert(prevstate, newstate);
    });

    async function insertState(state, action) {
        try {
            await db.query('INSERT INTO dirtree_states(state, action) VALUES($1, $2) RETURNING id', [JSON.stringify(dirtree(directory)), action])
                .then(res => {
                    let row = res[0]
                    console.log('Создана запись, id = ' + row.id);
                })
                .then(() => console.log('done'))
                .catch(error => {
                    console.log('ERROR:', error);
                });

        } catch {
            console.log('error while insert')
        }
    }

    function diff(a, b) {
        return a.filter((e) => !~b.indexOf(e));
    }

    function buildAction(prevstate, newstate) {
        let added = diff(newstate, prevstate)
        let removed = diff(prevstate, newstate)
        if (added.length > 0 || removed.length > 0) {
            return ((added.length > 0) ? ' Добавлен -' + added.join(' Добавлен -') : '') + ((removed.length > 0) ? 'Удален - ' + removed.join(' Удален - ') : '')
        } else {
            return false
        }
    }

    function checkAndInsert(prevstate, newstate) {
        action = buildAction(prevstate, newstate)
        if(action){
            insertState(newstate, action)
            prevstate = newstate
        }
    }

}












