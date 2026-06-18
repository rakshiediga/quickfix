import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useBookingStore = create((set, get) => ({
  bookings: [],
  activeBooking: null,
  isLoading: false,

  setActiveBooking: (booking) => set({ activeBooking: booking }),

  fetchCustomerBookings: async (customerId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, provider:provider_id(id, full_name, avatar_url, phone), category:category_id(name, icon)`)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (!error) set({ bookings: data || [] });
    set({ isLoading: false });
  },

  fetchProviderBookings: async (providerId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, customer:customer_id(id, full_name, avatar_url, phone), category:category_id(name, icon)`)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    if (!error) set({ bookings: data || [] });
    set({ isLoading: false });
  },

  updateBookingStatus: async (bookingId, status) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();
    if (!error) {
      set((state) => ({
        bookings: state.bookings.map((b) => b.id === bookingId ? data : b),
        activeBooking: state.activeBooking?.id === bookingId ? data : state.activeBooking,
      }));
    }
    return { data, error };
  },
}));

export default useBookingStore;
