"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/logo";
import { useAuth, type Provider } from "@/lib/auth";

function AuthInner({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<Provider | "email" | null>(null);
  const next = params.get("next") || "/feed";

  function enter(provider: Provider) {
    setBusy(provider);
    login({
      provider,
      name: "Ananya Sharma",
      email: email || `ananya@${provider === "email" ? "loksmaran.in" : provider}.com`,
    });
    setTimeout(() => router.push(next.startsWith("/") ? next : "/feed"), 250);
  }

  return (
    <div className="grid min-h-svh bg-night text-[#f6f1e8] md:grid-cols-2">
      <div className="relative hidden overflow-hidden md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/villages/mandawa.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <a href="/"><Logo size="lg" light /></a>
          <div>
            <p className="font-display text-6xl font-light leading-[0.9]">People.<br />Places.<br />Heritage.</p>
            <p className="mt-5 max-w-sm text-sm text-white/70">Sign in once. Same feed, same stories.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <a href="/" className="md:hidden"><Logo size="lg" light /></a>
          <h1 className="mt-8 font-display text-4xl font-light">
            {mode === "login" ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {mode === "login" ? "Use the same provider you signed up with." : "Free for residents and students."}
          </p>

          <div className="mt-8 grid gap-3">
            <button type="button" className="btn btn-solid w-full" onClick={() => enter("google")} disabled={!!busy}>
              Continue with Google
            </button>
            <button type="button" className="btn btn-ghost w-full" onClick={() => enter("apple")} disabled={!!busy}>
              Continue with Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-white/30">
            <span className="h-px flex-1 bg-white/10" />
            or email
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <label className="block text-sm text-white/60">
            Work email
            <input
              className="field mt-2 border-white/15 bg-white/5 text-[#f6f1e8]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.in"
              type="email"
            />
          </label>
          <button type="button" className="btn btn-solid mt-3 h-12 w-full" onClick={() => enter("email")} disabled={!!busy}>
            {busy ? "Signing in…" : mode === "login" ? "Log in with email" : "Create account with email"}
          </button>

          <p className="mt-6 text-sm text-white/45">
            {mode === "login" ? (
              <>No account? <a href="/signup" className="text-white">Sign up</a></>
            ) : (
              <>Already here? <a href="/login" className="text-white">Log in</a></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  return (
    <Suspense fallback={<div className="grid min-h-svh place-items-center bg-night text-white/50">Loading…</div>}>
      <AuthInner mode={mode} />
    </Suspense>
  );
}
