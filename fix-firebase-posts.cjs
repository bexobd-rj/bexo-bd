const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                      const firebasePosts = [];
                      snap.forEach(doc => {
                          const data = doc.data();
                          firebasePosts.push(data);
                      });`;

const replaceStr = `                      const firebasePosts = [];
                      snap.forEach(doc => {
                          let data = doc.data();
                          // Auto-fix corrupted images arrays (caused by split(''))
                          if (data.images && data.images.length > 1 && data.images[0] === 'h' && data.images[1] === 't') {
                              data.images = [data.images.join('')];
                              // Auto-correct in db silently
                              window.db.collection('bexo_posts').doc(String(doc.id)).update({ images: data.images }).catch(()=>{});
                          }
                          firebasePosts.push(data);
                      });`;

html = html.replace(targetStr, replaceStr);
fs.writeFileSync('index.html', html, 'utf8');
