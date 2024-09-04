import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAKKSM6z0_Jyd0tDxMxVFMyukNoquFCqQ",
  authDomain: "react-scheduler-e6676.firebaseapp.com",
  projectId: "react-scheduler-e6676",
  storageBucket: "react-scheduler-e6676.appspot.com",
  messagingSenderId: "64334060095",
  appId: "1:64334060095:web:e7c942ceef16b50b96768a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore

const db = getFirestore(app);
export default db;
//export const db = firebase.firestore(app);
