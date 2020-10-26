import chokidar from 'chokidar'
import  dirtree from 'directory-tree'
import {db} from './db.js'

const  directory = './public/images'
let prevstate, newstate





export default function(onstart = false) {

// prevstate  = async function(onstart) {
//     return  !onstart ? getState(directory) : async (req, res) => {
//         try {
//     await getLastState()
//         }
//         catch{}
//     }
//
//
//
// }

prevstate =     async function getLastState() {

try {
    const result = await db.query('SELECT state FROM dirtree_states ORDER BY id  DESC LIMIT 1')

    await new Promise((res,rej) => res(JSON.parse(result[0]["state"]))).then(data => parsing(data))
    // const state_res = await parsing(parse_res);
        .then(data=>{
            newstate = getState(directory);
            let added = diff(newstate, data);
            let removed = diff(data, newstate);
            if (added.length > 0 || removed.length > 0) {
                console.log(333)

                let action = ((added.length > 0) ? ' Добавлен -' + added.join(' Добавлен -') : '') + ((removed.length > 0) ? 'Удален - ' + removed.join(' Удален - ') : '');
            insertState(newstate, action)
            }
            console.log(added, removed);

        })
    // return parse_res

}
            catch(error){
                console.log('ERROR:', error);
            }
    }
prevstate()

    function parsing(parse, state = []) {
        Object.keys(parse).forEach(function (key) {
            if (typeof (parse[key]) == 'string' && key == 'path') {
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
                // delete item.size;
                // delete item.extension;
                // delete item.type;
                // delete item.name;
                if (item.children) {
                    let point = extract(item.children);
                    point.forEach(function (child) {
                        if (state.indexOf(child) == -1) {
                            state.push(child);
                        }
                    });
                } else if(item.type !== 'directory'){
                    state.push(item.path);
                }
            });
            return state;
        }


        watcher.on('all', () => {
            newstate = getState(directory);


            // let added = diff(newstate, prevstate);


            // let removed = diff(prevstate, newstate);

            // if (added.length > 0 || removed.length > 0) {
            //     let action = ((added.length > 0) ? ' Добавлен -' + added.join(' Добавлен -') : '') + ((removed.length > 0) ? 'Удален - ' + removed.join(' Удален - ') : '');
            //

            prevstate = newstate;
        });
        async function insertState(state, action) {
            console.log(state, action);
           return false;
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

        // insertState().then(() => console.log('done'));
    function diff(a, b) {
        return a.filter((e) => !~b.indexOf(e));
    }
}




