const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(/sb\.auth\.verifyOtp\(\{\s*email: email,\s*token: otp,\s*type: 'email'\s*\}\)/g, "sb.auth.verifyOtp({ email: email, token: otp, type: 'magiclink' })");

// Add catch block for the promise
code = code.replace(/completeEmailVerification\(email\);\s*\}\s*\}\);/g, "completeEmailVerification(email);\n                      }\n                  }).catch(err => {\n                      alert('Error verifying OTP: ' + err.message);\n                      btn.innerHTML = 'ভেরিফাই করুন <i class=\"fas fa-check-circle\"></i>';\n                      btn.disabled = false;\n                  });");

fs.writeFileSync('public/app.js', code);
console.log('Fixed verifyRegOtp via Regex');
