import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAj1dGDK0thZz3cND4aU1O-QSjYczp2qfY",
    authDomain: "port-backend02.firebaseapp.com",
    projectId: "port-backend02",
    storageBucket: "port-backend02.firebasestorage.app",
    messagingSenderId: "1058696444756",
    appId: "1:1058696444756:web:91b5d2b77748a9ee1de6c1",
    measurementId: "G-XS8FHPZJWV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
