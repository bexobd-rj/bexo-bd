const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/<label>ইমেইল অথবা মোবাইল নম্বর<\/label>/g, '<label>ইমেইল ঠিকানা</label>');
code = code.replace(/type="text" id="loginIdentifier"/g, 'type="email" id="loginIdentifier"');

fs.writeFileSync('index.html', code);
console.log("Fixed login HTML");
