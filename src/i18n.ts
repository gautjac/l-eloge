import type { Lang, SubjectType } from "./types";

export const SUBJECT_TYPES: SubjectType[] = ["personne", "objet", "moment", "lieu"];

interface TypeMeta {
  fr: string;
  en: string;
  /** placeholder for the "name the subject" field */
  hintFr: string;
  hintEn: string;
  /** small glyph used as a ceremonial mark */
  glyph: string;
}

export const TYPE_META: Record<SubjectType, TypeMeta> = {
  personne: {
    fr: "une personne",
    en: "a person",
    hintFr: "Qui ? (un prénom, un lien…)",
    hintEn: "Who? (a name, a relation…)",
    glyph: "❦",
  },
  objet: {
    fr: "un objet",
    en: "an object",
    hintFr: "Quoi ? (la chose, précise)",
    hintEn: "What? (the thing, exact)",
    glyph: "⚇",
  },
  moment: {
    fr: "un moment",
    en: "a moment",
    hintFr: "Quel moment ? (situe-le)",
    hintEn: "Which moment? (place it)",
    glyph: "☉",
  },
  lieu: {
    fr: "un lieu",
    en: "a place",
    hintFr: "Où ? (le lieu, nommé)",
    hintEn: "Where? (the place, named)",
    glyph: "⌖",
  },
};

/** Rotating gentle weekly invitations — always optional, dismissible. */
export const INVITATIONS_FR: string[] = [
  "Cette semaine, fais l'éloge de quelqu'un que tu vois tous les jours et que tu ne remarques plus.",
  "Fais l'éloge d'un objet que tu utilises sans y penser, et qui ne t'a jamais lâché.",
  "Fais l'éloge d'un moment qui n'a duré qu'une minute, mais que tu n'as pas oublié.",
  "Fais l'éloge d'un lieu où tu te sens devenir toi-même.",
  "Fais l'éloge de quelqu'un qui t'a appris quelque chose sans jamais te l'enseigner.",
  "Fais l'éloge d'un geste ordinaire que quelqu'un fait pour toi, et que tu n'as jamais nommé.",
  "Fais l'éloge d'une chose réparée plutôt que remplacée.",
  "Fais l'éloge d'un son que tu reconnaîtrais entre mille.",
];

export const INVITATIONS_EN: string[] = [
  "This week, write the éloge of someone you see every day and no longer notice.",
  "Write the éloge of an object you use without thinking, that has never let you down.",
  "Write the éloge of a moment that lasted a minute and that you never forgot.",
  "Write the éloge of a place where you feel yourself become yourself.",
  "Write the éloge of someone who taught you something without ever teaching it.",
  "Write the éloge of an ordinary gesture someone makes for you, that you've never named.",
  "Write the éloge of a thing that was repaired rather than replaced.",
  "Write the éloge of a sound you'd recognize among a thousand.",
];

export function weeklyInvitation(lang: Lang): string {
  // deterministic per ISO-ish week so it rotates but is stable within a week
  const now = new Date();
  const week = Math.floor(now.getTime() / (1000 * 60 * 60 * 24 * 7));
  const list = lang === "fr" ? INVITATIONS_FR : INVITATIONS_EN;
  return list[week % list.length];
}

type Dict = Record<string, { fr: string; en: string }>;

const T: Dict = {
  appName: { fr: "L'Éloge", en: "L'Éloge" },
  tagline: {
    fr: "La gratitude comme un métier, pas une case à cocher.",
    en: "Gratitude as a craft, not a checkbox.",
  },
  nav_new: { fr: "Écrire", en: "Write" },
  nav_recueil: { fr: "Le Recueil", en: "The Recueil" },
  // home / chooser
  chooser_title: { fr: "À qui, à quoi rends-tu hommage ?", en: "What will you honour?" },
  chooser_sub: {
    fr: "Choisis un sujet, nomme-le. Tu écriras un seul éloge, vrai et précis.",
    en: "Choose a subject, name it. You'll write a single éloge, true and exact.",
  },
  name_label: { fr: "Nomme ton sujet", en: "Name your subject" },
  begin: { fr: "Commencer l'éloge", en: "Begin the éloge" },
  // composition
  compose_placeholder: {
    fr: "Écris ici. Pas de « il est gentil » — montre-moi le mardi qui l'a prouvé.",
    en: "Write here. Not “he is kind” — show me the Tuesday that proved it.",
  },
  push: { fr: "Pousse-moi", en: "Push me" },
  pushing: { fr: "L'éditeur lit…", en: "The editor reads…" },
  affiner: { fr: "Affiner", en: "Refine" },
  affining: { fr: "Resserrement…", en: "Tightening…" },
  save: { fr: "Déposer au Recueil", en: "Save to the Recueil" },
  saved: { fr: "Déposé.", en: "Saved." },
  words: { fr: "mots", en: "words" },
  back: { fr: "Retour", en: "Back" },
  // editor panel
  editor_title: { fr: "L'éditeur de sincérité", en: "The editor of sincerity" },
  editor_idle: {
    fr: "Écris quelques lignes, puis demande « Pousse-moi ». Je ne corrige pas ta grammaire — je traque le générique, l'abstrait, le cliché. Je n'inventerai jamais un détail à ta place.",
    en: "Write a few lines, then ask “Push me”. I don't fix grammar — I hunt the generic, the abstract, the cliché. I will never invent a detail for you.",
  },
  diagnosis: { fr: "Où ça devient flou", en: "Where it goes vague" },
  relances: { fr: "Réponds à ça — en écrivant", en: "Answer these — by writing" },
  relance_mark_help: {
    fr: "Marque une question : elle rejoint « ce qui a façonné » ton éloge.",
    en: "Mark a question: it joins “what shaped” your éloge.",
  },
  generic_found: { fr: "Phrases à rendre concrètes", en: "Phrases to make concrete" },
  generic_none: { fr: "Rien de générique repéré. Continue.", en: "Nothing generic spotted. Keep going." },
  honesty_note: {
    fr: "Si tu n'as pas de détail précis à donner, dis-le simplement. Mieux vaut un éloge court et vrai qu'un éloge enflé.",
    en: "If you have no specific to give, just say so. Better a short true éloge than an inflated one.",
  },
  // affiner panel
  refine_title: { fr: "Une version resserrée", en: "A tightened version" },
  refine_sub: {
    fr: "Une suggestion sur TES mots — abstraction et cliché coupés, tes faits et ta voix gardés. À toi de garder, refuser, ou prendre ligne par ligne.",
    en: "A suggestion on YOUR words — abstraction and cliché cut, your facts and voice kept. Yours to keep, reject, or take line by line.",
  },
  refine_yours: { fr: "Ta version", en: "Your version" },
  refine_theirs: { fr: "La proposition", en: "The proposal" },
  refine_accept: { fr: "Remplacer par celle-ci", en: "Replace with this" },
  refine_reject: { fr: "Garder la mienne", en: "Keep mine" },
  refine_cherry: { fr: "Prendre ce paragraphe", en: "Take this paragraph" },
  // recueil
  recueil_title: { fr: "Le Recueil", en: "The Recueil" },
  recueil_empty: {
    fr: "Aucun éloge déposé. Le premier t'attend.",
    en: "No éloge yet. The first one is waiting.",
  },
  recueil_empty_cta: { fr: "Écrire le premier", en: "Write the first" },
  shaped_by: { fr: "Ce qui l'a façonné", en: "What shaped it" },
  reread: { fr: "Relire", en: "Reread" },
  edit: { fr: "Reprendre", en: "Resume" },
  copy: { fr: "Copier", en: "Copy" },
  copied: { fr: "Copié", en: "Copied" },
  export_txt: { fr: "Exporter (.txt)", en: "Export (.txt)" },
  del: { fr: "Supprimer", en: "Delete" },
  del_confirm: { fr: "Supprimer cet éloge ? Ce geste est définitif.", en: "Delete this éloge? This is permanent." },
  close: { fr: "Fermer", en: "Close" },
  // invitation
  invitation_kicker: { fr: "Invitation de la semaine", en: "This week's invitation" },
  invitation_take: { fr: "Je prends", en: "I'll take it" },
  invitation_dismiss: { fr: "Plus tard", en: "Later" },
  // onboarding
  ob_skip: { fr: "Passer", en: "Skip" },
  ob_next: { fr: "Suivant", en: "Next" },
  ob_start: { fr: "Commencer", en: "Begin" },
  ob1_title: { fr: "La gratitude, mais sérieusement.", en: "Gratitude, but for real." },
  ob1_body: {
    fr: "La plupart des apps te laissent t'en tirer avec « merci pour le café ». Ici, tu écris un seul éloge — vrai, précis, digne d'être lu à voix haute.",
    en: "Most apps let you off with “thankful for coffee.” Here you write a single éloge — true, exact, worth reading aloud.",
  },
  ob2_title: { fr: "Un éditeur qui te pousse.", en: "An editor who pushes you." },
  ob2_body: {
    fr: "Ce n'est pas un correcteur de grammaire. C'est un éditeur de sincérité. Si tu écris « mon père est bon », il répond : « Montre-moi le mardi qui l'a prouvé. »",
    en: "Not a grammar checker. An editor of sincerity. Write “my father is kind” and it replies: “Show me the Tuesday that proved it.”",
  },
  ob3_title: { fr: "Rien n'est inventé pour toi.", en: "Nothing is invented for you." },
  ob3_body: {
    fr: "L'éditeur ne rédige jamais l'éloge à ta place et n'invente aucun détail. Il te pousse seulement vers TES vrais souvenirs. Tes mots restent les tiens.",
    en: "The editor never writes the éloge for you and invents no detail. It only pushes you toward YOUR real memories. Your words stay yours.",
  },
  // misc errors
  err_generic: { fr: "Quelque chose a accroché. Réessaie.", en: "Something snagged. Try again." },
  too_short: { fr: "Écris quelques lignes de plus d'abord.", en: "Write a few more lines first." },
};

export function makeT(lang: Lang) {
  return (key: keyof typeof T): string => T[key][lang];
}

export function typeLabel(t: SubjectType, lang: Lang): string {
  return TYPE_META[t][lang];
}
