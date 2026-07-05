const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The messed up part looks like:
// };
//                   return str.trim();
//               }
// 
//               function createPostFromAdmin

html = html.replace(/\};\s*return str\.trim\(\);\s*\}\s*function createPostFromAdmin/, "};\n\n              function createPostFromAdmin");

fs.writeFileSync('index.html', html);
