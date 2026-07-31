import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function AuthPanel({ onClose }) {
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error | signupDone
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const action =
      mode === 'login'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })

    const { error } = await action

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
      return
    }

    if (mode === 'signup') {
      setStatus('signupDone')
    } else {
      onClose()
    }
  }

  return (
    <div className="auth-panel">
      <div className="auth-panel__tabs">
        <button
          type="button"
          className={mode === 'login' ? 'auth-panel__tab auth-panel__tab--active' : 'auth-panel__tab'}
          onClick={() => setMode('login')}
        >
          로그인
        </button>
        <button
          type="button"
          className={mode === 'signup' ? 'auth-panel__tab auth-panel__tab--active' : 'auth-panel__tab'}
          onClick={() => setMode('signup')}
        >
          회원가입
        </button>
      </div>

      {status === 'signupDone' ? (
        <p className="hint">가입이 완료되었습니다. 이메일 인증이 필요할 수 있으니 메일함을 확인해주세요.</p>
      ) : (
        <form onSubmit={handleSubmit} className="auth-panel__form">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button className="button" type="submit" disabled={status === 'loading'}>
            {mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      )}

      {status === 'error' && <p className="auth-panel__error">{errorMsg}</p>}
    </div>
  )
}
