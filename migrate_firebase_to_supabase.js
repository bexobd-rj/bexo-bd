import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 1. Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBXXJMr0ghw8XBpfKKsz0jViSUjL49g0z8",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "bexobdjsr.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "bexobdjsr",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// 2. Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Define collections to migrate
const collections = ['users', 'products', 'orders', 'transactions'];

async function migrate() {
  console.log('Starting migration from Firebase to Supabase...');

  for (const coll of collections) {
    console.log(`\nMigrating collection: ${coll}`);
    try {
      const snapshot = await getDocs(collection(db, coll));
      const records = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Flatten nested objects if necessary for PostgreSQL columns
        // e.g., if you have timestamps, convert them appropriately
        const record = { id: doc.id, ...data };
        
        // Firebase timestamps need to be converted to ISO strings
        Object.keys(record).forEach(key => {
          if (record[key] && typeof record[key].toDate === 'function') {
            record[key] = record[key].toDate().toISOString();
          }
        });

        records.push(record);
      });

      if (records.length === 0) {
        console.log(`No documents found in ${coll}.`);
        continue;
      }

      console.log(`Found ${records.length} documents. Inserting into Supabase...`);

      // NOTE: You must have created the corresponding tables in Supabase first!
      const { data, error } = await supabase
        .from(coll)
        .upsert(records);

      if (error) {
        console.error(`Error migrating ${coll}:`, error.message);
      } else {
        console.log(`Successfully migrated ${coll}!`);
      }
    } catch (err) {
      console.error(`Failed to fetch ${coll} from Firebase:`, err.message);
    }
  }

  console.log('\nMigration complete!');
}

migrate();
