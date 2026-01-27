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
    <div className="min-h-screen bg-[#f5f5f7]">
      <DemoBanner />

      {/* Header - Frosted glass Apple style */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#e8e8ed] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-[#1d1d1f] font-semibold text-lg tracking-tight">Project Bold</span>
              <span className="text-[#86868b] text-sm hidden sm:block">First, Best, For All</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navigation.slice(1).map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    router.pathname.startsWith(item.href)
                      ? 'bg-[#1d1d1f] text-white'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden overflow-x-auto pb-3 px-6">
          <div className="flex gap-2">
            {navigation.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-[#f5f5f7] text-[#6e6e73]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer - Apple style */}
      <footer className="bg-[#f5f5f7] border-t border-[#e8e8ed] py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-[#1d1d1f] text-lg tracking-tight mb-3">Project Bold</h3>
              <p className="text-[#0071e3] font-medium">First, Best, For All</p>
              <p className="text-sm text-[#86868b] mt-2">UNC Student Government 2026-2027</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#1d1d1f] mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link href="/communications" className="block text-[#6e6e73] hover:text-[#0071e3] transition">Transparency Dashboard</Link>
                <Link href="/wellness" className="block text-[#6e6e73] hover:text-[#0071e3] transition">Wellness Resources</Link>
                <Link href="/basic-needs" className="block text-[#6e6e73] hover:text-[#0071e3] transition">Basic Needs</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-[#1d1d1f] mb-3">Contact</h3>
              <p className="text-sm text-[#6e6e73]">student.government@unc.edu</p>
              <p className="text-sm text-[#6e6e73]">Suite 3514, FPG Student Union</p>
            </div>
          </div>
          <div className="border-t border-[#e8e8ed] mt-8 pt-6 text-center">
            <p className="text-sm text-[#86868b]">Together, We Go Bold.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
