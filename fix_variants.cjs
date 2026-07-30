const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /\$\{\(\(\) => \{\s*const variants = p\.variants \|\| \[\];\s*\/\/ Fallback to legacy size or default size\s*if \(\!variants\.find\(v => v\.name === 'সাইজ' \|\| v\.name\.toLowerCase\(\) === 'size'\)\) \{\s*const sizeOptions = p\.availableSizes && p\.availableSizes\.length > 0 \? p\.availableSizes : \['M', 'L', 'XL'\];\s*variants\.push\(\{ name: 'সাইজ', options: sizeOptions \}\);\s*\}\s*\/\/ Automatically add "কালার" option if specified in info but not in variants/;

const replacement = `\${(() => {
                                                    const variants = p.variants ? JSON.parse(JSON.stringify(p.variants)) : [];
                                                    // Fallback to legacy size or default size ONLY IF availableSizes exists
                                                    if (!variants.find(v => v.name === 'সাইজ' || v.name.toLowerCase() === 'size')) {
                                                        if (p.availableSizes && p.availableSizes.length > 0) {
                                                            variants.push({ name: 'সাইজ', options: p.availableSizes });
                                                        }
                                                    }
                                                    // Automatically add "কালার" option if specified in info but not in variants`;

if (regex.test(html)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('index.html', html);
    console.log("Replaced successfully!");
} else {
    console.log("Could not find regex!");
}
