import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
    const snap = await getDocs(collection(db, "bexo_posts"));
    let codes = [];
    snap.forEach(doc => {
        const data = doc.data();
        let code = data.sku || data.code || data.productCode || doc.id;
        if (data.code || data.sku) {
           codes.push(data.code || data.sku);
        }
    });
    console.log(`Total bexo_posts: ${snap.size}`);
    console.log(`Total with a specific code/sku field: ${codes.length}`);
    console.log(`Sample codes: ${codes.slice(0, 10).join(', ')}`);
    process.exit(0);
}
run();
