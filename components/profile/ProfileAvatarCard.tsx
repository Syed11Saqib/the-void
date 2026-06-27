'use client';

import { motion } from 'framer-motion';
import { Pencil, Plus, Clock } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ProfileAvatarCard({
  profile,
  onSelect,
  onEdit,
}: {
  profile: Profile;
  onSelect: () => void;
  onEdit: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.96 }}
      className="group relative flex flex-col items-center gap-2"
    >
      <div className="relative h-24 w-24 sm:h-28 sm:w-28">
        <button
          onClick={onSelect}
          className="relative flex h-full w-full items-center justify-center rounded-3xl text-4xl shadow-glass transition-shadow focus-ring"
          style={{ background: `${profile.avatarColor}22`, border: `2px solid ${profile.avatarColor}55` }}
        >
          <span>{profile.avatarEmoji}</span>
          {profile.isTemporary && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-warn-400 text-white shadow-soft">
              <Clock className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-foreground/70 shadow-soft transition-colors hover:bg-white hover:text-foreground focus-ring"
          aria-label={`Edit ${profile.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
      <span className="max-w-[7rem] truncate text-sm font-medium text-foreground/80">{profile.name}</span>
    </motion.div>
  );
}

export function AddProfileCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        'flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-mint-300 bg-white/40 text-mint-600 shadow-soft focus-ring sm:h-28 sm:w-28'
      )}
    >
      <Plus className="h-7 w-7" />
    </motion.button>
  );
}
