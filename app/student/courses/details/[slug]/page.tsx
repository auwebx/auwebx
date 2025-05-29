// No 'use client'

import StudentCourseDetail from '@/components/student/StudentCourseDetail'; // Move logic here
import { Metadata } from 'next';



export const metadata: Metadata = {
  title: 'Course Detail',
};



export default function StudentCourseDetailPage({ params }: { params: { slug: string } }) {
  return <StudentCourseDetail slug={params.slug} />;
}
