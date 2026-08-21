import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'if \(window\.supabase\) \{\s*window\.supabase\.auth\.signInWithOtp\(\{([\s\S]*?)\}\)\.then\(res => \{\s*if \(res\.error\) alert\("OTP Sending failed: " \+ res\.error\.message\);\s*\}\);\s*\} else \{\s*console\.log\("Supabase is not loaded\. Simulating OTP send\."\);\s*\}',
    r'''if (!window.supabase) return alert("Supabase is not initialized. Check your environment variables.");
                  window.supabase.auth.signInWithOtp({\1}).then(res => {
                      if (res.error) alert("OTP Sending failed: " + res.error.message);
                  });''',
    content
)

content = re.sub(
    r'if \(window\.supabase\) \{\s*window\.supabase\.auth\.verifyOtp\(\{([\s\S]*?)\}\)\.then\(res => \{\s*if \(res\.error\) \{\s*alert\("Invalid OTP: " \+ res\.error\.message\);\s*btn\.innerHTML = \'ভেরিফাই করুন <i class="fas fa-check-circle"></i>\';\s*btn\.disabled = false;\s*\} else \{\s*completeEmailVerification\(email\);\s*\}\s*\}\);\s*\} else \{\s*// Simulate verification delay\s*setTimeout\(\(\) => \{\s*completeEmailVerification\(email\);\s*\}, 1000\);\s*\}',
    r'''if (!window.supabase) return alert("Supabase is not initialized.");
                  window.supabase.auth.verifyOtp({\1}).then(res => {
                      if (res.error) {
                          alert("Invalid OTP: " + res.error.message);
                          btn.innerHTML = 'ভেরিফাই করুন <i class="fas fa-check-circle"></i>';
                          btn.disabled = false;
                      } else {
                          completeEmailVerification(email);
                      }
                  });''',
    content
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched OTP logic regex")
