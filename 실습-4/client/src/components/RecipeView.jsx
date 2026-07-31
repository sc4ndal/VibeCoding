function DifficultyStars({ difficulty }) {
  return (
    <div className="recipe-view__stars" aria-label={`난이도 ${difficulty} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= difficulty ? 'star star--filled' : 'star'}>★</span>
      ))}
    </div>
  )
}

export function RecipeView({ recipe }) {
  return (
    <div className="recipe-view">
      <h2>{recipe.title}</h2>
      {recipe.difficulty != null && <DifficultyStars difficulty={recipe.difficulty} />}
      {recipe.estimatedTimeMinutes != null && (
        <p className="recipe-view__time">예상 조리 시간: 약 {recipe.estimatedTimeMinutes}분</p>
      )}

      {recipe.usedIngredients.length > 0 && (
        <div className="recipe-view__section">
          <h3>사용 재료</h3>
          <div className="ingredient-list">
            {recipe.usedIngredients.map((item, index) => (
              <span key={`${item}-${index}`} className="ingredient-tag">{item}</span>
            ))}
          </div>
        </div>
      )}

      {recipe.extraIngredients.length > 0 && (
        <div className="recipe-view__section">
          <h3>추가로 필요한 재료</h3>
          <div className="ingredient-list">
            {recipe.extraIngredients.map((item, index) => (
              <span key={`${item}-${index}`} className="ingredient-tag ingredient-tag--extra">{item}</span>
            ))}
          </div>
        </div>
      )}

      <div className="recipe-view__section">
        <h3>조리 순서</h3>
        <ol className="recipe-view__steps">
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
