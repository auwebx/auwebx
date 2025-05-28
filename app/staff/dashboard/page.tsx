"use client";

import Image from "next/image";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function StaffDashboard() {
  const user = useProtectedRoute("staff");

  if (!user) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome Staff, {user.fullname}</h1>
        {user.profile_image && (
          <Image
            src={
              user.profile_image
                ? user.profile_image.startsWith("http")
                  ? user.profile_image
                  : `https://ns.auwebx.com/${user.profile_image}`
                : "/default-avatar.png"
            }
            alt="Profile"
            width={64}
            height={64}
            className="rounded-full border border-gray-300 mb-4"
          />
        )}
      </div>

      <p className="mt-4">This is your staff dashboard.</p>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
