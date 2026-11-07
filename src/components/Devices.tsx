import { Language, t } from "../data/projects";
import { SampleVisual } from "./ProjectRenderer";
export function Devices({ language }: { language: Language }) {
  return (
    <aside className="device-stage" aria-hidden="true">
      <div className="device-stage-inner">
        <div className="device-shell duo-shell" data-shell="present">
          <div className="duo">
            <div className="duo-base">
              <div className="phone-status">
                9:41 <span>▰</span>
              </div>
              <div className="mini-header">
                ChatGPT <span>⌄</span>
              </div>
              <div className="mini-conversation">
                <span className="mini-question">
                  {t(
                    language,
                    "What are you working on?",
                    "Над чем ты работаешь?",
                  )}
                </span>
                <b>✳</b>
                <p>
                  {t(
                    language,
                    "Thoughtful products. Meaningful details.",
                    "Продуманные продукты. Значимые детали.",
                  )}
                </p>
                <div className="mini-lines">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="mini-composer">
                {t(language, "A story through design", "История через дизайн")}{" "}
                <span>↑</span>
              </div>
            </div>
            <div className="duo-leaf">
              <div className="phone-status">
                {t(language, "Selected work", "Избранное")} <span>↗</span>
              </div>
              <SampleVisual variant="workspace" language={language} compact />
              <div className="leaf-title">
                {t(
                  language,
                  "Less noise. More meaning.",
                  "Меньше шума. Больше смысла.",
                )}
              </div>
              <div className="mini-lines">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
          <p className="device-caption">
            iPhone Duo{" "}
            <span> / {t(language, "stylized foldable", "стилизация")}</span>
          </p>
        </div>
        <div className="device-shell eleven-shell" data-shell="social">
          <div className="iphone-eleven">
            <div className="notch" />
            <div className="phone-screen">
              <div className="phone-status">
                9:41 <span>▰</span>
              </div>
              <div className={`mini-header social-mini ${language}`}>
                {language === "en" ? "Twitter" : "Telegram"}
              </div>
              <div className="mini-post">
                <div className="mini-user">
                  <span className="avatar">YN</span>
                  <b>
                    {t(language, "Your Name", "Ваше имя")}
                    <small>@yourname</small>
                  </b>
                </div>
                <p>
                  {t(
                    language,
                    "Good design starts with understanding people.",
                    "Хороший дизайн начинается с понимания людей.",
                  )}
                </p>
                <SampleVisual variant="journey" language={language} compact />
                <div className="mini-lines">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
            <div className="home-indicator" />
          </div>
          <p className="device-caption">
            iPhone 11 <span> / 2018—2022</span>
          </p>
        </div>
        <div className="device-shell four-shell" data-shell="early">
          <div className="iphone-four">
            <div className="speaker" />
            <div className="phone-screen">
              <div className="classic-status">
                ●●●●● <span>9:41</span> ▰
              </div>
              <div className="classic-header">
                {language === "en" ? "tumblr." : "ВКонтакте"}
              </div>
              <div className="mini-post">
                <small>{t(language, "YOURNAME", "ВАШЕ ИМЯ")}</small>
                <h4>{t(language, "Hello, internet.", "Привет, интернет.")}</h4>
                <SampleVisual variant="library" language={language} compact />
                <p>
                  {t(
                    language,
                    "Every story starts somewhere.",
                    "У каждой истории есть начало.",
                  )}
                </p>
              </div>
            </div>
            <div className="home-button">
              <span />
            </div>
          </div>
          <p className="device-caption">
            iPhone 4S{" "}
            <span>
              {" "}
              /{" "}
              {t(
                language,
                "nostalgic interpretation",
                "ностальгическая версия",
              )}
            </span>
          </p>
        </div>
      </div>
    </aside>
  );
}
