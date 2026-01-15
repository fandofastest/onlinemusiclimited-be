"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className="link"
      style={active ? { color: "var(--text)", background: "rgba(255,255,255,.06)" } : undefined}
    >
      {label}
    </Link>
  );
}

export default function NavBar() {
  const router = useRouter();

  return (
    <div className="nav">
      <div className="navInner">
        <div className="brand">Admin Panel</div>
        <div className="links">
          <NavLink href="/admin/categories" label="Categories" />
          <NavLink href="/admin/articles" label="Articles" />
          <NavLink href="/admin/tracks" label="AI Tracks" />
        </div>
        <div className="right">
          <button
            className="button buttonDanger"
            onClick={async () => {
              await fetch("/api/admin/auth/logout", { method: "POST" });
              router.replace("/admin/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
