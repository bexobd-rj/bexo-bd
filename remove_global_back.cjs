const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<!-- GLOBAL BACK BUTTON FIX V2 -->[\s\S]*?<\/script>/;
if (html.match(regex)) {
    html = html.replace(regex, '');
    fs.writeFileSync('index.html', html);
    console.log("Global back button fix removed.");
} else {
    console.log("Not found.");
}
