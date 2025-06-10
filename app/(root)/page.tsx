"use client";

import FilterBar from "@/components/FilterBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "https://ns.auwebx.com/api";
const ITEMS_PER_PAGE = 6;
const USE_INFINITE_SCROLL = false;

type Course = {
  id: number;
  title: string;
  subtitle: string;
  thumbnail: string;
  price: number;
  rating: number | null;
  num_reviews: number;
  slug: string;
  category_id: number;
};

type Subcategory = {
  id: number;
  name: string;
};

type Category = {
  id: number;
  name: string;
  subcategories: Subcategory[];
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc" | "">("");
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch courses
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/courses/fetch_courses.php`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.status === "success" ? data.courses : []);
        setLoading(false);
      });
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch(`${API_URL}/categories/fetch_all.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setCategories(data.categories);
        }
      });
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [categoryId, debouncedSearch, sort]);

  const filteredCourses = courses
    .filter((course) =>
      course.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    .filter((course) =>
      categoryId === "all" ? true : course.category_id === categoryId
    )
    .sort((a, b) => {
      if (sort === "asc") return a.price - b.price;
      if (sort === "desc") return b.price - a.price;
      return 0;
    });

  const paginatedCourses = USE_INFINITE_SCROLL
    ? filteredCourses.slice(0, page * ITEMS_PER_PAGE)
    : filteredCourses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    if (!USE_INFINITE_SCROLL) return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200
      ) {
        if (hasMore) {
          setPage((prev) => prev + 1);
          if ((page + 1) * ITEMS_PER_PAGE >= filteredCourses.length) {
            setHasMore(false);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, filteredCourses.length]);

  function StarRating({ rating }: { rating: number }) {
    const stars = [];
    const rounded = Math.round(rating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded)
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>
        );
      else if (i - 0.5 === rounded)
        stars.push(
          <span key={i} className="text-yellow-400">
            ☆
          </span>
        );
      else
        stars.push(
          <span key={i} className="text-gray-300">
            ★
          </span>
        );
    }
    return <div className="flex gap-1">{stars}</div>;
  }

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Courses</h1>

      <FilterBar
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={categories}
      />

      {/* Course grid or loader */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {paginatedCourses.map((course) => (
              <div
                key={course.id}
                className="border rounded-lg shadow hover:shadow-md transition"
              >
                <Link href={`/courses/${course.slug}`}>
                  <div className="cursor-pointer">
                    <Image
                      src={`${API_URL}/courses/${course.thumbnail}`}
                      alt={course.title}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover rounded-t"
                    />
                    <div className="p-4">
                      <h2 className="text-xl font-semibold">{course.title}</h2>
                      <p className="text-sm text-gray-600">{course.subtitle}</p>
                      <p className="text-xs text-gray-500">
                        Category:{" "}
                        {categoryMap.get(course.category_id) || "Unknown"}
                      </p>

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
                        Course Details
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {paginatedCourses.length === 0 && (
            <p className="text-center text-gray-500 mt-6">No courses found.</p>
          )}

          {/* Pagination controls */}
          {!USE_INFINITE_SCROLL && filteredCourses.length > ITEMS_PER_PAGE && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="font-semibold">
                Page {page} of{" "}
                {Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)}
              </span>
              <button
                onClick={() =>
                  setPage((p) =>
                    p < Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
                      ? p + 1
                      : p
                  )
                }
                disabled={
                  page >= Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
                }
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
