import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import GridBackground from './GridBackground'

const navigation = [
  { name: 'Budget', href: '/budget' },
  { name: 'Resources', href: '/wellness' },
  { name: 'Community', href: '/basic-needs' },
  { name: 'Academic', href: '/academic' },
  { name: 'Impact', href: '/communications' },
  { name: 'Documents', href: '/documents' },
  { name: 'The Scroll', href: '/scroll' },
  { name: 'Ask AI', href: '/chat' },
]

export default function Layout({ children }) {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [router.pathname])

  return (
    <div className="min-h-screen bg-black">
      <GridBackground />

      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/80 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-white rounded-sm transition-transform duration-300 group-hover:rotate-45" />
                <div className="absolute inset-2 bg-black rounded-sm transition-transform duration-300 group-hover:rotate-45" />
              </div>
              <span className="text-white font-semibold text-lg tracking-tight hidden sm:block">
                Project Bold
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-12">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href ||
                  (item.href !== '/' && router.pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors"
              >
                Admin
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-white"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`w-full h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                  <span className={`w-full h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden fixed inset-0 top-20 bg-black/95 backdrop-blur-xl transition-all duration-500 ${
            menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <div className="px-6 py-12">
            <div className="space-y-8">
              {navigation.map((item, index) => {
                const isActive = router.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block text-3xl font-light transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-500 hover:text-white'
                    }`}
                    style={{
                      transitionDelay: menuOpen ? `${index * 50}ms` : '0ms',
                      transform: menuOpen ? 'translateX(0)' : 'translateX(-20px)',
                      opacity: menuOpen ? 1 : 0
                    }}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
            <div className="mt-16 pt-8 border-t border-gray-800">
              <Link
                href="/admin"
                className="block text-gray-500 hover:text-white transition-colors mb-4"
              >
                Admin Console
              </Link>
              <p className="text-sm text-gray-600">
                UNC Student Government
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Brand */}
            <div className="lg:col-span-4">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-white rounded-sm" />
                  <div className="absolute inset-1.5 bg-black rounded-sm" />
                </div>
                <span className="text-white font-semibold tracking-tight">
                  Project Bold
                </span>
              </Link>
              <p className="text-gray-500 text-sm max-w-xs">
                Building the future of student governance through transparency,
                innovation, and collective action.
              </p>
            </div>

            {/* Links */}
            <div className="lg:col-span-2">
              <h4 className="caption mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/budget" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Budget & Funding
                  </Link>
                </li>
                <li>
                  <Link href="/wellness" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Wellness
                  </Link>
                </li>
                <li>
                  <Link href="/basic-needs" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Basic Needs
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="caption mb-6">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/academic" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Academic Support
                  </Link>
                </li>
                <li>
                  <Link href="/environmental" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Environmental
                  </Link>
                </li>
                <li>
                  <Link href="/communications" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Communications
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="caption mb-6">System</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Admin Console
                  </Link>
                </li>
                <li>
                  <Link href="/funding-request" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Submit Request
                  </Link>
                </li>
                <li>
                  <Link href="/budget-transparency" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Transparency
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="caption mb-6">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>student.government@unc.edu</li>
                <li>Suite 3514, FPG Student Union</li>
                <li>Chapel Hill, NC 27599</li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-20 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2026 UNC Student Government. First, Best, For All.
            </p>
            <p className="text-sm text-gray-600">
              Together, We Go Bold
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
