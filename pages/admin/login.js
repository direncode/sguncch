import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { setAdminToken, setAdminRole as setSessionRole, setAccountInfo as setSessionAccountInfo } from '../../lib/adminSession'
import { Button, Input } from '../../components/FormInput'
import { getTeamByRole, TEAM_ROLES } from '../../lib/data'
import { createSessionHash, storeSession } from '../../lib/security'

const TEMP_ACCESS_CODE = 'dev-only-change-in-production'

export default function AdminLogin() {
  const [loginMode, setLoginMode] = useState('key') // 'key' or 'password'
  const [key, setKey] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showTempInput, setShowTempInput] = useState(false)
  const [tempCode, setTempCode] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(null)
  const router = useRouter()
  const { loginAdmin, tempLoginAdmin, isAdmin, setAccountInfo } = useApp()

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
