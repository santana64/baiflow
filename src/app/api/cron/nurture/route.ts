import { NextResponse } from "next/server";
import { sendDueNurtureEmails } from "@/server/nurture";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await sendDueNurtureEmails();
  return NextResponse.json({
    processed: results.length,
    sent: results.filter((result) => result.sent).length,
    results
  });
}
