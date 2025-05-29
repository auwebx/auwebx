"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

interface FormValues {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object({
    fullname: Yup.string()
      .min(3, "Full name must be at least 3 characters")
      .required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "At least one uppercase letter")
      .matches(/[a-z]/, "At least one lowercase letter")
      .matches(/[0-9]/, "At least one digit")
      .matches(/[@$!%*?&#]/, "At least one special character")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setError("");
      if (!imageFile) return setError("Profile image is required.");

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 2 * 1024 * 1024;

      if (!validTypes.includes(imageFile.type))
        return setError("Only JPEG, PNG, and WEBP images are allowed.");
      if (imageFile.size > maxSize)
        return setError("Image size must be under 2MB.");

      setLoading(true);
      const body = new FormData();
      body.append("fullname", values.fullname);
      body.append("email", values.email);
      body.append("password", values.password);
      body.append("profileImage", imageFile);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/register.php`,
          { method: "POST", body }
        );
        const text = await res.text();
        const result = JSON.parse(text);

        if (result.status === "success") {
          router.push("/register/success");
        } else {
          setError(result.message || "Something went wrong.");
        }
      } catch {
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;
    if (!validTypes.includes(file.type))
      return setError("Only JPEG, PNG, and WEBP images are allowed.");
    if (file.size > maxSize) return setError("Image size must be under 2MB.");

    setError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
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
      <main className="flex-grow flex justify-center items-center px-4 bg-gray-100">
        <div className="max-w-md w-full bg-white p-6 border rounded shadow">
          <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
          {loading && (
            <p className="text-blue-600 mb-4 text-center">
              Registering, please wait...
            </p>
          )}

          <form
            onSubmit={formik.handleSubmit}
            encType="multipart/form-data"
            noValidate
          >
            {/* Full Name */}
            <div className="mb-4">
              <input
                name="fullname"
                type="text"
                placeholder="Full Name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.fullname}
                className={`w-full p-2 border rounded ${
                  formik.touched.fullname && formik.errors.fullname
                    ? "border-red-500"
                    : ""
                }`}
              />
              {formik.touched.fullname && formik.errors.fullname && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.fullname}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full p-2 border rounded ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : ""
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className={`w-full p-2 border rounded ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-4 relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                className={`w-full p-2 border rounded ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "border-red-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <input
                name="profileImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="w-full"
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="mb-4 flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                <Image
                  src={preview}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Register
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t text-center py-3 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} AUWEBx. All rights reserved.
      </footer>
    </div>
  );
}
