"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object({
    fullname: Yup.string()
      .min(3, 'Full name must be at least 3 characters')
      .required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(/[a-zA-Z]/, 'Password must contain letters')
      .matches(/\d/, 'Password must contain a number')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      fullname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setError('');
      setLoading(true);

      const body = new FormData();
      body.append('fullname', values.fullname);
      body.append('email', values.email);
      body.append('password', values.password);
      if (imageFile) body.append('profileImage', imageFile);

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register.php`, {
          method: 'POST',
          body,
        });

        const text = await res.text();
        let result;

        try {
          result = JSON.parse(text);
        } catch {
          console.error('❌ Failed to parse JSON. Raw response:', text);
          throw new Error('Invalid server response');
        }

        if (result.status === 'success') {
          router.push('/register/success');
        } else {
          setError(result.message || 'Something went wrong.');
        }
      } catch (err) {
        console.error(err);
        setError('Network error. Please try again later.');
      }

      setLoading(false);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WEBP images are allowed.');
      return;
    }

    if (file.size > maxSize) {
      setError('Image size must be under 2MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      {loading && <p className="text-blue-600 mb-4 text-center">Registering, please wait...</p>}

      <form onSubmit={formik.handleSubmit} encType="multipart/form-data" noValidate>
        <div className="mb-4">
          <input
            name="fullname"
            type="text"
            placeholder="Full Name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.fullname}
            className={`w-full p-2 border rounded ${formik.touched.fullname && formik.errors.fullname ? 'border-red-500' : ''}`}
          />
          {formik.touched.fullname && formik.errors.fullname && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.fullname}</p>
          )}
        </div>

        <div className="mb-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={`w-full p-2 border rounded ${formik.touched.email && formik.errors.email ? 'border-red-500' : ''}`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* Password Field with Toggle */}
        <div className="mb-4 relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className={`w-full p-2 border rounded pr-10 ${formik.touched.password && formik.errors.password ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {formik.touched.password && formik.errors.password && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field with Toggle */}
        <div className="mb-4 relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            className={`w-full p-2 border rounded pr-10 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{formik.errors.confirmPassword}</p>
          )}
        </div>

        <div className="mb-4">
          <input
            name="profileImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="w-full"
            required
          />
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Register
        </button>
      </form>
    </div>
  );
}
