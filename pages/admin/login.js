import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { Button, Input } from '../../components/FormInput'

const TEMP_ACCESS_CODE = 'dev-only-change-in-production'

export default function AdminLogin() {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [showTempInput, setShowTempInput] = useState(false)
  const [tempCode, setTempCode] = useState('')
  const router = useRouter()
  const { loginAdmin, tempLoginAdmin, isAdmin } = useApp()

  // Redirect if already logged in
  if (isAdmin) {
    router.push('/admin')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await loginAdmin(key)
    if (result.success) {
      router.push('/admin')
    } else {
      setError(result.error || 'Invalid admin key')
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
      tempLoginAdmin()
      router.push('/admin')
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
        /* Prevent Safari auto-zoom on input focus (requires >= 16px) */
        @supports (-webkit-touch-callout: none) {
          .login-input input {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div className="min-h-screen min-h-[100dvh] bg-gray-100 flex items-center justify-center p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="bg-white rounded-lg shadow-lg p-5 sm:p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#13294B]">Admin Login</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Enter your admin key to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="login-input">
              <Input
                label="Admin Key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter admin key"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <Button type="submit" className="w-full py-3">
              Login
            </Button>
          </form>

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
        </div>
      </div>
    </>
  )
}
