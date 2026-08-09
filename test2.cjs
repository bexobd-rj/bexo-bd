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
  
  // Set values
  dom.window.document.getElementById('loginIdentifier').value = "test@example.com";
  dom.window.document.getElementById('loginPass').value = "password123";
  
  // Try to submit login
  try {
      const btn = dom.window.document.getElementById('btnLoginSubmit');
      console.log("Clicking btnLoginSubmit");
      btn.click();
      console.log("Clicked! Resulting btn text:", btn.innerHTML);
  } catch (e) {
      console.log("Error clicking btnLoginSubmit:", e);
  }
});
