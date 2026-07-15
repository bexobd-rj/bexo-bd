const variants = [];
const p = { availableSizes: [] };

if (!variants.find(v => v.name === 'সাইজ' || v.name.toLowerCase() === 'size')) {
    if (p.availableSizes && p.availableSizes.length > 0) {
        variants.push({ name: 'সাইজ', options: p.availableSizes });
    }
}

console.log(variants);
