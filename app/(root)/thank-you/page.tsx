'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('ref');

  useEffect(() => {
    // Redirect if ref is missing
    if (!reference) {
      router.push('/');
    }
  }, [reference, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-semibold mb-2 text-gray-800">Payment Successful</h1>
        <p className="text-gray-600 mb-4">Thank you for your purchase! Your transaction was successful.</p>

        <div className="bg-gray-100 rounded p-4 mb-6 text-sm text-gray-700">
          <strong>Transaction Reference:</strong>
          <br />
          <span className="break-all text-gray-800">{reference}</span>
        </div>

        <Link
          href="/student/dashboard"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
