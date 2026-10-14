import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App | undefined;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    adminApp = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
  }
} catch (err) {
  console.warn("Firebase Admin SDK initialization skipped (no credentials provided yet):", err);
}

export { adminApp, adminDb, adminAuth };

export async function verifyIdToken(token: string) {
  if (!adminAuth) return null;
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}
