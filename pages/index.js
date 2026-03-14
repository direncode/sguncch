import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import PhaseIndicator from '../components/PhaseIndicator'
import { useApp } from '../lib/store'
import { getPhaseSummary, getPhaseLabel, POLICY_PHASES } from '../lib/data'

// Scroll reveal hook
function useScrollReveal() {
  const [revealed, setRevealed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return [ref, revealed]
}

// Reveal component
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, revealed] = useScrollReveal()

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${className}`}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// Animated counter
function Counter({ value, suffix = '' }) {
  const [count, setCount] = useState(0)
  const [ref, revealed] = useScrollReveal()

  useEffect(() => {
    if (!revealed) return

    const target = parseInt(value) || 0
    const duration = 2000
    const increment = target / (duration / 16)
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value, revealed])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function Home() {
  const { policies } = useApp()
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const completedCount = policies?.filter(p => p.status === 'completed').length || 0
  const totalPolicies = policies?.length || 40

  return (
    <Layout>
      <Head>
        <title>Project Bold | UNC Student Government</title>
        <meta name="description" content="Building the future of student governance through transparency, innovation, and collective action." />
      </Head>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-32 lg:py-0">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div
              className="mb-8 opacity-0 animate-fade-in"
              style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
            >
              <span className="caption">UNC Student Government 2026</span>
            </div>

            {/* Main Title */}
            <h1
              className="hero-title mb-8 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
            >
              Transforming
              <br />
              Student Life
            </h1>

            {/* Subtitle */}
            <p
              className="hero-subtitle max-w-2xl mb-12 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
            >
              We build platforms that empower every Carolina student to thrive.
              Transparent governance. Data-driven decisions. Real impact.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap gap-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
            >
              <Link href="/budget" className="btn-primary">
                View Budget
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/wellness" className="btn-secondary">
                Explore Resources
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator - moves down and fades out on scroll */}
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in transition-all duration-500"
          style={{
            animationDelay: '1.5s',
            animationFillMode: 'forwards',
            transform: `translateX(-50%) translateY(${Math.min(scrollY * 0.5, 60)}px)`,
            opacity: Math.max(0, 1 - scrollY / 120),
            pointerEvents: scrollY > 60 ? 'none' : 'auto',
          }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-gray-500 to-transparent" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding border-t border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-24 mb-16">
            <Reveal>
              <div>
                <span className="counter"><Counter value={totalPolicies} /></span>
                <p className="body-large mt-4">Policy initiatives actively tracked and managed across campus.</p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div>
                <span className="counter"><Counter value={completedCount} /></span>
                <p className="body-large mt-4">Initiatives completed this year, directly improving student life.</p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div>
                <span className="counter"><Counter value={31000} suffix="+" /></span>
                <p className="body-large mt-4">Students served through our programs and resources.</p>
              </div>
            </Reveal>
          </div>

          {/* Phase Distribution */}
          {mounted && policies?.length > 0 && (
            <Reveal delay={300}>
              <div>
                <span className="caption mb-6 block">Initiative Phases</span>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {(() => {
                    const phaseSummary = getPhaseSummary(policies);
                    return POLICY_PHASES.map(phase => (
                      <div key={phase.number} className="bg-white/[0.02] border border-gray-900 rounded-xl p-4 text-center">
                        <p className="text-2xl font-mono font-bold text-white">{phaseSummary[phase.number]?.count || 0}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{phase.shortLabel}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <Reveal>
              <div>
                <span className="caption mb-6 block">Our Mission</span>
                <h2 className="section-title mb-8">
                  First, Best,
                  <br />
                  For All
                </h2>
                <p className="body-large mb-8">
                  Project Bold represents a fundamental shift in how student government
                  operates. We&apos;re building transparent, accessible platforms that put
                  students first.
                </p>
                <Link href="/communications" className="btn-ghost">
                  Learn more about our work
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-8">
                  <div className="text-4xl mb-4">$</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Transparent Budget</h3>
                  <p className="text-gray-400 text-sm">Every dollar tracked and accountable.</p>
                </div>
                <div className="card p-8">
                  <div className="text-4xl mb-4">W</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Student Wellness</h3>
                  <p className="text-gray-400 text-sm">Mental health and crisis resources.</p>
                </div>
                <div className="card p-8">
                  <div className="text-4xl mb-4">B</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Basic Needs</h3>
                  <p className="text-gray-400 text-sm">Food, housing, and emergency aid.</p>
                </div>
                <div className="card p-8">
                  <div className="text-4xl mb-4">A</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Academic Support</h3>
                  <p className="text-gray-400 text-sm">Resources for student success.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding border-t border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <Reveal>
            <div className="max-w-2xl mb-20">
              <span className="caption mb-6 block">Departments</span>
              <h2 className="section-title mb-6">
                Built for transparency
              </h2>
              <p className="body-large">
                Our departments are designed with one goal: making student government
                accessible to everyone.
              </p>
            </div>
          </Reveal>

          <div className="space-y-1">
            {[
              {
                title: 'Budget & Funding',
                description: 'Real-time budget tracking, funding requests, and transparent allocation of student fees.',
                href: '/budget',
                num: '01'
              },
              {
                title: 'Wellness Resources',
                description: 'Mental health support, crisis intervention, and campus wellness initiatives.',
                href: '/wellness',
                num: '02'
              },
              {
                title: 'Basic Needs Hub',
                description: 'Food pantry access, emergency housing, and essential support services.',
                href: '/basic-needs',
                num: '03'
              },
              {
                title: 'Academic Support',
                description: 'Tutoring resources, study spaces, and academic advocacy programs.',
                href: '/academic',
                num: '04'
              },
              {
                title: 'Environmental Action',
                description: 'Sustainability initiatives, campus green programs, and environmental advocacy.',
                href: '/environmental',
                num: '05'
              },
            ].map((feature, index) => (
              <Reveal key={feature.href} delay={index * 50}>
                <Link
                  href={feature.href}
                  className="group block py-8 border-b border-gray-900 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <span className="text-gray-600 font-mono text-sm">{feature.num}</span>
                      <div>
                        <h3 className="text-2xl font-semibold text-white group-hover:text-gray-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-500 mt-2 max-w-xl">{feature.description}</p>
                      </div>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-600 group-hover:text-white group-hover:translate-x-2 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Student Forms & Services */}
      <section className="section-padding">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <Reveal>
            <div className="max-w-2xl mb-16">
              <span className="caption mb-6 block">Get Involved</span>
              <h2 className="section-title mb-6">Student Services</h2>
              <p className="body-large">
                Request resources, sign up for programs, and connect with campus services — all in one place.
              </p>
            </div>
          </Reveal>

          {/* Budget request notice */}
          <Reveal>
            <div className="mb-8 p-6 bg-white/[0.02] border border-gray-900 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-600">Budget</span>
                  <h3 className="text-white font-medium mt-2">Funding Requests</h3>
                  <p className="text-sm text-gray-500 mt-1">To request funding for your student organization, submit through Heels Life.</p>
                </div>
                <a
                  href="https://heelslife.unc.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary shrink-0"
                >
                  Go to Heels Life
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: '/wellness', title: 'Safe Ride Request', desc: 'Request a free late-night ride home from campus safety services.', cat: 'Wellness' },
              { href: '/wellness', title: 'Volunteer Application', desc: 'Sign up to volunteer with campus wellness and peer support programs.', cat: 'Wellness' },
              { href: '/wellness', title: 'Safety Plan', desc: 'Create a personal safety plan with campus crisis resources.', cat: 'Wellness' },
              { href: '/basic-needs', title: 'Meal Swipe Exchange', desc: 'Share or receive extra meal swipes with fellow students.', cat: 'Basic Needs' },
              { href: '/basic-needs', title: 'Shuttle Reservation', desc: 'Reserve a spot on campus shuttles to grocery stores and essentials.', cat: 'Basic Needs' },
              { href: '/academic', title: 'Mentor Request', desc: 'Get matched with an academic mentor in your field of study.', cat: 'Academic' },
              { href: '/academic', title: 'Study Center Reservation', desc: 'Book a study room or space at campus academic centers.', cat: 'Academic' },
              { href: '/communications', title: 'Story Submission', desc: 'Share your story for the student government newsletter or blog.', cat: 'Communications' },
              { href: '/communications', title: 'Student Nomination', desc: 'Nominate a fellow student for recognition or leadership awards.', cat: 'Communications' },
              { href: '/communications', title: 'Podcast Guest Application', desc: 'Apply to be a guest on the student government podcast.', cat: 'Communications' },
              { href: '/communications', title: 'Talent Spotlight', desc: 'Showcase your talent or project to the campus community.', cat: 'Communications' },
              { href: '/environmental', title: 'Adopt-a-Space', desc: 'Adopt a campus area to maintain and keep green.', cat: 'Environmental' },
              { href: '/environmental', title: 'Donation Scheduling', desc: 'Schedule donations of supplies or materials for sustainability programs.', cat: 'Environmental' },
            ].map((form, i) => (
              <Reveal key={`${form.title}-${i}`} delay={i * 30}>
                <Link
                  href={form.href}
                  className="group block p-6 bg-white/[0.02] border border-gray-900 rounded-xl hover:bg-white/[0.05] hover:border-gray-700 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-600">{form.cat}</span>
                    <svg className="w-4 h-4 text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-1.5 group-hover:text-gray-200 transition-colors">{form.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{form.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Tagline */}
      <section className="py-20 border-t border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <Reveal>
            <p className="text-center">
              <span className="text-xl lg:text-2xl font-light text-gray-500">
                Together, We Go{' '}
                <span className="text-white font-semibold">Bold</span>
              </span>
            </p>
          </Reveal>
        </div>
      </section>
    </Layout>
  )
}
