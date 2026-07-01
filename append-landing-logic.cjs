const fs = require('fs');

let js = fs.readFileSync('script.js', 'utf-8');

const landingLogic = `
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

// Fetch categories/products for landing page
async function loadLandingProducts() {
    const container = document.getElementById('landingProductsContainer');
    if (!container) return;
    
    try {
        // Just fetch categories for the landing page as shown in the screenshot
        const snapshot = await db.collection('categories').orderBy('timestamp', 'desc').limit(24).get();
        
        if (snapshot.empty) {
            container.innerHTML = '<div class="col-span-full py-10 text-slate-400">কোন প্রোডাক্ট পাওয়া যায়নি।</div>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const imageUrl = data.imageUrl || 'https://via.placeholder.com/150';
            const name = data.name || 'Unknown';
            
            html += \`
              <div class="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow cursor-pointer" onclick="showAuth(false)">
                <img src="\${imageUrl}" alt="\${name}" class="w-full h-32 object-contain mb-3" onerror="this.src='https://via.placeholder.com/150'" />
                <h4 class="text-slate-700 font-medium text-sm text-center">\${name}</h4>
              </div>
            \`;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error("Error loading landing products:", error);
        container.innerHTML = '<div class="col-span-full py-10 text-rose-400">প্রোডাক্ট লোড করতে সমস্যা হয়েছে।</div>';
    }
}

// Ensure loadLandingProducts is called on load
const originalWindowLoad = window.onload;
window.onload = function(e) {
    if (originalWindowLoad) originalWindowLoad(e);
    // Add logic here if needed
};

// Wait for firebase to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Try to load immediately if db is ready, otherwise let the initializeFirebaseIfReady handle it
    if (typeof db !== 'undefined') {
        loadLandingProducts();
    } else {
        // Poll for db
        const interval = setInterval(() => {
            if (typeof db !== 'undefined') {
                clearInterval(interval);
                loadLandingProducts();
            }
        }, 500);
        // Timeout after 10s
        setTimeout(() => clearInterval(interval), 10000);
    }
});
`;

if (!js.includes('window.showAuth = function(isLogin)')) {
    fs.appendFileSync('script.js', landingLogic);
    console.log('Successfully appended landing logic to script.js');
} else {
    console.log('Landing logic already exists');
}
