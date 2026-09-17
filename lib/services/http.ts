export const UA = "Loksmaran/1.0 (SIH cultural archive; https://github.com/varunxdev-code/loksmaran)";

export async function getJson<T>(url: string, init?: RequestInit, revalidate = 600): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 18000);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": UA,
        ...(init?.headers ?? {}),
      },
      next: { revalidate },
    });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

export async function postText(url: string, body: string, revalidate = 300): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 22000);
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": UA,
      },
      body,
      next: { revalidate },
    });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.text();
  } finally {
    clearTimeout(t);
  }
}

const mem = new Map<string, { at: number; value: unknown }>();

export function cached<T>(key: string, ttlMs: number, run: () => Promise<T>): Promise<T> {
  const hit = mem.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return Promise.resolve(hit.value as T);
  return run().then((value) => {
    mem.set(key, { at: Date.now(), value });
    return value;
  });
}
