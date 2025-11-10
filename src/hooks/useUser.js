// hooks/useUser.js
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';

export const useUser = (initialUser = null) => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);

  const refreshUser = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await getCurrentUser();
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      console.error('Failed to refresh user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh on mount if user exists
  useEffect(() => {
    if (user?.id) {
      refreshUser();
    }
  }, [user?.id]);

  return { user, setUser, refreshUser, loading };
};