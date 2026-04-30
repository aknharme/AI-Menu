import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InlineAlert from '../components/InlineAlert';
import { login } from '../services/authService';
import { clearAuthSession, storeAuthSession } from '../services/authStorage';
import { extractApiErrorMessage } from '../utils/apiError';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Email ve sifre zorunludur.');
      return;
    }

    if (email.trim().length > 180) {
      setError('Email en fazla 180 karakter olabilir.');
      return;
    }

    if (password.trim().length > 100) {
      setError('Sifre en fazla 100 karakter olabilir.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const session = await login({ email, password });
      if (session.user.role !== 'Admin') {
        clearAuthSession();
        setError('Bu panel yalnizca admin rolune aciktir.');
        return;
      }

      storeAuthSession(session);
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (requestError: any) {
      setError(extractApiErrorMessage(requestError, 'Giris yapilamadi.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fffdf8_0%,_#f5f5f4_100%)] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[32px] border border-stone-200 bg-white p-8 shadow-lg shadow-stone-950/5"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
          Admin Girisi
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-950">Panele giris yap</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Admin kullanicisi ile giris yaparak restoran yonetim ekranlarina ulas.
        </p>

        <label className="mt-8 block text-sm font-medium text-stone-700">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-stone-700">
          Sifre
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
          />
        </label>

        {error ? <div className="mt-4"><InlineAlert message={error} /></div> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
        </button>
      </form>
    </div>
  );
}
