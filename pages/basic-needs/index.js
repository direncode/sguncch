import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button } from '../../components/FormInput'
import { useApp } from '../../lib/store'

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
    { id: 'policies', label: 'All Policies' },
  ]

  return (
    <Layout>
      <Head>
        <title>Basic Needs | Project Bold</title>
      </Head>

      {/* Hero - Apple style */}
      <div className="bg-gradient-to-b from-[#ff9500] to-[#ff7b00] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">🍎</span>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Basic Needs</h1>
          </div>
          <p className="text-white/90 text-lg max-w-2xl">
            Food security, housing support, textbook affordability, and technology access.
            No Tar Heel should struggle to meet basic needs.
          </p>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-[#ff3b30]/10 border-b border-[#ff3b30]/20 py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[#ff3b30] font-medium">Need immediate assistance?</p>
          <a href="tel:919-962-8396" className="px-5 py-2.5 bg-[#ff3b30] text-white rounded-full text-sm font-medium hover:bg-[#ff453a] transition">
            Dean of Students: 919-962-8396
          </a>
        </div>
      </div>

      {/* Tabs - Apple style */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-[#e8e8ed] sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#ff9500] text-white'
                    : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {submitted && (
          <div className="mb-6 bg-[#34c759]/10 rounded-2xl p-5">
            <p className="text-[#34c759] font-medium">
              {submitted === 'housing' && 'Your emergency housing application has been submitted. A case manager will contact you within 24-48 hours.'}
              {submitted === 'tech' && 'Your technology loaner request has been submitted. We will email you pickup details within 2-3 business days.'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-[#34c759] text-sm mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Food Pantry Tab */}
        {activeTab === 'food' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Carolina Cupboard Food Pantry</h2>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#ff9500]">4,200</p>
                <p className="text-sm text-[#86868b] mt-1">Visits This Semester</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759]">3</p>
                <p className="text-sm text-[#86868b] mt-1">Locations</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3]">890</p>
                <p className="text-sm text-[#86868b] mt-1">Donations Received</p>
              </div>
              <div className="bg-[#af52de]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#af52de]">100%</p>
                <p className="text-sm text-[#86868b] mt-1">Confidential</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Pantry Locations</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {pantryLocations.map(loc => (
                  <div key={loc.id} className="bg-white rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-[#1d1d1f]">{loc.name}</h4>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        loc.inventory === 'high' ? 'bg-[#34c759]/10 text-[#34c759]' :
                        loc.inventory === 'medium' ? 'bg-[#ff9500]/10 text-[#ff9500]' :
                        'bg-[#ff3b30]/10 text-[#ff3b30]'
                      }`}>
                        {loc.inventory} stock
                      </span>
                    </div>
                    <p className="text-sm text-[#6e6e73]">{loc.address}</p>
                    <p className="text-sm text-[#86868b] mt-1">Hours: {loc.hours}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6">How It Works</h3>
              <ol className="space-y-6">
                {[
                  { step: 1, title: 'Visit any location during open hours', desc: 'No appointment or registration required' },
                  { step: 2, title: 'Swipe your OneCard', desc: 'This helps us track usage anonymously for funding' },
                  { step: 3, title: 'Select what you need', desc: 'Fresh produce, pantry staples, personal care items' },
                ].map(item => (
                  <li key={item.step} className="flex gap-5">
                    <span className="w-10 h-10 bg-[#ff9500] text-white rounded-full flex items-center justify-center font-semibold shrink-0">{item.step}</span>
                    <div>
                      <p className="font-semibold text-[#1d1d1f]">{item.title}</p>
                      <p className="text-sm text-[#6e6e73] mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-[#ff9500]/10 rounded-2xl p-6">
              <h3 className="font-semibold text-[#1d1d1f] mb-2">Want to Help?</h3>
              <p className="text-sm text-[#6e6e73] mb-4">Donate food items or volunteer at Carolina Cupboard.</p>
              <div className="flex gap-3">
                <Button>Donate Items</Button>
                <Button variant="secondary">Volunteer</Button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Housing Tab */}
        {activeTab === 'housing' && (
          <div className="space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Emergency Housing Fund</h2>
                <p className="text-[#6e6e73] mt-2">Financial assistance for students facing housing insecurity</p>
              </div>
              <Button onClick={() => setShowHousingForm(true)}>Apply for Assistance</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#ff9500]">$18,500</p>
                <p className="text-sm text-[#86868b] mt-1">Distributed This Year</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759]">12</p>
                <p className="text-sm text-[#86868b] mt-1">Students Helped</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3]">48hrs</p>
                <p className="text-sm text-[#86868b] mt-1">Avg Response Time</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">Eligibility</h3>
              <ul className="space-y-3 text-[#6e6e73]">
                {['Currently enrolled UNC student', 'Facing unexpected housing emergency (eviction, family crisis, etc.)', 'Demonstrated financial need'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#34c759] mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {showHousingForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6">Emergency Housing Assistance Application</h3>
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
                      <Button type="submit">Submit Application</Button>
                      <Button variant="secondary" onClick={() => setShowHousingForm(false)}>Cancel</Button>
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
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Textbook Affordability Initiative</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#ff9500]">127</p>
                <p className="text-sm text-[#86868b] mt-1">OER Courses Available</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759]">$245K</p>
                <p className="text-sm text-[#86868b] mt-1">Student Savings</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3]">890</p>
                <p className="text-sm text-[#86868b] mt-1">Books Exchanged</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">Find Free/Low-Cost Textbooks</h3>
              <div className="flex gap-4">
                <Input placeholder="Search by course (e.g., ECON 101)" className="flex-1" />
                <Button>Search</Button>
              </div>
              <p className="text-sm text-[#86868b] mt-3">Search our OER database for free open educational resources</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Resources</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'UNC Library Course Reserves', desc: 'Free 2-hour textbook loans at Davis Library' },
                  { title: 'Textbook Exchange', desc: 'Buy/sell used textbooks with other students' },
                  { title: 'Cost Calculator', desc: 'Compare prices across bookstores and rental services' },
                  { title: 'Professor OER Guide', desc: 'Resources for faculty adopting open textbooks' },
                ].map((item, i) => (
                  <a key={i} href="#" className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all">
                    <h4 className="font-semibold text-[#1d1d1f]">{item.title}</h4>
                    <p className="text-sm text-[#6e6e73] mt-1">{item.desc}</p>
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
                <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Technology Loaner Program</h2>
                <p className="text-[#6e6e73] mt-2">Borrow laptops and Wi-Fi hotspots for academic use</p>
              </div>
              <Button onClick={() => setShowTechForm(true)}>Request Device</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-[#ff9500]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#ff9500]">150</p>
                <p className="text-sm text-[#86868b] mt-1">Devices Available</p>
              </div>
              <div className="bg-[#34c759]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#34c759]">89</p>
                <p className="text-sm text-[#86868b] mt-1">Currently Loaned</p>
              </div>
              <div className="bg-[#0071e3]/10 rounded-2xl p-5 text-center">
                <p className="text-4xl font-semibold text-[#0071e3]">23</p>
                <p className="text-sm text-[#86868b] mt-1">On Waitlist</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Available Devices</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: 'Laptop (Windows)', available: 28, total: 80 },
                  { name: 'Laptop (Mac)', available: 12, total: 40 },
                  { name: 'Wi-Fi Hotspot', available: 21, total: 30 },
                ].map((device, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5">
                    <h4 className="font-semibold text-[#1d1d1f]">{device.name}</h4>
                    <p className="text-sm text-[#86868b] mt-1">{device.available} of {device.total} available</p>
                    <div className="mt-3 h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff9500] rounded-full" style={{ width: `${(device.available / device.total) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showTechForm && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-semibold text-[#1d1d1f] mb-6">Request Technology Loaner</h3>
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
                      <Button type="submit">Submit Request</Button>
                      <Button variant="secondary" onClick={() => setShowTechForm(false)}>Cancel</Button>
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
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Financial Literacy Program</h2>

            <div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Upcoming Workshops</h3>
              <div className="space-y-3">
                {[
                  { title: 'Budgeting 101', date: 'Feb 5, 2026', time: '5:00 PM', location: 'Student Union 2510' },
                  { title: 'Understanding Student Loans', date: 'Feb 12, 2026', time: '5:00 PM', location: 'Virtual' },
                  { title: 'Building Credit', date: 'Feb 19, 2026', time: '5:00 PM', location: 'Student Union 2510' },
                  { title: 'Taxes for Students', date: 'Mar 5, 2026', time: '5:00 PM', location: 'Virtual' },
                ].map((workshop, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-[#1d1d1f]">{workshop.title}</h4>
                      <p className="text-sm text-[#86868b] mt-0.5">{workshop.date} at {workshop.time} | {workshop.location}</p>
                    </div>
                    <Button variant="secondary">Register</Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Resources</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5">
                  <h4 className="font-semibold text-[#1d1d1f]">Budget Template</h4>
                  <p className="text-sm text-[#6e6e73] my-3">Download our student budget spreadsheet</p>
                  <Button variant="secondary">Download</Button>
                </div>
                <div className="bg-white rounded-2xl p-5">
                  <h4 className="font-semibold text-[#1d1d1f]">Financial Aid Office</h4>
                  <p className="text-sm text-[#6e6e73] my-3">Schedule a one-on-one advising session</p>
                  <Button variant="secondary">Schedule</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Basic Needs Department Policies</h2>
            <div className="space-y-4">
              {deptPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[#1d1d1f]">{policy.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      policy.status === 'completed' ? 'bg-[#34c759]/10 text-[#34c759]' :
                      policy.status === 'in_progress' ? 'bg-[#0071e3]/10 text-[#0071e3]' :
                      'bg-[#f5f5f7] text-[#86868b]'
                    }`}>
                      {policy.status === 'in_progress' ? 'In Progress' : policy.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#6e6e73] mb-4">{policy.description}</p>
                  <div className="flex justify-between text-xs text-[#86868b] mb-1.5">
                    <span>Progress</span>
                    <span>{policy.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-[#f5f5f7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff9500] rounded-full" style={{ width: `${policy.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </Layout>
  )
}
