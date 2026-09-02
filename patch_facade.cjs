const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const getOriginal = `return self.rawClient.from(collectionName).select('*').eq('id', strId).maybeSingle()`;
const getReplacement = `var idCol = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId' : 'id';
                          return self.rawClient.from(collectionName).select('*').eq(idCol, strId).maybeSingle()`;
code = code.replace(getOriginal, getReplacement);

const updateOriginal = `return self.rawClient.from(collectionName).update(data).eq('id', strId);`;
const updateReplacement = `var idCol = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId' : 'id';
                          return self.rawClient.from(collectionName).update(data).eq(idCol, strId);`;
code = code.replace(updateOriginal, updateReplacement);

const deleteOriginal = `return self.rawClient.from(collectionName).delete().eq('id', strId);`;
const deleteReplacement = `var idCol = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId' : 'id';
                          return self.rawClient.from(collectionName).delete().eq(idCol, strId);`;
code = code.replace(deleteOriginal, deleteReplacement);

const setOriginal = `if (payload.id === undefined) payload.id = strId;
                          return self.rawClient.from(collectionName).upsert(payload);`;
const setReplacement = `if (collectionName === 'bexo_users' && strId.startsWith('BX-')) {
                              if (payload.id === strId) delete payload.id;
                              if (payload.id === undefined && data.id) payload.id = data.id;
                              // Try to update first
                              return self.rawClient.from(collectionName).update(payload).eq('profileId', strId).then(function(res) {
                                  if (res.error) return { data: data, error: res.error };
                                  return { data: data, error: null };
                              });
                          }
                          if (payload.id === undefined) payload.id = strId;
                          return self.rawClient.from(collectionName).upsert(payload);`;
code = code.replace(setOriginal, setReplacement);

fs.writeFileSync('index.html', code);
