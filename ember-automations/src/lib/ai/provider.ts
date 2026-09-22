import Anthropic from "@anthropic-ai/sdk";
import { type ZodType } from "zod";
import type { AiProvider } from "@/lib/spine/types";

interface TextResponse {
  content: Array<{ type: string; text?: string }>;
}

function stripJsonFence(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7).trimStart();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3).trimStart();
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3).trimEnd();
  }

  return cleaned;
}

function parseWith<T>(schema: ZodType<T>, text: string): T {
  const parsed: unknown = JSON.parse(stripJsonFence(text));
  return schema.parse(parsed);
}

function textFromResponse(response: TextResponse): string {
  const block = response.content.find((b) => b.type === "text");

  if (!block || typeof block.text !== "string") {
    throw new Error("AI response contained no text");
  }

  return block.text;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function aiClient(provider: AiProvider): { client: Anthropic; model: string } {
  if (provider === "deepseek") {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error(`${provider} API key is not configured`);
    }

    return {
      client: new Anthropic({
        apiKey,
        baseURL: "https://api.deepseek.com/anthropic",
      }),
      model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-pro",
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(`${provider} API key is not configured`);
  }

  return {
    client: new Anthropic({ apiKey }),
    model: "claude-opus-5",
  };
}

export async function completeJson<T>(
  provider: AiProvider,
  schema: ZodType<T>,
  system: string,
  user: string,
): Promise<T> {
  const { client, model } = aiClient(provider);

  const send = (userMessage: string) =>
    client.messages.create({
      model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: userMessage }],
    });

  const firstResponse = await send(user);

  try {
    return parseWith(schema, textFromResponse(firstResponse));
  } catch (firstError) {
    const firstMessage = getErrorMessage(firstError);
    const retryUser = `${user}\n\nYour previous reply was not valid: ${firstMessage}. Reply with JSON only.`;

    const secondResponse = await send(retryUser);

    try {
      return parseWith(schema, textFromResponse(secondResponse));
    } catch (secondError) {
      const secondMessage = getErrorMessage(secondError);
      throw new Error(`AI returned invalid JSON after retry: ${secondMessage}`);
    }
  }
}

