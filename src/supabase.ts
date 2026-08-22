import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Error creating Supabase client:', err);
  }
} else {
  console.warn('Supabase URL or Anon Key is missing. Running in local storage mode.');
}

// Add collection/doc helper facade for seamless compatibility
if (client) {
  client.collection = function(collectionName: string) {
    const makeQuery = (constraints: any[] = []) => {
      return {
        doc: (docId: string | number) => ({
          set: async (data: any) => {
            const payload = { ...data };
            if (payload.id === undefined) payload.id = String(docId);
            return client.from(collectionName).upsert(payload);
          },
          update: async (data: any) => {
            return client.from(collectionName).update(data).eq('id', String(docId));
          },
          delete: async () => {
            return client.from(collectionName).delete().eq('id', String(docId));
          },
          get: async () => {
            const { data, error } = await client.from(collectionName).select('*').eq('id', String(docId)).maybeSingle();
            return {
              exists: !error && !!data,
              data: () => data,
              id: docId
            };
          },
          onSnapshot: (onNext: (snap: any) => void) => {
            let channel: any;
            client.from(collectionName).select('*').eq('id', String(docId)).maybeSingle().then(({ data }: any) => {
              onNext({ exists: !!data, data: () => data, id: docId });
              channel = client.channel(`sub_${collectionName}_${docId}_${Math.random()}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: collectionName, filter: `id=eq.${docId}` }, (payload: any) => {
                  if (payload.eventType === 'DELETE') {
                    onNext({ exists: false, data: () => null, id: docId });
                  } else {
                    onNext({ exists: true, data: () => payload.new, id: docId });
                  }
                }).subscribe();
            });
            return () => { if (channel) client.removeChannel(channel); };
          }
        }),
        orderBy: (field: string, direction: string = 'asc') => {
          return makeQuery([...constraints, { type: 'orderBy', field, direction: direction.toLowerCase() }]);
        },
        limit: (num: number) => {
          return makeQuery([...constraints, { type: 'limit', num }]);
        },
        get: async () => {
          let query = client.from(collectionName).select('*');
          constraints.forEach((c: any) => {
            if (c.type === 'orderBy') query = query.order(c.field, { ascending: c.direction === 'asc' });
            if (c.type === 'limit') query = query.limit(c.num);
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
        },
        onSnapshot: (onNext: (snapshot: any) => void, onError?: (err: any) => void) => {
          const fetchAll = () => {
            let query = client.from(collectionName).select('*');
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
            });
          };
          fetchAll();
          const channel = client.channel(`sub_col_${collectionName}_${Math.random()}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, () => {
              fetchAll();
            }).subscribe();
          return () => client.removeChannel(channel);
        }
      };
    };
    return makeQuery([]);
  };
}

export const supabase = client;

if (typeof window !== 'undefined') {
  (window as any).supabase = client;
  (window as any).getSupabase = () => client;
}

