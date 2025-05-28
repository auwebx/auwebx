"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import { EllipsisVertical, ShoppingCart, UserIcon } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCart } from "@/app/context/CartContext";
import { useEffect, useState } from "react";

const Menu = () => {
  const { cart } = useCart();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (cart.length > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cart.length]);

  return (
    <div className="flex justify-end gap-3">
      {/* Desktop Nav */}
      <nav className="hidden md:flex w-full max-w-xs gap-1 items-center">
        <ModeToggle />
        <Button asChild variant="ghost">
          <Link href="/cart">
            <div className="relative inline-flex cursor-pointer select-none">
              <ShoppingCart
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
                size={28}
              />
              {cart.length > 0 && (
                <span
                  className={`absolute -top-2 -right-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full shadow-md transition-all duration-300 ${
                    pulse ? "animate-pulse" : ""
                  }`}
                >
                  {cart.length}
                </span>
              )}
            </div>
          </Link>
        </Button>
        <Button asChild>
          <Link href="/sign-in">
            <UserIcon className="mr-1" />
            Sign In
          </Link>
        </Button>
      </nav>

      {/* Mobile Nav */}
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="align-middle">
              <EllipsisVertical />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start gap-2 p-4">
            <SheetTitle className="mb-2">Menu</SheetTitle>

            <ModeToggle />

            <Button asChild variant="ghost">
              <Link href="/cart">
                <div className="inline-flex items-center cursor-pointer group select-none">
                  <ShoppingCart
                    className="mr-2 text-gray-700 group-hover:text-blue-600 transition-colors duration-300"
                    size={24}
                  />
                  <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                    Cart
                  </span>
                  {cart.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full shadow-md group-hover:bg-blue-700 transition-all duration-300">
                      {cart.length}
                    </span>
                  )}
                </div>
              </Link>
            </Button>

            <Button asChild variant="ghost">
              <Link href="/sign-in">
                <UserIcon className="mr-1" />
                Sign In
              </Link>
            </Button>

            <SheetDescription />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
