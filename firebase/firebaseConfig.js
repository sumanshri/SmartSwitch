// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';

// ✅ Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyBIuJB6j7MgOq7Lp8HP0RLE0DevlcScOzA",
  authDomain: "com.sumanshri.smartswitch",
  databaseURL: "https://smart-4d0c2-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "smart-4d0c2",
  storageBucket: "smart-4d0c2.appspot.com", 
  messagingSenderId: "364953461364",
  appId: "1:364953461364:android:43d15bcfbc3d5a146de721"
};



// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Setup Firebase Authentication with persistent login
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// ✅ Get access to Realtime Database
const database = getDatabase(app);

// ✅ Export for use in app
export { auth, database };
