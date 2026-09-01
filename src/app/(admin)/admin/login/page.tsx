'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLogin() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const password = new FormData(e.currentTarget).get('password')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (json.ok) {
        router.replace('/admin')
        router.refresh()
      } else {
        setError(json.error ?? 'Could not sign in.')
      }
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-[100svh] items-center">
      <div className="u-grid w-full">
        <div className="col-span-12 sm:col-span-6 sm:col-start-4 lg:col-span-4 lg:col-start-5">
          <p className="u-label text-accent">Gala Retreat</p>
          <h1 className="u-display mt-6 text-[clamp(2rem,4vw,2.75rem)] text-ink">
            Dashboard
          </h1>

          <form onSubmit={onSubmit} className="mt-12">
            <label className="u-label mb-3 block text-ink/60" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              className="w-full border-0 border-b border-ink/20 bg-transparent px-0 pb-3 pt-2 text-ink transition-colors duration-300 focus:border-accent focus:outline-none"
            />

            {error && (
              <p role="alert" className="mt-4 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="u-label mt-10 w-full border border-accent px-8 py-4 text-accent transition-colors duration-400 hover:bg-accent hover:text-on-accent disabled:opacity-45"
            >
              {busy ? 'Checking…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
