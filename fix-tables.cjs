const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The naive way is just to add overflow-x-auto to the div containing a table, or wrap tables in it.
// We can just find `<div` right before `<table` that is intended as a wrapper, and make sure it has overflow-x-auto.
// Or simpler, just wrap every <table ...> in a <div class="overflow-x-auto"> and close it after </table> if not already wrapped.
// But there are template literals and dynamically generated strings in JS.
// Actually, modifying line 6574:
html = html.replace(
    'class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[300px]"',
    'class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[300px] overflow-x-auto"'
);

fs.writeFileSync('index.html', html);
