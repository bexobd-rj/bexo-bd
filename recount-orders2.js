import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                  if (globalUser) {
                      userProfile.passiveEarnings = Number(globalUser.passiveEarnings) || 0;`;

const replaceStr = `                  if (globalUser) {
                      // Recount delivered orders directly from appOrders to be 100% accurate
                      let correctCount = 0;
                      if (typeof appOrders !== 'undefined' && Array.isArray(appOrders)) {
                          correctCount = appOrders.filter(o => 
                              o.profileId === userProfile.profileId && 
                              (o.status === 'Completed' || o.status === 'Delivered' || o.status === 'Delivery Completed')
                          ).length;
                      }
                      
                      const finalCount = Math.max(Number(globalUser.deliveredOrdersCount) || 0, correctCount);
                      globalUser.deliveredOrdersCount = finalCount;
                      
                      userProfile.passiveEarnings = Number(globalUser.passiveEarnings) || 0;`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replaceStr);
    fs.writeFileSync('index.html', html);
    console.log("Recount logic injected into syncProfileWithGlobal!");
} else {
    console.log("Target string not found for recount logic");
}
