import type { Profile, ProfileDraft } from '@/lib/types';

const PERSIST_KEY = 'drvoid:profiles';
const TEMP_KEY = 'drvoid:temp_profiles';
const ACTIVE_KEY = 'drvoid:active_profile_id';

function readPersisted(): Profile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    return raw ? (JSON.parse(raw) as Profile[]) : [];
  } catch {
    return [];
  }
}

function writePersisted(profiles: Profile[]) {
  window.localStorage.setItem(PERSIST_KEY, JSON.stringify(profiles));
}

function readTemp(): Profile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(TEMP_KEY);
    return raw ? (JSON.parse(raw) as Profile[]) : [];
  } catch {
    return [];
  }
}

function writeTemp(profiles: Profile[]) {
  window.sessionStorage.setItem(TEMP_KEY, JSON.stringify(profiles));
}

/**
 * Local-first profile store.
 * Temporary profiles live in sessionStorage so they vanish when the
 * browser/tab closes. Permanent profiles persist in localStorage.
 * This module is the single integration point to swap for Supabase later —
 * every function here has a 1:1 mapping to a future supabase query.
 */
export const profileStore = {
  list(): Profile[] {
    return [...readPersisted(), ...readTemp()];
  },

  get(id: string): Profile | null {
    return this.list().find((p) => p.id === id) ?? null;
  },

  create(userId: string, draft: ProfileDraft): Profile {
    const now = new Date().toISOString();
    const profile: Profile = {
      ...draft,
      id: crypto.randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
    };

    if (draft.isTemporary) {
      writeTemp([...readTemp(), profile]);
    } else {
      writePersisted([...readPersisted(), profile]);
    }
    return profile;
  },

  update(id: string, patch: Partial<ProfileDraft>): Profile | null {
    const persisted = readPersisted();
    const idxP = persisted.findIndex((p) => p.id === id);
    if (idxP !== -1) {
      const updated = { ...persisted[idxP]!, ...patch, id, updatedAt: new Date().toISOString() } as Profile;
      persisted[idxP] = updated;
      writePersisted(persisted);
      return updated;
    }

    const temp = readTemp();
    const idxT = temp.findIndex((p) => p.id === id);
    if (idxT !== -1) {
      const updated = { ...temp[idxT]!, ...patch, id, updatedAt: new Date().toISOString() } as Profile;
      temp[idxT] = updated;
      writeTemp(temp);
      return updated;
    }
    return null;
  },

  remove(id: string): void {
    writePersisted(readPersisted().filter((p) => p.id !== id));
    writeTemp(readTemp().filter((p) => p.id !== id));
    if (this.getActiveId() === id) this.clearActive();
  },

  setActive(id: string) {
    window.localStorage.setItem(ACTIVE_KEY, id);
  },

  getActiveId(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACTIVE_KEY);
  },

  clearActive() {
    window.localStorage.removeItem(ACTIVE_KEY);
  },
};

export const AVATAR_COLORS = ['#1FB088', '#2C8FE8', '#F2940B', '#D32418', '#7C5CFA', '#13A6A0'];
export const AVATAR_EMOJIS = ['🙂', '👩', '👨', '👧', '👦', '👵', '👴', '🧑'];
