/**
 * db.js — Central data abstraction for QuickFix
 * Directs all operations to the FastAPI backend API router
 */

import { api } from './api';

// ─── PROVIDERS ────────────────────────────────────────────────────────────────

export async function fetchNearbyProviders({ userLat, userLng, radiusKm = 10, category = null } = {}) {
  let endpoint = `/provider/list?radius=${radiusKm}`;
  if (userLat != null && userLng != null) {
    endpoint += `&lat=${userLat}&lng=${userLng}`;
  }
  if (category && category !== 'all') {
    endpoint += `&category=${category}`;
  }
  return api.get(endpoint);
}

export async function getProviderById(id) {
  return api.get(`/provider/profile/${id}`);
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

export async function createBooking({ customerId, providerId, serviceType, scheduledAt, address, notes, amount }) {
  return api.post('/booking/create', {
    provider_id: providerId,
    service_name: serviceType,
    scheduled_at: scheduledAt,
    address,
    notes,
    amount,
  });
}

export async function getBookingById(bookingId) {
  return api.get(`/booking/detail/${bookingId}`);
}

export async function getBookings(userId, role = 'customer') {
  return api.get('/booking/list');
}

export async function updateBookingStatus(bookingId, status, extras = {}) {
  return api.put(`/booking/status/${bookingId}`, { status, ...extras });
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export async function createNotification({ userId, type, title, body, bookingId = null }) {
  // Notifications are created backend-side, but if we need manual logs:
  return null;
}

export async function getNotifications(userId) {
  return api.get('/notifications/list');
}

export async function markNotificationsRead(userId) {
  return api.put('/notifications/read');
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export async function getReviews(providerId) {
  return api.get(`/reviews/provider/${providerId}`);
}

export async function submitReview({ bookingId, customerId, providerId, rating, comment }) {
  return api.post('/reviews/submit', {
    booking_id: bookingId,
    provider_id: providerId,
    rating,
    comment,
  });
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export async function getChatMessages(bookingId) {
  return api.get(`/chats/history/${bookingId}`);
}

export async function sendChatMessage({ bookingId, senderId, senderRole, message }) {
  return api.post(`/chats/send/${bookingId}`, { message });
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export async function getPendingProviders() {
  return api.get('/admin/providers');
}

export async function approveProvider(providerId, approved = true) {
  return api.put(`/admin/approve/${providerId}?approved=${approved ? 'true' : 'false'}`);
}
