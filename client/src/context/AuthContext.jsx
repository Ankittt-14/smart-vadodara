import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { api } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('smart_vadodara_token') || null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null);
  const pendingCreds = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          setEmailVerified(false);
          setPendingVerificationEmail(firebaseUser.email);
          await signOut(auth);
          setUser(null);
          setToken(null);
          localStorage.removeItem('smart_vadodara_user');
          localStorage.removeItem('smart_vadodara_token');
          delete api.defaults.headers.common['Authorization'];
        } else {
          setEmailVerified(true);
          setPendingVerificationEmail(null);
          pendingCreds.current = null;
          const idToken = await firebaseUser.getIdToken();
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Citizen',
            role: 'citizen',
            wardId: null,
            title: 'Citizen',
            photoURL: firebaseUser.photoURL,
          };
          setUser(userData);
          setToken(idToken);
          localStorage.setItem('smart_vadodara_user', JSON.stringify(userData));
          localStorage.setItem('smart_vadodara_token', idToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('smart_vadodara_user');
        localStorage.removeItem('smart_vadodara_token');
        delete api.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithEmail = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred.user.emailVerified) {
      pendingCreds.current = { email, password };
      setPendingVerificationEmail(cred.user.email);
      await sendEmailVerification(cred.user);
      await signOut(auth);
      const err = new Error('Email not verified');
      err.code = 'auth/email-not-verified';
      throw err;
    }
    pendingCreds.current = null;
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  };

  const registerCitizen = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    pendingCreds.current = { email, password };
    await sendEmailVerification(cred.user);
    setPendingVerificationEmail(email);
    await signOut(auth);
    return cred.user;
  };

  const loginWithCredentials = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: authToken, user: userData } = res.data;
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('smart_vadodara_user', JSON.stringify(userData));
    localStorage.setItem('smart_vadodara_token', authToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    return userData;
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      return;
    }
    if (pendingCreds.current) {
      const cred = await signInWithEmailAndPassword(auth, pendingCreds.current.email, pendingCreds.current.password);
      await sendEmailVerification(cred.user);
      await signOut(auth);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
    pendingCreds.current = null;
    setToken(null);
    setUser(null);
    setEmailVerified(false);
    setPendingVerificationEmail(null);
    localStorage.removeItem('smart_vadodara_user');
    localStorage.removeItem('smart_vadodara_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const isOfficer = user && (user.role === 'ward_officer' || user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!user,
        loading,
        emailVerified,
        pendingVerificationEmail,
        isOfficer,
        isAdmin: user?.role === 'admin',
        loginWithEmail,
        loginWithGoogle,
        loginWithCredentials,
        registerCitizen,
        resendVerificationEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
