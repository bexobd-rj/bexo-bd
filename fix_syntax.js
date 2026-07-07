const fs = require('fs');
let content = fs.readFileSync('src/components/InvoiceViewer.tsx', 'utf-8');

// The messed up part looks like:
/*
          onclone: (clonedDoc) => {
             // No hacks needed, CSS is fixed
          });
             }
          }
*/
content = content.replace(
  /onclone: \(clonedDoc\) => {\s*\/\/[^\n]*\s*}\);\s*}\s*}/g,
  `onclone: (clonedDoc) => { }\n        }`
);

fs.writeFileSync('src/components/InvoiceViewer.tsx', content);
