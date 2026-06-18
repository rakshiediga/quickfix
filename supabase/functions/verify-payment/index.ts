// Edge Function: verify-payment (Razorpay webhook)
// Deploy with: supabase functions deploy verify-payment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts'

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = await req.json()

  // Verify Razorpay signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const secret = Deno.env.get('RAZORPAY_KEY_SECRET')!
  const expectedSignature = createHmac('sha256', secret).update(body).digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return new Response(JSON.stringify({ error: 'Invalid payment signature' }), { status: 400, headers: corsHeaders })
  }

  // Update booking payment status
  const { data: booking } = await supabase.from('bookings')
    .update({ payment_status: 'paid', razorpay_payment_id, razorpay_signature, updated_at: new Date().toISOString() })
    .eq('id', booking_id).select().single()

  // Create earnings record for provider
  if (booking) {
    const gross = (booking.estimated_price || 299) + (booking.platform_fee || 29)
    const commissionRate = 0.15
    const commission = Math.round(gross * commissionRate * 100) / 100
    const net = Math.round((gross - commission) * 100) / 100

    await supabase.from('earnings').insert({
      provider_id: booking.provider_id,
      booking_id: booking.id,
      gross_amount: gross,
      commission_amount: commission,
      net_amount: net,
      status: 'pending',
    })

    // Notify customer
    await supabase.from('notifications').insert({
      user_id: booking.customer_id,
      title: '✅ Payment Successful!',
      body: `₹${gross} paid. Booking #${booking.id} confirmed.`,
      type: 'payment',
      metadata: { booking_id: booking.id },
    })
  }

  return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
