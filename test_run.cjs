const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost" });
setTimeout(() => {
    console.log("showAuth is:", typeof dom.window.showAuth);
    process.exit(0);
}, 1000);
