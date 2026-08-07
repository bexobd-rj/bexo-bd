const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `                                              set: async (data) => {
                                                  if (!window.supabase) return;
                                                  try {
                                                      const payload = { ...data };
                                                      if (payload.id === undefined) payload.id = String(docId);
                                                      await window.supabase.from(collectionName).upsert(payload);
                                                  } catch (e) { console.warn("Supabase set error:", e); }
                                              },
                                              update: async (data) => {
                                                  if (!window.supabase) return;
                                                  try {
                                                      await window.supabase.from(collectionName).update(data).eq('id', String(docId));
                                                  } catch (e) { console.warn("Supabase update error:", e); }
                                              },
                                              delete: async () => {
                                                  if (!window.supabase) return;
                                                  try {
                                                      await window.supabase.from(collectionName).delete().eq('id', String(docId));
                                                  } catch (e) { console.warn("Supabase delete error:", e); }
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
                                              },`;

const replacement = `                                              set: async (data) => {
                                                  if (!window.supabase) return;
                                                  try {
                                                      const payload = { ...data };
                                                      if (collectionName === 'bexo_users') {
                                                          if (payload.profileId === undefined) payload.profileId = String(docId);
                                                          delete payload.id;
                                                          await window.supabase.from(collectionName).upsert(payload, { onConflict: 'profileId' });
                                                      } else {
                                                          if (payload.id === undefined) payload.id = String(docId);
                                                          await window.supabase.from(collectionName).upsert(payload);
                                                      }
                                                  } catch (e) { console.warn("Supabase set error:", e); }
                                              },
                                              update: async (data) => {
                                                  if (!window.supabase) return;
                                                  try {
                                                      if (collectionName === 'bexo_users') {
                                                          await window.supabase.from(collectionName).update(data).eq('profileId', String(docId));
                                                      } else {
                                                          await window.supabase.from(collectionName).update(data).eq('id', String(docId));
                                                      }
                                                  } catch (e) { console.warn("Supabase update error:", e); }
                                              },
                                              delete: async () => {
                                                  if (!window.supabase) return;
                                                  try {
                                                      if (collectionName === 'bexo_users') {
                                                          await window.supabase.from(collectionName).delete().eq('profileId', String(docId));
                                                      } else {
                                                          await window.supabase.from(collectionName).delete().eq('id', String(docId));
                                                      }
                                                  } catch (e) { console.warn("Supabase delete error:", e); }
                                              },
                                              get: async () => {
                                                  if (!window.supabase) return { exists: false, data: () => null, id: docId };
                                                  try {
                                                      const field = collectionName === 'bexo_users' ? 'profileId' : 'id';
                                                      const { data, error } = await window.supabase.from(collectionName).select('*').eq(field, String(docId)).maybeSingle();
                                                      if (error || !data) return { exists: false, data: () => null, id: docId };
                                                      return { exists: true, data: () => data, id: docId };
                                                  } catch (e) {
                                                      return { exists: false, data: () => null, id: docId };
                                                  }
                                              },`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('index.html', code);
    console.log("Patched successfully!");
} else {
    console.log("Target not found!");
}
