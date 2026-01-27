import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { Input, Select, Button, Textarea } from '../../components/FormInput'
import { departments } from '../../lib/data'

export default function AdminDashboard() {
  const router = useRouter()
  const {
    isAdmin,
    isLoaded,
    policies,
    operationalData,
    budgetData,
    updatePolicy,
    updatePolicyMetrics,
    updateBudget,
    updateBudgetCategory,
    updateTechDevice,
    updatePantryLocation,
    updatePetitionSignatures,
    updateOperational,
    resetAllData,
    logoutAdmin
  } = useApp()

  const [activeTab, setActiveTab] = useState('policies')
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isAdmin, isLoaded, router])

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const tabs = [
    { id: 'policies', label: 'Policies & Progress' },
    { id: 'budget', label: 'Budget' },
    { id: 'techloaner', label: 'Tech Loaners' },
    { id: 'foodpantry', label: 'Food Pantry' },
    { id: 'advocacy', label: 'Petitions' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <>
      <Head>
        <title>Admin Dashboard | Project Bold</title>
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* Admin Header */}
        <header className="bg-[#13294B] text-white py-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">Project Bold Data Management</p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm">
                View Site
              </Link>
              <button onClick={logoutAdmin} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-[#4B9CD3] text-[#4B9CD3]'
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
          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <div>
              <h2 className="text-2xl font-bold text-[#13294B] mb-6">Manage Policies</h2>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Policy List */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-bold text-[#13294B] mb-4">All Policies (40)</h3>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {policies.map(policy => {
                      const dept = departments.find(d => d.id === policy.department)
                      return (
                        <button
                          key={policy.id}
                          onClick={() => setSelectedPolicy(policy)}
                          className={`w-full text-left p-3 rounded-lg border transition ${
                            selectedPolicy?.id === policy.id
                              ? 'border-[#4B9CD3] bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-gray-500">{dept?.icon} {dept?.name}</span>
                              <p className="font-medium text-[#13294B]">{policy.title}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                policy.status === 'completed' ? 'bg-green-100 text-green-700' :
                                policy.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {policy.progress}%
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Policy Editor */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {selectedPolicy ? (
                    <div>
                      <h3 className="font-bold text-[#13294B] mb-4">Edit: {selectedPolicy.title}</h3>

                      <div className="space-y-4">
                        <Select
                          label="Status"
                          value={selectedPolicy.status}
                          onChange={(e) => updatePolicy(selectedPolicy.id, { status: e.target.value })}
                          options={[
                            { value: 'planned', label: 'Planned' },
                            { value: 'in_progress', label: 'In Progress' },
                            { value: 'completed', label: 'Completed' },
                          ]}
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Progress: {selectedPolicy.progress}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={selectedPolicy.progress}
                            onChange={(e) => updatePolicy(selectedPolicy.id, { progress: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium text-[#13294B] mb-3">Metrics</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(selectedPolicy.metrics).map(([key, value]) => (
                              <Input
                                key={key}
                                label={key}
                                type="number"
                                value={value}
                                onChange={(e) => updatePolicyMetrics(selectedPolicy.id, { [key]: parseInt(e.target.value) || 0 })}
                              />
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={() => setSelectedPolicy(policies.find(p => p.id === selectedPolicy.id))}
                          variant="secondary"
                        >
                          Refresh
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      Select a policy to edit
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div>
              <h2 className="text-2xl font-bold text-[#13294B] mb-6">Manage Budget</h2>

              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-bold text-[#13294B] mb-4">Overall Budget</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    label="Total Budget ($)"
                    type="number"
                    value={budgetData.total}
                    onChange={(e) => updateBudget({ total: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    label="Allocated ($)"
                    type="number"
                    value={budgetData.allocated}
                    onChange={(e) => updateBudget({ allocated: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    label="Spent ($)"
                    type="number"
                    value={budgetData.spent}
                    onChange={(e) => updateBudget({ spent: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-[#13294B] mb-4">Budget Categories</h3>
                <div className="space-y-4">
                  {budgetData.categories.map((cat, i) => (
                    <div key={i} className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-[#13294B]">{cat.name}</p>
                      </div>
                      <Input
                        label="Allocated"
                        type="number"
                        value={cat.allocated}
                        onChange={(e) => updateBudgetCategory(cat.name, { allocated: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        label="Spent"
                        type="number"
                        value={cat.spent}
                        onChange={(e) => updateBudgetCategory(cat.name, { spent: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tech Loaner Tab */}
          {activeTab === 'techloaner' && (
            <div>
              <h2 className="text-2xl font-bold text-[#13294B] mb-6">Technology Loaner Inventory</h2>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-4">
                  {operationalData.techLoaners.devices.map((device) => (
                    <div key={device.id} className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg items-end">
                      <div>
                        <p className="font-medium text-[#13294B]">{device.name}</p>
                        <p className="text-sm text-gray-500">{device.type}</p>
                      </div>
                      <Input
                        label="Total Units"
                        type="number"
                        value={device.total}
                        onChange={(e) => updateTechDevice(device.id, { total: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        label="Available"
                        type="number"
                        value={device.available}
                        onChange={(e) => updateTechDevice(device.id, { available: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        label="On Loan"
                        type="number"
                        value={device.onLoan}
                        onChange={(e) => updateTechDevice(device.id, { onLoan: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-[#13294B] mb-3">Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-blue-600">
                        {operationalData.techLoaners.devices.reduce((sum, d) => sum + d.total, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Devices</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-green-600">
                        {operationalData.techLoaners.devices.reduce((sum, d) => sum + d.available, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Available</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-orange-600">
                        {operationalData.techLoaners.devices.reduce((sum, d) => sum + d.onLoan, 0)}
                      </p>
                      <p className="text-sm text-gray-600">On Loan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Food Pantry Tab */}
          {activeTab === 'foodpantry' && (
            <div>
              <h2 className="text-2xl font-bold text-[#13294B] mb-6">Food Pantry Management</h2>

              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-bold text-[#13294B] mb-4">Overall Stats</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Total Visits"
                    type="number"
                    value={operationalData.foodPantry.totalVisits}
                    onChange={(e) => updateOperational('foodPantry', { totalVisits: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    label="Total Donations"
                    type="number"
                    value={operationalData.foodPantry.donations}
                    onChange={(e) => updateOperational('foodPantry', { donations: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-[#13294B] mb-4">Locations</h3>
                <div className="space-y-4">
                  {operationalData.foodPantry.locations.map((loc) => (
                    <div key={loc.id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-[#13294B] mb-3">{loc.name}</p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Select
                          label="Inventory Level"
                          value={loc.inventory}
                          onChange={(e) => updatePantryLocation(loc.id, { inventory: e.target.value })}
                          options={[
                            { value: 'unknown', label: 'Unknown' },
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' },
                          ]}
                        />
                        <Input
                          label="Visits"
                          type="number"
                          value={loc.visits}
                          onChange={(e) => updatePantryLocation(loc.id, { visits: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                          label="Hours"
                          value={loc.hours}
                          onChange={(e) => updatePantryLocation(loc.id, { hours: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Advocacy/Petitions Tab */}
          {activeTab === 'advocacy' && (
            <div>
              <h2 className="text-2xl font-bold text-[#13294B] mb-6">Petition Signatures</h2>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-[#13294B] mb-3">CAPS Expansion Petition</h4>
                    <Input
                      label="Signatures"
                      type="number"
                      value={operationalData.advocacy.capsExpansion.signatures}
                      onChange={(e) => updatePetitionSignatures('capsExpansion', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-[#13294B] mb-3">Tuition Freeze Petition</h4>
                    <Input
                      label="Signatures"
                      type="number"
                      value={operationalData.advocacy.tuitionFreeze.signatures}
                      onChange={(e) => updatePetitionSignatures('tuitionFreeze', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-[#13294B] mb-3">Carbon Neutrality Petition</h4>
                    <Input
                      label="Signatures"
                      type="number"
                      value={operationalData.advocacy.carbonNeutrality.signatures}
                      onChange={(e) => updatePetitionSignatures('carbonNeutrality', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-[#13294B] mb-6">Settings</h2>

              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-bold text-[#13294B] mb-4">Data Management</h3>
                <p className="text-gray-600 mb-4">
                  All data is stored locally in your browser. Clearing browser data will reset everything.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Reset all data to initial state (all progress to 0, all metrics cleared).
                  </p>
                  {showResetConfirm ? (
                    <div className="flex gap-3">
                      <Button variant="danger" onClick={() => { resetAllData(); setShowResetConfirm(false); }}>
                        Confirm Reset
                      </Button>
                      <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button variant="danger" onClick={() => setShowResetConfirm(true)}>
                      Reset All Data
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-[#13294B] mb-4">About</h3>
                <p className="text-gray-600">
                  Project Bold Policy Platform v1.0<br />
                  UNC Student Government 2026-2027<br />
                  "First, Best, For All"
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
