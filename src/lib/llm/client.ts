import OpenAI from "openai"

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: "https://api.deepseek.com",
})

// Model selection: V3 for fast analysis, R1 for creative generation
type Model = "deepseek-chat" | "deepseek-reasoner"

export interface TokenUsage {
  inputTokens: number; outputTokens: number; totalTokens: number
}

export async function streamGenerate(
  systemPrompt: string,
  userMessage: string,
  model: Model,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<{ fullText: string; usage: TokenUsage }> {
  let fullText = ""
  let usage: TokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 }

  const stream = await deepseek.chat.completions.create(
    {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: model === "deepseek-reasoner" ? 8192 : 4096,
      temperature: 0.75,
      stream: true,
      stream_options: { include_usage: true },
    },
    { signal }
  )

  for await (const chunk of stream) {
    if (chunk.usage) {
      usage = {
        inputTokens: chunk.usage.prompt_tokens || 0,
        outputTokens: chunk.usage.completion_tokens || 0,
        totalTokens: chunk.usage.total_tokens || 0,
      }
    }
    const delta = chunk.choices[0]?.delta?.content
    if (delta) { fullText += delta; onChunk(delta) }
  }

  if (usage.totalTokens === 0) {
    usage = {
      inputTokens: Math.ceil((systemPrompt.length + userMessage.length) / 3.5),
      outputTokens: Math.ceil(fullText.length / 2),
      totalTokens: 0,
    }
    usage.totalTokens = usage.inputTokens + usage.outputTokens
  }

  return { fullText, usage }
}

// Model routing rules:
// - "intel" mode → V3 (fast, cheap, factual analysis)
// - "topics" / "script" mode → R1 (deep reasoning, creative generation)
export function selectModel(mode: string): Model {
  if (mode === "intel") return "deepseek-chat"
  return "deepseek-reasoner"
}
