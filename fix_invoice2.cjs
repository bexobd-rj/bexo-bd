const fs = require('fs');
let content = fs.readFileSync('src/components/InvoiceViewer.tsx', 'utf-8');

const oldBg = `<div className="absolute inset-0 select-none pointer-events-none z-0">
            {/* Right part: solid blue */}
            <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-[#0E46A3]" />
            {/* Wave connector: transitions smoothly into the solid blue block */}
            <div className="absolute top-0 right-1/2 bottom-0 w-48 font-sans">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 100 0 L 20 0 C 45 40, 15 75, 40 100 L 100 100 Z" fill="#0E46A3" />
              </svg>
            </div>
          </div>`;

const newBg = `<div className="absolute inset-0 select-none pointer-events-none z-0" style={{ background: 'linear-gradient(105deg, transparent 45%, #0E46A3 45.1%)' }}></div>`;

if (content.includes(oldBg)) {
  content = content.replace(oldBg, newBg);
  fs.writeFileSync('src/components/InvoiceViewer.tsx', content);
  console.log('Replaced SVG background with linear-gradient');
} else {
  console.log('Background block not found. Trying regex...');
  const bgRegex = /<div className="absolute inset-0 select-none pointer-events-none z-0">[\s\S]*?<\/svg>\s*<\/div>\s*<\/div>/;
  if (bgRegex.test(content)) {
    content = content.replace(bgRegex, newBg);
    fs.writeFileSync('src/components/InvoiceViewer.tsx', content);
    console.log('Replaced using Regex');
  } else {
    console.log('Failed to match background block.');
  }
}
