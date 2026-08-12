import nodemailer from "nodemailer";

let transporter = null;
let attemptedSetup = false;

function getTransporter() {
  if (attemptedSetup) return transporter;
  attemptedSetup = true;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // no SMTP configured — sendMail() will fall back to console logging
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured (via .env.local: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).
 * If SMTP isn't configured, logs the email to the server console instead — so registration/approval
 * flows keep working during local development without requiring a real mail account.
 */
export async function sendMail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || "Noori Travels <no-reply@noori.travel>";
  const t = getTransporter();

  if (!t) {
    console.log("\n📧 [Email not sent — SMTP not configured in .env.local]");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   ${text || html?.replace(/<[^>]+>/g, " ")}\n`);
    return { simulated: true };
  }

  try {
    const info = await t.sendMail({ from, to, subject, html, text });
    return { simulated: false, info };
  } catch (err) {
    console.error("Failed to send email:", err.message);
    return { simulated: true, error: err.message };
  }
}
