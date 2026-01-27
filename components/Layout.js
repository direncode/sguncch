import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import DemoBanner from './DemoBanner'

const navigation = [
  { name: 'Command', href: '/', icon: '◉' },
  { name: 'Wellness', href: '/wellness', icon: '♥' },
  { name: 'Basic Needs', href: '/basic-needs', icon: '◈' },
  { name: 'Academic', href: '/academic', icon: '◎' },
  { name: 'Civic', href: '/civic', icon: '⬡' },
  { name: 'Comms', href: '/communications', icon: '◇' },
  { name: 'Environ', href: '/environmental', icon: '◆' },
]

export default function Layout({ children }) {
  const router = useRouter()
  const [time, setTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <DemoBanner />

      {/* Command Center Header */}
      <header className="bg-[#0d1117]/95 backdrop-blur-xl border-b border-[#30363d] sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto">
          {/* Top Bar - System Status */}
          <div className="flex items-center justify-between px-6 py-2 border-b border-[#21262d] text-[10px] font-mono">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#3fb950] shadow-[0_0_8px_#3fb950]' : 'bg-[#f85149] shadow-[0_0_8px_#f85149]'} animate-pulse`} />
                <span className="text-[#8b949e] uppercase tracking-wider">{isOnline ? 'System Online' : 'Offline'}</span>
              </div>
              <span className="text-[#6e7681]">|</span>
              <span className="text-[#8b949e]">SESSION: <span className="text-[#00d4ff]">SG-2026-BOLD</span></span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[#8b949e]">LAT: 35.9049° N</span>
              <span className="text-[#8b949e]">LON: 79.0469° W</span>
              <span className="text-[#00d4ff] font-semibold">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>

          {/* Main Nav Bar */}
          <div className="flex items-center justify-between px-6 h-12">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00d4ff] to-[#388bfd] flex items-center justify-center">
                <span className="text-[#0a0e14] font-bold text-sm">PB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#f0f6fc] font-semibold text-sm tracking-tight leading-none">PROJECT BOLD</span>
                <span className="text-[#6e7681] text-[10px] uppercase tracking-widest">Operations Platform</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center">
              {navigation.map(item => {
                const isActive = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all border-b-2 ${
                      isActive
                        ? 'text-[#00d4ff] border-[#00d4ff] bg-[#00d4ff]/5'
                        : 'text-[#8b949e] border-transparent hover:text-[#f0f6fc] hover:bg-[#21262d]'
                    }`}
                  >
                    <span className={isActive ? 'text-[#00d4ff]' : 'text-[#6e7681]'}>{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right Side Controls */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] rounded hover:border-[#00d4ff] hover:bg-[#00d4ff]/5 transition-all"
              >
                <span className="text-[#00d4ff]">⚙</span>
                <span className="hidden sm:inline">Admin Console</span>
              </Link>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="lg:hidden overflow-x-auto px-4 pb-3">
            <div className="flex gap-1">
              {navigation.map(item => {
                const isActive = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap rounded transition-all ${
                      isActive
                        ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]'
                        : 'text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer - Command Center Style */}
      <footer className="bg-[#0d1117] border-t border-[#30363d] mt-16">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00d4ff] to-[#388bfd] flex items-center justify-center">
                  <span className="text-[#0a0e14] font-bold text-[10px]">PB</span>
                </div>
                <span className="text-[#f0f6fc] font-semibold text-sm">PROJECT BOLD</span>
              </div>
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest mb-2">UNC Student Government</p>
              <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">Operations Platform v2.0</p>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-4 pb-2 border-b border-[#21262d]">Quick Access</h3>
              <div className="space-y-2">
                <Link href="/communications" className="flex items-center gap-2 text-xs text-[#8b949e] hover:text-[#00d4ff] transition">
                  <span className="text-[#6e7681]">→</span> Transparency Dashboard
                </Link>
                <Link href="/wellness" className="flex items-center gap-2 text-xs text-[#8b949e] hover:text-[#00d4ff] transition">
                  <span className="text-[#6e7681]">→</span> Wellness Resources
                </Link>
                <Link href="/basic-needs" className="flex items-center gap-2 text-xs text-[#8b949e] hover:text-[#00d4ff] transition">
                  <span className="text-[#6e7681]">→</span> Basic Needs Hub
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-4 pb-2 border-b border-[#21262d]">System</h3>
              <div className="space-y-2 text-xs text-[#8b949e]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
                  <span>All Systems Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6e7681]">→</span>
                  <Link href="/admin" className="hover:text-[#00d4ff] transition">Admin Console</Link>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-4 pb-2 border-b border-[#21262d]">Contact</h3>
              <div className="space-y-2 text-xs">
                <p className="text-[#8b949e] font-mono">student.government@unc.edu</p>
                <p className="text-[#6e7681]">Suite 3514, FPG Student Union</p>
                <p className="text-[#6e7681]">Chapel Hill, NC 27599</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#21262d] mt-8 pt-6 flex items-center justify-between">
            <p className="text-[10px] text-[#6e7681] uppercase tracking-widest">First, Best, For All — Together, We Go Bold</p>
            <p className="text-[10px] text-[#6e7681] font-mono">© 2026 UNC SG</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
