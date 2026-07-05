const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const functionCode = `
function renderHomeCategoryGrids() {
    const container = document.getElementById('homeCategoryGrids');
    if (!container) return;

    const isLoggedInUser = userProfile && userProfile.phone && userProfile.password;
    let htmlStr = '';

    if (!isLoggedInUser) {
        htmlStr += \`
        <div class="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between border border-slate-700">
            <div>
                <h3 class="text-white text-lg font-black tracking-tight flex items-center gap-2"><i class="fas fa-lock text-rose-500"></i> Wholesale Access Required</h3>
                <p class="text-slate-300 text-xs font-medium mt-1">To view pricing details and unlock full access, please login or register an account.</p>
            </div>
            <button onclick="showAuth(true)" class="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2">
                লগইন করুন <i class="fas fa-arrow-right"></i>
            </button>
        </div>
        \`;
    }

    if (typeof appCategories !== 'undefined' && appCategories.length > 0) {
        const sortedCats = [...appCategories].sort((a,b) => (a.order || 0) - (b.order || 0));
        
        sortedCats.forEach(cat => {
            const catPosts = appPosts.filter(p => p.category === cat.name);
            if (catPosts.length > 0) {
                const displayPosts = catPosts.slice(0, 12); // Show up to 12 products per category on home
                
                htmlStr += \`
                <div class="mb-12">
                    <div class="flex items-center justify-between mb-5">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-lg shadow-sm">
                                <i class="\${cat.icon || 'fas fa-box'}"></i>
                            </div>
                            <h2 class="text-xl font-black text-slate-800 tracking-tight">\${cat.name}</h2>
                        </div>
                        <button onclick="renderProductList('\${cat.name}', null)" class="text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-1.5 rounded-lg transition-colors">
                            সবগুলো দেখুন <i class="fas fa-chevron-right text-[10px] ml-1"></i>
                        </button>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        \${displayPosts.map(p => renderPostCard(p, 0)).join('')}
                    </div>
                </div>
                \`;
            }
        });
    }

    container.innerHTML = htmlStr;
}
`;

const insertPos = html.indexOf('function moveSlider(dir)');
if (insertPos !== -1) {
    html = html.substring(0, insertPos) + functionCode + '\n' + html.substring(insertPos);
    fs.writeFileSync('index.html', html);
    console.log("Inserted renderHomeCategoryGrids");
} else {
    console.log("Could not find insertion point");
}
