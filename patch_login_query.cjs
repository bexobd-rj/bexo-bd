const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `                   if (authSuccess && window._tempAuthUser && !matchedUser) {
                       try {
                           const targetEmail = isEmail ? cleanIdentifier : window._tempAuthUser.email;
                           let query = sb.from('bexo_users').select('*');
                           if (isEmail) query = query.eq('email', cleanIdentifier);
                           else query = query.eq('phone', cleanIdentifier);
                           
                           const { data: dbUser } = await query.maybeSingle();
                           if (dbUser) {
                               matchedUser = dbUser;
                           } else if (window._tempAuthUser.user_metadata && window._tempAuthUser.user_metadata.profileId) {
                               matchedUser = {
                                   ...DEFAULT_PROFILE,
                                   ...window._tempAuthUser.user_metadata,
                                   email: window._tempAuthUser.email || cleanIdentifier
                               };
                           }
                       } catch(e) {
                           console.warn('Direct fetch from supabase failed', e);
                       }
                   }`;

const replacement = `                   if (authSuccess && window._tempAuthUser && !matchedUser) {
                       try {
                           const targetEmail = isEmail ? cleanIdentifier : window._tempAuthUser.email;
                           let query = sb.from('bexo_users').select('*');
                           
                           if (isEmail) {
                               query = query.ilike('email', cleanIdentifier);
                           } else {
                               // Phone numbers might be saved with or without +88
                               let p = cleanIdentifier;
                               if (p.startsWith('01')) p = '+88' + p;
                               query = query.or(\`phone.eq.\${cleanIdentifier},phone.eq.\${p}\`);
                           }
                           
                           const { data: dbUsers, error } = await query.limit(1);
                           if (!error && dbUsers && dbUsers.length > 0) {
                               matchedUser = dbUsers[0];
                           } else if (window._tempAuthUser.user_metadata && window._tempAuthUser.user_metadata.profileId) {
                               matchedUser = {
                                   ...DEFAULT_PROFILE,
                                   ...window._tempAuthUser.user_metadata,
                                   email: window._tempAuthUser.email || cleanIdentifier
                               };
                           }
                       } catch(e) {
                           console.warn('Direct fetch from supabase failed', e);
                       }
                   }`;

code = code.replace(target, replacement);

fs.writeFileSync('index.html', code);
console.log("Patched login query");
