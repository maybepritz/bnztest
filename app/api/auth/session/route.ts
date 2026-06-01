import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    
    if (body.action === 'login') {
      cookieStore.set("token", body.token, { 
        maxAge: 2592000, 
        path: "/", 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax" 
      });
      cookieStore.set("user", encodeURIComponent(JSON.stringify(body.user)), { 
        maxAge: 2592000, 
        path: "/", 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax" 
      });
      return NextResponse.json({ success: true });
    }
    
    if (body.action === 'logout') {
      cookieStore.delete("token");
      cookieStore.delete("user");
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
