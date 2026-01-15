"use client";

import "./admin.css";
import { usePathname } from "next/navigation";
import NavBar from "./_components/NavBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <html lang="en">
      <body>
        {isLogin ? null : <NavBar />}
        {children}
      </body>
    </html>
  );
}
