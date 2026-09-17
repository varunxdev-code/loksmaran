/**
 * Generates fake prototype media: SVG stills, WAV voice-beds, animated SVG clips.
 * Not real elders. Judges can hear/see something without a database.
 */
const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "..", "public", "seed");
fs.mkdirSync(out, { recursive: true });

const ITEMS = [
  { id: "m01", title: "Pattachitra", type: "craft", hue: "#c45c3e", clip: false },
  { id: "m02", title: "Gotipua", type: "song", hue: "#e8c36a", clip: true },
  { id: "m03", title: "Mango pickle", type: "recipe", hue: "#d9842f", clip: false },
  { id: "m04", title: "Pond ghost", type: "story", hue: "#2a6a72", clip: false },
  { id: "m05", title: "Palm leaf", type: "craft", hue: "#8b5a2b", clip: false },
  { id: "m06", title: "Rath Yatra", type: "festival", hue: "#c45c3e", clip: true },
  { id: "m07", title: "Conch white", type: "craft", hue: "#e8dcc8", clip: false },
  { id: "m08", title: "Lullaby", type: "song", hue: "#7a4a6a", clip: false },
  { id: "m09", title: "Banyan boat", type: "story", hue: "#3d6230", clip: false },
  { id: "m10", title: "Pakhala", type: "recipe", hue: "#cbb089", clip: false },
  { id: "m11", title: "Danda Nacha", type: "festival", hue: "#e07a3d", clip: true },
  { id: "m12", title: "After cyclone", type: "story", hue: "#4a5c68", clip: false },
  { id: "m13", title: "Hingula red", type: "craft", hue: "#9b1d2e", clip: false },
  { id: "m14", title: "Mustard oil", type: "recipe", hue: "#c4a035", clip: false },
  { id: "m15", title: "First lesson", type: "story", hue: "#35562a", clip: false },
  { id: "m16", title: "Marriage song", type: "song", hue: "#b85a6a", clip: true },
  { id: "m17", title: "Cow-dung floor", type: "festival", hue: "#6b5a3a", clip: false },
  { id: "m18", title: "East lane", type: "story", hue: "#d4a574", clip: false },
];

function stillSvg(item, i) {
  const y = 40 + (i % 5) * 8;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a1512"/>
      <stop offset="1" stop-color="#110e0c"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <circle cx="${120 + i * 17}" cy="${180 + (i % 3) * 20}" r="160" fill="${item.hue}" opacity="0.28"/>
  <circle cx="620" cy="380" r="200" fill="#e8c36a" opacity="0.08"/>
  <rect x="90" y="70" width="620" height="360" fill="none" stroke="${item.hue}" stroke-width="3" opacity="0.45"/>
  <text x="120" y="${y + 200}" fill="#f3ead8" font-family="Georgia, serif" font-size="42">${escapeXml(item.title)}</text>
  <text x="120" y="${y + 248}" fill="${item.hue}" font-family="monospace" font-size="16" letter-spacing="4">FAKE SEED · ${item.type.toUpperCase()} · RAGHURAJPUR</text>
  <text x="120" y="400" fill="#9a8f7f" font-family="monospace" font-size="12">${item.id} · not a real elder recording</text>
</svg>`;
}

function clipSvg(item) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#110e0c"/>
  <circle cx="400" cy="250" r="90" fill="${item.hue}" opacity="0.9">
    <animate attributeName="r" values="70;120;70" dur="2.8s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.45;0.95;0.45" dur="2.8s" repeatCount="indefinite"/>
  </circle>
  <rect x="0" y="0" width="800" height="18" fill="${item.hue}" opacity="0.35">
    <animate attributeName="y" values="0;482;0" dur="4s" repeatCount="indefinite"/>
  </rect>
  <text x="400" y="430" text-anchor="middle" fill="#f3ead8" font-family="Georgia, serif" font-size="28">${escapeXml(item.title)}</text>
  <text x="400" y="458" text-anchor="middle" fill="#e8c36a" font-family="monospace" font-size="12">DEMO CLIP · GENERATED</text>
</svg>`;
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function wavFor(item, index) {
  const sampleRate = 22050;
  const seconds = 3.2;
  const n = Math.floor(sampleRate * seconds);
  const freq = 180 + index * 17;
  const freq2 = freq * 1.5;
  const samples = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, t * 8) * Math.min(1, (seconds - t) * 4);
    const chatter = Math.sin(2 * Math.PI * (6 + (index % 4)) * t) * 0.15;
    const voice =
      Math.sin(2 * Math.PI * freq * t) * 0.28 +
      Math.sin(2 * Math.PI * freq2 * t) * 0.12 +
      chatter;
    const grain = (Math.random() * 2 - 1) * 0.04;
    let v = (voice + grain) * env * 0.7;
    v = Math.max(-1, Math.min(1, v));
    samples.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + samples.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(samples.length, 40);
  return Buffer.concat([header, samples]);
}

for (const [i, item] of ITEMS.entries()) {
  fs.writeFileSync(path.join(out, `${item.id}.svg`), stillSvg(item, i));
  fs.writeFileSync(path.join(out, `${item.id}.wav`), wavFor(item, i));
  if (item.clip) {
    fs.writeFileSync(path.join(out, `${item.id}-clip.svg`), clipSvg(item));
  }
}

fs.writeFileSync(
  path.join(out, "index.json"),
  JSON.stringify(
    ITEMS.map((item) => ({
      id: item.id,
      photo: `/seed/${item.id}.svg`,
      audio: `/seed/${item.id}.wav`,
      video: item.clip ? `/seed/${item.id}-clip.svg` : null,
    })),
    null,
    2,
  ),
);

console.log("Wrote fake seed media to", out);
