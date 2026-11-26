import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/lib/db";
import { catalogForAi, getAiProvider, systemPrompt, type AiProvider } from "@/lib/ai";

// «Спросить Katy»: принимает переписку, отвечает потоком текста.
// Без ключа отвечает 503 { noKey: true }, и окно чата показывает обычный поиск.

type Msg = { role: "user" | "assistant"; text: string };
type Turn = { role: "user" | "assistant"; content: string };

export async function GET() {
  const p = await getAiProvider();
  return Response.json({ enabled: Boolean(p), provider: p?.kind ?? null });
}

// Не больше 40 вопросов за 10 минут с одного адреса: каждый ответ нейросети стоит денег
const hits = new Map<string, number[]>();
function tooMany(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 40;
}

export async function POST(req: Request) {
  const provider = await getAiProvider();
  if (!provider) return Response.json({ noKey: true }, { status: 503 });
  if (tooMany(req)) return Response.json({ error: "Слишком много вопросов подряд. Передохните пару минут и спросите снова." }, { status: 429 });

  let body: { messages?: Msg[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  // защита от слишком длинных переписок
  const history: Turn[] = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.text === "string" && m.text.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.text.slice(0, 2000) }));
  while (history.length && history[0].role !== "user") history.shift();
  if (!history.length || history[history.length - 1].role !== "user") {
    return Response.json({ error: "no question" }, { status: 400 });
  }

  const db = await getDb();
  const system = systemPrompt(db);
  // YandexGPT принимает меньший объём текста, поэтому ему даём меньше товаров
  const catalog = `Каталог магазина (метка, бренд, название, раздел, объёмы и цены):\n${catalogForAi(db, history.map((m) => m.content).join(" "), provider.kind === "yandex" ? 120 : 250)}`;

  const enc = new TextEncoder();
  const out = new ReadableStream({
    async start(controller) {
      const write = (t: string) => controller.enqueue(enc.encode(t));
      try {
        if (provider.kind === "yandex") await askYandex(provider, system, catalog, history, write);
        else await askClaude(provider.apiKey, system, catalog, history, write);
      } catch (e) {
        console.error("ask error", e instanceof Error ? e.message : e);
        write(`\n\n${e instanceof BusyError ? "Сейчас много вопросов, попробуйте через минуту." : "Не получилось ответить. Попробуйте ещё раз."}`);
      } finally {
        controller.close();
      }
    },
  });
  return new Response(out, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

class BusyError extends Error {}

/** YandexGPT (Yandex AI Studio), потоковый ответ: каждая строка — JSON с уже накопленным текстом */
async function askYandex(p: Extract<AiProvider, { kind: "yandex" }>, system: string, catalog: string, history: Turn[], write: (t: string) => void) {
  const res = await fetch(process.env.YANDEX_GPT_URL || "https://ai.api.cloud.yandex.net/foundationModels/v1/completion", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Api-Key ${p.apiKey}`, "x-folder-id": p.folderId },
    body: JSON.stringify({
      modelUri: `gpt://${p.folderId}/${p.model}`,
      completionOptions: { stream: true, temperature: 0.3, maxTokens: "1500" },
      messages: [{ role: "system", text: `${system}\n\n${catalog}` }, ...history.map((m) => ({ role: m.role, text: m.content }))],
    }),
  });
  if (res.status === 429) throw new BusyError();
  if (!res.ok || !res.body) throw new Error(`yandex ${res.status} ${(await res.text().catch(() => "")).slice(0, 300)}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let sent = "";
  const handle = (line: string) => {
    if (!line.trim()) return;
    const obj = JSON.parse(line);
    if (obj.error) throw new Error(`yandex ${JSON.stringify(obj.error).slice(0, 300)}`);
    const alt = (obj.result ?? obj).alternatives?.[0];
    const text: string | undefined = alt?.message?.text;
    if (typeof text !== "string") return;
    if (text.startsWith(sent)) write(text.slice(sent.length));
    else write(text);
    sent = text;
  };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf("\n")) >= 0) {
      handle(buf.slice(0, i));
      buf = buf.slice(i + 1);
    }
  }
  handle(buf);
}

/** Claude (Anthropic) — на случай, если когда-нибудь добавят ключ ANTHROPIC_API_KEY */
async function askClaude(apiKey: string, system: string, catalog: string, history: Turn[], write: (t: string) => void) {
  const client = new Anthropic({ apiKey });
  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: system },
      { type: "text", text: catalog, cache_control: { type: "ephemeral" } },
    ],
    messages: history,
  });
  try {
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") write(event.delta.text);
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") write("\n\nК сожалению, с этим вопросом я помочь не могу. Спросите меня о косметике или парфюмерии.");
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) throw new BusyError();
    throw e;
  }
}
