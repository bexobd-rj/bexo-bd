const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

if (lines[13382].trim() === '}') {
    lines.splice(13382, 1);
    fs.writeFileSync('index.html', lines.join('\n'));
    console.log('Fixed syntax error');
} else {
    console.log('Line 13383 is not } - it is ', lines[13382]);
}
