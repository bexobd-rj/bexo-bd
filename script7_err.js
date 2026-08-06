
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

          if (!supabaseUrl) {
              try { supabaseUrl = localStorage.getItem('bexo_supabase_url') || ""; } catch(e) {}
          }
          if (supabaseUrl && !supabaseUrl.startsWith('http')) {
              supabaseUrl = 'https://' + supabaseUrl;
          }
          if (supabaseUrl && supabaseUrl.endsWith('/')) {
              supabaseUrl = supabaseUrl.slice(0, -1);
          }
          if (!supabaseKey) {
              try { supabaseKey = localStorage.getItem('bexo_supabase_anon_key') || ""; } catch(e) {}
          }

          if (supabaseUrl && supabaseKey && window.supabase && typeof window.supabase.createClient === 'function') {
              try {
                  const client = window.supabase.createClient(supabaseUrl, supabaseKey);
                  
                  window.supabaseClient = client;
                  window.supabase = client;
                  
                  // Setup Auth Listener
                  client.auth.onAuthStateChange(async (event, session) => {
                      console.log("Supabase Auth Event:", event);
                      if (session && session.user) {
                          const { data, error } = await client.from('bexo_users').select('*').eq('id', session.user.id).limit(1);
                          if (!error && data && data.length > 0) {
                              const dbUser = data[0];
                              window.userProfile = { ...window.DEFAULT_PROFILE, ...dbUser, id: session.user.id };
                              localStorage.setItem('bexo_profile', JSON.stringify(window.userProfile));
                              
                              // Sync to appUsers
                              if (typeof appUsers !== 'undefined' && Array.isArray(appUsers)) {
                                  const idx = appUsers.findIndex(u => u.profileId === window.userProfile.profileId);
                                  if (idx > -1) appUsers[idx] = window.userProfile;
                                  else appUsers.push(window.userProfile);
                                  localStorage.setItem('bexo_users', JSON.stringify(appUsers));
                              }
                          }
                      } else if (event === 'SIGNED_OUT') {
                          window.userProfile = null;
                          localStorage.removeItem('bexo_profile');
                      }
                  });

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
    