'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Simple client-side cache
const authCache = {
  data: null as any,
  timestamp: 0,
  duration: 5 * 60 * 1000, // 5 minutes
};

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async (force = false) => {
    // Check cache first
    if (!force && authCache.data && (Date.now() - authCache.timestamp) < authCache.duration) {
      setIsAuthenticated(authCache.data.isAuth);
      setUser(authCache.data.user);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
        cache: 'no-store', // Don't cache the fetch request
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
        
        // Update cache
        authCache.data = { isAuth: true, user: data.user };
        authCache.timestamp = Date.now();
      } else {
        setIsAuthenticated(false);
        setUser(null);
        
        // Update cache
        authCache.data = { isAuth: false, user: null };
        authCache.timestamp = Date.now();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      
      // Update cache
      authCache.data = { isAuth: false, user: null };
      authCache.timestamp = Date.now();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear cache
      authCache.data = null;
      authCache.timestamp = 0;
      
      setIsAuthenticated(false);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  const refreshAuth = useCallback(() => {
    checkAuth(true); // Force refresh
  }, [checkAuth]);

  return {
    isAuthenticated,
    user,
    loading,
    logout,
    refreshAuth,
  };
} 