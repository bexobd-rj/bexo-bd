const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const regex = /const formBtn = document\.querySelector\('#regStep1Form button\[type="submit"\]'\);\s*if \(formBtn\) \{\s*formBtn\.disabled = true;\s*formBtn\.innerHTML = '<i class="fas fa-spinner fa-spin"><\/i> পাঠানো হচ্ছে\.\.\.';\s*\}\s*const sb = window\.getSupabase\(\);/m;

const replacement = `const formBtn = document.querySelector('#regStep1Form button[type="submit"]');
    if (formBtn) {
        formBtn.disabled = true;
        formBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> পাঠানো হচ্ছে...';
    }
    // sb is already defined above`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('public/app.js', code);
    console.log("Fixed sb syntax error.");
} else {
    console.log("Could not find regex match.");
}
