const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

content = content.replace(/window\.db\.collection\('bexo_posts'\)\.doc\(String\(doc\.id\)\)\.update\(\{ images: data\.images \}\)\.catch\(\(\)=>\{\}\);/g, '// disabled auto fix to save quota');

fs.writeFileSync('main_script.js', content);
