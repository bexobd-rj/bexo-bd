const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newUpdatePass = `              function updatePassword() {
                  const oldPassField = document.getElementById('oldPass');
                  const newPassField = document.getElementById('newPass');
                  const confirmNewPassField = document.getElementById('confirmNewPass');
                  if (!oldPassField || !newPassField || !confirmNewPassField) return;

                  let oldPass = oldPassField.value;
                  let newPass = newPassField.value;
                  let confirmNewPass = confirmNewPassField.value;

                  const bMap = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
                  oldPass = oldPass.replace(/[০-৯]/g, d => bMap[d] || d);
                  newPass = newPass.replace(/[০-৯]/g, d => bMap[d] || d);
                  confirmNewPass = confirmNewPass.replace(/[০-৯]/g, d => bMap[d] || d);

                  // Normalize userProfile.password for safety comparison
                  const profilePass = String(userProfile.password || '').replace(/[০-৯]/g, d => bMap[d] || d);

                  if (oldPass !== profilePass) {
                      showToast("বর্তমান পাসওয়ার্ড সঠিক নয়!", "error");
                      return;
                  }

                  if (newPass.length < 4) {
                      showToast("পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!", "error");
                      return;
                  }

                  if (newPass !== confirmNewPass) {
                      showToast("নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড ম্যাচ করেনি!", "error");
                      return;
                  }

                  // Use saveNewPassword to ensure all duplicate accounts with same phone/email are synced
                  saveNewPassword(userProfile.profileId, newPass);
                  
                  updateAppUsersList(userProfile); // To update other profile info just in case
                  showToast("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!", "success");

                  oldPassField.value = '';
                  newPassField.value = '';
                  confirmNewPassField.value = '';
              }`;

html = html.replace(/function updatePassword\(\) \{[\s\S]*?confirmNewPassField\.value = '';\n              \}/, newUpdatePass);
fs.writeFileSync('index.html', html);
console.log("Updated updatePassword successfully.");
