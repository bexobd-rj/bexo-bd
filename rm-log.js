import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const targetLog = `                  // Simulating a user notification
                  console.log(\`[Notification] Order \${orderId} status updated to \${newStatus}\`);`;

html = html.replace(targetLog, '');
fs.writeFileSync('index.html', html);
console.log("Removed duplicate console log");
