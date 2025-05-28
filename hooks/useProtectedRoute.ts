'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  fullname: string;
  role: 'admin' | 'staff' | 'student';
  profile_image?: string;
}

export function useProtectedRoute(expectedRole: 'admin' | 'staff' | 'student') {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser: User = JSON.parse(storedUser);

    // Redirect based on role
    if (parsedUser.role !== expectedRole) {
      router.push(`/${parsedUser.role}/dashboard`);
      return;
    }

    setUser(parsedUser);
  }, [router, expectedRole]);

  return user;
}
