import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { setAdminToken, setAdminRole as setSessionRole, setAccountInfo as setSessionAccountInfo } from '../../lib/adminSession'
import { Button, Input } from '../../components/FormInput'
import { getTeamByRole, TEAM_ROLES } from '../../lib/data'
import { createSessionHash, storeSession } from '../../lib/security'
import { isClerkEnabled } from '../../lib/clerk'

const TEMP_ACCESS_CODE = 'dev-only-change-in-production'

// Safe Clerk hook wrapper — returns stubs when Clerk is not configured
function useClerkAuth() {
  if (!isClerkEnabled) {
    return { signIn: null, signInLoaded: false, user: null, isSignedIn: false, signOut: () => {} }
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { useSignIn, useUser, useClerk } = require('@clerk/nextjs')
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user, isSignedIn } = useUser()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { signOut } = useClerk()
  return { signIn, signInLoaded, user, isSignedIn, signOut }
}

export default function AdminLogin() {
  const [loginMode, setLoginMode] = useState('key')
  const [key, setKey] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showTempInput, setShowTempInput] = useState(false)
  const [tempCode, setTempCode] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const { loginAdmin, tempLoginAdmin, isAdmin, setAccountInfo } = useApp()
  const { signIn, signInLoaded, user, isSignedIn, signOut } = useClerkAuth()

  // Handle Clerk Google sign-in callback
  const handleClerkSession = useCallback(async () => {
    if (!isClerkEnabled || !isSignedIn || !user) return

    setGoogleLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/clerk-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName || user.firstName,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        await signOut()
        setError(data.error || 'Google sign-in failed')
        setGoogleLoading(false)
        return
      }

      // Store session token and role (same as password login)
      setAdminToken(data.sessionToken)
      setSessionRole(data.role)

      if (data.account) {
        const acct = {
          id: data.account.id,
          username: data.account.username,
          displayName: data.account.display_name,
          teamRole: data.account.team_role,
          avatarColor: data.account.avatar_color,
          bio: data.account.bio,
        }
        setAccountInfo(acct)
        setSessionAccountInfo(acct)
      }

      const session = createSessionHash(data.sessionToken)
      storeSession(session)

      const team = getTeamByRole(data.role)
      setLoginSuccess(team)

      setTimeout(() => {
        window.location.href = '/admin'
      }, 800)
    } catch {
      await signOut()
      setError('Google sign-in failed. Check your connection.')
      setGoogleLoading(false)
    }
  }, [isSignedIn, user, signOut, setAccountInfo])

  useEffect(() => {
    handleClerkSession()
  }, [handleClerkSession])

  const handleGoogleSignIn = async () => {
    if (!signInLoaded || !signIn) return
    setError('')
    setGoogleLoading(true)

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/admin/login',
        redirectUrlComplete: '/admin/login',
      })
    } catch {
      setError('Could not start Google sign-in')
      setGoogleLoading(false)
    }
  }

  if (isAdmin) {
    router.push('/admin')
    return null
  }

  const handleKeyLogin = async (e) => {
    e.preventDefault()
    setError('')
    const result = await loginAdmin(key)
    if (result.success) {
      const team = getTeamByRole(result.role)
      setLoginSuccess(team)
      // If no account exists yet, redirect to register
      if (!result.hasAccount) {
        setTimeout(() => router.push('/admin/register'), 800)
      } else {
        setTimeout(() => router.push('/admin'), 800)
      }
    } else {
      setError(result.error || 'Invalid admin key')
    }
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Username and password are required')
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Store session token and role
      setAdminToken(data.sessionToken)
      setSessionRole(data.role)

      // Store account info
      if (data.account) {
        const acct = {
          id: data.account.id,
          username: data.account.username,
          displayName: data.account.display_name,
          teamRole: data.account.team_role,
          avatarColor: data.account.avatar_color,
          bio: data.account.bio,
        }
        setAccountInfo(acct)
        setSessionAccountInfo(acct)
      }

      // Create session
      const session = createSessionHash(data.sessionToken)
      storeSession(session)

      const team = getTeamByRole(data.role)
      setLoginSuccess(team)

      // Force page reload to reinitialize store with new session
      setTimeout(() => {
        window.location.href = '/admin'
      }, 800)
    } catch {
      setError('Login failed. Check your connection.')
    }
  }

  const handleTempAccess = () => {
    if (!showTempInput) {
      setShowTempInput(true)
      setError('')
      return
    }
    setError('')
    if (tempCode === TEMP_ACCESS_CODE) {
      const result = tempLoginAdmin()
      const team = getTeamByRole(result.role || TEAM_ROLES.LEADS)
      setLoginSuccess(team)
      setTimeout(() => router.push('/admin'), 800)
    } else {
      setError('Invalid temp access code')
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login | Project Bold</title>
      </Head>

      <style jsx>{`
        @supports (-webkit-touch-callout: none) {
          .login-input input {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div className="min-h-screen min-h-[100dvh] bg-gray-100 flex items-center justify-center p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="bg-white rounded-lg shadow-lg p-5 sm:p-8 max-w-md w-full">
          {loginSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: loginSuccess.color + '20' }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: loginSuccess.color }} />
              </div>
              <h2 className="text-xl font-bold text-[#13294B] mb-2">Welcome</h2>
              <p className="text-lg font-semibold" style={{ color: loginSuccess.color }}>{loginSuccess.name}</p>
              <p className="text-gray-500 text-sm mt-2">Redirecting...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-[#13294B]">Admin Login</h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">Access the Project Bold dashboard</p>
              </div>

              {/* Google Sign-In (only shown when Clerk is configured) */}
              {isClerkEnabled && (
                <>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || !signInLoaded}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition text-sm font-medium text-gray-700 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    {googleLoading ? 'Signing in...' : 'Sign in with Google'}
                  </button>

                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-400">or use</span>
                    </div>
                  </div>
                </>
              )}

              {/* Login Mode Toggle */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => { setLoginMode('key'); setError('') }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${loginMode === 'key' ? 'bg-white shadow text-[#13294B]' : 'text-gray-500'}`}
                >
                  Admin Key
                </button>
                <button
                  onClick={() => { setLoginMode('password'); setError('') }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${loginMode === 'password' ? 'bg-white shadow text-[#13294B]' : 'text-gray-500'}`}
                >
                  Username & Password
                </button>
              </div>

              {loginMode === 'key' ? (
                <form onSubmit={handleKeyLogin} className="space-y-4">
                  <div className="login-input">
                    <Input
                      label="Admin Key"
                      type="password"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder="Enter your team key"
                      required
                    />
                  </div>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <Button type="submit" className="w-full py-3">
                    Login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="login-input">
                    <Input
                      label="Username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                      required
                    />
                  </div>
                  <div className="login-input">
                    <Input
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      required
                    />
                  </div>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <Button type="submit" className="w-full py-3">
                    Login
                  </Button>
                </form>
              )}

              <div className="mt-4 border-t pt-4">
                <p className="text-gray-500 text-xs text-center mb-2">Or use temporary access</p>
                {showTempInput && (
                  <div className="login-input">
                    <Input
                      label="Temp Access Code"
                      type="password"
                      value={tempCode}
                      onChange={(e) => setTempCode(e.target.value)}
                      placeholder="Enter temp code"
                    />
                  </div>
                )}
                <Button
                  variant="secondary"
                  onClick={handleTempAccess}
                  className="w-full mt-2 py-3"
                >
                  Temp Access
                </Button>
              </div>

              <div className="mt-6 text-center">
                <Link href="/" className="text-[#4B9CD3] text-sm hover:underline active:opacity-70">
                  Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
