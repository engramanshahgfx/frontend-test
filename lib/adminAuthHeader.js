import { auth } from "@/configuration/firebase-config";

// Authorization header for the admin-only /api/upload and /api/delete routes.
export async function adminAuthHeader() {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
