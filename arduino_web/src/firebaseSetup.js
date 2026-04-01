import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCIWF8oPhWTtGRor36hwadCVLq0FqGVpfY",
  authDomain: "pjweather-987bf.firebaseapp.com",
  databaseURL: "https://pjweather-987bf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pjweather-987bf",
  storageBucket: "pjweather-987bf.firebasestorage.app",
  messagingSenderId: "1073777041889",
  appId: "1:1073777041889:web:214966b692627d860672a0",
  measurementId: "G-QF3RN0MMDD"
};

const app = initializeApp(firebaseConfig);

// Initialize analytics with safety (ad-blockers can block this)
let analytics = null;
try {
  analytics = getAnalytics(app);
  console.log("Firebase Analytics initialized");
} catch (e) {
  console.warn("Analytics blocked or failed", e);
}

export { analytics };
export const database = getDatabase(app);
console.log("Firebase RTDB initialized for:", firebaseConfig.databaseURL);
