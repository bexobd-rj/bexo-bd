const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetOld = `                  if(target) target.classList.add('active');
                  if(window.innerWidth < 1024) toggleSidebar();

                  // Reset pagination when switching menus`;

const targetNew = `                  if(target) target.classList.add('active');
                  if(window.innerWidth < 1024) {
                      const sb = document.getElementById('sidebar');
                      if (sb && sb.classList.contains('mobile-active')) {
                          toggleSidebar();
                      }
                  }

                  // Reset pagination when switching menus`;

if (html.includes(targetOld)) {
    html = html.replace(targetOld, targetNew);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Success replacing switchMenu sidebar toggle");
} else {
    console.log("switchMenu target not found");
}
