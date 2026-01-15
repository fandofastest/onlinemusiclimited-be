import { NextResponse } from "next/server";
import { badRequest } from "@/lib/response";
import crypto from "crypto";

type Body = {
  username?: string;
  password?: string;
};

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sign(payload: string, secret: string) {
  const mac = crypto.createHmac("sha256", secret).update(payload).digest();
  return base64url(mac);
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export async function POST(req: Request) {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!adminUser || !adminPass || !secret) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Admin auth is not configured" } },
      { status: 500 }
    );
  }

  const body = (await req.json()) as Body;
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) return badRequest("Invalid body");

  if (username !== adminUser || !safeEqual(password, adminPass)) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "Invalid credentials" } },
      { status: 400 }
    );
  }

  const exp = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `${username}.${exp}`;
  const sig = sign(payload, secret);
  const token = `${payload}.${sig}`;

  const res = NextResponse.json({ success: true, data: { loggedIn: true } });
  res.cookies.set({
    name: "admin_session",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(exp)
  });

  return res;
}
