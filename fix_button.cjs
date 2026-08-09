const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Add ID to button
html = html.replace(/<button\s+type="submit"\s+class="sm:col-span-2 w-full/g, '<button id="regSubmitBtn" type="submit" class="sm:col-span-2 w-full');

// Add disable/enable logic
const oldHandleRegisterStart = `async function handleRegister() {
                  try {
                      const shopField = document.getElementById('regShop');`;

const newHandleRegisterStart = `async function handleRegister() {
                  try {
                      const regBtn = document.getElementById('regSubmitBtn');
                      if (regBtn) {
                          regBtn.disabled = true;
                          regBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> অ্যাকাউন্ট তৈরি হচ্ছে...';
                      }

                      const shopField = document.getElementById('regShop');`;

html = html.replace(oldHandleRegisterStart, newHandleRegisterStart);

// Add enable logic on error (all the returns inside handleRegister)
html = html.replace(/showToast\((.*?)\);\s*return;/g, "showToast($1);\nif(document.getElementById('regSubmitBtn')) { document.getElementById('regSubmitBtn').disabled = false; document.getElementById('regSubmitBtn').innerHTML = '<i class=\"fas fa-user-plus\"></i> অ্যাকাউন্ট তৈরি করুন'; }\nreturn;");

fs.writeFileSync('index.html', html);
console.log("Fixes applied.");
