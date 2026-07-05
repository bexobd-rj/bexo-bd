const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                          if (data.images && data.images.length > 1 && data.images[0] === 'h' && data.images[1] === 't') {
                              data.images = [data.images.join('')];
                              // Auto-correct in db silently
                              window.db.collection('bexo_posts').doc(String(doc.id)).update({ images: data.images }).catch(()=>{});
                          }`;

const replaceStr = `                          if (data.images && data.images.length > 1 && 
                              ((data.images[0] === 'h' && data.images[1] === 't') || (data.images[0] === 'd' && data.images[1] === 'a' && data.images[2] === 't' && data.images[3] === 'a'))
                          ) {
                              data.images = [data.images.join('')];
                              // Auto-correct in db silently
                              window.db.collection('bexo_posts').doc(String(doc.id)).update({ images: data.images }).catch(()=>{});
                          }`;

html = html.replace(targetStr, replaceStr);
fs.writeFileSync('index.html', html, 'utf8');
