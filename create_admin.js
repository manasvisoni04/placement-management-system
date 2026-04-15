const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDQV1JAqCFj_F6jXsedHd6kPGy6tGuovwg",
  authDomain: "placement-system-ff4c4.firebaseapp.com",
  projectId: "placement-system-ff4c4",
  storageBucket: "placement-system-ff4c4.firebasestorage.app",
  messagingSenderId: "727704184271",
  appId: "1:727704184271:web:4defd733fae49f5186deba"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function getAdminId() {
  const { collection, query, where, getDocs } = require('firebase/firestore');
  const q = query(collection(db, 'users'), where('email', '==', 'admin@admin.com'));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    console.log("ADMIN_UID=" + snapshot.docs[0].id);
  } else {
    console.log("No admin found in users collection.");
  }
  process.exit(0);
}
getAdminId();
