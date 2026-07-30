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
    let noCodes = [];
    snap.forEach(doc => {
        const data = doc.data();
        let code = data.sku || data.code || data.productCode;
        if (code) {
           codes.push(code);
        } else {
           noCodes.push(doc.id);
        }
    });
    console.log(`Total bexo_posts: ${snap.size}`);
    console.log(`Total with code: ${codes.length}`);
    console.log(`Total without code: ${noCodes.length}`);
    
    // Check for unique codes
    let uniqueCodes = new Set(codes);
    console.log(`Unique codes: ${uniqueCodes.size}`);
    
    process.exit(0);
}
run();
