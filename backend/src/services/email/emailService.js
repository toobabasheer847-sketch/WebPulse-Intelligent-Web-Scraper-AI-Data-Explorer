
import nodemailer from 'nodemailer';
import config from '../../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
  tls: {
    rejectUnauthorized: false // Add this to avoid self-signed cert errors in dev
  }
});

// Verify transporter connection at startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP Transporter verification failed:', error);
  } else {
    console.log('✅ SMTP Transporter is ready to send emails');
  }
});

export async function sendVerificationEmail(email, otp) {
  console.log('📨 Preparing to send verification email to:', email);
  console.log('🔑 Verification OTP:', otp);
  
  const mailOptions = {
    from: config.smtp.from,
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
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📄 Message ID:', info.messageId);
    console.log('📨 Accepted recipients:', info.accepted);
  } catch (error) {
    console.error('❌ Failed to send verification email:');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error command:', error.command);
    console.error('   Error response:', error.response);
    throw new Error('Failed to send verification email');
  }
}
