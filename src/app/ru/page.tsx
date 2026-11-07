import { PortfolioExperience } from "../../components/PortfolioExperience";
export const metadata = {
  title: "Ваше имя — Три эпохи, один дизайнер",
  description:
    "Портфолио продуктового дизайнера через три эпохи интернета. Примеры проектов и непрерывная история.",
};
export default function Page() {
  return (
    <div lang="ru">
      <PortfolioExperience initialLanguage="ru" />
    </div>
  );
}
