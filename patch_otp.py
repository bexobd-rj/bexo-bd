import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace showRegOtpModal's auth section
old_otp_send = """                  if (window.supabase) {
                      window.supabase.auth.signInWithOtp({
                          email: email,
                          options: { shouldCreateUser: true }
                      }).then(res => {
                          if (res.error) alert("OTP Sending failed: " + res.error.message);
                      });
                  } else {
                      console.log("Supabase is not loaded. Simulating OTP send.");
                  }"""

new_otp_send = """                  if (!window.supabase) {
                      return alert("Supabase is not initialized. Check your environment variables.");
                  }
                  window.supabase.auth.signInWithOtp({
                      email: email,
                      options: { shouldCreateUser: true }
                  }).then(res => {
                      if (res.error) alert("OTP Sending failed: " + res.error.message);
                  });"""

content = content.replace(old_otp_send, new_otp_send)

# Replace verifyRegOtp's auth section
old_otp_verify = """                  if (window.supabase) {
                      window.supabase.auth.verifyOtp({
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
                      });
                  } else {
                      // Simulate verification delay
                      setTimeout(() => {
                          completeEmailVerification(email);
                      }, 1000);
                  }"""

new_otp_verify = """                  if (!window.supabase) {
                      return alert("Supabase is not initialized.");
                  }
                  window.supabase.auth.verifyOtp({
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
                  });"""

content = content.replace(old_otp_verify, new_otp_verify)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched OTP logic")
