import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/shared/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ targetUsername: string }> }) {
  const session = await getServerUser();
  if (!session?.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const { targetUsername } = resolvedParams;

  const res = await fetch(`${process.env.BACKEND_URL}/api/chats/${targetUsername}/typing`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to send typing indicator" }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
