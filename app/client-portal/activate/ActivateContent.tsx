'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function ClientPortalActivate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    } else {
      setError('No activation token provided');
      setVerifying(false);
    }
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`/api/client-portal/auth/activate?token=${token}`);
      const data = await response.json();

      if (data.success) {
        setClientInfo(data.client);
      } else {
        setError(data.message || 'Invalid activation token');
      }
    } catch (err) {
      console.error('Token verification error:', err);
      setError('Failed to verify token');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/client-portal/auth/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (data.success) {
        router.push('/client-portal/login?activated=true');
      } else {
        setError(data.message || 'Activation failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Activation error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-5">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-12">
          <div className="text-center py-16 text-gray-600 text-lg">
            Verifying activation token...
          </div>
        </div>
      </div>
    );
  }

  if (error && !clientInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-5">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-12">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Activation Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/client-portal/login')}
              className="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-5">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-12">
        <div className="text-center mb-10">
          <Image 
            src="/EYP Logo_New.png" 
            alt="EYP" 
            width={300}
            height={80}
            className="h-auto w-auto max-w-full mx-auto mb-5"
            priority
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activate Your Portal</h1>
          {clientInfo && (
            <p className="text-lg text-gray-600">Welcome, {clientInfo.client_name}!</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-5 text-center border border-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-accent">
            <p className="m-0 text-gray-700 text-sm leading-relaxed">
              Create a password to access your client portal. You'll use this to view contracts, make payments, and track your event details.
            </p>
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="mb-2 text-gray-800 font-semibold text-sm">
              Create Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="px-4 py-3.5 border-2 border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="confirmPassword" className="mb-2 text-gray-800 font-semibold text-sm">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
              placeholder="Re-enter your password"
              className="px-4 py-3.5 border-2 border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          <button 
            type="submit" 
            className="w-full px-4 py-4 bg-gradient-to-r from-accent to-red-600 text-white font-bold text-lg rounded-xl cursor-pointer transition-all mt-2 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? 'Activating...' : 'Activate Portal'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a 
            href="/client-portal/login" 
            className="text-gray-500 text-sm no-underline transition-colors hover:text-accent"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
