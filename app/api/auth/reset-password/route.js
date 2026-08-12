import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Missing token or password." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const user = db.prepare("SELECT * FROM users WHERE resetToken = ?").get(token);
  if (!user) {
    return NextResponse.json({ error: "This reset link is invalid. Please request a new one." }, { status: 400 });
  }
  if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
    return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
  }

  const hash = bcrypt.hashSync(password, 10);
  db.prepare("UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?").run(
    hash,
    user.id
  );

  return NextResponse.json({ ok: true });
}
