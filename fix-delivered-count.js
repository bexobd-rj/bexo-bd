import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `if ((newStatus === 'Completed' || newStatus === 'Delivery Completed') && prevStatus !== 'Completed' && prevStatus !== 'Delivery Completed' && !order.isProfitDistributed) {`;
const replaceStr = `if ((newStatus === 'Completed' || newStatus === 'Delivered' || newStatus === 'Delivery Completed') && prevStatus !== 'Completed' && prevStatus !== 'Delivered' && prevStatus !== 'Delivery Completed' && !order.isProfitDistributed) {`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replaceStr);
    fs.writeFileSync('index.html', html);
    console.log('Fixed deliveredOrdersCount condition!');
} else {
    console.log('Target string not found');
}
