import Link from 'next/link'
import { useRouter } from 'next/router'

const adminLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/scroll', label: 'The Scroll' },
  { href: '/admin/ai', label: 'Grok AI' },
  { href: '/admin/submissions', label: 'Submissions' },
  { href: '/admin/codex', label: 'Codex' },
]

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/budget', label: 'Budget' },
  { href: '/wellness', label: 'Resources' },
  { href: '/documents', label: 'Documents' },
  { href: '/scroll', label: 'Public Scroll' },
  { href: '/chat', label: 'Public Chat' },
  { href: '/funding-request', label: 'Funding' },
]

export default function AdminNav() {
  const router = useRouter()
  const isAdminPage = router.pathname.startsWith('/admin')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-gray-800">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6">
        <div className="flex items-center h-11 gap-1 overflow-x-auto">
          {/* Admin section */}
          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-wider shrink-0 mr-1">Admin</span>
          {adminLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`px-2.5 py-1.5 text-xs rounded transition whitespace-nowrap ${
                router.pathname === link.href
                  ? 'text-white bg-white/10'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}>
              {link.label}
            </Link>
          ))}

          <span className="w-px h-5 bg-gray-800 mx-2 shrink-0" />

          {/* Public section */}
          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-wider shrink-0 mr-1">Site</span>
          {publicLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`px-2.5 py-1.5 text-xs rounded transition whitespace-nowrap ${
                !isAdminPage && router.pathname === link.href
                  ? 'text-white bg-white/10'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}>
              {link.label}
            </Link>
          ))}

          <div className="flex-1" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-[10px] text-green-400 font-mono">Admin</span>
          </div>
        </div>
      </div>
    </div>
  )
}
