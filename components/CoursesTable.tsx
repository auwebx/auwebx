'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Course = {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  is_published: number;
  slug: string;
  rating: number;
  num_reviews: number;
  created_at: string;
};

export default function CoursesTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      const res = await fetch('https://ns.auwebx.com/api/courses/get_courses.php');
      const data = await res.json();
      if (data.status === 'success') {
        setCourses(data.courses);
      } else {
        setError('Failed to load courses.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    const formData = new FormData();
    formData.append("id", id.toString());

    const res = await fetch('https://ns.auwebx.com/api/courses/delete_course.php', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    if (result.status === 'success') {
      setCourses(prev => prev.filter(course => course.id !== id));
    } else {
      alert('Failed to delete course.');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-200 bg-white shadow-md rounded">
        <thead className="bg-gray-100">
          <tr className="text-left text-sm font-semibold text-gray-700">
            <th className="p-3">#</th>
            <th className="p-3">Title</th>
            <th className="p-3">Subtitle</th>
            <th className="p-3">Price</th>
            <th className="p-3">Published</th>
            <th className="p-3">Rating</th>
            <th className="p-3">Reviews</th>
            <th className="p-3">Created</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={course.id} className="border-t">
              <td className="p-3">{index + 1}</td>
              <td className="p-3 font-medium">{course.title}</td>
              <td className="p-3 text-sm">{course.subtitle}</td>
              <td className="p-3">${Number(course.price).toFixed(2)}</td>

              <td className="p-3">{course.is_published ? 'Yes' : 'No'}</td>
              <td className="p-3">{Number(course.rating)}</td>

              <td className="p-3">{course.num_reviews}</td>
              <td className="p-3">{new Date(course.created_at).toLocaleDateString()}</td>
              <td className="p-3 space-x-2">
                <Link
                  href={`/admin/courses/edit/${course.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {courses.length === 0 && (
            <tr>
              <td colSpan={9} className="p-3 text-center text-gray-500">
                No courses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
