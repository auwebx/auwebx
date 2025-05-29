'use client';

import { useEffect, useState } from 'react';

interface Lecture {
  id: number;
  chapter_id: number;
  course_id: number;
  title: string;
  description: string;
  video_url: string;
}

interface Chapter {
  id: number;
  course_id: number;
  title: string;
  order: number;
  lectures: Lecture[];
}

interface Course {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  video_intro_url: string;
  price: number;
  is_published: number;
  category_id: number;
  subcategory_id: number;
  slug: string;
  rating: number;
  num_reviews: number;
  created_at: string;
}

interface User {
  id: number;
  email: string;
  fullname: string;
  // Add other user fields if necessary
}

export default function StudentCourseDetail({ slug }: { slug: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [watched, setWatched] = useState<number[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;
    if (userData) setUser(userData);
  }, []);

  useEffect(() => {
    if (slug) {
      fetch(`https://ns.auwebx.com/api/courses/fetch_course_by_slug.php?slug=${slug}`)
        .then(res => res.json())
        .then(data => {
          setCourse(data.course);
          setChapters(data.chapters || []);
        });
    }
  }, [slug]);

  useEffect(() => {
    if (user?.id) {
      fetch(`https://ns.auwebx.com/api/user/fetch_progress.php?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => setWatched(data.watchedLectures || []));
    }
  }, [user]);

  const handleProgress = async (lectureId: number) => {
    if (watched.includes(lectureId) || !user) return;

    await fetch('https://ns.auwebx.com/api/user/watched_lecture.php', {
      method: 'POST',
      body: new URLSearchParams({
        user_id: user.id.toString(),
        lecture_id: lectureId.toString(),
      }),
    });

    setWatched(prev => [...prev, lectureId]);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>, lectureId: number) => {
    const video = e.currentTarget;
    const percent = (video.currentTime / video.duration) * 100;

    if (percent >= 90 && !watched.includes(lectureId)) {
      handleProgress(lectureId);
    }
  };

  const totalLectures = chapters.reduce((acc, c) => acc + c.lectures.length, 0);
  const completedLectures = watched.length;
  const progressPercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  if (!course) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-gray-500">{course.subtitle}</p>
        <p className="text-sm text-green-600">Progress: {progressPercent}%</p>
      </div>

      {chapters.map((chapter) => (
        <div key={chapter.id}>
          <h2 className="text-xl font-semibold mb-2">{chapter.title}</h2>
          <div className="space-y-4">
            {chapter.lectures.map((lecture) => (
              <div key={lecture.id} className="border rounded p-4">
                <h3 className="font-medium text-lg">{lecture.title}</h3>
                <video
                  src={lecture.video_url}
                  controls
                  className="w-full mt-2 rounded"
                  onTimeUpdate={(e) => handleTimeUpdate(e, lecture.id)}
                />
                <p className="text-sm mt-2 text-gray-600">
                  {watched.includes(lecture.id) ? '✅ Watched' : '🕒 Not watched'}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
