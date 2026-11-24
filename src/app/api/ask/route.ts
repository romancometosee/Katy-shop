import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/lib/db";
import { catalogForAi, getAiKey, systemPrompt } from "@/lib/ai";

// «Спросить Katy»: принимает переписку, отвечает потоком текста.
// Без ключа отвечает 503 { noKey: true }, и окно чата показывает обычный поиск.

type Msg = { role: "user" | "assistant"; text: string };

export async function GET() {
  return Response.json({ enabled: Boolean(await getAiKey()) });
}

export async function POST(req: Request) {
  const key = await getAiKey();
  if (!key) return Response.json({ noKey: true }, { status: 503 });

  let body: { messages?: Msg[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  // защита от слишком длинных переписок
  const history = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.text === "string" && m.text.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.text.slice(0, 2000) }));
  while (history.length && history[0].role !== "user") history.shift();
  if (!history.length || history[history.length - 1].role !== "user") {
    return Response.json({ error: "no question" }, { status: 400 });
  }

  const db = await getDb();
  const conversation = history.map((m) => m.content).join(" ");
  const client = new Anthropic({ apiKey: key });

  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: systemPrompt(db) },
      { type: "text", text: `Каталог магазина (метка, бренд, название, раздел, объёмы и цены):\n${catalogForAi(db, conversation)}`, cache_control: { type: "ephemeral" } },
    ],
    messages: history,
  });

  const enc = new TextEncoder();
  const out = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(enc.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(enc.encode("\n\nК сожалению, с этим вопросом я помочь не могу. Спросите меня о косметике или парфюмерии."));
        }
      } catch (e) {
        console.error("ask error", e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e);
        const msg =
          e instanceof Anthropic.RateLimitError
            ? "Сейчас много вопросов, попробуйте через минуту."
            : e instanceof Anthropic.AuthenticationError
              ? "Консультант временно недоступен."
              : "Не получилось ответить. Попробуйте ещё раз.";
        controller.enqueue(enc.encode(`\n\n${msg}`));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(out, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
