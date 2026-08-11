const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace("showSection('profileSection');", "switchMenu('profile');");

fs.writeFileSync('index.html', html);
