"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>("");

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(4, "Minimum 4 characters").required("Required"),
  });

  const handleLogin = async (values: LoginFormValues) => {
    setServerError("");

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    try {
      const res = await fetch("https://ns.auwebx.com/login.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success") {
        const user = data.user;
        localStorage.setItem("user", JSON.stringify(user));

        if (user.role === "admin") router.push("/admin/dashboard");
        else if (user.role === "staff") router.push("/staff/dashboard");
        else router.push("/student/dashboard");
      } else {
        setServerError(data.message || "Login failed.");
      }
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow py-4 px-6 flex justify-between items-center">
        <Link href="/" className="text-xl flex font-bold text-blue-600">
          <Image
            src="/mylogo.jpg"
            alt={`${APP_NAME} logo`}
            height={48}
            width={48}
            priority={true}
            className="rounded-lg"
          />
          <span className="hidden lg:block font-bold text-2xl ml-3">
            {APP_NAME}
          </span>
        </Link>
        <nav>
          <Link
            href="/"
            className="text-sm text-gray-700 hover:text-blue-600 transition"
          >
            Courses
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
          <h2 className="text-xl font-semibold text-center text-blue-700">
            Login
          </h2>

          {serverError && (
            <p className="text-red-500 text-sm text-center">{serverError}</p>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {() => (
              <Form className="space-y-4">
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                >
                  Login
                </button>

                <div className="flex justify-between text-sm text-blue-600 mt-2">
                  <Link href="/forgot-password" className="hover:underline">
                    Forgot password?
                  </Link>
                  <Link href="/register" className="hover:underline">
                    Register
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} AUWEBx Academy. All rights reserved.
      </footer>
    </div>
  );
}
