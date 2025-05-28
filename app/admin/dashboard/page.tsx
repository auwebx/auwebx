"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import LoadingSpinner from "@/components/LoadingSpinner";

type UserType = {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "staff" | "student";
};

export default function AdminDashboard() {
  const user = useProtectedRoute("admin");
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("https://ns.auwebx.com/fetch_users.php");
      const data = await res.json();
      if (data.status === "success") {
        setUsers(data.users);
      }
      setLoadingUsers(false);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (id: number, newRole: string) => {
    const res = await fetch("https://ns.auwebx.com/update_role.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });

    const data = await res.json();
    if (data.status === "success") {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole as UserType["role"] } : u))
      );
    } else {
      alert(data.message || "Error updating role.");
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome Admin, {user.fullname}</h1>
        {user.profile_image && (
          <Image
            src={
              user.profile_image.startsWith("http")
                ? user.profile_image
                : `https://ns.auwebx.com/${user.profile_image}`
            }
            alt="Profile"
            width={64}
            height={64}
            className="rounded-full border border-gray-300"
          />
        )}
      </div>

      <p className="mb-4">Manage user roles below:</p>

      {loadingUsers ? (
        <p>Loading users...</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-2 border">{u.fullname}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border capitalize">{u.role}</td>
                <td className="p-2 border">
                  <select
                    className="border p-1 rounded"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="student">Student</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
