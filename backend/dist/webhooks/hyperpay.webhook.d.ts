export declare const hyperpayWebhookService: {
    handleWebhook(payload: any, signature: string): Promise<{
        received: boolean;
    }>;
    checkPaymentStatus(checkoutId: string): Promise<unknown>;
};
//# sourceMappingURL=hyperpay.webhook.d.ts.map