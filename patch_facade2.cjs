const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const snapOriginal1 = `self.rawClient.from(collectionName).select('*').eq('id', strId).maybeSingle().then(function(res) {`;
const snapReplacement1 = `var idCol = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId' : 'id';
                          self.rawClient.from(collectionName).select('*').eq(idCol, strId).maybeSingle().then(function(res) {`;
code = code.replace(snapOriginal1, snapReplacement1);

const snapOriginal2 = `.on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: 'id=eq.' + strId }, function(payload) {`;
const snapReplacement2 = `var filterStr = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId=eq.' + strId : 'id=eq.' + strId;
                              .on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: filterStr }, function(payload) {`;
code = code.replace(snapOriginal2, snapReplacement2);

fs.writeFileSync('index.html', code);
