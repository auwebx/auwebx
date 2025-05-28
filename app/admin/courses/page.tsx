"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TiptapEditor from "@/components/TiptapEditor";
import CoursesTable from "@/components/CoursesTable";

interface Category {
  id: number;
  name: string;
}

interface CourseForm {
  title: string;
  subtitle: string;
  description: string;
  videoIntroUrl: string;
  price: string;
  isPublished: boolean;
  categoryId: number;
  subcategoryId: number;
  thumbnail: File | null;
}

const AdminCoursesPage = () => {
  const [form, setForm] = useState<CourseForm>({
    title: "",
    subtitle: "",
    description: "",
    videoIntroUrl: "",
    price: "",
    isPublished: false,
    categoryId: 0,
    subcategoryId: 0,
    thumbnail: null,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subcatRes] = await Promise.all([
          fetch("https://ns.auwebx.com/api/categories/fetch_records.php"),
          fetch("https://ns.auwebx.com/api/subcategories/fetch_records.php"),
        ]);

        if (!catRes.ok) {
          const errorText = await catRes.text();
          throw new Error(
            `Categories fetch failed: ${catRes.status} - ${errorText}`
          );
        }
        if (!subcatRes.ok) {
          const errorText = await subcatRes.text();
          throw new Error(
            `Subcategories fetch failed: ${subcatRes.status} - ${errorText}`
          );
        }

        const catText = await catRes.text();
        const subcatText = await subcatRes.text();

        const catData = catText ? JSON.parse(catText) : [];
        const subcatData = subcatText ? JSON.parse(subcatText) : [];

        setCategories(catData.categories || catData);
        setSubcategories(subcatData.subcategories || subcatData);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setMessage("Failed to load categories. Please try again later.");
      }
    };
    fetchData();
  }, []);

  

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";

    setForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, thumbnail: file }));
  };

  const handleDescriptionChange = (content: string) => {
    setForm((prev) => ({ ...prev, description: content }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "thumbnail" && value instanceof File) {
          formData.append("thumbnail", value);
        } else {
          formData.append(key, value.toString());
        }
      });

      const res = await fetch(
        "https://ns.auwebx.com/api/courses/create_course.php",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.status === "success") {
        setMessage(data.message || "Course created successfully.");
      } else {
        setMessage(data.message || "An error occurred.");
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle> Course Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">All Courses</h1>
          <CoursesTable />
        </div>

        {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}

         <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Create Course</h1>
       
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Course Title"
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            placeholder="Course Subtitle"
            className="w-full border p-2 rounded"
          />
          <div className="border p-2 rounded">
            <TiptapEditor
              content={form.description}
              onChange={handleDescriptionChange}
            />
          </div>
          <input
            name="videoIntroUrl"
            value={form.videoIntroUrl}
            onChange={handleChange}
            placeholder="Video Intro URL"
            className="w-full border p-2 rounded"
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full border p-2 rounded"
            type="number"
            step="0.01"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
            />
            <span>Publish Course</span>
          </label>

          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            name="subcategoryId"
            value={form.subcategoryId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <input type="file" accept="image/*" onChange={handleFileChange} />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Create Course"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminCoursesPage;
