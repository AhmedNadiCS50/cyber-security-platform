import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { handleProfileAction, type ProfileAction } from "@/lib/profileServer";

const ACTIONS = new Set<ProfileAction>([
  "sync",
  "onboarding",
  "profile",
  "xp",
  "lesson",
  "challenge",
  "lab",
]);

export async function POST(request: Request) {
  // Requires the Admin SDK service account (see .env.example).
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "server-not-configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "missing-token" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "invalid-token" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const body = (raw && typeof raw === "object" ? raw : {}) as {
    action?: unknown;
    payload?: unknown;
  };
  const action = body.action as ProfileAction;
  if (!ACTIONS.has(action)) {
    return NextResponse.json({ error: "unknown-action" }, { status: 400 });
  }

  const payload =
    body.payload && typeof body.payload === "object"
      ? (body.payload as Record<string, unknown>)
      : {};

  try {
    const result = await handleProfileAction(
      {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      },
      action,
      payload
    );
    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.error("profile API error:", err);
    return NextResponse.json({ error: "server-error" }, { status: 500 });
  }
}
