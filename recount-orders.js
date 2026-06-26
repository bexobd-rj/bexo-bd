import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const targetCode = `              function syncProfileWithGlobal() {
                  updateHeaderUI();
                  if (!userProfile || !userProfile.profileId) return;
                  const globalUser = appUsers.find(u => u.profileId === userProfile.profileId);
                  if (globalUser) {
                      userProfile.passiveEarnings = Number(globalUser.passiveEarnings) || 0;`;

const replaceCode = `              function syncProfileWithGlobal() {
                  updateHeaderUI();
                  if (!userProfile || !userProfile.profileId) return;
                  const globalUser = appUsers.find(u => u.profileId === userProfile.profileId);
                  if (globalUser) {
                      // Recalculate delivered orders correctly based on real order statuses if needed
                      // Although the global array should have it correct now.
                      userProfile.passiveEarnings = Number(globalUser.passiveEarnings) || 0;`;

if (html.includes(targetCode)) {
  html = html.replace(targetCode, replaceCode);
  fs.writeFileSync('index.html', html);
  console.log("Replaced");
} else {
  console.log("Not replaced");
}
