              function showForgotPasswordModal() {
                  let modal = document.getElementById('forgot-password-modal');
                  if (modal) modal.remove();

                  modal = document.createElement('div');
                  modal.id = 'forgot-password-modal';
                  modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] fade-in';
                  
                  let currentStep = 1; // 1: Identifer (Email/Phone), 2: Verify Code, 3: New Password
                  let identifier = '';
                  let foundUser = null;

                  const renderContent = () => {
                      let htmlContent = '';
                      if (currentStep === 1) {
                          htmlContent = `
                              <div class="mb-5">
                                  <h3 class="text-xl font-bold text-slate-800 tracking-tight">পাসওয়ার্ড ভুলে গেছেন?</h3>
                                  <p class="text-sm text-slate-500 mt-1">আপনার জিমেইল/ইমেইল দিন</p>
                              </div>
                              <div class="mb-5">
                                  <input type="email" id="fpIdentifier" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-3" placeholder="আপনার জিমেইল/ইমেইল" required>
                              </div>
                              <button id="fpBtnNext" class="w-full text-white bg-slate-900 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-all">কোড পাঠান</button>
                          `;
                      } else if (currentStep === 2) {
                          htmlContent = `
                              <div class="mb-5">
                                  <h3 class="text-xl font-bold text-slate-800 tracking-tight">ভেরিফিকেশন কোড</h3>
                                  <p class="text-sm text-slate-500 mt-1">আপনার দেওয়া ঠিকানায় একটি কোড পাঠানো হয়েছে</p>
                              </div>
                              <div class="mb-5">
                                  <input type="text" id="fpCode" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-2xl tracking-[0.5em] text-center font-black rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-3" placeholder="------" maxlength="6" required>
                              </div>
                              <button id="fpBtnVerify" class="w-full text-white bg-slate-900 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-all">ভেরিফাই করুন</button>
                          `;
                      } else if (currentStep === 3) {
                          htmlContent = `
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
                          `;
                      }

                      modal.innerHTML = `
                          <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto p-8 border border-slate-100">
                              <button id="fpBtnClose" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                                  <i class="fas fa-times"></i>
                              </button>
                              ${htmlContent}
                          </div>
                      `;

                      // Bind events
                      modal.querySelector('#fpBtnClose').addEventListener('click', () => modal.remove());
                      
                      if (currentStep === 1) {
                          modal.querySelector('#fpBtnNext').addEventListener('click', async () => {
                              const val = modal.querySelector('#fpIdentifier').value.trim();
                              if (!val) return showToast("ইমেইল দিন", "error");
                              
                              if (!val.includes('@')) return showToast("সঠিক ইমেইল দিন", "error");

                              foundUser = appUsers.find(u => {
                                  return u.email && (u.email.toLowerCase().trim() === val.toLowerCase().trim());
                              });

                              if (!foundUser) {
                                  return showToast("এই ইমেইলের কোনো ইউজার পাওয়া যায়নি!", "error");
                              }
                              
                              identifier = val;
                              const btn = modal.querySelector('#fpBtnNext');
                              btn.innerText = 'পাঠানো হচ্ছে...';
                              btn.disabled = true;

                              try {
                                  const res = await fetch("/api/send-verification-email", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ email: foundUser.email })
                                  });
                                  
                                  let data;
                                  try {
                                      data = await res.json();
                                  } catch (e) {
                                      throw new Error("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না");
                                  }

                                  if (!res.ok) {
                                      throw new Error(data.error || "কোড পাঠানো ব্যর্থ হয়েছে");
                                  }
                                  
                                  showToast("আপনার ঠিকানায় একটি ভেরিফিকেশন কোড পাঠানো হয়েছে!", "success");
                                  currentStep = 2;
                                  renderContent();
                              } catch(e) {
                                  showToast(e.message, "error");
                                  btn.innerText = 'কোড পাঠান';
                                  btn.disabled = false;
                              }
                          });
                      } else if (currentStep === 2) {
                          modal.querySelector('#fpBtnVerify').addEventListener('click', async () => {
                              const code = modal.querySelector('#fpCode').value.trim();
                              if (code.length < 4) return showToast("সঠিক কোড দিন", "error");
                              
                              const btn = modal.querySelector('#fpBtnVerify');
                              btn.innerText = 'ভেরিফাই হচ্ছে...';
                              btn.disabled = true;

                              try {
                                  const res = await fetch("/api/verify-email-code", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ email: foundUser.email, code })
                                  });

                                  let data;
                                  try {
                                      data = await res.json();
                                  } catch (e) {
                                      throw new Error("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না");
                                  }

                                  if (!res.ok) {
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
                          modal.querySelector('#fpBtnSave').addEventListener('click', () => {
                              const np = modal.querySelector('#fpNewPass').value.trim();
                              const cp = modal.querySelector('#fpConfirmPass').value.trim();
                              
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
                      }
                  };
