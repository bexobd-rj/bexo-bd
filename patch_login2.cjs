const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /if \(sb && sb\.auth\) \{\s*const creds = \{ password: cleanPass \};\s*if \(isEmail\) creds\.email = cleanIdentifier;\s*else creds\.phone = cleanIdentifier;\s*try \{\s*const \{ data, error \} = await sb\.auth\.signInWithPassword\(creds\);\s*if \(!error && data\) \{\s*authSuccess = true;\s*\}\s*\} catch \(e\) \{\s*console\.warn\('Supabase auth login exception:', e\);\s*\}\s*\}/m;

const replacementStr = `if (sb && sb.auth) {
                       const creds = { password: cleanPass };
                       if (isEmail) {
                           creds.email = cleanIdentifier;
                       } else {
                           // If logging in with phone, Supabase auth might fail because phone is not verified.
                           // Use the email from matchedUser if available.
                           if (matchedUser && matchedUser.email) {
                               creds.email = matchedUser.email.toLowerCase();
                           } else {
                               creds.phone = cleanIdentifier;
                           }
                       }
                       
                       try {
                           const { data, error } = await sb.auth.signInWithPassword(creds);
                           if (!error && data && data.session) {
                               authSuccess = true;
                           } else {
                               // Fallback: If auth fails, try to login with magic link/otp? No, it's a password login.
                               console.warn('Supabase auth login failed:', error?.message);
                           }
                       } catch (e) {
                           console.warn('Supabase auth login exception:', e);
                       }
                   }`;

if (regex.test(code)) {
    code = code.replace(regex, replacementStr);
    fs.writeFileSync('public/app.js', code);
    console.log("Success: Patched handleLogin phone lookup");
} else {
    console.log("Error: Target string not found.");
}
