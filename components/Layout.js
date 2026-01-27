import Link from 'next/link'
import { useRouter } from 'next/router'
import DemoBanner from './DemoBanner'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Wellness', href: '/wellness' },
  { name: 'Basic Needs', href: '/basic-needs' },
  { name: 'Academic', href: '/academic' },
  { name: 'Civic', href: '/civic' },
  { name: 'Communications', href: '/communications' },
  { name: 'DEI', href: '/dei' },
  { name: 'Environmental', href: '/environmental' },
  { name: 'External', href: '/external' },
]

export default function Layout({ children }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner - Always visible at top */}
      <DemoBanner />

      {/* Header */}
      <header className="bg-[#13294B] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Project Bold</span>
              <span className="text-[#4B9CD3] text-sm hidden sm:block">First, Best, For All</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navigation.slice(1).map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    router.pathname.startsWith(item.href)
                      ? 'bg-[#4B9CD3] text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden overflow-x-auto pb-2 px-4">
          <div className="flex gap-2">
            {navigation.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded text-xs whitespace-nowrap ${
                  router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                    ? 'bg-[#4B9CD3] text-white'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-[#13294B] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-2">Project Bold</h3>
              <p className="text-[#4B9CD3]">First, Best, For All</p>
              <p className="text-sm text-gray-400 mt-2">UNC Student Government 2026-2027</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Quick Links</h3>
              <div className="space-y-1 text-sm text-gray-400">
                <Link href="/communications" className="block hover:text-white">Transparency Dashboard</Link>
                <Link href="/wellness" className="block hover:text-white">Wellness Resources</Link>
                <Link href="/basic-needs" className="block hover:text-white">Basic Needs</Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Contact</h3>
              <p className="text-sm text-gray-400">student.government@unc.edu</p>
              <p className="text-sm text-gray-400">Suite 3514, FPG Student Union</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500">
            Together, We Go Bold.
          </div>
        </div>
      </footer>
    </div>
  )
}
