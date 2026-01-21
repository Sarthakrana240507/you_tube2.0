// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3anC_HLNYsqTqIVJO-VtsrlOlzQWGd6U",
  authDomain: "yourtube-f5eb8.firebaseapp.com",
  projectId: "yourtube-f5eb8",
  storageBucket: "yourtube-f5eb8.firebasestorage.app",
  messagingSenderId: "248406226951",
  appId: "1:248406226951:web:48a9fa96df41784d27d2a2",
  measurementId: "G-EWFH83FHLJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
