import crypto from 'crypto';
import { prisma } from '../../app';

const HYPERPAY_BASE_URL = process.env.HYPERPAY_BASE_URL || 'https://test.oppwa.com';
const HYPERPAY_TOKEN = process.env.HYPERPAY_TOKEN!;

export const hyperpayWebhookService = {
  // Handle Hyperpay webhook
  async handleWebhook(payload: any, signature: string) {
    // Verify webhook signature
    const computedSignature = crypto
      .createHmac('sha256', HYPERPAY_TOKEN)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== computedSignature) {
      throw new Error('Invalid webhook signature');
    }

    const { result, id } = payload;
    const { code, description } = result;

    console.log(`Hyperpay webhook: ${code} - ${description}`);

    // Find payment by checkout ID
    const payment = await prisma.payment.findFirst({
      where: { 
        metadata: {
          path: ['hyperpayCheckoutId'],
          equals: id
        }
      }
    });

    if (!payment) {
      console.error(`Payment not found for checkout: ${id}`);
      return { received: true };
    }

    switch (code) {
      case '000.100.110': // Transaction succeeded
      case '000.000.000': // Approved
        await handleSuccess(payment.id, payload);
        break;

      case '000.400.000': // Transaction pending
        await handlePending(payment.id, payload);
        break;

      case '800.100.152': // Insufficient funds
      case '800.100.153': // Transaction declined
      case '800.100.154': // Authentication failed
        await handleFailure(payment.id, payload);
        break;

      default:
        console.log(`Unhandled Hyperpay code: ${code}`);
    }

    return { received: true };
  },

  // Check payment status manually
  async checkPaymentStatus(checkoutId: string) {
    const response = await fetch(
      `${HYPERPAY_BASE_URL}/v1/checkouts/${checkoutId}/payment`,
      {
        headers: {
          'Authorization': `Bearer ${HYPERPAY_TOKEN}`
        }
      }
    );

    return response.json();
  }
};

async function handleSuccess(paymentId: string, payload: any) {
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'HELD_IN_ESCROW',
      paidAt: new Date(),
      metadata: {
        hyperpayResponse: payload
      }
    }
  });

  // Get payment details to update related entities
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { contract: true }
  });

  if (payment?.contractId) {
    // Activate contract
    await prisma.contract.update({
      where: { id: payment.contractId },
      data: { status: 'ACTIVE' }
    });
  }

  console.log(`✅ Hyperpay payment successful: ${paymentId}`);
}

async function handlePending(paymentId: string, payload: any) {
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'PENDING',
      metadata: {
        hyperpayResponse: payload
      }
    }
  });

  console.log(`⏳ Hyperpay payment pending: ${paymentId}`);
}

async function handleFailure(paymentId: string, payload: any) {
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'FAILED',
      metadata: {
        hyperpayResponse: payload,
        failureReason: payload.result.description
      }
    }
  });

  console.log(`❌ Hyperpay payment failed: ${paymentId}`);
}
