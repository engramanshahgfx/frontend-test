import { put } from "@vercel/blob";
import { requireAdmin, ADMIN_BLOB_PATH } from "@/lib/requireAdmin";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req) {
  if (!(await requireAdmin(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const path = formData.get("path");

    if (!file || !path) {
      return new Response(JSON.stringify({ error: "File or path missing" }), {
        status: 400,
      });
    }
    if (typeof path !== "string" || !ADMIN_BLOB_PATH.test(path)) {
      return new Response(JSON.stringify({ error: "Invalid path" }), { status: 400 });
    }
    if (typeof file === "string" || !file.type?.startsWith("image/") || file.size > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "Only images up to 5 MB are allowed" }), {
        status: 400,
      });
    }

    // The token comes from the BLOB_READ_WRITE_TOKEN environment variable.
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return new Response(JSON.stringify({ url: blob.url }), { status: 200 });
  } catch (err) {
    console.error("Upload failed:", err);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}
