const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /function toggleFavorite\(productId, imgIdx\) \{[\s\S]*?saveProfile\(\);/m;

const replacement = `function toggleFavorite(productId, imgIdx) {
                  if (!userProfile) {
                      showToast('লগইন করুন', 'error');
                      if(document.getElementById('regSubmitBtn')) { document.getElementById('regSubmitBtn').disabled = false; document.getElementById('regSubmitBtn').innerHTML = '<i class="fas fa-user-plus"></i> অ্যাকাউন্ট তৈরি করুন'; }
                      return;
                  }
                  if (!userProfile.favorites) {
                      userProfile.favorites = [];
                  }
                  
                  const key = \`\${productId}-\${imgIdx}\`;
                  const idx = userProfile.favorites.indexOf(key);
                  
                  if (idx > -1) {
                      userProfile.favorites.splice(idx, 1);
                      showToast('ফেভারিট থেকে রিমুভ করা হয়েছে', 'success');
                  } else {
                      userProfile.favorites.push(key);
                      showToast('ফেভারিটে যোগ করা হয়েছে', 'success');
                  }
                  
                  saveProfile();`;

if (regex.test(html)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('index.html', html);
    console.log("Fixed toggleFavorite");
} else {
    console.log("Could not find toggleFavorite");
}

