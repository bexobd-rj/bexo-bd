import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const targetFunc = `              function updateOrderStatus(orderId, newStatus, actor = 'System') {
                  const idx = appOrders.findIndex(o => String(o.id) === String(orderId));
                  if(idx === -1) return;

                  const prevStatus = appOrders[idx].status;
                  appOrders[idx].status = newStatus;`;

const replaceFunc = `              function updateOrderStatus(orderId, newStatus, actor = 'System') {
                  const idx = appOrders.findIndex(o => String(o.id) === String(orderId));
                  if(idx === -1) return;

                  const prevStatus = appOrders[idx].status;
                  appOrders[idx].status = newStatus;
                  
                  // Simulate user notification via console
                  if (prevStatus !== newStatus) {
                      console.log(\`[Notification] Order #\${appOrders[idx].orderNo || orderId} status updated to "\${newStatus}" by \${actor}.\`);
                  }`;

html = html.replace(targetFunc, replaceFunc);
fs.writeFileSync('index.html', html);
console.log("Added console notification!");
