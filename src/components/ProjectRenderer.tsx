import { Project, Language, t, profile } from "../data/projects";

export function SampleVisual({
  variant,
  language,
  compact = false,
}: {
  variant: Project["visual"];
  language: Language;
  compact?: boolean;
}) {
  return (
    <div
      className={`sample-visual visual-${variant} ${compact ? "compact" : ""}`}
      role="img"
      aria-label={t(
        language,
        "Placeholder product illustration — not a real project screenshot",
        "Иллюстрация-заглушка — не скриншот реального проекта",
      )}
    >
      <div className="mock-window">
        <div className="mock-top">
          <span className="mock-logo">◈</span>
          <span>
            {variant === "workspace"
              ? "Workspace"
              : variant === "journey"
                ? "A fresh start"
                : "Collections"}
          </span>
          <span className="mock-dots">···</span>
        </div>
        {variant === "workspace" ? (
          <div className="mock-workspace">
            <div className="mock-sidebar">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="mock-main">
              <small>{t(language, "YOUR SPACE", "ВАШЕ ПРОСТРАНСТВО")}</small>
              <strong>
                {t(language, "A little more focus.", "Немного больше ясности.")}
              </strong>
              <div className="mock-cards">
                <i />
                <i />
                <i />
              </div>
              <div className="mock-lines">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        ) : variant === "journey" ? (
          <div className="mock-journey">
            <span className="orb">✳</span>
            <strong>
              {t(
                language,
                "Good things start here.",
                "Хорошее начинается здесь.",
              )}
            </strong>
            <div className="mock-lines">
              <i />
              <i />
            </div>
            <span className="mock-pill">
              {t(language, "One step at a time", "Шаг за шагом")} ↗
            </span>
          </div>
        ) : (
          <div className="mock-library">
            <strong>
              Aa<span>01 / 03</span>
            </strong>
            <div className="swatches">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="mock-lines">
              <i />
              <i />
            </div>
          </div>
        )}
      </div>
      <span className="visual-caption">
        {t(language, "ILLUSTRATIVE PLACEHOLDER", "ИЛЛЮСТРАЦИЯ-ЗАГЛУШКА")}
      </span>
    </div>
  );
}
function Media({
  project,
  language,
}: {
  project: Project;
  language: Language;
}) {
  return (
    <div className="project-media">
      {project.media.length ? (
        project.media.map((media) => (
          <figure key={media.id}>
            {media.kind === "video" ? (
              <video
                controls
                playsInline
                preload="none"
                poster={media.poster}
                width={media.width}
                height={media.height}
                aria-label={media.alt[language]}
              >
                <source src={media.src} />
                {media.captions && (
                  <track
                    kind="captions"
                    src={media.captions}
                    srcLang={language}
                    default
                  />
                )}
              </video>
            ) : (
              <img
                src={
                  media.kind === "prototype"
                    ? media.poster || media.src
                    : media.src
                }
                alt={media.alt[language]}
                width={media.width}
                height={media.height}
                loading="lazy"
              />
            )}
            <figcaption>
              {media.alt[language]}
              {media.kind === "prototype" && (
                <>
                  {" "}
                  ·{" "}
                  <a href={media.src} target="_blank" rel="noreferrer">
                    {t(language, "Open optional prototype", "Открыть прототип")}{" "}
                    ↗
                  </a>
                </>
              )}
            </figcaption>
          </figure>
        ))
      ) : (
        <SampleVisual variant={project.visual} language={language} />
      )}
    </div>
  );
}
export function ProjectRenderer({
  project,
  language,
  index,
}: {
  project: Project;
  language: Language;
  index: number;
}) {
  const platform =
    project.era === "present"
      ? "chatgpt"
      : project.era === "social"
        ? language === "en"
          ? "twitter"
          : "telegram"
        : language === "en"
          ? "tumblr"
          : "vk";
  return (
    <article
      id={project.id}
      data-anchor
      data-project
      className={`project post-${platform}`}
    >
      {platform === "chatgpt" ? (
        <div className="prompt">
          <span>{project.prompt[language]}</span>
        </div>
      ) : null}
      <div className="post-body">
        <div className="post-author">
          <span
            className={`avatar ${platform === "chatgpt" ? "ai-avatar" : ""}`}
            aria-hidden="true"
          >
            {platform === "chatgpt" ? "✳" : "YN"}
          </span>
          <div>
            <strong>
              {platform === "chatgpt"
                ? t(language, "A designer’s perspective", "Взгляд дизайнера")
                : profile.name[language]}
            </strong>
            <span>
              {project.sample
                ? t(language, "Sample project", "Пример проекта")
                : (project.year ?? "")}
              {project.sample && project.year ? ` · ${project.year}` : ""}
              {platform === "twitter" ? " · @yourname" : ""}
            </span>
          </div>
          <span className="post-index">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="post-copy">
          <p className="project-role">{project.role?.[language]}</p>
          <h3>{project.title[language]}</h3>
          <p className="project-summary">{project.summary[language]}</p>
        </div>
        <Media project={project} language={language} />
        <div className="case-details">
          {(
            [
              ["problem", "The challenge", "Задача"],
              ["solution", "The approach", "Подход"],
              ["outcome", "The outcome", "Результат"],
            ] as const
          ).map(([key, en, ru]) =>
            project[key] ? (
              <section key={key}>
                <h4>{t(language, en, ru)}</h4>
                <p>{project[key]![language]}</p>
              </section>
            ) : null,
          )}
          {!!project.metrics?.length && (
            <dl className="metrics">
              {project.metrics.map((metric) => (
                <div key={metric.label.en}>
                  <dt>{metric.label[language]}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {project.links?.map((link) => (
            <a
              className="project-link"
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
            >
              {link.label[language]} ↗
            </a>
          ))}
        </div>
        <div className="post-footer">
          {t(language, "Design notes", "Заметки о дизайне")}{" "}
          <span>{t(language, "Keep scrolling ↓", "Листайте дальше ↓")}</span>
        </div>
      </div>
    </article>
  );
}
