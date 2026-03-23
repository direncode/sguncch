import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { getAuthHeaders } from '../../lib/adminSession'
import { getTeamByRole } from '../../lib/data'
import { Button, Input } from '../../components/FormInput'

const AVATAR_COLORS = ['#4B9CD3', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#EC4899']

export default function AdminRegister() {
  const router = useRouter()
  const { isAdmin, adminRole, accountInfo, setAccountInfo } = useApp()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarColor, setAvatarColor] = useState('#4B9CD3')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const team = getTeamByRole(adminRole)

  // Must be logged in with key but NOT have an account yet
  if (!isAdmin) {
    if (typeof window !== 'undefined') router.push('/admin/login')
    return null
  }

  if (accountInfo) {
    if (typeof window !== 'undefined') router.push('/admin')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, underscores, dots, and hyphens')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, displayName, password, avatarColor }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Store account info
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
    <>
      <Head>
        <title>Create Account | Project Bold</title>
      </Head>

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: avatarColor + '20' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: avatarColor }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#13294B] mb-2">Account Created</h2>
              <p className="text-gray-600">Welcome, {displayName}!</p>
              <p className="text-gray-500 text-sm mt-2">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-[#13294B]">Create Your Account</h1>
                <p className="text-gray-600 mt-2 text-sm">Set up a username and password for quick access</p>
                {team && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: team.color + '15', color: team.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                    {team.name}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="e.g. john.doe"
                  required
                  maxLength={30}
                />

                <Input
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  maxLength={50}
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                />

                {/* Avatar Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Color</label>
                  <div className="flex gap-3">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAvatarColor(color)}
                        className="w-8 h-8 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: color,
                          borderColor: avatarColor === color ? '#13294B' : 'transparent',
                          transform: avatarColor === color ? 'scale(1.15)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <Button type="submit" className="w-full py-3" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/admin" className="text-[#4B9CD3] text-sm hover:underline">
                  Skip for now
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
