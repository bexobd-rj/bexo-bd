const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldCodeStart = html.indexOf("function loginSession() {");
const oldCodeEnd = html.indexOf("}", html.indexOf("window.scrollTo({ top: 0, behavior: 'smooth' });", oldCodeStart)) + 1;

const newLogin = `async function loginSession() {
                  const phoneField = document.getElementById('loginPhone');
                  const passField = document.getElementById('loginPass');
                  const alertBox = document.getElementById('loginAlert');
                  const alertMsg = document.getElementById('loginAlertMsg');
                  const successBox = document.getElementById('loginSuccessAlert');
                  const loginBtn = document.getElementById('loginSubmitBtn');

                  if(successBox) successBox.classList.add('hidden');

                  const phone = phoneField.value.trim();
                  let pass = passField.value.trim();

                  const bMap = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
                  pass = pass.replace(/[০-৯]/g, d => bMap[d] || d);

                  if (!phone || !pass) {
                      alertBox.classList.remove('hidden');
                      alertMsg.innerText = "ইমেইল এবং পাসওয়ার্ড প্রদান করুন!";
                      return;
                  }

                  if (!window.firebaseAuth || !window.signInWithEmailAndPassword) {
                      showToast("Firebase এখনো লোড হয়নি। দয়া করে অপেক্ষা করুন।", "error");
                      return;
                  }

                  if (loginBtn) {
                          loginBtn.disabled = true;
                          loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> লগইন হচ্ছে...';
                  }

                  try {
                      alertBox.classList.add('hidden');
                      await window.signInWithEmailAndPassword(window.firebaseAuth, phone, pass);
                      if (loginBtn) {
                          loginBtn.disabled = false;
                          loginBtn.innerHTML = 'লগইন করুন <i class="fas fa-arrow-right"></i>';
                      }
                  } catch (authError) {
                      console.error("Firebase Login Error:", authError);
                      alertBox.classList.remove('hidden');
                      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
                          alertMsg.innerText = "ভুল জিমেইল বা পাসওয়ার্ড প্রদান করেছেন!";
                      } else {
                          alertMsg.innerText = "লগইন করতে সমস্যা হয়েছে: " + authError.message;
                      }
                      
                      phoneField.classList.add('border-red-400', 'bg-red-50');
                      passField.classList.add('border-red-400', 'bg-red-50');
                      passField.value = '';
                      passField.focus();
                      setTimeout(() => {
                          phoneField.classList.remove('border-red-400', 'bg-red-50');
                          passField.classList.remove('border-red-400', 'bg-red-50');
                      }, 3000);
                      if (loginBtn) {
                          loginBtn.disabled = false;
                          loginBtn.innerHTML = 'লগইন করুন <i class="fas fa-arrow-right"></i>';
                      }
                  }
              }`;

html = html.substring(0, oldCodeStart) + newLogin + html.substring(oldCodeEnd);
fs.writeFileSync('index.html', html);
console.log("Replaced loginSession");
