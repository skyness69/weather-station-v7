import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIWF8oPhWTtGRor36hwadCVLq0FqGVpfY",
    authDomain: "pjweather-987bf.firebaseapp.com",
    databaseURL: "https://pjweather-987bf-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pjweather-987bf",
    storageBucket: "pjweather-987bf.firebasestorage.app",
    messagingSenderId: "1073777041889",
    appId: "1:1073777041889:web:214966b692627d860672a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
