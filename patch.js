const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
    /function deleteObjectFromCategory\(catId, subId\) \{/g,
    `function deleteObjectFromCategory(catId, subId) {
    try {`
);

html = html.replace(
    /showToast\("ডিলিট করা হয়েছে", "info"\);\s*\}/g,
    `showToast("ডিলিট করা হয়েছে", "info");
    } catch(err) {
        console.error("Delete Error:", err);
        showToast("Error: " + err.message, "error");
    }
}`
);

fs.writeFileSync('index.html', html);
