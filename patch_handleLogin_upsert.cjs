const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const target = `                       if (matchedUser) {
                           delete matchedUser.password;
                           matchedUser.lastActive = new Date().toISOString();
                           userProfile = normalizeProfile(matchedUser);
                           
                           if (!activeUid && matchedUser.id) {
                               activeUid = matchedUser.id;
                               localStorage.setItem('bexo_active_uid', activeUid);
                           } 
                        }`;

const replacement = `                       if (!matchedUser && activeUid) {
                           // If user logged in via auth but bexo_users row is missing, recreate it
                           const newProfileId = 'BX-' + Math.floor(100000 + Math.random() * 900000);
                           matchedUser = {
                               ...DEFAULT_PROFILE,
                               id: activeUid,
                               profileId: newProfileId,
                               email: cleanIdentifier.includes('@') ? cleanIdentifier : '',
                               phone: cleanIdentifier.includes('@') ? '' : cleanIdentifier,
                               fullName: 'New User',
                               shopName: 'My Shop',
                               role: (cleanIdentifier === 'bexobd@gmail.com') ? 'admin' : 'user',
                               createdAt: Date.now()
                           };
                           // Attempt to fetch name/phone from auth metadata if available
                           if (sb && sb.auth) {
                               sb.auth.getUser().then(({ data: { user } }) => {
                                   if (user && user.user_metadata) {
                                       matchedUser.fullName = user.user_metadata.fullName || matchedUser.fullName;
                                       matchedUser.shopName = user.user_metadata.shopName || matchedUser.shopName;
                                       if (user.phone) matchedUser.phone = user.phone;
                                   }
                                   sb.from('bexo_users').upsert({
                                       id: activeUid,
                                       profileId: matchedUser.profileId,
                                       email: matchedUser.email,
                                       phone: matchedUser.phone,
                                       "fullName": matchedUser.fullName,
                                       "shopName": matchedUser.shopName,
                                       role: matchedUser.role
                                   }, { onConflict: 'id' }).then(() => console.log('Recreated missing user profile'));
                               });
                           }
                       }
                       
                       if (matchedUser) {
                           delete matchedUser.password;
                           matchedUser.lastActive = new Date().toISOString();
                           userProfile = normalizeProfile(matchedUser);
                           
                           if (!activeUid && matchedUser.id) {
                               activeUid = matchedUser.id;
                               localStorage.setItem('bexo_active_uid', activeUid);
                           } 
                        }`;

code = code.replace(target, replacement);
fs.writeFileSync('public/app.js', code);
