const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target1 = `                      let htmlContent = '';
                      if (currentStep === 1) {`;
const replace1 = `                      let htmlContent = '';
                      if (currentStep === 1) {
                          htmlContent = \`
                              <div class="bg-white p-6 rounded-2xl w-full max-w-sm relative">
                                  <button onclick="document.getElementById('forgot-password-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                      <i data-lucide="x" class="w-5 h-5"></i>
                                  </button>
                                  <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                      <i data-lucide="key" class="w-6 h-6 text-orange-600"></i>
                                  </div>
                                  <h3 class="text-xl font-bold mb-2 text-slate-800 text-center">পাসওয়ার্ড ভুলে গেছেন?</h3>
                                  <p class="text-sm text-slate-500 mb-6 text-center">আপনার অ্যাকাউন্ট ইমেইল এড্রেসটি নিচে লিখুন।</p>
                                  <input type="email" id="fpIdentifier" class="w-full bg-slate-50 border border-slate-200 text-sm p-3 rounded-xl focus:outline-none focus:border-orange-500 mb-4" placeholder="Email Address">
                                  <button id="fpBtnNext" class="w-full bg-orange-600 text-white font-medium py-3 rounded-xl hover:bg-orange-700 transition-colors">ইমেইল পাঠান</button>
                              </div>
                          \`;
                          modal.innerHTML = htmlContent;
                          if(window.lucide) window.lucide.createIcons();
`;

const target2 = `                      } else if (currentStep === 2) {`;
const replace2 = `                      } else if (currentStep === 2) {
                          htmlContent = \`
                              <div class="bg-white p-6 rounded-2xl w-full max-w-sm relative">
                                  <button onclick="document.getElementById('forgot-password-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                      <i data-lucide="x" class="w-5 h-5"></i>
                                  </button>
                                  <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                      <i data-lucide="mail-check" class="w-6 h-6 text-orange-600"></i>
                                  </div>
                                  <h3 class="text-xl font-bold mb-2 text-slate-800 text-center">ভেরিফিকেশন</h3>
                                  <p class="text-sm text-slate-500 mb-6 text-center">আপনার ইমেইলে পাঠানো ৬-ডিজিটের কোডটি দিন।</p>
                                  <input type="text" id="fpCode" class="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-orange-500 mb-4 text-center tracking-widest text-lg font-bold" placeholder="------" maxlength="6">
                                  <button id="fpBtnVerify" class="w-full bg-orange-600 text-white font-medium py-3 rounded-xl hover:bg-orange-700 transition-colors">ভেরিফাই করুন</button>
                              </div>
                          \`;
                          modal.innerHTML = htmlContent;
                          if(window.lucide) window.lucide.createIcons();
`;

const target3 = `                      } else if (currentStep === 3) {`;
const replace3 = `                      } else if (currentStep === 3) {
                          htmlContent = \`
                              <div class="bg-white p-6 rounded-2xl w-full max-w-sm relative">
                                  <button onclick="document.getElementById('forgot-password-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                      <i data-lucide="x" class="w-5 h-5"></i>
                                  </button>
                                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                      <i data-lucide="shield-check" class="w-6 h-6 text-green-600"></i>
                                  </div>
                                  <h3 class="text-xl font-bold mb-6 text-slate-800 text-center">নতুন পাসওয়ার্ড</h3>
                                  <input type="password" id="fpNewPass" class="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-orange-500 mb-3" placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)">
                                  <input type="password" id="fpConfirmPass" class="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-orange-500 mb-6" placeholder="পাসওয়ার্ড নিশ্চিত করুন">
                                  <button id="fpBtnSave" class="w-full bg-orange-600 text-white font-medium py-3 rounded-xl hover:bg-orange-700 transition-colors">পাসওয়ার্ড পরিবর্তন করুন</button>
                              </div>
                          \`;
                          modal.innerHTML = htmlContent;
                          if(window.lucide) window.lucide.createIcons();
`;

code = code.replace(target1, replace1);
code = code.replace(target2, replace2);
code = code.replace(target3, replace3);

fs.writeFileSync('index.html', code);
