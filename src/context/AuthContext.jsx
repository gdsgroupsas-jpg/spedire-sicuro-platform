import { createContext, useContext, useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const AuthContext = createContext()

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [db, setDb] = useState(null)
  const [auth, setAuth] = useState(null)

  useEffect(() => {
    // Check if Firebase config is available
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase config not found. Running in demo mode.')
      setLoading(false)
      setUser({ uid: 'demo-user', isDemo: true })
      return
    }

    const app = initializeApp(firebaseConfig)
    const authInstance = getAuth(app)
    const dbInstance = getFirestore(app)

    setAuth(authInstance)
    setDb(dbInstance)

    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAnonymous: firebaseUser.isAnonymous
        })
      } else {
        // Try custom token first
        const customToken = typeof window !== 'undefined'
          ? window.__initial_auth_token
          : null

        try {
          if (customToken) {
            await signInWithCustomToken(authInstance, customToken)
          } else {
            await signInAnonymously(authInstance)
          }
        } catch (error) {
          console.error('Authentication error:', error)
          setUser(null)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    db,
    auth,
    isAuthenticated: !!user,
    isDemo: user?.isDemo || false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
