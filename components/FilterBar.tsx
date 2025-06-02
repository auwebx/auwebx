

import React, { Dispatch, SetStateAction } from "react";

type SortType = "" | "asc" | "desc";

interface Category {
  id: number;
  name: string;
}

interface FilterBarProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  sort: SortType;
  setSort: Dispatch<SetStateAction<SortType>>;
  categoryId: number | "all";
  setCategoryId: Dispatch<SetStateAction<number | "all">>;
  categories: Category[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  search,
  setSearch,
  sort,
  setSort,
  categoryId,
  setCategoryId,
  categories,
}) => {
  const isFilterActive =
    search !== "" || sort !== "" || categoryId !== "all";

  return (
    <div className="mb-6 space-y-4">
      {/* Search + Price Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded shadow-sm w-full sm:w-2/3"
        />

        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as SortType)
          }
          className="px-4 py-2 border rounded shadow-sm w-full sm:w-1/3"
        >
          <option value="">Sort by Price</option>
          <option value="asc">Lowest First</option>
          <option value="desc">Highest First</option>
        </select>
      </div>

       {/* Mobile-only Categories Select */}
      <div className="sm:hidden px-1">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-2 border rounded shadow-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Pills (desktop and tablet) */}
      <div className="hidden sm:block overflow-x-auto px-1 sm:px-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCategoryId("all")}
            className={`px-3 py-1 rounded-full border text-sm whitespace-nowrap transition
              ${categoryId === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={`px-3 py-1 rounded-full border text-sm whitespace-nowrap transition
                ${categoryId === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Filters Button */}
      <div>
        <button
          onClick={() => {
            setSearch("");
            setSort("");
            setCategoryId("all");
          }}
          disabled={!isFilterActive}
          className={`px-4 py-2 text-sm rounded shadow-sm w-full sm:w-auto transition-colors
            ${isFilterActive
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;

