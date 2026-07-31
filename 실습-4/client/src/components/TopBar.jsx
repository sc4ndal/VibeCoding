import { supabase } from '../lib/supabaseClient'

export function TopBar({ session, profile, onShowAuth, onShowMyRecipes, onShowMain, view }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="topbar">
      <button type="button" className="topbar__brand" onClick={onShowMain}>
        냉장고 레시피
      </button>

      <div className="topbar__actions">
        {session ? (
          <>
            <span className="topbar__nickname">{profile?.nickname ?? session.user.email}님</span>
            <button
              type="button"
              className="topbar__link"
              onClick={onShowMyRecipes}
              disabled={view === 'myRecipes'}
            >
              내 레시피
            </button>
            <button type="button" className="topbar__link" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <button type="button" className="topbar__link" onClick={onShowAuth}>
            로그인
          </button>
        )}
      </div>
    </div>
  )
}
