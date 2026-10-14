import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, displayName } = body;

    if (!uid || !displayName) {
      return NextResponse.json({ error: "Missing uid or displayName" }, { status: 400 });
    }

    const certId = `CSEC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const certData = {
      certId,
      uid,
      displayName,
      course: "Learn Cyber Security Complete Roadmap",
      issuedAt: new Date().toISOString(),
    };

    if (adminDb) {
      await adminDb.collection("certificates").doc(certId).set(certData);
    }

    return NextResponse.json({ success: true, certificate: certData });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
