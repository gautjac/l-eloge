import type { Context } from "@netlify/functions";
import { readDraft, type Lang, type SubjectType } from "./lib/editor.ts";
import { ndjsonStream } from "./lib/stream.ts";

interface Body {
  type: SubjectType;
  subject: string;
  draft: string;
  lang: Lang;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const VALID_TYPES: SubjectType[] = ["personne", "objet", "moment", "lieu"];

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const lang: Lang = body.lang === "en" ? "en" : "fr";
  const type = VALID_TYPES.includes(body.type) ? body.type : "personne";
  const subject = (body.subject ?? "").trim();
  const draft = (body.draft ?? "").trim();

  if (draft.length < 20) {
    return json(
      { error: lang === "en" ? "Write a few more lines first." : "Écris quelques lignes de plus d'abord." },
      400,
    );
  }

  return ndjsonStream(
    () => readDraft(type, subject || (lang === "en" ? "the subject" : "le sujet"), draft, lang),
    lang === "en" ? "Unknown error" : "Erreur inconnue",
  );
};
