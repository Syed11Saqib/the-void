'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, getSupabaseBrowserClient } from '@/lib/services/supabaseClient';

interface AuthState {
  userId: string | null;
  isGuest: boolean;
  loading: boolean;
}

export function useAuth(): AuthState {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ userId: null, isGuest: false, loading: true });

  useEffect(() => {
    let mounted = true;

    async function resolve() {
      const guestId = window.localStorage.getItem('drvoid:guest_id');

      if (isSupabaseConfigured()) {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.id) {
          if (mounted) setState({ userId: data.session.user.id, isGuest: false, loading: false });
          return;
        }
      }

      if (guestId) {
        if (mounted) setState({ userId: guestId, isGuest: true, loading: false });
        return;
      }

      if (mounted) {
        setState({ userId: null, isGuest: false, loading: false });
        router.replace('/');
      }
    }

    resolve();
    return () => {
      mounted = false;
    };
  }, [router]);

  return state;
}
