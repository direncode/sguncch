import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import { Input, Select, Textarea, Button, Checkbox } from '../../components/FormInput'
import { policies, wellnessResources } from '../../lib/data'

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState('resources')
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [showAmbassadorForm, setShowAmbassadorForm] = useState(false)
  const [trainingForm, setTrainingForm] = useState({ name: '', email: '', pid: '', role: '', experience: '' })
  const [ambassadorForm, setAmbassadorForm] = useState({ name: '', email: '', pid: '', year: '', major: '', motivation: '' })
  const [submitted, setSubmitted] = useState(null)

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

  return (
    <Layout>
      <Head>
        <title>Student Wellness | Project Bold</title>
      </Head>

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏥</span>
            <h1 className="text-3xl md:text-4xl font-bold">Student Wellness</h1>
          </div>
          <p className="text-green-100 max-w-2xl">
            Mental health, safety, and holistic student wellbeing. Access CAPS, crisis support,
            wellness resources, and join our peer support programs.
          </p>
        </div>
      </div>

      {/* Crisis Banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="font-medium">In Crisis? Get immediate help:</p>
          <div className="flex gap-4 text-sm">
            <a href="tel:988" className="bg-white text-red-600 px-3 py-1 rounded font-bold hover:bg-red-50">Call 988</a>
            <a href="sms:741741" className="bg-white text-red-600 px-3 py-1 rounded font-bold hover:bg-red-50">Text HOME to 741741</a>
            <a href="tel:919-966-3658" className="bg-white/20 px-3 py-1 rounded hover:bg-white/30">CAPS: 919-966-3658</a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'resources', label: 'Resources' },
              { id: 'training', label: 'Mental Health First Aid' },
              { id: 'ambassadors', label: 'Wellness Ambassadors' },
              { id: 'advocacy', label: 'CAPS Advocacy' },
              { id: 'policies', label: 'All Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
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
              {submitted === 'training' && 'Thank you for registering for Mental Health First Aid training! We will contact you with session details.'}
              {submitted === 'ambassador' && 'Thank you for applying to the Wellness Ambassadors program! We will review your application and contact you soon.'}
            </p>
            <button onClick={() => setSubmitted(null)} className="text-green-600 text-sm mt-2 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Wellness Resources</h2>

            {/* Quick Access Buttons */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <a href="https://caps.unc.edu" target="_blank" rel="noopener noreferrer"
                className="bg-green-600 text-white rounded-lg p-6 text-center hover:bg-green-700 transition">
                <span className="text-3xl block mb-2">🧠</span>
                <p className="font-bold">CAPS</p>
                <p className="text-sm text-green-100">Counseling & Psychological Services</p>
              </a>
              <a href="https://campushealth.unc.edu" target="_blank" rel="noopener noreferrer"
                className="bg-blue-600 text-white rounded-lg p-6 text-center hover:bg-blue-700 transition">
                <span className="text-3xl block mb-2">🏥</span>
                <p className="font-bold">Campus Health</p>
                <p className="text-sm text-blue-100">Medical Services & Appointments</p>
              </a>
              <a href="https://studentwellness.unc.edu" target="_blank" rel="noopener noreferrer"
                className="bg-purple-600 text-white rounded-lg p-6 text-center hover:bg-purple-700 transition">
                <span className="text-3xl block mb-2">💪</span>
                <p className="font-bold">Student Wellness</p>
                <p className="text-sm text-purple-100">Programs & Resources</p>
              </a>
            </div>

            {/* Resource Directory */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Resource Directory</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {wellnessResources.map(resource => (
                <div key={resource.id} className={`bg-white rounded-lg p-4 shadow-sm border ${resource.emergency ? 'border-red-200' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-[#13294B]">{resource.name}</h4>
                      <p className="text-sm text-gray-600">{resource.hours}</p>
                    </div>
                    {resource.emergency && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">24/7 Crisis</span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-3">
                    <a href={`tel:${resource.phone.replace(/\D/g, '')}`} className="text-sm text-green-600 hover:underline">
                      {resource.phone}
                    </a>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#4B9CD3] hover:underline">
                      Website →
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
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#13294B]">Mental Health First Aid Training</h2>
                <p className="text-gray-600 mt-1">Learn to recognize and respond to mental health crises</p>
              </div>
              <Button onClick={() => setShowTrainingForm(true)}>Register for Training</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">156</p>
                <p className="text-sm text-gray-600">Students Trained</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Sessions Completed</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">89%</p>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Upcoming Training Sessions</h3>
            <div className="space-y-4 mb-8">
              {[
                { date: 'Feb 8, 2026', time: '9:00 AM - 4:00 PM', location: 'Student Union 3201', spots: 12 },
                { date: 'Feb 22, 2026', time: '9:00 AM - 4:00 PM', location: 'Davis Library 247', spots: 8 },
                { date: 'Mar 8, 2026', time: '9:00 AM - 4:00 PM', location: 'Student Union 3201', spots: 20 },
              ].map((session, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#13294B]">{session.date}</p>
                    <p className="text-sm text-gray-600">{session.time} | {session.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{session.spots} spots left</p>
                    <Button variant="secondary" onClick={() => setShowTrainingForm(true)}>Register</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Training Form Modal */}
            {showTrainingForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Register for Training</h3>
                  <form onSubmit={handleTrainingSubmit} className="space-y-4">
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
                    <div className="flex gap-3">
                      <Button type="submit">Submit Registration</Button>
                      <Button variant="secondary" onClick={() => setShowTrainingForm(false)}>Cancel</Button>
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
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#13294B]">Wellness Ambassadors Program</h2>
                <p className="text-gray-600 mt-1">Join our peer support network promoting mental health awareness</p>
              </div>
              <Button onClick={() => setShowAmbassadorForm(true)}>Apply Now</Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">45</p>
                <p className="text-sm text-gray-600">Active Ambassadors</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">8</p>
                <p className="text-sm text-gray-600">Events Hosted</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">2,100</p>
                <p className="text-sm text-gray-600">Students Reached</p>
              </div>
            </div>

            {/* What Ambassadors Do */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">What Ambassadors Do</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { icon: '🎓', title: 'Lead Workshops', desc: 'Facilitate mental health awareness sessions' },
                { icon: '👥', title: 'Peer Support', desc: 'Provide one-on-one support and resource navigation' },
                { icon: '📱', title: 'Social Media', desc: 'Create engaging wellness content' },
                { icon: '🎉', title: 'Events', desc: 'Plan and host wellness events on campus' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <span className="text-2xl">{item.icon}</span>
                  <h4 className="font-bold text-[#13294B] mt-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Ambassador Form Modal */}
            {showAmbassadorForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-[#13294B] mb-4">Apply to be a Wellness Ambassador</h3>
                  <form onSubmit={handleAmbassadorSubmit} className="space-y-4">
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
                    <div className="flex gap-3">
                      <Button type="submit">Submit Application</Button>
                      <Button variant="secondary" onClick={() => setShowAmbassadorForm(false)}>Cancel</Button>
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
            <h2 className="text-2xl font-bold text-[#13294B] mb-2">CAPS Expansion Advocacy</h2>
            <p className="text-gray-600 mb-6">Join us in advocating for expanded mental health services</p>

            {/* Progress */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="font-bold text-[#13294B] mb-4">Campaign Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Petition Signatures</span>
                    <span>3,420 / 5,000</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Meetings with Administration</span>
                    <span>5 / 8</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <h3 className="text-xl font-bold text-[#13294B] mb-4">Take Action</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">Sign the Petition</h4>
                <p className="text-sm text-green-700 mb-4">Add your voice to demand expanded CAPS hours and more counselors.</p>
                <Button>Sign Petition</Button>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2">Contact Administration</h4>
                <p className="text-sm text-blue-700 mb-4">Send a pre-written email to university leadership.</p>
                <Button>Send Email</Button>
              </div>
            </div>
          </div>
        )}

        {/* All Policies Tab */}
        {activeTab === 'policies' && (
          <div>
            <h2 className="text-2xl font-bold text-[#13294B] mb-6">Wellness Department Policies</h2>
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
                      {policy.status === 'in_progress' ? 'In Progress' : policy.status === 'completed' ? 'Completed' : 'Planned'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{policy.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${policy.progress}%` }} />
                  </div>
                  {policy.digitalFeatures && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {policy.digitalFeatures.map(f => (
                        <span key={f} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{f.replace(/-/g, ' ')}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </Layout>
  )
}
