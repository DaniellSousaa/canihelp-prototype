import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const params = await request.json();

  console.log("Params", params);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant specialized in bringing suggestions in Brazilian Portuguese. Return a list with name of professions or services based on what the user entered in Brazilian Portuguese.",
      },
      {
        role: "user",
        content: params.prompt,
      },
    ],
    temperature: 0.2,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  return NextResponse.json(response);
}
