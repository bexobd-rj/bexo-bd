import re

with open('index.html', 'r') as f:
    html = f.read()

# Locate the block inside simulateImageSearch where filtered is handled:
old_code = """                          if (filtered.length === 0) {
                              placeholder.innerHTML = `
                                  <div class="text-center space-y-4">
                                      <i class="fas fa-search-minus text-2xl sm:text-4xl text-slate-100"></i>
                                      <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">ছবিটির সাথে মিল আছে এমন কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
                                  </div>
                              `;
                          } else {
                              results.innerHTML = filtered.map(p => renderPostCard(p, 0, false)).join('');
                              
                              // Add result count feedback
                              const countBadge = document.createElement('div');
                              countBadge.className = "col-span-full py-2 px-4 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-wider inline-block mb-4";
                              countBadge.innerText = `${filtered.length}টি প্রোডাক্ট পাওয়া গেছে (AI ম্যাচিং)`;
                              results.prepend(countBadge);
                          }"""

new_code = """                          if (filtered.length === 0) {
                              placeholder.innerHTML = `
                                  <div class="text-center space-y-4">
                                      <i class="fas fa-search-minus text-2xl sm:text-4xl text-slate-100"></i>
                                      <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">ছবিটির সাথে মিল আছে এমন কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
                                  </div>
                              `;
                          } else if (filtered.length === 1) {
                              // If exactly one match, open directly
                              if (typeof renderPostDetail === 'function') {
                                  renderPostDetail(filtered[0].id, 0);
                              }
                          } else {
                              results.innerHTML = filtered.map(p => renderPostCard(p, 0, false)).join('');
                              
                              // Add result count feedback
                              const countBadge = document.createElement('div');
                              countBadge.className = "col-span-full py-2 px-4 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-wider inline-block mb-4";
                              countBadge.innerText = `${filtered.length}টি প্রোডাক্ট পাওয়া গেছে (AI ম্যাচিং)`;
                              results.prepend(countBadge);
                          }"""

if old_code in html:
    html = html.replace(old_code, new_code)
    print("Patched successfully")
else:
    print("Could not find the exact code block.")

with open('index.html', 'w') as f:
    f.write(html)
