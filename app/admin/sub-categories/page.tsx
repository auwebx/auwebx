"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash, Pencil } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = "https://ns.auwebx.com/api";

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
}

const AdminSubCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubCategories] = useState<SubCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);

  const fetchData = async () => {
    const catRes = await fetch(`${API_URL}/categories/fetch_categories.php`);
    const catData = await catRes.json();
    setCategories(catData.categories || []);

    const subRes = await fetch(`${API_URL}/subcategories/fetch.php`);
    const subData = await subRes.json();
    setSubCategories(subData.subcategories || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    const endpoint = editingSub
      ? `${API_URL}/subcategories/update_subcategory.php`
      : `${API_URL}/subcategories/create_subcategory.php`;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category_id", categoryId.toString());
    if (editingSub) {
      formData.append("id", editingSub.id.toString());
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success") {
        toast.success(
          editingSub ? "Subcategory updated!" : "Subcategory created!"
        );
        setOpen(false);
        setEditingSub(null);
        setName("");
        setCategoryId(0);
        fetchData();
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    const formData = new FormData();
    formData.append("id", id.toString());

    try {
      const res = await fetch(
        `${API_URL}/subcategories/delete_subcategory.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        toast.success("Subcategory deleted successfully!");
        fetchData();
      } else {
        toast.error(data.message || "Failed to delete subcategory.");
      }
    } catch (error) {
      toast.error("Error deleting subcategory. Please try again.");
      console.error(error);
    }
  };

  const openEdit = (sub: SubCategory) => {
    setEditingSub(sub);
    setName(sub.name);
    setCategoryId(sub.category_id);
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Sub-Categories</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setName("");
                setCategoryId(0);
                setEditingSub(null);
              }}
            >
              + New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSub ? "Edit" : "Add"} Sub-Category
              </DialogTitle>
            </DialogHeader>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sub-category name"
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="mt-3 p-2 border rounded w-full"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button className="mt-4" onClick={handleSave}>
              Save
            </Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2">#</th>
              <th>Name</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.map((sub, i) => (
              <tr key={sub.id} className="border-t">
                <td className="py-2">{i + 1}</td>
                <td>{sub.name}</td>
                <td>{sub.category_name}</td>
                <td className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(sub)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(sub.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default AdminSubCategoriesPage;
