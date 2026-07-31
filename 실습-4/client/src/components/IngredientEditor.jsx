import { useState } from 'react'

export function IngredientEditor({ items, onRemove, onAdd }) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const value = input.trim()
    if (!value) return
    onAdd(value)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="ingredient-editor">
      <div className="ingredient-list">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="ingredient-tag ingredient-tag--editable">
            {item}
            <button
              type="button"
              className="ingredient-tag__remove"
              aria-label={`${item} 삭제`}
              onClick={() => onRemove(index)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="ingredient-editor__add">
        <input
          type="text"
          value={input}
          placeholder="재료 직접 추가"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" onClick={handleAdd}>추가</button>
      </div>
    </div>
  )
}
