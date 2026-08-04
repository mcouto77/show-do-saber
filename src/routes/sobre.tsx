import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, GraduationCap, Target, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Show do Saber — projeto educacional com IA" },
      {
        name: "description",
        content:
          "Conheça a história, a missão e o compromisso do Show do Saber: um tutor com IA que apoia o reforço escolar e valoriza o trabalho do professor.",
      },
      { property: "og:title", content: "Sobre o Show do Saber" },
      {
        property: "og:description",
        content:
          "Projeto educacional criado para apoiar alunos, especialmente da educação pública, no reforço dos conteúdos aprendidos em sala de aula.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <AppHeader />
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <header className="rounded-3xl border border-border bg-card/80 p-6 shadow-card backdrop-blur sm:p-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-neon">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Sobre o Show do Saber</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            O Show do Saber – Tutor Inteligente com IA é um projeto educacional criado para apoiar
            alunos, especialmente da educação pública, no reforço dos conteúdos aprendidos em sala
            de aula. A proposta é transformar o celular, que já faz parte do cotidiano dos jovens,
            em uma ferramenta de aprendizado, revisão e descoberta.
          </p>
        </header>

        <Block icon={<Heart className="h-5 w-5 text-primary" />} title="Como o projeto nasceu">
          O projeto nasceu da vontade de ajudar minha esposa, que é professora, em seu trabalho de
          reforço escolar. A ideia surgiu a partir de uma pergunta simples: se os jovens já usam
          tanto o celular, por que não utilizar essa tecnologia também para reforçar os estudos?
        </Block>

        <Block icon={<Target className="h-5 w-5 text-primary" />} title="Missão">
          Ajudar cada estudante a compreender o conteúdo no seu próprio ritmo, com explicações
          simples, exemplos práticos, exercícios personalizados e incentivo constante.
        </Block>

        <Block icon={<Sparkles className="h-5 w-5 text-primary" />} title="Compromisso">
          O Show do Saber não substitui o professor. Ele complementa o trabalho realizado na escola
          e valoriza o papel do educador como principal referência no processo de aprendizagem.
        </Block>

        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Desenvolvido por
          </p>
          <p className="mt-1 text-lg font-extrabold">Michel Couto do Amparo</p>
        </div>

        <p className="text-center text-sm font-bold italic text-muted-foreground">
          “Aprender acontece um passo de cada vez, e ninguém precisa caminhar sozinho.”
        </p>

        <div className="flex justify-center pb-4">
          <Link
            to="/"
            className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-neon"
          >
            Começar a estudar
          </Link>
        </div>
      </div>
    </div>
  );
}

function Block({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card/70 p-5 backdrop-blur sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-extrabold sm:text-lg">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary">
          {icon}
        </span>
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{children}</p>
    </section>
  );
}
