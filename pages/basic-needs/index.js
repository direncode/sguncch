import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'
import { departmentContacts, departmentFAQs, departmentAnnouncements, serviceGuides } from '../../lib/data'

export default function BasicNeedsPage() {
  const [activeTab, setActiveTab] = useState('food')
  const [showHousingForm, setShowHousingForm] = useState(false)
  const [showTechForm, setShowTechForm] = useState(false)
  const [housingForm, setHousingForm] = useState({ name: '', email: '', pid: '', situation: '', urgency: '', amount: '' })
  const [techForm, setTechForm] = useState({ name: '', email: '', pid: '', device: '', reason: '', duration: '' })
  const [submitted, setSubmitted] = useState(null)
  const { policies, operationalData } = useApp()

  const pantryLocations = operationalData?.foodPantry?.locations || []
  const deptPolicies = policies.filter(p => p.department === 'basic-needs')

  const tabs = [
    { id: 'food', label: 'Food Pantry' },
    { id: 'housing', label: 'Emergency Housing' },
    { id: 'textbooks', label: 'Textbooks' },
    { id: 'technology', label: 'Tech Loaner' },
    { id: 'financial', label: 'Financial Literacy' },
    { id: 'faq', label: 'FAQ & Contact' },
    { id: 'policies', label: 'All Policies' },
  ]

  const contact = departmentContacts['basic-needs']
  const faqs = departmentFAQs['basic-needs']
  const announcements = departmentAnnouncements['basic-needs']
  const pantryGuide = serviceGuides['food-pantry']
  const techGuide = serviceGuides['tech-loaner']
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState({ topic: '', message: '', email: '' })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()
    setFeedbackSubmitted(true)
    setFeedbackForm({ topic: '', message: '', email: '' })
  }

  return (
    <Layout>
      <Head>
        <title>Basic Needs | Project Bold</title>
      </Head>

      {/* Hero - Palantir dark style with grid */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#d29922 1px, transparent 1px), linear-gradient(90deg, #d29922 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#d29922]/20 border border-[#d29922]/40 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🍎</span>
            </div>
            <div>
              <p className="text-[#d29922] text-xs font-mono uppercase tracking-widest mb-1">Student Services</p>
              <h1 className="text-4xl md:text-5xl font-semibold text-[#f0f6fc] tracking-tight">Basic Needs</h1>
            </div>
          </div>
          <p className="text-[#8b949e] text-lg max-w-2xl mt-4">
            Food security, housing support, textbook affordability, and technology access.
            No Tar Heel should struggle to meet basic needs.
          </p>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-[#0d1117] border-b border-[#30363d] py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <p className="text-red-400 font-medium text-sm">Need immediate assistance?</p>
          </div>
          <a href="tel:919-962-8396" className="px-5 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm font-medium hover:bg-red-500/20 transition">
            Dean of Students: 919-962-8396
          </a>
        </div>
      </div>

      {/* Tabs - Palantir style */}
      <div className="bg-[#0d1117] border-b border-[#30363d] sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-xs font-medium uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[#d29922] border-[#d29922]'
                    : 'text-[#6e7681] border-transparent hover:text-[#8b949e] hover:border-[#30363d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-[#0a0e14] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {submitted && (
            <div className="mb-6 bg-[#161b22] border border-green-500/30 rounded-lg p-5">
              <p className="text-green-400 font-medium">
                {submitted === 'housing' && 'Your emergency housing application has been submitted. A case manager will contact you within 24-48 hours.'}
                {submitted === 'tech' && 'Your technology loaner request has been submitted. We will email you pickup details within 2-3 business days.'}
              </p>
              <button onClick={() => setSubmitted(null)} className="text-green-400/70 text-sm mt-2 hover:text-green-400">Dismiss</button>
            </div>
          )}

          {/* Food Pantry Tab */}
          {activeTab === 'food' && (
            <div className="space-y-8">
              <div>
                <p className="text-[#d29922] text-xs font-mono uppercase tracking-widest mb-2">Food Security</p>
                <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Carolina Cupboard Food Pantry</h2>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-[#d29922]">4,200</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Visits This Semester</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-green-400">3</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Locations</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-blue-400">890</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Donations Received</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-purple-400">100%</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Confidential</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#d29922] rounded-full" />
                  Pantry Locations
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {pantryLocations.map(loc => (
                    <div key={loc.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-[#f0f6fc]">{loc.name}</h4>
                        <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase border ${
                          loc.inventory === 'high' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                          loc.inventory === 'medium' ? 'border-[#d29922]/30 text-[#d29922] bg-[#d29922]/10' :
                          'border-red-500/30 text-red-400 bg-red-500/10'
                        }`}>
                          {loc.inventory}
                        </span>
                      </div>
                      <p className="text-sm text-[#8b949e]">{loc.address}</p>
                      <p className="text-sm text-[#6e7681] mt-1">Hours: {loc.hours}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8">
                <h3 className="text-lg font-semibold text-[#f0f6fc] mb-6 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#d29922] rounded-full" />
                  How It Works
                </h3>
                <ol className="space-y-6">
                  {[
                    { step: 1, title: 'Visit any location during open hours', desc: 'No appointment or registration required' },
                    { step: 2, title: 'Swipe your OneCard', desc: 'This helps us track usage anonymously for funding' },
                    { step: 3, title: 'Select what you need', desc: 'Fresh produce, pantry staples, personal care items' },
                  ].map(item => (
                    <li key={item.step} className="flex gap-5">
                      <span className="w-10 h-10 bg-[#d29922]/20 border border-[#d29922]/40 text-[#d29922] rounded-lg flex items-center justify-center font-mono font-semibold shrink-0">{item.step}</span>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">{item.title}</p>
                        <p className="text-sm text-[#6e7681] mt-0.5">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-[#161b22] border border-[#d29922]/30 rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-2">Want to Help?</h3>
                <p className="text-sm text-[#8b949e] mb-4">Donate food items or volunteer at Carolina Cupboard.</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-[#d29922] text-[#0a0e14] rounded text-sm font-medium hover:bg-[#e5a526] transition">Donate Items</button>
                  <button className="px-4 py-2 bg-transparent border border-[#30363d] text-[#8b949e] rounded text-sm font-medium hover:border-[#d29922] hover:text-[#d29922] transition">Volunteer</button>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Housing Tab */}
          {activeTab === 'housing' && (
            <div className="space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#d29922] text-xs font-mono uppercase tracking-widest mb-2">Emergency Services</p>
                  <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Emergency Housing Fund</h2>
                  <p className="text-[#8b949e] mt-2">Financial assistance for students facing housing insecurity</p>
                </div>
                <button onClick={() => setShowHousingForm(true)} className="px-4 py-2 bg-[#d29922] text-[#0a0e14] rounded text-sm font-medium hover:bg-[#e5a526] transition">
                  Apply for Assistance
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-[#d29922]">$18,500</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Distributed This Year</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-green-400">12</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Students Helped</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-blue-400">48hrs</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Avg Response Time</p>
                </div>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#d29922] rounded-full" />
                  Eligibility
                </h3>
                <ul className="space-y-3 text-[#8b949e]">
                  {['Currently enrolled UNC student', 'Facing unexpected housing emergency (eviction, family crisis, etc.)', 'Demonstrated financial need'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {showHousingForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">Emergency Housing Assistance Application</h3>
                    <form onSubmit={(e) => { e.preventDefault(); setSubmitted('housing'); setShowHousingForm(false) }} className="space-y-4">
                      <Input label="Full Name" name="name" value={housingForm.name} onChange={e => setHousingForm({...housingForm, name: e.target.value})} required />
                      <Input label="Email" type="email" name="email" value={housingForm.email} onChange={e => setHousingForm({...housingForm, email: e.target.value})} required />
                      <Input label="PID" name="pid" value={housingForm.pid} onChange={e => setHousingForm({...housingForm, pid: e.target.value})} required />
                      <Select label="Urgency Level" name="urgency" value={housingForm.urgency} onChange={e => setHousingForm({...housingForm, urgency: e.target.value})} required
                        options={[
                          { value: 'immediate', label: 'Immediate (homeless tonight)' },
                          { value: 'week', label: 'Within a week' },
                          { value: 'month', label: 'Within a month' },
                        ]}
                      />
                      <Textarea label="Describe your situation" name="situation" value={housingForm.situation} onChange={e => setHousingForm({...housingForm, situation: e.target.value})} required rows={4} />
                      <Input label="Amount Needed (if known)" name="amount" value={housingForm.amount} onChange={e => setHousingForm({...housingForm, amount: e.target.value})} placeholder="$" />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="px-4 py-2 bg-[#d29922] text-[#0a0e14] rounded text-sm font-medium hover:bg-[#e5a526] transition">Submit Application</button>
                        <button type="button" onClick={() => setShowHousingForm(false)} className="px-4 py-2 bg-transparent border border-[#30363d] text-[#8b949e] rounded text-sm font-medium hover:border-[#6e7681] transition">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Textbooks Tab */}
          {activeTab === 'textbooks' && (
            <div className="space-y-8">
              <div>
                <p className="text-[#d29922] text-xs font-mono uppercase tracking-widest mb-2">Academic Resources</p>
                <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Textbook Affordability Initiative</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-[#d29922]">127</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">OER Courses Available</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-green-400">$245K</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Student Savings</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-blue-400">890</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Books Exchanged</p>
                </div>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold text-[#f0f6fc] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#d29922] rounded-full" />
                  Find Free/Low-Cost Textbooks
                </h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search by course (e.g., ECON 101)"
                    className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-4 py-2 text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:border-[#d29922]"
                  />
                  <button className="px-4 py-2 bg-[#d29922] text-[#0a0e14] rounded text-sm font-medium hover:bg-[#e5a526] transition">Search</button>
                </div>
                <p className="text-sm text-[#6e7681] mt-3">Search our OER database for free open educational resources</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#d29922] rounded-full" />
                  Resources
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'UNC Library Course Reserves', desc: 'Free 2-hour textbook loans at Davis Library' },
                    { title: 'Textbook Exchange', desc: 'Buy/sell used textbooks with other students' },
                    { title: 'Cost Calculator', desc: 'Compare prices across bookstores and rental services' },
                    { title: 'Professor OER Guide', desc: 'Resources for faculty adopting open textbooks' },
                  ].map((item, i) => (
                    <a key={i} href="#" className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#d29922] transition-all group">
                      <h4 className="font-semibold text-[#f0f6fc] group-hover:text-[#d29922] transition">{item.title}</h4>
                      <p className="text-sm text-[#6e7681] mt-1">{item.desc}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Technology Loaner Tab */}
          {activeTab === 'technology' && (
            <div className="space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#d29922] text-xs font-mono uppercase tracking-widest mb-2">Technology Access</p>
                  <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Technology Loaner Program</h2>
                  <p className="text-[#8b949e] mt-2">Borrow laptops and Wi-Fi hotspots for academic use</p>
                </div>
                <button onClick={() => setShowTechForm(true)} className="px-4 py-2 bg-[#d29922] text-[#0a0e14] rounded text-sm font-medium hover:bg-[#e5a526] transition">
                  Request Device
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-[#d29922]">150</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Devices Available</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-green-400">89</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">Currently Loaned</p>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 text-center">
                  <p className="text-4xl font-mono font-semibold text-blue-400">23</p>
                  <p className="text-xs text-[#6e7681] mt-2 uppercase tracking-wide">On Waitlist</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#d29922] rounded-full" />
                  Available Devices
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: 'Laptop (Windows)', available: 28, total: 80 },
                    { name: 'Laptop (Mac)', available: 12, total: 40 },
                    { name: 'Wi-Fi Hotspot', available: 21, total: 30 },
                  ].map((device, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                      <h4 className="font-semibold text-[#f0f6fc]">{device.name}</h4>
                      <p className="text-sm text-[#6e7681] mt-1 font-mono">{device.available} of {device.total} available</p>
                      <div className="mt-3 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div className="h-full bg-[#d29922] rounded-full" style={{ width: `${(device.available / device.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {showTechForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">Request Technology Loaner</h3>
                    <form onSubmit={(e) => { e.preventDefault(); setSubmitted('tech'); setShowTechForm(false) }} className="space-y-4">
                      <Input label="Full Name" name="name" value={techForm.name} onChange={e => setTechForm({...techForm, name: e.target.value})} required />
                      <Input label="Email" type="email" name="email" value={techForm.email} onChange={e => setTechForm({...techForm, email: e.target.value})} required />
                      <Input label="PID" name="pid" value={techForm.pid} onChange={e => setTechForm({...techForm, pid: e.target.value})} required />
                      <Select label="Device Type" name="device" value={techForm.device} onChange={e => setTechForm({...techForm, device: e.target.value})} required
                        options={[
                          { value: 'laptop-windows', label: 'Laptop (Windows)' },
                          { value: 'laptop-mac', label: 'Laptop (Mac)' },
                          { value: 'hotspot', label: 'Wi-Fi Hotspot' },
                        ]}
                      />
                      <Select label="Loan Duration" name="duration" value={techForm.duration} onChange={e => setTechForm({...techForm, duration: e.target.value})} required
                        options={[
                          { value: 'semester', label: 'Full Semester' },
                          { value: 'month', label: '1 Month' },
                          { value: 'week', label: '1 Week' },
                        ]}
                      />
                      <Textarea label="Reason for Request" name="reason" value={techForm.reason} onChange={e => setTechForm({...techForm, reason: e.target.value})} required />
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="px-4 py-2 bg-[#d29922] text-[#0a0e14] rounded text-sm font-medium hover:bg-[#e5a526] transition">Submit Request</button>
                        <button type="button" onClick={() => setShowTechForm(false)} className="px-4 py-2 bg-transparent border border-[#30363d] text-[#8b949e] rounded text-sm font-medium hover:border-[#6e7681] transition">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Financial Literacy Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-8">
              <div>
                <p className="text-[#d29922] text-xs font-mono uppercase tracking-widest mb-2">Financial Education</p>
                <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Financial Literacy Program</h2>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#d29922] rounded-full" />
                  Upcoming Workshops
                </h3>
                <div className="space-y-3">
                  {[
                    { title: 'Budgeting 101', date: 'Feb 5, 2026', time: '5:00 PM', location: 'Student Union 2510' },
                    { title: 'Understanding Student Loans', date: 'Feb 12, 2026', time: '5:00 PM', location: 'Virtual' },
                    { title: 'Building Credit', date: 'Feb 19, 2026', time: '5:00 PM', location: 'Student Union 2510' },
                    { title: 'Taxes for Students', date: 'Mar 5, 2026', time: '5:00 PM', location: 'Virtual' },
                  ].map((workshop, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[#f0f6fc]">{workshop.title}</h4>
                        <p className="text-sm text-[#6e7681] mt-0.5 font-mono">{workshop.date} at {workshop.time} | {workshop.location}</p>
                      </div>
                      <button className="px-4 py-2 bg-transparent border border-[#30363d] text-[#8b949e] rounded text-sm font-medium hover:border-[#d29922] hover:text-[#d29922] transition">Register</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#d29922] rounded-full" />
                  Resources
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <h4 className="font-semibold text-[#f0f6fc]">Budget Template</h4>
                    <p className="text-sm text-[#6e7681] my-3">Download our student budget spreadsheet</p>
                    <button className="px-4 py-2 bg-transparent border border-[#30363d] text-[#8b949e] rounded text-sm font-medium hover:border-[#d29922] hover:text-[#d29922] transition">Download</button>
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <h4 className="font-semibold text-[#f0f6fc]">Financial Aid Office</h4>
                    <p className="text-sm text-[#6e7681] my-3">Schedule a one-on-one advising session</p>
                    <button className="px-4 py-2 bg-transparent border border-[#30363d] text-[#8b949e] rounded text-sm font-medium hover:border-[#d29922] hover:text-[#d29922] transition">Schedule</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ & Contact Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div>
                  <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight mb-6">Contact Us</h2>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#d29922]/20 border border-[#d29922]/40 rounded-full flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[#f0f6fc]">{contact.lead.name}</p>
                        <p className="text-sm text-[#8b949e]">{contact.lead.title}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📍</span>
                        <span className="text-[#f0f6fc]">{contact.office}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">🕐</span>
                        <span className="text-[#f0f6fc]">{contact.hours}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📧</span>
                        <a href={`mailto:${contact.lead.email}`} className="text-[#58a6ff] hover:underline">{contact.lead.email}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8b949e]">📱</span>
                        <span className="text-[#f0f6fc]">{contact.socialMedia}</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Form */}
                  <div className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                    <h3 className="font-semibold text-[#f0f6fc] mb-4">Send Feedback</h3>
                    {feedbackSubmitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-[#d29922]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-[#d29922] font-medium">Thanks for your feedback!</p>
                        <button onClick={() => setFeedbackSubmitted(false)} className="text-[#58a6ff] text-sm mt-2 hover:underline">Send another</button>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <Select label="Topic" name="topic" value={feedbackForm.topic} onChange={e => setFeedbackForm({...feedbackForm, topic: e.target.value})} required
                          options={[
                            { value: 'food-pantry', label: 'Food Pantry' },
                            { value: 'housing', label: 'Emergency Housing' },
                            { value: 'tech-loaner', label: 'Tech Loaner' },
                            { value: 'other', label: 'Other' },
                          ]}
                        />
                        <Textarea label="Message" name="message" value={feedbackForm.message} onChange={e => setFeedbackForm({...feedbackForm, message: e.target.value})} required rows={3} />
                        <Input label="Email (optional)" type="email" name="email" value={feedbackForm.email} onChange={e => setFeedbackForm({...feedbackForm, email: e.target.value})} />
                        <button type="submit" className="w-full bg-[#d29922] text-[#0a0e14] px-4 py-2.5 rounded font-semibold hover:bg-[#e5a526] transition-colors">
                          Submit Feedback
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* FAQ Section */}
                <div>
                  <h2 className="text-2xl font-semibold text-[#f0f6fc] tracking-tight mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                          className="w-full text-left p-4 flex items-center justify-between hover:bg-[#21262d] transition-colors"
                        >
                          <span className="font-medium text-[#f0f6fc] pr-4">{faq.q}</span>
                          <span className="text-[#8b949e] flex-shrink-0">{expandedFaq === i ? '−' : '+'}</span>
                        </button>
                        {expandedFaq === i && (
                          <div className="px-4 pb-4 text-[#8b949e] text-sm border-t border-[#30363d] pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* How-To Guides */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-4">{pantryGuide.title}</h3>
                  <div className="space-y-3">
                    {pantryGuide.steps.map((step) => (
                      <div key={step.step} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex gap-4">
                        <div className="w-8 h-8 bg-[#d29922]/20 border border-[#d29922]/40 text-[#d29922] rounded flex items-center justify-center font-mono font-semibold shrink-0 text-sm">
                          {step.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc] text-sm">{step.title}</h4>
                          <p className="text-xs text-[#8b949e] mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-4">{techGuide.title}</h3>
                  <div className="space-y-3">
                    {techGuide.steps.map((step) => (
                      <div key={step.step} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex gap-4">
                        <div className="w-8 h-8 bg-[#d29922]/20 border border-[#d29922]/40 text-[#d29922] rounded flex items-center justify-center font-mono font-semibold shrink-0 text-sm">
                          {step.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#f0f6fc] text-sm">{step.title}</h4>
                          <p className="text-xs text-[#8b949e] mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Announcements */}
              <div>
                <h3 className="text-lg font-semibold text-[#f0f6fc] tracking-tight mb-4">Recent Updates</h3>
                <div className="space-y-3">
                  {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex items-start gap-4">
                      <div className={`px-2 py-1 rounded text-xs font-mono ${
                        ann.type === 'event' ? 'bg-[#58a6ff]/10 text-[#58a6ff] border border-[#58a6ff]' :
                        ann.type === 'deadline' ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]' :
                        'bg-green-500/10 text-green-400 border border-green-500'
                      }`}>
                        {ann.type.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-[#f0f6fc]">{ann.title}</h4>
                          <span className="text-xs text-[#6e7681] font-mono">{ann.date}</span>
                        </div>
                        <p className="text-sm text-[#8b949e]">{ann.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-8">
              <div>
                <p className="text-[#d29922] text-xs font-mono uppercase tracking-widest mb-2">Policy Tracking</p>
                <h2 className="text-3xl font-semibold text-[#f0f6fc] tracking-tight">Basic Needs Department Policies</h2>
              </div>
              <div className="space-y-4">
                {deptPolicies.map(policy => (
                  <div key={policy.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-[#f0f6fc]">{policy.title}</h3>
                      <span className={`px-2.5 py-1 rounded text-xs font-mono uppercase border ${
                        policy.status === 'completed' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                        policy.status === 'in_progress' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                        'border-[#30363d] text-[#6e7681] bg-[#21262d]'
                      }`}>
                        {policy.status === 'in_progress' ? 'In Progress' : policy.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-4">{policy.description}</p>
                    <div className="flex justify-between text-xs text-[#6e7681] mb-1.5 font-mono">
                      <span>Progress</span>
                      <span>{policy.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                      <div className="h-full bg-[#d29922] rounded-full" style={{ width: `${policy.progress}%` }} />
                    </div>
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
