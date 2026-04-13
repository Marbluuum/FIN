import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session-server";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const validUsername = process.env.AUTH_USERNAME || "martin";
  const validPassword = process.env.AUTH_PASSWORD || "martin2026";

  if (username !== validUsername || password !== validPassword) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos" },
      { status: 401 }
    );
  }

  await createSession(username);
  return NextResponse.json({ success: true });
}
