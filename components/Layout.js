import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import GridBackground from './GridBackground'
import AdminNav from './AdminNav'
import { useApp } from '../lib/store'

const navigation = [
  { name: 'Budget', href: '/budget-transparency' },
  { name: 'Resources', href: '/wellness' },
  { name: 'Community', href: '/basic-needs' },
  { name: 'Academic', href: '/academic' },
  { name: 'Impact', href: '/communications' },
  { name: 'Documents', href: '/documents' },
  { name: 'The Scroll', href: '/scroll' },
  { name: 'Ask AI', href: '/chat' },
  { name: 'Admin', href: '/admin' },
]

const FEEDBACK_CATEGORIES = [
  'General Feedback',
  'Platform Issue',
  'Budget & Funding',
  'Wellness Services',
  'Basic Needs',
  'Academic Support',
  'Suggestion',
]

export default function Layout({ children }) {
  const router = useRouter()
  const { isAdmin, submitFeedback } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({ message: '', email: '', category: 'General Feedback' })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)

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

      {/* Admin Quick-Switch Bar */}
      {isAdmin && <AdminNav />}

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

      {/* Feedback Floating Button & Panel */}
      <div className="fixed bottom-4 right-4 z-50" style={isAdmin ? { bottom: '3.5rem' } : {}}>
        {showFeedback && (
          <div className="absolute bottom-14 right-0 w-80 bg-black border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">Send Feedback</h3>
              <button onClick={() => { setShowFeedback(false); setFeedbackSubmitted(false) }} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
            </div>
            {feedbackSubmitted ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-sm text-white font-medium">Thank you!</p>
                <p className="text-xs text-gray-500 mt-1">Your feedback has been sent to the admin team.</p>
                <button onClick={() => { setShowFeedback(false); setFeedbackSubmitted(false) }} className="mt-4 text-xs text-gray-400 hover:text-white transition-colors">Close</button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!feedbackForm.message.trim()) return
                  setFeedbackSubmitting(true)
                  await submitFeedback({
                    message: feedbackForm.message.trim(),
                    email: feedbackForm.email.trim(),
                    category: feedbackForm.category,
                  })
                  setFeedbackSubmitting(false)
                  setFeedbackSubmitted(true)
                  setFeedbackForm({ message: '', email: '', category: 'General Feedback' })
                }}
                className="p-4 space-y-3"
              >
                <div>
                  <select
                    value={feedbackForm.category}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-lg text-xs text-white focus:border-white focus:outline-none"
                  >
                    {FEEDBACK_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <textarea
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                    rows={3}
                    placeholder="Tell us what you think..."
                    required
                    className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:border-white focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={feedbackForm.email}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                    placeholder="Email (optional)"
                    className="w-full px-3 py-2 bg-white/5 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:border-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={feedbackSubmitting || !feedbackForm.message.trim()}
                  className="w-full py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {feedbackSubmitting ? 'Sending...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        )}
        <button
          onClick={() => { setShowFeedback(!showFeedback); setFeedbackSubmitted(false) }}
          className="w-11 h-11 bg-white text-black rounded-full shadow-lg flex items-center justify-center hover:bg-gray-200 transition-all"
          title="Send Feedback"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>

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
