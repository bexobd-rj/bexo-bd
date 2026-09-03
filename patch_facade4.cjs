const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Patch 1: doc.get()
let getDocMatch = `return self.rawClient.from(collectionName).select('*').eq(idCol, strId).maybeSingle()
                            .then(function(res) {
                              return {
                                exists: !res.error && !!res.data,
                                data: function() { return res.data; },
                                id: strId
                              };
                            }).catch(function() {
                              return { exists: false, data: function() { return null; }, id: strId };
                            });`;
// Already has catch!

// Patch 2: doc.onSnapshot()
let onSnapDocTarget = `self.rawClient.from(collectionName).select('*').eq(idCol, strId).maybeSingle().then(function(res) {
                            if (res.error && onError) onError(res.error);
                            else onNext({ exists: !!res.data, data: function() { return res.data; }, id: strId });`;
let onSnapDocRepl = `self.rawClient.from(collectionName).select('*').eq(idCol, strId).maybeSingle().then(function(res) {
                            if (res.error && onError) onError(res.error);
                            else onNext({ exists: !!res.data, data: function() { return res.data; }, id: strId });
                          }).catch(function(err) { if(onError) onError(err); });`;
code = code.replace(onSnapDocTarget, onSnapDocRepl);

// Patch 3: collection.get()
let collGetTarget = `                      return query.then(function(res) {
                        var docs = (res.data || []).map(function(d) {
                          return { exists: true, data: function() { return d; }, id: d.id };
                        });
                        return {
                          forEach: function(cb) { docs.forEach(cb); },
                          docs: docs,
                          empty: docs.length === 0
                        };
                      });`;
let collGetRepl = `                      return query.then(function(res) {
                        var docs = (res.data || []).map(function(d) {
                          return { exists: true, data: function() { return d; }, id: d.id };
                        });
                        return {
                          forEach: function(cb) { docs.forEach(cb); },
                          docs: docs,
                          empty: docs.length === 0
                        };
                      }).catch(function(err) {
                          return { forEach: function(cb) {}, docs: [], empty: true };
                      });`;
code = code.replace(collGetTarget, collGetRepl);

// Patch 4: collection.onSnapshot()
let onSnapCollTarget = `                        query.then(function(res) {
                          if (res.data) {
                            var docs = res.data.map(function(d) { return { exists: true, data: function() { return d; }, id: d.id }; });
                            onNext({ forEach: function(cb) { docs.forEach(cb); }, docs: docs, empty: docs.length === 0 });
                          } else if (res.error && onError) {
                            onError(res.error);
                          }
                        });`;
let onSnapCollRepl = `                        query.then(function(res) {
                          if (res.data) {
                            var docs = res.data.map(function(d) { return { exists: true, data: function() { return d; }, id: d.id }; });
                            onNext({ forEach: function(cb) { docs.forEach(cb); }, docs: docs, empty: docs.length === 0 });
                          } else if (res.error && onError) {
                            onError(res.error);
                          }
                        }).catch(function(err) { if(onError) onError(err); });`;
code = code.replace(onSnapCollTarget, onSnapCollRepl);

fs.writeFileSync('index.html', code);
