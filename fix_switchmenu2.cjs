const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetOld = `                  if(window.innerWidth < 1024) toggleSidebar();`;
const targetNew = `                  if(window.innerWidth < 1024) {
                      const sb = document.getElementById('sidebar');
                      if (sb && sb.classList.contains('mobile-active')) {
                          toggleSidebar();
                      }
                  }`;

html = html.replace(targetOld, targetNew);
fs.writeFileSync('index.html', html, 'utf8');
console.log("Success replacing innerWidth < 1024");
