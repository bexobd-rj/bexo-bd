const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/imagesText\.split\(''\)/g, "imagesText.split('\\n')");
html = html.replace(/\$\{p \? p\.images\.join\(''\) : ''\}/g, "${p && p.images ? p.images.join('\\n') : ''}");

fs.writeFileSync('index.html', html);
