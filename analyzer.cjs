const fs = require('fs');
const code = fs.readFileSync('index.html', 'utf-8');

// Find all function declarations in the global scope or similar
const functionRegex = /(?:function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*{)|(?:window\.([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:function\s*\([^)]*\)\s*{|\([^)]*\)\s*=>\s*{))/g;

const functions = {};
let match;
while ((match = functionRegex.exec(code)) !== null) {
    const name = match[1] || match[2];
    if (name) {
        if (!functions[name]) functions[name] = [];
        functions[name].push(match.index);
    }
}

let duplicateFunctions = [];
for (const [name, indices] of Object.entries(functions)) {
    if (indices.length > 1) {
        duplicateFunctions.push({ name, count: indices.length, indices });
    }
}

console.log("Duplicate functions found:");
console.log(duplicateFunctions);

