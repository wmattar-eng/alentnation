"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const app_1 = require("../../app");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});
exports.stripeWebhookService = {
    // Handle incoming Stripe webhook
    async handleWebhook(payload, signature) {
        const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
        console.log(`Processing Stripe event: ${event.type}`);
        switch (event.type) {
            // Payment Intent Events
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;
            case 'payment_intent.canceled':
                await handlePaymentIntentCanceled(event.data.object);
                break;
            // Charge Events
            case 'charge.succeeded':
                await handleChargeSucceeded(event.data.object);
                break;
            case 'charge.refunded':
                await handleChargeRefunded(event.data.object);
                break;
            // Transfer Events (Escrow Release)
            case 'transfer.created':
                await handleTransferCreated(event.data.object);
                break;
            // Subscription Events (Sponsor Tiers)
            case 'invoice.payment_succeeded':
                await handleSubscriptionPayment(event.data.object);
                break;
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionCanceled(event.data.object);
                break;
            // Connect Events (For future marketplace expansion)
            case 'account.updated':
                await handleConnectAccountUpdated(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        return { received: true };
    }
};
// Payment Intent Succeeded - Escrow Funded
async function handlePaymentIntentSucceeded(paymentIntent) {
    const { contractId, type, milestoneId, campaignId } = paymentIntent.metadata;
    if (type === 'escrow' && contractId) {
        // Update payment record
        await app_1.prisma.payment.updateMany({
            where: { paymentIntentId: paymentIntent.id },
            data: {
                status: 'HELD_IN_ESCROW',
                paidAt: new Date()
            }
        });
        // Update milestone if provided
        if (milestoneId) {
            await app_1.prisma.milestone.update({
                where: { id: milestoneId },
                data: { status: 'IN_PROGRESS' }
            });
        }
        console.log(`✅ Escrow funded for contract ${contractId}`);
    }
    if (type === 'sponsor' && campaignId) {
        // Fund sponsor campaign
        await app_1.prisma.sponsorCampaign.update({
            where: { id: campaignId },
            data: { status: 'ACTIVE' }
        });
        // Update sponsor budget
        const campaign = await app_1.prisma.sponsorCampaign.findUnique({
            where: { id: campaignId },
            include: { sponsor: true }
        });
        if (campaign) {
            await app_1.prisma.sponsor.update({
                where: { id: campaign.sponsorId },
                data: {
                    budgetTotal: { increment: paymentIntent.amount / 100 }
                }
            });
        }
        console.log(`✅ Sponsor campaign funded: ${campaignId}`);
    }
}
// Payment Intent Failed
async function handlePaymentIntentFailed(paymentIntent) {
    await app_1.prisma.payment.updateMany({
        where: { paymentIntentId: paymentIntent.id },
        data: { status: 'FAILED' }
    });
    console.log(`❌ Payment failed: ${paymentIntent.id}`);
}
// Payment Intent Canceled
async function handlePaymentIntentCanceled(paymentIntent) {
    await app_1.prisma.payment.updateMany({
        where: { paymentIntentId: paymentIntent.id },
        data: { status: 'REFUNDED' }
    });
    console.log(`🚫 Payment canceled: ${paymentIntent.id}`);
}
// Charge Succeeded - For logging/auditing
async function handleChargeSucceeded(charge) {
    await app_1.prisma.auditLog.create({
        data: {
            action: 'PAYMENT_CHARGED',
            entityType: 'payment',
            entityId: charge.payment_intent,
            metadata: {
                amount: charge.amount,
                currency: charge.currency,
                status: charge.status
            }
        }
    });
}
// Charge Refunded
async function handleChargeRefunded(charge) {
    const refund = charge.refunds?.data[0];
    if (refund) {
        await app_1.prisma.payment.updateMany({
            where: { paymentIntentId: charge.payment_intent },
            data: { status: 'REFUNDED' }
        });
        console.log(`💸 Refund processed: ${refund.id}`);
    }
}
// Transfer Created - Escrow Released to Talent
async function handleTransferCreated(transfer) {
    const { contractId, milestoneId } = transfer.metadata;
    if (contractId) {
        await app_1.prisma.payment.updateMany({
            where: { contractId },
            data: { status: 'RELEASED', releasedAt: new Date() }
        });
        if (milestoneId) {
            await app_1.prisma.milestone.update({
                where: { id: milestoneId },
                data: { status: 'APPROVED', approvedAt: new Date() }
            });
        }
        console.log(`✅ Escrow released to talent for contract ${contractId}`);
    }
}
// Subscription Payment (Sponsor Monthly)
async function handleSubscriptionPayment(invoice) {
    const { sponsorId } = invoice.subscription_details?.metadata || {};
    if (sponsorId) {
        await app_1.prisma.sponsor.update({
            where: { id: sponsorId },
            data: {
                budgetTotal: { increment: (invoice.amount_paid || 0) / 100 }
            }
        });
        console.log(`✅ Sponsor subscription payment: ${sponsorId}`);
    }
}
// Subscription Created
async function handleSubscriptionCreated(subscription) {
    const { sponsorId, tier } = subscription.metadata;
    if (sponsorId) {
        await app_1.prisma.sponsor.update({
            where: { id: sponsorId },
            data: { tier: tier }
        });
        console.log(`✅ Sponsor upgraded to ${tier}: ${sponsorId}`);
    }
}
// Subscription Canceled
async function handleSubscriptionCanceled(subscription) {
    const { sponsorId } = subscription.metadata;
    if (sponsorId) {
        // Deactivate campaigns
        await app_1.prisma.sponsorCampaign.updateMany({
            where: {
                sponsorId,
                status: 'ACTIVE'
            },
            data: { status: 'PAUSED' }
        });
        console.log(`🚫 Sponsor subscription canceled: ${sponsorId}`);
    }
}
// Connect Account Updated (For future expansion)
async function handleConnectAccountUpdated(account) {
    console.log(`Connect account updated: ${account.id}`);
}
//# sourceMappingURL=stripe.webhook.js.map