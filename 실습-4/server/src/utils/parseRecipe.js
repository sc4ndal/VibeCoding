function tryParseObject(candidate) {
  if (!candidate) return null;
  try {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // 다음 후보로 재시도
  }
  return null;
}

export function parseRecipe(rawText) {
  const candidates = [
    rawText,
    rawText.replace(/```json|```/g, '').trim(),
    rawText.match(/\{[\s\S]*\}/)?.[0],
  ];

  for (const candidate of candidates) {
    const parsed = tryParseObject(candidate);
    if (!parsed) continue;

    const { title, usedIngredients, extraIngredients, steps, estimatedTimeMinutes, difficulty } = parsed;
    if (typeof title !== 'string' || !Array.isArray(steps)) continue;

    const clampedDifficulty = Number.isFinite(difficulty)
      ? Math.min(5, Math.max(1, Math.round(difficulty)))
      : null;

    return {
      title,
      usedIngredients: Array.isArray(usedIngredients) ? usedIngredients.map(String) : [],
      extraIngredients: Array.isArray(extraIngredients) ? extraIngredients.map(String) : [],
      steps: steps.map(String),
      estimatedTimeMinutes: Number.isFinite(estimatedTimeMinutes) ? estimatedTimeMinutes : null,
      difficulty: clampedDifficulty,
    };
  }

  return null;
}
