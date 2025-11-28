import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    // caminho do brain
    const filePath = path.join(process.cwd(), "mellie-brain.json");

    // leitura do JSON
    const rawData = fs.readFileSync(filePath, "utf8");
    const brain = JSON.parse(rawData);

    // tomar dados da requisição
    const { mood, time, limitation } = req.body || {};

    if (!mood || !time) {
      return res.status(400).json({
        error: "Você precisa enviar 'mood' e 'time' no body."
      });
    }

    // estado → modifier
    const state = brain.states[mood] || brain.states["neutro"];
    let modifier = state.modifier;

    // aplicar limitações se houver
    if (limitation && brain.limitations_rules.force_modes[limitation]) {
      modifier = "restrito";
    }

    // sugestões baseadas no modifier
    const train = brain.suggestions.train[brain.mapping[modifier].train];
    const food = brain.suggestions.food[brain.mapping[modifier].food];
    const habit = brain.suggestions.habit[brain.mapping[modifier].habit];

    // razão da recomendação
    let reason = brain.reasons.default
      .replace("{mood}", mood)
      .replace("{time}", time);

    if (limitation === "com_dor") reason = brain.reasons.pain;
    if (limitation === "sem_tempo") reason = brain.reasons.no_time;

    // resposta final
    return res.status(200).json({
      status: "ok",
      mood,
      time,
      limitation: limitation || null,
      modifier,
      suggestions: {
        train,
        food,
        habit
      },
      reason
    });

  } catch (err) {
    console.error("ERRO NA API:", err);
    return res.status(500).json({
      error: "Erro interno na Mellie API",
      details: err.message
    });
  }
}
