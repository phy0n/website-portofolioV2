'use client';

import React, { useCallback, useEffect, useState } from 'react';

import GamesTab from './tabs/GamesTab';
import type { MinecraftProfile, RobloxProfile } from './types';

export default function GamesPageClient() {
  const [robloxProfile, setRobloxProfile] = useState<RobloxProfile | null>(null);
  const [robloxLoading, setRobloxLoading] = useState<boolean>(false);
  const [minecraftProfile, setMinecraftProfile] = useState<MinecraftProfile | null>(null);
  const [minecraftLoading, setMinecraftLoading] = useState<boolean>(false);

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

  const fetchMinecraftProfile = useCallback(async () => {
    setMinecraftLoading(true);
    try {
      const response = await fetch('/api/minecraft-profile?username=phy0n');

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile = (await response.json()) as MinecraftProfile;
      setMinecraftProfile(profile);
    } catch (err) {
      console.error('Failed to fetch Minecraft profile:', err);
      setMinecraftProfile(null);
    } finally {
      setMinecraftLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRobloxProfile();
    fetchMinecraftProfile();
  }, [fetchMinecraftProfile, fetchRobloxProfile]);

  return (
    <GamesTab
      robloxLoading={robloxLoading}
      robloxProfile={robloxProfile}
      onRetryRoblox={fetchRobloxProfile}
      minecraftLoading={minecraftLoading}
      minecraftProfile={minecraftProfile}
      onRetryMinecraft={fetchMinecraftProfile}
    />
  );
}
