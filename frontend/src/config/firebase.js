import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDS8JFDI2GAEIj5Or05K8knPQwueGksK6k",
  authDomain: "app-store-916da.firebaseapp.com",
  projectId: "app-store-916da",
  storageBucket: "app-store-916da.firebasestorage.app",
  messagingSenderId: "866296944029",
  appId: "1:866296944029:web:0a825228cdda474a97cb74",
  measurementId: "G-QVLJWRSPDV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
