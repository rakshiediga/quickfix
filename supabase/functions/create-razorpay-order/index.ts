// Edge Function: create-razorpay-order
// Deploy with: supabase functions deploy create-razorpay-order

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const authHeader = req.headers.get('Authorization')
  const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '')
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

  const { booking_id } = await req.json()
  const { data: booking } = await supabase.from('bookings').select('*').eq('id', booking_id).single()
  if (!booking) return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404, headers: corsHeaders })

  const amount = Math.round(((booking.estimated_price || 299) + (booking.platform_fee || 29)) * 100)

  // Razorpay order creation
  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')!
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
  const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)

  const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: 'INR', receipt: booking_id, notes: { booking_id } }),
  })

  const order = await rzpRes.json()
  if (order.error) return new Response(JSON.stringify({ error: order.error.description }), { status: 400, headers: corsHeaders })

  // Save Razorpay order ID
  await supabase.from('bookings').update({ razorpay_order_id: order.id }).eq('id', booking_id)

  return new Response(JSON.stringify({ order_id: order.id, amount, currency: 'INR', key: razorpayKeyId }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})
