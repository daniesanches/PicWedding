import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVtDPygJfhW2wkkNlM1pbaxMyvK1DxhV8",
  authDomain: "pic-wedding.firebaseapp.com",
  projectId: "pic-wedding",
  storageBucket: "pic-wedding.firebasestorage.app",
  messagingSenderId: "268472563640",
  appId: "1:268472563640:web:43acfae7d5166ef3d4414d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
