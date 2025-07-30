'use client';

import { LoyaltyTransactionModel } from '@/app/modals/loyaltyTransactionModel';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === 'authenticated';
  const loading = status === 'loading';
  const user = session?.user || null;
  const [loyaltyPoints, setLoyaltyPoints] = useState({
    lifeTimePoints:0,
    realLoyaltyPoints:0,
  });

  const fetchLoyaltyPoints = async (email: string) => {
    try {
      const res = await fetch('/api/loyalty/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoyaltyPoints(data.loyaltyPoints || 0);
    } catch (error) {
      setLoyaltyPoints({
        lifeTimePoints:0,
        realLoyaltyPoints:0,
      });
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchLoyaltyPoints(session.user.email);
    }
  }, [session?.user?.email]);

  const refreshLoyaltyPoints = () => {
    if (session?.user?.email) {
      fetchLoyaltyPoints(session.user.email);
    }
  };

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
    loyaltyPoints,
    isAuthenticated,
    user,
    loading,
    logout,
    refreshAuth,
    refreshLoyaltyPoints,
  };
} 