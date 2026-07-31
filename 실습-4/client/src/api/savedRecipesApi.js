import { authFetch } from './authFetch'

export async function saveRecipe(recipe, sourceImageUrl) {
  const res = await authFetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...recipe, sourceImageUrl }),
  })
  return res.json()
}

export async function fetchMyRecipes() {
  const res = await authFetch('/api/recipes')
  return res.json()
}

export async function deleteRecipe(id) {
  const res = await authFetch(`/api/recipes/${id}`, { method: 'DELETE' })
  return res.json()
}
