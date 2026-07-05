const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace relative w-full max-w-... bg-white rounded-... overflow-hidden inside modals
// with max-h-[90vh] flex flex-col

html = html.replace(/class="([^"]*relative w-full max-w-[a-z0-9-]+ bg-white[^"]*overflow-hidden[^"]*)"/g, (match, classes) => {
    if (!classes.includes('flex-col')) {
        return `class="${classes} flex flex-col max-h-[90vh]"`;
    }
    return match;
});

// Since the header is not flex-1, the body div should be flex-1 and overflow-y-auto.
// It's hard to match this globally. 
// I'll leave this part alone unless it's a huge issue, or maybe I can find 'overflow-y-auto' in most places.
