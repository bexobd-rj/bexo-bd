// I will check index.html for isLoggedIn function.
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regexIsLoggedIn = /function isLoggedIn/;
if (regexIsLoggedIn.test(html)) {
    console.log("isLoggedIn exists");
} else {
    console.log("no isLoggedIn");
}
