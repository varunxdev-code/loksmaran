"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlanId } from "./types";

export type Provider = "google" | "apple" | "email";

export type Session = {
  provider: Provider;
  name: string;
  email: string;
  plan: PlanId;
  workspace: string;
  role: "holder" | "recorder" | "moderator" | "visitor";
};

type AuthState = {
  session: Session | null;
  ready: boolean;
  hydrate: () => void;
  login: (session: Omit<Session, "plan" | "workspace" | "role"> & Partial<Session>) => void;
  setPlan: (plan: PlanId) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      ready: false,
      hydrate: () => set({ ready: true }),
      login: (input) => {
        const session: Session = {
          provider: input.provider,
          name: input.name,
          email: input.email,
          plan: input.plan || "village",
          workspace: input.workspace || `${input.name.split(" ")[0]}'s archive`,
          role: input.role || "recorder",
        };
        set({ session, ready: true });
      },
      setPlan: (plan) => {
        const cur = get().session;
        if (!cur) return;
        set({ session: { ...cur, plan } });
      },
      logout: () => set({ session: null, ready: true }),
    }),
    { name: "loksmaran-session", partialize: (s) => ({ session: s.session }) },
  ),
);
