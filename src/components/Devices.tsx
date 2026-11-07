import { ReactNode } from "react";
import { EraId, Language, t } from "../data/projects";

/** The actual project document lives inside this screen, once. */
export function DeviceScreen({
  era,
  language,
  children,
}: {
  era: EraId;
  language: Language;
  children: ReactNode;
}) {
  return (
    <div className="phone-track" data-phone-track>
      <div className={`portfolio-phone phone-${era}`} data-phone={era}>
        <div className="hardware-top" aria-hidden="true">
          {era === "early" ? (
            <span className="hardware-speaker" />
          ) : era === "social" ? (
            <span className="hardware-notch" />
          ) : (
            <span className="hardware-camera" />
          )}
        </div>
        <div className="device-status" aria-hidden="true">
          <span>{era === "early" ? "●●●●●" : "9:41"}</span>
          <span>{era === "early" ? "9:41" : ""}</span>
          <span>▰</span>
        </div>
        <div className="device-screen" data-screen>
          <div className="screen-content" data-screen-content>
            {children}
          </div>
        </div>
        {era === "present" && (
          <div className="fold-cover" aria-hidden="true">
            <span>◈</span>
          </div>
        )}
        <div className="hardware-bottom" aria-hidden="true">
          {era === "early" ? (
            <span className="hardware-home">
              <i />
            </span>
          ) : (
            <span className="hardware-indicator" />
          )}
        </div>
      </div>
      <p className="screen-instruction">
        {t(
          language,
          "Keep scrolling to explore the screen",
          "Листайте страницу, чтобы изучить экран",
        )}{" "}
        ↓
      </p>
    </div>
  );
}
