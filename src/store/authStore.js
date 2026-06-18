import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      role: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile, role: profile?.role }),
      setLoading: (isLoading) => set({ isLoading }),

      initialize: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            set({ user: session.user, isAuthenticated: true });
            await get().fetchProfile(session.user.id);
          }
        } catch (e) {
          // Supabase not configured — demo mode
          console.warn('Supabase not configured. Running in demo mode.');
        }
        set({ isLoading: false });

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            set({ user: session.user, isAuthenticated: true });
            await get().fetchProfile(session.user.id);
          } else {
            set({ user: null, profile: null, role: null, isAuthenticated: false });
          }
        });
      },

      fetchProfile: async (userId) => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (data) {
            set({ profile: data, role: data.role });
            return data;
          }
        } catch (e) {
          console.warn('Profile fetch skipped — demo mode');
        }
        return null;
      },

      signOut: async () => {
        try { await supabase.auth.signOut(); } catch (e) {}
        set({ user: null, profile: null, role: null, isAuthenticated: false });
      },
    }),
    {
      name: 'quickfix-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
