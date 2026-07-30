const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                  // Populate Variants
                  if (p) {
                      if (p.variants && p.variants.length > 0) {
                          p.variants.forEach(v => addAdminVariantGroup(v.name, v.isMandatory || false, v.options));
                      } else if (!p.variants && p.availableSizes && p.availableSizes.length > 0) {
                          addAdminVariantGroup('Size', true, p.availableSizes);
                      }
                  } else {
                      addAdminVariantGroup('Size', true, ['M', 'L', 'XL']);
                  }`;

const newStr = `                  // Populate Variants
                  if (p) {
                      if (p.variants && p.variants.length > 0) {
                          p.variants.forEach(v => addAdminVariantGroup(v.name, v.isMandatory || false, v.options));
                      } else if (!p.variants && p.availableSizes && p.availableSizes.length > 0) {
                          addAdminVariantGroup('Size', true, p.availableSizes);
                      }
                  }`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, newStr);
    fs.writeFileSync('index.html', html);
    console.log("Fixed default variants in admin form.");
} else {
    console.log("Could not find the target string!");
}
