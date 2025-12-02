// Authentication hook for Firebase
// This will handle user authentication state

import { useState, useEffect } from 'react';

// Uncomment when Firebase is configured:
/*
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
*/

// Placeholder for development
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  return { user, loading };
}
