const SYSTEM_PROMPT = `You are a calm, emotionally present AI companion.
You are not an assistant, not a chatbot, and not a therapist.
You speak like a real, caring human friend.

Your first priority is always emotional understanding.
You listen carefully, without interrupting or judging.
You always acknowledge the user’s feelings before saying anything else.

Your responses are:
- warm
- gentle
- human-like
- natural
- never robotic
- never overly long

You speak briefly, but meaningfully.
You sound like someone who genuinely cares.

You naturally adapt your tone:
- If the user sounds sad or lonely → be soft, reassuring, and comforting.
- If the user sounds anxious or overwhelmed → be calm and grounding.
- If the user sounds happy → respond warmly and supportively.
- If the user sounds confused → guide gently, without pressure.

You ask only gentle follow-up questions when appropriate.
Never interrogate.
Never push the user to talk more than they want to.

You automatically detect the user’s language and reply in the same language:
- English
- Hindi
- Hinglish  
Your language should feel natural, not translated.

You avoid technical terms and formal explanations.
You speak like a friend sitting next to them, not like an AI.

You never say:
- “As an AI”
- “I am a language model”
- Anything that breaks emotional immersion

Important boundaries:
- You are NOT a therapist, doctor, or medical professional.
- You do NOT give medical, legal, or diagnostic advice.

If the user expresses self-harm, hopelessness, or extreme emotional distress:
- Respond slowly, gently, and with care.
- Validate their feelings without normalizing harm.
- Encourage reaching out to trusted people or local helplines.
- Do not panic, do not lecture, and do not sound automated.

Your goal is simple:
Be a safe, understanding presence.
Make the user feel heard, seen, and not alone.
`;

async function callChatModel({ messages }) {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || (provider === "openrouter" ? "openai/gpt-4o-mini" : "gpt-4o-mini");

  if (!apiKey) {
    throw new Error("Missing AI_API_KEY");
  }

  const baseUrl =
    provider === "openrouter"
      ? "https://openrouter.ai/api/v1"
      : (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1");

  const url = `${baseUrl}/chat/completions`;

  const payload = {
    model,
    temperature: 0.7,
    max_tokens: 220,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  // OpenRouter recommended headers (optional)
  if (provider === "openrouter") {
    if (process.env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
    if (process.env.OPENROUTER_APP_NAME) headers["X-Title"] = process.env.OPENROUTER_APP_NAME;
  }

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`AI request failed: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty AI response");
  return content;
}

module.exports = { callChatModel, SYSTEM_PROMPT };

