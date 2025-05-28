"use client";

import { useEffect, useState } from "react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import LoadingSpinner from "@/components/LoadingSpinner";
import LogoutButton from "@/components/LogoutButton";

type UserType = {
  id: number;
  fullname: string;
  email: string;
  role: "admin" | "staff" | "student";
};

export default function AdminUsersPage() {
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
    <Card>
      <CardHeader>
        <CardTitle>Manage User Roles</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingUsers ? (
          <p>Loading users...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.fullname}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(value) => handleRoleChange(u.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="mt-6">
          <LogoutButton />
        </div>
      </CardContent>
    </Card>
  );
}
