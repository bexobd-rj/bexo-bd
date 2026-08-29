const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regBlockRegex = /try \{\s*const \{ data: existDb, error: existErr \} = await sb\.from\('bexo_users'\)\.select\('email'\)\.eq\('email', email\.toLowerCase\(\)\)\.maybeSingle\(\);\s*if \(existDb\) \{\s*showToast\("এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে লগইন করুন।", "error", 6000\);\s*return;\s*\}\s*\} catch \(e\) \{\s*console\.warn\("Direct check failed", e\);\s*\}/m;

const regBlockReplacement = `// Bypassing local/db email check so users can re-sync Auth if needed
    // The OTP process will handle actual authentication.`;

if (regBlockRegex.test(code)) {
    code = code.replace(regBlockRegex, regBlockReplacement);
    fs.writeFileSync('public/app.js', code);
    console.log("Fixed reg block");
} else {
    console.log("Could not find reg block");
}
