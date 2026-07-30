import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'if \(window\.supabase\) \{\s*window\.supabase\.auth\.verifyOtp\(\{([\s\S]*?)\}\)\.then\(res => \{\s*if \(res\.error\) \{\s*alert\("Invalid OTP: " \+ res\.error\.message\);\s*btn\.innerHTML = \'ভেরিফাই করুন <i class="fas fa-check-circle"></i>\';\s*btn\.disabled = false;\s*\} else \{\s*completeEmailVerification\(email\);\s*\}\s*\}\);\s*\} else \{\s*console\.log\("Supabase is not loaded\. Simulating OTP verification\."\);\s*setTimeout\(\(\) => \{\s*completeEmailVerification\(email\);\s*\}, 1000\);\s*\}',
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
print("Patched OTP verify regex")
