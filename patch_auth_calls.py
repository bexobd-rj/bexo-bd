import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update sendRegOtp
content = content.replace(
    'if (!window.supabase) {\n                      return alert("Supabase is not initialized. Check your environment variables.");\n                  }\n                  window.supabase.auth.signInWithOtp({',
    'const sb = window.getSupabase();\n                  if (!sb || !sb.auth) {\n                      return alert("Supabase is not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.");\n                  }\n                  sb.auth.signInWithOtp({'
)

# 2. Update verifyRegOtp
content = content.replace(
    'if (!window.supabase) return alert("Supabase is not initialized.");\n                  window.supabase.auth.verifyOtp({',
    'const sb = window.getSupabase();\n                  if (!sb || !sb.auth) return alert("Supabase is not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.");\n                  sb.auth.verifyOtp({'
)

# 3. Update handleLogin
content = content.replace(
    'if (!window.supabase) return showToast("Supabase is not initialized.", "error");\n                  window.supabase.auth.signInWithPassword(creds)',
    'const sb = window.getSupabase();\n                  if (!sb || !sb.auth) return showToast("Supabase setup incomplete. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.", "error", 6000);\n                  sb.auth.signInWithPassword(creds)'
)

# 4. Update showForgotPasswordModal step 1
content = content.replace(
    'if (!window.supabase) throw new Error("Supabase is not initialized.");\n                                  const { error } = await window.supabase.auth.resetPasswordForEmail(identifier);',
    'const sb = window.getSupabase();\n                                  if (!sb || !sb.auth) throw new Error("Supabase is not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.");\n                                  const { error } = await sb.auth.resetPasswordForEmail(identifier);'
)

# 5. Update showForgotPasswordModal step 2
content = content.replace(
    'if (!window.supabase) throw new Error("Supabase is not initialized.");\n                                  const { error } = await window.supabase.auth.verifyOtp({',
    'const sb = window.getSupabase();\n                                  if (!sb || !sb.auth) throw new Error("Supabase is not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.");\n                                  const { error } = await sb.auth.verifyOtp({'
)

# 6. Update showForgotPasswordModal step 3
content = content.replace(
    'if (!window.supabase) throw new Error("Supabase is not initialized.");\n                                  const { data, error } = await window.supabase.auth.updateUser({ password: np });',
    'const sb = window.getSupabase();\n                                  if (!sb || !sb.auth) throw new Error("Supabase is not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.");\n                                  const { data, error } = await sb.auth.updateUser({ password: np });'
)

# 7. Update OAuth
content = content.replace(
    'const { data, error } = await window.supabase.auth.signInWithOAuth({',
    'const sb = window.getSupabase();\n                          if (!sb || !sb.auth) return showToast("Supabase is not initialized.", "error");\n                          const { data, error } = await sb.auth.signInWithOAuth({'
)
content = content.replace(
    'window.supabase.auth.signInWithOAuth({',
    'const sb = window.getSupabase();\n                          if (sb && sb.auth) sb.auth.signInWithOAuth({'
)

# 8. Update DB transaction / database operations
content = re.sub(
    r'while \(!window\.supabase && attempts < 10\) \{',
    'while (!window.getSupabase() && attempts < 10) {',
    content
)
content = re.sub(
    r'if \(!window\.supabase\) \{(\s*throw new Error\("window\.supabase not found"\);)',
    'if (!window.getSupabase()) {\1',
    content
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched all auth calls in index.html")
