"use client";

import { useRef, useState } from "react";
import { Mic } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Waveform } from "@/components/waveform";
import { goTo } from "@/components/go-link";
import { uploadAudio, uploadImage } from "@/lib/storage";
import { useLok } from "@/lib/store";
import { CATEGORIES, COMMUNITIES } from "@/lib/taxonomy";
import { mockTranscribe, startLiveSpeech } from "@/lib/transcribe";
import { useLocale, useT } from "@/lib/i18n";
import type { CategoryId, Consent, Locale } from "@/lib/types";

type Recog = { stop: () => void } | null;

export default function CreatePage() {
  const addPost = useLok((s) => s.addPost);
  const toast = useLok((s) => s.toast);
  const offline = useLok((s) => s.offline);
  const t = useT();
  const locale = useLocale((s) => s.locale);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CategoryId>("parampara");
  const [place, setPlace] = useState("raghurajpur");
  const [image, setImage] = useState<string>();
  const [audio, setAudio] = useState<string>();
  const [busy, setBusy] = useState<"up" | "rec" | "tr" | "pub" | null>(null);
  const [error, setError] = useState("");
  const [fromVoice, setFromVoice] = useState(false);
  const [done, setDone] = useState(false);
  const [consent, setConsent] = useState<Consent>("village");
  const [speech, setSpeech] = useState<Locale>(locale);
  const [holderName, setHolderName] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const live = useRef<Recog>(null);
  const media = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const village = COMMUNITIES.find((c) => c.slug === place);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy("up");
    setError("");
    try {
      setImage(await uploadImage(file));
    } catch {
      setError("Couldn’t upload that photo. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function startVoice() {
    setError("");
    setBusy("rec");
    chunks.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size > 0) setAudio(await uploadAudio(blob));
      };
      rec.start();
      media.current = rec;
    } catch {
      /* mic optional */
    }
    const rec = startLiveSpeech((text) => {
      if (text) {
        setBody(text);
        setFromVoice(true);
      }
    }, speech === "hi" ? "hi-IN" : "en-IN");
    live.current = rec;
    if (!rec && !media.current) {
      setBusy("tr");
      try {
        const text = await mockTranscribe(category);
        setBody(text);
        setFromVoice(true);
        setAudio("/seed/m01.wav");
      } catch {
        setError("Couldn’t transcribe. Type it instead.");
      } finally {
        setBusy(null);
      }
    }
  }

  function stopVoice() {
    live.current?.stop();
    live.current = null;
    if (media.current && media.current.state !== "inactive") media.current.stop();
    media.current = null;
    setBusy(null);
    setFromVoice(true);
  }

  async function publish() {
    if (!title.trim()) {
      setError("Add a title.");
      return;
    }
    if (!body.trim()) {
      setError("Write or speak the story first.");
      return;
    }
    const photo = image || village?.image;
    if (!photo) {
      setError("Add a photo.");
      return;
    }
    if (offline) {
      setError("You’re offline. Publish when you’re back.");
      return;
    }
    setBusy("pub");
    const id = addPost({
      title: title.trim(),
      body: body.trim(),
      imageUrl: photo,
      audioUrl: audio,
      category,
      communitySlug: place,
      fromVoice: fromVoice || Boolean(audio),
      language: speech,
      consent,
      holderName: holderName.trim() || undefined,
      titleHi: speech === "hi" ? title.trim() : undefined,
      bodyHi: speech === "hi" ? body.trim() : undefined,
    });
    setDone(true);
    toast("Published to the live feed");
    setTimeout(() => goTo(`/feed?fresh=${id}`), 700);
  }

  if (done) {
    return (
      <div className="feed-card px-6 py-16 text-center">
        <p className="kicker">Published</p>
        <p className="mt-3 font-display text-4xl font-light">It’s on the feed.</p>
        <p className="mt-3 text-mute">Taking you there…</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <p className="kicker">{t("share")}</p>
        <h1 className="mt-2 font-display text-3xl font-light tracking-tight sm:text-4xl">{t("tellStory")}</h1>
        <p className="mt-2 text-mute">{t("tellLead")}</p>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm text-mute">Title</span>
            <input className="field mt-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="One line that holds the village" />
          </label>

          <div className="feed-card p-5">
            <p className="font-medium">Voice is the point</p>
            <p className="mt-1 text-sm text-mute">Hold the mic. Hindi or English. We keep the audio and draft the words.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {busy === "rec" ? (
                <button type="button" className="btn btn-ink" onClick={stopVoice}>Stop recording</button>
              ) : (
                <button type="button" className="btn btn-ink" onClick={() => void startVoice()}>
                  <Mic size={16} /> {speech === "hi" ? t("speakHi") : t("speakEn")}
                </button>
              )}
            </div>
            <div className="mt-4"><Waveform active={busy === "rec"} /></div>
            {busy === "rec" ? <p className="mt-2 text-sm text-mute">Listening…</p> : null}
            {audio ? <AudioPlayer src={audio} label="Your recording" /> : null}
          </div>

          <div>
            <p className="text-sm text-mute">{t("consent")}</p>
            <div className="chip-row mt-2">
              {(["public", "village", "family", "private"] as Consent[]).map((c) => (
                <button key={c} type="button" onClick={() => setConsent(c)} className={`chip ${consent === c ? "chip-on" : ""}`}>
                  {c === "village" ? t("villageOnly") : t(c)}
                </button>
              ))}
            </div>
            <div className="chip-row mt-2">
              <button type="button" className={`chip ${speech === "hi" ? "chip-on" : ""}`} onClick={() => setSpeech("hi")}>{t("speakHi")}</button>
              <button type="button" className={`chip ${speech === "en" ? "chip-on" : ""}`} onClick={() => setSpeech("en")}>{t("speakEn")}</button>
            </div>
          </div>

          <label className="block">
            <span className="text-sm text-mute">{t("holder")}</span>
            <input className="field mt-2" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="Name of the knowledge holder" />
          </label>

          <label className="block">
            <span className="text-sm text-mute">Story</span>
            <textarea ref={bodyRef} className="field mt-2 min-h-36" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Speak, or write — you can edit after." />
          </label>

          <div>
            <p className="text-sm text-mute">Village</p>
            <div className="chip-row mt-2">
              {COMMUNITIES.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setPlace(c.slug)}
                  className={`village-chip ${place === c.slug ? "village-chip-on" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt="" />
                  <span>{locale === "hi" ? c.nameHi : c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-mute">Category</p>
            <div className="chip-row mt-2">
              {CATEGORIES.map((c) => (
                <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={`chip ${category === c.id ? "chip-on" : ""}`}>
                  {locale === "hi" ? c.labelHi : c.label}
                </button>
              ))}
            </div>
          </div>

          <label className="dropzone">
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="max-h-56 w-full rounded-2xl object-cover" />
            ) : (
              <span>
                <strong>Add a photo</strong>
                <em>Tap to upload from your phone or computer</em>
              </span>
            )}
          </label>

          {error ? <p className="text-sm text-blood">{error}</p> : null}

          <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 lg:static lg:bottom-auto">
            <button type="button" className="btn btn-ink w-full sm:w-auto sm:min-w-[240px]" onClick={() => void publish()} disabled={busy === "pub"}>
              {busy === "pub" ? "Publishing…" : t("publish")}
            </button>
          </div>
        </div>
      </div>

      <aside className="hidden lg:block">
        <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Preview</p>
        <article className="feed-card mt-3 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image || village?.image} alt="" className="aspect-[16/10] w-full object-cover" />
          <div className="p-5">
            <p className="text-[12px] text-mute">r/{village?.name} · You</p>
            <h2 className="mt-2 font-display text-2xl font-light">{title || "Your title lands here"}</h2>
            <p className="mt-2 line-clamp-4 text-sm text-mute">{body || "Speak or write the story. This is how it will read on the feed."}</p>
          </div>
        </article>
      </aside>
    </div>
  );
}
