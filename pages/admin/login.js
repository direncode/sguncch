import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { Button, Input } from '../../components/FormInput'

export default function AdminLogin() {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { loginAdmin, isAdmin } = useApp()

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

  return (
    <>
      <Head>
        <title>Admin Login | Project Bold</title>
      </Head>

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#13294B]">Admin Login</h1>
            <p className="text-gray-600 mt-2">Enter your admin key to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter admin key"
              required
            />

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[#4B9CD3] text-sm hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
