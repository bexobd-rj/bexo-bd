
      (function() {
        var rawCreateClient = (window.supabase && typeof window.supabase.createClient === 'function') ? window.supabase.createClient : null;
        window.supabaseJs = window.supabaseJs || (rawCreateClient ? { createClient: rawCreateClient } : null);
        
        function buildSupabaseFacade(activeClient) {
          var facade = {
            rawClient: activeClient,
            setClient: function(c) {
              this.rawClient = c;
              if (c) {
                this.auth = c.auth;
                this.storage = c.storage;
              }
            },
            from: function(tableName) {
              if (this.rawClient && typeof this.rawClient.from === 'function') {
                return this.rawClient.from(tableName);
              }
              var builder = {
                select: function() { return builder; },
                insert: function(d) { return Promise.resolve({ data: d, error: null }); },
                upsert: function(d) { return Promise.resolve({ data: d, error: null }); },
                update: function() { return builder; },
                delete: function() { return builder; },
                eq: function() { return builder; },
                neq: function() { return builder; },
                gte: function() { return builder; },
                lte: function() { return builder; },
                order: function() { return builder; },
                limit: function() { return builder; },
                single: function() { return Promise.resolve({ data: null, error: null }); },
                maybeSingle: function() { return Promise.resolve({ data: null, error: null }); },
                then: function(resolve, reject) { return Promise.resolve({ data: [], error: null }).then(resolve, reject); },
                catch: function(reject) { return Promise.resolve({ data: [], error: null }).catch(reject); }
              };
              return builder;
            },
            channel: function(name) {
              if (this.rawClient && typeof this.rawClient.channel === 'function') {
                return this.rawClient.channel(name);
              }
              return { on: function() { return { subscribe: function() { return {}; } }; }, subscribe: function() { return {}; } };
            },
            removeChannel: function(ch) {
              if (this.rawClient && typeof this.rawClient.removeChannel === 'function') {
                return this.rawClient.removeChannel(ch);
              }
            },
            auth: activeClient && activeClient.auth ? activeClient.auth : {
              signInWithPassword: function() { return Promise.resolve({ data: null, error: { message: "Supabase auth not configured" } }); },
              signUp: function() { return Promise.resolve({ data: null, error: { message: "Supabase auth not configured" } }); },
              signOut: function() { return Promise.resolve({ error: null }); },
              getSession: function() { return Promise.resolve({ data: { session: null }, error: null }); },
              verifyOtp: function() { return Promise.resolve({ data: null, error: { message: "Supabase auth not configured" } }); },
              signInWithOtp: function() { return Promise.resolve({ data: null, error: { message: "Supabase auth not configured" } }); },
              onAuthStateChange: function() { return { data: { subscription: { unsubscribe: function() {} } } }; }
            },
            collection: function(collectionName) {
              var self = this;
              function makeQuery(constraints) {
                constraints = constraints || [];
                return {
                  doc: function(docId) {
                    var strId = String(docId);
                    return {
                      id: strId,
                      set: function(data) {
                        if (self.rawClient) {
                          var payload = Object.assign({}, data);
                          if (collectionName === 'bexo_users' && strId.startsWith('BX-')) {
                              if (payload.id === strId) delete payload.id;
                              if (payload.id === undefined && data.id) payload.id = data.id;
                              // Try to update first. If 0 rows updated, we must UPSERT by id.
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
                              });
                          }
                          if (payload.id === undefined) payload.id = strId;
                          return self.rawClient.from(collectionName).upsert(payload);
                        }
                        try {
                          var list = JSON.parse(localStorage.getItem(collectionName) || '[]');
                          if (!Array.isArray(list)) list = [];
                          var idx = list.findIndex(function(item) { return String(item.id || item.profileId) === strId; });
                          var item = Object.assign({}, data, { id: strId });
                          if (idx >= 0) list[idx] = item;
                          else list.push(item);
                          localStorage.setItem(collectionName, JSON.stringify(list));
                        } catch(e) {}
                        return Promise.resolve({ data: data, error: null });
                      },
                      update: function(data) {
                        if (self.rawClient) {
                          var idCol = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId' : 'id';
                          return self.rawClient.from(collectionName).update(data).eq(idCol, strId);
                        }
                        try {
                          var list = JSON.parse(localStorage.getItem(collectionName) || '[]');
                          if (!Array.isArray(list)) list = [];
                          var idx = list.findIndex(function(item) { return String(item.id || item.profileId) === strId; });
                          if (idx >= 0) {
                            list[idx] = Object.assign({}, list[idx], data);
                            localStorage.setItem(collectionName, JSON.stringify(list));
                          }
                        } catch(e) {}
                        return Promise.resolve({ data: data, error: null });
                      },
                      delete: function() {
                        if (self.rawClient) {
                          var idCol = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId' : 'id';
                          return self.rawClient.from(collectionName).delete().eq(idCol, strId);
                        }
                        try {
                          var list = JSON.parse(localStorage.getItem(collectionName) || '[]');
                          if (Array.isArray(list)) {
                            list = list.filter(function(item) { return String(item.id || item.profileId) !== strId; });
                            localStorage.setItem(collectionName, JSON.stringify(list));
                          }
                        } catch(e) {}
                        return Promise.resolve({ error: null });
                      },
                      get: function() {
                        if (self.rawClient) {
                          var idCol = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId' : 'id';
                          return self.rawClient.from(collectionName).select('*').eq(idCol, strId).maybeSingle()
                            .then(function(res) {
                              return {
                                exists: !res.error && !!res.data,
                                data: function() { return res.data; },
                                id: strId
                              };
                            }).catch(function() {
                              return { exists: false, data: function() { return null; }, id: strId };
                            });
                        }
                        try {
                          var list = JSON.parse(localStorage.getItem(collectionName) || '[]');
                          if (Array.isArray(list)) {
                            var found = list.find(function(item) { return String(item.id || item.profileId) === strId; });
                            return Promise.resolve({
                              exists: !!found,
                              data: function() { return found || null; },
                              id: strId
                            });
                          }
                        } catch(e) {}
                        return Promise.resolve({ exists: false, data: function() { return null; }, id: strId });
                      },
                      onSnapshot: function(onNext, onError) {
                        if (self.rawClient) {
                          var channel;
                          var idCol = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId' : 'id';
                          self.rawClient.from(collectionName).select('*').eq(idCol, strId).maybeSingle().then(function(res) {
                            if (res.error && onError) onError(res.error);
                            else onNext({ exists: !!res.data, data: function() { return res.data; }, id: strId });
                          }).catch(function(err) { if(onError) onError(err); });
                            var filterStr = (collectionName === 'bexo_users' && strId.startsWith('BX-')) ? 'profileId=eq.' + strId : 'id=eq.' + strId;
                            channel = self.rawClient.channel('sub_' + collectionName + '_' + strId + '_' + Math.random())
                              .on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: filterStr }, function(payload) {
                                if (payload.eventType === 'DELETE') {
                                  onNext({ exists: false, data: function() { return null; }, id: strId });
                                } else {
                                  onNext({ exists: true, data: function() { return payload.new; }, id: strId });
                                }
                              }).subscribe();
                          return function() { if (channel && self.rawClient.removeChannel) self.rawClient.removeChannel(channel); };
                        }
                        setTimeout(function() {
                          self.collection(collectionName).doc(docId).get().then(onNext);
                        }, 0);
                        return function() {};
                      }
                    };
                  },
                  orderBy: function(field, direction) {
                    return makeQuery(constraints.concat([{ type: 'orderBy', field: field, direction: (direction || 'asc').toLowerCase() }]));
                  },
                  limit: function(num) {
                    return makeQuery(constraints.concat([{ type: 'limit', num: num }]));
                  },
                  where: function(field, op, val) {
                    return makeQuery(constraints.concat([{ type: 'where', field: field, op: op, val: val }]));
                  },
                  get: function() {
                    if (self.rawClient) {
                      var query = self.rawClient.from(collectionName).select('*');
                      constraints.forEach(function(c) {
                        if (c.type === 'orderBy') query = query.order(c.field, { ascending: c.direction === 'asc' });
                        if (c.type === 'limit') query = query.limit(c.num);
                        if (c.type === 'where') {
                          if (c.op === '==') query = query.eq(c.field, c.val);
                          else if (c.op === '>=') query = query.gte(c.field, c.val);
                          else if (c.op === '<=') query = query.lte(c.field, c.val);
                        }
                      });
                      return query.then(function(res) {
                        var docs = (res.data || []).map(function(d) {
                          return { exists: true, data: function() { return d; }, id: d.id };
                        });
                        return {
                          forEach: function(cb) { docs.forEach(cb); },
                          docs: docs,
                          empty: docs.length === 0
                        };
                      }).catch(function() {
                        return { forEach: function() {}, docs: [], empty: true };
                      });
                    }
                    try {
                      var list = JSON.parse(localStorage.getItem(collectionName) || '[]');
                      var docs = Array.isArray(list) ? list.slice() : [];
                      constraints.forEach(function(c) {
                        if (c.type === 'orderBy') {
                          docs.sort(function(a, b) {
                            var va = a[c.field] || 0;
                            var vb = b[c.field] || 0;
                            return c.direction === 'desc' ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
                          });
                        }
                        if (c.type === 'limit') {
                          docs = docs.slice(0, c.num);
                        }
                      });
                      var mappedDocs = docs.map(function(d) {
                        return { exists: true, data: function() { return d; }, id: d.id || d.profileId };
                      });
                      return Promise.resolve({
                        forEach: function(cb) { mappedDocs.forEach(cb); },
                        docs: mappedDocs,
                        empty: mappedDocs.length === 0
                      });
                    } catch(e) {
                      return Promise.resolve({ forEach: function() {}, docs: [], empty: true });
                    }
                  },
                  onSnapshot: function(onNext, onError) {
                    if (self.rawClient) {
                      var fetchAll = function() {
                        var query = self.rawClient.from(collectionName).select('*');
                        constraints.forEach(function(c) {
                          if (c.type === 'orderBy') query = query.order(c.field, { ascending: c.direction === 'asc' });
                          if (c.type === 'limit') query = query.limit(c.num);
                        });
                        query.then(function(res) {
                          if (res.data) {
                            var docs = res.data.map(function(d) { return { exists: true, data: function() { return d; }, id: d.id }; });
                            onNext({ forEach: function(cb) { docs.forEach(cb); }, docs: docs, empty: docs.length === 0 });
                          } else if (res.error && onError) {
                            onError(res.error);
                          }
                        }).catch(function(err) {
                          if (onError) onError(err);
                        });
                      };
                      fetchAll();
                      var channel = self.rawClient.channel('sub_col_' + collectionName + '_' + Math.random())
                        .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, function() {
                          fetchAll();
                        }).subscribe();
                      return function() { if (channel && self.rawClient.removeChannel) self.rawClient.removeChannel(channel); };
                    }
                    setTimeout(function() {
                      makeQuery(constraints).get().then(onNext);
                    }, 0);
                    return function() {};
                  }
                };
              }
              return makeQuery([]);
            },
            runTransaction: function(updateFunction) {
              var transaction = {
                get: function(docRef) {
                  if (docRef && typeof docRef.get === 'function') return docRef.get();
                  return Promise.resolve({ exists: false, data: function() { return null; } });
                },
                set: function(docRef, data) {
                  if (docRef && typeof docRef.set === 'function') return docRef.set(data);
                  return Promise.resolve();
                },
                update: function(docRef, data) {
                  if (docRef && typeof docRef.update === 'function') return docRef.update(data);
                  return Promise.resolve();
                },
                delete: function(docRef) {
                  if (docRef && typeof docRef.delete === 'function') return docRef.delete();
                  return Promise.resolve();
                }
              };
              return updateFunction(transaction);
            }
          };

          if (activeClient) {
            facade.auth = activeClient.auth;
            facade.storage = activeClient.storage;
            activeClient.collection = facade.collection;
            activeClient.runTransaction = facade.runTransaction;
          }

          return facade;
        }

        var savedUrl = localStorage.getItem('bexo_supabase_url') || '';
        var savedKey = localStorage.getItem('bexo_supabase_anon_key') || '';
        var initialClient = null;
        if (savedUrl && savedKey && rawCreateClient) {
          try {
            initialClient = rawCreateClient(savedUrl, savedKey);
          } catch(e) {
            console.warn("Could not create initial Supabase client from storage:", e);
          }
        }

        var globalFacade = buildSupabaseFacade(initialClient);
        window.supabase = globalFacade;
        window.getSupabase = function() { return globalFacade.rawClient || globalFacade; };
        window.initSupabaseClient = function(url, key) {
          if (!url || !key) return globalFacade;
          var creator = (window.supabaseJs && window.supabaseJs.createClient) || rawCreateClient;
          if (creator) {
            try {
              var newClient = creator(url, key);
              globalFacade.setClient(newClient);
              return globalFacade;
            } catch(err) {
              console.warn("Failed to dynamically init Supabase:", err);
            }
          }
          return globalFacade;
        };
      })();
    