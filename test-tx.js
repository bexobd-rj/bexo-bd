import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, runTransaction, onSnapshot } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(firebaseConfig);
const rawDb = getFirestore(app, "ai-studio-849e4512-323e-4cb4-b68a-951d9ae13878");

const compatDb = {
    runTransaction: (updateFunction) => {
        return runTransaction(rawDb, (transaction) => {
            const compatTransaction = {
                get: async (docRefCompat) => {
                    const snapshot = await transaction.get(docRefCompat._rawDocRef);
                    return {
                        exists: snapshot.exists(),
                        data: () => snapshot.data(),
                        id: snapshot.id
                    };
                },
                set: (docRefCompat, data) => {
                    transaction.set(docRefCompat._rawDocRef, data);
                    return compatTransaction;
                },
                update: (docRefCompat, data) => {
                    transaction.update(docRefCompat._rawDocRef, data);
                    return compatTransaction;
                },
                delete: (docRefCompat) => {
                    transaction.delete(docRefCompat._rawDocRef);
                    return compatTransaction;
                }
            };
            return updateFunction(compatTransaction);
        });
    },
    collection: (collectionName) => {
        return {
            doc: (docId) => {
                return {
                    _rawDocRef: doc(rawDb, collectionName, String(docId))
                }
            }
        }
    }
};

(async () => {
    const docRef = compatDb.collection("test_chats").doc("user_123");
    
    try {
        await compatDb.runTransaction(transaction => {
            return transaction.get(docRef).then(doc => {
                if (!doc.exists) {
                    console.log("Setting doc");
                    transaction.set(docRef, { hello: "world" });
                } else {
                    console.log("Updating doc");
                    transaction.update(docRef, { hello: "again" });
                }
            });
        });
        console.log("Tx success");
    } catch (e) {
        console.error("Tx error", e);
    }
    process.exit(0);
})();
