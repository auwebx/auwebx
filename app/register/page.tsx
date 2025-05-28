'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];

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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body = new FormData();
      body.append('fullname', formData.fullname);
      body.append('email', formData.email);
      body.append('password', formData.password);
      if (imageFile) body.append('profileImage', imageFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register.php`, {
        method: 'POST',
        body,
      });

      const text = await res.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch{
        console.error("❌ Failed to parse JSON. Raw response:", text);
        throw new Error("Invalid server response");
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
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {loading && <p className="text-blue-600 mb-2">Registering, please wait...</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          name="fullname"
          type="text"
          placeholder="Full Name"
          required
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          name="profileImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="w-full mb-2"
        />

        {preview && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Image Preview:</p>
            <Image src={preview} alt="Preview" className="w-32 h-32 object-cover rounded border" width={32} height={32} />
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
