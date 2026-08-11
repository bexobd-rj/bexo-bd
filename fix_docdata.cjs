const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// replace `.data()` with just nothing because doc IS the data.
// WAIT. If I used `window.fakeTransaction.get`, my fakeTransaction returned `{ exists: true, data: () => data }`.
// In that case, `doc.data()` WORKS perfectly!

// Let's check `subscribeSupabaseCollection`. I passed `data` directly to callback!
// So `snap.forEach(doc => { let data = doc.data(); ... })` WILL FAIL because `doc` doesn't have `data()`!
html = html.replace(/let data = doc\.data\(\);/g, "let data = doc;");
html = html.replace(/const data = doc\.data\(\) \|\| \{ messages: \[\] \};/g, "const data = doc || { messages: [] };");
html = html.replace(/const orderData = orderDoc\.data\(\) \|\| \{\};/g, "const orderData = typeof orderDoc.data === 'function' ? orderDoc.data() : (orderDoc || {});");
html = html.replace(/withdrawDoc\.data\(\)/g, "(typeof withdrawDoc.data === 'function' ? withdrawDoc.data() : withdrawDoc)");

fs.writeFileSync('index.html', html);
