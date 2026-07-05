const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The single image uploader is at line 12068
// The textarea is at 12159

// First let's check what functions handle this
