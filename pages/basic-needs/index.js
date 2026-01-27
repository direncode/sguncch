import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button, Checkbox } from '../../components/FormInput'
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

  return (
    <Layout>
      <Head>
        <title>Basic Needs | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🍎</span>
            <h1 className="text-3xl md:text-4xl font-bold">Basic Needs</h1>
          </div>
          <p className="text-orange-100 max-w-2xl">
            Food security, housing support, textbook affordability, and technology access.
            No Tar Heel should struggle to meet basic needs.
          </p>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-orange-100 border-b border-orange-200 py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-orange-800 font-medium">Need immediate assistance?</p>
          <div className="flex gap-3 text-sm">
            <a href="tel:919-962-8396" className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700">Dean of Students: 919-962-8396</a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'food', label: 'Food Pantry' },
              { id: 'housing', label: 'Emergency Housing' },
              { id: 'textbooks', label: 'Textbooks' },
              { id: 'technology', label: 'Tech Loaner' },
              { id: 'financial', label: 'Financial Literacy' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {submitted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              {submitted === 'housing' && 'Your emergency housing application has been submitted. A case manager will contact you within 24-48 hours.'}
              {submitted === 'tech' && 'Your technology loaner request has been submitted. We will email you pickup details within 2-3 business days.'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-green-600 text-sm mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Food Pantry Tab */}
        {activeTab === 'food' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Carolina Cupboard Food Pantry</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">4,200</p>
                <p className="text-sm text-gray-600">Visits This Semester</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">3</p>
                <p className="text-sm text-gray-600">Locations</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">890</p>
                <p className="text-sm text-gray-600">Donations Received</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">100%</p>
                <p className="text-sm text-gray-600">Confidential</p>
              </div>
            </div>

            {/* Locations */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Pantry Locations</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {pantryLocations.map(loc => (
                <div key={loc.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-[#13294B]">{loc.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      loc.inventory === 'high' ? 'bg-green-100 text-green-800' :
                      loc.inventory === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {loc.inventory} stock
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{loc.address}</p>
                  <p className="text-sm text-gray-500 mt-1">Hours: {loc.hours}</p>
                </div>
              ))}
            </div>

            {/* How it Works */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">How It Works</h3>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <p className="font-medium text-[#13294B]">Visit any location during open hours</p>
                    <p className="text-sm text-gray-600">No appointment or registration required</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <p className="font-medium text-[#13294B]">Swipe your OneCard</p>
                    <p className="text-sm text-gray-600">This helps us track usage anonymously for funding</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <p className="font-medium text-[#13294B]">Select what you need</p>
                    <p className="text-sm text-gray-600">Fresh produce, pantry staples, personal care items</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Donate */}
            <div className="mt-8 bg-orange-50 rounded-lg p-6 border border-orange-200">
              <h3 className="font-bold text-orange-800 mb-2">Want to Help?</h3>
              <p className="text-sm text-orange-700 mb-4">Donate food items or volunteer at Carolina Cupboard.</p>
              <div className="flex gap-3">
                <Button>Donate Items</Button>
                <Button variant="secondary">Volunteer</Button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Housing Tab */}
        {activeTab === 'housing' && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#13294B]">Emergency Housing Fund</h2>
                <p className="text-gray-600 mt-1">Financial assistance for students facing housing insecurity</p>
              </div>
              <Button onClick={() => setShowHousingForm(true)}>Apply for Assistance</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">$18,500</p>
                <p className="text-sm text-gray-600">Distributed This Year</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">12</p>
                <p className="text-sm text-gray-600">Students Helped</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">48hrs</p>
                <p className="text-sm text-gray-600">Avg Response Time</p>
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">Eligibility</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Currently enrolled UNC student
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Facing unexpected housing emergency (eviction, family crisis, etc.)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Demonstrated financial need
                </li>
              </ul>
            </div>

            {/* Form Modal */}
            {showHousingForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Emergency Housing Assistance Application</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted('housing'); setShowHousingForm(false); }} className="space-y-4">
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
                    <div className="flex gap-3">
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
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Textbook Affordability Initiative</h2>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">127</p>
                <p className="text-sm text-gray-600">OER Courses Available</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">$245K</p>
                <p className="text-sm text-gray-600">Student Savings</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">890</p>
                <p className="text-sm text-gray-600">Books Exchanged</p>
              </div>
            </div>

            {/* OER Search */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">Find Free/Low-Cost Textbooks</h3>
              <div className="flex gap-4">
                <Input placeholder="Search by course (e.g., ECON 101)" className="flex-1" />
                <Button>Search</Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">Search our OER database for free open educational resources</p>
            </div>

            {/* Resources */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Resources</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="#" className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                <h4 className="font-bold text-[#13294B]">UNC Library Course Reserves</h4>
                <p className="text-sm text-gray-600">Free 2-hour textbook loans at Davis Library</p>
              </a>
              <a href="#" className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                <h4 className="font-bold text-[#13294B]">Textbook Exchange</h4>
                <p className="text-sm text-gray-600">Buy/sell used textbooks with other students</p>
              </a>
              <a href="#" className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                <h4 className="font-bold text-[#13294B]">Cost Calculator</h4>
                <p className="text-sm text-gray-600">Compare prices across bookstores and rental services</p>
              </a>
              <a href="#" className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                <h4 className="font-bold text-[#13294B]">Professor OER Guide</h4>
                <p className="text-sm text-gray-600">Resources for faculty adopting open textbooks</p>
              </a>
            </div>
          </div>
        )}

        {/* Technology Loaner Tab */}
        {activeTab === 'technology' && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#13294B]">Technology Loaner Program</h2>
                <p className="text-gray-600 mt-1">Borrow laptops and Wi-Fi hotspots for academic use</p>
              </div>
              <Button onClick={() => setShowTechForm(true)}>Request Device</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">150</p>
                <p className="text-sm text-gray-600">Devices Available</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">89</p>
                <p className="text-sm text-gray-600">Currently Loaned</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">23</p>
                <p className="text-sm text-gray-600">On Waitlist</p>
              </div>
            </div>

            {/* Available Devices */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Available Devices</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { name: 'Laptop (Windows)', available: 28, total: 80 },
                { name: 'Laptop (Mac)', available: 12, total: 40 },
                { name: 'Wi-Fi Hotspot', available: 21, total: 30 },
              ].map((device, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-[#13294B]">{device.name}</h4>
                  <p className="text-sm text-gray-600">{device.available} of {device.total} available</p>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(device.available / device.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Form Modal */}
            {showTechForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Request Technology Loaner</h3>
                  <form onSubmit={(e) => { e.preventDefault(); setSubmitted('tech'); setShowTechForm(false); }} className="space-y-4">
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
                    <div className="flex gap-3">
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
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Financial Literacy Program</h2>

            {/* Upcoming Workshops */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Upcoming Workshops</h3>
            <div className="space-y-4 mb-8">
              {[
                { title: 'Budgeting 101', date: 'Feb 5, 2026', time: '5:00 PM', location: 'Student Union 2510' },
                { title: 'Understanding Student Loans', date: 'Feb 12, 2026', time: '5:00 PM', location: 'Virtual' },
                { title: 'Building Credit', date: 'Feb 19, 2026', time: '5:00 PM', location: 'Student Union 2510' },
                { title: 'Taxes for Students', date: 'Mar 5, 2026', time: '5:00 PM', location: 'Virtual' },
              ].map((workshop, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#13294B]">{workshop.title}</h4>
                    <p className="text-sm text-gray-600">{workshop.date} at {workshop.time} | {workshop.location}</p>
                  </div>
                  <Button variant="secondary">Register</Button>
                </div>
              ))}
            </div>

            {/* Resources */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Resources</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <h4 className="font-bold text-[#13294B]">Budget Template</h4>
                <p className="text-sm text-gray-600 mb-3">Download our student budget spreadsheet</p>
                <Button variant="secondary">Download</Button>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <h4 className="font-bold text-[#13294B]">Financial Aid Office</h4>
                <p className="text-sm text-gray-600 mb-3">Schedule a one-on-one advising session</p>
                <Button variant="secondary">Schedule</Button>
              </div>
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Basic Needs Department Policies</h2>
            <div className="space-y-4">
              {deptPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-[#13294B]">{policy.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      policy.status === 'completed' ? 'bg-green-100 text-green-800' :
                      policy.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {policy.status === 'in_progress' ? 'In Progress' : policy.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{policy.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${policy.progress}%` }} />
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
