export type Subject = {
  id: string;
  name: string;
  emoji: string;
  color: string; // tailwind classes for gradient
  description: string;
};

export type SubjectWithTopics = Subject & { topics: string[] };

export const SUBJECTS: SubjectWithTopics[] = [
  {
    id: "matematica",
    name: "Matemática",
    emoji: "🔢",
    color: "from-[--neon-cyan] to-[--neon-violet]",
    description: "Números, contas e raciocínio",
    topics: [
      "Frações",
      "Números decimais",
      "Operações básicas",
      "Porcentagem",
      "Geometria",
      "Equações",
      "Multiplicação",
      "Divisão",
      "Medidas e grandezas",
      "Problemas",
    ],
  },
  {
    id: "portugues",
    name: "Português",
    emoji: "📚",
    color: "from-[--neon-pink] to-[--neon-violet]",
    description: "Leitura, gramática e interpretação",
    topics: [
      "Interpretação de texto",
      "Substantivos",
      "Adjetivos",
      "Verbos",
      "Pronomes",
      "Ortografia",
      "Acentuação",
      "Pontuação",
      "Sinônimos e antônimos",
      "Concordância",
    ],
  },
  {
    id: "ciencias",
    name: "Ciências",
    emoji: "🔬",
    color: "from-[--neon-lime] to-[--neon-cyan]",
    description: "Natureza, corpo humano e experimentos",
    topics: [
      "Corpo humano",
      "Animais",
      "Plantas",
      "Sistema solar",
      "Água",
      "Ecossistemas",
      "Estados da matéria",
      "Alimentação saudável",
      "Cadeia alimentar",
      "Energia",
    ],
  },
  {
    id: "historia",
    name: "História",
    emoji: "🏛️",
    color: "from-amber-400 to-orange-500",
    description: "Brasil e o mundo",
    topics: [
      "Descobrimento do Brasil",
      "Povos indígenas",
      "Escravidão",
      "Independência",
      "República",
      "Era Vargas",
      "Ditadura militar",
      "Idade Média",
      "Egito Antigo",
      "Revolução Industrial",
    ],
  },
  {
    id: "geografia",
    name: "Geografia",
    emoji: "🌎",
    color: "from-emerald-400 to-cyan-500",
    description: "Lugares, mapas e cultura",
    topics: [
      "Regiões do Brasil",
      "Estados e capitais",
      "Continentes",
      "Relevo",
      "Clima",
      "Hidrografia",
      "População",
      "Coordenadas geográficas",
      "Meio ambiente",
      "Urbanização",
    ],
  },
  {
    id: "ingles",
    name: "Inglês",
    emoji: "🇬🇧",
    color: "from-blue-400 to-indigo-500",
    description: "Vocabulary and grammar",
    topics: [
      "Verb to be",
      "Present simple",
      "Past simple",
      "Colors",
      "Numbers",
      "Family",
      "Food",
      "Animals",
      "Prepositions",
      "Pronouns",
    ],
  },
  {
    id: "artes",
    name: "Artes",
    emoji: "🎨",
    color: "from-fuchsia-400 to-rose-500",
    description: "Cores, formas e expressão",
    topics: [
      "Cores primárias",
      "Cores secundárias",
      "Formas geométricas",
      "Pintores famosos",
      "Música",
      "Dança",
      "Teatro",
      "Folclore brasileiro",
      "Artesanato",
      "Escultura",
    ],
  },
];

export const SUBJECT_BY_ID = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));

export const YEARS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type YearLevel = (typeof YEARS)[number];

export const AVATARS = ["🦊", "🐼", "🦁", "🐯", "🐸", "🦉", "🐱", "🐶", "🦄", "🐵", "🐰", "🐢"];
