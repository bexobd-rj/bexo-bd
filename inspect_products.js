import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const productsSnapshot = await getDocs(collection(db, "products"));
  productsSnapshot.forEach(doc => {
    console.log(`Doc ID: ${doc.id}`);
    console.log(doc.data());
  });
  process.exit(0);
}
run();
