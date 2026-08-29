const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /let matchedUser = null;[\s\S]*?if \(!matchedUser && window\.supabase\) \{/m;

const replacementStr = `let matchedUser = null;
                    
                    // Always try to find in local memory first as a fallback guarantee
                    if (typeof findUserByEmailOrPhone === 'function') {
                        matchedUser = findUserByEmailOrPhone(cleanIdentifier);
                    }

                    // If connected to cloud, try to get authoritative cloud data
                    if (window.supabase) {`;

if (regex.test(code)) {
    code = code.replace(regex, replacementStr);
    fs.writeFileSync('public/app.js', code);
    console.log("Success: Patched login fallback");
} else {
    console.log("Error: Target string not found");
}
