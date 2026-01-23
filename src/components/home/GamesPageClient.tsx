'use client';

import React, { useCallback, useEffect, useState } from 'react';

import GamesTab from './tabs/GamesTab';
import type { RobloxProfile } from './types';

export default function GamesPageClient() {
  const [robloxProfile, setRobloxProfile] = useState<RobloxProfile | null>(null);
  const [robloxLoading, setRobloxLoading] = useState<boolean>(false);

  const fetchRobloxProfile = useCallback(async () => {
    setRobloxLoading(true);
    try {
      const response = await fetch('/api/roblox-profile?userId=8883015179');

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile = await response.json();
      setRobloxProfile(profile);
    } catch (err) {
      console.error('Failed to fetch Roblox profile:', err);
      setRobloxProfile(null);
    } finally {
      setRobloxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRobloxProfile();
  }, [fetchRobloxProfile]);

  return <GamesTab robloxLoading={robloxLoading} robloxProfile={robloxProfile} onRetry={fetchRobloxProfile} />;
}
