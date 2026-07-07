const fs = require('fs');
let content = fs.readFileSync('src/components/InvoiceViewer.tsx', 'utf-8');

content = content.replace(
  /windowWidth: element\.scrollWidth,/g,
  `windowWidth: 1200,`
);

fs.writeFileSync('src/components/InvoiceViewer.tsx', content);
console.log('Fixed windowWidth');
