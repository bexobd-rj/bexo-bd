import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const target1 = `                                      <p><span class="font-bold text-slate-400">নাম:</span> <span class="font-black text-slate-850">\${order ? ((order.shipping && order.shipping.name) || order.customerName) : (record.customer_name || 'N/A')}</span></p>
                                      <p><span class="font-bold text-slate-400">মোবাইল:</span> <span class="font-black text-slate-850">\${order ? (order.shipping ? order.shipping.mobile : order.customerPhone) : 'N/A'}</span></p>
                                      <p><span class="font-bold text-slate-400">ঠিকানা:</span> <span class="font-bold text-slate-800">\${order ? (order.shipping ? \`\${order.shipping.address || ''}, \${order.shipping.thana || ''}, \${order.shipping.district || ''}\` : order.customerAddress) : 'N/A'}</span></p>`;

const replace1 = `                                      <p><span class="font-bold text-slate-400">নাম:</span> <span class="font-black text-slate-850">\${order ? ((order.shipping && order.shipping.name) || order.customerName || 'N/A') : (record.customer_name || 'N/A')}</span></p>
                                      <p><span class="font-bold text-slate-400">মোবাইল:</span> <span class="font-black text-slate-850">\${order ? ((order.shipping && order.shipping.mobile) || order.customerPhone || 'N/A') : 'N/A'}</span></p>
                                      <p><span class="font-bold text-slate-400">ঠিকানা:</span> <span class="font-bold text-slate-800">\${order ? ((order.shipping && order.shipping.address) ? \`\${order.shipping.address}, \${order.shipping.thana || ''}, \${order.shipping.district || ''}\` : (order.customerAddress || 'N/A')) : 'N/A'}</span></p>`;

html = html.replace(target1, replace1);

const target2 = `                                      <p><span class="font-bold text-slate-400">শপ নেম:</span> <span class="font-black text-slate-800">\${order ? (order.resellerShopName || 'N/A') : 'N/A'}</span></p>`;

const replace2 = `                                      <p><span class="font-bold text-slate-400">শপ নেম:</span> <span class="font-black text-slate-800">\${order ? (order.resellerShopName || (window.appUsers && window.appUsers.find(u => String(u.profileId) === String(order.profileId))?.shopName) || 'N/A') : 'N/A'}</span></p>`;

html = html.replace(target2, replace2);

fs.writeFileSync('index.html', html);
console.log("Bulletproofed names in modal!");
