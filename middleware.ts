import { NextResponse, type NextRequest } from "next/server";

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function base64urlToBytes(input: string) {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const raw = atob(b64 + pad);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function bytesToBase64url(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function verifySession(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const username = parts[0];
  const exp = Number(parts[1]);
  const sig = parts[2];

  if (!username) return false;
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;

  const payload = `${username}.${exp}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = bytesToBase64url(new Uint8Array(mac));

  const a = base64urlToBytes(sig);
  const b = base64urlToBytes(expected);
  return constantTimeEqual(a, b);
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminRoute) return NextResponse.next();

  const isLoginPage = pathname === "/admin/login";
  const isAuthApi = pathname.startsWith("/api/admin/auth/");
  if (isLoginPage || isAuthApi) return NextResponse.next();

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return redirectToLogin(req);
  }

  const token = req.cookies.get("admin_session")?.value;
  if (!token) return redirectToLogin(req);

  const ok = await verifySession(token, secret);
  if (!ok) return redirectToLogin(req);

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
