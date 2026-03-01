import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC_7FCXQhqYCsphfEVakzo7kV6lwhvvKhw",
  authDomain: "dragon-project-bf480.firebaseapp.com",
  projectId: "dragon-project-bf480",
  storageBucket: "dragon-project-bf480.firebasestorage.app",
  messagingSenderId: "1086447322081",
  appId: "1:1086447322081:web:3beeef25476db0becf08a0",
  measurementId: "G-SSJ8LDQ59L"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

let analytics: any;
if (typeof window !== 'undefined') {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { auth, db, googleProvider, analytics };
