"use client";

import { useRef, useState } from "react";
import { Mic } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import { Waveform } from "@/components/waveform";
import { goTo } from "@/components/go-link";
import { uploadAudio, uploadImage } from "@/lib/storage";
import { useLok } from "@/lib/store";
import { CATEGORIES, COMMUNITIES } from "@/lib/taxonomy";
import { mockTranscribe, startLiveHindi } from "@/lib/transcribe";
import type { CategoryId } from "@/lib/types";

type Recog = { stop: () => void } | null;

export default function CreatePage() {
  const addPost = useLok((s) => s.addPost);
  const toast = useLok((s) => s.toast);
  const offline = useLok((s) => s.offline);

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
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const live = useRef<Recog>(null);
  const media = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

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
      /* mic optional — transcript still works */
    }
    const rec = startLiveHindi((text) => {
      if (text) {
        setBody(text);
        setFromVoice(true);
      }
    });
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
    const photo = image || COMMUNITIES.find((c) => c.slug === place)?.image;
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
    });
    setDone(true);
    toast("Published to the live feed");
    setTimeout(() => goTo(`/feed?fresh=${id}`), 700);
  }

  if (done) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-4xl font-light">It’s on the feed.</p>
        <p className="mt-3 text-mute">Taking you there…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-4xl font-light tracking-tight">Share a village story</h1>
      <p className="mt-2 text-mute">Record your voice. Pin it to a real village. It lands on the live feed.</p>

      <div className="mt-8 space-y-6">
        <label className="block">
          <span className="text-sm text-mute">Title</span>
          <input className="field mt-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="One line that holds the village" />
        </label>

        <div className="card p-5">
          <p className="font-medium">Voice is the point</p>
          <p className="mt-1 text-sm text-mute">Hold the mic. Hindi or English. We keep the audio and draft the words.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {busy === "rec" ? (
              <button type="button" className="btn btn-ink" onClick={stopVoice}>Stop recording</button>
            ) : (
              <button type="button" className="btn btn-ink" onClick={() => void startVoice()}>
                <Mic size={16} /> Start speaking
              </button>
            )}
          </div>
          <div className="mt-4"><Waveform active={busy === "rec"} /></div>
          {busy === "rec" ? <p className="mt-2 text-sm text-mute">Listening…</p> : null}
          {audio ? <AudioPlayer src={audio} label="Your recording" /> : null}
        </div>

        <label className="block">
          <span className="text-sm text-mute">Story</span>
          <textarea ref={bodyRef} className="field mt-2 min-h-36" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Speak, or write — you can edit after." />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-mute">Village</span>
            <select className="field mt-2" value={place} onChange={(e) => setPlace(e.target.value)}>
              {COMMUNITIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}, {c.state}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-mute">Category</span>
            <select className="field mt-2" value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm text-mute">Photo</span>
          <input type="file" accept="image/*" className="mt-2 block text-sm" onChange={(e) => void onFile(e.target.files?.[0])} />
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="mt-3 max-h-56 rounded-2xl object-cover" />
          ) : null}
        </label>

        {error ? <p className="text-sm text-blood">{error}</p> : null}

        <button type="button" className="btn btn-ink min-w-[220px]" onClick={() => void publish()} disabled={busy === "pub"}>
          {busy === "pub" ? "Publishing…" : "Publish to the live feed"}
        </button>
      </div>
    </div>
  );
}
