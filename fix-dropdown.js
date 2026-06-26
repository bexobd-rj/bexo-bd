import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const searchRegex = /<span class="px-3 py-1 bg-gradient-to-r \$\{[\s\S]*?\} rounded-xl text-\[9\.5px\] font-extrabold uppercase tracking-widest inline-flex items-center gap-1\.5 border shadow-sm">\$\{o\.status\}<\/span><select style="display:none" onchange="adminUpdateOrderStatus\('\$\{o\.id\}', this\.value\)" class="appearance-none pl-4 pr-10 py-2\.5 rounded-xl text-\[10px\] font-black uppercase tracking-tight border border-slate-200 cursor-pointer outline-none focus:ring-2 focus:ring-orange-100 transition-all \$\{[\s\S]*?\}">[\s\S]*?<\/select>\s*<!-- hidden chevron -->/;

const replaceStr = `<select onchange="adminUpdateOrderStatus('\${o.id}', this.value)" class="appearance-none pl-4 pr-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight border border-slate-200 cursor-pointer outline-none focus:ring-2 focus:ring-orange-100 transition-all \${
                                                                      o.status === 'Completed' || o.status === 'Delivered' || o.status === 'Delivery Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                      o.status === 'Canceled' || o.status === 'Returned' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                      o.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                                  }">
                                                                      <option value="Pending" \${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                                                      <option value="Order Placed" \${o.status === 'Order Placed' ? 'selected' : ''}>Order Placed</option>
                                                                      <option value="Order Booked" \${o.status === 'Order Booked' ? 'selected' : ''}>Order Booked</option>
                                                                      <option value="Product Packed & Shipped" \${o.status === 'Product Packed & Shipped' ? 'selected' : ''}>Product Packed & Shipped</option>
                                                                      <option value="Out for Delivery" \${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                                                                      <option value="Delivery Completed" \${o.status === 'Delivery Completed' ? 'selected' : ''}>Delivery Completed</option>
                                                                      <option value="Delivered" \${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                                                      <option value="Completed" \${o.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                                                      <option value="Returned" \${o.status === 'Returned' ? 'selected' : ''}>Returned</option>
                                                                      <option value="Canceled" \${o.status === 'Canceled' ? 'selected' : ''}>Canceled</option>
                                                                  </select>
                                                                  <i class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none \${
                                                                       o.status === 'Completed' || o.status === 'Delivered' || o.status === 'Delivery Completed' ? 'text-emerald-500' :
                                                                       o.status === 'Canceled' || o.status === 'Returned' ? 'text-rose-500' :
                                                                       o.status === 'Pending' ? 'text-amber-500' : 'text-blue-500'
                                                                  }"></i>`;

if(searchRegex.test(html)) {
  html = html.replace(searchRegex, replaceStr);
  fs.writeFileSync('index.html', html);
  console.log("Dropdown replaced.");
} else {
  console.log("Not found.");
}
