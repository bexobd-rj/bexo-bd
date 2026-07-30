import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    console.log(`Total products in database: ${productsSnapshot.size}`);
    
    let codes = [];
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.sku) {
        codes.push(data.sku);
      }
    });
    
    console.log(`Total products with a SKU (code): ${codes.length}`);
    process.exit(0);
  } catch (error) {
    console.error("Error connecting to Firebase:", error);
    process.exit(1);
  }
}
run();
