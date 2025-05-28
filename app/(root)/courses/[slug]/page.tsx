"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import EnrollButton from "@/components/EnrollButton";
import LoadingSpinner from "@/components/LoadingSpinner";

const API_URL = "https://ns.auwebx.com/api";

interface Course {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  price: number;
  video_intro_url: string;
  category_id: number;
  subcategory_id: number;
  rating: number;
  num_reviews: number;
  category_name?: string;
  subcategory_name?: string;
    slug: string;
}

interface Lecture {
  id: number;
  title: string;
  video_url: string;
}

interface Chapter {
  id: number;
  title: string;
  lectures: Lecture[];
}

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface CourseApiResponse {
  status: string;
  course: Course;
  chapters: Chapter[];
}

interface CategoriesApiResponse {
  status: string;
  categories: Category[];
}

interface RelatedCoursesApiResponse {
  status: string;
  courses: Course[];
}

export default function CourseDetailPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const [courseRes, categoryRes] = await Promise.all([
          fetch(`${API_URL}/courses/fetch_course_by_slug.php?slug=${slug}`),
          fetch(`${API_URL}/categories/fetch_all.php`),
        ]);
        const courseData: CourseApiResponse = await courseRes.json();
        const categoryData: CategoriesApiResponse = await categoryRes.json();

        if (courseData.status === "success") {
          const course = courseData.course;
          const categories = categoryData.categories || [];

          const category = categories.find(
            (cat) => Number(cat.id) === course.category_id
          );

          const subcategory = categories
            .flatMap((cat) => cat.subcategories || [])
            .find((sub) => Number(sub.id) === course.subcategory_id);

          setCourse({
            ...course,
            category_name: category?.name || "Unknown category",
            subcategory_name: subcategory?.name || "Unknown subcategory",
          });

          setChapters(courseData.chapters);

          // Fetch related courses by category (excluding current course)
          if (course.category_id) {
            const relatedRes = await fetch(
              `${API_URL}/courses/fetch_courses_by_category.php?category_id=${course.category_id}`
            );
            const relatedData: RelatedCoursesApiResponse =
              await relatedRes.json();

            if (relatedData.status === "success") {
              setRelatedCourses(
                relatedData.courses.filter((c) => c.id !== course.id)
              );
            }
          }
        } else {
          setCourse(null);
          setChapters([]);
          setRelatedCourses([]);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSpinner />
      </div>
    );
  }
  if (!course) return <p className="p-4">Course not found</p>;

  

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-lg text-gray-600 mt-1">{course.subtitle}</p>
      </div>

      {/* Video Intro */}
      {course.video_intro_url && (
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow">
          <video
            src={course.video_intro_url}
            controls
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Price + Rating + Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-2xl font-semibold text-green-600">
          ${Number(course.price).toFixed(2)}
        </div>

        <div className="flex items-center gap-2 text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              fill={
                i < Math.round(course.rating || 0) ? "currentColor" : "none"
              }
              stroke="currentColor"
              className="w-5 h-5"
            />
          ))}
          <span className="text-sm text-gray-600">
            ({course.num_reviews} reviews)
          </span>
        </div>
      </div>

      {/* Enroll / Start Learning Button */}
      {/* <div>
        <button
          onClick={handleEnrollClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
        >
          Enroll / Start Learning
        </button>
      </div> */}
     <EnrollButton courseId={course.id} />


      <div className="flex gap-4 text-sm flex-wrap">
        {course.category_name && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Category: {course.category_name}
          </span>
        )}
        {course.subcategory_name && (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            Subcategory: {course.subcategory_name}
          </span>
        )}
      </div>

     


      {/* Description (rich text) */}
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: course.description }} />
      </div>

      {/* Chapters and Lectures */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Chapters & Lectures</h2>
        {chapters.length === 0 && (
          <p className="text-gray-500">No chapters added yet.</p>
        )}
        {chapters.map((chapter) => (
          <div key={chapter.id} className="mb-6 border rounded-lg p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {chapter.title}
            </h3>
            <ul className="ml-4 list-disc space-y-1 text-gray-700">
              {chapter.lectures.map((lecture) => (
                <li key={lecture.id}>{lecture.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Related Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedCourses.map((rc) => (
                 <div
            key={rc.id}
            className="border rounded-lg shadow hover:shadow-md transition"
          >
              
                 <Link href={`/courses/${rc.slug}`}>
              <div className="cursor-pointer border rounded-lg shadow hover:shadow-md transition">
                <Image
                  src={`${API_URL}/courses/${rc.thumbnail}`}
                  alt={rc.title}
                  width={300}
                  height={300}
                  className="w-full h-50 object-cover rounded-t"
                />

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
                    {rc.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 truncate">
                    {rc.subtitle}
                  </p>
                  <div className="flex items-center gap-2 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        fill={
                          i < Math.round(rc.rating || 0)
                            ? "currentColor"
                            : "none"
                        }
                        stroke="currentColor"
                        className="w-4 h-4"
                      />
                    ))}
                    <span className="text-xs text-gray-600">
                      ({rc.num_reviews})
                    </span>
                  </div>
                </div>
                   </div>
            </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
