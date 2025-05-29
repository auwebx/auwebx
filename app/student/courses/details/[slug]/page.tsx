'use client';

import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

type Lecture = {
  id: number;
  chapter_id: number;
  course_id: number;
  title: string;
  description: string;
  video_url: string;
};

type Chapter = {
  id: number;
  title: string;
  description: string;
  course_id: number;
  order: number;
  lectures: Lecture[];
};

type Course = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  video_intro_url: string;
  price: number;
  is_published: boolean;
  category_id: number;
  subcategory_id: number;
  slug: string;
  rating: number;
  num_reviews: number;
  created_at: string;
};

interface PageProps {
  params: {
    slug: string;
  };
}

export default function StudentCourseDetail({ params }: PageProps) {
  const { slug } = params;

  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [watched, setWatched] = useState<number[]>([]);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData: User = JSON.parse(storedUser);
        setUser(userData);
      } catch {
        console.error("Invalid user data in localStorage.");
      }
    }
  }, []);

  // Fetch course and chapter data
  useEffect(() => {
    if (slug) {
      fetch(`https://ns.auwebx.com/api/courses/fetch_course_by_slug.php?slug=${slug}`)
        .then(res => res.json())
        .then(data => {
          setCourse(data.course || null);
          setChapters(data.chapters || []);
        })
        .catch(console.error);
    }
  }, [slug]);

  // Fetch watched lectures for user
  useEffect(() => {
    if (user?.id) {
      fetch(`https://ns.auwebx.com/api/user/fetch_progress.php?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => setWatched(data.watchedLectures || []))
        .catch(console.error);
    }
  }, [user]);

  // Track and send progress
  const handleProgress = async (lectureId: number) => {
    if (!user || watched.includes(lectureId)) return;

    try {
      await fetch('https://ns.auwebx.com/api/user/watched_lecture.php', {
        method: 'POST',
        body: new URLSearchParams({
          user_id: user.id.toString(),
          lecture_id: lectureId.toString(),
        }),
      });

      setWatched(prev => [...prev, lectureId]);
    } catch (error) {
      console.error("Failed to update progress", error);
    }
  };

  // Trigger progress update on video playback
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>, lectureId: number) => {
    const video = e.currentTarget;
    const percent = (video.currentTime / video.duration) * 100;

    if (percent >= 90 && !watched.includes(lectureId)) {
      handleProgress(lectureId);
    }
  };

  if (!course) return <div className="p-6 text-center">Loading...</div>;

  const totalLectures = chapters.reduce((sum, chapter) => sum + chapter.lectures.length, 0);
  const percentComplete = totalLectures ? Math.round((watched.length / totalLectures) * 100) : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>

      <div className="mb-6">
        <p className="text-sm">Progress: {percentComplete}%</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {chapters.map((chapter) => (
        <div key={chapter.id} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{chapter.title}</h2>
          <ul className="space-y-4">
            {chapter.lectures.map((lecture) => (
              <li key={lecture.id} className="border p-4 rounded">
                <h3 className="font-medium">{lecture.title}</h3>
                <video
                  src={lecture.video_url}
                  controls
                  onTimeUpdate={(e) => handleTimeUpdate(e, lecture.id)}
                  className="w-full mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  {watched.includes(lecture.id) ? "✅ Watched" : "🕒 Not watched"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
