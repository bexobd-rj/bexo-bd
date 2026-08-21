              function renderBalanceStatement() {
                  const main = document.getElementById('mainContent');
                  
                  // Filter transactions for the current user only
                  const myTransactions = window.sortByNewestFirst(appTransactions.filter(t => t.profileId === userProfile.profileId));

                  const rows = myTransactions.map(t => `
                      <tr class="border-b border-slate-50 text-[10px] sm:text-xs transition-colors hover:bg-slate-50/50 cursor-default">
                          <td class="p-4 text-slate-500 font-medium whitespace-nowrap">${t.date}</td>
                          <td class="p-4 text-slate-600 font-semibold">${t.details}</td>
                          <td class="p-4 ${t.amount >= 0 ? 'text-emerald-600' : 'text-pink-500'} font-black text-right whitespace-nowrap">${t.amount >= 0 ? '+' : ''}dots{${t.amount}}</td>
                          <td class="p-4 text-slate-800 font-black text-right whitespace-nowrap">dots{${t.balance}}</td>
                      </tr>
                  `).join('');

                  const mobileTxCards = myTransactions.map(t => {
                      const isCredit = t.amount >= 0;
                      return `
                          <div class="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 font-sans">
                              <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                                  <span>${t.date}</span>
                                  <span class="text-[9px] font-black uppercase text-slate-600 font-sans">ব্যালেন্স: ৳${t.balance}</span>
                              </div>
                              <div class="flex justify-between items-center pt-1">
                                  <span class="text-xs font-semibold text-slate-700">${t.details}</span>
                                  <span class="text-xs font-black ${isCredit ? 'text-emerald-600' : 'text-rose-500'}">${isCredit ? '+' : ''}${t.amount} টাকা</span>
                              </div>
                          </div>
                      `;
                  }).join('');

                  const mobileTxEmpty = `
                      <div class="p-5 sm:p-12 text-center text-slate-400 font-bold uppercase tracking-wider text-[11px] leading-relaxed">
                          কোনো ট্রানজেকশন তথ্য নেই
                      </div>
                  `;

                  main.innerHTML = `
                      <div class="p-2.5 sm:p-4 lg:p-6 animate-fade-in bg-[#f0f4f9] min-h-screen">
                          <div class="max-w-7xl mx-auto space-y-4">
                              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden font-sans">
                                  <div class="p-4 sm:p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                                      <div>
                                          <h2 class="text-sm sm:text-base font-black text-slate-800 uppercase tracking-tight">ব্যালেন্স স্টেটমেন্ট (Account Ledger)</h2>
                                          <p class="text-[10px] text-slate-400 font-bold uppercase mt-1">আপনার আয়ের সম্পূর্ণ বিবরণ ও ট্রানজেকশন হিস্ট্রি</p>
                                      </div>
                                      <div class="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 self-start sm:self-auto">
                                          Show
                                          <select class="px-2 py-1 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-100 bg-white cursor-pointer">
                                              <option>100</option>
                                              <option>50</option>
                                              <option>10</option>
                                          </select>
                                          entries
                                      </div>
                                      <div class="flex items-center gap-2 w-full sm:w-auto">
                                          <span class="text-[10px] sm:text-xs font-bold text-slate-400">Search:</span>
                                          <input type="text" oninput="filterTransactions(this.value)" placeholder="Search details..." class="px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-100 text-xs font-medium w-full sm:w-64">
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
                                  <div id="balanceCardList" class="block md:hidden p-4 space-y-3 bg-slate-50/45 border-t border-slate-100">
                                      ${mobileTxCards || mobileTxEmpty}
                                  </div>

                                  <!-- Mobile Help Hint -->
                                  <div class="hidden md:hidden lg:hidden p-3 bg-slate-50 text-center border-t border-slate-100">
                                      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><i class="fas fa-arrows-alt-h mr-1"></i> ডানে-বামে স্ক্রল করে সব তথ্য দেখুন</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  `;
              }

              function renderSalesDashboard() {
                  const main = document.getElementById('mainContent');

                  // Calc stats - ISOLATION FIX
