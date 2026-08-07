const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf-8');

const offsets = [17435, 597255, 18165, 610360, 19022, 701009, 19738, 368973, 20462, 1524597, 20993, 931640];

for (const off of offsets) {
    const snippet = code.substring(off - 50, off + 100);
    console.log(`\n--- Offset ${off} ---`);
    console.log(snippet);
}
