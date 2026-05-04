import { NextRequest, NextResponse } from 'next/server'
import PocketBase from 'pocketbase'
import { buildPayFastForm, getPayFastProcessUrl } from '@/lib/payfast'
import crypto from 'crypto'

const TIER_PRICES_CENTS: Record<string, number> = {
  basic: 19900,
  'pro-lead': 79900,
  'pro-business': 1050000,
}

const TIER_LABELS: Record<string, string> = {
  basic: 'Basic Listing (Annual)',
  'pro-lead': 'Pro Lead Package (Annual)',
  'pro-business': 'Pro Business Listing (Annual)',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      first_name,
      last_name,
      business_name,
      sector,
      area,
      phone,
      whatsapp,
      website,
      description,
      tier,
    } = body

    // Validate required fields
    if (!email || !password || !business_name || !tier || !TIER_PRICES_CENTS[tier]) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, business_name, tier' },
        { status: 400 }
      )
    }

    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
    const pb = new PocketBase(pbUrl)

    // Create user account
    let user: any = null
    try {
      user = await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name: [first_name, last_name].filter(Boolean).join(' ') || business_name,
      })
    } catch (e: any) {
      const msg = e?.response?.data || e?.message || 'Unknown error'
      console.error('User creation error:', msg)
      return NextResponse.json(
        { error: 'Could not create account. Email may already be in use.' },
        { status: 409 }
      )
    }

    // Authenticate as the new user
    try {
      await pb.collection('users').authWithPassword(email, password)
    } catch (e) {
      console.error('Auth error after user creation:', e)
      return NextResponse.json({ error: 'Account created but could not sign in.' }, { status: 500 })
    }

    // Create business record (pending until payment confirmed)
    let business: any = null
    try {
      business = await pb.collection('businesses').create({
        name: business_name,
        owner: user.id,
        sector: sector || null,
        area: area || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        email: email,
        website: website || null,
        description: description || null,
        package_tier: tier,
        status: 'pending',
        is_featured: false,
        is_verified: false,
      })
    } catch (e) {
      console.error('Business creation error:', e)
      return NextResponse.json({ error: 'Could not create business listing.' }, { status: 500 })
    }

    const amountCents = TIER_PRICES_CENTS[tier]
    const amountZar = (amountCents / 100).toFixed(2)

    // Create subscription record
    let subscription: any = null
    try {
      subscription = await pb.collection('subscriptions').create({
        business: business.id,
        tier,
        status: 'pending',
        amount_cents: amountCents,
      })
    } catch (e) {
      console.error('Subscription creation error:', e)
    }

    // Create payment record
    let payment: any = null
    try {
      payment = await pb.collection('payments').create({
        business: business.id,
        subscription: subscription?.id || null,
        amount_cents: amountCents,
        provider: 'payfast',
        status: 'pending',
        description: `${tier} listing — ${business_name}`,
      })
    } catch (e) {
      console.error('Payment creation error:', e)
      return NextResponse.json({ error: 'Could not create payment record.' }, { status: 500 })
    }

    const merchantId = process.env.PAYFAST_MERCHANT_ID
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY
    if (!merchantId || !merchantKey) {
      return NextResponse.json(
        { error: 'Payment provider not configured' },
        { status: 500 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const formFields = buildPayFastForm({
      merchantId,
      merchantKey,
      returnUrl: `${siteUrl}/api/payments/return`,
      cancelUrl: `${siteUrl}/buy-your-spot?payment=cancelled`,
      notifyUrl: `${siteUrl}/api/payments/notify`,
      firstName: first_name || '',
      lastName: last_name || '',
      email,
      paymentId: payment.id,
      amount: amountZar,
      itemName: TIER_LABELS[tier] || `${tier} listing`,
      itemDescription: `${business_name} — ${tier} package`,
      customStr1: business.id,
      customStr2: subscription?.id || '',
      customStr3: tier,
      passphrase: process.env.PAYFAST_PASSPHRASE,
    })

    // Set auth cookie so the user is logged in after returning from PayFast
    const authCookie = pb.authStore.exportToCookie({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    })

    const response = NextResponse.json({
      payment_id: payment.id,
      business_id: business.id,
      subscription_id: subscription?.id,
      payfast_url: getPayFastProcessUrl(),
      form_fields: formFields,
    })

    response.headers.set('Set-Cookie', authCookie)

    return response
  } catch (error) {
    console.error('Setup payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
