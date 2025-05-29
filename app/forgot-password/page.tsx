'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';

export default function ForgotPassword() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      setMessage('');

      try {
        const formData = new FormData();
        formData.append('email', values.email);

        const res = await fetch('https://ns.auwebx.com/forgot-password.php', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        setMessage(data.message || (data.status === 'success' ? 'Email sent.' : 'Something went wrong.'));
        if (data.status === 'success') {
          resetForm();
        }
      } catch{
        setMessage('Network error. Please try again.');
      }

      setLoading(false);
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 bg-gray-100 border-b text-center text-xl font-bold">
        Reset Password
      </header>

      {/* Main form */}
      <main className="flex-1 flex justify-center items-center px-4">
        <form onSubmit={formik.handleSubmit} className="w-full max-w-md p-6 border rounded bg-white shadow">
          <h2 className="text-lg font-semibold mb-4 text-center">Forgot your password?</h2>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={`w-full p-2 border rounded mb-2 ${formik.touched.email && formik.errors.email ? 'border-red-500' : ''}`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-sm text-red-500 mb-2">{formik.errors.email}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          {message && (
            <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
          )}
        </form>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500 border-t">
        &copy; {new Date().getFullYear()} Your Company. All rights reserved.
      </footer>
    </div>
  );
}
