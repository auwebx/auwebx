"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, BookAIcon } from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/courses", label: "Courses", icon: BookAIcon },
 
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function StudentSidebar() {
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
