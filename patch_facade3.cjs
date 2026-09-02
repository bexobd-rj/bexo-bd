const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const badCode = `channel = self.rawClient.channel('sub_' + collectionName + '_' + strId + '_' + Math.random())
                              var filterStr = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId=eq.' + strId : 'id=eq.' + strId;
                              .on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: filterStr }, function(payload) {`;

const goodCode = `var filterStr = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId=eq.' + strId : 'id=eq.' + strId;
                            channel = self.rawClient.channel('sub_' + collectionName + '_' + strId + '_' + Math.random())
                              .on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: filterStr }, function(payload) {`;

code = code.replace(badCode, goodCode);
fs.writeFileSync('index.html', code);
