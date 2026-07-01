const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const badShowAuth = `window.showAuth = function(isLogin) {
    const landing = document.getElementById('landingSection');
    const auth = document.getElementById('authSection');
    
    if (landing) landing.classList.add('hidden');
    if (auth) {
        const landing = document.getElementById('landingSection'); if(landing) { landing.classList.remove('hidden'); auth.classList.add('hidden'); } else { auth.classList.remove('hidden'); }
        auth.classList.add('flex');
    }`;

const goodShowAuth = `window.showAuth = function(isLogin) {
    const landing = document.getElementById('landingSection');
    const auth = document.getElementById('authSection');
    
    if (landing) landing.classList.add('hidden');
    if (auth) {
        auth.classList.remove('hidden');
        auth.classList.add('flex');
    }`;

html = html.replace(badShowAuth, goodShowAuth);
fs.writeFileSync('index.html', html);
console.log('Fixed showAuth logic');
