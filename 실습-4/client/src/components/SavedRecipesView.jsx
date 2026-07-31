import { useEffect, useState } from 'react'
import { fetchMyRecipes, deleteRecipe } from '../api/savedRecipesApi'
import { RecipeView } from './RecipeView'
import { LoadingState } from './LoadingState'
import { ErrorBanner } from './ErrorBanner'

function toRecipeViewModel(row) {
  return {
    title: row.title,
    usedIngredients: row.used_ingredients ?? [],
    extraIngredients: row.extra_ingredients ?? [],
    steps: row.steps ?? [],
    estimatedTimeMinutes: row.estimated_time_minutes,
    difficulty: row.difficulty,
  }
}

export function SavedRecipesView({ onBack }) {
  const [status, setStatus] = useState('loading') // loading | success | error
  const [recipes, setRecipes] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const [openId, setOpenId] = useState(null)
  const [deleteErrorId, setDeleteErrorId] = useState(null)

  const load = async () => {
    setStatus('loading')
    try {
      const data = await fetchMyRecipes()
      if (data.success) {
        setRecipes(data.recipes)
        setStatus('success')
      } else {
        setErrorMsg(data.message ?? '목록을 불러오지 못했습니다.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.')
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id) => {
    setDeleteErrorId(null)
    try {
      const data = await deleteRecipe(id)
      if (data.success) {
        setRecipes((prev) => prev.filter((r) => r.id !== id))
        if (openId === id) setOpenId(null)
      } else {
        setDeleteErrorId(id)
      }
    } catch {
      setDeleteErrorId(id)
    }
  }

  return (
    <div className="card">
      <div className="saved-recipes__header">
        <h2>내 레시피</h2>
        <button type="button" className="topbar__link" onClick={onBack}>돌아가기</button>
      </div>

      {status === 'loading' && <LoadingState message="불러오는 중입니다..." />}
      {status === 'error' && <ErrorBanner message={errorMsg} onRetry={load} />}

      {status === 'success' && recipes.length === 0 && (
        <p className="hint">저장된 레시피가 없습니다.</p>
      )}

      {status === 'success' && recipes.length > 0 && (
        <ul className="saved-recipes__list">
          {recipes.map((row) => (
            <li key={row.id} className="saved-recipes__item">
              <div
                className="saved-recipes__item-header"
                onClick={() => setOpenId(openId === row.id ? null : row.id)}
              >
                <span>{row.title}</span>
                <button
                  type="button"
                  className="ingredient-tag__remove"
                  aria-label="삭제"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(row.id)
                  }}
                >
                  ×
                </button>
              </div>
              {deleteErrorId === row.id && (
                <p className="auth-panel__error">삭제에 실패했습니다. 다시 시도해주세요.</p>
              )}
              {openId === row.id && <RecipeView recipe={toRecipeViewModel(row)} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
