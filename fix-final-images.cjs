const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The logic inside createPostFromAdmin
html = html.replace(
    /let finalImages = imagesText\.split\(\/\[\\s,\]\+\/\)\.map\(l => l\.trim\(\)\)\.filter\(l => l !== ''\);\s*if \(typeof adminUploadedImages !== 'undefined' && adminUploadedImages\.length > 0\) \{\s*finalImages = \[\.\.\.adminUploadedImages, \.\.\.finalImages\];\s*\}/,
    `let finalImages = imagesText.split(/[\\s,]+/).map(l => l.trim()).filter(l => l !== '');
                  
                  // Get the main image
                  let mainImage = '';
                  if (typeof adminUploadedImages !== 'undefined' && adminUploadedImages.length > 0) {
                      mainImage = adminUploadedImages[0];
                  } else {
                      // Grab from preview if it exists
                      const previewImg = document.querySelector('#imagePreview img');
                      if (previewImg && previewImg.src && !previewImg.src.includes(window.location.host) && previewImg.src !== '') {
                          mainImage = previewImg.src;
                      } else if (pId) {
                          const pObj = appPosts.find(item => String(item.id) === String(pId));
                          if (pObj && pObj.images && pObj.images.length > 0) {
                              mainImage = pObj.images[0];
                          }
                      }
                  }

                  if (mainImage) {
                      finalImages = [mainImage, ...finalImages];
                  }`
);

fs.writeFileSync('index.html', html);
