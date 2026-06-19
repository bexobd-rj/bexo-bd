import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Load Firebase Config
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error("Error: firebase-applet-config.json not found!");
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log("Initializing Firebase master connection database...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "ai-studio-849e4512-323e-4cb4-b68a-951d9ae13878");

const collectionsToWipe = [
  "bexo_users",
  "bexo_orders",
  "bexo_posts",
  "bexo_premium_requests",
  "bexo_recharge_requests",
  "bexo_balance_requests",
  "bexo_bill_requests",
  "bexo_categories",
  "bexo_transactions",
  "bexo_accounts",
  "bexo_withdrawals",
  "bexo_support_tickets",
  "bexo_manager_records",
  "bexo_reseller_payouts",
  "bexo_customer_reports"
];

async function purgeAllCollections() {
  console.log("=====================================");
  console.log("🔥 DATABASE PURGE SESSION COMMENCING 🔥");
  console.log("=====================================");

  for (const collectionName of collectionsToWipe) {
    try {
      console.log(`\nChecking collection: '${collectionName}'...`);
      const colRef = collection(db, collectionName);
      const querySnapshot = await getDocs(colRef);
      
      const totalDocs = querySnapshot.size;
      if (totalDocs === 0) {
        console.log(`Collection '${collectionName}' is already completely empty.`);
        continue;
      }
      
      console.log(`Found ${totalDocs} documents to delete inside '${collectionName}'. Wiping...`);
      
      // Delete documents in batches of 500 (Firestore batch limit)
      let count = 0;
      let batch = writeBatch(db);
      
      for (const d of querySnapshot.docs) {
        batch.delete(d.ref);
        count++;
        
        if (count % 500 === 0) {
          await batch.commit();
          console.log(`Progress: Deleted first ${count} documents...`);
          batch = writeBatch(db);
        }
      }
      
      if (count % 500 !== 0) {
        await batch.commit();
      }
      
      console.log(`✅ Successfully deleted ${count} documents from '${collectionName}' permanently.`);
    } catch (err: any) {
      console.error(`❌ Error purging collection '${collectionName}':`, err.message || err);
    }
  }

  console.log("\n=====================================");
  console.log("🎉 DATABASE CLEARANCE COMPLETELY COMPLETE 🎉");
  console.log("=====================================");
}

purgeAllCollections()
  .then(() => {
    console.log("Purge process finished. Exiting...");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Purge crashed:", err);
    process.exit(1);
  });
