// components/CategoryFilter.tsx
"use client";

import { useEffect, useState } from "react";

const API_URL = "https://ns.auwebx.com/api";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface Props {
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategoryId: string | null;
}

export default function CategoryFilter({
  onCategorySelect,
  selectedCategoryId,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories/fetch_all.php`);
        const data = await res.json();
        if (data.status === "success") {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className="flex gap-2 flex-wrap py-4">
      <button
        className={`px-4 py-2 rounded-full text-sm border ${
          selectedCategoryId === null
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-800"
        }`}
        onClick={() => onCategorySelect(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`px-4 py-2 rounded-full text-sm border ${
            selectedCategoryId === cat.id
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800"
          }`}
          onClick={() => onCategorySelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
