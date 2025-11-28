export default async function handler(req, res) {
  try {
    // 1. pega o mood, tempo e limitações do usuário
    const { mood, time, limit } = req.query;

    if (!process.env.MELLIE_BRAIN_URL) {
      return res.status(500).json({ error: "MELLIE_BRAIN_URL não configurada" });
    }

    // 2. baixa o JSON de regras
    const brainRes = await fetch(process.env.MELLIE_BRAIN_URL);
    if (!brainRes.ok) {
      return res.status(500).json({
        error: "Erro ao carregar Mellie Brain",
        status: brainRes.status
      });
    }

    const brain = await brainRes.json();

    // 3. determina o modificador
    const moodData = brain.states[mood];
    const modifier = moodData?.modifier || "leve";

    // 4. se tiver limitação, força restrição
    let finalModifier = modifier;

    if (limit && brain.limitations_rules.force_modes[limit]) {
      finalModifier = "restrito";
    }

    // 5. obtém sugestões
    const train = brain.suggestions.train[brain.mapping[finalModifier].train];
    const food = brain.suggestions.food[brain.mapping[finalModifier].food];
    const habit = brain.suggestions.habit[brain.mapping[finalModifier].habit];

    // 6. motivo
    let reason = brain.reasons.default
      .replace("{mood}", mood)
      .replace("{time}", time || "?");

    if (limit === "com_dor") reason = brain.reasons.pain;
    if (limit === "sem_tempo") reason = brain.reasons.no_time;

    // 7. resposta final
    res.status(200).json({
      mood,
      time,
      limit,
      modifier: finalModifier,
      suggestions: {
        train,
        food,
        habit
      },
      reason
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "erro interno", details: err.message });
  }
}
