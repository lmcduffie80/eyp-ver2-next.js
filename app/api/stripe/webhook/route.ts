import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature failed: ${String(err)}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { fileId, scheduleId } = session.metadata ?? {};
      if (fileId && scheduleId) {
        await sql`UPDATE sf_payment_schedule SET status = 'paid', stripe_payment_intent_id = ${String(session.payment_intent ?? '')} WHERE id = ${Number(scheduleId)} AND file_id = ${Number(fileId)}`;
        const amountPaid = session.amount_total ?? 0;
        await sql`INSERT INTO sf_payments (file_id, schedule_id, amount_cents, method, stripe_charge_id, paid_at) VALUES (${Number(fileId)}, ${Number(scheduleId)}, ${amountPaid}, 'stripe', ${String(session.payment_intent ?? '')}, NOW())`;
        await sql`INSERT INTO sf_audit_log (file_id, actor_type, event, payload) VALUES (${Number(fileId)}, 'system', 'payment_received', ${JSON.stringify({ scheduleId, amountPaid, sessionId: session.id })}::jsonb)`;
        await sql`UPDATE sf_files SET updated_at = NOW() WHERE id = ${Number(fileId)}`;

        const fileRows = normalizeRows(await sql`SELECT title, client_email, client_name FROM sf_files WHERE id = ${Number(fileId)} LIMIT 1`);
        if (fileRows.length && fileRows[0].client_email) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: 'Lee McDuffie <lee@externallyyyoursproductions.com>',
              to: fileRows[0].client_email as string,
              subject: `Payment received — ${fileRows[0].title}`,
              html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;"><h2>Payment Received</h2><p>We received your payment of $${(amountPaid / 100).toFixed(2)} for <strong>${fileRows[0].title}</strong>. Thank you!</p></div>`,
            });
          } catch (err) { console.error('Resend error:', err); }
        }
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { scheduleId, fileId } = pi.metadata ?? {};
      if (scheduleId && fileId) {
        await sql`UPDATE sf_payment_schedule SET status = 'paid', stripe_payment_intent_id = ${pi.id} WHERE id = ${Number(scheduleId)} AND status != 'paid'`;
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const { scheduleId, fileId } = pi.metadata ?? {};
      if (scheduleId && fileId) {
        await sql`INSERT INTO sf_audit_log (file_id, actor_type, event, payload) VALUES (${Number(fileId)}, 'system', 'payment_failed', ${JSON.stringify({ scheduleId, piId: pi.id, reason: pi.last_payment_error?.message })}::jsonb)`;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
