import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updatePassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth';
import { auth, googleClientId } from '../config/firebase';

WebBrowser.maybeCompleteAuthSession();

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const googleProxyBase = 'https://auth.expo.io/@aminezmarrou/CryptoMarket';
  const googleReturnUrl = Linking.createURL('expo-auth-session');

  const buildGoogleAuthUrl = () => {
    const nonce = `${Math.random().toString(36).slice(2)}${Date.now()}`;
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: googleProxyBase,
      response_type: 'id_token',
      scope: 'openid profile email',
      nonce,
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth);
  };

  const changePassword = async (newPassword) => {
    if (auth.currentUser) {
      return updatePassword(auth.currentUser, newPassword);
    }
    throw new Error("No user logged in");
  };

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const loginWithGoogle = async () => {
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      console.log('[GoogleAuth] Web sign-in, redirect uses popup');
      return signInWithPopup(auth, provider);
    }
    const authUrl = buildGoogleAuthUrl();
    const proxyUrl = `${googleProxyBase}/start?${new URLSearchParams({
      authUrl,
      returnUrl: googleReturnUrl,
    }).toString()}`;
    console.log('[GoogleAuth] Starting auth session', {
      proxyUrl,
      returnUrl: googleReturnUrl,
    });
    const result = await WebBrowser.openAuthSessionAsync(proxyUrl, googleReturnUrl);
    console.log('[GoogleAuth] Response', result);
    if (result.type !== 'success' || !result.url) {
      throw new Error('Google sign-in cancelled.');
    }
    const parsed = new URL(result.url, 'https://phony.example');
    const params = new URLSearchParams(parsed.search);
    if (parsed.hash) {
      new URLSearchParams(parsed.hash.replace(/^#/, '')).forEach((value, key) => {
        params.set(key, value);
      });
    }
    const idToken = params.get('id_token');
    if (!idToken) {
      throw new Error('Missing id_token from Google.');
    }
    const credential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(auth, credential);
  };

  return (
    <UserContext.Provider value={{ user, login, register, logout, changePassword, resetPassword, loginWithGoogle, loading }}>
      {children}
    </UserContext.Provider>
  );
};
