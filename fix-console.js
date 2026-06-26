import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');
const searchStr = `                  appOrders[idx].history.push({
                      time: new Date().toLocaleString(),
                      actor: actor,
                      message: \`\${statusMap[newStatus] || newStatus} (\${prevStatus} -> \${newStatus})\`
                  });`;
const replaceStr = searchStr + `\n\n                  // Simulating a user notification
                  console.log(\`[Notification] Order \${orderId} status updated to \${newStatus}\`);`;

if(html.includes(searchStr)) {
    html = html.replace(searchStr, replaceStr);
    fs.writeFileSync('index.html', html);
    console.log("Console log added.");
} else {
    console.log("Search string not found!");
}
