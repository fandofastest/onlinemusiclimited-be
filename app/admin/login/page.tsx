"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="center">
      <div className="card loginCard">
        <div className="h1">Admin Login</div>
        <div className="p">Sign in to manage learning content and AI tracks.</div>

        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          <label className="label">
            Username
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </label>
          <label className="label">
            Password
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
        </div>

        <button
          className="button buttonPrimary"
          style={{ width: "100%", marginTop: 12 }}
          disabled={loading}
          onClick={async () => {
            setError(null);
            setLoading(true);
            try {
              const res = await fetch("/api/admin/auth/login", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ username, password })
              });
              const body = await res.json().catch(async () => ({ raw: await res.text() }));
              if (!res.ok) {
                setError(typeof body?.error?.message === "string" ? body.error.message : "Login failed");
                return;
              }
              router.replace("/admin/categories");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {error ? <div className="error">{error}</div> : null}
      </div>
    </div>
  );
}
