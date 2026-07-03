import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

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
        const token = localStorage.getItem('quickfix_token');
        if (token) {
          try {
            const user = await api.get('/auth/profile');
            if (user) {
              set({ user, isAuthenticated: true });
              await get().fetchProfile(user.id);
            } else {
              get().signOut();
            }
          } catch (e) {
            console.warn('Authentication token invalid or expired. Signing out.');
            get().signOut();
          }
        } else {
          set({ user: null, profile: null, role: null, isAuthenticated: false });
        }
        set({ isLoading: false });
      },

      fetchProfile: async (userId) => {
        if (!userId) return null;
        try {
          const role = get().role || 'customer';
          const endpoint = role === 'provider' ? '/provider/profile' : '/customer/profile';
          const data = await api.get(endpoint);
          if (data) {
            // Unify response role for standard store mapping
            const unified = { ...data, id: data.user_id, role: get().role };
            set({ profile: unified });
            return unified;
          }
        } catch (e) {
          console.warn('Profile fetch error from backend:', e);
        }
        return null;
      },

      signOut: async () => {
        localStorage.removeItem('quickfix_token');
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

