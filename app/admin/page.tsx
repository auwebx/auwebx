"use client";

import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminDashboardPage() {
  const user = useProtectedRoute("admin");

  if (!user) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-2xl">
            Welcome Admin, {user.fullname}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            This is your admin dashboard.
          </p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={
              user.profile_image?.startsWith("http")
                ? user.profile_image
                : `https://ns.auwebx.com/${user.profile_image}`
            }
          />
          <AvatarFallback>{user.fullname[0]}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">More dashboard widgets coming soon.</p>
      </CardContent>
    </Card>
  );
}
