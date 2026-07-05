const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regexFiltered = /function renderFilteredProductList\(category, subCategory\) \{([\s\S]*?)main\.innerHTML = \`([\s\S]*?)\`;\s*renderProductGrid\(/;

let match = html.match(/function renderFilteredProductList\(category, subCategory\) \{([\s\S]*?)main\.innerHTML = \`([\s\S]*?)<div id="productGrid"/);
if (match) {
    const bannerHtml = `
                    \${!(userProfile && userProfile.phone && userProfile.password) ? \`
                    <div class="mb-6 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between border border-slate-700">
                        <div>
                            <h3 class="text-white text-lg font-black tracking-tight flex items-center gap-2"><i class="fas fa-lock text-rose-500"></i> Wholesale Access Required</h3>
                            <p class="text-slate-300 text-xs font-medium mt-1">To view pricing details and unlock full access, please login or register an account.</p>
                        </div>
                        <button onclick="showAuth(true)" class="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2">
                            লগইন করুন <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                    \` : ''}`;
    
    // insert bannerHtml right before <div id="productGrid"
    const newInner = match[2] + bannerHtml + '\n                          <div id="productGrid"';
    html = html.replace(match[0], `function renderFilteredProductList(category, subCategory) {${match[1]}main.innerHTML = \`${newInner}`);
    fs.writeFileSync('index.html', html);
    console.log("Updated renderFilteredProductList");
} else {
    console.log("Not matched");
}
