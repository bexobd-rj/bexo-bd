const fs = require('fs');
const text = fs.readFileSync('index.html', 'utf8');
const lines = text.split('\n');
lines.forEach((line, i) => {
    if (/[\u0900-\u097F]/.test(line)) {
        console.log((i + 1) + ": " + line.trim().substring(0, 50));
    }
});
