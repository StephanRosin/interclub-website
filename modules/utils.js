export async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    const preview = text.slice(0, 200).replace(/\s+/g, " ").trim();
    console.error(`JSON parse failed for ${url}`, {
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      preview,
    });
    throw err;
  }
}

export function pad2(value) {
  return String(value ?? "").padStart(2, "0");
}

export function resultsArray(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

export function normalizeMatchList(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

export function rankingOrder(value) {
  const s = String(value || "").trim().toUpperCase();
  if (!s) return [9, 999];
  if (/^N\d+$/.test(s)) return [0, Number(s.slice(1))];
  if (/^R\d+$/.test(s)) return [1, Number(s.slice(1))];
  return [8, 999];
}

export function normalizeLeagueLabel(value) {
  return String(value || "")
    .trim()
    .replace(/^(\d)\.\s*Liga$/i, "$1L");
}

export function buildResultsLabelFromTeam(team) {
  const gender = String(team?.gender || "").trim();
  const category = String(team?.category || "").trim();
  const liga = normalizeLeagueLabel(team?.liga);
  const prefix = category && category !== "Aktiv" ? `${category} ` : "";
  return `${prefix}${liga} ${gender}`.trim();
}
