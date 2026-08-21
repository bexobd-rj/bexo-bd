import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'if \(window\.supabase\) \{\s*window\.supabase\.auth\.signInWithPassword\(creds\)\s*\.then\(\(\{ data, error \}\) => \{\s*if \(error\) \{\s*showToast\(\'লগইন ব্যর্থ: \' \+ error\.message, \'error\'\);\s*btn\.innerHTML = \'<i class="fas fa-sign-in-alt"></i> প্রবেশ করুন\';\s*btn\.disabled = false;\s*\} else \{\s*showToast\(\'সফলভাবে লগইন হয়েছে!\', \'success\'\);\s*document\.getElementById\(\'authSection\'\)\.classList\.add\(\'hidden\'\);\s*document\.getElementById\(\'dashboardSection\'\)\.classList\.remove\(\'hidden\'\);\s*// Do whatever app initialization is needed\s*\}\s*\}\);\s*\} else \{\s*// Fallback if no supabase\s*setTimeout\(\(\) => \{\s*showToast\(\'সফলভাবে লগইন হয়েছে!\', \'success\'\);\s*document\.getElementById\(\'authSection\'\)\.classList\.add\(\'hidden\'\);\s*document\.getElementById\(\'dashboardSection\'\)\.classList\.remove\(\'hidden\'\);\s*\}, 1000\);\s*\}',
    r'''if (!window.supabase) return showToast("Supabase is not initialized.", "error");
                  window.supabase.auth.signInWithPassword(creds)
                  .then(({ data, error }) => {
                      if (error) {
                          showToast('লগইন ব্যর্থ: ' + error.message, 'error');
                          btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> প্রবেশ করুন';
                          btn.disabled = false;
                      } else {
                          showToast('সফলভাবে লগইন হয়েছে!', 'success');
                          document.getElementById('authSection').classList.add('hidden');
                          document.getElementById('dashboardSection').classList.remove('hidden');
                      }
                  });''',
    content
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched login regex")
