"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings, BookAIcon, List, BanknoteIcon } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/courses", label: "Courses", icon: BookAIcon },
  { href: "/admin/categories", label: "Categories", icon: List },
  { href: "/admin/sub-categories", label: "Sub-Categories", icon: List },
  { href: "/admin/chapters", label: "Chapters", icon: List },
  { href: "/admin/lectures", label: "Lectures", icon: List },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/transfers", label: "Bank Transfers", icon: BanknoteIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-4 text-sm">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition",
            pathname === href ? "bg-muted font-semibold" : "text-muted-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
