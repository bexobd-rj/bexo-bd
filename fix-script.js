import fs from 'fs';
const content = fs.readFileSync('script.js', 'utf8');

const brokenStr = `                               function renderPosts() {
                  const feed = document.getElementById('postFeed');
                  if(!feed) return;

                  const filtered = appPosts.filter(p => {
                      const matchMain = filterMain === 'সব' || p.category === filterMain;
                      const matchSub = filterSub === 'all' || p.subCategory === filterSub;
                      const isPublished = p.isPublished !== false; // Active products by default, unless explicitly unpublished
                      const isStockOut = p.isStockOut === true || (p.stockCount !== undefined && p.stockCount <= 0);
                      return matchMain && matchSub && isPublished && !isStockOut;
                  }).sort((a, b) => Number(b.id) - Number(a.id));

                  if (filtered.length === 0) {
                      feed.innerHTML = \`
                          <div class="text-center py-20 animate-fade-in w-full">
                              <div class="w-20 h-20 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
                                  <i class="fas fa-box-open"></i>
                              </div>
                              <p class="text-slate-400 font-bold">এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি!</p>
                          </div>
                      \`;
                      return;
                  }
                  feed.innerHTML = filtered.map(p => renderPostCard(p, 0)).join('');
              }th || 'N/A'}\`;`;

const correctCode = `                                      \${desktopHtml}
                                  </tbody>
                              </table>
                          </div>
                          <!-- Mobile Responsive View -->
                          <div class="block md:hidden space-y-4 p-4 bg-slate-50/50">
                              \${mobileHtml}
                          </div>
                      \`;

                  } else if (window.activeFinanceTab === 'bills') {
                      const filtered = billRequests.filter(b => matchesSearch([b.profileId, b.billName, b.accountId, b.companyName, b.month, b.amount, b.status]));
                      
                      let desktopHtml = '';
                      let mobileHtml = '';
                      
                      if (filtered.length === 0) {
                          desktopHtml = \`<tr><td colspan="6" class="p-20 text-center text-slate-300 font-bold">কোন বিল রিকোয়েস্ট পাওয়া যায়নি</td></tr>\`;
                          mobileHtml = \`<div class="p-12 text-center text-slate-300 font-bold font-sans">কোন বিল রিকোয়েস্ট পাওয়া যায়নি</div>\`;
                      } else {
                          desktopHtml = filtered.map(req => {
                              const extraInfo = \`প্রতিষ্ঠানের নাম: \${req.companyName || 'N/A'} | মাস/বিলদাগ: \${req.month || 'N/A'}\`;`;

if (content.includes(brokenStr)) {
    const fixedContent = content.replace(brokenStr, correctCode);
    fs.writeFileSync('script.js', fixedContent);
    console.log("Fixed script.js");
} else {
    console.log("String not found");
}
