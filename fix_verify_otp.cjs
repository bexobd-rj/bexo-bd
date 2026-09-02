const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const oldVerifyOtp = `sb.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
    }).then(res => {
        if (res.error) {
            alert("Invalid OTP: " + res.error.message);
            btn.innerHTML = 'ভেরিফাই করুন <i class="fas fa-check-circle"></i>';
            btn.disabled = false;
        } else {
            completeEmailVerification(email);
        }
    });`;

const newVerifyOtp = `sb.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'magiclink' // using 'magiclink' for OTP sent via signInWithOtp
    }).then(res => {
        if (res.error) {
            // Also try 'signup' if 'magiclink' doesn't work, though magiclink is correct for signInWithOtp
            if (res.error.message.includes('type')) {
                return sb.auth.verifyOtp({ email: email, token: otp, type: 'signup' }).then(res2 => {
                    if (res2.error) {
                        alert("Invalid OTP: " + res2.error.message);
                        btn.innerHTML = 'ভেরিফাই করুন <i class="fas fa-check-circle"></i>';
                        btn.disabled = false;
                    } else {
                        completeEmailVerification(email);
                    }
                });
            }
            alert("Invalid OTP: " + res.error.message);
            btn.innerHTML = 'ভেরিফাই করুন <i class="fas fa-check-circle"></i>';
            btn.disabled = false;
        } else {
            completeEmailVerification(email);
        }
    }).catch(err => {
        alert("Error verifying OTP: " + err.message);
        btn.innerHTML = 'ভেরিফাই করুন <i class="fas fa-check-circle"></i>';
        btn.disabled = false;
    });`;

code = code.replace(oldVerifyOtp, newVerifyOtp);
fs.writeFileSync('public/app.js', code);
console.log('Fixed verifyRegOtp');
