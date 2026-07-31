import nodemailer from 'nodemailer';
import config from '../../config/index.js';

const smtpConfig = config.smtp;
const emailConfig = config.email;

function buildSmtpTransporter() {
  if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port || 587,
    secure: smtpConfig.secure,
    requireTLS: smtpConfig.requireTls,
    family: 4,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
}

const smtpTransporter = buildSmtpTransporter();

if (smtpTransporter) {
  console.log(`📧 SMTP email transport configured for ${smtpConfig.host}:${smtpConfig.port}`);
} else if (emailConfig.provider === 'resend' && emailConfig.resendApiKey) {
  console.log('📧 Resend email provider configured');
} else {
  console.warn('⚠️ No email transport configured. Set EMAIL_PROVIDER=resend with RESEND_API_KEY or configure SMTP_* variables.');
}

async function sendWithResend(email, otp) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${emailConfig.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailConfig.resendFromEmail || smtpConfig.from,
      to: [email],
      subject: 'Verify Your Email - WebPulse',
      text: `Your verification code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to WebPulse!</h1>
          <p>Thank you for registering. Please use the verification code below to confirm your email address:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; padding: 15px; background-color: #f0f0f0; text-align: center;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p style="color: #888; font-size: 12px;">If you didn't sign up for WebPulse, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend API error: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return {
    messageId: data.id,
    accepted: [email],
  };
}

export async function sendVerificationEmail(email, otp) {
  console.log('📨 Preparing to send verification email to:', email);
  console.log('🔑 Verification OTP:', otp);

  const mailOptions = {
    from: smtpConfig.from,
    to: email,
    subject: 'Verify Your Email - WebPulse',
    text: `Your verification code is: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to WebPulse!</h1>
        <p>Thank you for registering. Please use the verification code below to confirm your email address:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; padding: 15px; background-color: #f0f0f0; text-align: center;">
          ${otp}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p style="color: #888; font-size: 12px;">If you didn't sign up for WebPulse, you can ignore this email.</p>
      </div>
    `,
  };

  try {
    let info;

    if (emailConfig.provider === 'resend' && emailConfig.resendApiKey) {
      info = await sendWithResend(email, otp);
      console.log('✅ Email sent successfully via Resend');
      console.log('📄 Message ID:', info.messageId);
      console.log('📨 Accepted recipients:', info.accepted);
      return info;
    }

    if (!smtpTransporter) {
      throw new Error('No email transport configured. Set EMAIL_PROVIDER=resend with RESEND_API_KEY or configure SMTP_* variables.');
    }

    info = await smtpTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via SMTP');
    console.log('📄 Message ID:', info.messageId);
    console.log('📨 Accepted recipients:', info.accepted);
    return info;
  } catch (error) {
    console.error('❌ Failed to send verification email:');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error command:', error.command);
    console.error('   Error response:', error.response);
    console.error('   Provider:', emailConfig.provider);
    throw new Error('Failed to send verification email');
  }
}
