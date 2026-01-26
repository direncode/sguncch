import Link from 'next/link';
import { BRANDING } from '@project-bold/shared';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-carolina-blue flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="font-bold text-xl">{BRANDING.CAMPAIGN}</span>
            </div>
            <p className="text-gray-300 text-sm max-w-md">
              {BRANDING.TAGLINE} — Building a Carolina that leads not only in prestige, but in purpose;
              not only in excellence, but in care.
            </p>
            <p className="text-carolina-blue mt-4 font-medium">
              {BRANDING.SLOGAN}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/policies" className="text-gray-300 hover:text-white transition-colors text-sm">
                  All Policies
                </Link>
              </li>
              <li>
                <Link href="/wellness" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Student Wellness
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Accountability Dashboard
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Give Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://studentlife.unc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Student Life
                </a>
              </li>
              <li>
                <a
                  href="https://caps.unc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  CAPS (Counseling)
                </a>
              </li>
              <li>
                <a
                  href="https://campushealth.unc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Campus Health
                </a>
              </li>
              <li>
                <a
                  href="https://sg.unc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Student Government
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} {BRANDING.CAMPAIGN}. UNC Student Government.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/accessibility" className="text-gray-400 hover:text-white text-sm transition-colors">
              Accessibility
            </Link>
            <a
              href="https://github.com/unc-student-gov/project-bold"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Open Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
