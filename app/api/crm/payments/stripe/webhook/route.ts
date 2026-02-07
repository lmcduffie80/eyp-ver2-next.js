import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // NOTE: Requires stripe package
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    //
    // let event;
    // try {
    //   event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    // } catch (err) {
    //   return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    // }

    // Mock event parsing for development
    const event = JSON.parse(body);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const { id, amount, metadata } = paymentIntent;
  const { project_id, client_id, payment_type } = metadata;

  try {
    // Create payment record
    const paymentResult = await sql`
      INSERT INTO payments (
        payment_number,
        project_id,
        client_id,
        amount,
        payment_type,
        payment_method,
        stripe_payment_intent_id,
        stripe_status,
        status
      ) VALUES (
        '',
        ${project_id},
        ${client_id},
        ${amount / 100},
        ${payment_type},
        'stripe',
        ${id},
        'succeeded',
        'completed'
      )
      RETURNING *
    `;
    const payment = normalizeRows(paymentResult);

    // Update project based on payment type
    if (payment_type === 'deposit') {
      await sql`
        UPDATE projects
        SET 
          deposit_paid = true,
          deposit_paid_at = CURRENT_TIMESTAMP,
          stage = 'deposit_paid',
          stage_updated_at = CURRENT_TIMESTAMP
        WHERE id = ${project_id}
      `;
    } else if (payment_type === 'final') {
      await sql`
        UPDATE projects
        SET 
          final_payment_paid = true,
          final_payment_paid_at = CURRENT_TIMESTAMP,
          stage = 'final_payment_paid',
          stage_updated_at = CURRENT_TIMESTAMP
        WHERE id = ${project_id}
      `;
    }

    // Send email notifications would go here
    console.log('Payment successful:', payment[0]);

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  const { id, metadata } = paymentIntent;
  const { project_id, client_id } = metadata;

  try {
    await sql`
      INSERT INTO payments (
        payment_number,
        project_id,
        client_id,
        amount,
        payment_method,
        stripe_payment_intent_id,
        stripe_status,
        status
      ) VALUES (
        '',
        ${project_id},
        ${client_id},
        ${paymentIntent.amount / 100},
        'stripe',
        ${id},
        'failed',
        'failed'
      )
    `;

    // Send failure notification would go here
    console.log('Payment failed:', id);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleRefund(charge: any) {
  const { payment_intent, amount_refunded } = charge;

  try {
    // Find original payment
    const paymentsResult = await sql`
      SELECT * FROM payments
      WHERE stripe_payment_intent_id = ${payment_intent}
      LIMIT 1
    `;
    const payments = normalizeRows(paymentsResult);

    if (payments.length > 0) {
      const payment = payments[0];

      // Create refund record
      await sql`
        INSERT INTO payments (
          payment_number,
          project_id,
          client_id,
          amount,
          payment_type,
          payment_method,
          stripe_payment_intent_id,
          stripe_status,
          status,
          notes
        ) VALUES (
          '',
          ${payment.project_id},
          ${payment.client_id},
          ${-amount_refunded / 100},
          'refund',
          'stripe',
          ${payment_intent},
          'refunded',
          'completed',
          'Refund processed'
        )
      `;

      console.log('Refund processed:', payment_intent);
    }

  } catch (error) {
    console.error('Error handling refund:', error);
  }
}
