import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

const getImgCode = `
              window.getImg = function(item) {
                  if (item.image && item.image.length > 100) return item.image;
                  if (item.img && item.img.length > 100) return item.img;
                  const pid = item.productId || item.postId;
                  if (pid && typeof appProducts !== 'undefined') {
                      const p = appProducts.find(x => String(x.id) === String(pid));
                      if (p && p.images && p.images.length > 0) return p.images[item.imgIdx || 0] || p.images[0];
                  }
                  return 'https://picsum.photos/seed/placeholder/200/200';
              };
`;

content = content.replace(/const originalStringify = JSON\.stringify;/, getImgCode + '\n                  const originalStringify = JSON.stringify;');

const replacerMod = `
                          if ((key === 'image' || key === 'img' || key === 'productImageUrl') && typeof val === 'string' && val.length > 2000 && this && (this.productId || this.postId || this.cartId)) {
                              return ''; // Strip large images from orders/cart to prevent QuotaExceededError
                          }
                          if (replacer) {
`;
content = content.replace(/if \(replacer\) \{/, replacerMod);

content = content.replace(/\$\{item\.image\}/g, '${window.getImg(item)}');
content = content.replace(/\$\{item\.image\s*\|\|.*?'\}/g, '${window.getImg(item)}');
content = content.replace(/\$\{it\.image\s*\|\|.*?'\}/g, '${window.getImg(it)}');

fs.writeFileSync('index.html', content);
console.log("Fixed images and json stringify");
