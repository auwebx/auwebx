'use client';

import Image from "next/image";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white animate-fade-in">
      {/* Spinner ring with logo */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-blue-600 border-b-blue-300 border-l-transparent border-r-transparent shadow-md"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/mylogo.jpg"
            alt="Logo"
            width={64}
            height={64}
            className="rounded-full shadow"
          />
        </div>
      </div>

    
    </div>
  );
}
