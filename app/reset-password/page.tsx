'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('token', token);
    formData.append('password', password);

    const res = await fetch('https://ns.auwebx.com/reset-password.php', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.status === 'success') {
      setMessage('Password reset successful. Redirecting...');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setMessage(data.message || 'Reset failed.');
    }
  };

  return (
    <form onSubmit={handleReset} className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Reset Password</h1>
      <input
        type="password"
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="New password"
        className="w-full p-2 border rounded mb-4"
      />
      <button className="w-full bg-green-500 text-white p-2 rounded">Reset Password</button>
      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </form>
  );
}
