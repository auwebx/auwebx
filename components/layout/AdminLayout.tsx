"use client";

import { ReactNode } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-white">
        <AdminSidebar />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 border rounded-md shadow-sm bg-white">
              <Menu />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader>
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            </SheetHeader>
            <AdminSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Page Content */}
      <main className="flex-1 p-4 w-full">{children}</main>
    </div>
  );
}
