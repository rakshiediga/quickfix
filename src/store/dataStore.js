/**
 * dataStore.js
 * Central data access layer.
 * - In demo mode: reads from localStorage (quickfix_demo_profiles, quickfix_all_providers, quickfix_bookings)
 * - In real mode: reads from Supabase
 */
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const isConfigured = () =>
  import.meta.env.VITE_SUPABASE_URL?.startsWith('https://');

const useDataStore = create((set, get) => ({
  providers: [],       // all approved providers
  bookings: [],        // bookings for current user
  reviews: [],         // reviews for current provider
  isLoading: false,
  error: null,

  // ── Fetch all providers (for CustomerHome / Search) ──────────────────────
  fetchProviders: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (isConfigured()) {
        let query = supabase
          .from('profiles')
          .select(`
            id, full_name, phone, avatar_url, city, state,
            provider_profiles (
              profession, experience_years, avg_rating, total_reviews,
              service_charge, per_visit_charge, is_available,
              current_lat, current_lng, service_radius_km, bio,
              working_days, working_hours_start, working_hours_end,
              emergency_available, service_areas, languages
            )
          `)
          .eq('role', 'provider')
          .eq('setup_complete', true);

        const { data, error } = await query;
        if (error) throw error;

        const flat = (data || []).map(p => ({
          ...p,
          ...(p.provider_profiles || {}),
          lat: p.provider_profiles?.current_lat,
          lng: p.provider_profiles?.current_lng,
        }));
        set({ providers: flat, isLoading: false });
        return flat;
      }

      // Demo mode — read from localStorage
      const raw = localStorage.getItem('quickfix_all_providers');
      const all = raw ? JSON.parse(raw) : [];
      // Only approved / setup_complete providers
      const approved = all.filter(p => p.setup_complete && p.role === 'provider');
      set({ providers: approved, isLoading: false });
      return approved;
    } catch (e) {
      console.error('fetchProviders error:', e);
      set({ providers: [], isLoading: false, error: e.message });
      return [];
    }
  },

  // ── Fetch single provider by ID ─────────────────────────────────────────
  fetchProviderById: async (id) => {
    try {
      if (isConfigured()) {
        const { data } = await supabase
          .from('profiles')
          .select(`*, provider_profiles (*)`)
          .eq('id', id)
          .single();
        if (data) return { ...data, ...(data.provider_profiles || {}), lat: data.provider_profiles?.current_lat, lng: data.provider_profiles?.current_lng };
      }

      // Demo: check quickfix_demo_profiles first, then all_providers
      const profiles = JSON.parse(localStorage.getItem('quickfix_demo_profiles') || '{}');
      if (profiles[id]) return profiles[id];

      const all = JSON.parse(localStorage.getItem('quickfix_all_providers') || '[]');
      return all.find(p => p.id === id) || null;
    } catch (e) {
      return null;
    }
  },

  // ── Fetch bookings ───────────────────────────────────────────────────────
  fetchBookings: async (userId, role = 'customer') => {
    set({ isLoading: true });
    try {
      if (isConfigured()) {
        const field = role === 'provider' ? 'provider_id' : 'customer_id';
        const { data } = await supabase
          .from('bookings')
          .select('*, customer:customer_id(full_name, phone, avatar_url), provider:provider_id(full_name, phone, avatar_url)')
          .eq(field, userId)
          .order('created_at', { ascending: false });
        set({ bookings: data || [], isLoading: false });
        return data || [];
      }

      // Demo mode
      const all = JSON.parse(localStorage.getItem('quickfix_bookings') || '[]');
      const field = role === 'provider' ? 'provider_id' : 'customer_id';
      const filtered = all.filter(b => b[field] === userId);
      set({ bookings: filtered, isLoading: false });
      return filtered;
    } catch (e) {
      set({ bookings: [], isLoading: false });
      return [];
    }
  },

  // ── Fetch reviews for a provider ─────────────────────────────────────────
  fetchReviews: async (providerId) => {
    set({ isLoading: true });
    try {
      if (isConfigured()) {
        const { data } = await supabase
          .from('reviews')
          .select('*, customer:customer_id(full_name, avatar_url)')
          .eq('provider_id', providerId)
          .order('created_at', { ascending: false });
        set({ reviews: data || [], isLoading: false });
        return data || [];
      }

      // Demo mode
      const all = JSON.parse(localStorage.getItem('quickfix_reviews') || '[]');
      const filtered = all.filter(r => r.provider_id === providerId);
      set({ reviews: filtered, isLoading: false });
      return filtered;
    } catch (e) {
      set({ reviews: [], isLoading: false });
      return [];
    }
  },

  // ── Update booking status ────────────────────────────────────────────────
  updateBookingStatus: async (bookingId, status) => {
    try {
      if (isConfigured()) {
        const { data } = await supabase
          .from('bookings')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', bookingId)
          .select()
          .single();
        set(state => ({
          bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status } : b)
        }));
        return data;
      }

      // Demo mode
      const all = JSON.parse(localStorage.getItem('quickfix_bookings') || '[]');
      const updated = all.map(b => b.id === bookingId ? { ...b, status } : b);
      localStorage.setItem('quickfix_bookings', JSON.stringify(updated));
      set(state => ({
        bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status } : b)
      }));
    } catch (e) {
      console.error('updateBookingStatus error:', e);
    }
  },

  clearData: () => set({ providers: [], bookings: [], reviews: [] }),
}));

export default useDataStore;
