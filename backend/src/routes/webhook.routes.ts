import { Router, raw } from 'express';
import { stripeWebhookService } from '../../webhooks/stripe.webhook';
import { hyperpayWebhookService } from '../../webhooks/hyperpay.webhook';

const router = Router();

// Stripe webhook - needs raw body for signature verification
router.post(
  '/stripe',
  raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      const result = await stripeWebhookService.handleWebhook(
        req.body,
        signature
      );

      res.json(result);
    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(400).json({ 
        error: 'Webhook processing failed',
        message: (error as Error).message 
      });
    }
  }
);

// Hyperpay webhook
router.post(
  '/hyperpay',
  async (req, res) => {
    try {
      const signature = req.headers['x-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      const result = await hyperpayWebhookService.handleWebhook(
        req.body,
        signature
      );

      res.json(result);
    } catch (error) {
      console.error('Hyperpay webhook error:', error);
      res.status(400).json({ 
        error: 'Webhook processing failed',
        message: (error as Error).message 
      });
    }
  }
);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
