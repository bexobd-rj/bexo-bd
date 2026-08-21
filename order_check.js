import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
    const snap = await getDocs(collection(db, "bexo_orders"));
    console.log(`Total orders: ${snap.size}`);
    let codeCount = 0;
    snap.forEach(doc => {
        const data = doc.data();
        if (data.productCode || data.code || data.sku) {
           codeCount++;
        }
    });
    console.log(`Orders with a product code attached: ${codeCount}`);
    process.exit(0);
}
run();
