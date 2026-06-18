-- ============================================================
-- QuickFix - Complete Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- for geo queries (optional)

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'provider', 'admin')) DEFAULT 'customer',
  full_name TEXT,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. SERVICE CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS service_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT,
  description TEXT,
  base_price NUMERIC(10,2) DEFAULT 299,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO service_categories (name, emoji, description, base_price) VALUES
  ('Plumber',      '🔧', 'Pipe repairs, fittings, drainage, leaks',     299),
  ('Electrician',  '⚡', 'Wiring, panel, appliance, switch repairs',    349),
  ('Carpenter',    '🪚', 'Furniture, doors, wood work, repairs',        399),
  ('Mechanic',     '🔩', 'Two-wheeler and four-wheeler repairs',        249),
  ('Painter',      '🖌️', 'Interior and exterior painting services',     350),
  ('Cleaner',      '🧹', 'Home and office deep cleaning',               199),
  ('AC Repair',    '❄️', 'AC installation, service, and gas refill',    499),
  ('Pest Control', '🐛', 'Cockroach, termite, mosquito treatment',      599)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 3. PROVIDER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  profession TEXT NOT NULL,
  bio TEXT,
  experience_years INT DEFAULT 0,
  service_radius_km FLOAT DEFAULT 5.0,
  is_available BOOLEAN DEFAULT FALSE,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  avg_rating FLOAT DEFAULT 0,
  total_reviews INT DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  commission_rate FLOAT DEFAULT 15.0,
  document_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER provider_profiles_updated_at BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE SET NULL,
  category_id INT REFERENCES service_categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','in_progress','completed','cancelled')),
  booking_type TEXT DEFAULT 'instant'
    CHECK (booking_type IN ('instant', 'scheduled')),
  scheduled_at TIMESTAMPTZ,
  service_address TEXT NOT NULL,
  service_lat DOUBLE PRECISION,
  service_lng DOUBLE PRECISION,
  description TEXT,
  estimated_price NUMERIC(10,2),
  final_price NUMERIC(10,2),
  platform_fee NUMERIC(10,2) DEFAULT 29,
  payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_method TEXT DEFAULT 'upi',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  otp_code TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

-- ============================================================
-- 5. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update provider avg_rating after review insert
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE provider_profiles
  SET
    avg_rating = (SELECT ROUND(AVG(rating)::NUMERIC, 1) FROM reviews WHERE provider_id = NEW.provider_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE provider_id = NEW.provider_id)
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_rating AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- ============================================================
-- 6. MESSAGES (Chat)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at ASC);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT CHECK (type IN ('booking_update', 'payment', 'review', 'system', 'promo')),
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifs_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifs_read ON notifications(is_read);

-- ============================================================
-- 8. EARNINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE SET NULL,
  gross_amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  net_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'on_hold')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_earnings_provider ON earnings(provider_id);

-- ============================================================
-- 9. COMMISSIONS (admin-managed)
-- ============================================================
CREATE TABLE IF NOT EXISTS commissions (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES service_categories(id) ON DELETE CASCADE,
  rate FLOAT NOT NULL DEFAULT 15.0 CHECK (rate BETWEEN 0 AND 100),
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Default commission for all categories
INSERT INTO commissions (category_id, rate)
SELECT id, 15.0 FROM service_categories
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Customers can view provider profiles" ON profiles FOR SELECT USING (role = 'provider' AND is_active = TRUE);

-- PROVIDER PROFILES policies
CREATE POLICY "Providers can view/update own profile" ON provider_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Anyone can view available providers" ON provider_profiles FOR SELECT USING (TRUE);
CREATE POLICY "Admins have full access" ON provider_profiles FOR ALL USING (get_user_role() = 'admin');

-- BOOKINGS policies
CREATE POLICY "Customers can view own bookings" ON bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can cancel bookings" ON bookings FOR UPDATE USING (auth.uid() = customer_id AND status = 'pending');
CREATE POLICY "Providers can view their bookings" ON bookings FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Providers can update booking status" ON bookings FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Admins full access to bookings" ON bookings FOR ALL USING (get_user_role() = 'admin');

-- MESSAGES policies
CREATE POLICY "Users can view messages in their bookings" ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- NOTIFICATIONS policies
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark own notifications read" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- REVIEWS policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Customers can post reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- EARNINGS policies
CREATE POLICY "Providers view own earnings" ON earnings FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Admins full access to earnings" ON earnings FOR ALL USING (get_user_role() = 'admin');

-- SERVICE CATEGORIES (public read)
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON service_categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage categories" ON service_categories FOR ALL USING (get_user_role() = 'admin');

-- ============================================================
-- REALTIME (enable for required tables)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE provider_profiles;
