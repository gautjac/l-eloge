export type Lang = "fr" | "en";

export type SubjectType = "personne" | "objet" | "moment" | "lieu";

/** A relance the editor offered, and whether the writer chose to keep it as a thread that shaped the éloge. */
export interface Relance {
  question: string;
  /** the diagnosis line that surfaced this push (kept for the Recueil's "what shaped it") */
  fromDiagnosis?: string;
}

/** What the sincerity editor returns (forced-tool JSON). */
export interface EditorReading {
  diagnosis: string;
  relances: string[];
  generic_phrases: string[];
}

/** What the Affiner action returns: a tightened version of the writer's OWN text. */
export interface RefineSuggestion {
  refined: string;
  /** short, honest note on what was cut (abstraction/cliché) and what was preserved (their facts/voice) */
  note: string;
}

/** A finished éloge saved to the Recueil. */
export interface Eloge {
  id: string;
  type: SubjectType;
  subject: string;
  text: string;
  /** the relances that shaped this éloge (the questions the writer answered) */
  shapedBy: string[];
  createdAt: number;
  updatedAt: number;
}
