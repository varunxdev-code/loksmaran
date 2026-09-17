"use client";

import { create } from "zustand";

export type Provider = "google" | "apple" | "email";

export type Session = {
  provider: Provider;
  name: string;
  email: string;
};

type AuthState = {
  session: Session | null;
  ready: boolean;
  hydrate: () => void;
  login: (session: Session) => void;
  logout: () => void;
};

const KEY = "loksmaran-session";

export const useAuth = create<AuthState>()((set) => ({
  session: null,
  ready: false,
  hydrate: () => {
    try {
      const raw = localStorage.getItem(KEY);
      set({ session: raw ? (JSON.parse(raw) as Session) : null, ready: true });
    } catch {
      set({ session: null, ready: true });
    }
  },
  login: (session) => {
    localStorage.setItem(KEY, JSON.stringify(session));
    set({ session, ready: true });
  },
  logout: () => {
    localStorage.removeItem(KEY);
    set({ session: null, ready: true });
  },
}));
