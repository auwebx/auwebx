"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

const API_URL = "https://ns.auwebx.com/api";

interface Chapter {
  id: number;
  title: string;
  course_id: number;
}

interface Course {
  id: number;
  title: string;
}

interface Lecture {
  id: number;
  title: string;
  description: string;
  video_url: string;
  duration: string;
  order_index: number;
  course_id: number;
  chapter_id: number;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingLecture: Lecture | null;
  refresh: () => void;
}

export const LectureFormModal: React.FC<Props> = ({
  open,
  setOpen,
  editingLecture,
  refresh,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [courseId, setCourseId] = useState<number | "">("");
  const [chapterId, setChapterId] = useState<number | "">("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/courses/fetch_courses.php`);
        const data: { status: string; courses: Course[] } = await res.json();
        if (data.status === "success") {
          setCourses(data.courses);
        } else {
          toast.error("Failed to load courses");
        }
      } catch (err) {
        toast.error("Error loading courses");
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch(`${API_URL}/chapters/fetch.php`);
        const data: { status: string; chapters: Chapter[] } = await res.json();
        if (data.status === "success") {
          const filtered = data.chapters.filter(
            (ch) => Number(ch.course_id) === Number(courseId)
          );
          setChapters(filtered);
        }
      } catch (err) {
        console.error("Error loading chapters", err);
      }
    };

    if (courseId !== "") {
      fetchChapters();
    } else {
      setChapters([]);
    }
  }, [courseId]);

  useEffect(() => {
    if (editingLecture) {
      setTitle(editingLecture.title);
      setDescription(editingLecture.description);
      setVideoUrl(editingLecture.video_url);
      setDuration(editingLecture.duration);
      setOrderIndex(editingLecture.order_index);
      setCourseId(editingLecture.course_id);
      setChapterId(editingLecture.chapter_id);
    } else {
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setDuration("");
      setOrderIndex(0);
      setCourseId("");
      setChapterId("");
    }
  }, [editingLecture]);

  const handleSubmit = async () => {
    if (!title || !description || !videoUrl || !duration || !courseId || !chapterId) {
      toast.error("Please fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video_url", videoUrl);
    formData.append("duration", duration);
    formData.append("order_index", orderIndex.toString());
    formData.append("course_id", courseId.toString());
    formData.append("chapter_id", chapterId.toString());

    if (editingLecture) {
      formData.append("id", editingLecture.id.toString());
    }

    try {
      const res = await fetch(
        `${API_URL}/lectures/${editingLecture ? "edit_lecture" : "create_lecture"}.php`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data: { status: string; message?: string } = await res.json();

      if (data.status === "success") {
        toast.success(editingLecture ? "Lecture updated!" : "Lecture created!");
        setOpen(false);
        refresh();
      } else {
        toast.error(data.message || "Error occurred.");
      }
    } catch (error) {
      toast.error("Failed to save lecture.");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>{editingLecture ? "Edit" : "Add"} Lecture</DialogTitle>
        </DialogHeader>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lecture title"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Lecture description"
        />
        <Input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Video URL"
        />
        <Input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (e.g., 5:12)"
        />
        <Input
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(Number(e.target.value))}
          placeholder="Order"
        />

        <select
          className="border rounded p-2 w-full"
          value={courseId}
          onChange={(e) => setCourseId(Number(e.target.value))}
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>

        <select
          className="border rounded p-2 w-full"
          value={chapterId}
          onChange={(e) => setChapterId(Number(e.target.value))}
          disabled={!chapters.length}
        >
          <option value="">Select Chapter</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>

        <Button onClick={handleSubmit}>
          {editingLecture ? "Update" : "Create"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
