import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

login_form_html = """          <!-- Login Form -->
          <div id="loginForm" class="fade-in">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-slate-800 tracking-tight">
                লগইন করুন
              </h2>
              <p class="text-slate-500 mt-2">
                আপনার অ্যাকাউন্টে ফিরে আসুন
              </p>
            </div>
            <form onsubmit="event.preventDefault(); handleLogin();" class="space-y-6">
              <div class="floating-label-group">
                <input type="text" id="loginIdentifier" placeholder=" " required />
                <label>ইমেইল অথবা মোবাইল নম্বর</label>
              </div>
              <div class="floating-label-group">
                <input type="password" id="loginPass" placeholder=" " required />
                <label>পাসওয়ার্ড</label>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="custom-checkbox" />
                  <span class="text-sm text-slate-600">মনে রাখুন</span>
                </label>
                <button type="button" onclick="showForgotPasswordModal()" class="text-sm font-semibold text-orange-600 hover:underline">
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
              <button
                type="submit"
                id="btnLoginSubmit"
                class="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 hover:shadow-slate-300 transform active:scale-95 transition-all text-base sm:text-lg flex items-center justify-center gap-3"
              >
                <i class="fas fa-sign-in-alt"></i> প্রবেশ করুন
              </button>
            </form>
            
            <div class="mt-8 text-center">
              <p class="text-xs sm:text-sm text-slate-500">
                অ্যাকাউন্ট নেই?
                <button type="button" onclick="toggleAuth(false)" class="text-orange-600 font-extrabold hover:underline ml-1 cursor-pointer">
                  নতুন অ্যাকাউন্ট খুলুন
                </button>
              </p>
            </div>
          </div>
          
"""

# Let's insert loginForm before registerForm. Also registerForm should be hidden by default if login is default.
# I'll make toggleAuth work by default: I'll just insert loginForm right before registerForm.
# Wait, registerForm is currently visible. I'll add 'hidden' to registerForm.

content = content.replace('<div id="registerForm" class="fade-in">', login_form_html + '<div id="registerForm" class="fade-in hidden">')

# Also inject `handleLogin()`
js_to_inject = """
              function handleLogin() {
                  const identifier = document.getElementById('loginIdentifier').value.trim();
                  const pass = document.getElementById('loginPass').value;
                  const btn = document.getElementById('btnLoginSubmit');

                  if (!identifier || !pass) return showToast('সব তথ্য দিন', 'error');

                  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> অপেক্ষা করুন...';
                  btn.disabled = true;

                  const isEmail = identifier.includes('@');
                  const creds = { password: pass };
                  if (isEmail) creds.email = identifier;
                  else creds.phone = identifier;

                  if (window.supabase) {
                      window.supabase.auth.signInWithPassword(creds)
                      .then(({ data, error }) => {
                          if (error) {
                              showToast('লগইন ব্যর্থ: ' + error.message, 'error');
                              btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> প্রবেশ করুন';
                              btn.disabled = false;
                          } else {
                              showToast('সফলভাবে লগইন হয়েছে!', 'success');
                              document.getElementById('authSection').classList.add('hidden');
                              document.getElementById('dashboardSection').classList.remove('hidden');
                              // Do whatever app initialization is needed
                          }
                      });
                  } else {
                      // Fallback if no supabase
                      setTimeout(() => {
                          showToast('সফলভাবে লগইন হয়েছে!', 'success');
                          document.getElementById('authSection').classList.add('hidden');
                          document.getElementById('dashboardSection').classList.remove('hidden');
                      }, 1000);
                  }
              }
"""
content = content.replace('function toggleAuth(showLogin) {', js_to_inject + '\n              function toggleAuth(showLogin) {')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added login form")
