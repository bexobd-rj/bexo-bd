import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove Firebase SDK scripts from head
content = re.sub(r'<!-- Firebase SDK Compat with Sequential, Fail-Safe Loader -->.*?<\/script>', '', content, flags=re.DOTALL)

supabase_init = """
              async function initializeFirebaseIfReady() {
                  if (window.db) {
                      updateFirebaseConnectionBadges(true);
                      return true;
                  }
                  if (isFirebaseInitInProgress) return false;
                  isFirebaseInitInProgress = true;
                  updateFirebaseConnectionBadges(false);
                  
                  try {
                      console.log("[Supabase Applet] Initializing Supabase Facade...");
                      
                      // Wait for Supabase to be available on window
                      let attempts = 0;
                      while (!window.supabase && attempts < 10) {
                          await new Promise(r => setTimeout(r, 500));
                          attempts++;
                      }
                      
                      if (!window.supabase) {
                          throw new Error("window.supabase not found");
                      }
                      
                      window.db = {
                          runTransaction: async (updateFunction) => {
                              const compatTransaction = {
                                  get: async (docRefCompat) => {
                                      return await docRefCompat.get();
                                  },
                                  set: (docRefCompat, data) => {
                                      docRefCompat.set(data);
                                      return compatTransaction;
                                  },
                                  update: (docRefCompat, data) => {
                                      docRefCompat.update(data);
                                      return compatTransaction;
                                  },
                                  delete: (docRefCompat) => {
                                      docRefCompat.delete();
                                      return compatTransaction;
                                  }
                              };
                              return await updateFunction(compatTransaction);
                          },
                          collection: (collectionName) => {
                              const makeQuery = (constraints) => {
                                  return {
                                      doc: (docId) => {
                                          return {
                                              _rawDocRef: { collectionName, docId },
                                              set: async (data) => {
                                                  if (!window.supabase) return;
                                                  try {
                                                      const payload = { ...data };
                                                      if (payload.id === undefined) payload.id = String(docId);
                                                      await window.supabase.from(collectionName).upsert(payload);
                                                  } catch (e) { console.error("Supabase set error:", e); }
                                              },
                                              update: async (data) => {
                                                  if (!window.supabase) return;
                                                  try {
                                                      await window.supabase.from(collectionName).update(data).eq('id', String(docId));
                                                  } catch (e) { console.error("Supabase update error:", e); }
                                              },
                                              delete: async () => {
                                                  if (!window.supabase) return;
                                                  try {
                                                      await window.supabase.from(collectionName).delete().eq('id', String(docId));
                                                  } catch (e) { console.error("Supabase delete error:", e); }
                                              },
                                              get: async () => {
                                                  if (!window.supabase) return { exists: false, data: () => null, id: docId };
                                                  try {
                                                      const { data, error } = await window.supabase.from(collectionName).select('*').eq('id', String(docId)).maybeSingle();
                                                      if (error || !data) return { exists: false, data: () => null, id: docId };
                                                      return { exists: true, data: () => data, id: docId };
                                                  } catch (e) {
                                                      return { exists: false, data: () => null, id: docId };
                                                  }
                                              },
                                              onSnapshot: (onNext) => {
                                                  if (!window.supabase) return () => {};
                                                  let channel;
                                                  window.supabase.from(collectionName).select('*').eq('id', String(docId)).maybeSingle().then(({data}) => {
                                                      onNext({ exists: !!data, data: () => data, id: docId });
                                                      
                                                      channel = window.supabase.channel(`public:${collectionName}:id=eq.${docId}`)
                                                      .on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: `id=eq.${docId}` }, payload => {
                                                          if (payload.eventType === 'DELETE') {
                                                              onNext({ exists: false, data: () => null, id: docId });
                                                          } else {
                                                              onNext({ exists: true, data: () => payload.new, id: docId });
                                                          }
                                                      }).subscribe();
                                                  });
                                                  return () => { if(channel) window.supabase.removeChannel(channel); };
                                              }
                                          };
                                      },
                                      orderBy: (field, direction = "asc") => {
                                          return makeQuery([...constraints, { type: 'orderBy', field, direction: direction.toLowerCase() }]);
                                      },
                                      limit: (num) => {
                                          return makeQuery([...constraints, { type: 'limit', num }]);
                                      },
                                      onSnapshot: (onNext, onError) => {
                                          if (!window.supabase) return () => {};
                                          
                                          let currentData = [];
                                          const notify = () => {
                                              const docs = currentData.map(d => ({ exists: true, data: () => d, id: d.id }));
                                              onNext({
                                                  forEach: (cb) => docs.forEach(cb),
                                                  docs: docs,
                                                  empty: docs.length === 0
                                              });
                                          };

                                          const fetchAll = () => {
                                              let query = window.supabase.from(collectionName).select('*');
                                              constraints.forEach(c => {
                                                  if (c.type === 'orderBy') query = query.order(c.field, { ascending: c.direction === 'asc' });
                                                  if (c.type === 'limit') query = query.limit(c.num);
                                              });
                                              query.then(({data, error}) => {
                                                  if (data) {
                                                      currentData = data;
                                                      notify();
                                                  } else if (error && onError) {
                                                      onError(error);
                                                  }
                                              });
                                          };

                                          fetchAll();

                                          const channel = window.supabase.channel(`public:${collectionName}_all`)
                                          .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, () => {
                                              fetchAll();
                                          }).subscribe();
                                          
                                          return () => window.supabase.removeChannel(channel);
                                      },
                                      get: async () => {
                                          if (!window.supabase) {
                                              return { forEach: () => {}, docs: [], empty: true };
                                          }
                                          let query = window.supabase.from(collectionName).select('*');
                                          constraints.forEach(c => {
                                              if (c.type === 'orderBy') query = query.order(c.field, { ascending: c.direction === 'asc' });
                                              if (c.type === 'limit') query = query.limit(c.num);
                                          });
                                          const { data } = await query;
                                          const docs = (data || []).map(d => ({
                                              exists: true,
                                              data: () => d,
                                              id: d.id
                                          }));
                                          return {
                                              forEach: (cb) => docs.forEach(cb),
                                              docs: docs,
                                              empty: docs.length === 0
                                          };
                                      }
                                  };
                              };
                              return makeQuery([]);
                          }
                      };
                      
                      updateFirebaseConnectionBadges(true);
                      setupFirebaseRealtimeListeners();
                      if (typeof processPendingSyncs === 'function') processPendingSyncs();
                      if (typeof executeStartupSettlementCleanSweep === 'function') executeStartupSettlementCleanSweep();
                      
                      if (userProfile && userProfile.phone && userProfile.password) {
                          if (typeof updateAppUsersList === 'function') updateAppUsersList(userProfile);
                      }
                      isFirebaseInitInProgress = false;
                      return true;
                  } catch (e) {
                      console.error("Supabase SDK init failed inside index.html:", e);
                      isFirebaseInitInProgress = false;
                      updateFirebaseConnectionBadges(false);
                      
                      firebaseInitAttempts++;
                      if (firebaseInitAttempts < 30) {
                          setTimeout(initializeFirebaseIfReady, 1000);
                      } else {
                          console.warn("Supabase SDK initialization totally exhausted.");
                      }
                  }
                  return false;
              }
"""

with open('firebase_init_block.txt', 'r', encoding='utf-8') as bf:
    block = bf.read()

content = content.replace(block, supabase_init)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched initializeFirebaseIfReady to use Supabase")
