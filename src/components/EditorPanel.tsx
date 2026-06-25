import type { EditorReading, Lang } from "../types";
import { makeT } from "../i18n";

interface Props {
  lang: Lang;
  reading: EditorReading | null;
  loading: boolean;
  error: string | null;
  /** which relances the writer has marked as "shaping" the éloge */
  shaped: string[];
  onToggleShaped: (q: string) => void;
}

export default function EditorPanel({
  lang,
  reading,
  loading,
  error,
  shaped,
  onToggleShaped,
}: Props) {
  const t = makeT(lang);

  return (
    <aside className="flex h-full flex-col">
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-brass" aria-hidden>
          ✑
        </span>
        <h2 className="font-display text-lg font-semibold text-bottle">{t("editor_title")}</h2>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto pr-1">
        {loading && (
          <div className="space-y-3 py-2">
            <p className="font-body text-base italic text-ink-faint animate-pulseSoft">
              {t("pushing")}
            </p>
            <div className="space-y-2">
              <div className="h-3 w-3/4 rounded bg-paper-shade/70" />
              <div className="h-3 w-full rounded bg-paper-shade/50" />
              <div className="h-3 w-2/3 rounded bg-paper-shade/40" />
            </div>
          </div>
        )}

        {!loading && error && (
          <p className="rounded-lg border border-oxblood/30 bg-oxblood/5 p-3 font-body text-base text-oxblood">
            {error}
          </p>
        )}

        {!loading && !error && !reading && (
          <p className="font-body text-base leading-relaxed text-ink-faint">{t("editor_idle")}</p>
        )}

        {!loading && !error && reading && (
          <div className="space-y-6 animate-riseIn">
            {/* Diagnosis */}
            <section>
              <div className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brass-deep">
                {t("diagnosis")}
              </div>
              <p className="mt-1.5 font-body text-lg italic leading-snug text-bottle">
                {reading.diagnosis}
              </p>
            </section>

            {/* Relances */}
            {reading.relances.length > 0 && (
              <section>
                <div className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brass-deep">
                  {t("relances")}
                </div>
                <ul className="mt-2 space-y-2.5">
                  {reading.relances.map((q, i) => {
                    const on = shaped.includes(q);
                    return (
                      <li key={i}>
                        <button
                          onClick={() => onToggleShaped(q)}
                          title={t("relance_mark_help")}
                          className={`group flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition ${
                            on
                              ? "border-bottle/50 bg-bottle/5"
                              : "border-paper-shade bg-paper-light/60 hover:border-bottle/30"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border text-[0.6rem] transition ${
                              on
                                ? "border-bottle bg-bottle text-paper-light"
                                : "border-ink-faint/50 text-transparent group-hover:border-bottle/60"
                            }`}
                            aria-hidden
                          >
                            ✓
                          </span>
                          <span className="font-body text-base leading-snug text-ink">{q}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {/* Generic phrases */}
            <section>
              <div className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brass-deep">
                {t("generic_found")}
              </div>
              {reading.generic_phrases.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {reading.generic_phrases.map((p, i) => (
                    <li
                      key={i}
                      className="rounded-md bg-rose/15 px-2 py-1 font-body text-sm italic text-oxblood"
                    >
                      « {p} »
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 font-body text-base text-ink-faint">{t("generic_none")}</p>
              )}
            </section>

            <p className="hairline" />
            <p className="font-body text-sm leading-relaxed text-ink-faint">{t("honesty_note")}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
