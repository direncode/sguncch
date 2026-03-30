import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { getAuthHeaders } from '../../lib/adminSession'
import { getTeamByRole } from '../../lib/data'
import { Button, Input } from '../../components/FormInput'
import AdminNav from '../../components/AdminNav'

const AVATAR_COLORS = ['#4B9CD3', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#EC4899']

export default function AdminProfile() {
  const router = useRouter()
  const { isAdmin, isLoaded, adminRole, accountInfo, setAccountInfo, logoutAdmin, activityLog } = useApp()

  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarColor, setAvatarColor] = useState('#4B9CD3')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const team = getTeamByRole(adminRole)

  useEffect(() => {
    if (isLoaded && !isAdmin) router.push('/admin/login')
  }, [isLoaded, isAdmin, router])

  useEffect(() => {
    if (accountInfo) {
      setDisplayName(accountInfo.displayName || '')
      setBio(accountInfo.bio || '')
      setAvatarColor(accountInfo.avatarColor || '#4B9CD3')
    }
  }, [accountInfo])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveProfile = async () => {
    if (!accountInfo) return
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ displayName, bio, avatarColor }),
      })
      if (res.ok) {
        setAccountInfo({ ...accountInfo, displayName, bio, avatarColor })
        setEditMode(false)
        notify('Profile updated')
      } else {
        const data = await res.json()
        notify(data.error || 'Failed to update profile')
      }
    } catch {
      notify('Failed to update profile')
    }
    setSaving(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setShowPasswordForm(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        notify('Password changed successfully')
      } else {
        setPasswordError(data.error || 'Failed to change password')
      }
    } catch {
      setPasswordError('Failed to change password')
    }
  }

  // Get recent activity for this user
  const recentActivity = activityLog
    .filter(a => a.category === 'auth' || a.category === 'policy' || a.category === 'budget')
    .slice(0, 10)

  if (!isLoaded) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>
  if (!isAdmin) return null

  return (
    <>
      <Head><title>Profile | Project Bold</title></Head>

      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 text-sm hover:text-gray-600">&larr; Dashboard</Link>
              <h1 className="text-lg font-bold text-[#13294B]">Profile</h1>
            </div>
            <button onClick={logoutAdmin} className="text-sm text-red-500 hover:text-red-700 transition">
              Logout
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {!accountInfo ? (
            /* No account — prompt to register */
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-gray-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h2 className="text-xl font-bold text-[#13294B] mb-2">No Account Yet</h2>
              <p className="text-gray-600 mb-6">Create an account to get a personalized profile and use username/password login.</p>
              <Link href="/admin/register" className="inline-flex items-center px-6 py-3 bg-[#13294B] text-white rounded-lg text-sm font-medium hover:bg-[#0a1e3d] transition">
                Create Account
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start gap-5">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0" style={{ backgroundColor: editMode ? avatarColor : accountInfo.avatarColor }}>
                    {(editMode ? displayName : accountInfo.displayName)?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    {editMode ? (
                      <div className="space-y-4">
                        <Input
                          label="Display Name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          maxLength={50}
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={200}
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B9CD3] resize-none"
                            placeholder="Tell your team about yourself..."
                          />
                          <p className="text-xs text-gray-400 mt-1">{bio.length}/200</p>
                        </div>
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
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="secondary" onClick={() => {
                            setEditMode(false)
                            setDisplayName(accountInfo.displayName)
                            setBio(accountInfo.bio || '')
                            setAvatarColor(accountInfo.avatarColor)
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-xl font-bold text-[#13294B]">{accountInfo.displayName}</h2>
                          <button onClick={() => setEditMode(true)} className="text-xs text-[#4B9CD3] hover:underline">Edit</button>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">@{accountInfo.username}</p>
                        {accountInfo.bio && <p className="text-gray-700 text-sm mb-3">{accountInfo.bio}</p>}
                        {team && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: team.color + '15', color: team.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                            {team.name}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Username</p>
                    <p className="font-medium text-gray-900">@{accountInfo.username}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Team Role</p>
                    <p className="font-medium text-gray-900">{team?.name || adminRole}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Account ID</p>
                    <p className="font-mono text-xs text-gray-600">{accountInfo.id?.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {accountInfo.createdAt ? new Date(accountInfo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Security</h3>
                {showPasswordForm ? (
                  <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                    <Input
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
                    <div className="flex gap-2">
                      <Button type="submit">Change Password</Button>
                      <Button variant="secondary" onClick={() => { setShowPasswordForm(false); setPasswordError('') }}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowPasswordForm(true)} className="text-sm text-[#4B9CD3] hover:underline">
                    Change Password
                  </button>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700">{entry.details || entry.action}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50">
            {toast}
          </div>
        )}

        <AdminNav />
        <div className="h-16" />
      </div>
    </>
  )
}
