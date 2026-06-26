import fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');

const cleanupCode = `
              // Emergency Quota Cleanup - Shrinks bloated payloads on boot
              setTimeout(() => {
                  try {
                      if (typeof appOrders !== 'undefined' && appOrders.length > 0) saveOrders();
                      if (typeof userProfile !== 'undefined' && userProfile && userProfile.profileId) saveProfile();
                  } catch(e) { console.error("Boot cleanup failed:", e); }
              }, 3000);
`;

content = content.replace(/let appWithdrawals = JSON\.parse/, cleanupCode + '\n              let appWithdrawals = JSON.parse');

fs.writeFileSync('index.html', content);
console.log("Added cleanup code");
