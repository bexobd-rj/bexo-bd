const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(
    /} catch \(e\) \{\s*console\.warn\("Supabase SDK init failed inside index\.html:", e\);/g,
    `} catch (e) {
                      console.warn("Supabase SDK init failed inside index.html:", e);
                      alert("Init failed: " + e.message + " | Stack: " + e.stack);`
);

fs.writeFileSync('public/app.js', code);
