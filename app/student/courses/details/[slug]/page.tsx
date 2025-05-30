'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';

const API_URL = 'https://ns.auwebx.com/api';

type Lecture = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  chapter_id: string;
};

type Chapter = {
  id: string;
  title: string;
  order: number;
  lectures: Lecture[];
};

type Course = {
  id: string;
  title: string;
  thumbnail: string;
  slug: string;
};

export default function StudentCourseDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [watchedLectures, setWatchedLectures] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (user?.id) setUserId(user.id);

    async function fetchCourseDetails() {
      try {
        const res = await fetch(`${API_URL}/user/fetch_course_by_slug.php?slug=${slug}`);
        const data = await res.json();

        console.log('API response:', data);

        if (data.status === 'success') {
          setCourse(data.course);
          setChapters(data.chapters);

          // Debug log to verify nested lectures
          data.chapters.forEach((chapter: Chapter) => {
            console.log(`Chapter: ${chapter.title}, Lectures: ${chapter.lectures?.length}`);
          });
        } else {
          console.error('Failed to load course:', data.message);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    }

    fetchCourseDetails();
  }, [slug]);

  const handleLectureProgress = async (lectureId: string, videoRef: HTMLVideoElement) => {
    if (watchedLectures.includes(lectureId)) return;

    const percentPlayed = (videoRef.currentTime / videoRef.duration) * 100;

    if (percentPlayed > 90) {
      setWatchedLectures(prev => [...prev, lectureId]);

      await fetch(`${API_URL}/user/mark_lecture_watched.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, lecture_id: lectureId }),
      });
    }
  };

  const getOverallProgress = () => {
    const totalLectures = chapters.reduce((sum, c) => sum + (c.lectures?.length || 0), 0);
    return totalLectures === 0 ? 0 : Math.round((watchedLectures.length / totalLectures) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {course && (
        <>
          <h1 className="text-2xl font-bold mb-2">{course.title}</h1>

          <div className="w-full bg-gray-300 h-3 rounded mb-4">
            <div className="bg-green-500 h-3 rounded" style={{ width: `${getOverallProgress()}%` }} />
          </div>
          <p className="text-sm mb-6 text-gray-600">{getOverallProgress()}% complete</p>
        </>
      )}

      {chapters.map(chapter => (
        <div key={chapter.id} className="mb-4 border rounded">
          <div
            onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
            className="flex items-center justify-between cursor-pointer p-4 bg-gray-100"
          >
            <h2 className="font-semibold">
              {chapter.title} ({chapter.lectures?.length ?? 0} lectures)
            </h2>
            {expandedChapter === chapter.id ? <ChevronDown /> : <ChevronRight />}
          </div>

          {expandedChapter === chapter.id && (
            <div className="p-4 space-y-6 bg-white">
              {(chapter.lectures && chapter.lectures.length > 0) ? (
                chapter.lectures.map(lecture => (
                  <div key={lecture.id}>
                    <h3 className="text-lg font-medium">{lecture.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{lecture.description}</p>
                    <video
                      width="100%"
                      controls
                      onTimeUpdate={e =>
                        handleLectureProgress(lecture.id, e.currentTarget as HTMLVideoElement)
                      }
                      className="rounded border"
                    >
                      <source src={lecture.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No lectures in this chapter.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
