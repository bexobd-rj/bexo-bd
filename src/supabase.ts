import { createClient } from '@supabase/supabase-js';

const getEnvOrStorage = (envKey: string, storageKey: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[envKey]) {
    return import.meta.env[envKey];
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(storageKey) || '';
  }
  return '';
};

export function createSupabaseFacade(rawClient: any = null) {
  let activeClient = rawClient;

  const facade: any = {
    get rawClient() {
      return activeClient;
    },
    setClient(newClient: any) {
      activeClient = newClient;
      if (newClient) {
        facade.auth = newClient.auth;
        facade.storage = newClient.storage;
      }
    },
    from: (tableName: string) => {
      if (activeClient && typeof activeClient.from === 'function') {
        const q = activeClient.from(tableName);
        return q;
      }
      const dummyBuilder: any = {
        select: () => dummyBuilder,
        insert: async (data: any) => ({ data, error: null }),
        upsert: async (data: any) => ({ data, error: null }),
        update: () => dummyBuilder,
        delete: () => dummyBuilder,
        eq: () => dummyBuilder,
        neq: () => dummyBuilder,
        gte: () => dummyBuilder,
        lte: () => dummyBuilder,
        order: () => dummyBuilder,
        limit: () => dummyBuilder,
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        then: (resolve: any, reject?: any) => Promise.resolve({ data: [], error: null }).then(resolve, reject),
        catch: (reject: any) => Promise.resolve({ data: [], error: null }).catch(reject)
      };
      return dummyBuilder;
    },
    channel: (name: string) => {
      if (activeClient && typeof activeClient.channel === 'function') {
        return activeClient.channel(name);
      }
      return {
        on: () => ({ subscribe: () => ({}) }),
        subscribe: () => ({})
      };
    },
    removeChannel: (ch: any) => {
      if (activeClient && typeof activeClient.removeChannel === 'function') {
        return activeClient.removeChannel(ch);
      }
    },
    auth: activeClient?.auth || {
      signInWithPassword: async () => ({ data: null, error: { message: "Supabase auth not configured" } }),
      signUp: async () => ({ data: null, error: { message: "Supabase auth not configured" } }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      verifyOtp: async () => ({ data: null, error: { message: "Supabase auth not configured" } }),
      signInWithOtp: async () => ({ data: null, error: { message: "Supabase auth not configured" } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    collection: (collectionName: string) => {
      const makeQuery = (constraints: any[] = []) => {
        return {
          doc: (docId: string | number) => ({
            id: String(docId),
            set: async (data: any) => {
              if (activeClient) {
                const payload = { ...data };
                if (payload.id === undefined) payload.id = String(docId);
                return activeClient.from(collectionName).upsert(payload);
              }
              try {
                const key = collectionName;
                let list = JSON.parse(localStorage.getItem(key) || '[]');
                if (!Array.isArray(list)) list = [];
                const idx = list.findIndex((item: any) => String(item.id || item.profileId) === String(docId));
                const item = { ...data, id: String(docId) };
                if (idx >= 0) list[idx] = item;
                else list.push(item);
                localStorage.setItem(key, JSON.stringify(list));
              } catch (e) {}
              return { data, error: null };
            },
            update: async (data: any) => {
              if (activeClient) {
                return activeClient.from(collectionName).update(data).eq('id', String(docId));
              }
              try {
                const key = collectionName;
                let list = JSON.parse(localStorage.getItem(key) || '[]');
                if (!Array.isArray(list)) list = [];
                const idx = list.findIndex((item: any) => String(item.id || item.profileId) === String(docId));
                if (idx >= 0) {
                  list[idx] = { ...list[idx], ...data };
                  localStorage.setItem(key, JSON.stringify(list));
                }
              } catch (e) {}
              return { data, error: null };
            },
            delete: async () => {
              if (activeClient) {
                return activeClient.from(collectionName).delete().eq('id', String(docId));
              }
              try {
                const key = collectionName;
                let list = JSON.parse(localStorage.getItem(key) || '[]');
                if (Array.isArray(list)) {
                  list = list.filter((item: any) => String(item.id || item.profileId) !== String(docId));
                  localStorage.setItem(key, JSON.stringify(list));
                }
              } catch (e) {}
              return { error: null };
            },
            get: async () => {
              if (activeClient) {
                try {
                  const { data, error } = await activeClient.from(collectionName).select('*').eq('id', String(docId)).maybeSingle();
                  return {
                    exists: !error && !!data,
                    data: () => data,
                    id: String(docId)
                  };
                } catch (err) {
                  return { exists: false, data: () => null, id: String(docId) };
                }
              }
              try {
                const key = collectionName;
                const list = JSON.parse(localStorage.getItem(key) || '[]');
                if (Array.isArray(list)) {
                  const found = list.find((item: any) => String(item.id || item.profileId) === String(docId));
                  return {
                    exists: !!found,
                    data: () => found || null,
                    id: String(docId)
                  };
                }
              } catch (e) {}
              return { exists: false, data: () => null, id: String(docId) };
            },
            onSnapshot: (onNext: (snap: any) => void, onError?: (err: any) => void) => {
              if (activeClient) {
                let channel: any;
                activeClient.from(collectionName).select('*').eq('id', String(docId)).maybeSingle().then(({ data, error }: any) => {
                  if (error && onError) onError(error);
                  else onNext({ exists: !!data, data: () => data, id: String(docId) });
                  channel = activeClient.channel(`sub_${collectionName}_${docId}_${Math.random()}`)
                    .on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: `id=eq.${docId}` }, (payload: any) => {
                      if (payload.eventType === 'DELETE') {
                        onNext({ exists: false, data: () => null, id: String(docId) });
                      } else {
                        onNext({ exists: true, data: () => payload.new, id: String(docId) });
                      }
                    }).subscribe();
                }).catch((err: any) => {
                  if (onError) onError(err);
                });
                return () => { if (channel && activeClient.removeChannel) activeClient.removeChannel(channel); };
              }
              setTimeout(async () => {
                const res = await facade.collection(collectionName).doc(docId).get();
                onNext(res);
              }, 0);
              return () => {};
            }
          }),
          orderBy: (field: string, direction: string = 'asc') => {
            return makeQuery([...constraints, { type: 'orderBy', field, direction: direction.toLowerCase() }]);
          },
          limit: (num: number) => {
            return makeQuery([...constraints, { type: 'limit', num }]);
          },
          where: (field: string, op: string, val: any) => {
            return makeQuery([...constraints, { type: 'where', field, op, val }]);
          },
          get: async () => {
            if (activeClient) {
              try {
                let query = activeClient.from(collectionName).select('*');
                constraints.forEach((c: any) => {
                  if (c.type === 'orderBy') query = query.order(c.field, { ascending: c.direction === 'asc' });
                  if (c.type === 'limit') query = query.limit(c.num);
                  if (c.type === 'where') {
                    if (c.op === '==') query = query.eq(c.field, c.val);
                    else if (c.op === '>=') query = query.gte(c.field, c.val);
                    else if (c.op === '<=') query = query.lte(c.field, c.val);
                  }
                });
                const { data } = await query;
                const docs = (data || []).map((d: any) => ({
                  exists: true,
                  data: () => d,
                  id: d.id
                }));
                return {
                  forEach: (cb: (doc: any) => void) => docs.forEach(cb),
                  docs: docs,
                  empty: docs.length === 0
                };
              } catch (err) {
                return { forEach: () => {}, docs: [], empty: true };
              }
            }
            try {
              const list = JSON.parse(localStorage.getItem(collectionName) || '[]');
              let docs = Array.isArray(list) ? list : [];
              constraints.forEach((c: any) => {
                if (c.type === 'orderBy') {
                  docs.sort((a: any, b: any) => {
                    const va = a[c.field] || 0;
                    const vb = b[c.field] || 0;
                    return c.direction === 'desc' ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
                  });
                }
                if (c.type === 'limit') {
                  docs = docs.slice(0, c.num);
                }
              });
              const mappedDocs = docs.map((d: any) => ({
                exists: true,
                data: () => d,
                id: d.id || d.profileId
              }));
              return {
                forEach: (cb: (doc: any) => void) => mappedDocs.forEach(cb),
                docs: mappedDocs,
                empty: mappedDocs.length === 0
              };
            } catch (e) {
              return { forEach: () => {}, docs: [], empty: true };
            }
          },
          onSnapshot: (onNext: (snapshot: any) => void, onError?: (err: any) => void) => {
            if (activeClient) {
              const fetchAll = () => {
                let query = activeClient.from(collectionName).select('*');
                constraints.forEach((c: any) => {
                  if (c.type === 'orderBy') query = query.order(c.field, { ascending: c.direction === 'asc' });
                  if (c.type === 'limit') query = query.limit(c.num);
                });
                query.then(({ data, error }: any) => {
                  if (data) {
                    const docs = data.map((d: any) => ({ exists: true, data: () => d, id: d.id }));
                    onNext({
                      forEach: (cb: (doc: any) => void) => docs.forEach(cb),
                      docs: docs,
                      empty: docs.length === 0
                    });
                  } else if (error && onError) {
                    onError(error);
                  }
                }).catch((err: any) => {
                  if (onError) onError(err);
                });
              };
              fetchAll();
              const channel = activeClient.channel(`sub_col_${collectionName}_${Math.random()}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, () => {
                  fetchAll();
                }).subscribe();
              return () => { if (channel && activeClient.removeChannel) activeClient.removeChannel(channel); };
            }
            setTimeout(async () => {
              const res = await makeQuery(constraints).get();
              onNext(res);
            }, 0);
            return () => {};
          }
        };
      };
      return makeQuery([]);
    },
    runTransaction: async (updateFunction: (transaction: any) => Promise<any>) => {
      const transaction = {
        get: async (docRef: any) => {
          if (docRef && typeof docRef.get === 'function') {
            return docRef.get();
          }
          return { exists: false, data: () => null };
        },
        set: async (docRef: any, data: any) => {
          if (docRef && typeof docRef.set === 'function') {
            return docRef.set(data);
          }
        },
        update: async (docRef: any, data: any) => {
          if (docRef && typeof docRef.update === 'function') {
            return docRef.update(data);
          }
        },
        delete: async (docRef: any) => {
          if (docRef && typeof docRef.delete === 'function') {
            return docRef.delete();
          }
        }
      };
      return updateFunction(transaction);
    }
  };

  if (activeClient) {
    facade.auth = activeClient.auth;
    facade.storage = activeClient.storage;
    // Attach helper directly to activeClient as well
    activeClient.collection = facade.collection;
    activeClient.runTransaction = facade.runTransaction;
  }

  return facade;
}

const supabaseUrl = getEnvOrStorage('VITE_SUPABASE_URL', 'bexo_supabase_url');
const supabaseAnonKey = getEnvOrStorage('VITE_SUPABASE_ANON_KEY', 'bexo_supabase_anon_key');

let rawClient: any = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    rawClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Error creating Supabase client:', err);
  }
}

export const supabaseFacade = createSupabaseFacade(rawClient);
export const supabase = supabaseFacade;

export function initSupabase(url: string, key: string) {
  if (!url || !key) return supabaseFacade;
  try {
    const newClient = createClient(url, key);
    supabaseFacade.setClient(newClient);
    return supabaseFacade;
  } catch (e) {
    console.warn('Failed to init Supabase:', e);
    return supabaseFacade;
  }
}

if (typeof window !== 'undefined') {
  // Preserve raw createClient if CDN was loaded
  const existingSupabase = (window as any).supabase;
  if (existingSupabase && existingSupabase.createClient && !existingSupabase.collection) {
    (window as any).supabaseJs = existingSupabase;
  }
  
  (window as any).supabase = supabaseFacade;
  (window as any).getSupabase = () => (supabaseFacade.rawClient || supabaseFacade);
  (window as any).initSupabaseClient = initSupabase;
}


