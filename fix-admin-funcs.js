import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const funcsToProtect = [
  'function adminDeleteOrder(orderId)',
  'function adminUpdateOrderStatus(orderId, newStatus)',
  'function adminUpdateTrackingLink(orderId, link)',
  'function adminUpdateAdminNote(orderId, note)',
  'function adminUpdatePaymentCode(orderId, code)',
  'function adminAddHistoryNote(orderId, note)'
];

funcsToProtect.forEach(funcSig => {
  const target = '              ' + funcSig + ' {';
  const replace = '              ' + funcSig + ' {\n                  if (!userProfile || !userProfile.isAdmin) { showToast("Unauthorized access!", "error"); return; }';
  html = html.replace(target, replace);
});

fs.writeFileSync('index.html', html);
console.log("Added admin checks to multiple admin functions!");
