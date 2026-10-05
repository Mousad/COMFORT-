import { requireAdmin } from "@/lib/admin-auth";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  await requireAdmin();

  return <AdminDashboard />;
}