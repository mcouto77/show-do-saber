import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  Download,
  Lightbulb,
  ListChecks,
  Loader2,
  Rocket,
  Send,
  Shuffle,
  SquarePen,
  TrendingDown,
  TrendingUp,
  Volume2,
  VolumeX,
  Wifi,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { SUBJECTS, YEARS } from "@/lib/subjects";
import { tutorChat, tutorQuestion, type TutorQuestion } from "@/lib/tutor.functions";
import { useSpeech } from "@/hooks/use-speech";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Show do Saber — Tutor Inteligente com IA" },
      {
        name: "description",
        content:
          "Escolha o que você quer estudar e aprenda com explicações, exemplos e exercícios personalizados. Um apoio para revisar em casa o que foi aprendido na aula.",
      },
      { property: "og:title", content: "Show do Saber — Tutor Inteligente com IA" },
      {
        property: "og:description",
        content:
          "Tutor de estudos com IA para alunos do 1º ao 9º ano: explicações passo a passo, exemplos e exercícios por assunto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TutorApp,
});

const EXAMPLE_TOPICS = ["Frações", "Verbos", "Sistema Solar", "Brasil Colônia", "Clima"];

type Step = "inicio" | "ano" | "materia" | "assunto" | "tutor" | "resumo";

type Msg =
  | { id: string; kind: "texto"; role: "tutor" | "aluno"; text: string }
  | {
      id: string;
      kind: "questao";
      role: "tutor";
      question: TutorQuestion;
      answered: number | null;
    };

let seq = 0;
const nextId = () => `m${++seq}`;

function understandingMessage(pct: number) {
  if (pct >= 80)
    return "Você compreendeu muito bem este conteúdo. Continue praticando para fortalecer ainda mais seu aprendizado.";
  if (pct >= 50)
    return "Você já entendeu a ideia principal. Vamos reforçar alguns pontos com novos exemplos.";
  return "Você está começando a compreender este assunto. Vamos com calma e tentar de outro jeito.";
}

function TutorApp() {
  const [step, setStep] = useState<Step>("inicio");
  const [year, setYear] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState("");
  const [stats, setStats] = useState<{
    done: number;
    hits: number;
    ok: string[];
    review: string[];
  }>({
    done: 0,
    hits: 0,
    ok: [],
    review: [],
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  const subject = SUBJECTS.find((s) => s.id === subjectId) ?? null;
  const chat = useServerFn(tutorChat);
  const question = useServerFn(tutorQuestion);
  const { supported: ttsOk, speakingId, speak, stop } = useSpeech();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const history = useCallback(
    () =>
      messages
        .slice(-8)
        .map((m) =>
          m.kind === "texto"
            ? {
                role: m.role === "tutor" ? ("assistant" as const) : ("user" as const),
                content: m.text,
              }
            : {
                role: "assistant" as const,
                content: `Questão: ${m.question.statement} Alternativas: ${m.question.options.join(" | ")}`,
              },
        )
        .filter((m) => m.content.trim().length > 0),
    [messages],
  );

  const base = useCallback(
    () => ({
      year: year ?? 5,
      subject: subject?.name ?? "Geral",
      topic: topic || "conteúdo da aula",
      history: history(),
    }),
    [year, subject, topic, history],
  );

  const runChat = useCallback(
    async (
      action: "explicar" | "resumir" | "dica" | "exemplo" | "corrigir" | "pergunta",
      message?: string,
    ) => {
      if (busy) return;
      setBusy(true);
      try {
        const r = await chat({ data: { ...base(), action, ...(message ? { message } : {}) } });
        setMessages((m) => [...m, { id: nextId(), kind: "texto", role: "tutor", text: r.text }]);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "O Tutor IA precisa de internet para funcionar.",
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, chat, base],
  );

  const runQuestion = useCallback(
    async (level: "igual" | "facil" | "dificil") => {
      if (busy) return;
      setBusy(true);
      try {
        const q = await question({ data: { ...base(), level } });
        setMessages((m) => [
          ...m,
          { id: nextId(), kind: "questao", role: "tutor", question: q, answered: null },
        ]);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "O Tutor IA precisa de internet para funcionar.",
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, question, base],
  );

  const answer = (id: string, index: number) => {
    let correct = false;
    let q: TutorQuestion | null = null;
    setMessages((m) =>
      m.map((msg) => {
        if (msg.id !== id || msg.kind !== "questao" || msg.answered !== null) return msg;
        q = msg.question;
        correct = msg.question.correct_index === index;
        return { ...msg, answered: index };
      }),
    );
    const asked = q as TutorQuestion | null;
    if (!asked) return;
    const point =
      asked.statement.length > 90 ? `${asked.statement.slice(0, 90)}…` : asked.statement;
    setStats((s) => ({
      done: s.done + 1,
      hits: s.hits + (correct ? 1 : 0),
      ok: correct ? [...s.ok, point] : s.ok,
      review: correct ? s.review : [...s.review, point],
    }));
    if (correct) {
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          kind: "texto",
          role: "tutor",
          text: `Muito bem! 🎉 Seu esforço está valendo a pena. ${asked.explanation}`,
        },
      ]);
    } else {
      void runChat(
        "corrigir",
        `Questão: ${asked.statement}\nAlternativas: ${asked.options.join(" | ")}\nResposta do aluno: ${asked.options[index]}\nResposta correta: ${asked.options[asked.correct_index]}`,
      );
    }
  };

  const startTutor = (t: string) => {
    const clean = t.trim();
    if (!clean) return;
    setTopic(clean);
    setMessages([]);
    setStep("tutor");
    setTimeout(() => {
      setBusy(true);
      chat({
        data: {
          year: year ?? 5,
          subject: subject?.name ?? "Geral",
          topic: clean,
          history: [],
          action: "explicar",
        },
      })
        .then((r) => setMessages([{ id: nextId(), kind: "texto", role: "tutor", text: r.text }]))
        .catch((e) =>
          toast.error(
            e instanceof Error ? e.message : "O Tutor IA precisa de internet para funcionar.",
          ),
        )
        .finally(() => setBusy(false));
    }, 0);
  };

  /* ---------------- Telas ---------------- */

  if (step === "inicio") {
    return (
      <Shell>
        <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:py-20">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-primary shadow-neon">
            <Brain className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">
            Show do <span className="text-accent">Saber</span>
            <span className="block text-glow-cyan">Tutor Inteligente com IA</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg font-extrabold leading-snug sm:text-2xl">
            O que você aprendeu na escola, explicado de um jeito que faz sentido para você.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            Revise em casa, tire dúvidas, pratique e acompanhe seu entendimento.
          </p>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                t: "Aprenda",
                d: "Explicações claras e adaptadas ao seu ano escolar.",
              },
              { icon: SquarePen, t: "Pratique", d: "Exercícios personalizados criados pela IA." },
              { icon: TrendingUp, t: "Evolua", d: "Acompanhe seu entendimento durante a sessão." },
            ].map((p) => (
              <div
                key={p.t}
                className="rounded-2xl border border-border bg-card/70 p-4 shadow-card"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                  <p.icon className="h-5 w-5 text-primary" />
                </span>
                <p className="mt-3 font-extrabold">{p.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="mt-8 h-14 w-full max-w-sm bg-gradient-primary text-base font-extrabold text-primary-foreground shadow-neon"
            onClick={() => setStep("ano")}
          >
            <Rocket className="mr-2 h-5 w-5" /> Começar agora
          </Button>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Wifi className="h-3.5 w-3.5" /> O Tutor IA precisa de internet — pode consumir Wi-Fi ou
            dados móveis.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Sem cadastro. Nada do que você estudar é guardado depois que você fecha o aplicativo.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/instalar"
              className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4" /> Instalar no aparelho
            </Link>
            <Link
              to="/sobre"
              className="text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              Sobre o projeto
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Este aplicativo complementa a escola e não substitui o professor.
          </p>
        </div>
      </Shell>
    );
  }

  if (step === "ano") {
    return (
      <Shell>
        <Picker
          title="Em que ano você está?"
          subtitle="Ensino Fundamental"
          onBack={() => setStep("inicio")}
        >
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => {
                  setYear(y);
                  setStep("materia");
                }}
                className="rounded-2xl border border-border bg-card p-4 text-lg font-extrabold shadow-card transition-transform hover:scale-105 hover:border-primary"
              >
                {y}º
              </button>
            ))}
          </div>
        </Picker>
      </Shell>
    );
  }

  if (step === "materia") {
    return (
      <Shell>
        <Picker title="Qual matéria?" subtitle={`${year}º ano`} onBack={() => setStep("ano")}>
          <div className="grid gap-3 sm:grid-cols-2">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSubjectId(s.id);
                  setTopicInput("");
                  setStep("assunto");
                }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-card transition-transform hover:scale-[1.02] hover:border-primary"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span>
                  <span className="block font-extrabold">{s.name}</span>
                  <span className="block text-xs text-muted-foreground">{s.description}</span>
                </span>
              </button>
            ))}
          </div>
        </Picker>
      </Shell>
    );
  }

  if (step === "assunto") {
    const suggestions = subject ? subject.topics.slice(0, 10) : EXAMPLE_TOPICS;
    return (
      <Shell>
        <Picker
          title="O que você quer estudar?"
          subtitle={`${year}º ano · ${subject?.name ?? ""}`}
          onBack={() => setStep("materia")}
        >
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              startTutor(topicInput);
            }}
          >
            <Input
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Digite o assunto. Ex: frações"
              className="h-12 text-base"
            />
            <Button
              type="submit"
              className="h-12 bg-gradient-primary px-5 font-bold text-primary-foreground"
            >
              Ir
            </Button>
          </form>

          <p className="mt-6 text-sm font-bold text-muted-foreground">Sugestões</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((t) => (
              <button
                key={t}
                onClick={() => startTutor(t)}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold transition-colors hover:border-primary hover:text-primary"
              >
                {t}
              </button>
            ))}
          </div>
        </Picker>
      </Shell>
    );
  }

  const pct = stats.done ? Math.round((stats.hits / stats.done) * 100) : 0;

  if (step === "resumo") {
    return (
      <Shell>
        <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h1 className="text-2xl font-extrabold sm:text-3xl">Parabéns pelo seu esforço!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Hoje você aprendeu, praticou e avançou no seu entendimento. Cada dúvida é uma
              oportunidade para aprender.
            </p>

            <div className="mt-6">
              <div className="flex items-end justify-between">
                <p className="text-sm font-extrabold">Meu Entendimento</p>
                <p className="text-2xl font-extrabold text-primary">{pct}%</p>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{understandingMessage(pct)}</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Info label="Assunto estudado" value={topic || "—"} />
              <Info label="Exercícios respondidos" value={String(stats.done)} />
              <Info label="Acertos" value={String(stats.hits)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ListCard
              title="Já compreendido"
              items={stats.ok}
              empty="Pratique mais alguns exercícios para ver aqui."
            />
            <ListCard
              title="Precisa de mais prática"
              items={stats.review}
              empty="Nada pendente por enquanto. Muito bem!"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-gradient-primary font-extrabold text-primary-foreground shadow-neon"
              onClick={() => setStep("tutor")}
            >
              Continuar estudando
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMessages([]);
                setStats({ done: 0, hits: 0, ok: [], review: [] });
                setStep("assunto");
              }}
            >
              Estudar outro assunto
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Nada é guardado: ao atualizar ou fechar o aplicativo, esta sessão é descartada. O Show
            do Saber complementa a escola e não substitui o professor.
          </p>
        </div>
      </Shell>
    );
  }

  /* ---------------- Tutor ---------------- */

  const quick: { label: string; icon: typeof Brain; run: () => void }[] = [
    { label: "Explicar", icon: BookOpen, run: () => runChat("explicar") },
    { label: "Resumir", icon: ListChecks, run: () => runChat("resumir") },
    { label: "Dar dica", icon: Lightbulb, run: () => runChat("dica") },
    { label: "Outro exemplo", icon: Shuffle, run: () => runChat("exemplo") },
    { label: "Novo exercício", icon: SquarePen, run: () => runQuestion("igual") },
    { label: "Mais fácil", icon: TrendingDown, run: () => runQuestion("facil") },
    { label: "Mais difícil", icon: TrendingUp, run: () => runQuestion("dificil") },
  ];

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card/70 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold">
              {subject?.emoji} {topic}
            </p>
            <p className="text-xs text-muted-foreground">
              {year}º ano · {subject?.name}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {stats.done > 0 && (
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                Meu Entendimento: {pct}%
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => setStep("assunto")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Mudar assunto
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStep("resumo")}>
              Encerrar sessão
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {messages.map((m) =>
            m.kind === "texto" ? (
              <div
                key={m.id}
                className={
                  m.role === "tutor"
                    ? "rounded-2xl border border-border bg-card p-4 shadow-card"
                    : "ml-auto max-w-[85%] rounded-2xl bg-secondary p-3 text-sm font-medium"
                }
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">{m.text}</p>
                {m.role === "tutor" && ttsOk && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 px-2 text-xs"
                    onClick={() => (speakingId === m.id ? stop() : speak(m.text, m.id))}
                  >
                    {speakingId === m.id ? (
                      <>
                        <VolumeX className="mr-1 h-4 w-4" /> Parar
                      </>
                    ) : (
                      <>
                        <Volume2 className="mr-1 h-4 w-4" /> Ouvir
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div
                key={m.id}
                className="rounded-2xl border border-primary/40 bg-card p-4 shadow-card"
              >
                <p className="text-sm font-extrabold sm:text-base">{m.question.statement}</p>
                <div className="mt-3 grid gap-2">
                  {m.question.options.map((opt, i) => {
                    const done = m.answered !== null;
                    const isCorrect = i === m.question.correct_index;
                    const chosen = m.answered === i;
                    return (
                      <button
                        key={i}
                        disabled={done || busy}
                        onClick={() => answer(m.id, i)}
                        className={[
                          "flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                          done && isCorrect
                            ? "border-success bg-success/15 font-bold"
                            : done && chosen
                              ? "border-destructive bg-destructive/15"
                              : "border-border bg-secondary/40 hover:border-primary",
                        ].join(" ")}
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-background text-xs font-extrabold">
                          {done && isCorrect ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            String.fromCharCode(65 + i)
                          )}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {m.answered !== null && ttsOk && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 px-2 text-xs"
                    onClick={() =>
                      speakingId === m.id
                        ? stop()
                        : speak(`${m.question.statement}. ${m.question.explanation}`, m.id)
                    }
                  >
                    <Volume2 className="mr-1 h-4 w-4" /> Ouvir
                  </Button>
                )}
              </div>
            ),
          )}

          {busy && (
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> O tutor está pensando…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="sticky bottom-0 mt-4 space-y-2 bg-background/90 py-3 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quick.map((q) => (
              <Button
                key={q.label}
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={q.run}
                className="shrink-0 font-bold"
              >
                <q.icon className="mr-1 h-4 w-4" /> {q.label}
              </Button>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const t = ask.trim();
              if (!t || busy) return;
              setAsk("");
              setMessages((m) => [...m, { id: nextId(), kind: "texto", role: "aluno", text: t }]);
              void runChat("pergunta", t);
            }}
          >
            <Input
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              placeholder="Fazer uma pergunta ao tutor…"
              className="h-12 text-base"
            />
            <Button
              type="submit"
              disabled={busy}
              className="h-12 bg-gradient-primary px-4 text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground">
            O tutor é um apoio para os estudos e pode errar. O uso consome internet (Wi-Fi ou dados
            móveis).
          </p>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <AppHeader />
      {children}
    </div>
  );
}

function Picker({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-extrabold">{value}</p>
    </div>
  );
}

function ListCard({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card/70 p-5">
      <p className="font-extrabold">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {items.map((s, i) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
