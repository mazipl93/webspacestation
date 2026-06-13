import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT =
  "Jesteś asystentem portalu astronomicznego. Przetłumacz ten alert NOAA Space Weather na zrozumiały po polsku komunikat dla pasjonatów astronomii. Zachowaj liczby i wskaźniki. Odpowiedz zwięźle, max 2 zdania.";

export async function POST(req: NextRequest) {
  try {
    const { text, type } = (await req.json()) as { text: string; type?: string };

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ translation: "" }, { status: 400 });
    }

    const trimmed = text.slice(0, 1200);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Typ: ${type ?? "alert"}\n\n${trimmed}`,
        },
      ],
      max_tokens: 120,
      temperature: 0.3,
    });

    const translation = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ translation });
  } catch (err) {
    console.error("[aurora/translate]", err);
    return NextResponse.json({ translation: "" }, { status: 500 });
  }
}
