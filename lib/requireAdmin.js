import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Verifying a Firebase ID token needs only the project id (Google's public keys are fetched),
// so this works without the service account that configuration/firebase-admin.js lacks.
const APP_NAME = "id-token-verifier";

function verifierAuth() {
  const app =
    getApps().find((a) => a.name === APP_NAME) ??
    initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || "brandraize-f2864" }, APP_NAME);
  return getAuth(app);
}

// True only for a signed-in admin: the same isAdmin claim hooks/UseAuth.js checks.
export async function requireAdmin(req) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return false;

  try {
    const decoded = await verifierAuth().verifyIdToken(token);
    return decoded.isAdmin === true;
  } catch {
    return false;
  }
}

// Blob paths the admin pages create: products/<nanoid> and articles/<nanoid>.
export const ADMIN_BLOB_PATH = /^(products|articles)\/[A-Za-z0-9_-]{1,64}$/;
