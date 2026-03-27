interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare function sendEmail(options: EmailOptions): Promise<boolean>;
export declare function sendWelcomeEmail(user: {
    email: string;
    firstName: string;
    role: string;
}): Promise<void>;
export declare function sendCampaignApprovedEmail(sponsor: any, campaign: any): Promise<void>;
export declare function sendNewProposalEmail(projectOwner: any, project: any, proposal: any): Promise<void>;
export declare function sendPaymentReceivedEmail(user: any, amount: number, type: 'received' | 'released'): Promise<void>;
export declare function sendPasswordResetEmail(user: any, resetToken: string): Promise<void>;
declare const _default: {
    sendWelcomeEmail: typeof sendWelcomeEmail;
    sendCampaignApprovedEmail: typeof sendCampaignApprovedEmail;
    sendNewProposalEmail: typeof sendNewProposalEmail;
    sendPaymentReceivedEmail: typeof sendPaymentReceivedEmail;
    sendPasswordResetEmail: typeof sendPasswordResetEmail;
};
export default _default;
//# sourceMappingURL=email.service.d.ts.map