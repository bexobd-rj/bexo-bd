const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetOld = `window.getImg = function(item) {
                  if (item.image && item.image.length > 100) return item.image;
                  if (item.img && item.img.length > 100) return item.img;
                  const pid = item.productId || item.postId;
                  if (pid && typeof appProducts !== 'undefined') {
                      const p = appProducts.find(x => String(x.id) === String(pid));
                      if (p && p.images && p.images.length > 0) return p.images[item.imgIdx || 0] || p.images[0];
                  }
                  return 'https://picsum.photos/seed/placeholder/200/200';
              };`;

const targetNew = `window.getImg = function(item) {
                  if (item.image) return item.image;
                  if (item.img) return item.img;
                  const pid = item.productId || item.postId;
                  if (pid && typeof appPosts !== 'undefined') {
                      const p = appPosts.find(x => String(x.id) === String(pid));
                      if (p && p.images && p.images.length > 0) return p.images[item.imgIdx || 0] || p.images[0];
                  }
                  return 'https://picsum.photos/seed/placeholder/200/200';
              };`;

if (html.includes(targetOld)) {
    html = html.replace(targetOld, targetNew);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Success replacing getImg");
} else {
    console.log("getImg target not found");
}
