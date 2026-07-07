const fs = require('fs');
let content = fs.readFileSync('src/components/InvoiceViewer.tsx', 'utf-8');

content = content.replace(
  /<p className="text-\[10px\] font-bold text-blue-600 block">\s*Code: <span className="font-mono">\{item\.productId \? String\(item\.productId\)\.slice\(-8\)\.toUpperCase\(\) : '554004'\}<\/span>\s*<\/p>/g,
  `{isAdmin && (\n                            <p className="text-[10px] font-bold text-blue-600 block">\n                              Code: <span className="font-mono">{item.productId ? String(item.productId).slice(-8).toUpperCase() : '554004'}</span>\n                            </p>\n                          )}`
);

fs.writeFileSync('src/components/InvoiceViewer.tsx', content);
console.log('Fixed Code visibility');
