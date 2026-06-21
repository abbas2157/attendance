import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import companyLogo from '../assets/company-logo.png'
import styles from './Login.module.css'

function getLoginErrorMessage(err) {
  const status = err?.response?.status
  const detail = String(
    err?.response?.data?.detail
    || err?.response?.data?.message
    || ''
  ).trim()
  const normalized = detail.toLowerCase()

  if (status === 400 || status === 401) {
    if (
      !detail
      || normalized.includes('invalid')
      || normalized.includes('incorrect')
      || normalized.includes('credential')
      || normalized.includes('password')
      || normalized.includes('username')
      || normalized.includes('no active account')
    ) {
      return 'Incorrect username or password. Please try again.'
    }
  }

  if (!err?.response) {
    return 'Unable to reach the server. Please check your internet connection and try again.'
  }

  if (status >= 500) {
    return 'The server is not responding properly right now. Please try again in a moment.'
  }

  return detail || 'Unable to sign in right now. Please try again.'
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  )
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4 20 20" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M6.7 6.8A16.2 16.2 0 0 0 2.5 12s3.6 6 9.5 6a9.8 9.8 0 0 0 4.4-1" />
      <path d="M14.8 6.4A9.7 9.7 0 0 1 21.5 12s-1.1 1.9-3.2 3.8" />
    </svg>
  )
}

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async e => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password')
      return
    }

    setError('')
    setLoading(true)

    try {
      await login(username.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getLoginErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.bgGlowOne} aria-hidden />
      <div className={styles.bgGlowTwo} aria-hidden />

      <div className={styles.formSide}>
        <div className={`${styles.card} ${loading ? styles.cardLoading : ''}`}>
          {loading && (
            <div className={styles.loadingBar} aria-hidden>
              <span />
            </div>
          )}

          <div className={styles.cardAccent} aria-hidden />

          <div className={styles.logoWrap}>
            <img
              src={companyLogo}
              alt="Bunny's company logo"
              className={styles.companyLogo}
            />
          </div>

          <div className={styles.header}>
            <span className={styles.eyebrow}>BMS HR Portal</span>
            <h1 className={styles.title}>Sign In</h1>
            <p className={styles.subtitle}>Use your HR credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>Username</label>
              <div className={styles.inputShell}>
                <span className={styles.inputIcon}>
                  <UserIcon />
                </span>
                <input
                  id="username"
                  type="text"
                  className={styles.input}
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputShell}>
                <span className={styles.inputIcon}>
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.btnSpinner} />
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {loading && (
              <div className={styles.loadingMessage} aria-live="polite">
                <span className={styles.loadingPulse} />
                Signing you in securely...
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
