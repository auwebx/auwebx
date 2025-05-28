"use client";


import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Course = {
  id: number;
  title: string;
  subtitle: string;
  thumbnail: string;
  price: number;
  rating: number | null;
  num_reviews: number;
  slug: string;
};

const API_URL = "https://ns.auwebx.com/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);

 useEffect(() => {
    fetch(`${API_URL}/courses/fetch_courses.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setCourses(data.courses);
        } else {
          setCourses([]); // to avoid infinite loading
        }
      });
  }, []);

  function StarRating({ rating }: { rating: number }) {
    const stars = [];

    // Round rating to nearest half star
    const roundedRating = Math.round(rating * 2) / 2;

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        // full star
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>
        );
      } else if (i - 0.5 === roundedRating) {
        // half star (optional, or you can skip this)
        stars.push(
          <span key={i} className="text-yellow-400">
            ☆
          </span>
        ); // or a half star icon if you have one
      } else {
        // empty star
        stars.push(
          <span key={i} className="text-gray-300">
            ★
          </span>
        );
      }
    }

    return <div className="flex gap-1">{stars}</div>;
  }

  if (courses === null) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border rounded-lg shadow hover:shadow-md transition"
          >
            <Link href={`/courses/${course.slug}`}>
              <div className="cursor-pointer border rounded-lg shadow hover:shadow-md transition">
                <Image
                  src={`${API_URL}/courses/${course.thumbnail}`}
                  alt={course.title}
                  width={300}
                  height={300}
                  className="w-full h-50 object-cover rounded-t"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="text-sm text-gray-600">{course.subtitle}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating rating={course.rating ?? 0} />
                    <span className="text-gray-600 text-sm">
                      ({course.num_reviews ?? 0})
                    </span>
                  </div>
                  <div className="mt-2 font-bold text-lg text-green-600">
                    ${Number(course.price).toFixed(2)}
                  </div>
                  <div className="mt-4 w-full bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 transition">
                    Enroll
                  </div>
                  {/* <EnrollButton courseId={course.id} /> */}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
