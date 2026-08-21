const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(/appCategories = appCategories\.filter\(c => c\.id != catId\);\s*\}/, 
"appCategories = appCategories.filter(c => c.id != catId);\n        if (window.db) {\n            window.db.collection('bexo_categories').doc(String(catId)).delete().catch(err => console.error('Error deleting category:', err));\n        }\n    }");

fs.writeFileSync('index.html', content);
