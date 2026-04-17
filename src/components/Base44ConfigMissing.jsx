import React from 'react';

/**
 * Shown when VITE_BASE44_APP_ID / VITE_BASE44_APP_BASE_URL are missing at build time
 * (Vercel → Settings → Environment Variables).
 */
export default function Base44ConfigMissing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="max-w-lg rounded-xl border border-amber-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Application configuration</h1>
        <p className="mt-3 text-sm text-slate-600">
          This build is missing <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">VITE_BASE44_APP_ID</code>.
          Add it in Vercel → Settings → Environment Variables (or <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">.env.local</code>), then redeploy.
        </p>
        <p className="mt-4 text-left text-sm text-slate-700">
          Optional: <code className="font-mono text-xs text-violet-700">VITE_BASE44_APP_BASE_URL</code>
          <span className="text-slate-500"> — your app URL from Base44 (for example </span>
          <code className="text-xs">https://smartqueue.base44.app</code>
          <span className="text-slate-500">). If omitted, this project defaults to that host.</span>
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Vite inlines <code className="text-xs">VITE_*</code> values at build time. After changing variables on Vercel, trigger a new deployment.
        </p>
      </div>
    </div>
  );
}
