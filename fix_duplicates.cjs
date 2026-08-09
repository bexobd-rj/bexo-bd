const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix filtering in syncGlobalStateWithLocalStorage and initialization
html = html.replace(/u => u && u\.phone && u\.password/g, "u => u && (u.phone || u.email || u.profileId)");
html = html.replace(/if \(!fUser \|\| !fUser\.phone \|\| !fUser\.password\) return;/g, "if (!fUser || (!fUser.phone && !fUser.email)) return;");


// 2. Make handleRegister async and check Firestore
const oldHandleRegister = `                    const normalizedInputPhone = normalizePhone(phone);
                      const existingUser = appUsers.find(u => normalizePhone(u.phone) === normalizedInputPhone);
                      if (existingUser) {
                          showToast("এই ফোন নম্বর দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");
                          return;
                      }

                      // Check for existing user with this email address
                      const existingEmail = appUsers.find(u => u.email && u.email.toLowerCase().trim() === email.toLowerCase().trim());
                      if (existingEmail) {
                          showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");
                          return;
                      }`;

const newHandleRegister = `                    const normalizedInputPhone = normalizePhone(phone);
                      const existingUser = appUsers.find(u => u.phone && normalizePhone(u.phone) === normalizedInputPhone);
                      if (existingUser) {
                          showToast("এই ফোন নম্বর দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");
                          return;
                      }

                      // Check for existing user with this email address
                      const existingEmail = appUsers.find(u => u.email && u.email.toLowerCase().trim() === email.toLowerCase().trim());
                      if (existingEmail) {
                          showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");
                          return;
                      }

                      // Explicitly check Firestore to prevent race condition duplicates if user is registering before initial load
                      if (window.db) {
                          try {
                              showToast("অ্যাকাউন্ট ভেরিফাই করা হচ্ছে...", "info");
                              const snap = await window.db.collection('bexo_users').get();
                              let firestoreDuplicate = false;
                              snap.forEach(doc => {
                                  const data = doc.data();
                                  if (data) {
                                      if (data.phone && normalizePhone(data.phone) === normalizedInputPhone) {
                                          firestoreDuplicate = 'phone';
                                      } else if (data.email && email && data.email.toLowerCase().trim() === email.toLowerCase().trim()) {
                                          firestoreDuplicate = 'email';
                                      }
                                  }
                              });
                              if (firestoreDuplicate === 'phone') {
                                  showToast("এই ফোন নম্বর দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");
                                  return;
                              }
                              if (firestoreDuplicate === 'email') {
                                  showToast("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error");
                                  return;
                              }
                          } catch(e) {
                              console.error("Firestore duplicate check failed:", e);
                          }
                      }`;

html = html.replace(oldHandleRegister, newHandleRegister);
html = html.replace(/function handleRegister\(\)/g, "async function handleRegister()");

fs.writeFileSync('index.html', html);
console.log("Fixes applied.");
