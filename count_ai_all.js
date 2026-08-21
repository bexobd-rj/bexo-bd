import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkCol(col) {
    try {
        const snap = await getDocs(collection(db, col));
        console.log(`${col}: ${snap.size}`);
    } catch(e) {
        console.log(`${col}: ERROR - ${e.message}`);
    }
}

async function run() {
  await checkCol("bexo_users");
  await checkCol("bexo_orders");
  await checkCol("bexo_posts");
  await checkCol("products");
  await checkCol("users");
  await checkCol("orders");
  await checkCol("transactions");
  process.exit(0);
}
run();
