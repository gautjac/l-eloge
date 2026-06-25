import { useEffect, useRef, useState } from "react";
import type { EditorReading, Lang, RefineSuggestion, SubjectType } from "../types";
import { makeT, TYPE_META, typeLabel } from "../i18n";
import { readDraft, refineDraft } from "../api";
import EditorPanel from "./EditorPanel";
import RefineModal from "./RefineModal";

export interface DraftSeed {
  type: SubjectType;
  subject: string;
  /** when resuming an existing éloge */
  id?: string;
  text?: string;
  shapedBy?: string[];
}

interface Props {
  lang: Lang;
  seed: DraftSeed;
  onSave: (data: {
    id?: string;
    type: SubjectType;
    subject: string;
    text: string;
    shapedBy: string[];
  }) => Promise<void>;
  onBack: () => void;
}

function wordCount(s: string): number {
  const m = s.trim().match(/\S+/g);
  return m ? m.length : 0;
}

export default function Composer({ lang, seed, onSave, onBack }: Props) {
  const t = makeT(lang);
  const [text, setText] = useState(seed.text ?? "");
  const [reading, setReading] = useState<EditorReading | null>(null);
  const [shaped, setShaped] = useState<string[]>(seed.shapedBy ?? []);
  const [loadingRead, setLoadingRead] = useState(false);
  const [loadingRefine, setLoadingRefine] = useState(false);
  const [readErr, setReadErr] = useState<string | null>(null);
  const [refineErr, setRefineErr] = useState<string | null>(null);
  const [refinement, setRefinement] = useState<RefineSuggestion | null>(null);
  const [saved, setSaved] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  const wc = wordCount(text);
  const longEnough = text.trim().length >= 20;
  const meta = TYPE_META[seed.type];

  async function handlePush() {
    if (!longEnough || loadingRead) return;
    setLoadingRead(true);
    setReadErr(null);
    try {
      const r = await readDraft({ type: seed.type, subject: seed.subject, draft: text, lang });
      setReading(r);
    } catch (e) {
      setReadErr(e instanceof Error ? e.message : t("err_generic"));
    } finally {
      setLoadingRead(false);
    }
  }

  async function handleRefine() {
    if (!longEnough || loadingRefine) return;
    setLoadingRefine(true);
    setRefineErr(null);
    try {
      const r = await refineDraft({ type: seed.type, subject: seed.subject, draft: text, lang });
      setRefinement(r);
    } catch (e) {
      setRefineErr(e instanceof Error ? e.message : t("err_generic"));
    } finally {
      setLoadingRefine(false);
    }
  }

  function toggleShaped(q: string) {
    setShaped((cur) => (cur.includes(q) ? cur.filter((x) => x !== q) : [...cur, q]));
  }

  async function handleSave() {
    if (!text.trim()) return;
    await onSave({
      id: seed.id,
      type: seed.type,
      subject: seed.subject,
      text: text.trim(),
      shapedBy: shaped,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  function acceptAll() {
    if (refinement) setText(refinement.refined);
    setRefinement(null);
    taRef.current?.focus();
  }

  function acceptParagraph(p: string) {
    // append the chosen paragraph if it isn't already present
    setText((cur) => {
      if (cur.includes(p)) return cur;
      const sep = cur.trim() ? "\n\n" : "";
      return cur + sep + p;
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="font-sans text-sm font-medium text-ink-faint transition hover:text-bottle"
        >
          ← {t("back")}
        </button>
        <div className="flex items-baseline gap-2 text-right">
          <span className="text-xl text-brass" aria-hidden>
            {meta.glyph}
          </span>
          <div>
            <div className="font-sans text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
              {typeLabel(seed.type, lang)}
            </div>
            <div className="font-display text-xl font-semibold leading-tight text-bottle">
              {seed.subject}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_22rem]">
        {/* Composition surface */}
        <div className="flex flex-col">
          <div className="relative rounded-2xl border border-paper-shade bg-paper-light/80 p-6 shadow-leaf sm:p-8">
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("compose_placeholder")}
              spellCheck
              className="compose min-h-[46vh] w-full text-xl text-ink placeholder:italic placeholder:text-ink-faint/60 sm:text-[1.35rem]"
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handlePush}
              disabled={!longEnough || loadingRead}
              className="rounded-full bg-bottle px-6 py-2.5 font-sans text-sm font-semibold text-paper-light shadow-seal transition enabled:hover:bg-bottle-mid disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-px"
            >
              {loadingRead ? t("pushing") : t("push")}
            </button>
            <button
              onClick={handleRefine}
              disabled={!longEnough || loadingRefine}
              className="rounded-full border border-bottle/30 px-5 py-2.5 font-sans text-sm font-semibold text-bottle transition enabled:hover:border-bottle enabled:hover:bg-bottle/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loadingRefine ? t("affining") : t("affiner")}
            </button>

            <div className="ml-auto flex items-center gap-4">
              <span className="font-sans text-xs tabular-nums text-ink-faint">
                {wc} {t("words")}
              </span>
              <button
                onClick={handleSave}
                disabled={!text.trim()}
                className="rounded-full bg-brass px-5 py-2.5 font-sans text-sm font-semibold text-bottle-deep shadow-seal transition enabled:hover:bg-brass-light disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-px"
              >
                {saved ? `✓ ${t("saved")}` : t("save")}
              </button>
            </div>
          </div>
          {refineErr && (
            <p className="mt-3 font-body text-sm text-oxblood">{refineErr}</p>
          )}
        </div>

        {/* Editor sidebar */}
        <div className="rounded-2xl border border-paper-shade bg-paper-light/50 p-5 lg:sticky lg:top-6 lg:max-h-[80vh]">
          <EditorPanel
            lang={lang}
            reading={reading}
            loading={loadingRead}
            error={readErr}
            shaped={shaped}
            onToggleShaped={toggleShaped}
          />
        </div>
      </div>

      {refinement && (
        <RefineModal
          lang={lang}
          yours={text}
          suggestion={refinement}
          onAcceptAll={acceptAll}
          onAcceptParagraph={acceptParagraph}
          onClose={() => setRefinement(null)}
        />
      )}
    </div>
  );
}
