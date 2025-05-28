'use client';
import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);

    const res = await fetch('https://ns.auwebx.com/forgot-password.php', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setMessage(data.message || (data.status === 'success' ? 'Email sent.' : 'Error'));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Forgot Password</h1>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full p-2 border rounded mb-4"
      />
      <button className="w-full bg-blue-500 text-white p-2 rounded">Send Reset Link</button>
      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </form>
  );
}
