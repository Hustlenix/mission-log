"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Invalid email or password");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16 sm:py-24">
      <p className="font-mono text-xs text-accent tracking-widest mb-6">SIGN IN</p>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Access Mission Control</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block font-mono text-xs text-muted mb-2">
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-surface border border-border px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-accent transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-mono text-xs text-muted mb-2">
            PASSWORD
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-surface border border-border px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-accent transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="font-mono text-xs text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-background font-mono text-sm font-semibold px-6 py-3 hover:bg-accent-dim transition-colors disabled:opacity-50"
        >
          {loading ? "AUTHENTICATING..." : "SIGN IN"}
        </button>
      </form>

      <p className="font-mono text-xs text-muted mt-6 text-center">
        No account?{" "}
        <Link href="/signup" className="text-accent hover:text-accent-dim">
          Create one
        </Link>
      </p>
    </div>
  );
}
