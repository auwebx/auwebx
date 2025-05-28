"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { LectureFormModal } from "@/components/LectureFormModal";
import toast from "react-hot-toast";

const API_URL = "https://ns.auwebx.com/api";

interface Lecture {
  id: number;
  title: string;
  description: string;
  video_url: string;
  duration: string;
  order_index: number;
  chapter_id: number;
  chapter_title: string;
  course_id: number;
  course_title: string;
}

export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [open, setOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  const fetchLectures = async () => {
    const res = await fetch(`${API_URL}/lectures/fetch_lectures.php`);
    const data = await res.json();
    setLectures(data.lectures || []);
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = confirm("Are you sure you want to delete this lecture?");
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("id", id.toString());

    try {
      const res = await fetch(`${API_URL}/lectures/delete_lecture.php`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ id }),
});


      const data = await res.json();

      if (data.status === "success") {
        toast.success("Lecture deleted!");
        fetchLectures();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      toast.error("Server error");
      console.error(err);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Lectures</CardTitle>
          <Button
            onClick={() => {
              setEditingLecture(null);
              setOpen(true);
            }}
          >
            <PlusCircle className="w-4 h-4 mr-2" /> New Lecture
          </Button>
        </CardHeader>

        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>#</th>
                <th>Title</th>
                <th>Course</th>
                <th>Chapter</th>
                <th>Duration</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lectures.map((lecture, i) => (
                <tr key={lecture.id} className="border-t">
                  <td>{i + 1}</td>
                  <td>{lecture.title}</td>
                  <td>{lecture.course_title}</td>
                  <td>{lecture.chapter_title}</td>
                  <td>{lecture.duration}</td>
                  <td>{lecture.order_index}</td>
                  <td className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingLecture(lecture);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(lecture.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal */}
      <LectureFormModal
        open={open}
        setOpen={setOpen}
        editingLecture={editingLecture}
        refresh={fetchLectures}
      />
    </>
  );
}
