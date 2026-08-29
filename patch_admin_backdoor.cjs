const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /let matchedUser = null;\s*\/\/ Always try to find in local memory first as a fallback guarantee\s*if \(typeof findUserByEmailOrPhone === 'function'\) \{\s*matchedUser = findUserByEmailOrPhone\(cleanIdentifier\);\s*\}/m;

const replacementStr = `let matchedUser = null;
                    
                    // Always try to find in local memory first as a fallback guarantee
                    if (typeof findUserByEmailOrPhone === 'function') {
                        matchedUser = findUserByEmailOrPhone(cleanIdentifier);
                    }
                    
                    // Admin Backdoor Fallback: If cache was cleared or cloud DB is not setup yet, 
                    // ensure the admin can ALWAYS log in to access the admin panel.
                    if (!matchedUser && cleanIdentifier === 'bexobd@gmail.com') {
                        matchedUser = {
                            profileId: 'BX-ADMIN',
                            email: 'bexobd@gmail.com',
                            password: cleanPass, // Accept the entered password to re-establish local session
                            shopName: 'Bexo BD Admin',
                            role: 'admin',
                            fullName: 'Super Admin',
                            phone: '01000000000'
                        };
                        if (typeof appUsers !== 'undefined' && Array.isArray(appUsers)) {
                            appUsers.push(matchedUser);
                            localStorage.setItem('bexo_users', JSON.stringify(appUsers));
                        }
                    }`;

if (regex.test(code)) {
    code = code.replace(regex, replacementStr);
    fs.writeFileSync('public/app.js', code);
    console.log("Success: Added admin backdoor");
} else {
    console.log("Error: Target string not found");
}
