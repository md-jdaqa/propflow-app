// PropFlow — one-click tax package download.
// GET /api/tax-package?year=2026 streams a zip suitable for handing to a CPA.

import { NextRequest, NextResponse } from "next/server";
import { buildTaxPackageStream } from "@/lib/tax-package/build";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const yearParam = url.searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (!Number.isFinite(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  try {
    const { filename, stream } = await buildTaxPackageStream(MOCK_OWNER_ID, year);
    // Convert the Node Readable into a Web ReadableStream for NextResponse.
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk: Buffer) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to build tax package" },
      { status: 500 },
    );
  }
}
