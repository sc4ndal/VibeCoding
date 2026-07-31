export async function generateRecipe(ingredients) {
  const res = await fetch('/api/recipe/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients }),
  });

  return res.json();
}
