import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useApp } from '../lib/store'
import { setAdminToken, setAdminRole as setSessionRole, setAccountInfo as setSessionAccountInfo } from '../lib/adminSession'
import { Button, Input } from '../components/FormInput'
import { getTeamByRole, TEAM_ROLES } from '../lib/data'
import { createSessionHash, storeSession } from '../lib/security'

const TEMP_ACCESS_CODE = 'dev-only-change-in-production'
const AVATAR_COLORS = ['#4B9CD3', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#EC4899']

const KEY_TYPES = [
  {
    id: 'admin',
    title: 'Admin Key',
    description: 'Full superadmin access for Project Bold leads. Controls all platform settings, policies, and team management.',
    color: '#4B9CD3',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    id: 'team',
    title: 'Team Key',
    description: 'Role-based access for Outreach, Communications, and Strategy teams. Each team has its own unique key.',
    color: '#F59E0B',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    id: 'temp',
    title: 'Temp Key',
    description: 'Temporary access for demos, onboarding, and development. Limited session with leads-level permissions.',
    color: '#10B981',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function SignUp() {
  const router = useRouter()
  const { loginAdmin, tempLoginAdmin, isAdmin, adminRole, accountInfo, setAccountInfo } = useApp()

  // Step: 'keys' (initial) -> 'authenticate' -> 'register'
  const [step, setStep] = useState('keys')
  const [authMethod, setAuthMethod] = useState('key') // 'key', 'password', 'temp'

  // Auth state
  const [key, setKey] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [tempCode, setTempCode] = useState('')
  const [error, setError] = useState('')
  const [authenticatedRole, setAuthenticatedRole] = useState(null)

  // Register state
  const [regUsername, setRegUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarColor, setAvatarColor] = useState('#4B9CD3')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // If already fully logged in with account, go to admin
  if (isAdmin && accountInfo) {
    if (typeof window !== 'undefined') router.push('/admin')
    return null
  }

  // If logged in but no account, jump to register step
  if (isAdmin && !accountInfo && step === 'keys') {
    // Don't redirect, let them register on this page
  }

  const handleKeyLogin = async (e) => {
    e.preventDefault()
    setError('')
    const result = await loginAdmin(key)
    if (result.success) {
      const team = getTeamByRole(result.role)
      setAuthenticatedRole(team)
      if (result.hasAccount) {
        // Already has account, go to admin
        setTimeout(() => router.push('/admin'), 800)
      } else {
        setStep('register')
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

      setTimeout(() => {
        window.location.href = '/admin'
      }, 800)
    } catch {
      setError('Login failed. Check your connection.')
    }
  }

  const handleTempAccess = (e) => {
    e.preventDefault()
    setError('')
    if (tempCode === TEMP_ACCESS_CODE) {
      const result = tempLoginAdmin()
      const team = getTeamByRole(result.role || TEAM_ROLES.LEADS)
      setAuthenticatedRole(team)
      setStep('register')
    } else {
      setError('Invalid temp access code')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (regUsername.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(regUsername)) {
      setError('Username can only contain letters, numbers, underscores, dots, and hyphens')
      return
    }

    setLoading(true)
    try {
      const { getAuthHeaders } = await import('../lib/adminSession')
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username: regUsername, displayName, password: regPassword, avatarColor }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      setAccountInfo({
        id: data.account.id,
        username: data.account.username,
        displayName: data.account.display_name,
        teamRole: data.account.team_role,
        avatarColor: data.account.avatar_color,
        bio: data.account.bio || '',
      })

      setSuccess(true)
      setTimeout(() => router.push('/admin'), 1200)
    } catch {
      setError('Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Sign Up | Project Bold</title>
      </Head>

      <div className="min-h-screen pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Join Project Bold
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get access to the admin dashboard. Choose your key type below to get started.
            </p>
          </div>

          {/* Key Type Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {KEY_TYPES.map((keyType) => (
              <div
                key={keyType.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: keyType.color + '15', color: keyType.color }}
                >
                  {keyType.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{keyType.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{keyType.description}</p>
              </div>
            ))}
          </div>

          {/* Auth + Registration Form */}
          <div className="max-w-md mx-auto">
            {success ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: avatarColor + '20' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Account Created</h2>
                <p className="text-gray-400">Welcome, {displayName}!</p>
                <p className="text-gray-500 text-sm mt-2">Redirecting to dashboard...</p>
              </div>
            ) : step === 'register' ? (
              /* Registration Form */
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white">Create Your Account</h2>
                  <p className="text-gray-400 mt-2 text-sm">Set up a username and password for quick access</p>
                  {authenticatedRole && (
                    <div
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: authenticatedRole.color + '15', color: authenticatedRole.color }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: authenticatedRole.color }} />
                      {authenticatedRole.name}
                    </div>
                  )}
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <Input
                    label="Username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    placeholder="e.g. john.doe"
                    required
                    maxLength={30}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Input
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    maxLength={50}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />

                  {/* Avatar Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Avatar Color</label>
                    <div className="flex gap-3">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setAvatarColor(color)}
                          className="w-8 h-8 rounded-full border-2 transition-all"
                          style={{
                            backgroundColor: color,
                            borderColor: avatarColor === color ? '#fff' : 'transparent',
                            transform: avatarColor === color ? 'scale(1.15)' : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <Button type="submit" className="w-full py-3" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push('/admin')}
                    className="text-[#4B9CD3] text-sm hover:underline"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            ) : (
              /* Authentication Step */
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white">Authenticate</h2>
                  <p className="text-gray-400 mt-2 text-sm">Enter your key to create an account</p>
                </div>

                {/* Auth Method Toggle */}
                <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => { setAuthMethod('key'); setError('') }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${authMethod === 'key' ? 'bg-gray-700 text-white shadow' : 'text-gray-400'}`}
                  >
                    Admin Key
                  </button>
                  <button
                    onClick={() => { setAuthMethod('team'); setError('') }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${authMethod === 'team' ? 'bg-gray-700 text-white shadow' : 'text-gray-400'}`}
                  >
                    Team Key
                  </button>
                  <button
                    onClick={() => { setAuthMethod('temp'); setError('') }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition ${authMethod === 'temp' ? 'bg-gray-700 text-white shadow' : 'text-gray-400'}`}
                  >
                    Temp Key
                  </button>
                </div>

                {authMethod === 'key' && (
                  <form onSubmit={handleKeyLogin} className="space-y-4">
                    <Input
                      label="Admin Key"
                      type="password"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder="Enter your admin key"
                      required
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <Button type="submit" className="w-full py-3">
                      Continue
                    </Button>
                  </form>
                )}

                {authMethod === 'team' && (
                  <form onSubmit={handleKeyLogin} className="space-y-4">
                    <Input
                      label="Team Key"
                      type="password"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder="Enter your team key"
                      required
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-gray-500 text-xs">
                      Keys for Outreach, Communications, or Strategy teams
                    </p>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <Button type="submit" className="w-full py-3">
                      Continue
                    </Button>
                  </form>
                )}

                {authMethod === 'temp' && (
                  <form onSubmit={handleTempAccess} className="space-y-4">
                    <Input
                      label="Temp Access Code"
                      type="password"
                      value={tempCode}
                      onChange={(e) => setTempCode(e.target.value)}
                      placeholder="Enter temporary access code"
                      required
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <p className="text-gray-500 text-xs">
                      For demos, onboarding, and development access
                    </p>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <Button type="submit" className="w-full py-3">
                      Continue
                    </Button>
                  </form>
                )}

                <div className="mt-6 pt-4 border-t border-gray-800 text-center">
                  <p className="text-gray-500 text-sm mb-2">Already have an account?</p>
                  <Link href="/admin/login" className="text-[#4B9CD3] text-sm hover:underline">
                    Login instead
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  )
}
