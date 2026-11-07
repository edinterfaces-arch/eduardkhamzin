export type Language = "en" | "ru";
export type EraId = "present" | "social" | "early";
export type LocalizedText = Record<Language, string>;
export type ProjectMedia = {
  id: string;
  kind: "image" | "video" | "prototype";
  src: string;
  alt: LocalizedText;
  width: number;
  height: number;
  poster?: string;
  captions?: string;
};
export type Project = {
  id: string;
  era: EraId;
  year: number | null;
  sample: boolean;
  title: LocalizedText;
  summary: LocalizedText;
  prompt: LocalizedText;
  problem?: LocalizedText;
  solution?: LocalizedText;
  outcome?: LocalizedText;
  role?: LocalizedText;
  media: ProjectMedia[];
  metrics?: { value: string; label: LocalizedText }[];
  links?: { url: string; label: LocalizedText }[];
  visual: "workspace" | "journey" | "library";
};
const l = (en: string, ru: string): LocalizedText => ({ en, ru });
const examples = [
  [
    "present",
    "Making complexity feel simple",
    "Делать сложное понятным",
    "What are you working on?",
    "Над чем ты работаешь?",
    "A focused workspace for a less fragmented working day.",
    "Рабочее пространство, которое помогает сосредоточиться.",
    "Important decisions get lost between messages, documents and tasks.",
    "Важные решения теряются между сообщениями, документами и задачами.",
    "Bring context, decisions and the next action into one calm workspace.",
    "Собрать контекст, решения и следующий шаг в одном спокойном пространстве.",
  ],
  [
    "present",
    "A little less friction",
    "Чуть меньше препятствий",
    "What problem would you solve next?",
    "Какую проблему ты решишь дальше?",
    "An onboarding journey that gives people a clear next step.",
    "Знакомство с продуктом, где всегда понятен следующий шаг.",
    "A long setup process asks for commitment before showing value.",
    "Долгая настройка требует усилий ещё до знакомства с ценностью продукта.",
    "Introduce one useful action first, then reveal the rest when needed.",
    "Сначала предложить одно полезное действие, а остальное показать по мере необходимости.",
  ],
  [
    "present",
    "Room for better ideas",
    "Место для хороших идей",
    "And beyond the interface?",
    "А что за пределами интерфейса?",
    "A shared language for a growing product.",
    "Общий визуальный язык для растущего продукта.",
    "Small inconsistencies make familiar actions feel unfamiliar.",
    "Небольшие несоответствия делают привычные действия непонятными.",
    "Create a component vocabulary with accessible states and clear guidance.",
    "Создать библиотеку компонентов с доступными состояниями и понятными правилами.",
  ],
  [
    "social",
    "Finding your people",
    "Найти своих",
    "",
    "",
    "A community concept built around shared interests.",
    "Концепция сообщества вокруг общих интересов.",
    "A busy feed makes meaningful conversations difficult to find.",
    "В шумной ленте трудно найти содержательные разговоры.",
    "Organize conversations around topics and make context visible.",
    "Объединить разговоры по темам и сделать контекст заметным.",
  ],
  [
    "social",
    "From discovery to decision",
    "От поиска к решению",
    "",
    "",
    "A clearer path through a catalog of possibilities.",
    "Понятный путь через каталог возможностей.",
    "Too many choices make comparison feel like work.",
    "Избыток вариантов превращает сравнение в тяжёлую работу.",
    "Use consistent information and a short comparison flow.",
    "Выстроить единый порядок информации и короткий сценарий сравнения.",
  ],
  [
    "social",
    "Small screens, big intentions",
    "Маленький экран, большие идеи",
    "",
    "",
    "An everyday service designed around the moments between things.",
    "Повседневный сервис для коротких свободных минут.",
    "People need to complete a task while their attention is divided.",
    "Людям нужно завершать задачи, когда внимание разделено.",
    "Make the primary action obvious and preserve progress between visits.",
    "Выделить главное действие и сохранять прогресс между посещениями.",
  ],
  [
    "early",
    "The first blank canvas",
    "Первый чистый холст",
    "",
    "",
    "An editorial experiment in type, rhythm and hierarchy.",
    "Редакторский эксперимент с типографикой, ритмом и иерархией.",
    "A collection of stories needs an inviting starting point.",
    "Сборнику историй нужна привлекательная точка входа.",
    "Use a simple typographic hierarchy and generous reading space.",
    "Использовать простую типографическую иерархию и свободное пространство.",
  ],
  [
    "early",
    "Learning by making",
    "Учиться через практику",
    "",
    "",
    "An early exploration of navigation and visual systems.",
    "Раннее исследование навигации и визуальных систем.",
    "A growing archive becomes difficult to navigate.",
    "В растущем архиве становится трудно ориентироваться.",
    "Create a small set of recognizable categories and repeatable patterns.",
    "Создать несколько узнаваемых категорий и повторяемых паттернов.",
  ],
  [
    "early",
    "A place on the internet",
    "Своё место в интернете",
    "",
    "",
    "A personal publishing concept, made to be explored.",
    "Концепция личного издания, которое хочется изучать.",
    "A personal collection needs structure without losing its character.",
    "Личной коллекции нужна структура, которая сохранит её характер.",
    "Balance a consistent grid with expressive details and thoughtful typography.",
    "Соединить регулярную сетку с выразительными деталями и типографикой.",
  ],
];
export const projects: Project[] = examples.map((p, i) => ({
  id: `project-${i + 1}`,
  era: p[0] as EraId,
  year: null,
  sample: true,
  title: l(p[1], p[2]),
  summary: l(p[5], p[6]),
  prompt: l(p[3], p[4]),
  problem: l(p[7], p[8]),
  solution: l(p[9], p[10]),
  outcome: l(
    "Sample concept. Research findings and measured outcomes will be added with the real case study.",
    "Пример концепции. Результаты исследований и измеримые итоги появятся в реальном кейсе.",
  ),
  role: l("Sample · Product design", "Пример · Продуктовый дизайн"),
  media: [],
  visual: ["workspace", "journey", "library"][i % 3] as Project["visual"],
}));
export const eras = [
  {
    id: "present" as const,
    number: "01",
    period: "2023—2026",
    title: l("The present.", "Настоящее."),
    subtitle: l(
      "A conversation about what comes next.",
      "Разговор о том, что будет дальше.",
    ),
    device: "iPhone Duo",
    en: "ChatGPT",
    ru: "ChatGPT",
  },
  {
    id: "social" as const,
    number: "02",
    period: "2018—2022",
    title: l("The social internet.", "Социальный интернет."),
    subtitle: l(
      "Before the prompts, there were posts.",
      "До промптов были посты.",
    ),
    device: "iPhone 11",
    en: "Twitter",
    ru: "Telegram",
  },
  {
    id: "early" as const,
    number: "03",
    period: "2012—2016",
    title: l("Where it started.", "С чего всё началось."),
    subtitle: l(
      "Smaller screens. A world of possibility.",
      "Меньше экраны. Больше открытий.",
    ),
    device: "iPhone 4S",
    en: "Tumblr",
    ru: "VK",
  },
];
export const profile = {
  name: l("Your Name", "Ваше имя"),
  email: "hello@example.com",
  url: "https://example.com",
};
export const t = (language: Language, en: string, ru: string) =>
  language === "en" ? en : ru;
