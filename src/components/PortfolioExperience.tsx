"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { eras, projects, profile, Language, t } from "../data/projects";
import { useNarrative } from "../lib/useNarrative";
import { ContactSection } from "./ContactSection";
import { Devices } from "./Devices";
import { ProjectRenderer } from "./ProjectRenderer";
export function PortfolioExperience({
  initialLanguage = "en",
  prototype = false,
}: {
  initialLanguage?: Language;
  prototype?: boolean;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const restore = useRef<{ id: string; fraction: number } | null>(null);
  const active = useNarrative();
  const availableEras = prototype ? eras.slice(0, 2) : eras;
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    const saved = restore.current;
    if (saved) {
      const anchor = document.getElementById(saved.id);
      if (anchor)
        window.scrollTo({
          top:
            anchor.getBoundingClientRect().top +
            scrollY +
            saved.fraction * anchor.offsetHeight -
            innerHeight * 0.25,
          behavior: "instant",
        });
      restore.current = null;
    }
  }, [language]);
  function switchLanguage(next: Language) {
    if (next === language) return;
    const point = scrollY + innerHeight * 0.25;
    const anchors = Array.from(
      document.querySelectorAll<HTMLElement>("[data-anchor]"),
    );
    const anchor =
      [...anchors]
        .sort((a, b) => a.offsetHeight - b.offsetHeight)
        .find((el) => {
          const top = el.getBoundingClientRect().top + scrollY;
          return top <= point && top + el.offsetHeight > point;
        }) ??
      anchors.reduce<HTMLElement | undefined>(
        (best, el) =>
          Math.abs(el.getBoundingClientRect().top - innerHeight * 0.25) <
          Math.abs(
            (best?.getBoundingClientRect().top ?? Infinity) -
              innerHeight * 0.25,
          )
            ? el
            : best,
        undefined,
      );
    if (anchor)
      restore.current = {
        id: anchor.id,
        fraction:
          (point - (anchor.getBoundingClientRect().top + scrollY)) /
          anchor.offsetHeight,
      };
    setLanguage(next);
    const url = new URL(location.href);
    url.searchParams.set("lang", next);
    history.replaceState(null, "", url);
  }
  useLayoutEffect(() => {
    const query = new URLSearchParams(location.search).get("lang");
    if (query === "en" || query === "ru") setLanguage(query);
  }, []);
  return (
    <div className={`portfolio language-${language}`}>
      <a href="#narrative" className="skip-link">
        {t(language, "Skip to projects", "Перейти к проектам")}
      </a>
      <header className="site-header">
        <a href="#top" className="identity">
          <span className="identity-mark">y.</span>
          <span>
            {profile.name[language]}
            <small>
              {t(language, "Product designer", "Продуктовый дизайнер")}
            </small>
          </span>
        </a>
        <div className="header-right">
          <span className="header-note">
            {t(language, "An internet retrospective", "Интернет-ретроспектива")}
          </span>
          <nav
            aria-label={t(language, "Language", "Язык")}
            className="languages"
          >
            <button
              type="button"
              lang="en"
              aria-pressed={language === "en"}
              onClick={() => switchLanguage("en")}
            >
              EN
            </button>
            <span>/</span>
            <button
              type="button"
              lang="ru"
              aria-pressed={language === "ru"}
              onClick={() => switchLanguage("ru")}
            >
              RU
            </button>
          </nav>
        </div>
        <div className="reading-progress" />
      </header>
      <main id="top">
        <section className="intro" id="introduction" data-anchor>
          <div className="intro-kicker">
            <span className="live-dot" />
            {t(
              language,
              "ONE DESIGNER. THREE ERAS OF THE INTERNET.",
              "ОДИН ДИЗАЙНЕР. ТРИ ЭПОХИ ИНТЕРНЕТА.",
            )}
          </div>
          <h1>
            {t(language, "Interfaces change.", "Интерфейсы меняются.")}
            <br />
            <span>
              {t(language, "Curiosity stays.", "Любопытство остаётся.")}
            </span>
          </h1>
          <div className="intro-bottom">
            <p>
              {t(
                language,
                "A journey through the work, the thinking, and the interfaces that shaped a designer.",
                "Путешествие через проекты, идеи и интерфейсы, которые формировали дизайнера.",
              )}
            </p>
            <span className="scroll-cue">
              {t(language, "Just scroll", "Просто листайте")} <span>↓</span>
            </span>
          </div>
          <p className="sample-notice">
            {t(
              language,
              "Portfolio template · All projects and identity details are placeholders.",
              "Шаблон портфолио · Все проекты и личные данные — примеры.",
            )}
          </p>
        </section>
        <div className="narrative" id="narrative">
          <Devices language={language} />
          <div className="era-feed">
            {availableEras.map((era) => (
              <section
                id={era.id}
                key={era.id}
                data-era
                data-anchor
                className={`era era-${era.id} platform-${era[language].toLowerCase()}`}
              >
                <header className="era-heading">
                  <div className="era-eyebrow">
                    <span>
                      {era.number} / {era.period}
                    </span>
                    <span>
                      {t(language, "INTERFACE ERA", "ЭПОХА ИНТЕРФЕЙСОВ")}
                    </span>
                  </div>
                  <h2>{era.title[language]}</h2>
                  <p>{era.subtitle[language]}</p>
                </header>
                <div className="platform-bar">
                  <span className="platform-wordmark">
                    {era[language] === "Tumblr" ? "tumblr." : era[language]}
                  </span>
                  <span>
                    {t(language, "A design journal", "Дневник дизайнера")}
                  </span>
                </div>
                <div className="platform-feed">
                  {projects
                    .filter((project) => project.era === era.id)
                    .slice(0, prototype ? 2 : undefined)
                    .map((project, index) => (
                      <ProjectRenderer
                        key={project.id}
                        project={project}
                        language={language}
                        index={index}
                      />
                    ))}
                </div>
                <div className="era-end">
                  {t(language, "A little further back", "Ещё немного назад")}{" "}
                  <span>↓</span>
                </div>
              </section>
            ))}
          </div>
        </div>
        <ContactSection language={language} />
      </main>
      <div className="era-indicator" aria-hidden="true">
        <span>{String(Math.min(active + 1, 4)).padStart(2, "0")}</span>
        <i />
        {active < 3 ? eras[active].period : t(language, "NOW", "СЕЙЧАС")}
      </div>
      <noscript>
        <style>{`.device-stage,.era-indicator{display:none}.narrative{display:block}.era-feed{max-width:760px;margin:auto}.languages{display:none}`}</style>
      </noscript>
    </div>
  );
}
