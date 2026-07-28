const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The broken code looks like:
// copyToClipboard(`${p.title}${p.desc}${p.details || ''}`)
// but it might have newlines or other things. 

// Let's print out the exact line from index.html where copyToClipboard is used
const lines = html.split('\n');
lines.forEach((line, i) => {
    if (line.includes('copyToClipboard')) {
        console.log((i+1) + ': ' + line.trim());
    }
});
