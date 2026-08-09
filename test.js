const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.onerror = function(msg, url, line, col, error) {
  console.log("Global Error:", msg);
};

dom.window.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded");
  
  // Try to click login button
  try {
      if (typeof dom.window.showAuth === 'function') {
          console.log("showAuth is a function");
          dom.window.showAuth(true);
          console.log("Called showAuth");
      } else {
          console.log("showAuth is NOT a function!");
      }
  } catch (e) {
      console.log("Error calling showAuth:", e);
  }
});
