export function parseIngredients(rawText) {
  const candidates = [
    rawText,
    rawText.replace(/```json|```/g, '').trim(),
    rawText.match(/\[[\s\S]*\]/)?.[0],
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // 다음 후보로 재시도
    }
  }

  return null;
}
