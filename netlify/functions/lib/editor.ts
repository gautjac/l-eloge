import Anthropic from "@anthropic-ai/sdk";

export type Lang = "fr" | "en";
export type SubjectType = "personne" | "objet" | "moment" | "lieu";

const MODEL = "claude-opus-4-8";

function client(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");
  return new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });
}

function langName(l: Lang): string {
  return l === "fr" ? "French (Québécois, idiomatic — never translated English)" : "English";
}

const TYPE_NOUN: Record<SubjectType, { fr: string; en: string }> = {
  personne: { fr: "une personne", en: "a person" },
  objet: { fr: "un objet", en: "an object" },
  moment: { fr: "un moment", en: "a moment" },
  lieu: { fr: "un lieu", en: "a place" },
};

/**
 * The single most important contract of this app. The editor is an editor for
 * SINCERITY and SPECIFICITY — not grammar. It pushes the writer toward true,
 * concrete detail, and it NEVER fabricates a detail or writes the éloge for them.
 */
const HONESTY = `ABSOLUTE RULES — never break these:
1. You NEVER invent, supply, guess, or imply a concrete detail the writer did not write. No imagined Tuesdays, no invented objects, no fictional scenes. Not even as an "example".
2. You NEVER write the éloge, or any sentence of it, for the writer. You do not draft, rephrase, or "show how it could read". Your job is to make THEM dig.
3. Your questions point at gaps in THEIR memory and demand THEY supply the specific. ("Quel objet tenait-il quand tu l'as compris ?" is good — it asks them. "Peut-être tenait-il une tasse ?" is forbidden — it invents.)
4. If the writer genuinely has no specific to give, that is acceptable and honest. Do not bully them into fabrication. A short, true éloge beats an inflated one. You may say, gently, that an honest "je ne me souviens pas du détail" is allowed.
5. You are NOT a grammar or spelling editor. Ignore typos. You hunt only the generic, the abstract, the cliché, the unearned superlative.`;

const VOICE = `You are the editor of L'Éloge — a quiet, exacting literary editor whose only craft is sincerity. You read tributes (éloges) the way a great editor reads a eulogy: you can feel instantly when praise is generic ("kind", "always there", "the best", "meant the world to me") versus when it is anchored in one real, witnessed moment. You are warm but you do not flatter. You believe a single concrete detail is worth a paragraph of adjectives. You write your diagnosis and questions in the writer's language, idiomatically.`;

const READING_TOOL: Anthropic.Tool = {
  name: "deliver_reading",
  description:
    "Deliver the editor's reading of the draft: where the praise goes generic, the sharp specific-demanding questions, and the verbatim cliché phrases to replace.",
  input_schema: {
    type: "object",
    required: ["diagnosis", "relances", "generic_phrases"],
    properties: {
      diagnosis: {
        type: "string",
        description:
          "ONE line (max ~22 words) naming WHERE the praise goes generic/abstract — the single most important place this éloge is telling instead of showing. In the writer's language. If the draft is already vivid and specific, say so honestly and name what makes it land.",
      },
      relances: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: 3,
        description:
          "2–3 sharp, SPECIFIC questions that demand the writer supply a concrete, true detail from their own memory. Each must be answerable only by THEM remembering. Never propose an answer. In the writer's language. e.g. 'Quel mardi précis l'a prouvé ?', 'Quel objet tenait-il quand tu l'as compris ?'. If the draft is already specific, make the questions push it one notch deeper, or offer at most one and acknowledge the rest is honest.",
      },
      generic_phrases: {
        type: "array",
        items: { type: "string" },
        description:
          "Verbatim phrases copied EXACTLY from the draft that are clichés or abstractions to replace with a concrete detail. Copy them word-for-word so the UI can highlight them. Empty array if the draft has none.",
      },
    },
  },
};

export interface EditorReading {
  diagnosis: string;
  relances: string[];
  generic_phrases: string[];
}

export async function readDraft(
  type: SubjectType,
  subject: string,
  draft: string,
  lang: Lang,
): Promise<EditorReading> {
  const noun = TYPE_NOUN[type][lang];
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: `${VOICE}\n\n${HONESTY}`,
    messages: [
      {
        role: "user",
        content: [
          `Read this éloge-in-progress and push the writer toward true, concrete specificity. Respond in ${langName(lang)}.`,
          `The éloge honours ${noun}: « ${subject} ».`,
          "",
          "THE DRAFT (verbatim — do not rewrite it):",
          '"""',
          draft,
          '"""',
          "",
          "Respond ONLY by calling deliver_reading. Remember: invent nothing, write none of the éloge for them, demand THEIR specifics.",
        ].join("\n"),
      },
    ],
    tools: [READING_TOOL],
    tool_choice: { type: "tool", name: "deliver_reading" },
  });

  const tool = res.content.find((b) => b.type === "tool_use");
  if (!tool || tool.type !== "tool_use") throw new Error("No reading returned");
  const i = tool.input as Record<string, unknown>;
  const relances = Array.isArray(i.relances) ? (i.relances as string[]).filter((s) => s.trim()) : [];
  const generic = Array.isArray(i.generic_phrases)
    ? (i.generic_phrases as string[]).filter((s) => s.trim())
    : [];
  return {
    diagnosis: String(i.diagnosis ?? "").trim(),
    relances: relances.slice(0, 3),
    generic_phrases: generic.slice(0, 8),
  };
}

const REFINE_TOOL: Anthropic.Tool = {
  name: "deliver_refinement",
  description:
    "Deliver a tightened version of the writer's OWN text — same facts, same voice, only abstraction and cliché trimmed.",
  input_schema: {
    type: "object",
    required: ["refined", "note"],
    properties: {
      refined: {
        type: "string",
        description:
          "The writer's own éloge, tightened: preserve EVERY concrete fact, name, and the writer's voice and word-choices; cut only filler, cliché, and abstraction; never add a new detail, image, or claim. Keep paragraph breaks (\\n\\n). This is a SUGGESTION the writer may reject.",
      },
      note: {
        type: "string",
        description:
          "One honest sentence in the writer's language naming what you cut (the abstraction/cliché) and confirming you added nothing.",
      },
    },
  },
};

export interface RefineSuggestion {
  refined: string;
  note: string;
}

export async function refineDraft(
  type: SubjectType,
  subject: string,
  draft: string,
  lang: Lang,
): Promise<RefineSuggestion> {
  const noun = TYPE_NOUN[type][lang];
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1600,
    system: `${VOICE}\n\n${HONESTY}\n\nFor this task you may TIGHTEN the writer's existing prose, but you still add NOTHING: no new fact, no new image, no invented detail. You only cut and lightly reorder the words already there. The result must read as the writer's own voice, trimmed.`,
    messages: [
      {
        role: "user",
        content: [
          `Propose a tightened version of this éloge honouring ${noun} « ${subject} ». Respond in ${langName(lang)}.`,
          "Preserve every concrete fact and the writer's voice. Cut only abstraction, cliché, and filler. Add no new detail.",
          "",
          "THE DRAFT:",
          '"""',
          draft,
          '"""',
          "",
          "Respond ONLY by calling deliver_refinement.",
        ].join("\n"),
      },
    ],
    tools: [REFINE_TOOL],
    tool_choice: { type: "tool", name: "deliver_refinement" },
  });

  const tool = res.content.find((b) => b.type === "tool_use");
  if (!tool || tool.type !== "tool_use") throw new Error("No refinement returned");
  const i = tool.input as Record<string, unknown>;
  return {
    refined: String(i.refined ?? "").trim(),
    note: String(i.note ?? "").trim(),
  };
}
