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
    const userId = "test_user";
    const collectionName = "live_chats";
    const docRef = compatDb.collection(collectionName).doc(userId);
    const newMsg = {
        text: "Hello",
        sender: 'user',
        timestamp: Date.now()
    };
    
    try {
        await compatDb.runTransaction(transaction => {
            return transaction.get(docRef).then(doc => {
                if (!doc.exists) {
                    console.log("Not exists, creating");
                    transaction.set(docRef, {
                        userId: userId,
                        messages: [newMsg]
                    });
                } else {
                    console.log("Exists, updating");
                    const data = doc.data();
                    const messages = data.messages || [];
                    messages.push(newMsg);
                    transaction.update(docRef, {
                        messages: messages
                    });
                }
            });
        });
        console.log("Tx success");
    } catch (e) {
        console.error("Tx error", e);
    }
    process.exit(0);
})();
