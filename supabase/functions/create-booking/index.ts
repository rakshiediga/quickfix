// Edge Function: create-booking
// Deploy with: supabase functions deploy create-booking

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const authHeader = req.headers.get('Authorization')
  const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '')
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

  const body = await req.json()
  const { provider_id, category_id, service_address, service_lat, service_lng, description, booking_type, scheduled_at } = body

  // Generate OTP for service completion
  const otp_code = Math.floor(1000 + Math.random() * 9000).toString()

  // Get category price
  const { data: category } = await supabase.from('service_categories').select('base_price').eq('id', category_id).single()
  const estimated_price = category?.base_price || 299
  const platform_fee = 29

  const { data: booking, error } = await supabase.from('bookings').insert({
    customer_id: user.id,
    provider_id,
    category_id,
    service_address,
    service_lat,
    service_lng,
    description,
    booking_type: booking_type || 'instant',
    scheduled_at,
    estimated_price,
    platform_fee,
    otp_code,
    status: 'pending',
  }).select().single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })

  // Notify provider
  await supabase.from('notifications').insert({
    user_id: provider_id,
    title: '🔔 New Booking Request!',
    body: `You have a new ${booking_type} booking for ${service_address}`,
    type: 'booking_update',
    metadata: { booking_id: booking.id },
  })

  return new Response(JSON.stringify({ booking }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
