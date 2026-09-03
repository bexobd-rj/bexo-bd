const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script>\s*\(function\(\) \{\s*var rawCreateClient[\s\S]*?\}\)\(\);\s*<\/script>/);
if (match) {
    fs.writeFileSync('inline_script.js', match[0].replace(/<\/?script>/g, ''));
    console.log("Extracted");
} else {
    console.log("Not found");
}
