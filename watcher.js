const chokidar = require('chokidar'),
    dirtree = require('directory-tree'),
    db = require('./db.js'),
    directory = './public/images';
let prevstate, newstate;

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

prevstate = getState(directory);



let watcher = chokidar.watch(directory, {
        persistent: true,
        alwaysState: true
    }
);
watcher.on('all', () => {
    newstate = getState(directory);

    function diff(a, b) {
        return a.filter((e) => !~b.indexOf(e));
    }

    let added = diff(newstate, prevstate);


    let removed = diff(prevstate, newstate);

    if(added.length >0 || removed.length >0) {
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

            }
            catch{
                console.log('error while insert')
            }
        }

        insertState().then(() => console.log('done'));

    }
    prevstate = newstate;
});