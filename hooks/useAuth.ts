'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === 'authenticated';
  const loading = status === 'loading';
  const user = session?.user || null;

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshAuth = () => {
    // NextAuth handles session refresh automatically
    // This function is kept for compatibility but doesn't need to do anything
  };

  return {
    isAuthenticated,
    user,
    loading,
    logout,
    refreshAuth,
  };
} 