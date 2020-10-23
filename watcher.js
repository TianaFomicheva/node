import chokidar from 'chokidar'
import  dirtree from 'directory-tree'
import {db} from './db.js'

const  directory = './public/images'
let prevstate, newstate





export default function(onstart = false){

    prevstate = !onstart ? getState(directory) : getArray(getLastState());

async function getLastState() {


        await db.query('SELECT state FROM dirtree_states ORDER BY id  DESC LIMIT 1')
            .then(res => {
                let row = res[0]
                return row.state;
            })

            .catch(error => {
                console.log('ERROR:', error);
            });
}


function getArray(json_tree){
    let state = [];
    let parse = JSON.parse(json_tree)

    Object.keys(parse).forEach(function(key){
        if(key == 'children') {
            Object.values(parse[key]).forEach(function (value) {
                // if (state.indexOf(child1) == -1) {
                //     // state.push(child1.path);
                // }
                state.push(value.path)
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
            delete item.size;
            delete item.extension;
            delete item.type;
            delete item.name;
            if (item.children) {
                let point = extract(item.children);
                point.forEach(function (child) {
                    if (state.indexOf(child) == -1) {
                        state.push(child);
                    }
                });
            } else {
                state.push(item.path);
            }
        });
        return state;
    }





    watcher.on('all', () => {
        newstate = getState(directory);



        let added = diff(newstate, prevstate);


        let removed = diff(prevstate, newstate);

        if (added.length > 0 || removed.length > 0) {
            let action = ((added.length > 0) ? ' Добавлен -' + added.join(' Добавлен -') : '') + ((removed.length > 0) ? 'Удален - ' + removed.join(' Удален - ') : '');

            async function insertState() {
                try {
                    await db.query('INSERT INTO dirtree_states(state, action) VALUES($1, $2) RETURNING id', [JSON.stringify(dirtree(directory)).trim(), action])
                        .then(res => {
                            let row = res[0]
                            console.log('Создана запись, id = ' + row.id);
                        })

                        .catch(error => {
                            console.log('ERROR:', error);
                        });

                } catch {
                    console.log('error while insert')
                }
            }

            insertState().then(() => console.log('done'));

        }
        prevstate = newstate;
    });
    function diff(a, b) {
        return a.filter((e) => !~b.indexOf(e));
    }
}