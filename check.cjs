const fs = require('fs');
const acorn = require('acorn');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/g);
if (scriptMatch) {
    scriptMatch.forEach((s, i) => {
        let code = s.replace(/<\/?script>/g, '');
        try {
            acorn.parse(code, {ecmaVersion: 2022});
            console.log(`Script ${i} OK`);
        } catch (e) {
            console.log(`Script ${i} Error:`, e.message);
            const lines = code.split('\n');
            const errLine = e.loc.line - 1;
            console.log(lines.slice(Math.max(0, errLine - 2), errLine + 3).join('\n'));
        }
    });
}
