const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /<script.*?>([\s\S]*?)<\/script>/gi;
let match;
let i = 0;
while ((match = regex.exec(html)) !== null) {
    if (match[1].trim()) {
        const code = match[1];
        try {
            new Function(code);
            console.log(`Script ${i} is OK`);
        } catch (e) {
            console.log(`Script ${i} has ERROR: ${e.message}`);
            fs.writeFileSync(`script_error_${i}.js`, code);
        }
    }
    i++;
}
