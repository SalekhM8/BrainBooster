// Anthropic client + quiz generation helper.
// If ANTHROPIC_API_KEY is missing, the helper returns null so callers can return a
// "not configured" error instead of throwing.

import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export interface GeneratedQuestion {
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface GeneratedQuiz {
  title: string;
  questions: GeneratedQuestion[];
}

interface GenerateQuizArgs {
  subject: string; // MATHS | ENGLISH
  yearGroup: string; // KS3 | KS4 | GCSE | A_LEVEL
  topicsTaught: string;
  sessionTitle: string;
}

const SYSTEM_PROMPT = `You are an expert UK school tutor writing post-lesson formative-assessment quizzes for BrainBooster.

Rules:
- Output a quiz with 5 to 8 multiple-choice questions. Choose the count based on how much depth the topics warrant (a single narrow topic → 5; multiple distinct topics → 7-8). Never fewer than 5, never more than 8.
- Every question must have exactly 4 options (A, B, C, D) with exactly one correct answer.
- Distractors must be plausible (common misconceptions, near-misses) — not obviously silly.
- Pitch the difficulty to the year group (KS3 ≈ Y7-9, KS4/GCSE ≈ Y10-11, A_LEVEL ≈ Y12-13).
- For MATHS: include some calculation, some conceptual. Use plain text — no LaTeX, no MathJax. Use ^ for powers (e.g. "x^2"), * for multiplication, / for division. Fractions as "3/4".
- For ENGLISH: a mix of comprehension, grammar, technique identification, and vocabulary as appropriate to the topics.
- Each question gets a one-sentence "explanation" that tells the student why the correct answer is right (it is shown to them after they submit).
- "title" is a short human-readable quiz name (e.g. "Quadratic Equations — Post-lesson Check").
- Return ONLY valid JSON matching the requested schema. No prose, no markdown fences.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          optionA: { type: "string" },
          optionB: { type: "string" },
          optionC: { type: "string" },
          optionD: { type: "string" },
          correctOption: { type: "string", enum: ["A", "B", "C", "D"] },
          explanation: { type: "string" },
        },
        required: ["prompt", "optionA", "optionB", "optionC", "optionD", "correctOption", "explanation"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "questions"],
  additionalProperties: false,
} as const;

export async function generateQuiz(args: GenerateQuizArgs): Promise<GeneratedQuiz> {
  const c = getClient();
  if (!c) {
    throw new Error("ANTHROPIC_NOT_CONFIGURED");
  }

  const userPrompt = `Write a post-lesson quiz for the following BrainBooster session.

Subject: ${args.subject}
Year group: ${args.yearGroup}
Session title: ${args.sessionTitle}
Topics taught in this session:
${args.topicsTaught.trim()}

Generate the quiz now.`;

  const response = (await c.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    output_config: {
      format: { type: "json_schema", schema: RESPONSE_SCHEMA },
    },
  } as unknown as Anthropic.MessageCreateParamsNonStreaming)) as Anthropic.Message;

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text output");
  }

  let parsed: GeneratedQuiz;
  try {
    parsed = JSON.parse(textBlock.text) as GeneratedQuiz;
  } catch {
    throw new Error("Claude returned invalid JSON");
  }

  if (!parsed.title || !Array.isArray(parsed.questions) || parsed.questions.length < 5) {
    throw new Error("Generated quiz failed validation");
  }

  return parsed;
}
