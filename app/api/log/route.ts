import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const msg = url.searchParams.get("msg") || "(no message)";
    // Print server-side so it appears in the terminal running Next dev
    console.log("CLIENT LOG:", msg);
    return NextResponse.json({ ok: true, msg });
  } catch (err) {
    console.error("/api/log error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
