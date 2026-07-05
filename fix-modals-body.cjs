const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Instead of guessing body classes, I can just find common padding patterns after headers.
html = html.replace(/class="([^"]*p-4 sm:p-8 space-y-6[^"]*)"/g, (match, classes) => {
    if (!classes.includes('overflow-y-auto')) {
        return `class="${classes} flex-1 overflow-y-auto no-scrollbar"`;
    }
    return match;
});

html = html.replace(/class="([^"]*p-4 sm:p-8 space-y-4[^"]*)"/g, (match, classes) => {
    if (!classes.includes('overflow-y-auto')) {
        return `class="${classes} flex-1 overflow-y-auto no-scrollbar"`;
    }
    return match;
});

html = html.replace(/class="([^"]*p-5 sm:p-10 space-y-6[^"]*)"/g, (match, classes) => {
    if (!classes.includes('overflow-y-auto')) {
        return `class="${classes} flex-1 overflow-y-auto no-scrollbar"`;
    }
    return match;
});

fs.writeFileSync('index.html', html);
