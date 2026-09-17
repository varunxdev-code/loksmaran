import { Go } from "@/components/go-link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-[#f6f1e8]">
      <p className="kicker">Legal</p>
      <h1 className="mt-4 font-display text-5xl font-light">Privacy</h1>
      <p className="mt-6 text-white/60 leading-relaxed">
        Loksmaran is a prototype. Stories you publish in this demo stay on your device. Voice notes are recorded only when you press the mic. Consent and takedown are part of the product — a holder can ask a story to come down.
      </p>
      <Go href="/" className="btn btn-solid mt-10">Back home</Go>
    </main>
  );
}
