import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

// GET /api/airlines - any signed-in user can read (needed to render logos on search/booking pages)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const airlines = db.prepare("SELECT * FROM airlines ORDER BY name ASC").all();
  return NextResponse.json({ airlines });
}

// POST /api/airlines - admin only, create or update (upsert by name) an airline + its logo
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { name, code, logoUrl } = body;
  if (!name) return NextResponse.json({ error: "Airline name is required" }, { status: 400 });

  // Keep logos reasonably sized when they come in as base64 data URIs
  if (logoUrl && logoUrl.startsWith("data:") && logoUrl.length > 700_000) {
    return NextResponse.json({ error: "Logo image is too large. Please use a smaller file (under ~500KB)." }, { status: 400 });
  }

  const existing = db.prepare("SELECT id FROM airlines WHERE name = ?").get(name);
  if (existing) {
    db.prepare("UPDATE airlines SET code = ?, logoUrl = COALESCE(?, logoUrl) WHERE id = ?").run(
      code || null,
      logoUrl || null,
      existing.id
    );
    const airline = db.prepare("SELECT * FROM airlines WHERE id = ?").get(existing.id);
    return NextResponse.json({ airline });
  }

  const info = db
    .prepare("INSERT INTO airlines (name, code, logoUrl) VALUES (?, ?, ?)")
    .run(name, code || null, logoUrl || null);
  const airline = db.prepare("SELECT * FROM airlines WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json({ airline }, { status: 201 });
}
