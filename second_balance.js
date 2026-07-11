              function renderBalanceStatement() {
                  const main = document.getElementById('mainContent');
                  
                  // Filter transactions for the current user only
                  const myTransactions = window.sortByNewestFirst(appTransactions.filter(t => t.profileId === userProfile.profileId));

                  const rows = myTransactions.map(t => `
                      <tr class="border-b border-slate-50 text-[10px] sm:text-xs transition-colors hover:bg-slate-50/50 cursor-default">
                          <td class="p-4 text-slate-500 font-medium whitespace-nowrap">${t.date}</td>
                          <td class="p-4 text-slate-600 font-semibold">${t.details}</td>
                          <td class="p-4 ${t.amount >= 0 ? 'text-emerald-600' : 'text-pink-500'} font-black text-right whitespace-nowrap">${t.amount >= 0 ? '+' : ''}${t.amount}</td>
                          <td class="p-4 text-slate-800 font-black text-right whitespace-nowrap">${t.balance}</td>
                      </tr>
                  `).join('');

                  const mobileTxCards = myTransactions.map(t => {
                      const isCredit = t.amount >= 0;
                      return `
                          <div class="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 font-sans">
                              <div class="flex justify-between items-center text-[10px] font-bold text-slate-450 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                                  <span>${t.date}</span>
                                  <span class="text-[9px] font-black uppercase text-slate-600">ব্যালেন্স: ৳${t.balance}</span>
                              </div>
                              <div class="flex justify-between items-start gap-4 pt-2 border-t border-slate-50">
                                  <div class="flex-1">
                                      <p class="text-[11.5px] font-bold text-slate-755 leading-relaxed">${t.details}</p>
                                  </div>
                                  <div class="text-right whitespace-nowrap">
                                      <span class="text-sm font-black ${isCredit ? 'text-emerald-600' : 'text-rose-500'} font-mono">
                                          ${isCredit ? '+' : ''}${t.amount}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      `;
                  }).join('');

                  const mobileTxEmpty = `
                      <div class="p-5 sm:p-10 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px] leading-relaxed">
                          কোনো স্টেটমেন্ট পাওয়া যায়নি
                      </div>
                  `;

                  main.innerHTML = `
                      <div class="p-4 lg:p-10 animate-fade-in bg-[#f0f4f9] min-h-screen">
                          <div class="max-w-7xl mx-auto space-y-6">

                              <!-- Header Title -->
                              <div class="flex items-center gap-3 mb-2">
                                  <i class="fas fa-wallet text-purple-700 text-xl"></i>
                                  <h2 class="text-xl font-bold text-purple-800 tracking-tight">ব্যালেন্স স্টেটমেন্ট (Balance Statement)</h2>
                              </div>

                              <!-- Card Container -->
                              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">

                                  <!-- Search & Controls -->
                                  <div class="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center bg-white border-b border-slate-50 gap-4">
                                      <div class="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400">
                                          Show
                                          <select class="px-2 py-1 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-100 bg-white">
                                              <option>100</option>
                                              <option>50</option>
                                              <option>10</option>
                                          </select>
                                          entries
                                      </div>
                                      <div class="flex items-center gap-2 w-full sm:w-auto">
                                          <span class="text-[10px] sm:text-xs font-bold text-slate-400">Search:</span>
                                          <input type="text" placeholder="Search..." class="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-100 text-[10px] sm:text-sm font-medium w-full sm:w-auto">
                                      </div>
                                  </div>

                                  <!-- Table Container (Desktop only) -->
                                  <div class="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                      <table class="w-full text-[11px] sm:text-xs text-left min-w-[700px] border-collapse">
                                          <thead class="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-y border-slate-100">
                                              <tr>
                                                  <th class="p-4 border-r border-slate-100 whitespace-nowrap">তারিখ <i class="fas fa-sort ml-1 opacity-20"></i></th>
                                                  <th class="p-4 border-r border-slate-100">ট্রানজেকশন_ডিটেইলস <i class="fas fa-sort ml-1 opacity-20"></i></th>
                                                  <th class="p-4 border-r border-slate-100 text-right whitespace-nowrap">টাকা <i class="fas fa-sort ml-1 opacity-20"></i></th>
                                                  <th class="p-4 text-right whitespace-nowrap">ব্যালেন্স <i class="fas fa-sort ml-1 opacity-20"></i></th>
                                              </tr>
                                          </thead>
                                          <tbody id="balanceTableBody">
                                              ${rows || '<tr><td colspan="4" class="p-5 sm:p-10 text-center text-slate-400 text-xs font-bold uppercase italic">কোনো স্টেটমেন্ট পাওয়া যায়নি</td></tr>'}
                                          </tbody>
                                      </table>
                                  </div>

                                  <!-- Mobile Card List View -->
                                  <div class="block md:hidden p-4 space-y-4 bg-slate-50/45 border-t border-slate-100">
                                      ${mobileTxCards || mobileTxEmpty}
                                  </div>

                                  <!-- Mobile Help Hint (Desktop ignored) -->
                                  <div class="hidden md:hidden lg:hidden p-3 bg-slate-50 text-center border-t border-slate-100">
                                      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><i class="fas fa-arrows-alt-h mr-1"></i> ডানে-বামে স্ক্রল করে সব তথ্য দেখুন</p>
                                  </div>

                                  <!-- Footer Pagination -->
                                  <div class="p-4 md:p-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                          Showing 1 to ${appTransactions.length} of ${appTransactions.length} entries
                                      </div>
                                      <div class="flex items-center gap-1">
                                          <button class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-orange-600 transition-all">Previous</button>
                                          <div class="flex gap-1">
                                              <button class="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-100">1</button>
                                          </div>
                                          <button class="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-orange-600 transition-all">Next</button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  `;
              }

              function renderAddAccount() {
                  const main = document.getElementById('mainContent');
                  // Isolation fix: Only current user accounts
                  const myAccounts = appAccounts.filter(acc => acc.profileId === userProfile.profileId);
                  
                  const accountRows = myAccounts.map((acc, idx) => `
                      <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
