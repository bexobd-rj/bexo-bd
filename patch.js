import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
const startIdx = lines.findIndex((l, i) => i > 5700 && l.includes("}f6b21] shadow-sm"));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes("return; // Disable other code under it"));
if (startIdx !== -1 && endIdx !== -1) {
    lines.splice(startIdx, (endIdx + 2) - startIdx);
    fs.writeFileSync('index.html', lines.join('\n'));
    console.log("Patched successfully!");
} else {
    console.log("Could not find indices:", startIdx, endIdx);
}
