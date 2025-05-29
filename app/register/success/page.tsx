'use client';

import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center border border-green-100">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-green-700 mb-2">Registration Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your account has been created. You may now log in and enjoy the app!
        </p>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
