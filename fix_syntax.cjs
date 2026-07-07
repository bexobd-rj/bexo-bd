const fs = require('fs');
let content = fs.readFileSync('src/components/InvoiceViewer.tsx', 'utf-8');

// replace the entire html2canvas block safely
const optStart = content.indexOf('html2canvas: {');
const jsPdfStart = content.indexOf('jsPDF: {');

if (optStart !== -1 && jsPdfStart !== -1) {
  const before = content.slice(0, optStart);
  const after = content.slice(jsPdfStart);
  
  content = before + `html2canvas: {\n          scale: 3,\n          useCORS: true,\n          letterRendering: true,\n          windowWidth: element.scrollWidth,\n          width: element.scrollWidth\n        },\n        ` + after;
  fs.writeFileSync('src/components/InvoiceViewer.tsx', content);
  console.log('Fixed syntax');
} else {
  console.log('Could not find markers');
}
