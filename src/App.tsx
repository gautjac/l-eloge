import { useEffect, useState } from "react";
import type { Eloge, Lang, SubjectType } from "./types";
import { makeT } from "./i18n";
import { saveEloge } from "./db";
import Onboarding from "./components/Onboarding";
import Chooser from "./components/Chooser";
import Composer, { type DraftSeed } from "./components/Composer";
import Recueil from "./components/Recueil";

type View = "chooser" | "compose" | "recueil";

const LS_ONBOARDED = "leloge.onboarded";
const LS_LANG = "leloge.lang";
const LS_INVITE = "leloge.invite.dismissedWeek";

function currentWeek(): number {
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() =>
    (localStorage.getItem(LS_LANG) as Lang) === "en" ? "en" : "fr",
  );
  const [onboarded, setOnboarded] = useState<boolean>(
    () => localStorage.getItem(LS_ONBOARDED) === "1",
  );
  const [view, setView] = useState<View>("chooser");
  const [seed, setSeed] = useState<DraftSeed | null>(null);
  const [inviteDismissed, setInviteDismissed] = useState<boolean>(
    () => Number(localStorage.getItem(LS_INVITE) ?? "-1") === currentWeek(),
  );

  const t = makeT(lang);

  useEffect(() => {
    localStorage.setItem(LS_LANG, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  function finishOnboarding() {
    localStorage.setItem(LS_ONBOARDED, "1");
    setOnboarded(true);
  }

  function begin(type: SubjectType, subject: string) {
    setSeed({ type, subject });
    setView("compose");
  }

  function resume(e: Eloge) {
    setSeed({ id: e.id, type: e.type, subject: e.subject, text: e.text, shapedBy: e.shapedBy });
    setView("compose");
  }

  async function handleSave(data: {
    id?: string;
    type: SubjectType;
    subject: string;
    text: string;
    shapedBy: string[];
  }) {
    const id = await saveEloge(data);
    // keep the composer on the same éloge so further edits update it in place
    setSeed((s) => (s ? { ...s, id } : s));
  }

  function dismissInvite() {
    localStorage.setItem(LS_INVITE, String(currentWeek()));
    setInviteDismissed(true);
  }

  return (
    <div className="min-h-full">
      {!onboarded && <Onboarding lang={lang} onDone={finishOnboarding} />}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-paper-shade/70 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button
            onClick={() => setView("chooser")}
            className="flex items-baseline gap-2 text-left"
          >
            <span className="font-display text-2xl font-semibold tracking-tight text-bottle">
              L&apos;Éloge
            </span>
            <span className="hidden font-body text-sm italic text-ink-faint sm:inline">
              {t("tagline")}
            </span>
          </button>

          <div className="flex items-center gap-1.5">
            <NavLink active={view === "chooser" || view === "compose"} onClick={() => setView("chooser")}>
              {t("nav_new")}
            </NavLink>
            <NavLink active={view === "recueil"} onClick={() => setView("recueil")}>
              {t("nav_recueil")}
            </NavLink>
            <button
              onClick={() => setLang((l) => (l === "fr" ? "en" : "fr"))}
              className="ml-1 rounded-full border border-bottle/25 px-2.5 py-1 font-sans text-xs font-semibold text-bottle transition hover:bg-bottle/5"
              aria-label="Language"
            >
              {lang === "fr" ? "EN" : "FR"}
            </button>
          </div>
        </div>
      </header>

      <main>
        {view === "chooser" && (
          <Chooser
            lang={lang}
            onBegin={begin}
            dismissedInvitation={inviteDismissed}
            onTakeInvitation={dismissInvite}
            onDismissInvitation={dismissInvite}
          />
        )}

        {view === "compose" && seed && (
          <Composer lang={lang} seed={seed} onSave={handleSave} onBack={() => setView("chooser")} />
        )}

        {view === "recueil" && (
          <Recueil
            lang={lang}
            onWriteFirst={() => setView("chooser")}
            onResume={resume}
          />
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center font-sans text-xs text-ink-faint/80">
        {t("appName")} · {t("tagline")}
      </footer>
    </div>
  );
}

function NavLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 font-sans text-sm font-semibold transition ${
        active ? "bg-bottle text-paper-light" : "text-ink-soft hover:bg-bottle/5 hover:text-bottle"
      }`}
    >
      {children}
    </button>
  );
}
