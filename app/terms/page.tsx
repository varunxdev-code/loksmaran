import { Go } from "@/components/go-link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-[#f6f1e8]">
      <p className="kicker">Legal</p>
      <h1 className="mt-4 font-display text-5xl font-light">Terms</h1>
      <p className="mt-6 text-white/60 leading-relaxed">
        This is a hackathon prototype. Don’t post anyone’s voice or face without consent. Village names here are real; the seed stories are illustrative. When this ships, accounts, storage and moderation go on a proper backend.
      </p>
      <Go href="/" className="btn btn-solid mt-10">Back home</Go>
    </main>
  );
}
