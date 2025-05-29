'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type Course = {
  id: string;
  title: string;
  thumbnail: string;
  slug: string;
};

const API_URL = "https://ns.auwebx.com/api";

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user?.id) {
      setError('User not logged in.');
      setLoading(false);
      return;
    }

    async function fetchCourses() {
      try {
        const res = await fetch(
          `https://ns.auwebx.com/api/user/fetch_enrolled_courses.php?user_id=${user.id}`
        );
        const data = await res.json();

        if (data.status !== 'success') {
          throw new Error(data.message || 'Failed to fetch courses');
        }

        setCourses(data.courses);
      } catch {
        setError( 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && courses.length === 0 && <p>You have not enrolled in any courses yet.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {courses.map(course => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="block border rounded shadow hover:shadow-md transition"
            >
              <Image
                src={`${API_URL}/courses/${course.thumbnail}`}
                alt={course.title}
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{course.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
