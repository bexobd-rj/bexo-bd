import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const targetCount1 = `const processingCount = allOrders.filter(o => o.status === 'Processing').length;`;
const targetCount2 = `const shippedCount = allOrders.filter(o => o.status === 'Shipped').length;`;

html = html.replace(targetCount1, `const processingCount = allOrders.filter(o => o.status === 'Order Placed' || o.status === 'Order Booked' || o.status === 'Processing').length;`);
html = html.replace(targetCount2, `const shippedCount = allOrders.filter(o => o.status === 'Product Packed & Shipped' || o.status === 'Out for Delivery' || o.status === 'Shipped').length;`);

const targetFilter = `                  if (currentAdminOrderStatusTab !== 'All') {
                      if (currentAdminOrderStatusTab === 'Completed' || currentAdminOrderStatusTab === 'Delivery Completed') {
                          filteredOrders = filteredOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered' || o.status === 'Delivery Completed');
                      } else {
                          filteredOrders = filteredOrders.filter(o => o.status === currentAdminOrderStatusTab);
                      }
                  }`;

const replaceFilter = `                  if (currentAdminOrderStatusTab !== 'All') {
                      if (currentAdminOrderStatusTab === 'Completed' || currentAdminOrderStatusTab === 'Delivery Completed') {
                          filteredOrders = filteredOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered' || o.status === 'Delivery Completed');
                      } else if (currentAdminOrderStatusTab === 'Processing') {
                          filteredOrders = filteredOrders.filter(o => o.status === 'Order Placed' || o.status === 'Order Booked' || o.status === 'Processing');
                      } else if (currentAdminOrderStatusTab === 'Shipped') {
                          filteredOrders = filteredOrders.filter(o => o.status === 'Product Packed & Shipped' || o.status === 'Out for Delivery' || o.status === 'Shipped');
                      } else {
                          filteredOrders = filteredOrders.filter(o => o.status === currentAdminOrderStatusTab);
                      }
                  }`;

html = html.replace(targetFilter, replaceFilter);

fs.writeFileSync('index.html', html);
console.log("Fixed admin order tabs!");
