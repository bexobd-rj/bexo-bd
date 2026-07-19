const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr1 = `                  const isStockOut = document.getElementById('apStockOut').checked;
                  const autoPost = document.getElementById('apAutoPost').checked;`;

const newStr1 = `                  const isStockOut = document.getElementById('apStockOut').checked;
                  const autoPost = document.getElementById('apAutoPost').checked;
                  const rating = parseInt(document.getElementById('apRating') ? document.getElementById('apRating').value : 5);`;

const targetStr2 = `                              isVerified: true,
                              rating: 5,`;

const newStr2 = `                              isVerified: true,
                              rating: rating,`;

if (html.includes(targetStr1)) {
    html = html.replace(targetStr1, newStr1);
    html = html.replace(targetStr2, newStr2);
    html = html.replace(targetStr2, newStr2); // It's in two places: bulk upload and normal upload
    fs.writeFileSync('index.html', html);
    console.log("Fixed createPostFromAdmin rating.");
} else {
    console.log("Could not find target strings for createPostFromAdmin.");
}
