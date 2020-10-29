test('test', () => {
    const buildAction = function () {

        let diff = (a, b) => {
            return b.filter((e) => !~a.indexOf(e))
        }
        let added = diff(prevstate, newstate)
        let removed = diff(newstate, prevstate)
        if (added.length > 0 || removed.length > 0) {
            let added_args = Array.prototype.slice.call(added)
            let removed_args = Array.prototype.slice.call(removed)
            return ((added_args.length > 0) ? ' Добавлен -' + added_args.join(' Добавлен -') : '') + ((removed_args.length > 0) ? 'Удален - ' + removed_args.join(' Удален - ') : '')
        } else {
            return false
        }
        (prevstate, newstate)
        expect(buildAction(["1.txt", "2.txt"], ["1.txt"])).resolves.toEqual('Удален - 2.txt');

    }
})