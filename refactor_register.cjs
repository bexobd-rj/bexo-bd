const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldRegisterStart = "async function handleRegister() {";
const newRegisterStart = `async function handleRegister() {
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

                      if (!terms) { showToast("শর্তাবলীতে রাজি হতে হবে!", "error"); enableBtn(); return; }
                      if(!pass || !email) { showToast("সবগুলো তথ্য সঠিকভাবে পূরণ করুন এবং অবশ্যই ইমেইল প্রদান করুন!", "error"); enableBtn(); return; }
                      if(pass !== confirm) { showToast("পাসওয়ার্ড ম্যাচ করেনি!", "error"); enableBtn(); return; }
                      if(pass.length < 6) { showToast("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!", "error"); enableBtn(); return; }

                      let referredBy = null;
                      if (refCode) {
                          const referrer = findReferrerByCode(refCode);
                          if (referrer) { referredBy = referrer.profileId; } 
                          else { showToast("ভুল রেফারেল কোড! দয়া করে সঠিক কোড দিন অথবা ঘরটি খালি রাখুন।", "error"); enableBtn(); return; }
                      }

                      if (!window.firebaseAuth || !window.createUserWithEmailAndPassword) {
                          showToast("Firebase এখনো লোড হয়নি। দয়া করে অপেক্ষা করুন।", "error");
                          enableBtn(); return;
                      }

                      try {
                          // Create User in Firebase Auth
                          const userCredential = await window.createUserWithEmailAndPassword(window.firebaseAuth, email, pass);
                          const user = userCredential.user;
                          
                          let sCode = '';
                          while (true) {
                              sCode = 'BX' + Math.floor(100 + Math.random() * 900);
                              if (Array.isArray(appUsers) && !appUsers.some(u => u.sellerCode === sCode)) break;
                              else if (!Array.isArray(appUsers)) break;
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
                              createdAt: Date.now(),
                              uid: user.uid // Map to Firebase Auth UID
                          };

                          // Store in Firestore with Auth UID as document ID
                          await window.db.collection('bexo_users').doc(user.uid).set(sanitizeForFirestore(newProfile));

                          if (referredBy) {
                              const refs = JSON.parse(localStorage.getItem('bexo_referrals')) || [];
                              refs.push({ referredBy: refCode, name: email, commission: 50, date: new Date().toLocaleString() });
                              localStorage.setItem('bexo_referrals', JSON.stringify(refs));
                              showToast("রেফারেল বোনাস ৫০ টাকা সফলভাবে যোগ হয়েছে।", "success");
                          }

                          showToast("অভিনন্দন! আপনার অ্যাকাউন্ট তৈরি হয়েছে।", "success");
                          enableBtn();
                          // onAuthStateChanged will handle the login transition automatically

                      } catch (authError) {
                          console.error("Firebase Registration Error:", authError);
                          if (authError.code === 'auth/email-already-in-use') {
                              showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");
                          } else {
                              showToast("অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে: " + authError.message, "error");
                          }
                          enableBtn();
                      }
                  } catch (e) {
                      console.error("Registration error", e);
                  }
              }
`;

const regex = /async function handleRegister\(\) \{[\s\S]*?\}\s*(?=\/\/\s*--)/;
html = html.replace(regex, newRegisterStart);

fs.writeFileSync('index.html', html);
console.log("Refactored handleRegister");
