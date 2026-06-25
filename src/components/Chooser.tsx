import { useState } from "react";
import type { Lang, SubjectType } from "../types";
import { makeT, SUBJECT_TYPES, TYPE_META, weeklyInvitation } from "../i18n";

interface Props {
  lang: Lang;
  onBegin: (type: SubjectType, subject: string) => void;
  dismissedInvitation: boolean;
  onTakeInvitation: () => void;
  onDismissInvitation: () => void;
}

export default function Chooser({
  lang,
  onBegin,
  dismissedInvitation,
  onTakeInvitation,
  onDismissInvitation,
}: Props) {
  const t = makeT(lang);
  const [type, setType] = useState<SubjectType | null>(null);
  const [name, setName] = useState("");

  const ready = type !== null && name.trim().length > 0;
  const invitation = weeklyInvitation(lang);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
      {!dismissedInvitation && (
        <div className="mb-10 animate-riseIn rounded-xl border border-brass/30 bg-paper-light/70 p-5 shadow-leaf">
          <div className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass-deep">
            {t("invitation_kicker")}
          </div>
          <p className="mt-2 font-body text-lg italic leading-relaxed text-ink-soft">
            {invitation}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={onTakeInvitation}
              className="rounded-full bg-bottle px-4 py-1.5 font-sans text-sm font-semibold text-paper-light transition hover:bg-bottle-mid"
            >
              {t("invitation_take")}
            </button>
            <button
              onClick={onDismissInvitation}
              className="rounded-full px-4 py-1.5 font-sans text-sm font-medium text-ink-faint transition hover:text-bottle"
            >
              {t("invitation_dismiss")}
            </button>
          </div>
        </div>
      )}

      <h1 className="font-display text-4xl font-semibold leading-tight text-bottle sm:text-5xl">
        {t("chooser_title")}
      </h1>
      <p className="mt-3 font-body text-lg leading-relaxed text-ink-soft">{t("chooser_sub")}</p>

      <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-4">
        {SUBJECT_TYPES.map((st) => {
          const meta = TYPE_META[st];
          const active = type === st;
          return (
            <button
              key={st}
              onClick={() => setType(st)}
              className={`group flex flex-col items-start gap-2 rounded-xl border p-5 text-left transition ${
                active
                  ? "border-bottle bg-bottle text-paper-light shadow-leaf"
                  : "border-paper-shade bg-paper-light/60 text-ink hover:border-bottle/40 hover:bg-paper-light"
              }`}
              aria-pressed={active}
            >
              <span className={`text-2xl ${active ? "text-brass-pale" : "text-brass"}`} aria-hidden>
                {meta.glyph}
              </span>
              <span className="font-display text-xl font-medium capitalize">
                {meta[lang]}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`mt-7 transition-all duration-300 ${
          type ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0"
        }`}
      >
        <label className="block font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
          {t("name_label")}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type ? TYPE_META[type][lang === "fr" ? "hintFr" : "hintEn"] : ""}
          onKeyDown={(e) => {
            if (e.key === "Enter" && ready) onBegin(type!, name.trim());
          }}
          className="mt-2 w-full border-b-2 border-bottle/30 bg-transparent pb-2 font-display text-2xl text-bottle placeholder:font-body placeholder:text-base placeholder:italic placeholder:text-ink-faint/70 focus:border-brass focus:outline-none"
          autoFocus={!!type}
        />
        <button
          disabled={!ready}
          onClick={() => ready && onBegin(type!, name.trim())}
          className="mt-7 rounded-full bg-brass px-7 py-3 font-sans text-sm font-semibold text-bottle-deep shadow-seal transition enabled:hover:bg-brass-light disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-px"
        >
          {t("begin")}
        </button>
      </div>
    </div>
  );
}
