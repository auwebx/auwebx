// app/student/courses/[slug]/page.tsx

import StudentCourseDetail from "@/components/StudentCourseDetail";



export default function StudentCourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <StudentCourseDetail slug={params.slug} />;
}
