import { initializeApp } from 'firebase/app';
import { Platform } from 'react-native';
import {
    getAuth,
    initializeAuth,
    getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDqqCShmRgPQVl6JkKjxFdknB0Q76k8a9Q",
    authDomain: "cryptomarket-af956.firebaseapp.com",
    projectId: "cryptomarket-af956",
    storageBucket: "cryptomarket-af956.firebasestorage.app",
    messagingSenderId: "92212269826",
    appId: "1:92212269826:web:41d739719a32f6ffce281b"
};

const googleClientId = "92212269826-e120pbokv9nd033pbbledu6hk7th26ec.apps.googleusercontent.com";
const googleAndroidClientId = "92212269826-sno6ipbdikjgp4bt679lfvhc8pefv7fi.apps.googleusercontent.com";

const app = initializeApp(firebaseConfig);

let auth;

if (Platform.OS === 'web') {
    // ✅ WEB: default browser persistence
    auth = getAuth(app);
} else {
    // ✅ ANDROID / IOS: AsyncStorage persistence
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}

const db = getFirestore(app);

export { auth, db, googleClientId, googleAndroidClientId };
