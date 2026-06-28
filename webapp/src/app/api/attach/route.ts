import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_CHARS = 48_000;

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (!/\.pdf$/i.test(file.name)) {
    return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: "PDF too large (max 10 MB)." }, { status: 400 });
  }

  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    let text = (result.text || "").trim();
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS) + "\n\n[…truncated for length]";
    }
    if (!text) {
      return NextResponse.json(
        { error: "No readable text found in this PDF." },
        { status: 422 }
      );
    }
    return NextResponse.json({ text, pages: result.total });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Could not read PDF." },
      { status: 422 }
    );
  } finally {
    await parser?.destroy().catch(() => {});
  }
}
