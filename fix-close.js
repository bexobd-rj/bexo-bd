import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

const target = `               function closeOrderModal() {
                   const modal = document.getElementById('orderModal');
                   calculateOrderTotal();
                   modal.classList.remove('hidden');
                   modal.classList.add('flex');
               }`;

if(content.includes(target)) {
    content = content.replace(target, '');
    fs.writeFileSync('index.html', content);
    console.log("Replaced target 1");
} else {
    console.log("Target 1 not found");
}
