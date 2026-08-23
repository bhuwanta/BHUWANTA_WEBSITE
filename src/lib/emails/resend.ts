import { Resend } from 'resend';

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = 'noreply@bhuwanta.com'; // Standardized based on user request

export async function sendWelcomeEmail(email: string, name: string, phone: string, password: string) {
  if (!resend) {
    console.warn('RESEND_API_KEY is not set. Skipping sendWelcomeEmail.');
    return { success: false, error: 'Resend API key missing' };
  }

  try {
    const data = await resend.emails.send({
      from: `Bhuwanta <${fromEmail}>`,
      to: email,
      subject: 'Welcome to Bhuwanta - Your Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; color: #0f1d33;">
          <h2 style="color: #c4a55a;">Welcome to Bhuwanta, ${name}!</h2>
          <p>Your account has been successfully created. You can now log in to your dashboard.</p>
          <div style="background-color: #f3f5f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Login Phone Number:</strong> ${phone}</p>
            <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please log in and update your password from your settings page as soon as possible.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/REALESTATE_SOFTWARE/login" style="display: inline-block; background-color: #c4a55a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Login Now</a>
          <p style="font-size: 12px; color: #5a6a82; margin-top: 30px;">If you did not request this account, please contact Bhuwanta IT support.</p>
        </div>
      `
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendSetupPasswordEmail(email: string, name: string, actionLink: string) {
  if (!resend) {
    console.warn('RESEND_API_KEY is not set. Skipping sendSetupPasswordEmail.');
    return { success: false, error: 'Resend API key missing' };
  }

  try {
    const data = await resend.emails.send({
      from: `Bhuwanta <${fromEmail}>`,
      to: email,
      subject: 'Setup Your Bhuwanta Account Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; color: #0f1d33;">
          <h2 style="color: #c4a55a;">Welcome to Bhuwanta, ${name}!</h2>
          <p>An account has been created for you. To get started, please set up your secure password by clicking the link below:</p>
          <a href="${actionLink}" style="display: inline-block; background-color: #c4a55a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Set My Password</a>
          <p style="font-size: 14px;">This link will securely authenticate you and allow you to set your password. For security reasons, this link will expire soon.</p>
          <p style="font-size: 12px; color: #5a6a82; margin-top: 30px;">If you did not request this account, please ignore this email.</p>
        </div>
      `
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending setup link email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendRecoveryEmail(email: string, actionLink: string) {
  if (!resend) {
    console.warn('RESEND_API_KEY is not set. Skipping sendRecoveryEmail.');
    return { success: false, error: 'Resend API key missing' };
  }

  try {
    const data = await resend.emails.send({
      from: `Bhuwanta Security <${fromEmail}>`,
      to: email,
      subject: 'Reset Your Bhuwanta Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; color: #0f1d33;">
          <h2 style="color: #c4a55a;">Password Reset Request</h2>
          <p>We received a request to reset the password for your Bhuwanta account.</p>
          <p>Click the secure link below to choose a new password:</p>
          <a href="${actionLink}" style="display: inline-block; background-color: #c4a55a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p style="font-size: 14px;">If you didn't make this request, you can safely ignore this email. Your password will not change.</p>
        </div>
      `
    });
    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending recovery email:', error);
    return { success: false, error: error.message };
  }
}
