const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /function showForgotPasswordModal\(\) \{[\s\S]*?\}\s*(?=\/\/\s*---|\n\s*async function loginSession)/;
const newForgotPass = `function showForgotPasswordModal() {
                  let modal = document.getElementById('forgot-password-modal');
                  if (modal) modal.remove();

                  modal = document.createElement('div');
                  modal.id = 'forgot-password-modal';
                  modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] fade-in';
                  
                  modal.innerHTML = \`
                      <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto p-8 border border-slate-100">
                          <button id="fpBtnClose" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                              <i class="fas fa-times"></i>
                          </button>
                          
                          <div class="mb-5">
                              <h3 class="text-xl font-bold text-slate-800 tracking-tight">পাসওয়ার্ড ভুলে গেছেন?</h3>
                              <p class="text-sm text-slate-500 mt-1">আপনার জিমেইল/ইমেইল দিন। আমরা পাসওয়ার্ড রিসেট লিংক পাঠাবো।</p>
                          </div>
                          <div class="mb-5">
                              <input type="email" id="fpIdentifier" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-3" placeholder="আপনার জিমেইল/ইমেইল" required>
                          </div>
                          <div class="flex flex-col gap-3">
                              <button id="fpBtnReset" class="w-full text-white bg-slate-900 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-slate-300 font-bold rounded-xl text-sm px-5 py-3 text-center transition-all">পাসওয়ার্ড রিসেট লিংক পাঠান</button>
                          </div>
                      </div>
                  \`;

                  document.body.appendChild(modal);

                  document.getElementById('fpBtnClose').addEventListener('click', () => {
                      modal.remove();
                  });

                  document.getElementById('fpBtnReset').addEventListener('click', async () => {
                      const email = document.getElementById('fpIdentifier').value.trim();
                      if (!email || !email.includes('@')) return showToast("আপনার জিমেইল/ইমেইল দিন", "error");
                      
                      const btn = document.getElementById('fpBtnReset');
                      btn.innerText = 'পাঠানো হচ্ছে...';
                      btn.disabled = true;

                      if (!window.firebaseAuth || !window.sendPasswordResetEmail) {
                          showToast("Firebase এখনো লোড হয়নি। দয়া করে অপেক্ষা করুন।", "error");
                          btn.innerText = 'পাসওয়ার্ড রিসেট লিংক পাঠান';
                          btn.disabled = false;
                          return;
                      }

                      try {
                          await window.sendPasswordResetEmail(window.firebaseAuth, email);
                          showToast("আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে! ইনবক্স চেক করুন।", "success");
                          modal.remove();
                      } catch(e) {
                          console.error(e);
                          if (e.code === 'auth/user-not-found') {
                              showToast("এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি", "error");
                          } else {
                              showToast(e.message, "error");
                          }
                          btn.innerText = 'পাসওয়ার্ড রিসেট লিংক পাঠান';
                          btn.disabled = false;
                      }
                  });
              }`;

html = html.replace(regex, newForgotPass);
fs.writeFileSync('index.html', html);
console.log("Replaced showForgotPasswordModal");
