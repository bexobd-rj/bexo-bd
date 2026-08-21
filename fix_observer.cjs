const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /const observer = new MutationObserver\(\(mutations\) => \{[\s\S]*?observer\.observe\(document\.body, \{ childList: true, subtree: true, attributes: true, attributeFilter: \['class', 'style'\] \}\);/g;

if (html.match(regex)) {
    html = html.replace(regex, '');
    fs.writeFileSync('index.html', html);
    console.log("Observer removed.");
} else {
    console.log("Observer not found.");
}
