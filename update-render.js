import fs from 'fs';
const content = fs.readFileSync('script.js', 'utf8');

const targetStr = `                      const isStockOut = p.isStockOut === true;`;
const replacementStr = `                      const isStockOut = p.isStockOut === true || (p.stockCount !== undefined && p.stockCount <= 0);`;

if (content.includes(targetStr)) {
    let newContent = content.replace(targetStr, replacementStr);
    newContent = newContent.replace(targetStr, replacementStr); // in case there are multiple
    fs.writeFileSync('script.js', newContent);
    console.log("Updated script.js");
} else {
    console.log("Target not found in script.js");
}

const indexContent = fs.readFileSync('index.html', 'utf8');
if (indexContent.includes(targetStr)) {
    let newIndex = indexContent.replace(targetStr, replacementStr);
    newIndex = newIndex.replace(targetStr, replacementStr);
    fs.writeFileSync('index.html', newIndex);
    console.log("Updated index.html");
} else {
    console.log("Target not found in index.html");
}
