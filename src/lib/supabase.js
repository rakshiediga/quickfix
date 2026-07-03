/**
 * supabase.js — STUB (Supabase replaced by FastAPI + MySQL)
 * This file is kept as a stub so that any lingering references do not
 * crash. All actual data operations now go through src/lib/api.js
 */

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOtp: async () => ({ data: null, error: new Error('Supabase replaced by FastAPI') }),
    verifyOtp: async () => ({ data: null, error: new Error('Supabase replaced by FastAPI') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase replaced by FastAPI') }),
    signUp: async () => ({ data: null, error: new Error('Supabase replaced by FastAPI') }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
    upsert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
    insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
    update: () => ({ eq: () => ({ select: async () => ({ data: null, error: null }) }) }),
  }),
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
    subscribe: () => {},
    unsubscribe: () => {},
  }),
};
