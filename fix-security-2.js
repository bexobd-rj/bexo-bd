import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/if \(!userProfile \|\| !userProfile\.isAdmin\) \{ showToast\("Unauthorized request!", "error"\); return; \}/g, 'if (localStorage.getItem("bexo_is_admin") !== "true") { showToast("Unauthorized request!", "error"); return; }');

html = html.replace(/if \(!userProfile \|\| !userProfile\.isAdmin\) \{ showToast\("Unauthorized access!", "error"\); return; \}/g, 'if (localStorage.getItem("bexo_is_admin") !== "true") { showToast("Unauthorized access!", "error"); return; }');

fs.writeFileSync('index.html', html);
console.log("Fixed security checks!");
