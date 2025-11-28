import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  try {
    const filePath = path.join(process.cwd(), "meelie-brain.json");
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    return res.status(200).json({
      message: "Mellie API operando.",
      brain: jsonData,
    });
  } catch (error) {
    console.error("Erro:", error);
    return res.status(500).json({ error: "Falha ao carregar Mellie Brain." });
  }
}
