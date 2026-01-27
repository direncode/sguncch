import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button, Checkbox } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { wellnessResources } from '../../lib/data'

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState('resources')
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [showAmbassadorForm, setShowAmbassadorForm] = useState(false)
  const [trainingForm, setTrainingForm] = useState({ name: '', email: '', pid: '', role: '', experience: '' })
  const [ambassadorForm, setAmbassadorForm] = useState({ name: '', email: '', pid: '', year: '', major: '', motivation: '' })
  const [submitted, setSubmitted] = useState(null)
  const { policies } = useApp()

  const deptPolicies = policies.filter(p => p.department === 'wellness')

  const handleTrainingSubmit = (e) => {
    e.preventDefault()
    setSubmitted('training')
    setShowTrainingForm(false)
    setTrainingForm({ name: '', email: '', pid: '', role: '', experience: '' })
  }

  const handleAmbassadorSubmit = (e) => {
    e.preventDefault()
    setSubmitted('ambassador')
    setShowAmbassadorForm(false)
    setAmbassadorForm({ name: '', email: '', pid: '', year: '', major: '', motivation: '' })
  }

  const tabs = [
    { id: 'resources', label: 'Resources' },
    { id: 'training', label: 'Mental Health First Aid' },
    { id: 'ambassadors', label: 'Wellness Ambassadors' },
    { id: 'advocacy', label: 'CAPS Advocacy' },
    { id: 'policies', label: 'All Policies' },
  ]

  return (
    <Layout>
      <Head>
        <title>Student Wellness | Project Bold</title>
      </Head>

      {/* Hero with grid background */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#3fb950 1px, transparent 1px), linear-gradient(90deg, #3fb950 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3fb950]/10 blur-3xl rounded-full" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <p className="text-[#3fb950] text-xs font-medium tracking-widest uppercase mb-4">Student Wellness</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">
            Your Health Matters
          </h1>
          <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed">
            Mental health, safety, and holistic student wellbeing. Access CAPS, crisis support,
            wellness resources, and join our peer support programs.
          </p>
        </div>
      </div>

      {/* Crisis Banner */}
      <div className="bg-[#b62324] border-b border-[#da3633]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <p className="font-semibold text-white uppercase text-sm tracking-wide">In Crisis? Get immediate help:</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="tel:988" className="bg-white text-[#b62324] px-4 py-2 rounded font-mono font-bold hover:bg-[#f0f6fc] transition-colors">
              CALL 988
            </a>
            <a href="sms:741741" className="bg-white/10 border border-white/30 text-white px-4 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              TEXT 741741
            </a>
            <a href="tel:919-966-3658" className="bg-white/10 border border-white/30 text-white px-4 py-2 rounded font-mono hover:bg-white/20 transition-colors">
              CAPS: 919-966-3658
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0d1117] sticky top-16 z-40 border-b border-[#30363d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#3fb950] text-[#3fb950]'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#30363d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0d1117] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {submitted && (
            <div className="mb-8 bg-[#161b22] border border-[#3fb950] rounded-lg p-5">
              <p className="text-[#f0f6fc] font-medium">
                {submitted === 'training' && 'Thank you for registering for Mental Health First Aid training! We will contact you with session details.'}
                {submitted === 'ambassador' && 'Thank you for applying to the Wellness Ambassadors program! We will review your application and contact you soon.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-[#3fb950] text-sm font-medium mt-3 hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Wellness Resources</h2>

              {/* Quick Access Buttons */}
              <div className="grid md:grid-cols-3 gap-5 mb-12">
                <a href="https://caps.unc.edu" target="_blank" rel="noopener noreferrer"
                  className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6 text-center hover:bg-[#21262d] transition-all group">
                  <div className="w-12 h-12 bg-[#3fb950]/10 border border-[#3fb950]/30 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:border-[#3fb950]">
                    <svg className="w-6 h-6 text-[#3fb950]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-lg text-[#f0f6fc]">CAPS</p>
                  <p className="text-sm text-[#8b949e] mt-1">Counseling & Psychological Services</p>
                </a>
                <a href="https://campushealth.unc.edu" target="_blank" rel="noopener noreferrer"
                  className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-6 text-center hover:bg-[#21262d] transition-all group">
                  <div className="w-12 h-12 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:border-[#58a6ff]">
                    <svg className="w-6 h-6 text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="font-semibold text-lg text-[#f0f6fc]">Campus Health</p>
                  <p className="text-sm text-[#8b949e] mt-1">Medical Services & Appointments</p>
                </a>
                <a href="https://studentwellness.unc.edu" target="_blank" rel="noopener noreferrer"
                  className="bg-[#161b22] border border-[#a371f7] rounded-lg p-6 text-center hover:bg-[#21262d] transition-all group">
                  <div className="w-12 h-12 bg-[#a371f7]/10 border border-[#a371f7]/30 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:border-[#a371f7]">
                    <svg className="w-6 h-6 text-[#a371f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-lg text-[#f0f6fc]">Student Wellness</p>
                  <p className="text-sm text-[#8b949e] mt-1">Programs & Resources</p>
                </a>
              </div>

              {/* Resource Directory */}
              <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-5 uppercase tracking-widest text-sm">Resource Directory</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {wellnessResources.map(resource => (
                  <div key={resource.id} className={`bg-[#161b22] border rounded-lg p-5 ${resource.emergency ? 'border-[#da3633]' : 'border-[#30363d]'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-[#f0f6fc]">{resource.name}</h4>
                        <p className="text-sm text-[#6e7681] mt-1">{resource.hours}</p>
                      </div>
                      {resource.emergency && (
                        <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#da3633]/10 text-[#da3633] border border-[#da3633]">
                          24/7 CRISIS
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex gap-4">
                      <a href={`tel:${resource.phone.replace(/\D/g, '')}`} className="text-sm text-[#3fb950] font-mono hover:underline">
                        {resource.phone}
                      </a>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#58a6ff] font-medium hover:underline">
                        Website
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mental Health First Aid Tab */}
          {activeTab === 'training' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Mental Health First Aid Training</h2>
                  <p className="text-[#8b949e] mt-2">Learn to recognize and respond to mental health crises</p>
                </div>
                <button
                  onClick={() => setShowTrainingForm(true)}
                  className="bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356] transition-colors uppercase text-sm tracking-wide"
                >
                  Register for Training
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#3fb950]">156</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Students Trained</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff]">12</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Sessions Completed</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#a371f7]">89%</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Completion Rate</p>
                </div>
              </div>

              {/* Upcoming Sessions */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Upcoming Training Sessions</h3>
              <div className="space-y-4 mb-10">
                {[
                  { date: 'Feb 8, 2026', time: '9:00 AM - 4:00 PM', location: 'Student Union 3201', spots: 12 },
                  { date: 'Feb 22, 2026', time: '9:00 AM - 4:00 PM', location: 'Davis Library 247', spots: 8 },
                  { date: 'Mar 8, 2026', time: '9:00 AM - 4:00 PM', location: 'Student Union 3201', spots: 20 },
                ].map((session, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#f0f6fc]">{session.date}</p>
                      <p className="text-sm text-[#6e7681] mt-1 font-mono">{session.time} | {session.location}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2.5 py-1 rounded text-xs font-mono bg-[#d29922]/10 text-[#d29922] border border-[#d29922]">
                        {session.spots} SPOTS LEFT
                      </span>
                      <button
                        onClick={() => setShowTrainingForm(true)}
                        className="text-[#3fb950] font-medium text-sm hover:underline uppercase tracking-wide"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Training Form Modal */}
              {showTrainingForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Register for Training</h3>
                    <form onSubmit={handleTrainingSubmit} className="space-y-5">
                      <Input label="Full Name" name="name" value={trainingForm.name} onChange={e => setTrainingForm({...trainingForm, name: e.target.value})} required />
                      <Input label="Email" type="email" name="email" value={trainingForm.email} onChange={e => setTrainingForm({...trainingForm, email: e.target.value})} required />
                      <Input label="PID" name="pid" value={trainingForm.pid} onChange={e => setTrainingForm({...trainingForm, pid: e.target.value})} required />
                      <Select label="Role" name="role" value={trainingForm.role} onChange={e => setTrainingForm({...trainingForm, role: e.target.value})} required
                        options={[
                          { value: 'ra', label: 'Resident Advisor' },
                          { value: 'org_leader', label: 'Student Org Leader' },
                          { value: 'peer_mentor', label: 'Peer Mentor' },
                          { value: 'other', label: 'Other Student' },
                        ]}
                      />
                      <Textarea label="Prior Experience (optional)" name="experience" value={trainingForm.experience} onChange={e => setTrainingForm({...trainingForm, experience: e.target.value})} />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356] transition-colors">
                          Submit Registration
                        </button>
                        <button type="button" onClick={() => setShowTrainingForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wellness Ambassadors Tab */}
          {activeTab === 'ambassadors' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight">Wellness Ambassadors Program</h2>
                  <p className="text-[#8b949e] mt-2">Join our peer support network promoting mental health awareness</p>
                </div>
                <button
                  onClick={() => setShowAmbassadorForm(true)}
                  className="bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356] transition-colors uppercase text-sm tracking-wide"
                >
                  Apply Now
                </button>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#3fb950]">45</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Active Ambassadors</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#58a6ff]">8</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Events Hosted</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-3xl font-mono font-bold text-[#a371f7]">2,100</p>
                  <p className="text-xs text-[#6e7681] mt-1 uppercase tracking-widest">Students Reached</p>
                </div>
              </div>

              {/* What Ambassadors Do */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">What Ambassadors Do</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-10">
                {[
                  { icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  ), title: 'Lead Workshops', desc: 'Facilitate mental health awareness sessions', color: '#3fb950' },
                  { icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ), title: 'Peer Support', desc: 'Provide one-on-one support and resource navigation', color: '#58a6ff' },
                  { icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ), title: 'Social Media', desc: 'Create engaging wellness content', color: '#a371f7' },
                  { icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ), title: 'Events', desc: 'Plan and host wellness events on campus', color: '#d29922' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#8b949e] transition-colors">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 border" style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}50`, color: item.color }}>
                      {item.icon}
                    </div>
                    <h4 className="font-semibold text-[#f0f6fc]">{item.title}</h4>
                    <p className="text-sm text-[#8b949e] mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Ambassador Form Modal */}
              {showAmbassadorForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold text-[#f0f6fc] tracking-tight mb-6">Apply to be a Wellness Ambassador</h3>
                    <form onSubmit={handleAmbassadorSubmit} className="space-y-5">
                      <Input label="Full Name" name="name" value={ambassadorForm.name} onChange={e => setAmbassadorForm({...ambassadorForm, name: e.target.value})} required />
                      <Input label="Email" type="email" name="email" value={ambassadorForm.email} onChange={e => setAmbassadorForm({...ambassadorForm, email: e.target.value})} required />
                      <Input label="PID" name="pid" value={ambassadorForm.pid} onChange={e => setAmbassadorForm({...ambassadorForm, pid: e.target.value})} required />
                      <Select label="Year" name="year" value={ambassadorForm.year} onChange={e => setAmbassadorForm({...ambassadorForm, year: e.target.value})} required
                        options={[
                          { value: 'freshman', label: 'First Year' },
                          { value: 'sophomore', label: 'Sophomore' },
                          { value: 'junior', label: 'Junior' },
                          { value: 'senior', label: 'Senior' },
                          { value: 'grad', label: 'Graduate Student' },
                        ]}
                      />
                      <Input label="Major" name="major" value={ambassadorForm.major} onChange={e => setAmbassadorForm({...ambassadorForm, major: e.target.value})} required />
                      <Textarea label="Why do you want to be a Wellness Ambassador?" name="motivation" value={ambassadorForm.motivation} onChange={e => setAmbassadorForm({...ambassadorForm, motivation: e.target.value})} required rows={4} />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356] transition-colors">
                          Submit Application
                        </button>
                        <button type="button" onClick={() => setShowAmbassadorForm(false)} className="px-6 py-3 rounded font-medium text-[#8b949e] border border-[#30363d] hover:bg-[#21262d] transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CAPS Advocacy Tab */}
          {activeTab === 'advocacy' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">CAPS Expansion Advocacy</h2>
              <p className="text-[#8b949e] mb-8">Join us in advocating for expanded mental health services</p>

              {/* Progress */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
                <h3 className="font-semibold text-[#f0f6fc] mb-6 uppercase text-sm tracking-widest">Campaign Progress</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#f0f6fc] font-medium">Petition Signatures</span>
                      <span className="text-[#8b949e] font-mono">3,420 / 5,000</span>
                    </div>
                    <div className="h-2 bg-[#21262d] rounded overflow-hidden">
                      <div className="h-full bg-[#3fb950] rounded" style={{ width: '68%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#f0f6fc] font-medium">Meetings with Administration</span>
                      <span className="text-[#8b949e] font-mono">5 / 8</span>
                    </div>
                    <div className="h-2 bg-[#21262d] rounded overflow-hidden">
                      <div className="h-full bg-[#58a6ff] rounded" style={{ width: '62%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <h3 className="text-sm font-semibold text-[#f0f6fc] tracking-widest uppercase mb-5">Take Action</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-[#161b22] border border-[#3fb950] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-2">Sign the Petition</h4>
                  <p className="text-sm text-[#8b949e] mb-5">Add your voice to demand expanded CAPS hours and more counselors.</p>
                  <button className="bg-[#3fb950] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#46c356] transition-colors uppercase text-sm tracking-wide">
                    Sign Petition
                  </button>
                </div>
                <div className="bg-[#161b22] border border-[#58a6ff] rounded-lg p-6">
                  <h4 className="font-semibold text-[#f0f6fc] mb-2">Contact Administration</h4>
                  <p className="text-sm text-[#8b949e] mb-5">Send a pre-written email to university leadership.</p>
                  <button className="bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded font-semibold hover:bg-[#79b8ff] transition-colors uppercase text-sm tracking-wide">
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* All Policies Tab */}
          {activeTab === 'policies' && (
            <div>
              <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-8">Wellness Department Policies</h2>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#f0f6fc]">{policy.title}</h3>
                      <span className={`px-2.5 py-1 rounded text-xs font-mono border ${
                        policy.status === 'completed' ? 'bg-[#3fb950]/10 text-[#3fb950] border-[#3fb950]' :
                        policy.status === 'in_progress' ? 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]' :
                        'bg-[#21262d] text-[#6e7681] border-[#30363d]'
                      }`}>
                        {policy.status === 'in_progress' ? 'IN PROGRESS' : policy.status === 'completed' ? 'COMPLETED' : 'PLANNED'}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-4">{policy.description}</p>
                    <div className="flex justify-between text-xs text-[#6e7681] mb-2">
                      <span className="uppercase tracking-widest">Progress</span>
                      <span className="font-mono">{policy.progress}%</span>
                    </div>
                    <div className="h-2 bg-[#21262d] rounded overflow-hidden">
                      <div className="h-full bg-[#3fb950] rounded transition-all" style={{ width: `${policy.progress}%` }} />
                    </div>
                    {policy.digitalFeatures && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {policy.digitalFeatures.map(f => (
                          <span key={f} className="px-2.5 py-1 bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/30 rounded text-xs font-mono">
                            {f.replace(/-/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}
