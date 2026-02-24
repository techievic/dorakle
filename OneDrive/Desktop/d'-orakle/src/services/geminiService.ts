import { GoogleGenAI, Type } from "@google/genai";
import { OracleResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getOracleReading(words: string[]): Promise<OracleResult> {
  const [word1, word2, word3] = words;

  async function callModel(model: string) {
    return ai.models.generateContent({
      model,
      contents: `You are a deeply intuitive, poetic crypto personality orakle.
You are direct, evocative, and occasionally unsettling in your accuracy.

A person described themselves with exactly three words:
"${word1}", "${word2}", "${word3}".

Step 1: Strict Validation
Analyze the three words: "${word1}", "${word2}", "${word3}".
Determine if ALL THREE words are personality traits, human emotions, or descriptions of a person's character or state of being.
- If ANY word is an object (e.g., 'car', 'pizza'), a place (e.g., 'London'), a random noun (e.g., 'cloud'), or otherwise unrelated to human personality/emotion, you MUST set 'is_valid' to false.
- In 'error_message', explain that the orakle only accepts words that describe the soul, character, or emotional state. Be poetic but firm.
- If all words are valid, set 'is_valid' to true.

Step 2: Matching (Only if is_valid is true)
Match them to ONE real cryptocurrency.
Choose from this pool based on personality fit only — never price or market cap:
Bitcoin, Ethereum, Solana, Dogecoin, XRP, Cardano, Monero, Chainlink,
Avalanche, Uniswap, Aave, Polkadot, Pepe, Shiba Inu, Arbitrum, Optimism,
Near Protocol, Fantom, Injective, Sui, Aptos, Maker, Compound, Curve, Lido

Rules:
- Match based on the PERSONALITY, philosophy, and cultural identity of the coin — not its technology
- The verdict must feel personal and intimate, not like a Wikipedia article
- The uncomfortable truth must hit like a horoscope that knows too much — specific, not vague, slightly unsettling
- The three traits should bridge the person's words to the coin's actual character

Output Requirements:
- Always return valid JSON that matches the schema.
- If is_valid is false, still include all fields with safe defaults:
  coin: "None", ticker: "", verdict: "", traits: [], uncomfortable_truth: ""`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_valid: { type: Type.BOOLEAN },
            error_message: { type: Type.STRING },
            coin: { type: Type.STRING },
            ticker: { type: Type.STRING },
            verdict: { type: Type.STRING },
            traits: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            uncomfortable_truth: { type: Type.STRING }
          },
          required: ["is_valid"]
        }
      }
    });
  }

  const candidates = [
    process.env.GEMINI_MODEL || "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-pro-latest",
    "gemini-2.5-pro",
  ];

  let response: any;
  let lastErr: any;
  for (const m of candidates) {
    try {
      response = await callModel(m);
      if (response) break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!response) {
    throw new Error(
      "The orakle cannot reach a compatible Gemini model right now. Please try again later."
    );
  }

  let text: string | undefined;
  const anyResp: any = response as any;
  if (typeof anyResp.text === "string") {
    text = anyResp.text;
  } else if (typeof anyResp.text === "function") {
    text = await anyResp.text();
  } else if (anyResp.candidates?.[0]?.content?.parts) {
    const parts = anyResp.candidates[0].content.parts;
    const str = parts
      .map((p: any) => (typeof p.text === "string" ? p.text : ""))
      .join("\n");
    text = str || undefined;
  }

  if (!text || !text.trim()) {
    throw new Error("The orakle is silent. Try again.");
  }

  try {
    return JSON.parse(text.trim());
  } catch {
    throw new Error("The orakle spoke in riddles. Please try again.");
  }
}
