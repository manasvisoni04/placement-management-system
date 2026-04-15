import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDQV1JAqCFj_F6jXsedHd6kPGy6tGuovwg",
  authDomain: "placement-system-ff4c4.firebaseapp.com",
  projectId: "placement-system-ff4c4",
  storageBucket: "placement-system-ff4c4.firebasestorage.app",
  messagingSenderId: "727704184271",
  appId: "1:727704184271:web:4defd733fae49f5186deba"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

async function testUpload() {
  try {
    // Try to upload anonymously. Let's see if we get a permission denied error.
    await signInAnonymously(auth).catch(e => console.log("Anonymous auth failed (expected if not enabled), let's see if we can upload anyway:", e.message));
    
    console.log("Attempting to upload file to storage...");
    const storageRef = ref(storage, `test_upload_${Date.now()}.txt`);
    
    // Create a dummy Blob
    const content = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const fileOptions = { contentType: 'text/plain' };
    
    await uploadBytes(storageRef, content, fileOptions);
    console.log("Upload SUCCESS! Storage is accessible.");
  } catch (error) {
    console.error("Upload FAILED:", error.message || error);
  }
}

testUpload();
