'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfiles } from '@/lib/hooks/useProfiles';
import { ProfileAvatarCard, AddProfileCard } from '@/components/profile/ProfileAvatarCard';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/lib/types';

export default function ProfilesPage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();
  const { profiles, createProfile, updateProfile, removeProfile, selectProfile, loading } =
    useProfiles(userId ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center text-foreground/50">Loading…</div>;
  }

  function handleSelect(profile: Profile) {
    selectProfile(profile.id);
    router.push('/home');
  }

  function openCreate() {
    setEditingProfile(null);
    setFormOpen(true);
  }

  function openEdit(profile: Profile) {
    setEditingProfile(profile);
    setFormOpen(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
      >
        Who&apos;s checking in today?
      </motion.h1>
      <p className="mt-2 text-sm text-foreground/55">Choose a profile or create a new one</p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-10 flex flex-wrap items-start justify-center gap-6"
      >
        {profiles.map((profile) => (
          <div key={profile.id} className="relative">
            <ProfileAvatarCard profile={profile} onSelect={() => handleSelect(profile)} onEdit={() => openEdit(profile)} />
            <button
              onClick={() => setDeleteTarget(profile)}
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger-500 shadow-soft focus-ring"
              aria-label={`Delete ${profile.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <AddProfileCard onClick={openCreate} />
      </motion.div>

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProfile ? 'Edit profile' : 'New profile'}</DialogTitle>
            <DialogDescription>
              This information helps DR.VOID give safer, more relevant guidance.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm
            initial={editingProfile ?? undefined}
            submitLabel={editingProfile ? 'Save changes' : 'Create profile'}
            onCancel={() => setFormOpen(false)}
            onSubmit={(draft) => {
              if (editingProfile) {
                updateProfile(editingProfile.id, draft);
                setFormOpen(false);
              } else if (userId) {
                const created = createProfile(draft);
                setFormOpen(false);
                selectProfile(created.id);
                router.push('/home');
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete profile?</DialogTitle>
            <DialogDescription>
              This will permanently remove {deleteTarget?.name}&apos;s profile and history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteTarget) removeProfile(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
