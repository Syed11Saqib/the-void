'use client';

import { useCallback, useEffect, useState } from 'react';
import { profileStore } from '@/lib/store/profileStore';
import type { Profile, ProfileDraft } from '@/lib/types';

export function useProfiles(userId: string) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!userId) {
      setProfiles([]);
      setActiveId(null);
      return;
    }
    const all = profileStore.list().filter((p) => p.userId === userId);
    const active = profileStore.getActiveId();
    setProfiles(all);
    setActiveId(active);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(true);
      return;
    }
    refresh();
    setLoading(false);
  }, [refresh, userId]);

  const createProfile = useCallback(
    (draft: ProfileDraft) => {
      const profile = profileStore.create(userId, draft);
      refresh();
      return profile;
    },
    [userId, refresh]
  );

  const updateProfile = useCallback(
    (id: string, patch: Partial<ProfileDraft>) => {
      const updated = profileStore.update(id, patch);
      refresh();
      return updated;
    },
    [refresh]
  );

  const removeProfile = useCallback(
    (id: string) => {
      profileStore.remove(id);
      refresh();
    },
    [refresh]
  );

  const selectProfile = useCallback((id: string) => {
    profileStore.setActive(id);
    setActiveId(id);
  }, []);

  const storedActive = activeId ? profileStore.get(activeId) : null;
  const activeProfile =
    profiles.find((p) => p.id === activeId) ??
    (storedActive?.userId === userId ? storedActive : null);

  return {
    profiles,
    activeProfile,
    activeId,
    loading,
    createProfile,
    updateProfile,
    removeProfile,
    selectProfile,
    refresh,
  };
}
