const fs = require('fs');

let js = fs.readFileSync('script.js', 'utf-8');

// Replace loadLandingProducts logic to use bexo_categories and find subCategories with images if needed
// Actually, let's just write a new function to replace the old one exactly.

const newFetchLogic = `
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
        allItems = allItems.slice(0, 24); // Show top 24
        
        if (allItems.length === 0) {
            container.innerHTML = '<div class="col-span-full py-10 text-slate-400">কোন প্রোডাক্ট পাওয়া যায়নি।</div>';
            return;
        }
        
        let html = '';
        allItems.forEach(item => {
            const imageUrl = item.image || 'https://via.placeholder.com/150';
            const name = item.name || 'Unknown';
            
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
        container.innerHTML = '<div class="col-span-full py-10 text-rose-400 text-center text-sm"><i class="fas fa-exclamation-triangle mb-2 text-2xl"></i><br/>প্রোডাক্ট লোড করতে সমস্যা হয়েছে।</div>';
    }
}
`;

js = js.replace(/async function loadLandingProducts\(\) \{[\s\S]*?\} catch \(error\) \{[\s\S]*?\}\n\}/, newFetchLogic.trim());

fs.writeFileSync('script.js', js);
console.log('Fixed landing products fetch');
