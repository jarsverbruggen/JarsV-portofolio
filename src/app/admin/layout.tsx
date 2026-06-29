import type { Metadata } from "next";
import "./admin.css";
import { AdminGate } from "@/components/admin/AdminGate";

export const metadata: Metadata = {
  title: "Panel Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
