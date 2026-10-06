"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Could not create account");
        return;
      }

      const returnTo =
        new URLSearchParams(window.location.search).get("returnTo") ||
        "/account";
      router.push(
        returnTo.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : "/account",
      );
      router.refresh();
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16 sm:py-24">
      <p className="font-mono text-xs text-accent tracking-widest mb-6">
        CREATE ACCOUNT
      </p>
      <h1 className="text-2xl font-bold tracking-tight mb-8">
        Keep what matters to you.
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block font-mono text-xs text-muted mb-2"
          >
            NAME
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-surface border border-border px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-accent transition-colors"
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block font-mono text-xs text-muted mb-2"
          >
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
          <label
            htmlFor="password"
            className="block font-mono text-xs text-muted mb-2"
          >
            PASSWORD
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-surface border border-border px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-accent transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="font-mono text-xs text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-background font-mono text-sm font-semibold px-6 py-3 hover:bg-accent-dim transition-colors disabled:opacity-50"
        >
          {loading ? "CREATING..." : "CREATE ACCOUNT"}
        </button>
      </form>

      <p className="font-mono text-xs text-muted mt-6 text-center">
        Already have an account?{" "}
        <Link href="/signin" className="text-accent hover:text-accent-dim">
          Sign in
        </Link>
      </p>
    </div>
  );
}
