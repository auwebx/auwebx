import AdminLayout from "@/components/layout/AdminLayout";
import { Toaster } from "react-hot-toast";

export default function AdminPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      {children}
      <Toaster position="top-right" />
    </AdminLayout>
  );
}
