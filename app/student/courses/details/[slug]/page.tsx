// No 'use client'

import StudentCourseDetail from '@/components/student/StudentCourseDetail'; // Move logic here
import { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

export const metadata: Metadata = {
  title: 'Course Detail',
};

export default function Page({ params }: PageProps) {
  return <StudentCourseDetail slug={params.slug} />;
}
