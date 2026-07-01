const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const newFetchLogic = `
// --- LANDING PAGE LOGIC ---
window.showAuth = function(isLogin) {
    const landing = document.getElementById('landingSection');
    const auth = document.getElementById('authSection');
    
    if (landing) landing.classList.add('hidden');
    if (auth) {
        auth.classList.remove('hidden');
        auth.classList.add('flex');
    }
    
    // Call the existing toggleAuth function which switches between login and register forms
    if (typeof toggleAuth === 'function') {
        toggleAuth(isLogin);
    }
};

async function loadLandingProducts() {
    const container = document.getElementById('landingProductsContainer');
    if (!container) return;
    
    try {
        const snapshot = await window.db.collection('bexo_categories').get();
        
        if (snapshot.empty) {
            container.innerHTML = '<div class="col-span-full py-10 text-slate-400">কোন প্রোডাক্ট পাওয়া যায়নি।</div>';
            return;
        }
        
        let allItems = [];
        snapshot.forEach(doc => {
            const cat = doc.data();
            if (cat.subCategories && Array.isArray(cat.subCategories)) {
                cat.subCategories.forEach(sub => {
                    if (sub.image) {
                        allItems.push({
                            name: sub.name || cat.name,
                            image: sub.image,
                            order: sub.order || 999
                        });
                    }
                });
            } else if (cat.image) {
                allItems.push({
                    name: cat.name,
                    image: cat.image,
                    order: cat.order || 999
                });
            }
        });
        
        allItems.sort((a,b) => a.order - b.order);
        allItems = allItems.slice(0, 24);
        
        if (allItems.length === 0) {
            container.innerHTML = '<div class="col-span-full py-10 text-slate-400">কোন প্রোডাক্ট পাওয়া যায়নি।</div>';
            return;
        }
        
        let htmlStr = '';
        allItems.forEach(item => {
            const imageUrl = item.image || 'https://via.placeholder.com/150';
            const name = item.name || 'Unknown';
            
            htmlStr += \`
              <div class="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow cursor-pointer" onclick="showAuth(false)">
                <img src="\${imageUrl}" alt="\${name}" class="w-full h-32 object-contain mb-3" onerror="this.src='https://via.placeholder.com/150'" />
                <h4 class="text-slate-700 font-medium text-sm text-center">\${name}</h4>
              </div>
            \`;
        });
        
        container.innerHTML = htmlStr;
        
    } catch (error) {
        console.error("Error loading landing products:", error);
        container.innerHTML = '<div class="col-span-full py-10 text-rose-400 text-center text-sm"><i class="fas fa-exclamation-triangle mb-2 text-2xl"></i><br/>প্রোডাক্ট লোড করতে সমস্যা হয়েছে।</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.db !== null && typeof window.db !== 'undefined') {
        loadLandingProducts();
    } else {
        const interval = setInterval(() => {
            if (window.db !== null && typeof window.db !== 'undefined') {
                clearInterval(interval);
                loadLandingProducts();
            }
        }, 500);
        setTimeout(() => clearInterval(interval), 10000);
    }
});
`;

if (!html.includes('window.showAuth = function(isLogin)')) {
    // Replace the last </script> with the logic
    const lastScriptIndex = html.lastIndexOf('</script>');
    if (lastScriptIndex !== -1) {
        html = html.substring(0, lastScriptIndex) + newFetchLogic + '\\n' + html.substring(lastScriptIndex);
    }
    
    // Also patch the login / onload authSection hiding logic
    html = html.replace(
        "auth.classList.add('hidden');\\n                      dash.classList.remove('hidden');",
        "auth.classList.add('hidden');\\n                      dash.classList.remove('hidden');\\n                      const landing = document.getElementById('landingSection');\\n                      if(landing) landing.classList.add('hidden');"
    );

    html = html.replace(
        "const auth = document.getElementById('authSection');\\n                  const dash = document.getElementById('dashboardSection');\\n\\n                  auth.classList.add('hidden');",
        "const auth = document.getElementById('authSection');\\n                  const dash = document.getElementById('dashboardSection');\\n                  const landing = document.getElementById('landingSection');\\n                  if(landing) landing.classList.add('hidden');\\n\\n                  auth.classList.add('hidden');"
    );

    html = html.replace(
        "const auth = document.getElementById('authSection');\\n                      const dash = document.getElementById('dashboardSection');\\n\\n                      auth.classList.add('hidden');",
        "const auth = document.getElementById('authSection');\\n                      const dash = document.getElementById('dashboardSection');\\n                      const landing = document.getElementById('landingSection');\\n                      if(landing) landing.classList.add('hidden');\\n\\n                      auth.classList.add('hidden');"
    );

    html = html.replace(
        "auth.classList.remove('hidden');\\n                  dash.classList.add('hidden');",
        "auth.classList.remove('hidden');\\n                  dash.classList.add('hidden');\\n                  const landing = document.getElementById('landingSection');\\n                  if(landing) landing.classList.add('hidden');"
    );
    
    fs.writeFileSync('index.html', html);
    console.log('Appended logic to index.html successfully');
} else {
    console.log('Logic already exists in index.html');
}
