import type { EditorReading, Lang, RefineSuggestion, SubjectType } from "./types";

/**
 * Both engine endpoints stream NDJSON: bare-newline heartbeats keep the
 * connection alive during the ~25–55s Opus call, then a final JSON line carries
 * { result } or { error }. We read to end-of-stream and parse the last non-empty
 * line. Falls back to plain JSON for non-streamed responses.
 */
async function postNDJSON<T>(path: string, payload: unknown, lang: Lang): Promise<T> {
  const en = lang === "en";
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const last = lines[lines.length - 1] ?? "";

  let parsed: { result?: T; error?: string } | null = null;
  try {
    parsed = last ? (JSON.parse(last) as { result?: T; error?: string }) : null;
  } catch {
    parsed = null;
  }

  const invalid = en ? "Invalid response from the server." : "Réponse invalide du serveur.";

  if (!res.ok) {
    const fallback = en ? `Error ${res.status}` : `Erreur ${res.status}`;
    const msg = parsed && parsed.error ? parsed.error : fallback;
    throw new Error(msg);
  }
  if (!parsed) throw new Error(invalid);
  if (parsed.error) throw new Error(parsed.error);
  if (parsed.result !== undefined) return parsed.result;
  throw new Error(invalid);
}

export interface ReadInput {
  type: SubjectType;
  subject: string;
  draft: string;
  lang: Lang;
}

export function readDraft(input: ReadInput): Promise<EditorReading> {
  return postNDJSON<EditorReading>("/api/read", input, input.lang);
}

export interface RefineInput {
  type: SubjectType;
  subject: string;
  draft: string;
  lang: Lang;
}

export function refineDraft(input: RefineInput): Promise<RefineSuggestion> {
  return postNDJSON<RefineSuggestion>("/api/refine", input, input.lang);
}
