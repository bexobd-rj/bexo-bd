const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Refactor registerForm HTML
const oldRegFormStart = '<form\\s*onsubmit="[\\s\\S]*?event\\.preventDefault\\(\\);[\\s\\S]*?handleRegister\\(\\);[\\s\\S]*?"\\s*class="grid grid-cols-1 sm:grid-cols-2 gap-x-4"\\s*>';
const newRegFormHtml = `<form
              onsubmit="
                event.preventDefault();
                handleRegister();
              "
              class="grid grid-cols-1 gap-y-4"
            >
              <div class="floating-label-group">
                <input type="email" id="regEmail" placeholder=" " required />
                <label>জিমেইল / ইমেইল</label>
              </div>
              <div class="floating-label-group">
                <input type="password" id="regPass" placeholder=" " required />
                <label>পাসওয়ার্ড</label>
              </div>
              <div class="floating-label-group">
                <input
                  type="password"
                  id="regConfirmPass"
                  placeholder=" "
                  required
                />
                <label>পাসওয়ার্ড নিশ্চিত করুন</label>
              </div>
              <div class="floating-label-group">
                <input type="text" id="regReferral" placeholder=" " />
                <label>রেফার কোড / সেলার কোড (যদি থাকে)</label>
              </div>

              <div class="flex items-center gap-3 mb-6">
                <input
                  type="checkbox"
                  id="terms"
                  class="custom-checkbox"
                  required
                />
                <label for="terms" class="text-sm text-slate-600"
                  >আমি
                  <span
                    class="text-orange-600 font-semibold cursor-pointer underline"
                    >শর্তাবলীতে</span
                  >
                  রাজি আছি</label
                >
              </div>

              <button id="regSubmitBtn" type="submit" class="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-100 hover:shadow-orange-200 transform active:scale-95 transition-all text-base sm:text-lg mb-6 flex items-center justify-center gap-3"
              >
                <i class="fas fa-user-plus"></i> অ্যাকাউন্ট তৈরি করুন
              </button>
            </form>`;

html = html.replace(new RegExp(oldRegFormStart + '[\\s\\S]*?</form>'), newRegFormHtml);

// 2. Refactor loginForm HTML
html = html.replace(/<label>মোবাইল নম্বর অথবা জিমেইল \/ ইমেইল<\/label>/, '<label>জিমেইল / ইমেইল</label>');
html = html.replace(/<input\s*type="text"\s*id="loginPhone"/, '<input\n                  type="email"\n                  id="loginPhone"');

// 3. Replace handleRegister function
const oldHandleRegStart = 'async function handleRegister\\(\\)\\s*\\{[\\s\\S]*?function showGoogleFallbackModal';
const newHandleReg = `async function handleRegister() {
                  try {
                      const regBtn = document.getElementById('regSubmitBtn');
                      if (regBtn) {
                          regBtn.disabled = true;
                          regBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> অ্যাকাউন্ট তৈরি হচ্ছে...';
                      }

                      const emailField = document.getElementById('regEmail');
                      const passField = document.getElementById('regPass');
                      const confirmField = document.getElementById('regConfirmPass');
                      const refCodeField = document.getElementById('regReferral');
                      const termsField = document.getElementById('terms');

                      if (!emailField || !passField || !termsField) {
                          throw new Error("Required registration fields missing in DOM");
                      }

                      const email = emailField.value.trim();
                      let pass = passField.value;
                      let confirm = confirmField ? confirmField.value : '';
                      const bMap = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
                      pass = pass.replace(/[০-৯]/g, d => bMap[d] || d);
                      confirm = confirm.replace(/[০-৯]/g, d => bMap[d] || d);

                      const refCode = refCodeField ? refCodeField.value.trim() : '';
                      const terms = termsField.checked;

                      const enableBtn = () => {
                          if(document.getElementById('regSubmitBtn')) {
                              document.getElementById('regSubmitBtn').disabled = false;
                              document.getElementById('regSubmitBtn').innerHTML = '<i class="fas fa-user-plus"></i> অ্যাকাউন্ট তৈরি করুন';
                          }
                      };

                      if (!terms) {
                          showToast("শর্তাবলীতে রাজি হতে হবে!", "error");
                          enableBtn();
                          return;
                      }

                      if(!pass || !email) {
                          showToast("সবগুলো তথ্য সঠিকভাবে পূরণ করুন এবং অবশ্যই ইমেইল প্রদান করুন!", "error");
                          enableBtn();
                          return;
                      }

                      if(pass !== confirm) {
                          showToast("পাসওয়ার্ড ম্যাচ করেনি!", "error");
                          enableBtn();
                          return;
                      }

                      if(pass.length < 6) {
                          showToast("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!", "error");
                          enableBtn();
                          return;
                      }

                      // Check for existing user with this email address
                      const existingEmail = appUsers.find(u => u.email && u.email.toLowerCase().trim() === email.toLowerCase().trim());
                      if (existingEmail) {
                          showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");
                          enableBtn();
                          return;
                      }

                      // Explicitly check Firestore
                      if (window.db) {
                          try {
                              showToast("অ্যাকাউন্ট ভেরিফাই করা হচ্ছে...", "info");
                              const snap = await window.db.collection('bexo_users').get();
                              let firestoreDuplicate = false;
                              snap.forEach(doc => {
                                  const data = doc.data();
                                  if (data) {
                                      if (data.email && email && data.email.toLowerCase().trim() === email.toLowerCase().trim()) {
                                          firestoreDuplicate = 'email';
                                      }
                                  }
                              });
                              if (firestoreDuplicate === 'email') {
                                  showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");
                                  enableBtn();
                                  return;
                              }
                          } catch(e) {
                              console.error("Firestore duplicate check failed:", e);
                          }
                      }

                      let referredBy = null;
                      if (refCode) {
                          const referrer = findReferrerByCode(refCode);
                          if (referrer) {
                              referredBy = referrer.profileId;
                          } else {
                              showToast("ভুল রেফারেল কোড! দয়া করে সঠিক কোড দিন অথবা ঘরটি খালি রাখুন।", "error");
                              enableBtn();
                              return;
                          }
                      }

                      const oldProfileId = userProfile ? userProfile.profileId : null;

                      let sCode = '';
                      while (true) {
                          sCode = 'BX' + Math.floor(100 + Math.random() * 900);
                          if (Array.isArray(appUsers)) {
                              if (!appUsers.some(u => u.sellerCode === sCode)) break;
                          } else {
                              break;
                          }
                      }

                      const newProfile = {
                          ...DEFAULT_PROFILE,
                          shopName: '',
                          fullName: '',
                          phone: '',
                          email: email,
                          address: '',
                          password: pass,
                          sellerCode: sCode,
                          referredBy: referredBy,
                          profileId: 'BX-' + Math.floor(100000 + Math.random() * 900000),
                          joinDate: new Date().toLocaleDateString('bn-BD'),
                          createdAt: Date.now()
                      };

                      const completeRegistration = (profile) => {
                          // Migrations
                          if (oldProfileId && oldProfileId !== profile.profileId) {
                              let migratedAccCount = 0;
                              appAccounts.forEach(acc => {
                                  if (acc.profileId === oldProfileId) {
                                      acc.profileId = profile.profileId;
                                      migratedAccCount++;
                                  }
                              });
                              if (migratedAccCount > 0) saveAccounts();

                              let migratedBalCount = 0;
                              appBalanceRequests.forEach(req => {
                                  if (req.profileId === oldProfileId) {
                                      req.profileId = profile.profileId;
                                      migratedBalCount++;
                                  }
                              });
                              if (migratedBalCount > 0) saveBalanceRequests();

                              let migratedWdrCount = 0;
                              appWithdrawals.forEach(w => {
                                  if (w.profileId === oldProfileId) {
                                      w.profileId = profile.profileId;
                                      migratedWdrCount++;
                                  }
                              });
                              if (migratedWdrCount > 0) saveWithdrawals();

                              let migratedOrdCount = 0;
                              appOrders.forEach(o => {
                                  if (o.profileId === oldProfileId) {
                                      o.profileId = profile.profileId;
                                      migratedOrdCount++;
                                  }
                              });
                              if (migratedOrdCount > 0) saveOrders();
                          }

                          if (referredBy) {
                              const refs = JSON.parse(localStorage.getItem('bexo_referrals')) || [];
                              refs.push({
                                  referredBy: refCode,
                                  name: email,
                                  commission: 50,
                                  date: new Date().toLocaleString()
                              });
                              localStorage.setItem('bexo_referrals', JSON.stringify(refs));
                              showToast("রেফারেল বোনাস ৫০ টাকা সফলভাবে যোগ হয়েছে।", "success");
                          }

                          userProfile = profile;
                          saveProfile();
                          updateAppUsersList(userProfile);

                          const loginPhone = document.getElementById('loginPhone');
                          const loginPass = document.getElementById('loginPass');
                          if(loginPhone) loginPhone.value = email;
                          if(loginPass) loginPass.value = pass;

                          showToast("অভিনন্দন! আপনার অ্যাকাউন্ট তৈরি হয়েছে। অনুগ্রহ করে প্রোফাইল সেটাপ করুন বা তথ্য দিন।", "success");
                          enableBtn();

                          // Switch to Dashboard and Profile
                          const auth = document.getElementById('authSection');
                          const dash = document.getElementById('dashboardSection');
                          if(auth && dash) {
                              auth.classList.add('hidden');
                              dash.classList.remove('hidden');
                              dash.classList.add('fade-in');
                              var landing = document.getElementById('landingSection');
                              if(landing) landing.classList.add('hidden');
                              
                              // First render home, then navigate to profile
                              renderHome();
                              showSection('profileSection');
                              
                              setTimeout(() => {
                                  alert("অনুগ্রহ করে আপনার প্রোফাইলের বাকি তথ্যগুলো (শপের নাম, আপনার নাম, মোবাইল নম্বর, ঠিকানা) পূরণ করুন।");
                              }, 500);

                              window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                      };

                      completeRegistration(newProfile);

                  } catch (error) {
                      console.error("Registration Error:", error);
                      showToast("অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে! আবার চেষ্টা করুন।", "error");
                      if(document.getElementById('regSubmitBtn')) { document.getElementById('regSubmitBtn').disabled = false; document.getElementById('regSubmitBtn').innerHTML = '<i class="fas fa-user-plus"></i> অ্যাকাউন্ট তৈরি করুন'; }
                  }
              }

              function showGoogleFallbackModal`;

html = html.replace(new RegExp(oldHandleRegStart), newHandleReg);

fs.writeFileSync('index.html', html);
console.log('Modified HTML');
