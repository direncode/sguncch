import Link from 'next/link'
import { useApp } from '../lib/store'

export default function DemoBanner() {
  const { isAdmin, logoutAdmin } = useApp()

  return (
    <div className="bg-amber-500 text-black py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold">DEMO MODE</span>
          <span className="text-amber-900 text-sm hidden sm:inline">
            | Data is stored locally.
          </span>
          <Link href="/setup" className="text-sm bg-black/20 hover:bg-black/30 px-2 py-0.5 rounded hidden sm:inline">
            Configure APIs
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <Link href="/admin" className="text-sm bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded font-medium">
                Admin Dashboard
              </Link>
              <button onClick={logoutAdmin} className="text-sm bg-black/20 hover:bg-black/30 px-3 py-1 rounded">
                Logout
              </button>
            </>
          ) : (
            <Link href="/admin/login" className="text-sm bg-black/20 hover:bg-black/30 px-3 py-1 rounded">
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
