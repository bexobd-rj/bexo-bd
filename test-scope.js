const runTransaction = (db, cb) => {
    console.log("inner runTransaction called");
    return cb({});
};
const rawDb = {};
const window = {};
window.db = {
    runTransaction: (updateFunction) => {
        return runTransaction(rawDb, (transaction) => {
            return updateFunction(transaction);
        });
    }
};

window.db.runTransaction(t => {
    console.log("updateFunction called");
});
