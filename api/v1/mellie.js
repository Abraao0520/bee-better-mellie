import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const brainPath = path.join(process.cwd(), "mellie-brain.json");
    const brain = JSON.parse(fs.readFileSync(brainPath, "utf8"));

    if (req.method !== "POST") {
      return res.status(200).json({
        message: "Mellie API funcionando!",
        instructions: "Envie uma requisição POST com { message: '...' }"
      });
    }

    const { message } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: brain.systemPrompt },
        { role: "user", content: message }
      ]
    });

    res.status(200).json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({ error: "Erro interno: " + error.message });
  }
}
