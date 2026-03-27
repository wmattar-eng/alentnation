"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendCampaignApprovedEmail = sendCampaignApprovedEmail;
exports.sendNewProposalEmail = sendNewProposalEmail;
exports.sendPaymentReceivedEmail = sendPaymentReceivedEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const app_1 = require("../app");
// Email transport configuration
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
// Verify SMTP connection on startup
transporter.verify((error) => {
    if (error) {
        console.log('⚠️  Email service not configured:', error.message);
    }
    else {
        console.log('✉️  Email service ready');
    }
});
// Send email wrapper
async function sendEmail(options) {
    if (!process.env.SMTP_HOST) {
        console.log('📧 Email (mock):', options.to, options.subject);
        return true;
    }
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@talentnation.sa',
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });
        return true;
    }
    catch (error) {
        console.error('Email failed:', error);
        return false;
    }
}
// Welcome email for new users
async function sendWelcomeEmail(user) {
    const subject = 'Welcome to TalentNation - Saudi Arabia\'s Creative Marketplace';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to TalentNation</h1>
        <p style="color: #e0e0e0; margin: 10px 0 0 0;">Saudi Arabia's Premier Creative Talent Marketplace</p>
      </div>
      
      <div style="padding: 40px; background: #f9f9f9;">
        <p style="font-size: 18px;">Hi ${user.firstName},</p>
        
        <p>Thank you for joining TalentNation! We're excited to have you as part of our community.</p>
        
        ${user.role === 'TALENT' ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🎯 Next Steps for Talent:</h3>
            <ul>
              <li>Complete your profile</li>
              <li>Upload portfolio items</li>
              <li>Browse available projects</li>
              <li>Submit your first proposal</li>
            </ul>
          </div>
        ` : `
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🚀 Next Steps for Clients:</h3>
            <ul>
              <li>Post your first project</li>
              <li>Browse verified talent</li>
              <li>Review proposals</li>
              <li>Hire with confidence</li>
            </ul>
          </div>
        `}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://talentnation.sa/dashboard" 
             style="background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          If you have any questions, reply to this email or contact our support team.
        </p>
      </div>
      
      <div style="background: #1e3a5f; padding: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>© 2026 TalentNation. All rights reserved.</p>
        <p>Riyadh, Saudi Arabia | Aligning with Vision 2030</p>
      </div>
    </div>
  `;
    await sendEmail({ to: user.email, subject, html });
}
// Campaign approval notification
async function sendCampaignApprovedEmail(sponsor, campaign) {
    const subject = `✅ Your Campaign "${campaign.name}" is Now Live!`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #22c55e; padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0;">Campaign Approved! 🎉</h1>
      </div>
      
      <div style="padding: 40px;">
        <p>Dear ${sponsor.companyName} Team,</p>
        
        <p>Great news! Your campaign has been approved and is now live on TalentNation.</p>
        
        <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #166534;">${campaign.name}</h3>
          <p><strong>Type:</strong> ${campaign.type}</p>
          <p><strong>Budget:</strong> ${campaign.budget.toLocaleString()} SAR</p>
          <p><strong>Status:</strong> ✅ ACTIVE</p>
        </div>
        
        <p>You can track your campaign performance in real-time from your sponsor dashboard.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://talentnation.sa/sponsors/dashboard" 
             style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Dashboard
          </a>
        </div>
      </div>
    </div>
  `;
    // Get sponsor user email
    const user = await app_1.prisma.user.findUnique({
        where: { id: sponsor.userId },
        select: { email: true }
    });
    if (user) {
        await sendEmail({ to: user.email, subject, html });
    }
}
// New proposal notification
async function sendNewProposalEmail(projectOwner, project, proposal) {
    const subject = `📨 New Proposal for "${project.title}"`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #3b82f6; padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Proposal Received</h1>
      </div>
      
      <div style="padding: 40px;">
        <p>Hi ${projectOwner.firstName},</p>
        
        <p>You have a new proposal for your project:</p>
        
        <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${project.title}</h3>
          <p><strong>Proposed Budget:</strong> ${proposal.proposedBudget.toLocaleString()} SAR</p>
          <p><strong>Delivery Time:</strong> ${proposal.proposedDuration} days</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://talentnation.sa/projects/${project.id}/proposals" 
             style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Proposal
          </a>
        </div>
      </div>
    </div>
  `;
    await sendEmail({ to: projectOwner.email, subject, html });
}
// Payment received notification
async function sendPaymentReceivedEmail(user, amount, type) {
    const subject = type === 'received'
        ? `💰 Payment of ${amount.toLocaleString()} SAR Received`
        : `💸 Payment of ${amount.toLocaleString()} SAR Released`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${type === 'received' ? '#22c55e' : '#8b5cf6'}; padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0;">${type === 'received' ? 'Payment Secured' : 'Payment Released'}</h1>
      </div>
      
      <div style="padding: 40px; text-align: center;">
        <div style="font-size: 48px; font-weight: bold; color: ${type === 'received' ? '#22c55e' : '#8b5cf6'}; margin: 20px 0;">
          ${amount.toLocaleString()} SAR
        </div>
        
        <p>Hi ${user.firstName},</p>
        
        ${type === 'received'
        ? '<p>Your payment has been received and is now held securely in escrow. Work can begin!</p>'
        : '<p>Your payment has been released and should appear in your account within 1-2 business days.</p>'}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://talentnation.sa/payments" 
             style="background: ${type === 'received' ? '#22c55e' : '#8b5cf6'}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Details
          </a>
        </div>
      </div>
    </div>
  `;
    await sendEmail({ to: user.email, subject, html });
}
// Password reset email
async function sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `https://talentnation.sa/reset-password?token=${resetToken}`;
    const subject = '🔐 Password Reset Request';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f59e0b; padding: 40px; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset</h1>
      </div>
      
      <div style="padding: 40px;">
        <p>Hi ${user.firstName},</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This link expires in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    </div>
  `;
    await sendEmail({ to: user.email, subject, html });
}
exports.default = {
    sendWelcomeEmail,
    sendCampaignApprovedEmail,
    sendNewProposalEmail,
    sendPaymentReceivedEmail,
    sendPasswordResetEmail,
};
//# sourceMappingURL=email.service.js.map