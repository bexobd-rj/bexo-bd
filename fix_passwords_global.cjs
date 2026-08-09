const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Rewrite saveNewPassword to update all duplicates, remove the alert from it, and handle the admin view separately.
const oldSaveNewPasswordRegex = /function saveNewPassword\(profileId, newPass\) \{[\s\S]*?viewUserProfileInAdmin\(profileId\);\s*\}/;

const newSaveNewPassword = `function updateAllDuplicateAccountsPassword(profileId, newPass) {
                  const targetUser = appUsers.find(u => String(u.profileId) === String(profileId));
                  if (!targetUser) return;
                  
                  const targetPhone = targetUser.phone ? normalizePhone(targetUser.phone) : '';
                  const targetEmail = targetUser.email ? targetUser.email.toLowerCase().trim() : '';
                  
                  let updatedIds = [];
                  appUsers.forEach(u => {
                      const p = u.phone ? normalizePhone(u.phone) : '';
                      const e = u.email ? u.email.toLowerCase().trim() : '';
                      
                      if ((p && targetPhone && p === targetPhone) || (e && targetEmail && e === targetEmail)) {
                          u.password = newPass;
                          updatedIds.push(u.profileId);
                      }
                  });
                  
                  if (updatedIds.length > 0) {
                      saveUsers(updatedIds);
                  }
                  
                  if (userProfile && updatedIds.includes(userProfile.profileId)) {
                      userProfile.password = newPass;
                      saveProfile();
                  }
              }

              function saveNewPassword(profileId, newPass) {
                  updateAllDuplicateAccountsPassword(profileId, newPass);
                  alert("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।");
                  if (typeof viewUserProfileInAdmin === 'function') {
                      viewUserProfileInAdmin(profileId);
                  }
              }`;

html = html.replace(oldSaveNewPasswordRegex, newSaveNewPassword);

// 2. Rewrite updatePassword
const oldUpdatePasswordRegex = /function updatePassword\(\) \{[\s\S]*?confirmNewPassField\.value = '';\s*\}/;
const newUpdatePassword = `function updatePassword() {
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

                  // Update password across all duplicate accounts
                  updateAllDuplicateAccountsPassword(userProfile.profileId, newPass);
                  
                  // Keep updateAppUsersList for full profile sync if needed, but password is now handled
                  userProfile.password = newPass;
                  updateAppUsersList(userProfile);
                  
                  showToast("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!", "success");

                  oldPassField.value = '';
                  newPassField.value = '';
                  confirmNewPassField.value = '';
              }`;

html = html.replace(oldUpdatePasswordRegex, newUpdatePassword);

fs.writeFileSync('index.html', html);
console.log("Fixed duplicate password updates");
