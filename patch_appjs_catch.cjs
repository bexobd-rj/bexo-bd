const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const target = `                                   sb.from('bexo_users').upsert({
                                       id: activeUid,
                                       profileId: matchedUser.profileId,
                                       email: matchedUser.email,
                                       phone: matchedUser.phone,
                                       "fullName": matchedUser.fullName,
                                       "shopName": matchedUser.shopName,
                                       role: matchedUser.role
                                   }, { onConflict: 'id' }).then(() => console.log('Recreated missing user profile')).catch(e => console.warn('Recreate user profile failed:', e));
                               });`;

const repl = `                                   sb.from('bexo_users').upsert({
                                       id: activeUid,
                                       profileId: matchedUser.profileId,
                                       email: matchedUser.email,
                                       phone: matchedUser.phone,
                                       "fullName": matchedUser.fullName,
                                       "shopName": matchedUser.shopName,
                                       role: matchedUser.role
                                   }, { onConflict: 'id' }).then(() => console.log('Recreated missing user profile')).catch(e => console.warn('Recreate user profile failed:', e));
                               }).catch(e => console.warn('Failed to get user metadata for recreation:', e));`;

code = code.replace(target, repl);
fs.writeFileSync('public/app.js', code);
