import { useEffect, useState } from 'react'
import { ImageUploader } from './components/ImageUploader'
import { IngredientEditor } from './components/IngredientEditor'
import { RecipeView } from './components/RecipeView'
import { LoadingState } from './components/LoadingState'
import { ErrorBanner } from './components/ErrorBanner'
import { TopBar } from './components/TopBar'
import { AuthPanel } from './components/AuthPanel'
import { SavedRecipesView } from './components/SavedRecipesView'
import { analyzeImage } from './api/visionApi'
import { generateRecipe } from './api/recipeApi'
import { saveRecipe } from './api/savedRecipesApi'
import { authFetch } from './api/authFetch'
import { supabase } from './lib/supabaseClient'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [view, setView] = useState('main') // main | myRecipes
  const [showAuth, setShowAuth] = useState(false)

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [visionStatus, setVisionStatus] = useState('idle') // idle | loading | success | error
  const [ingredients, setIngredients] = useState([])
  const [imageUrl, setImageUrl] = useState(null)
  const [visionErrorMsg, setVisionErrorMsg] = useState('')

  const [recipeStatus, setRecipeStatus] = useState('idle') // idle | loading | success | unparsed | error
  const [recipe, setRecipe] = useState(null)
  const [recipeRawText, setRecipeRawText] = useState('')
  const [recipeErrorMsg, setRecipeErrorMsg] = useState('')

  const [saveStatus, setSaveStatus] = useState('idle') // idle | loading | done | error
  const [saveErrorMsg, setSaveErrorMsg] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (!newSession) {
        setProfile(null)
        setView('main')
      }
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    authFetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProfile(data.profile)
      })
  }, [session])

  const resetRecipeState = () => {
    setRecipeStatus('idle')
    setRecipe(null)
    setRecipeRawText('')
    setRecipeErrorMsg('')
    setSaveStatus('idle')
    setSaveErrorMsg('')
  }

  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setVisionStatus('idle')
    setImageUrl(null)
    resetRecipeState()
  }

  const handleValidationError = (message) => {
    setVisionErrorMsg(message)
    setVisionStatus('error')
  }

  const handleAnalyze = async () => {
    if (!file) return
    setVisionStatus('loading')
    resetRecipeState()
    try {
      const data = await analyzeImage(file)
      if (data.success) {
        setIngredients(data.ingredients)
        setImageUrl(data.imageUrl ?? null)
        setVisionStatus('success')
      } else {
        setVisionErrorMsg(data.message ?? '분석에 실패했습니다.')
        setVisionStatus('error')
      }
    } catch {
      setVisionErrorMsg('네트워크 오류가 발생했습니다.')
      setVisionStatus('error')
    }
  }

  const handleRemoveIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddIngredient = (value) => {
    setIngredients((prev) => [...prev, value])
  }

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) return
    setRecipeStatus('loading')
    setRecipeErrorMsg('')
    setSaveStatus('idle')
    try {
      const data = await generateRecipe(ingredients)
      if (!data.success) {
        setRecipeErrorMsg(data.message ?? '레시피 생성에 실패했습니다.')
        setRecipeStatus('error')
      } else if (data.recipe) {
        setRecipe(data.recipe)
        setRecipeStatus('success')
      } else {
        setRecipeRawText(data.rawText ?? '')
        setRecipeStatus('unparsed')
      }
    } catch {
      setRecipeErrorMsg('네트워크 오류가 발생했습니다.')
      setRecipeStatus('error')
    }
  }

  const handleSaveRecipe = async () => {
    if (!recipe) return
    if (!session) {
      setShowAuth(true)
      return
    }
    setSaveStatus('loading')
    try {
      const data = await saveRecipe(recipe, imageUrl)
      setSaveStatus(data.success ? 'done' : 'error')
      if (!data.success) setSaveErrorMsg(data.message ?? '저장에 실패했습니다.')
    } catch {
      setSaveStatus('error')
      setSaveErrorMsg('네트워크 오류가 발생했습니다.')
    }
  }

  return (
    <div className="app">
      <TopBar
        session={session}
        profile={profile}
        view={view}
        onShowAuth={() => setShowAuth(true)}
        onShowMyRecipes={() => setView('myRecipes')}
        onShowMain={() => setView('main')}
      />

      <h1>냉장고 재료 인식 &amp; 레시피 추천</h1>
      <p className="subtitle">냉장고 사진을 업로드하면 재료를 인식하고, 그 재료로 만들 수 있는 레시피를 추천해드려요.</p>

      {!session ? (
        <AuthPanel onClose={() => setShowAuth(false)} />
      ) : view === 'myRecipes' ? (
        <SavedRecipesView key={session?.user?.id ?? 'anon'} onBack={() => setView('main')} />
      ) : (
        <div className="card">
          <ImageUploader
            previewUrl={previewUrl}
            onFileSelected={handleFileSelected}
            onValidationError={handleValidationError}
          />

          <button
            className="button"
            disabled={!file || visionStatus === 'loading'}
            onClick={handleAnalyze}
          >
            재료 분석하기
          </button>

          {visionStatus === 'loading' && <LoadingState message="재료를 분석하고 있습니다..." />}
          {visionStatus === 'error' && <ErrorBanner message={visionErrorMsg} onRetry={handleAnalyze} />}

          {visionStatus === 'success' && (
            <div className="section">
              <h2>인식된 재료</h2>
              <p className="hint">잘못 인식된 재료는 삭제하고, 빠진 재료는 추가해주세요.</p>
              <IngredientEditor
                items={ingredients}
                onRemove={handleRemoveIngredient}
                onAdd={handleAddIngredient}
              />

              <button
                className="button"
                disabled={ingredients.length === 0 || recipeStatus === 'loading'}
                onClick={handleGenerateRecipe}
              >
                레시피 추천받기
              </button>

              {recipeStatus === 'loading' && <LoadingState message="레시피를 만들고 있습니다..." />}
              {recipeStatus === 'error' && (
                <ErrorBanner message={recipeErrorMsg} onRetry={handleGenerateRecipe} />
              )}
              {recipeStatus === 'unparsed' && (
                <div className="recipe-fallback">
                  <p className="hint">레시피 형식을 해석하지 못해 원문을 표시합니다.</p>
                  <pre>{recipeRawText}</pre>
                </div>
              )}
              {recipeStatus === 'success' && recipe && (
                <>
                  <RecipeView recipe={recipe} />
                  <button
                    className="button"
                    onClick={handleSaveRecipe}
                    disabled={saveStatus === 'loading' || saveStatus === 'done'}
                  >
                    {saveStatus === 'done' ? '저장 완료' : '레시피 저장하기'}
                  </button>
                  {saveStatus === 'error' && <ErrorBanner message={saveErrorMsg} onRetry={handleSaveRecipe} />}
                  {!session && saveStatus === 'idle' && (
                    <p className="hint">저장하려면 먼저 로그인해주세요.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
