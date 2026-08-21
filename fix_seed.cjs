const fs = require('fs');
let content = fs.readFileSync('main_script.js', 'utf8');

// The pattern is:
// } else if (appSomething.length > 0) {
//     appSomething.forEach(x => {
//         window.db.collection('something').doc(String(x.id)).set(sanitizeForFirestore(x))
//             ...
//     });
// }

// Let's replace any block that starts with `} else if (app.*?\.length > 0) \{` and ends with `\s*\}\);?\s*\}`
const regex = /\}\s*else\s*if\s*\([a-zA-Z0-9_]+\.length\s*>\s*0\)\s*\{\s*[a-zA-Z0-9_]+\.forEach\([a-zA-Z0-9_]+\s*=>\s*\{\s*window\.db\.collection\('[a-zA-Z0-9_]+'\)\.doc\(String\([a-zA-Z0-9_]+\.(id|profileId)\)\)\.set\(sanitizeForFirestore\([a-zA-Z0-9_]+\)\)\s*\.catch\(err => console\.error\("Auto-seed.*?error:",\s*err\)\);\s*\}\);\s*\}/g;

content = content.replace(regex, '} else { /* Auto-seed disabled to save quota */ }');

fs.writeFileSync('main_script.js', content);
