import { useState } from "react";
import type { Lang } from "../types";
import { makeT } from "../i18n";

interface Props {
  lang: Lang;
  onDone: () => void;
}

export default function Onboarding({ lang, onDone }: Props) {
  const t = makeT(lang);
  const [step, setStep] = useState(0);

  const slides = [
    { title: t("ob1_title"), body: t("ob1_body"), glyph: "❦" },
    { title: t("ob2_title"), body: t("ob2_body"), glyph: "✑" },
    { title: t("ob3_title"), body: t("ob3_body"), glyph: "⚖" },
  ];
  const last = step === slides.length - 1;
  const s = slides[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bottle-deep/70 px-5 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-paper-light p-8 shadow-leaf-lg sm:p-10">
        <button
          onClick={onDone}
          className="absolute right-5 top-5 text-sm font-sans font-medium text-ink-faint transition hover:text-bottle"
        >
          {t("ob_skip")}
        </button>

        <div className="mb-6 select-none text-4xl text-brass" aria-hidden>
          {s.glyph}
        </div>
        <div key={step} className="animate-riseIn">
          <h2 className="font-display text-3xl font-semibold leading-tight text-bottle sm:text-4xl">
            {s.title}
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-ink-soft">{s.body}</p>
        </div>

        <div className="mt-9 flex items-center justify-between">
          <div className="flex gap-2" aria-hidden>
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-brass" : "w-1.5 bg-paper-shade"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => (last ? onDone() : setStep((n) => n + 1))}
            className="rounded-full bg-bottle px-6 py-2.5 font-sans text-sm font-semibold text-paper-light shadow-seal transition hover:bg-bottle-mid active:translate-y-px"
          >
            {last ? t("ob_start") : t("ob_next")}
          </button>
        </div>
      </div>
    </div>
  );
}
