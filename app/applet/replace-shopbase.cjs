const fs = require('fs');

function replaceNames(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Order matters, do longest/specific first
    content = content.replace(/শপবেইজ বিডি'র/g, "Bexo BD এর");
    content = content.replace(/শপবেইজ বিডির/g, "Bexo BD এর");
    content = content.replace(/শপবেইজ বিডিতে/g, "Bexo BD তে");
    content = content.replace(/শপবেইজ বিডি/g, "Bexo BD");
    content = content.replace(/শপবেইজের/g, "Bexo BD এর");
    content = content.replace(/শপবেইজ/g, "Bexo BD");
    
    fs.writeFileSync(file, content);
}

replaceNames('index.html');
replaceNames('script.js');
console.log('Replaced ShopBase with Bexo BD');
