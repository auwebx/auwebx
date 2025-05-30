"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronRight, RotateCw } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const API_URL = "https://ns.auwebx.com/api";

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
  const [userId, setUserId] = useState<string>("");

  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);

  const localStorageKey = `watchedLectures:${slug}:${userId}`;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user?.id) return;

    setUserId(user.id);

    async function fetchData() {
      try {
        const res = await fetch(
          `${API_URL}/user/fetch_course_by_slug.php?slug=${slug}`
        );
        const data = await res.json();

        if (data.status === "success") {
          setCourse(data.course);
          setChapters(data.chapters);

          // Load from localStorage first
          const cached = localStorage.getItem(
            `watchedLectures:${slug}:${user.id}`
          );
          if (cached) {
            setWatchedLectures(JSON.parse(cached));
          } else {
            // Fetch from server if no cache
            const watchedRes = await fetch(
              `${API_URL}/user/get_watched_lectures.php?user_id=${user.id}&course_slug=${slug}`
            );
            const watchedData = await watchedRes.json();

            if (watchedData.status === "success") {
              const ids = watchedData.watched_lecture_ids.map(String);
              setWatchedLectures(ids);
              localStorage.setItem(localStorageKey, JSON.stringify(ids));
            }
          }
        }
      } catch (error) {
        console.error("Error loading course:", error);
      }
    }

    fetchData();
  }, [slug, userId]);

  const handleLectureProgress = async (
    lectureId: string,
    videoRef: HTMLVideoElement
  ) => {
    if (watchedLectures.includes(String(lectureId))) return;

    const percentPlayed = (videoRef.currentTime / videoRef.duration) * 100;

    if (percentPlayed > 90) {
      const newWatched = [...watchedLectures, String(lectureId)];
      setWatchedLectures(newWatched);
      localStorage.setItem(localStorageKey, JSON.stringify(newWatched));

      await fetch(`${API_URL}/user/mark_lecture_watched.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, lecture_id: lectureId }),
      });
    }
  };

  const getOverallProgress = () => {
    const totalLectures = chapters.reduce(
      (sum, c) => sum + (c.lectures?.length || 0),
      0
    );
    return totalLectures === 0
      ? 0
      : Math.round((watchedLectures.length / totalLectures) * 100);
  };

  /*   const resetWatchProgress = () => {
    setWatchedLectures([]);
    localStorage.removeItem(localStorageKey);
    // Optional: Call backend to reset if needed
  }; */

  const resetLectureProgress = async (lectureId: string) => {
    const newWatched = watchedLectures.filter((id) => id !== String(lectureId));
    setWatchedLectures(newWatched);
    localStorage.setItem(localStorageKey, JSON.stringify(newWatched));

    try {
      await fetch(`${API_URL}/user/reset_lecture.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, lecture_id: lectureId }),
      });
    } catch (error) {
      console.error("Failed to reset lecture progress:", error);
    }
  };

  return (
    <div className="max-w-full mx-auto p-4">
      {course && (
        <>
          <h1 className="text-2xl font-bold mb-2">{course.title}</h1>

          <div className="w-full bg-gray-300 h-3 rounded mb-2">
            <div
              className="bg-green-500 h-3 rounded"
              style={{ width: `${getOverallProgress()}%` }}
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600">
              {getOverallProgress()}% complete
            </p>
            {/*  {watchedLectures.length > 0 && (
              <button
                onClick={resetWatchProgress}
                className="flex items-center gap-1 text-sm text-red-500 hover:underline"
              >
                <RotateCw size={16} /> Reset Watch Progress
              </button>
            )} */}
          </div>
        </>
      )}

      {chapters.map((chapter) => (
        <div key={chapter.id} className="mb-4 border rounded">
          <div
            onClick={() =>
              setExpandedChapter(
                expandedChapter === chapter.id ? null : chapter.id
              )
            }
            className="flex items-center justify-between cursor-pointer p-4 bg-gray-100"
          >
            <h2 className="font-semibold">
              {chapter.title} ({chapter.lectures?.length ?? 0} lectures)
            </h2>
            {expandedChapter === chapter.id ? (
              <ChevronDown />
            ) : (
              <ChevronRight />
            )}
          </div>

          {expandedChapter === chapter.id && (
            <div className="p-4 space-y-6 bg-white">
              {chapter.lectures && chapter.lectures.length > 0 ? (
                chapter.lectures.map((lecture) => {
                  const isWatched = watchedLectures.includes(
                    String(lecture.id)
                  );

                  return (
                    <div
                      key={`lecture-${lecture.id}`}
                      className={`p-4 border rounded transition ${
                        isWatched
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">{lecture.title}</h3>
                        {isWatched ? (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 text-sm font-semibold">
                              Watched ✓
                            </span>
                            <button
                              onClick={() => resetLectureProgress(lecture.id)}
                              className="text-xs flex text-red-500 hover:underline cursor-pointer"
                            >
                              <RotateCw size={16} /> Reset
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {lecture.description}
                      </p>

                      <div className="relative">
                        {loadingVideoId === lecture.id && <LoadingSpinner />}
                        <video
                          width="100%"
                          controls
                          controlsList="nodownload"
                          onContextMenu={(e) => e.preventDefault()}
                          onLoadStart={() => setLoadingVideoId(lecture.id)}
                          onCanPlay={() => setLoadingVideoId(null)}
                          onTimeUpdate={(e) =>
                            handleLectureProgress(
                              lecture.id,
                              e.currentTarget as HTMLVideoElement
                            )
                          }
                          className="rounded border"
                        >
                          <source src={lecture.video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No lectures in this chapter.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
