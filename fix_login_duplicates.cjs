const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace loginSession's find logic to match ONLY the phone, and then check password.
// But wait, what if they legitimately have two accounts with the same phone?
// We should check all matching accounts.
