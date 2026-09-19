type LiveRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: {
    resultIndex: number;
    results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
  }) => void) | null;
  start: () => void;
  stop: () => void;
};

type RecCtor = new () => LiveRec;

const FALLBACK: Record<string, string> = {
  lokkatha: "This story is still told at night in our courtyard. The names live in the place, not in a book.",
  tyohar: "The morning after Holi we keep this rite. Song first, colour later.",
  khanpan: "The kitchen doesn’t use scales. A fist, the smell of mustard oil, and waiting.",
  hastashilp: "Handwork cannot be rushed. Needle, thread, cloth in the sun — that’s the ledger.",
  lokkala: "The song is repeated. There is no notation. The voice is enough for the rhythm.",
  parampara: "This is how the house keeps time. Not a tourist timetable — grandmother’s calendar.",
  sthaan: "The place is small on a map. It is large in people’s memory.",
  kahani: "It’s a neighbourhood story. Keep the names right. The rest we can hold.",
};

function speechEngine(): RecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function canLiveTranscribe() {
  return Boolean(speechEngine());
}

export function startLiveSpeech(onText: (text: string, final: boolean) => void, lang: "hi-IN" | "en-IN" = "hi-IN") {
  const Ctor = speechEngine();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (event) => {
    let text = "";
    let final = true;
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const row = event.results[i];
      if (!row) continue;
      text += row[0].transcript;
      if (!row.isFinal) final = false;
    }
    onText(text.trim(), final);
  };
  rec.start();
  return rec;
}

export function startLiveHindi(onText: (text: string, final: boolean) => void) {
  return startLiveSpeech(onText, "hi-IN");
}

export async function mockTranscribe(category: string) {
  await new Promise((r) => setTimeout(r, 1100));
  return FALLBACK[category] ?? FALLBACK.kahani;
}
