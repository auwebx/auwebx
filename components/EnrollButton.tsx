'use client';

import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';

type EnrollButtonProps = {
  courseId: number;
};

export default function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  // const router = useRouter();

  const { cart, cartLoading, addToCart } = useCart();

  // Debug logs
  console.log('EnrollButton cart:', cart);
  const isInCart = cart.some((item) => Number(item.course_id) === Number(courseId));
  console.log(`Is course ${courseId} in cart?`, isInCart);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user || !user.id) {
      setIsLoggedIn(false);
      return;
    }

    setIsLoggedIn(true);

    fetch('https://ns.auwebx.com/api/enrollments/check_enrollment.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id, course_id: courseId }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setIsEnrolled(data.enrolled);
        }
      });
  }, [courseId]);

/*   const handleGoToCourse = () => {
    router.push(`/courses/${courseId}`);
  }; */

  if (isLoggedIn === null) return null;

  return (
    <div>
      {!isLoggedIn ? (
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition inline-block"
        >
          Sign in to Add to Cart
        </Link>
      ) : isEnrolled ? (
        <Link
           href="/student/courses"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition cursor-pointer"
        >
          Go to Dashboard
        </Link>
      ) : cartLoading ? (
        <button
          disabled
          className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-md transition"
        >
          Loading...
        </button>
      ) : isInCart ? (
        <button
          disabled
          className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-md transition"
        >
          In Cart
        </button>
      ) : (
        <button
          onClick={() => addToCart(courseId)}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md transition"
        >
          Add to Cart
        </button>
        
      )}
    </div>
  );
}
