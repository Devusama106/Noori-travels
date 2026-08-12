import { NextResponse } from "next/server";
import db from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { genToken } from "@/lib/utils";

export async function POST(req) {
  const { email } = await req.json();
  const generic = { ok: true, message: "If an account exists for that email, a reset link has been sent." };

  if (!email) return NextResponse.json(generic);

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  // Always return the same generic response whether or not the account exists, so this endpoint
  // can't be used to discover which emails are registered.
  if (!user || user.status !== "ACTIVE") return NextResponse.json(generic);

  const token = genToken();
  const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  db.prepare("UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?").run(token, expiry, user.id);

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await sendMail({
    to: user.email,
    subject: "Reset your Noori Travels password",
    text: `Hi ${user.name},\n\nWe received a request to reset your password. This link is valid for 1 hour:\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.\n\n— Noori Travels`,
    html: `
      <div style="font-family:sans-serif;font-size:14px;color:#1f2937;">
        <h2 style="color:#0b6e4f;">Reset your password</h2>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. This link is valid for 1 hour:</p>
        <p><a href="${resetUrl}" style="color:#0b6e4f;">${resetUrl}</a></p>
        <p style="color:#6b7280;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return NextResponse.json(generic);
}
