import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacement_html = """          <!-- Registration Form -->
          <div id="registerForm" class="fade-in">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-slate-800 tracking-tight">
                নতুন অ্যাকাউন্ট খুলুন
              </h2>
              <p class="text-slate-500 mt-2">
                আপনার ব্যবসার যাত্রা শুরু হোক আজ থেকেই।
              </p>
            </div>

            <!-- STEP 1: Email Input -->
            <form id="regStep1Form" onsubmit="event.preventDefault(); showRegOtpModal();">
              <div class="floating-label-group mb-6">
                <input type="email" id="regEmail" placeholder=" " required />
                <label>জিমেইল / ইমেইল</label>
              </div>
              <button
                type="submit"
                class="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-100 hover:shadow-orange-200 transform active:scale-95 transition-all text-base sm:text-lg mb-6 flex items-center justify-center gap-3"
              >
                ভেরিফিকেশন কোড পাঠান <i class="fas fa-arrow-right"></i>
              </button>
            </form>

            <!-- STEP 2: Full Form (Hidden initially) -->
            <form
              id="regStep2Form"
              onsubmit="
                event.preventDefault();
                handleRegister();
              "
              class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 hidden"
            >
              <div class="sm:col-span-2 flex items-center gap-2 mb-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200">
                <i class="fas fa-check-circle"></i>
                <span id="verifiedEmailText" class="font-semibold text-sm"></span>
              </div>
              <div class="floating-label-group sm:col-span-2">
                <input type="text" id="regShop" placeholder=" " required />
                <label>শপের নাম</label>
              </div>
              <div class="floating-label-group">
                <input type="text" id="regName" placeholder=" " required />
                <label>আপনার পূর্ণ নাম</label>
              </div>
              <div class="floating-label-group">
                <input type="tel" id="regPhone" placeholder=" " required />
                <label>মোবাইল নম্বর</label>
              </div>
              <div class="floating-label-group sm:col-span-2">
                <input type="text" id="regReferral" placeholder=" " />
                <label>রেফার কোড / সেলার কোড (যদি থাকে)</label>
              </div>
              <div class="floating-label-group sm:col-span-2">
                <input type="text" id="regAddress" placeholder=" " required />
                <label>সম্পূর্ণ ঠিকানা</label>
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
              <div class="sm:col-span-2 flex items-center gap-3 mb-6">
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
              <button
                type="submit"
                class="sm:col-span-2 w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-100 hover:shadow-orange-200 transform active:scale-95 transition-all text-base sm:text-lg mb-6 flex items-center justify-center gap-3"
              >
                <i class="fas fa-user-plus"></i> অ্যাকাউন্ট তৈরি করুন
              </button>
            </form>

            <div class="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
              <p class="text-xs sm:text-sm text-slate-500">
                ইতিমধ্যে অ্যাকাউন্ট আছে?
                <button
                  onclick="toggleAuth(true)"
                  type="button"
                  class="text-orange-600 font-extrabold hover:underline ml-1 cursor-pointer"
                >
                  লগইন করুন
                </button>
              </p>
            </div>
          </div>"""

# Define the regex to find the old registerForm block
pattern = r'<!-- Registration Form -->\s*<div id="registerForm" class="fade-in">.*?</div>\s*</div>\s*</div>\s*</div>'
# Actually wait, the HTML structure might vary. Let's just do a string split/replace based on known boundaries.
start_marker = '<!-- Registration Form -->'
end_marker = '</div>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Main Dashboard Application Area -->'

if start_marker in content and end_marker in content:
    pre = content.split(start_marker)[0]
    # The end_marker is actually the end of authSection
    # Let's find exactly the registerForm closing div.
    pass

import re

# Let's replace the whole registerForm div
# It starts at:           <!-- Registration Form -->
# It ends right before:          </div>\n        </div>\n      </div>\n    </section>

pattern = re.compile(r'<!-- Registration Form -->\s*<div id="registerForm" class="fade-in">[\s\S]*?(?=\s*</div>\s*</div>\s*</div>\s*</section>)')
match = pattern.search(content)

if match:
    new_content = content[:match.start()] + replacement_html + content[match.end():]
    
    # Now inject the javascript
    js_to_inject = """
              function showRegOtpModal() {
                  const emailField = document.getElementById('regEmail');
                  const email = emailField.value.trim();
                  if(!email) return alert('দয়া করে আপনার ইমেইল দিন');

                  let modal = document.getElementById('reg-otp-modal');
                  if (modal) modal.remove();

                  modal = document.createElement('div');
                  modal.id = 'reg-otp-modal';
                  modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] fade-in';
                  
                  modal.innerHTML = `
                      <div class="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl">
                          <button type="button" onclick="document.getElementById('reg-otp-modal').remove()" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-800 transition-colors">
                              <i class="fas fa-times"></i>
                          </button>
                          
                          <div class="text-center mb-6">
                              <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                  <i class="fas fa-envelope-open-text text-2xl"></i>
                              </div>
                              <h3 class="text-xl font-bold text-slate-800 tracking-tight">ইমেইল ভেরিফিকেশন</h3>
                              <p class="text-sm text-slate-500 mt-2">আমরা <strong>${email}</strong> এ একটি ৬-ডিজিটের কোড পাঠিয়েছি।</p>
                          </div>
                          
                          <div class="mb-6">
                              <input type="text" id="regOtpCode" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-2xl tracking-[0.5em] text-center font-black rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-4" placeholder="------" maxlength="6" required>
                          </div>
                          
                          <button type="button" onclick="verifyRegOtp('${email}')" id="regBtnVerify" class="w-full text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 font-bold rounded-xl text-base sm:text-lg px-5 py-4 text-center shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2">
                              ভেরিফাই করুন <i class="fas fa-check-circle"></i>
                          </button>
                      </div>
                  `;
                  document.body.appendChild(modal);

                  if (window.supabase) {
                      window.supabase.auth.signInWithOtp({
                          email: email,
                          options: { shouldCreateUser: true }
                      }).then(res => {
                          if (res.error) alert("OTP Sending failed: " + res.error.message);
                      });
                  } else {
                      console.log("Supabase is not loaded. Simulating OTP send.");
                  }
              }

              function verifyRegOtp(email) {
                  const otpField = document.getElementById('regOtpCode');
                  const otp = otpField.value.trim();
                  if(otp.length !== 6) return alert('৬-ডিজিটের কোড দিন');

                  const btn = document.getElementById('regBtnVerify');
                  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ভেরিফাই হচ্ছে...';
                  btn.disabled = true;

                  if (window.supabase) {
                      window.supabase.auth.verifyOtp({
                          email: email,
                          token: otp,
                          type: 'email'
                      }).then(res => {
                          if (res.error) {
                              alert("Invalid OTP: " + res.error.message);
                              btn.innerHTML = 'ভেরিফাই করুন <i class="fas fa-check-circle"></i>';
                              btn.disabled = false;
                          } else {
                              completeEmailVerification(email);
                          }
                      });
                  } else {
                      console.log("Supabase is not loaded. Simulating OTP verification.");
                      setTimeout(() => {
                          completeEmailVerification(email);
                      }, 1000);
                  }
              }

              function completeEmailVerification(email) {
                  document.getElementById('reg-otp-modal').remove();
                  document.getElementById('regStep1Form').classList.add('hidden');
                  document.getElementById('regStep2Form').classList.remove('hidden');
                  document.getElementById('verifiedEmailText').textContent = email + ' ভেরিফাইড হয়েছে।';
              }
"""

    # Inject js right before toggleAuth
    new_content = new_content.replace('function toggleAuth(showLogin) {', js_to_inject + '\n              function toggleAuth(showLogin) {')
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully patched index.html")
else:
    print("Could not find registerForm in index.html")
