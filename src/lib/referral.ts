const REF_KEY = "ecolearn_ref";
const REF_TS_KEY = "ecolearn_ref_ts";
const REF_TTL_DAYS = 30;

export function captureRefFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (ref && ref.trim().length > 0 && ref.length <= 40) {
      localStorage.setItem(REF_KEY, ref.trim());
      localStorage.setItem(REF_TS_KEY, Date.now().toString());
    }
  } catch {
    /* ignore */
  }
}

export function getReferrer(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const ts = parseInt(localStorage.getItem(REF_TS_KEY) || "0", 10);
    if (!ts) return null;
    const ageDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    if (ageDays > REF_TTL_DAYS) return null;
    return localStorage.getItem(REF_KEY);
  } catch {
    return null;
  }
}

export function buildRefLink(name: string, path = "/play") {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const safe = encodeURIComponent(name.trim().slice(0, 40));
  return `${base}${path}?ref=${safe}`;
}