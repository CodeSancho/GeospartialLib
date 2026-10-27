import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MineImg from '../assets/Mine.jpg';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('The passwords do not match.');
    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/users/register`, {
        username: form.username.trim(), email: form.email.trim(), password: form.password,
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create the account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-10" style={{ backgroundImage: `url(${MineImg})` }}>
      <div className="absolute inset-0 bg-black/65" />
      <section className="relative z-10 w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Mining data management</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-2 text-sm text-gray-600">New accounts receive standard user access.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-gray-700">Username
            <input name="username" value={form.username} onChange={update} required maxLength={80} autoComplete="username" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Email
            <input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Password
            <input name="password" type="password" value={form.password} onChange={update} required minLength={8} maxLength={128} autoComplete="new-password" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Confirm password
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required minLength={8} maxLength={128} autoComplete="new-password" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={saving} className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">
            {saving ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-600">Already registered? <Link to="/login" className="font-semibold text-teal-700 hover:underline">Sign in</Link></p>
      </section>
    </main>
  );
}
