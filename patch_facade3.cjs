const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `                              // Try to update first
                              return self.rawClient.from(collectionName).update(payload).eq('profileId', strId).then(function(res) {
                                  if (res.error) return { data: data, error: res.error };
                                  return { data: data, error: null };
                              });`;

const replacement = `                              // Try to update first. If 0 rows updated, we must UPSERT by id.
                              return self.rawClient.from(collectionName).update(payload).eq('profileId', strId).select('id').then(function(res) {
                                  if (res.error) return { data: data, error: res.error };
                                  if (res.data && res.data.length > 0) return { data: data, error: null };
                                  // 0 rows updated means missing row. We must upsert.
                                  // To upsert, we need the UUID 'id' which might be in payload.id
                                  if (payload.id) {
                                      return self.rawClient.from(collectionName).upsert(payload, { onConflict: 'id' }).then(function(r) {
                                          return { data: data, error: r.error };
                                      });
                                  }
                                  return { data: data, error: null };
                              });`;

code = code.replace(target, replacement);
fs.writeFileSync('index.html', code);
