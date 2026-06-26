import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const target1 = `                                  reseller_id: o.profileId || 'N/A',
                                  reseller_name: o.resellerName || (o.shipping && o.shipping.name) || 'অজানা রিসেলার',
                                  customer_name: (o.shipping && o.shipping.name) || o.customerName || 'সম্মানিত কাস্টমার',`;

const replace1 = `                                  reseller_id: o.profileId || 'N/A',
                                  reseller_name: o.resellerShopName || o.resellerName || (window.appUsers && window.appUsers.find(u => String(u.profileId) === String(o.profileId))?.fullName) || 'অজানা রিসেলার',
                                  customer_name: (o.shipping && o.shipping.name) || o.customerName || 'সম্মানিত কাস্টমার',`;
                                  
html = html.replace(target1, replace1);

const target2 = `                      reseller_id: order.profileId || 'N/A',
                      reseller_name: order.resellerName || (order.shipping && order.shipping.name) || 'অজানা রিসেলার',
                      customer_name: (order.shipping && order.shipping.name) || order.customerName || 'সম্মানিত কাস্টমার',`;

const replace2 = `                      reseller_id: order.profileId || 'N/A',
                      reseller_name: order.resellerShopName || order.resellerName || (window.appUsers && window.appUsers.find(u => String(u.profileId) === String(order.profileId))?.fullName) || 'অজানা রিসেলার',
                      customer_name: (order.shipping && order.shipping.name) || order.customerName || 'সম্মানিত কাস্টমার',`;

html = html.replace(target2, replace2);

const target3 = `                                      <p><span class="font-bold text-slate-400">নাম:</span> <span class="font-black text-slate-850">\${record.customer_name || 'N/A'}</span></p>
                                      <p><span class="font-bold text-slate-400">মোবাইল:</span> <span class="font-black text-slate-850">\${hasShipping ? (order.shipping.mobile || 'N/A') : 'N/A'}</span></p>
                                      <p><span class="font-bold text-slate-400">ঠিকানা:</span> <span class="font-bold text-slate-800">\${hasShipping ? \`\${order.shipping.address || ''}, \${order.shipping.thana || ''}, \${order.shipping.district || ''}\` : 'N/A'}</span></p>`;

const replace3 = `                                      <p><span class="font-bold text-slate-400">নাম:</span> <span class="font-black text-slate-850">\${order ? ((order.shipping && order.shipping.name) || order.customerName) : (record.customer_name || 'N/A')}</span></p>
                                      <p><span class="font-bold text-slate-400">মোবাইল:</span> <span class="font-black text-slate-850">\${order ? (order.shipping ? order.shipping.mobile : order.customerPhone) : 'N/A'}</span></p>
                                      <p><span class="font-bold text-slate-400">ঠিকানা:</span> <span class="font-bold text-slate-800">\${order ? (order.shipping ? \`\${order.shipping.address || ''}, \${order.shipping.thana || ''}, \${order.shipping.district || ''}\` : order.customerAddress) : 'N/A'}</span></p>`;
                                      
html = html.replace(target3, replace3);

const target4 = `                                      <p><span class="font-bold text-slate-400">রিসেলার নাম:</span> <span class="font-black text-slate-850">\${record.reseller_name}</span></p>
                                      <p><span class="font-bold text-slate-400">শপ নেম:</span> <span class="font-black text-slate-800">\${order ? (order.resellerShopName || 'N/A') : 'N/A'}</span></p>
                                      <p><span class="font-bold text-slate-400">রিসেলার আইডি:</span> <span class="font-black text-slate-850">\${record.reseller_id || 'N/A'}</span></p>`;

const replace4 = `                                      <p><span class="font-bold text-slate-400">রিসেলার নাম:</span> <span class="font-black text-slate-850">\${order ? (order.resellerShopName || order.resellerName || (window.appUsers && window.appUsers.find(u => String(u.profileId) === String(order.profileId))?.fullName) || record.reseller_name) : record.reseller_name}</span></p>
                                      <p><span class="font-bold text-slate-400">শপ নেম:</span> <span class="font-black text-slate-800">\${order ? (order.resellerShopName || 'N/A') : 'N/A'}</span></p>
                                      <p><span class="font-bold text-slate-400">রিসেলার আইডি:</span> <span class="font-black text-slate-850">\${order ? order.profileId : (record.reseller_id || 'N/A')}</span></p>`;

html = html.replace(target4, replace4);

fs.writeFileSync('index.html', html);
console.log("Fixed names rendering!");
