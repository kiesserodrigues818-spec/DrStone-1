import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateMedicalQuiz(topic: string): Promise<QuizQuestion[]> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere 5 perguntas de quiz médico de alta qualidade sobre: ${topic}. 
    As perguntas devem ser adequadas para estudantes de medicina.
    Responda em português.
    Retorne a resposta no formato JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "A pergunta em português" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Exatamente 4 opções em português"
            },
            correctAnswer: { 
              type: Type.INTEGER,
              description: "Índice da opção correta (0-3)"
            },
            explanation: { type: Type.STRING, description: "Explicação detalhada em português" }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse quiz response", e);
    return [];
  }
}

export async function generateStudyContent(topic: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Escreva um resumo de estudo conciso e de alto rendimento para estudantes de medicina sobre: ${topic}. 
    Foque em apresentação clínica, diagnóstico e manejo. 
    Use formatação Markdown com títulos claros e tópicos.
    Escreva tudo em português.`,
  });

  return response.text || "Nenhum conteúdo gerado.";
}
