import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace send-verification-email
old_send = """                              try {
                                  const res = await fetch("/api/send-verification-email", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ email: foundUser.email })
                                  });
                                  
                                  let data;
                                  try {
                                      data = await res.json();
                                  } catch (e) {
                                      throw new Error("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না");
                                  }
                                  if (!res.ok) {
                                      throw new Error(data.error || "কোড পাঠানো ব্যর্থ হয়েছে");
                                  }
                                  
                                  showToast("আপনার ঠিকানায় একটি ভেরিফিকেশন কোড পাঠানো হয়েছে!", "success");
                                  currentStep = 2;
                                  renderContent();
                              }"""

new_send = """                              try {
                                  if (window.supabase) {
                                      const { error } = await window.supabase.auth.resetPasswordForEmail(foundUser.email);
                                      if (error) throw error;
                                  } else {
                                      const res = await fetch("/api/send-verification-email", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ email: foundUser.email })
                                      });
                                      if (!res.ok) throw new Error("কোড পাঠানো ব্যর্থ হয়েছে");
                                  }
                                  
                                  showToast("আপনার ঠিকানায় একটি ভেরিফিকেশন কোড পাঠানো হয়েছে!", "success");
                                  currentStep = 2;
                                  renderContent();
                              }"""

content = content.replace(old_send, new_send)

# Replace verify-email-code
old_verify = """                              try {
                                  const res = await fetch("/api/verify-email-code", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ email: foundUser.email, code })
                                  });
                                  let data;
                                  try {
                                      data = await res.json();
                                  } catch (e) {
                                      throw new Error("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না");
                                  }
                                  if (!res.ok) {
                                      throw new Error(data.error || "ভুল কোড দেয়া হয়েছে");
                                  }
                                  showToast("কোড সফলভাবে ভেরিফাই হয়েছে!", "success");
                                  currentStep = 3;
                                  renderContent();
                              }"""

new_verify = """                              try {
                                  if (window.supabase) {
                                      const { error } = await window.supabase.auth.verifyOtp({
                                          email: foundUser.email, token: code, type: 'recovery'
                                      });
                                      if (error) throw error;
                                  } else {
                                      const res = await fetch("/api/verify-email-code", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ email: foundUser.email, code })
                                      });
                                      if (!res.ok) throw new Error("ভুল কোড দেয়া হয়েছে");
                                  }
                                  showToast("কোড সফলভাবে ভেরিফাই হয়েছে!", "success");
                                  currentStep = 3;
                                  renderContent();
                              }"""

content = content.replace(old_verify, new_verify)

# Replace update-password
old_reset = """                              try {
                                  const res = await fetch("/api/update-password", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ email: foundUser.email, newPassword: pass1 })
                                  });
                                  let data;
                                  try {
                                      data = await res.json();
                                  } catch (e) {
                                      throw new Error("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না");
                                  }
                                  if (!res.ok) {
                                      throw new Error(data.error || "পাসওয়ার্ড আপডেট করা যায়নি");
                                  }
                                  
                                  showToast("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!", "success");
                                  modal.remove();
                                  
                                  // Optional: Auto login logic
                                  setTimeout(() => {
                                      const auth = document.getElementById('authSection');
                                      const dash = document.getElementById('dashboardSection');
                                      if (auth && dash) {
                                          auth.classList.add('hidden');
                                          dash.classList.remove('hidden');
                                          loadProducts();
                                      }
                                  }, 1000);
                              }"""

new_reset = """                              try {
                                  if (window.supabase) {
                                      const { error } = await window.supabase.auth.updateUser({ password: pass1 });
                                      if (error) throw error;
                                  } else {
                                      const res = await fetch("/api/update-password", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ email: foundUser.email, newPassword: pass1 })
                                      });
                                      if (!res.ok) throw new Error("পাসওয়ার্ড আপডেট করা যায়নি");
                                  }
                                  
                                  showToast("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!", "success");
                                  modal.remove();
                                  
                                  setTimeout(() => {
                                      const auth = document.getElementById('authSection');
                                      const dash = document.getElementById('dashboardSection');
                                      if (auth && dash) {
                                          auth.classList.add('hidden');
                                          dash.classList.remove('hidden');
                                          // loadProducts();
                                      }
                                  }, 1000);
                              }"""

content = content.replace(old_reset, new_reset)

# Also check for "appUsers" validation inside step 1. If it's real Supabase, we might not have `appUsers` containing all users.
# We should probably bypass `appUsers.find()` if we are using Supabase.
app_users_logic = """                              foundUser = appUsers.find(u => {
                                  return u.email && (u.email.toLowerCase().trim() === val.toLowerCase().trim());
                              });
                              if (!foundUser) {
                                  return showToast("এই ইমেইলের কোনো ইউজার পাওয়া যায়নি!", "error");
                              }
                              
                              identifier = val;"""
                              
new_app_users_logic = """                              if (window.supabase) {
                                  foundUser = { email: val }; // Trust supabase to validate it
                              } else {
                                  foundUser = appUsers.find(u => {
                                      return u.email && (u.email.toLowerCase().trim() === val.toLowerCase().trim());
                                  });
                                  if (!foundUser) {
                                      return showToast("এই ইমেইলের কোনো ইউজার পাওয়া যায়নি!", "error");
                                  }
                              }
                              identifier = val;"""

content = content.replace(app_users_logic, new_app_users_logic)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished patching forgot password")
