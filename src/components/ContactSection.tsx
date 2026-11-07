"use client";
import { useState } from "react";
import { Language, profile, t } from "../data/projects";
export function ContactSection({ language }: { language: Language }) {
  const [copied, setCopied] = useState(false);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <section className="ending" id="ending" data-anchor>
      <div className="ending-inner">
        <span className="ending-kicker">
          04 / {t(language, "BACK TO NOW", "СНОВА В НАСТОЯЩЕМ")}
        </span>
        <h2>
          {t(language, "Different interfaces.", "Разные интерфейсы.")}
          <br />
          <span>
            {t(language, "The same curiosity.", "То же любопытство.")}
          </span>
        </h2>
        <div className="ending-grid">
          <div>
            <p className="ending-lead">
              {t(
                language,
                "You’ve seen where I’ve been.",
                "Вы увидели, с чего всё начиналось.",
              )}
              <br />
              {t(
                language,
                "Now, let’s build what’s next.",
                "Теперь создадим что-то новое.",
              )}
            </p>
            <p>
              {t(
                language,
                "Your Name — product designer. Replace this introduction with your current focus, experience, and the kinds of collaborations you’re looking for.",
                "Ваше имя — продуктовый дизайнер. Расскажите здесь о своём опыте, текущих интересах и проектах, над которыми хотите работать.",
              )}
            </p>
            <ul className="expertise">
              <li>{t(language, "Product design", "Продуктовый дизайн")}</li>
              <li>
                {t(language, "Interaction design", "Дизайн взаимодействия")}
              </li>
              <li>{t(language, "Design systems", "Дизайн-системы")}</li>
            </ul>
          </div>
          <div className="contact">
            <span>
              {t(language, "LET’S START A CONVERSATION", "НАЧНЁМ РАЗГОВОР")}
            </span>
            <a className="email" href={`mailto:${profile.email}`}>
              {profile.email} ↗
            </a>
            <button onClick={copyEmail}>
              {copied
                ? t(language, "Copied", "Скопировано")
                : t(language, "Copy email", "Скопировать email")}
            </button>
            <span role="status" className="sr-only">
              {copied ? t(language, "Email copied", "Email скопирован") : ""}
            </span>
            <a href={profile.url} target="_blank" rel="noreferrer">
              {t(language, "Profile placeholder", "Ссылка на профиль")} ↗
            </a>
          </div>
        </div>
        <footer>
          <span>
            {profile.name[language]} ·{" "}
            {t(
              language,
              "A continuing work in progress.",
              "История продолжается.",
            )}
          </span>
          <a
            href={language === "en" ? "/ru/" : "/"}
            hrefLang={language === "en" ? "ru" : "en"}
          >
            {language === "en" ? "Русская версия" : "English version"}
          </a>
          <a href="#top">
            {t(language, "Back to the present ↑", "В начало ↑")}
          </a>
        </footer>
      </div>
    </section>
  );
}
