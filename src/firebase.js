import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDHDLett-AYkEt3ngDZCBPZZbmX8zjdAIU",
  authDomain: "unna-6c98e.firebaseapp.com",
  projectId: "unna-6c98e",
  storageBucket: "unna-6c98e.appspot.com",
  messagingSenderId: "212998177734",
  appId: "1:212998177734:web:4a4383388ba4b94ee2a8c7",
  measurementId: "G-LHHFSH5E5C"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { firestore, auth };