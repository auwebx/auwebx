import Header from "@/components/shared/header";
import "@/assets/styles/globals.css";

import { ThemeProvider } from "next-themes";
import Footer from "@/components/footer";
import { CartProvider } from "../context/CartContext";
import { Toaster } from "react-hot-toast";






export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <div>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen flex-col">
            <Header />

            <main className="flex-1 wrapper">
              {children}
              <Toaster position="top-right" />
            </main>

            <Footer />
          </div>
        </ThemeProvider>

      
      </div>
    </CartProvider>
  );
}
