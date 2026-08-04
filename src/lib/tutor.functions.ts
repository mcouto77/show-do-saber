import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(6000),
});

const BaseSchema = z.object({
  year: z.number().int().min(1).max(9),
  subject: z.string().min(1).max(40),
  topic: z.string().min(1).max(120),
  history: z.array(MessageSchema).max(20).default([]),
});

const ChatInput = BaseSchema.extend({
  action: z.enum(["explicar", "resumir", "dica", "exemplo", "corrigir", "pergunta"]),
  message: z.string().max(1000).optional(),
});

const QuestionInput = BaseSchema.extend({
  level: z.enum(["igual", "facil", "dificil"]).default("igual"),
});

export type TutorQuestion = {
  statement: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

function systemPrompt(year: number, subject: string, topic: string) {
  return [
    "Você é o Tutor Inteligente do Show do Saber: um tutor de estudos brasileiro, paciente, acolhedor e didático.",
    `O aluno está no ${year}º ano do Ensino Fundamental. Matéria: ${subject}. Assunto: ${topic}.`,
    "Regras:",
    "- Responda SEMPRE em português do Brasil.",
    `- Adapte linguagem, vocabulário, exemplos e dificuldade ao ${year}º ano.`,
    "- Explique passo a passo, com frases curtas, usando exemplos do cotidiano do aluno.",
    "- Reconheça o esforço do aluno, não apenas o acerto.",
    "- Nunca humilhe, ridicularize ou use tom punitivo. Não fale em nota, prova ou avaliação.",
    '- Quando houver erro, comece de forma acolhedora, por exemplo: "Você chegou perto. Vamos entender juntos este ponto."',
    "- Ao corrigir, explique por que a alternativa escolhida estava errada, mostre o caminho certo, ofereça outro exemplo e convide para uma nova tentativa.",
    "- Em matemática, mostre a resolução organizada em etapas numeradas.",
    "- Em português e humanas, seja claro e objetivo.",
    "- Deixe claro, quando fizer sentido, que este aplicativo complementa a escola e não substitui o professor.",
    "- Não invente fontes, referências ou alinhamento oficial a documentos como a BNCC.",
    "- Evite qualquer conteúdo inadequado para crianças e adolescentes.",
    "- Use TEXTO PURO: nada de markdown, asteriscos, ##, tabelas ou HTML. Listas apenas com hífen.",
    "- Seja breve: no máximo 200 palavras, a não ser que o aluno peça mais.",
  ].join("\n");
}

const ACTION_PROMPTS: Record<string, string> = {
  explicar: "Explique o assunto do zero, passo a passo, com um exemplo do dia a dia no final.",
  resumir: "Faça um resumo curto do assunto em até 6 tópicos, com as ideias mais importantes.",
  dica: "Dê uma dica curta e prática para resolver questões desse assunto, sem entregar a resposta.",
  exemplo: "Mostre outro exemplo resolvido, diferente dos anteriores, explicando cada etapa.",
  corrigir:
    'O aluno errou a questão abaixo. Comece com uma frase acolhedora como "Você chegou perto. Vamos entender juntos este ponto.", reconheça o esforço, explique de forma simples por que a alternativa escolhida está errada, mostre o caminho correto, dê outro exemplo e convide para uma nova tentativa.',
  pergunta: "Responda à dúvida do aluno abaixo.",
};

function friendlyError(status: number) {
  if (status === 429)
    return "Muitas perguntas ao mesmo tempo. Espere alguns segundos e tente de novo.";
  if (status === 402)
    return "O Tutor IA está temporariamente indisponível (limite de uso atingido).";
  return "O Tutor IA não conseguiu responder agora. Tente novamente em instantes.";
}

async function callAI(body: Record<string, unknown>) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new Error("O Tutor IA ainda não está configurado neste aparelho (chave de IA ausente).");
  }

  let res: Response;
  try {
    res = await fetch(AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, ...body }),
    });
  } catch {
    throw new Error("O Tutor IA precisa de internet para funcionar.");
  }

  if (!res.ok) {
    console.error("AI gateway error", res.status, await res.text().catch(() => ""));
    throw new Error(friendlyError(res.status));
  }
  return res.json();
}

export const tutorChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const instruction = ACTION_PROMPTS[data.action] ?? ACTION_PROMPTS["pergunta"];
    const userContent = data.message ? `${instruction}\n\n"${data.message}"` : instruction;

    const json = await callAI({
      messages: [
        { role: "system", content: systemPrompt(data.year, data.subject, data.topic) },
        ...data.history,
        { role: "user", content: userContent },
      ],
    });

    const text = json?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("O Tutor IA não conseguiu responder agora. Tente novamente.");
    }
    return { text: text.trim() };
  });

export const tutorQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QuestionInput.parse(input))
  .handler(async ({ data }): Promise<TutorQuestion> => {
    const levelLine =
      data.level === "facil"
        ? "A questão deve ser mais FÁCIL que as anteriores."
        : data.level === "dificil"
          ? "A questão deve ser um pouco mais DIFÍCIL que as anteriores."
          : "A questão deve ter dificuldade parecida com as anteriores, mas ser diferente delas.";

    const json = await callAI({
      messages: [
        { role: "system", content: systemPrompt(data.year, data.subject, data.topic) },
        ...data.history,
        {
          role: "user",
          content: `Crie 1 questão de múltipla escolha sobre o assunto, com exatamente 4 alternativas curtas, o índice da alternativa correta (0 a 3) e uma explicação didática da resposta. ${levelLine} Não repita questões já usadas nesta conversa.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "criar_questao",
            description: "Cria uma questão de múltipla escolha para o aluno",
            parameters: {
              type: "object",
              properties: {
                statement: { type: "string" },
                options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                correct_index: { type: "integer", minimum: 0, maximum: 3 },
                explanation: { type: "string" },
              },
              required: ["statement", "options", "correct_index", "explanation"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "criar_questao" } },
    });

    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("O Tutor IA não conseguiu criar a questão. Tente novamente.");

    const parsed = z
      .object({
        statement: z.string().min(3),
        options: z.array(z.string().min(1)).length(4),
        correct_index: z.number().int().min(0).max(3),
        explanation: z.string().min(3),
      })
      .parse(JSON.parse(call.function.arguments));

    return parsed;
  });
