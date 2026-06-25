import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Eloge, Lang } from "../types";
import { db, deleteEloge } from "../db";
import { makeT, TYPE_META, typeLabel } from "../i18n";

interface Props {
  lang: Lang;
  onWriteFirst: () => void;
  onResume: (e: Eloge) => void;
}

function fmtDate(ts: number, lang: Lang): string {
  return new Date(ts).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Recueil({ lang, onWriteFirst, onResume }: Props) {
  const t = makeT(lang);
  const eloges = useLiveQuery(() => db.eloges.orderBy("createdAt").reverse().toArray(), []) ?? [];
  const [reading, setReading] = useState<Eloge | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copy(e: Eloge) {
    const text = `${e.subject}\n\n${e.text}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(e.id);
      setTimeout(() => setCopiedId((c) => (c === e.id ? null : c)), 1800);
    } catch {
      /* ignore */
    }
  }

  function exportTxt(e: Eloge) {
    const header = `${typeLabel(e.type, lang)} — ${e.subject}`;
    const body = `${header}\n${"—".repeat(Math.min(40, header.length))}\n\n${e.text}\n\n${fmtDate(
      e.createdAt,
      lang,
    )}\n`;
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eloge-${e.subject.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase().slice(0, 40) || "eloge"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function remove(e: Eloge) {
    if (!window.confirm(t("del_confirm"))) return;
    await deleteEloge(e.id);
    setReading((r) => (r?.id === e.id ? null : r));
  }

  if (eloges.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="mb-5 text-5xl text-brass/70" aria-hidden>
          ❦
        </div>
        <p className="font-body text-xl italic leading-relaxed text-ink-soft">{t("recueil_empty")}</p>
        <button
          onClick={onWriteFirst}
          className="mt-7 rounded-full bg-bottle px-7 py-3 font-sans text-sm font-semibold text-paper-light shadow-seal transition hover:bg-bottle-mid"
        >
          {t("recueil_empty_cta")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-4xl font-semibold text-bottle">{t("recueil_title")}</h1>
      <p className="mt-1 font-sans text-sm text-ink-faint">
        {eloges.length} {eloges.length === 1 ? "éloge" : "éloges"}
      </p>

      <div className="mt-8 space-y-5">
        {eloges.map((e) => {
          const meta = TYPE_META[e.type];
          const preview = e.text.length > 180 ? e.text.slice(0, 180).trimEnd() + "…" : e.text;
          return (
            <article
              key={e.id}
              className="rounded-2xl border border-paper-shade bg-paper-light/70 p-6 shadow-leaf transition hover:shadow-leaf-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg text-brass" aria-hidden>
                    {meta.glyph}
                  </span>
                  <div>
                    <div className="font-sans text-[0.64rem] uppercase tracking-[0.16em] text-ink-faint">
                      {typeLabel(e.type, lang)} · {fmtDate(e.createdAt, lang)}
                    </div>
                    <h2 className="font-display text-2xl font-semibold leading-tight text-bottle">
                      {e.subject}
                    </h2>
                  </div>
                </div>
              </div>

              <p className="mt-3 font-body text-lg leading-relaxed text-ink-soft">{preview}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  onClick={() => setReading(e)}
                  className="font-sans text-sm font-semibold text-bottle underline-offset-2 transition hover:text-brass-deep hover:underline"
                >
                  {t("reread")}
                </button>
                <button
                  onClick={() => onResume(e)}
                  className="font-sans text-sm font-medium text-ink-soft transition hover:text-bottle"
                >
                  {t("edit")}
                </button>
                <button
                  onClick={() => copy(e)}
                  className="font-sans text-sm font-medium text-ink-soft transition hover:text-bottle"
                >
                  {copiedId === e.id ? `✓ ${t("copied")}` : t("copy")}
                </button>
                <button
                  onClick={() => exportTxt(e)}
                  className="font-sans text-sm font-medium text-ink-soft transition hover:text-bottle"
                >
                  {t("export_txt")}
                </button>
                <button
                  onClick={() => remove(e)}
                  className="ml-auto font-sans text-sm font-medium text-rose transition hover:text-oxblood"
                >
                  {t("del")}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {reading && (
        <ReadingView lang={lang} eloge={reading} onClose={() => setReading(null)} />
      )}
    </div>
  );
}

function ReadingView({ lang, eloge, onClose }: { lang: Lang; eloge: Eloge; onClose: () => void }) {
  const t = makeT(lang);
  const paras = eloge.text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-center overflow-y-auto bg-bottle-deep/70 px-3 py-8 backdrop-blur-sm animate-fadeIn sm:px-6">
      <div className="letterpress relative my-auto w-full max-w-2xl rounded-2xl px-7 py-10 shadow-leaf-lg sm:px-14 sm:py-16">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full px-3 py-1 font-sans text-sm font-medium text-ink-faint transition hover:text-bottle"
        >
          {t("close")}
        </button>

        <div className="text-center">
          <span className="text-2xl text-brass" aria-hidden>
            {TYPE_META[eloge.type].glyph}
          </span>
          <div className="mt-2 font-sans text-[0.66rem] uppercase tracking-[0.22em] text-ink-faint">
            {typeLabel(eloge.type, lang)}
          </div>
          <h1 className="mt-1 font-display text-4xl font-semibold leading-tight text-bottle sm:text-5xl">
            {eloge.subject}
          </h1>
          <div className="mx-auto mt-5 h-px w-16 bg-brass/50" />
        </div>

        <div className="mt-9 space-y-5">
          {paras.map((p, i) => (
            <p
              key={i}
              className={`font-body text-xl leading-loose text-ink ${i === 0 ? "dropcap" : ""}`}
            >
              {p}
            </p>
          ))}
        </div>

        {eloge.shapedBy.length > 0 && (
          <div className="mt-12 border-t border-paper-shade pt-6">
            <div className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-brass-deep">
              {t("shaped_by")}
            </div>
            <ul className="mt-3 space-y-1.5">
              {eloge.shapedBy.map((q, i) => (
                <li key={i} className="font-body text-base italic leading-snug text-ink-faint">
                  — {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 text-center font-sans text-xs text-ink-faint">
          {fmtDate(eloge.createdAt, lang)}
        </div>
      </div>
    </div>
  );
}
