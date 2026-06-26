import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const injectCode = `
              window.toggleFavorite = function(postId, imgIdx) {
                  const key = \`\${postId}-\${imgIdx}\`;
                  userProfile.favorites = userProfile.favorites || [];
                  if (userProfile.favorites.includes(key)) {
                      userProfile.favorites = userProfile.favorites.filter(k => k !== key);
                      showToast('পছন্দের তালিকা থেকে বাদ দেওয়া হয়েছে');
                  } else {
                      userProfile.favorites.push(key);
                      showToast('পছন্দের তালিকায় যোগ করা হয়েছে', 'success');
                  }
                  saveProfile();
                  
                  // Re-render UI
                  if (typeof renderProductList === 'function') {
                      const curMenu = window.currentMenu || '';
                      if (curMenu === 'favorites') {
                         renderFavorites();
                      } else if (curMenu === 'marketplace' || curMenu.startsWith('subcat-') || curMenu === 'home') {
                          // Try to update icon without full rerender if possible, but full render is safer
                          const pContainer = document.getElementById('mainContent');
                          if (pContainer) {
                              const btns = pContainer.querySelectorAll(\`button[onclick^="toggleFavorite('\${postId}', \${imgIdx})"]\`);
                              btns.forEach(btn => {
                                  const isFav = userProfile.favorites.includes(key);
                                  btn.className = \`py-2 rounded-lg border transition-all flex items-center justify-center group/btn \${isFav ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100 font-medium'} hover:bg-rose-500 hover:text-white hover:border-rose-500\`;
                                  btn.innerHTML = \`<i class="\${isFav ? 'fas' : 'far'} fa-heart transition-transform group-hover/btn:scale-125"></i>\`;
                              });
                          }
                      }
                  }
              };
`;

html = html.replace('function switchMenu(menuKey, event = null) {', injectCode + '\n              function switchMenu(menuKey, event = null) {');
fs.writeFileSync('index.html', html);
console.log("toggleFavorite added correctly.");
