"use client";
import { useLayoutEffect, useState, useRef } from "react";

export function documentPosition(element: HTMLElement) {
  const track = element.closest<HTMLElement>("[data-phone-track]");
  const content = element.closest<HTMLElement>("[data-screen-content]");
  const frame = track?.querySelector<HTMLElement>("[data-phone]");
  const screen = track?.querySelector<HTMLElement>("[data-screen]");
  if (
    track &&
    content &&
    frame &&
    screen &&
    getComputedStyle(frame).position === "sticky"
  ) {
    return (
      track.getBoundingClientRect().top +
      scrollY +
      screen.getBoundingClientRect().top -
      frame.getBoundingClientRect().top +
      element.getBoundingClientRect().top -
      content.getBoundingClientRect().top
    );
  }
  return element.getBoundingClientRect().top + scrollY;
}

export function useNarrative(language: string) {
  const [active, setActive] = useState(0);
  const restoredReload = useRef(false);
  useLayoutEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-era]"),
    );
    const tracks = Array.from(
      document.querySelectorAll<HTMLElement>("[data-phone-track]"),
    );
    const progress = document.querySelector<HTMLElement>(".reading-progress");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      current = -1,
      height = 1;
    let starts: number[] = [],
      finish = 0;
    let geometry: {
      track: HTMLElement;
      phone: HTMLElement;
      screen: HTMLElement;
      content: HTMLElement;
      start: number;
      travel: number;
      top: number;
      sticky: boolean;
    }[] = [];
    const clamp = (n: number, max = 1) => Math.max(0, Math.min(max, n));
    function measure() {
      geometry = tracks.map((track) => {
        const phone = track.querySelector<HTMLElement>("[data-phone]")!;
        const screen = track.querySelector<HTMLElement>("[data-screen]")!;
        const content = track.querySelector<HTMLElement>(
          "[data-screen-content]",
        )!;
        const sticky = getComputedStyle(phone).position === "sticky";
        const travel = sticky
          ? Math.max(0, content.offsetHeight - screen.clientHeight)
          : 0;
        track.style.height = sticky ? `${phone.offsetHeight + travel}px` : "";
        if (!sticky) content.style.transform = "";
        return {
          track,
          phone,
          screen,
          content,
          start: 0,
          travel,
          top: parseFloat(getComputedStyle(phone).top) || 0,
          sticky,
        };
      });
      // Measure positions after ALL track heights have been updated.
      geometry.forEach(
        (item) =>
          (item.start = item.track.getBoundingClientRect().top + scrollY),
      );
      starts = sections.map((el) => el.getBoundingClientRect().top + scrollY);
      finish =
        document.getElementById("ending")!.getBoundingClientRect().top +
        scrollY;
      height = document.documentElement.scrollHeight - innerHeight;
      render();
    }
    function render() {
      frame = 0;
      const y = scrollY,
        focus = y + innerHeight * 0.44;
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
      geometry.forEach(({ phone, content, start, travel, top, sticky }) => {
        if (sticky)
          content.style.transform = `translate3d(0,${-clamp(y - start + top, travel)}px,0)`;
        const cover = phone.querySelector<HTMLElement>(".fold-cover");
        if (cover) {
          // The lid is fully open before the actual case-study reading starts.
          const open = reduced.matches
            ? 1
            : clamp(
                (y - start + innerHeight * 0.85) /
                  Math.max(1, innerHeight * 0.85 - top),
              );
          cover.style.transform = `rotateY(${-180 * open}deg)`;
          cover.style.visibility = open >= 1 ? "hidden" : "visible";
        }
      });
      if (progress)
        progress.style.transform = `scaleX(${clamp(y / Math.max(1, height))})`;
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }
    function focusContent(event: FocusEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-screen-content]")) return;
      const screen = target.closest("[data-screen]")!;
      const rect = target.getBoundingClientRect(),
        bounds = screen.getBoundingClientRect();
      if (rect.top < bounds.top || rect.bottom > bounds.bottom) {
        scrollTo({
          top: documentPosition(target) - Math.max(160, innerHeight * 0.3),
          behavior: "instant",
        });
        render();
      }
    }
    const observer = new ResizeObserver(measure);
    tracks.forEach((track) =>
      observer.observe(track.querySelector("[data-screen-content]")!),
    );
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", measure);
    document.addEventListener("focusin", focusContent);
    document.addEventListener("portfolio:measure", measure);
    reduced.addEventListener("change", measure);
    measure();
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
    if (
      !restoredReload.current &&
      navigation?.type === "reload" &&
      !location.hash
    ) {
      try {
        const saved = sessionStorage.getItem(storageKey());
        if (saved !== null)
          restoreFrame = requestAnimationFrame(() => {
            restoredReload.current = true;
            scrollTo(0, Number(saved));
            render();
          });
      } catch {}
    }
    function goToHash() {
      const el = document.getElementById(
        decodeURIComponent(location.hash.slice(1)),
      );
      if (el?.matches("[data-project]")) {
        scrollTo(0, documentPosition(el) - Math.max(160, innerHeight * 0.25));
        render();
      }
    }
    if (location.hash) goToHash();
    addEventListener("hashchange", goToHash);
    addEventListener("pagehide", savePosition);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(restoreFrame);
      observer.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", measure);
      removeEventListener("hashchange", goToHash);
      removeEventListener("pagehide", savePosition);
      document.removeEventListener("focusin", focusContent);
      document.removeEventListener("portfolio:measure", measure);
      reduced.removeEventListener("change", measure);
    };
  }, [language]);
  return active;
}
