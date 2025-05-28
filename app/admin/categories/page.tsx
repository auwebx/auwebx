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

const API_URL = "https://ns.auwebx.com/api/categories";

type Category = {
  id: number;
  name: string;
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");

  // Fetch categories on load
  const fetchCategories = async () => {
    const res = await fetch(`${API_URL}/fetch_categories.php`);
    const data = await res.json();
    setCategories(data.categories || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
  const endpoint = editingCategory
    ? `${API_URL}/update_category.php`
    : `${API_URL}/create_category.php`;

  const formData = new FormData();
  formData.append("name", name);
  if (editingCategory) {
    formData.append("id", editingCategory.id.toString());
  }

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (data.status === "success") {
    setOpen(false);
    setEditingCategory(null);
    setName("");
    fetchCategories();
  } else {
    alert(data.message || "Something went wrong.");
  }
};


  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    const formData = new FormData();
    formData.append("id", id.toString());

    const res = await fetch(`${API_URL}/delete.php`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.status === "success") {
      fetchCategories();
    } else {
      alert(data.message || "Delete failed.");
    }
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Categories</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setName("");
                setEditingCategory(null);
              }}
            >
              + New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit" : "Add"} Category
              </DialogTitle>
            </DialogHeader>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
            />
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
              <th className="py-2">S/N</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat:Category, index: number) => (
              <tr key={cat.id} className="border-t">
                <td className="py-2">{index + 1}</td>
                <td>{cat.name}</td>
                <td className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cat.id)}
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

export default AdminCategoriesPage;
