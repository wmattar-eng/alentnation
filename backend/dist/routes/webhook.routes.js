"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_webhook_1 = require("../../webhooks/stripe.webhook");
const hyperpay_webhook_1 = require("../../webhooks/hyperpay.webhook");
const router = (0, express_1.Router)();
// Stripe webhook - needs raw body for signature verification
router.post('/stripe', (0, express_1.raw)({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            return res.status(400).json({ error: 'Missing signature' });
        }
        const result = await stripe_webhook_1.stripeWebhookService.handleWebhook(req.body, signature);
        res.json(result);
    }
    catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(400).json({
            error: 'Webhook processing failed',
            message: error.message
        });
    }
});
// Hyperpay webhook
router.post('/hyperpay', async (req, res) => {
    try {
        const signature = req.headers['x-signature'];
        if (!signature) {
            return res.status(400).json({ error: 'Missing signature' });
        }
        const result = await hyperpay_webhook_1.hyperpayWebhookService.handleWebhook(req.body, signature);
        res.json(result);
    }
    catch (error) {
        console.error('Hyperpay webhook error:', error);
        res.status(400).json({
            error: 'Webhook processing failed',
            message: error.message
        });
    }
});
// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = router;
//# sourceMappingURL=webhook.routes.js.map