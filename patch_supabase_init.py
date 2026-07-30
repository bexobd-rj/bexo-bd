import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_script = """    <script>
      // Placeholder Supabase init. In a real app, these values would come from environment variables.
      window.onload = () => {
         if (window.supabase) {
             const supabaseUrl = 'https://your-project-id.supabase.co';
             const supabaseKey = 'your-anon-key';
             window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
         }
      };
    </script>"""

new_script = """    <script type="module">
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

content = content.replace(old_script, new_script)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched supabase init")
