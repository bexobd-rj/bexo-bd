import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the initial Supabase script in index.html
old_init_script = """    <!-- Supabase CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script type="module">
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase environment variables are missing! Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
      }
            // Wait for window.supabase to be available from the CDN script
      const initSupabase = setInterval(() => {
          if (window.supabase && typeof window.supabase.createClient === 'function') {
              window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
              clearInterval(initSupabase);
          }
      }, 50);
    </script>"""

new_init_script = """    <!-- Supabase CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script type="module">
      window.getSupabase = function() {
          if (window.supabaseClient && window.supabaseClient.auth) {
              return window.supabaseClient;
          }
          if (window.supabase && window.supabase.auth) {
              return window.supabase;
          }
          let supabaseUrl = "";
          let supabaseKey = "";
          try {
              if (typeof import.meta !== 'undefined' && import.meta.env) {
                  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
                  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
              }
          } catch(e) {}

          if (supabaseUrl && supabaseKey && window.supabase && typeof window.supabase.createClient === 'function') {
              try {
                  const client = window.supabase.createClient(supabaseUrl, supabaseKey);
                  window.supabaseClient = client;
                  window.supabase = client;
                  return client;
              } catch(e) {
                  console.error("[Supabase Init Error]:", e);
              }
          }
          return null;
      };

      // Auto-init loop
      const initSupabaseTimer = setInterval(() => {
          const client = window.getSupabase();
          if (client) clearInterval(initSupabaseTimer);
      }, 50);
    </script>"""

if old_init_script in content:
    content = content.replace(old_init_script, new_init_script)
    print("Replaced init script")
else:
    print("Warning: old_init_script not found exactly, doing regex replacement")
    content = re.sub(
        r'<!-- Supabase CDN -->\s*<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\s*<script type="module">[\s\S]*?</script>',
        new_init_script,
        content
    )

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patching complete.")
