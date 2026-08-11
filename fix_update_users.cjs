const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newUpdateUsersList = `function updateAppUsersList(profile) {
                  if (!profile || !profile.phone || !profile.password) {
                      return;
                  }
                  if (!Array.isArray(appUsers)) {
                      appUsers = [];
                  }
                  
                  // Ensure profile has a valid profileId
                  if (!profile.profileId) {
                      profile.profileId = 'BX-' + Math.floor(100000 + Math.random() * 900000);
                  }

                  const idx = appUsers.findIndex(u => u.profileId && u.profileId === profile.profileId);
                  const userData = {
                      uid: profile.uid || '',
                      profileId: profile.profileId,
                      avatar: profile.avatar || '',
                      fullName: profile.fullName,
                      shopName: profile.shopName || '',
                      sellerCode: profile.sellerCode,
                      phone: profile.phone,
                      email: profile.email || '',
                      fbPage: profile.fbPage || '',
                      website: profile.website || '',
                      district: profile.district || '',
                      address: profile.address || '',
                      password: profile.password || '',
                      referredBy: profile.referredBy,
                      isPremium: profile.isPremium || false,
                      isSubscribed: profile.isSubscribed || false,
                      currentPlan: profile.currentPlan || 'Free Plan',
                      favorites: profile.favorites || [],
                      cart: profile.cart || [],
                      rechargeBalance: Number(profile.rechargeBalance) || 0,
                      totalRecharge: Number(profile.totalRecharge) || 0,
                      totalBillPay: Number(profile.totalBillPay) || 0,
                      totalCommission: Number(profile.totalCommission) || 0,
                      rechargeTransactions: profile.rechargeTransactions || [],
                      passiveEarnings: Number(profile.passiveEarnings) || 0,
                      passiveTransactions: profile.passiveTransactions || [],
                      referrals: profile.referrals || { level1: [], level2: [], level3: [], level4: [] },
                      deliveredOrdersCount: Number(profile.deliveredOrdersCount) || 0,
                      hasPremiumCourse: profile.hasPremiumCourse || false,
                      hasWebsite: profile.hasWebsite || false,
                      lastActive: profile.lastActive || 'Never',
                      joinDate: profile.joinDate || new Date().toLocaleDateString('bn-BD'),
                      createdAt: profile.createdAt || Date.now(),
                      notifications: profile.notifications || []
                  };

                  if (idx > -1) {
                      appUsers[idx] = { ...appUsers[idx], ...userData };
                   } else {
                      appUsers.push(userData);
                   }
                   saveUsers(userData.profileId);
                  if (window.db) {
                      const docId = userData.uid ? String(userData.uid) : String(userData.profileId);
                      window.db.collection('bexo_users').doc(docId).set(sanitizeForFirestore(userData))
                          .catch(err => {
                              console.error("Firebase update user error:", err);
                              if (typeof queueUserForSync === 'function') {
                                  queueUserForSync(userData.profileId);
                              }
                          });
                  } else {
                      if (typeof queueUserForSync === 'function') {
                          queueUserForSync(userData.profileId);
                      }
                      if (typeof initializeFirebaseIfReady === 'function') {
                          initializeFirebaseIfReady();
                      }
                  }
              }`;

const regex = /function updateAppUsersList\(profile\) \{[\s\S]*?\}\s*(?=\n\s*function loadAccounts)/;
html = html.replace(regex, newUpdateUsersList);
fs.writeFileSync('index.html', html);
console.log("Fixed updateAppUsersList");
