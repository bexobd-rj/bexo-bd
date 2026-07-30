const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace Step 1 UI
html = html.replace(
    /<p class="text-sm text-slate-500 mt-1">আপনার ইমেইল অথবা মোবাইল নম্বর দিন<\/p>/g,
    '<p class="text-sm text-slate-500 mt-1">আপনার জিমেইল/ইমেইল দিন</p>'
);
html = html.replace(
    /<input type="text" id="fpIdentifier" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-3" placeholder="ইমেইল \/ মোবাইল নম্বর" required>/g,
    '<input type="email" id="fpIdentifier" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block px-4 py-3" placeholder="আপনার জিমেইল/ইমেইল" required>'
);

// Modify fpBtnNext Logic
const oldFpNextLogic = `modal.querySelector('#fpBtnNext').addEventListener('click', async () => {
                              const val = modal.querySelector('#fpIdentifier').value.trim();
                              if (!val) return showToast("ইমেইল অথবা মোবাইল নম্বর দিন", "error");
                              
                              const bMap = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
                              const normVal = val.replace(/[০-৯]/g, d => bMap[d] || d);
                              const normPhone = typeof normalizePhone === 'function' ? normalizePhone(normVal) : normVal;

                              foundUser = appUsers.find(u => {
                                  const dbPhone = typeof normalizePhone === 'function' ? normalizePhone(u.phone) : u.phone;
                                  const isPhoneMatch = dbPhone && normPhone && (dbPhone === normPhone);
                                  const isEmailMatch = u.email && normVal && (u.email.toLowerCase().trim() === normVal.toLowerCase().trim());
                                  return isPhoneMatch || isEmailMatch;
                              });

                              if (!foundUser) {
                                  return showToast("এই তথ্যের কোনো ইউজার পাওয়া যায়নি!", "error");
                              }
                              
                              identifier = normVal;
                              const btn = modal.querySelector('#fpBtnNext');
                              btn.innerText = 'পাঠানো হচ্ছে...';
                              btn.disabled = true;

                              try {
                                  let res;
                                  if (identifier.includes('@')) {
                                      res = await fetch("/api/send-verification-email", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ email: foundUser.email })
                                      });
                                  } else {
                                      res = await fetch("/api/send-phone-otp", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ phone: foundUser.phone })
                                      });
                                  }
`;
const newFpNextLogic = `modal.querySelector('#fpBtnNext').addEventListener('click', async () => {
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
`;
html = html.replace(oldFpNextLogic, newFpNextLogic);


// Modify fpBtnVerify Logic
const oldFpVerifyLogic = `modal.querySelector('#fpBtnVerify').addEventListener('click', async () => {
                              const code = modal.querySelector('#fpCode').value.trim();
                              if (code.length < 4) return showToast("সঠিক কোড দিন", "error");
                              
                              const btn = modal.querySelector('#fpBtnVerify');
                              btn.innerText = 'ভেরিফাই হচ্ছে...';
                              btn.disabled = true;

                              try {
                                  let res;
                                  if (identifier.includes('@')) {
                                      res = await fetch("/api/verify-email-code", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ email: foundUser.email, code })
                                      });
                                  } else {
                                      res = await fetch("/api/verify-phone-otp", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ phone: foundUser.phone, code })
                                      });
                                  }
`;

const newFpVerifyLogic = `modal.querySelector('#fpBtnVerify').addEventListener('click', async () => {
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
`;
html = html.replace(oldFpVerifyLogic, newFpVerifyLogic);

fs.writeFileSync('index.html', html);
