// Public: Create a Stripe Checkout Session for the next due payment
// Supports cards + ACH via Stripe Checkout

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import Stripe from 'stripe';
import { getShareTokenByHash, listPaymentSchedule, appendAuditEvent, getFileById } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ token: string }> };

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const stripe = getStripe();
    const { token } = await params;
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const shareToken = await getShareTokenByHash(tokenHash);

    if (!shareToken) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 });
    }

    const fileId = shareToken.fileId;
    const body = await request.json().catch(() => ({}));
    const { scheduleId, tipAmountCents = 0 } = body;

    const file = await getFileById(fileId);
    if (!file) return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });

    const schedule = await listPaymentSchedule(fileId);

    // Find the target payment — either the specified one or the next pending
    const target = scheduleId
      ? schedule.find((s) => s.id === Number(scheduleId) && s.status === 'pending')
      : schedule.find((s) => s.status === 'pending');

    if (!target) {
      return NextResponse.json({ success: false, error: 'No pending payment found' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://externallyyyoursproductions.com';

    type StripeCreateParams = NonNullable<Parameters<typeof stripe.checkout.sessions.create>[0]>;
    type StripeLineItem = NonNullable<StripeCreateParams['line_items']>[number];
    const lineItems: StripeLineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: target.label,
            description: `${file.title} — Externally Yours Productions, LLC`,
          },
          unit_amount: target.amountCents,
        },
        quantity: 1,
      },
    ];

    // Add optional tip
    if (tipAmountCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Gratuity / Tip', description: 'Thank you!' },
          unit_amount: tipAmountCents,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'us_bank_account'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: shareToken.recipientEmail,
      success_url: `${baseUrl}/s/${token}?payment=success`,
      cancel_url: `${baseUrl}/s/${token}?payment=cancelled`,
      metadata: {
        fileId: String(fileId),
        scheduleId: String(target.id),
        token,
        recipientEmail: shareToken.recipientEmail,
      },
      payment_intent_data: {
        metadata: {
          fileId: String(fileId),
          scheduleId: String(target.id),
        },
      },
    });

    await appendAuditEvent({
      fileId,
      actorType: 'client',
      actorId: shareToken.recipientEmail,
      event: 'checkout_initiated',
      payload: { scheduleId: target.id, amountCents: target.amountCents, tipAmountCents, sessionId: session.id },
    });

    return NextResponse.json({ success: true, data: { checkoutUrl: session.url } });
  } catch (error) {
    console.error('POST /public/[token]/checkout error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create checkout session' }, { status: 500 });
  }
}
