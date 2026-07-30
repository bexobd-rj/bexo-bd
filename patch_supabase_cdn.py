import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

cdn_script = """
    <!-- Supabase CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
      // Placeholder Supabase init. In a real app, these values would come from environment variables.
      window.onload = () => {
         if (window.supabase) {
             const supabaseUrl = 'https://your-project-id.supabase.co';
             const supabaseKey = 'your-anon-key';
             window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
         }
      };
    </script>
"""

content = content.replace('</head>', cdn_script + '</head>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added Supabase CDN")
