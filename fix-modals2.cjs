const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The main issue with modals overflowing on mobile is when they don't have max-h-[90vh] and internal overflow-y-auto.
// It's probably easier to just replace "overflow-hidden animate-fade-in" with "overflow-hidden animate-fade-in flex flex-col max-h-[90vh]" globally for modals.
html = html.replace(/overflow-hidden animate-fade-in"/g, 'overflow-hidden animate-fade-in flex flex-col max-h-[90vh]"');
html = html.replace(/overflow-hidden animate-fade-in\s*"/g, 'overflow-hidden animate-fade-in flex flex-col max-h-[90vh]"');
html = html.replace(/overflow-hidden animate-fade-in\n/g, 'overflow-hidden animate-fade-in flex flex-col max-h-[90vh]\n');

fs.writeFileSync('index.html', html);
