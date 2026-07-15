const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Also fix the button type just in case
html = html.replace(
    /onclick="deleteObjectFromCategory\('\$\{catId\}', '\$\{subId \|\| ''\}'\)" class="flex-1 py-3 bg-rose-50 text-rose-500 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all">ডিলিট করুন<\/button>/g,
    `type="button" onclick="deleteObjectFromCategory('\${catId}', '\${subId || ''}')" class="flex-1 py-3 bg-rose-50 text-rose-500 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all">ডিলিট করুন</button>`
);

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
