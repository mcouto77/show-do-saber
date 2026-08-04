import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Download,
  Smartphone,
  Monitor,
  Share,
  PlusSquare,
  CheckCircle2,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/instalar")({
  head: () => ({
    meta: [
      { title: "Instalar o Show do Saber no seu aparelho" },
      {
        name: "description",
        content:
          "Passo a passo para instalar o Show do Saber como aplicativo no celular Android, no iPhone ou no computador e estudar com um toque.",
      },
      { property: "og:title", content: "Instale o Show do Saber no seu celular" },
      {
        property: "og:description",
        content: "Instale em segundos e tenha sua tutora de estudos na tela inicial do aparelho.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InstallPage,
});

function InstallPage() {
  const { available, installed, platform, install } = useInstallPrompt();

  const handleInstall = async () => {
    const r = await install();
    if (r === "unavailable") {
      toast.info("Use o passo a passo abaixo para instalar no seu aparelho.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <header className="rounded-3xl border border-border bg-card/80 p-6 text-center shadow-card backdrop-blur sm:p-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary shadow-neon">
            <Download className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Instale o Show do Saber</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Instalando, o app fica na tela inicial do aparelho, abre em tela cheia e carrega mais
            rápido — sem loja de aplicativos.
          </p>

          {installed ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-success/40 bg-success/10 px-4 py-3 text-sm font-extrabold text-success">
              <CheckCircle2 className="h-4 w-4" /> App já instalado neste aparelho!
            </p>
          ) : (
            <Button
              onClick={handleInstall}
              disabled={!available}
              className="mt-5 w-full bg-gradient-primary font-extrabold text-primary-foreground shadow-neon sm:w-auto sm:px-8"
            >
              <Download className="mr-2 h-4 w-4" />
              {available ? "Instalar agora" : "Siga o passo a passo abaixo"}
            </Button>
          )}
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            highlight={platform === "android"}
            icon={<Smartphone className="h-4 w-4" />}
            title="Android (Chrome)"
            steps={[
              "Abra o app no Chrome",
              "Toque no menu ⋮ no canto superior direito",
              'Escolha "Instalar aplicativo" ou "Adicionar à tela inicial"',
              "Confirme em Instalar",
            ]}
            extraIcon={<MoreVertical className="h-4 w-4" />}
          />
          <Card
            highlight={platform === "ios"}
            icon={<Share className="h-4 w-4" />}
            title="iPhone / iPad (Safari)"
            steps={[
              "Abra o app no Safari",
              "Toque no botão Compartilhar (quadrado com seta)",
              'Role e escolha "Adicionar à Tela de Início"',
              "Toque em Adicionar",
            ]}
            extraIcon={<PlusSquare className="h-4 w-4" />}
          />
          <Card
            highlight={platform === "desktop"}
            icon={<Monitor className="h-4 w-4" />}
            title="Computador (Chrome / Edge)"
            steps={[
              "Abra o app no navegador",
              "Clique no ícone de instalar na barra de endereço",
              'Ou use o menu ⋮ → "Instalar Show do Saber"',
              "Confirme em Instalar",
            ]}
          />
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5">
            <p className="font-extrabold text-primary">Depois de instalar</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>• Abre direto pelo ícone, sem digitar endereço</li>
              <li>• Funciona em tela cheia, como um app comum</li>
              <li>• Sem login e sem cadastro: é só escolher o assunto e estudar</li>
              <li>• O tutor precisa de internet (Wi-Fi ou dados móveis)</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
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

function Card({
  icon,
  title,
  steps,
  highlight,
  extraIcon,
}: {
  icon: React.ReactNode;
  title: string;
  steps: string[];
  highlight?: boolean;
  extraIcon?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 backdrop-blur ${highlight ? "border-accent/50 bg-accent/5" : "border-border bg-card/70"}`}
    >
      <p className="flex items-center gap-2 font-extrabold">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-secondary">
          {icon}
        </span>
        <span className="min-w-0 truncate">{title}</span>
        {highlight && (
          <span className="ml-auto shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-extrabold text-accent">
            SEU APARELHO
          </span>
        )}
      </p>
      <ol className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-extrabold text-primary">{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      {extraIcon && <div className="mt-3 text-muted-foreground">{extraIcon}</div>}
    </div>
  );
}
