const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `                           } else if (window._tempAuthUser.user_metadata && window._tempAuthUser.user_metadata.profileId) {
                               matchedUser = {
                                   ...DEFAULT_PROFILE,
                                   ...window._tempAuthUser.user_metadata,
                                   email: window._tempAuthUser.email || cleanIdentifier
                               };
                           }`;

const replacement = `                           } else if (window._tempAuthUser.user_metadata && window._tempAuthUser.user_metadata.profileId) {
                               matchedUser = {
                                   ...DEFAULT_PROFILE,
                                   ...window._tempAuthUser.user_metadata,
                                   email: window._tempAuthUser.email || cleanIdentifier
                               };
                           } else {
                               // GHOST USER FALLBACK: They have an Auth record but no DB record and no profileId metadata!
                               // We must assign them a permanent profileId based on their Auth ID or generate one and save it.
                               const newProfileId = 'BX-' + Math.floor(100000 + Math.random() * 900000);
                               matchedUser = {
                                   ...DEFAULT_PROFILE,
                                   email: window._tempAuthUser.email || (isEmail ? cleanIdentifier : ''),
                                   phone: window._tempAuthUser.phone || (!isEmail ? cleanIdentifier : ''),
                                   fullName: (window._tempAuthUser.email || cleanIdentifier).split('@')[0],
                                   profileId: newProfileId,
                                   password: cleanPass
                               };
                               // Immediately save to metadata so they never lose this profileId again
                               sb.auth.updateUser({ data: { profileId: newProfileId } }).catch(()=>{});
                           }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('index.html', code);
    console.log("Patched ghost user fallback!");
} else {
    console.log("Target not found!");
}
