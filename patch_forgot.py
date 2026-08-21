import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# the logic inside showForgotPasswordModal
# currently uses fetch("/api/send-verification-email")

# Let's replace the fetch calls with Supabase if window.supabase exists.

replacement_send = """
                              try {
                                  if (window.supabase) {
                                      const { error } = await window.supabase.auth.resetPasswordForEmail(val);
                                      if (error) throw error;
                                  } else {
                                      const res = await fetch("/api/send-verification-email", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ email: val }) // using val directly
                                      });
                                      if (!res.ok) throw new Error("কোড পাঠানো ব্যর্থ হয়েছে");
                                  }
                                  
                                  showToast("আপনার ঠিকানায় একটি ভেরিফিকেশন কোড পাঠানো হয়েছে!", "success");
                                  currentStep = 2;
                                  renderContent();
                              } catch(e) {
                                  showToast(e.message, "error");
                                  btn.innerText = 'কোড পাঠান';
                                  btn.disabled = false;
                              }
"""

# Let's write a script to replace the fetch calls securely.
# Actually, since I have full access to index.html, it's easier to replace the entire showForgotPasswordModal function.

# Let's extract the old function.
start_str = "function showForgotPasswordModal() {"
# find the closing brace.
# since it's hard with regex to match braces perfectly in python, I'll just use a small hack or replace specific parts.
