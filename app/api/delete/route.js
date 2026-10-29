import { del } from "@vercel/blob";
import { requireAdmin, ADMIN_BLOB_PATH } from "@/lib/requireAdmin";

export async function POST(req) {
  if (!(await requireAdmin(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { path } = await req.json();

    if (!path) {
      return new Response(JSON.stringify({ error: "path is required" }), {
        status: 400,
      });
    }
    if (typeof path !== "string" || !ADMIN_BLOB_PATH.test(path)) {
      return new Response(JSON.stringify({ error: "Invalid path" }), { status: 400 });
    }

    await del(path);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Delete failed:", err);
    return new Response(JSON.stringify({ error: "Delete failed" }), {
      status: 500,
    });
  }
}
