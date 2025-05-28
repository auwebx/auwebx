'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const res = await fetch('https://ns.auwebx.com/login.php', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.status === 'success') {
      const user = data.user;
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'staff') router.push('/staff/dashboard');
      else router.push('/student/dashboard');
    } else {
      setError(data.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
  <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-96 space-y-4">
    <h2 className="text-xl font-semibold text-center">Login</h2>

    {error && <p className="text-red-500 text-sm">{error}</p>}

    <input
      type="email"
      className="w-full p-2 border rounded"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <input
      type="password"
      className="w-full p-2 border rounded"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded">
      Login
    </button>

    {/* Navigation links */}
    <div className="flex justify-between text-sm text-blue-600 mt-2">
      <Link href="/forgot-password" className="hover:underline">
        Forgot password?
      </Link>
      <Link href="/register" className="hover:underline">
        Register
      </Link>
    </div>
  </form>
</div>
  );
}
