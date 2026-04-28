import AdminGuard from "@/components/admin/admin-guard";

export const metadata = { title: "Admin — The Exclusive Rack" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
