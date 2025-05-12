import { NextResponse } from "next/server";
import { getLLM } from "@/lib/langchainModels";

export async function POST(req: Request) {
  try {
    const { companyName, characteristics, model } = await req.json();

    const llm = getLLM(model);

    const prompt = `
      Generate 3 customer personas for a company called "${companyName}".
      The company is focused on: ${characteristics}.
      Each persona must include:
      - name
      - age
      - gender
      - location
      - job title
      - interests
      - one challenge with the company's product or service

      Respond ONLY with a valid JSON array. Do not explain anything.
    `;

    const result = await llm.invoke(prompt);
    const output = typeof result === "string"
      ? result
      : typeof result?.content === "string"
      ? result.content
      : "";

    console.log("Raw model output:", output);

    const cleaned = output.trim().replace(/^```(?:json)?\n?/, "").replace(/```$/, "");

    const personas = JSON.parse(cleaned);
    return NextResponse.json({ personas });
  } catch (err) {
    console.error("Uggghhh... Persona generation failed:", err);
    return NextResponse.json({ error: "Persona generation failed" }, { status: 500 });
  }
}
