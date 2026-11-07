import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { projects, eras, profile, type Project } from "../src/data/projects";
import { ProjectRenderer } from "../src/components/ProjectRenderer";

test("sample data makes no invented dated achievements and has unique stable anchors", () => {
  assert.equal(new Set(projects.map((p) => p.id)).size, projects.length);
  for (const era of eras)
    assert.equal(projects.filter((p) => p.era === era.id).length, 3);
  for (const project of projects) {
    assert.equal(project.sample, true);
    assert.equal(project.year, null);
    assert.equal(project.metrics, undefined);
    for (const language of ["en", "ru"] as const) {
      assert.ok(project.title[language]);
      assert.ok(project.summary[language]);
    }
  }
  assert.equal(profile.email, "hello@example.com");
  assert.equal(new URL(profile.url).hostname, "example.com");
});

test("every platform renders long copy, multiple media and absent optional fields semantically", () => {
  for (const era of eras)
    for (const language of ["en", "ru"] as const) {
      const project: Project = {
        ...projects.find((p) => p.era === era.id)!,
        problem: {
          en: "Long copy. ".repeat(200),
          ru: "Длинный текст. ".repeat(200),
        },
        media: [1, 2].map((i) => ({
          id: `media-${i}`,
          kind: "image",
          src: "/images/project-one.png",
          width: 1200,
          height: 800,
          alt: { en: `Sample ${i}`, ru: `Пример ${i}` },
        })),
        metrics: undefined,
        outcome: undefined,
      };
      const html = renderToStaticMarkup(
        createElement(ProjectRenderer, { project, language, index: 0 }),
      );
      assert.equal((html.match(/<figure/g) || []).length, 2);
      assert.ok(html.includes(project.problem![language]));
      assert.ok(!html.includes("<dl"));
      const minimal = renderToStaticMarkup(
        createElement(ProjectRenderer, {
          project: {
            ...project,
            media: [],
            problem: undefined,
            solution: undefined,
            role: undefined,
          },
          language,
          index: 0,
        }),
      );
      assert.ok(minimal.includes("sample-visual"));
      assert.ok(minimal.includes(project.title[language]));
    }
});

test("video and prototype fallbacks include readable descriptions and optional controls", () => {
  const project: Project = {
    ...projects[0],
    media: [
      {
        id: "video",
        kind: "video",
        src: "/demo.mp4",
        width: 1200,
        height: 800,
        alt: { en: "Demo description", ru: "Описание демо" },
        captions: "/captions.vtt",
      },
      {
        id: "prototype",
        kind: "prototype",
        src: "https://example.com",
        poster: "/images/project-one.png",
        width: 1200,
        height: 800,
        alt: { en: "Prototype overview", ru: "Обзор прототипа" },
      },
    ],
  };
  const html = renderToStaticMarkup(
    createElement(ProjectRenderer, { project, language: "en", index: 0 }),
  );
  assert.ok(html.includes("<video"));
  assert.ok(html.includes("controls"));
  assert.ok(html.includes("<track"));
  assert.ok(html.includes("Prototype overview"));
  assert.ok(html.includes("Open optional prototype"));
});
