import Breadcrumbs from "@/components/Breadcrumbs";
import FragranceQuiz from "@/components/FragranceQuiz";

export const metadata = { title: "Подбор аромата" };

export default function QuizPage() {
  return (
    <div className="container-x pt-8">
      <Breadcrumbs items={[{ name: "Подбор аромата" }]} />
      <div className="mb-12 mt-6 rounded-[2rem] bg-blush px-8 py-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[.25em] text-rose">Бесплатно · 1 минута</p>
        <h1 className="h-display mt-3 text-5xl sm:text-6xl">Подбор аромата</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">Ответьте на 4 вопроса — и мы покажем ароматы, которые подойдут именно вам.</p>
      </div>
      <FragranceQuiz />
    </div>
  );
}
