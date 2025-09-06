import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore by querying email
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', user.email));
          const querySnapshot = await getDocs(q);
          const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

          if (usersList.length > 0) {
            // User found in the users collection
            const userData = querySnapshot.docs[0].data();
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              ...userData
            });
          } else {
            // If user doesn't exist in users collection, create a basic user object
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: 'customer' // Default role
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user data if there's an error
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            role: 'customer'
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const value = {
    currentUser,
    loading,
    signOut,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!currentUser) {
    // Redirect to login or show not authorized
    window.location.href = '/login';
    return null;
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
};
