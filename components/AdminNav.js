import Link from 'next/link'
import { useRouter } from 'next/router'
import { useApp } from '../lib/store'
import { getTeamByRole } from '../lib/data'

const allAdminLinks = [
  { href: '/admin', label: 'Dashboard', leadsOnly: false },
  { href: '/admin/scroll', label: 'The Scroll', leadsOnly: true },
  { href: '/admin/ai', label: 'Grok AI', leadsOnly: true },
  { href: '/admin/submissions', label: 'Submissions', leadsOnly: true },
  { href: '/admin/codex', label: 'Codex', leadsOnly: true },
]

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/budget', label: 'Budget' },
  { href: '/wellness', label: 'Resources' },
  { href: '/documents', label: 'Documents' },
  { href: '/scroll', label: 'Public Scroll' },
  { href: '/chat', label: 'Public Chat' },
]

export default function AdminNav() {
  const router = useRouter()
  const { adminRole, isLeads, accountInfo } = useApp()
  const isAdminPage = router.pathname.startsWith('/admin')

  const team = getTeamByRole(adminRole)
  const teamColor = team?.color || '#10B981'
  const teamName = team?.name || 'Admin'

  // Non-leads only see Dashboard + Home
  const adminLinks = isLeads
    ? allAdminLinks
    : allAdminLinks.filter(l => !l.leadsOnly)

  const siteLinks = isLeads
    ? publicLinks
    : [{ href: '/', label: 'Home' }]

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

          {/* Site section */}
          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-wider shrink-0 mr-1">Site</span>
          {siteLinks.map(link => (
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

          {/* Profile link + Team indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/admin/profile" className="flex items-center gap-2 hover:opacity-80 transition" title={accountInfo ? `@${accountInfo.username}` : teamName}>
              {accountInfo ? (
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: accountInfo.avatarColor || teamColor }}>
                  {accountInfo.displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: teamColor }} />
              )}
              <span className="text-[10px] font-mono hidden sm:block" style={{ color: teamColor }}>
                {accountInfo ? accountInfo.displayName : teamName}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
