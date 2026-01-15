import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true, data: { loggedOut: true } });
  res.cookies.set({
    name: "admin_session",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
  return res;
}
