const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `              let appPosts = JSON.parse(localStorage.getItem('bexo_posts')) || [];`;
const replaceStr = `              let appPosts = JSON.parse(localStorage.getItem('bexo_posts')) || [];
              
              // ONE-TIME FIX for corrupted image arrays
              let _needsSave = false;
              appPosts.forEach(p => {
                  if (p.images && p.images.length > 1 && typeof p.images[0] === 'string' && typeof p.images[1] === 'string') {
                      if ((p.images[0] === 'h' && p.images[1] === 't') || (p.images[0] === 'd' && p.images[1] === 'a' && p.images[2] === 't' && p.images[3] === 'a')) {
                          p.images = [p.images.join('')];
                          _needsSave = true;
                      }
                  }
              });
              if (_needsSave) localStorage.setItem('bexo_posts', JSON.stringify(appPosts));`;

html = html.replace(targetStr, replaceStr);
fs.writeFileSync('index.html', html, 'utf8');
