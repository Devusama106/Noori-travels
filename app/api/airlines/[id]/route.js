import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.logoUrl && body.logoUrl.startsWith("data:") && body.logoUrl.length > 700_000) {
    return NextResponse.json({ error: "Logo image is too large. Please use a smaller file (under ~500KB)." }, { status: 400 });
  }

  const fields = [];
  const values = [];
  if (body.name) { fields.push("name = ?"); values.push(body.name); }
  if (body.code !== undefined) { fields.push("code = ?"); values.push(body.code); }
  if (body.logoUrl !== undefined) { fields.push("logoUrl = ?"); values.push(body.logoUrl); }
  if (!fields.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  values.push(id);
  db.prepare(`UPDATE airlines SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  const airline = db.prepare("SELECT * FROM airlines WHERE id = ?").get(id);
  return NextResponse.json({ airline });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  db.prepare("DELETE FROM airlines WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
