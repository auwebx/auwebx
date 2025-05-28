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

interface Course {
  id: number;
  title: string;
}

interface Chapter {
  id: number;
  chapter_title: string;
  course_id: number;
  course_title: string;
  order: number;
}



const AdminChaptersPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [open, setOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState<number>(0);
  const [order, setOrder] = useState<number>(0);

  const fetchData = async () => {
    const catRes = await fetch(`${API_URL}/courses/fetch_courses.php`);
    const catData = await catRes.json();
    setCourses(catData.courses || []);

    const chapterRes = await fetch(`${API_URL}/chapters/fetch.php`);
    const chapterData = await chapterRes.json();
    setChapters(chapterData.chapters || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    const endpoint = editingChapter
      ? `${API_URL}/chapters/update_chapter.php`
      : `${API_URL}/chapters/create_subcategory.php`;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("course_id", courseId.toString());
    formData.append("order", order.toString());
    if (editingChapter) {
      formData.append("id", editingChapter.id.toString());
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success") {
        toast.success(
          editingChapter ? "Chapter updated!" : "Chapter created!"
        );
        setOpen(false);
        setEditingChapter(null);
        setTitle("");
        setCourseId(0);
        setOrder(0);
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
        `${API_URL}/chapters/delete_chapter.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        toast.success("Chapter deleted successfully!");
        fetchData();
      } else {
        toast.error(data.message || "Failed to delete chapter.");
      }
    } catch (error) {
      toast.error("Error deleting chapter. Please try again.");
      console.error(error);
    }
  };

  const openEdit = (chapter: Chapter) => {
  setEditingChapter(chapter);
  setTitle(chapter.chapter_title);
  setCourseId(chapter.course_id);
  setOrder(chapter.order);
  setOpen(true);
};


  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Chapters</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setTitle("");
                setCourseId(0);
                setOrder(0);
                setEditingChapter(null);
              }}
            >
              + New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingChapter ? "Edit" : "Add"} Chapter
              </DialogTitle>
            </DialogHeader>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chapter Title"
            />
            <Input
              value={order}
               onChange={(e) => setOrder(Number(e.target.value))}
              
            />
            <select
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
              className="mt-3 p-2 border rounded w-full"
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
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
              <th>Course</th>
               <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((chapter, i) => (
              <tr key={chapter.id} className="border-t">
                <td className="py-2">{i + 1}</td>
               <td>{chapter.chapter_title}</td>
<td>{chapter.course_title}</td>
<td>{chapter.order}</td>

                <td className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(chapter)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(chapter.id)}
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

export default AdminChaptersPage;
