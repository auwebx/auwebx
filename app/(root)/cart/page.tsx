"use client";

import { useCart, CartItem } from "@/app/context/CartContext";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const API_URL = "https://ns.auwebx.com/api";

export default function CartPage() {
  const { cart, cartLoading, removeFromCart } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const router = useRouter();

  // total price now sums number price directly
 const totalPrice = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);


  const handleRemove = async (id: number) => {
    setRemovingId(id);
    try {
      await removeFromCart(id);
      // removeFromCart already calls toast on success/error, so no duplicate toast here
    } catch {
      toast.error("Failed to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setCheckingOut(true);
    try {
      // Example: redirect to a checkout page
      router.push("/checkout");
    } catch{
      toast.error("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (cartLoading) {
   return (
         <div className="p-4">
           <LoadingSpinner />
         </div>
       );
  }


if (cart.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" strokeWidth={1.5} />
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
        Your cart is empty
      </h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Looks like you have not added any courses yet. Start exploring and find something that interests you!
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors duration-300 shadow-md"
      >
        Browse Courses
      </Link>
    </div>
  );
}


  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <ul className="space-y-6">
        {cart.map(
          ({ id, title = "", thumbnail = "", price = 0 }: CartItem) => (
    <li
      key={id}
      className="flex items-center gap-6 p-4 border rounded-md shadow-sm hover:shadow-md transition"
    >
              <Image
                src={`${API_URL}/courses/${thumbnail}`}
                alt={title}
                loading="lazy"
                width={64}
                height={64}
                className="rounded"
              />

              <div className="flex-grow">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-gray-700 font-mono">₦{Number(price).toFixed(2)}</p>
              </div>

              <button
                onClick={() => handleRemove(id)}
                disabled={removingId === id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {removingId === id ? "Removing..." : "Remove"}
              </button>
            </li>
          )
        )}
      </ul>

      <div className="mt-8 flex justify-between items-center">
        <div>
          <span className="text-xl font-semibold mr-2">Total:</span>
          <span className="text-2xl font-bold">₦{totalPrice.toFixed(2)}</span>

        </div>

        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {checkingOut ? "Processing..." : "Checkout"}
        </button>
      </div>
    </div>
  );
}
