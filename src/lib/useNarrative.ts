"use client";
import { useEffect, useState } from "react";
export function useNarrative() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-era]"),
    );
    const shells = Array.from(
      document.querySelectorAll<HTMLElement>("[data-shell]"),
    );
    const leaf = document.querySelector<HTMLElement>(".duo-leaf");
    const stage = document.querySelector<HTMLElement>(".device-stage");
    const progress = document.querySelector<HTMLElement>(".reading-progress");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let starts: number[] = [];
    let finish = 0;
    let height = 1;
    let current = -1;
    const clamp = (n: number) => Math.max(0, Math.min(1, n));
    function measure() {
      starts = sections.map(
        (el) => el.getBoundingClientRect().top + window.scrollY,
      );
      finish =
        (document.getElementById("ending")?.getBoundingClientRect().top ?? 0) +
        window.scrollY;
      height = document.documentElement.scrollHeight - innerHeight;
      schedule();
    }
    function render() {
      frame = 0;
      const y = window.scrollY;
      const focus = y + innerHeight * 0.44;
      const index =
        focus >= finish
          ? 3
          : Math.max(
              0,
              starts.findLastIndex((start) => focus >= start),
            );
      if (index !== current) {
        current = index;
        setActive(index);
      }
      shells.forEach((shell, i) => {
        if (i >= starts.length) {
          shell.style.opacity = "0";
          return;
        }
        const enter = i === 0 ? 1 : clamp((focus - starts[i] + 100) / 200);
        const leave =
          i === starts.length - 1
            ? clamp((focus - finish + 100) / 200)
            : clamp((focus - starts[i + 1] + 100) / 200);
        const opacity = reduced.matches
          ? Number(index === i)
          : enter * (1 - leave);
        shell.style.opacity = String(opacity);
        shell.style.transform = reduced.matches
          ? "none"
          : `translateY(${(1 - enter) * 28 - leave * 28}px) scale(${0.96 + 0.04 * enter - 0.04 * leave})`;
      });
      if (leaf)
        leaf.style.transform = `rotateY(${reduced.matches ? 0 : -168 * (1 - clamp(y / Math.max(200, innerHeight * 0.65)))}deg)`;
      if (stage)
        stage.style.visibility = focus > finish + 200 ? "hidden" : "visible";
      if (progress)
        progress.style.transform = `scaleX(${clamp(y / Math.max(1, height))})`;
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", measure);
    reduced.addEventListener("change", schedule);
    measure();
    // WebKit does not consistently restore scroll on reload of a static export.
    // Store only an ephemeral position, never identity or analytics.
    const storageKey = () =>
      `portfolio-position:${location.pathname}${location.search}`;
    function savePosition() {
      try {
        sessionStorage.setItem(storageKey(), String(scrollY));
      } catch {}
    }
    let restoreFrame = 0;
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    if (navigation?.type === "reload" && !location.hash) {
      try {
        const saved = sessionStorage.getItem(storageKey());
        if (saved !== null)
          restoreFrame = requestAnimationFrame(() => {
            window.scrollTo(0, Number(saved));
            schedule();
          });
      } catch {}
    }
    addEventListener("pagehide", savePosition);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(restoreFrame);
      observer.disconnect();
      removeEventListener("pagehide", savePosition);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", measure);
      reduced.removeEventListener("change", schedule);
    };
  }, []);
  return active;
}
