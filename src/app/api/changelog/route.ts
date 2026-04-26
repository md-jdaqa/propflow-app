import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  try {
    const file = path.join(process.cwd(), "CHANGELOG.md");
    const data = await readFile(file, "utf8");
    return new Response(data, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return new Response("CHANGELOG.md not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
