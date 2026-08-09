const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newSaveNewPass = `              function saveNewPassword(profileId, newPass) {
                  const targetUser = appUsers.find(u => u.profileId === profileId);
                  if (targetUser) {
                      const targetPhone = normalizePhone(targetUser.phone);
                      const targetEmail = targetUser.email ? targetUser.email.toLowerCase().trim() : '';
                      
                      let updatedIds = [];
                      appUsers.forEach(u => {
                          const p = normalizePhone(u.phone);
                          const e = u.email ? u.email.toLowerCase().trim() : '';
                          if ((p && p === targetPhone) || (e && targetEmail && e === targetEmail)) {
                              u.password = newPass;
                              updatedIds.push(u.profileId);
                          }
                      });
                      saveUsers(updatedIds);

                      if (userProfile && updatedIds.includes(userProfile.profileId)) {
                          userProfile.password = newPass;
                          saveProfile();
                      }
                      
                      // alert("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।"); // Removed to avoid double alerts
                  }
              }`;

html = html.replace(/function saveNewPassword\(profileId, newPass\) \{[\s\S]*?alert\("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।"\);\s*\}/, newSaveNewPass);

const newForgotPass = `              function showForgotPasswordModal() {
                  let modal = document.getElementById('forgot-password-modal');
                  if (modal) modal.remove();

                  modal = document.createElement('div');
                  modal.id = 'forgot-password-modal';
                  modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] fade-in';
                  
                  let currentStep = 1;
                  let identifier = '';
                  let foundUser = null;

                  const renderContent = () => {
                      let htmlContent = '';
                      if (currentStep === 1) {
                          htmlContent = \`
                              <div class="mb-5">
                                  <h3 class="text-xl font-bold text-slate-800 tracking-tight">পাসওয়ার্ড ভুলে গেছেন?</h3>
                                  <p class="text-sm text-slate-500 mt-1">আপনার জিমেইল/ইমেইল দিন</p>
                              </div>
                              <div class="mb-5">
                                  <input type="email" id="fpIdentifier" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-3" placeholder="আপনার জিমেইল/ইমেইল" required>
                              </div>
                              <div class="flex flex-col gap-3">
                                  <button id="fpBtnOtp" class="w-full text-white bg-slate-900 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-all">Gmail এ OTP পান</button>
                                  <button id="fpBtnRequest" class="w-full text-slate-700 bg-slate-100 hover:bg-slate-200 focus:ring-4 focus:outline-none focus:ring-slate-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-all">Gmail এ পাসওয়ার্ড পান</button>
                              </div>
                          \`;
                      } else if (currentStep === 2) {
                          htmlContent = \`
                              <div class="mb-5">
                                  <h3 class="text-xl font-bold text-slate-800 tracking-tight">ভেরিফিকেশন কোড</h3>
                                  <p class="text-sm text-slate-500 mt-1">আপনার ইমেইলে একটি ৬-ডিজিটের কোড পাঠানো হয়েছে</p>
                              </div>
                              <div class="mb-5">
                                  <input type="text" id="fpCode" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-2xl tracking-[0.5em] text-center font-black rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-3" placeholder="------" maxlength="6" required>
                              </div>
                              <button id="fpBtnVerify" class="w-full text-white bg-slate-900 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-all">ভেরিফাই করুন</button>
                          \`;
                      } else if (currentStep === 3) {
                          htmlContent = \`
                              <div class="mb-5">
                                  <h3 class="text-xl font-bold text-slate-800 tracking-tight">নতুন পাসওয়ার্ড</h3>
                                  <p class="text-sm text-slate-500 mt-1">আপনার নতুন পাসওয়ার্ড সেট করুন</p>
                              </div>
                              <div class="mb-4">
                                  <input type="password" id="fpNewPass" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-3" placeholder="নতুন পাসওয়ার্ড" required>
                              </div>
                              <div class="mb-5">
                                  <input type="password" id="fpConfirmPass" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-3" placeholder="পাসওয়ার্ড নিশ্চিত করুন" required>
                              </div>
                              <button id="fpBtnSave" class="w-full text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-all">পাসওয়ার্ড পরিবর্তন ও লগইন</button>
                          \`;
                      } else if (currentStep === 4) {
                          htmlContent = \`
                              <div class="mb-5 text-center">
                                  <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                      <i class="fas fa-check"></i>
                                  </div>
                                  <h3 class="text-xl font-bold text-slate-800 tracking-tight">রিকোয়েস্ট পাঠানো হয়েছে</h3>
                                  <p class="text-sm text-slate-600 mt-3 leading-relaxed">অটোমেটিক এডমিন প্যানেলে রিকোয়েস্ট চলে গেছে। ৬ ঘন্টার ভিতরে আপনার জিমেইলে পাসওয়ার্ড পেয়ে যাবেন।</p>
                              </div>
                              <button id="fpBtnCloseOk" class="w-full text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-all">ওকে</button>
                          \`;
                      }

                      modal.innerHTML = \`
                          <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto p-8 border border-slate-100">
                              <button id="fpBtnClose" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                                  <i class="fas fa-times"></i>
                              </button>
                              \${htmlContent}
                          </div>
                      \`;

                      document.getElementById('fpBtnClose').addEventListener('click', () => {
                          modal.remove();
                      });

                      if (currentStep === 1) {
                          document.getElementById('fpBtnOtp').addEventListener('click', async () => {
                              const idVal = document.getElementById('fpIdentifier').value.trim();
                              if (!idVal || !idVal.includes('@')) return showToast("আপনার জিমেইল/ইমেইল দিন", "error");
                              
                              foundUser = appUsers.find(u => u.email && u.email.toLowerCase().trim() === idVal.toLowerCase().trim());
                              if (!foundUser) return showToast("এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি", "error");

                              const btn = document.getElementById('fpBtnOtp');
                              btn.innerText = 'কোড পাঠানো হচ্ছে...';
                              btn.disabled = true;

                              try {
                                  const res = await fetch("/api/send-verification-email", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ email: foundUser.email })
                                  });
                                  
                                  if (!res.ok) {
                                      const data = await res.json().catch(()=>({}));
                                      throw new Error(data.error || "কোড পাঠানো ব্যর্থ হয়েছে");
                                  }

                                  showToast("আপনার ইমেইলে একটি ভেরিফিকেশন কোড পাঠানো হয়েছে!", "success");
                                  currentStep = 2;
                                  renderContent();
                              } catch(e) {
                                  showToast(e.message, "error");
                                  btn.innerText = 'Gmail এ OTP পান';
                                  btn.disabled = false;
                              }
                          });

                          document.getElementById('fpBtnRequest').addEventListener('click', async () => {
                              const idVal = document.getElementById('fpIdentifier').value.trim();
                              if (!idVal || !idVal.includes('@')) return showToast("আপনার জিমেইল/ইমেইল দিন", "error");
                              
                              foundUser = appUsers.find(u => u.email && u.email.toLowerCase().trim() === idVal.toLowerCase().trim());
                              if (!foundUser) return showToast("এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি", "error");

                              // Send request to admin panel (we can create a password request record in firestore)
                              if (window.db) {
                                  window.db.collection('password_requests').add({
                                      profileId: foundUser.profileId,
                                      email: foundUser.email,
                                      phone: foundUser.phone || '',
                                      shopName: foundUser.shopName || '',
                                      requestedAt: Date.now(),
                                      status: 'pending'
                                  }).catch(err => console.error("Error creating request:", err));
                              }

                              currentStep = 4;
                              renderContent();
                          });
                      } else if (currentStep === 2) {
                          document.getElementById('fpBtnVerify').addEventListener('click', async () => {
                              const code = document.getElementById('fpCode').value.trim();
                              if (code.length !== 6) return showToast("সঠিক ৬-ডিজিটের কোড দিন", "error");
                              
                              const btn = document.getElementById('fpBtnVerify');
                              btn.innerText = 'ভেরিফাই হচ্ছে...';
                              btn.disabled = true;

                              try {
                                  const res = await fetch("/api/verify-email-code", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ email: foundUser.email, code })
                                  });
                                  
                                  if (!res.ok) {
                                      const data = await res.json().catch(()=>({}));
                                      throw new Error(data.error || "ভুল কোড প্রদান করেছেন");
                                  }
                                  
                                  showToast("কোড সফলভাবে ভেরিফাই হয়েছে!", "success");
                                  currentStep = 3;
                                  renderContent();
                              } catch (e) {
                                  showToast(e.message, "error");
                                  btn.innerText = 'ভেরিফাই করুন';
                                  btn.disabled = false;
                              }
                          });
                      } else if (currentStep === 3) {
                          document.getElementById('fpBtnSave').addEventListener('click', () => {
                              const np = document.getElementById('fpNewPass').value.trim();
                              const cp = document.getElementById('fpConfirmPass').value.trim();
                              
                              if (np.length < 4) return showToast("পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে", "error");
                              if (np !== cp) return showToast("পাসওয়ার্ড দুটি মিলছে না", "error");
                              
                              saveNewPassword(foundUser.profileId, np);
                              modal.remove();
                              showToast("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!", "success");
                              
                              // Auto login
                              userProfile = { ...DEFAULT_PROFILE, ...foundUser, password: np };
                              userProfile.lastActive = new Date().toISOString();
                              const uIdx = appUsers.findIndex(u => String(u.profileId) === String(userProfile.profileId));
                              if(uIdx > -1) {
                                  appUsers[uIdx].lastActive = userProfile.lastActive;
                                  saveUsers(userProfile.profileId);
                              }
                              saveProfile();
                              
                              if (typeof syncProfileWithGlobal === 'function') syncProfileWithGlobal();
                              const auth = document.getElementById('authSection');
                              const dash = document.getElementById('dashboardSection');
                              var landing = document.getElementById('landingSection');
                              if(landing) landing.classList.add('hidden');
                              auth.classList.add('hidden');
                              dash.classList.remove('hidden');
                              dash.classList.add('fade-in');
                              renderHome();
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                          });
                      } else if (currentStep === 4) {
                          document.getElementById('fpBtnCloseOk').addEventListener('click', () => {
                              modal.remove();
                          });
                      }
                  };
                  document.body.appendChild(modal);
                  renderContent();
              }`;

const startIdx = html.indexOf('function showForgotPasswordModal()');
const endIdx = html.indexOf('function loginSession()');

if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
    html = html.substring(0, startIdx) + newForgotPass + '\n' + html.substring(endIdx);
    fs.writeFileSync('index.html', html);
    console.log("Updated showForgotPasswordModal successfully.");
} else {
    console.log("Could not find forgot password block.");
}
