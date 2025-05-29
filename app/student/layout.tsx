import StudentLayout from "@/components/layout/StudentLayout";
import { Toaster } from "react-hot-toast";

export default function StudentPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentLayout>
      {children}
      <Toaster position="top-right" />
    </StudentLayout>
  );
}
