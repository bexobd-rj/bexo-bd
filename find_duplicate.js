import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
    const snap = await getDocs(collection(db, "bexo_posts"));
    let codeMap = {};
    let duplicates = [];
    snap.forEach(doc => {
        const data = doc.data();
        let code = String(data.sku || data.code || data.productCode);
        if (codeMap[code]) {
           duplicates.push({code, id1: codeMap[code], id2: doc.id});
        } else {
           codeMap[code] = doc.id;
        }
    });
    console.log("Duplicates:", duplicates);
    process.exit(0);
}
run();
