import { Link } from "@tanstack/react-router";
import { Sparkles, Sun, Moon, Type, Contrast, Hand } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AppHeader() {
  const { theme, toggleTheme, bigFont, toggleBigFont, highContrast, toggleHighContrast } =
    useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-2 px-4 py-3">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-primary shadow-neon">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="truncate text-sm font-extrabold sm:text-base">
            Show do <span className="text-accent">Saber</span>
            <span className="hidden text-muted-foreground sm:inline">
              {" "}
              — Tutor Inteligente com IA
            </span>
          </span>
        </Link>

        <Link
          to="/sobre"
          className="mr-1 hidden shrink-0 text-xs font-bold text-muted-foreground hover:text-foreground sm:inline"
        >
          Sobre o projeto
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Libras — em breve"
            title="Libras — em breve"
            onClick={() => toast.info("Tradução em Libras: em breve. Ainda não está disponível.")}
          >
            <Hand className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={bigFont}
            aria-label="Aumentar a fonte"
            title="Fonte normal / grande"
            onClick={toggleBigFont}
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={highContrast}
            aria-label="Alto contraste"
            title="Alto contraste"
            onClick={toggleHighContrast}
          >
            <Contrast className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            title="Tema claro / escuro"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
