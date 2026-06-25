import type { Lang, RefineSuggestion } from "../types";
import { makeT } from "../i18n";

interface Props {
  lang: Lang;
  yours: string;
  suggestion: RefineSuggestion;
  onAcceptAll: () => void;
  onAcceptParagraph: (paragraph: string) => void;
  onClose: () => void;
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function RefineModal({
  lang,
  yours,
  suggestion,
  onAcceptAll,
  onAcceptParagraph,
  onClose,
}: Props) {
  const t = makeT(lang);
  const yourParas = paragraphs(yours);
  const theirParas = paragraphs(suggestion.refined);

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-center bg-bottle-deep/65 px-3 py-6 backdrop-blur-sm animate-fadeIn sm:items-center sm:px-5">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-paper-light shadow-leaf-lg">
        <header className="flex items-start justify-between gap-4 border-b border-paper-shade px-6 py-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-bottle">{t("refine_title")}</h2>
            <p className="mt-1 max-w-xl font-body text-sm leading-relaxed text-ink-soft">
              {t("refine_sub")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full px-3 py-1 font-sans text-sm font-medium text-ink-faint transition hover:text-bottle"
          >
            {t("close")}
          </button>
        </header>

        {suggestion.note && (
          <p className="border-b border-paper-shade/60 bg-brass/5 px-6 py-3 font-body text-sm italic text-brass-deep">
            {suggestion.note}
          </p>
        )}

        <div className="thin-scroll grid flex-1 grid-cols-1 gap-px overflow-y-auto bg-paper-shade/50 sm:grid-cols-2">
          {/* Yours */}
          <div className="bg-paper-light p-6">
            <div className="mb-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              {t("refine_yours")}
            </div>
            <div className="space-y-3">
              {yourParas.map((p, i) => (
                <p key={i} className="font-body text-base leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Theirs */}
          <div className="bg-paper-light/70 p-6">
            <div className="mb-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brass-deep">
              {t("refine_theirs")}
            </div>
            <div className="space-y-3">
              {theirParas.map((p, i) => (
                <div key={i} className="group relative">
                  <p className="font-body text-base leading-relaxed text-bottle">{p}</p>
                  <button
                    onClick={() => onAcceptParagraph(p)}
                    className="mt-1 font-sans text-[0.72rem] font-semibold text-bottle-soft underline-offset-2 transition hover:text-brass-deep hover:underline"
                  >
                    + {t("refine_cherry")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-paper-shade px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2 font-sans text-sm font-medium text-ink-soft transition hover:text-bottle"
          >
            {t("refine_reject")}
          </button>
          <button
            onClick={onAcceptAll}
            className="rounded-full bg-bottle px-6 py-2 font-sans text-sm font-semibold text-paper-light shadow-seal transition hover:bg-bottle-mid active:translate-y-px"
          >
            {t("refine_accept")}
          </button>
        </footer>
      </div>
    </div>
  );
}
