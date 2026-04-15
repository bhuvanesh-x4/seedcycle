/**
 * Notification Service - Handles Email (SMTP) and WhatsApp notifications
 */
import nodemailer from "nodemailer";
import axios from "axios";

// Email transporter (configured once)
let emailTransporter = null;

function getEmailTransporter() {
  if (!emailTransporter) {
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return emailTransporter;
}

/**
 * Send email via SMTP
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of email
 * @param {string} text - Plain text content (optional)
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    const transporter = getEmailTransporter();

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for plain text
      html
    });

    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send OTP via Email
 * @param {string} to - Recipient email address
 * @param {string} otp - OTP code
 * @param {string} companyName - Company name for personalization
 */
export async function sendOtpEmail({ to, otp, companyName }) {
  const subject = `🔐 SeedCycle - Company Verification OTP`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ffc8; margin: 0;">🌱 SeedCycle</h1>
        <p style="color: #8b949e; margin-top: 8px;">Company Verification</p>
      </div>
      
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; text-align: center;">
        <h2 style="color: #fff; margin-top: 0;">Your Verification OTP</h2>
        <p style="color: #8b949e;">Use this code to verify <strong style="color: #00ffc8;">${companyName}</strong></p>
        
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 20px 40px; border-radius: 12px; display: inline-block; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fff;">${otp}</span>
        </div>
        
        <p style="color: #f97316; font-size: 14px; margin-top: 20px;">
          ⏰ This OTP expires in 5 minutes
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #6e7681; font-size: 12px;">
        <p>If you didn't request this, please ignore this email.</p>
        <p>© ${new Date().getFullYear()} SeedCycle - Sustainable Seed Exchange Platform</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * Send WhatsApp message via Meta Business API
 * @param {string} to - Recipient phone number (with country code, no +)
 * @param {string} message - Text message to send
 */
export async function sendWhatsApp({ to, message }) {
  try {
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const token = process.env.WHATSAPP_TOKEN;

    if (!phoneId || !token) {
      console.warn("⚠️ WhatsApp credentials not configured");
      return { success: false, error: "WhatsApp not configured" };
    }

    // Validate token format (should start with EAA for Meta tokens)
    if (!token.startsWith("EAA")) {
      console.warn("⚠️ WhatsApp token may be invalid (doesn't start with EAA)");
    }

    // Clean phone number - remove + and spaces
    let cleanPhone = to.replace(/[^0-9]/g, "");

    // If only 10 digits, assume India (+91)
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
      console.log(`📱 Added India country code: ${cleanPhone}`);
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      console.warn("⚠️ Invalid phone number for WhatsApp:", to);
      return { success: false, error: "Invalid phone number" };
    }

    console.log(`📱 Attempting WhatsApp to: ${cleanPhone}`);

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`✅ WhatsApp sent to ${cleanPhone}:`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    const errCode = error.response?.data?.error?.code;

    console.error("❌ WhatsApp send error:", {
      code: errCode,
      message: errMsg,
      to: to
    });

    // Don't throw - just return failure so email can still work
    return { success: false, error: errMsg, code: errCode };
  }
}

/**
 * Send OTP via WhatsApp
 * @param {string} to - Recipient phone number
 * @param {string} otp - OTP code
 * @param {string} companyName - Company name for personalization
 */
export async function sendOtpWhatsApp({ to, otp, companyName }) {
  const message = `🌱 *SeedCycle Company Verification*

Your OTP for verifying *${companyName}* is:

🔐 *${otp}*

This code expires in 5 minutes.

If you didn't request this, please ignore this message.`;

  return sendWhatsApp({ to, message });
}

/**
 * Send verification success notification
 * @param {string} email - User email
 * @param {string} phone - User phone (optional)
 * @param {string} companyName - Company name
 */
export async function sendVerificationSuccess({ email, phone, companyName }) {
  // Send email notification
  const subject = `✅ Congratulations! ${companyName} is now verified on SeedCycle`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00ffc8; margin: 0;">🌱 SeedCycle</h1>
      </div>
      
      <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h2 style="color: #3b82f6; margin: 0;">Verification Successful!</h2>
        <p style="color: #fff; margin-top: 12px;">
          <strong>${companyName}</strong> is now a verified company on SeedCycle
        </p>
        <p style="color: #8b949e; font-size: 14px;">
          Your listings will now display a verified badge, helping build trust with buyers.
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #6e7681; font-size: 12px;">
        <p>© ${new Date().getFullYear()} SeedCycle - Sustainable Seed Exchange Platform</p>
      </div>
    </div>
  `;

  const emailResult = await sendEmail({ to: email, subject, html });

  // Send WhatsApp if phone is available
  let whatsappResult = { success: false, skipped: true };
  if (phone) {
    const message = `✅ *Congratulations!*

*${companyName}* is now a verified company on SeedCycle! 🎉

Your listings will display a verified badge, building trust with buyers.

Thank you for verifying your business with us!

🌱 SeedCycle Team`;
    whatsappResult = await sendWhatsApp({ to: phone, message });
  }

  return { email: emailResult, whatsapp: whatsappResult };
}
