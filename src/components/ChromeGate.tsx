"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the public site chrome (Header / Footer) on admin routes so the CMS
 * renders as a standalone dashboard. Public pages are unaffected.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
