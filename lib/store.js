import { createContext, useContext, useState, useEffect } from 'react'
import { initialPolicies, initialOperationalData, initialBudgetData, ADMIN_KEY } from './data'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [policies, setPolicies] = useState(initialPolicies)
  const [operationalData, setOperationalData] = useState(initialOperationalData)
  const [budgetData, setBudgetData] = useState(initialBudgetData)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPolicies = localStorage.getItem('projectbold_policies')
      const savedOperational = localStorage.getItem('projectbold_operational')
      const savedBudget = localStorage.getItem('projectbold_budget')
      const savedAdmin = localStorage.getItem('projectbold_admin')

      if (savedPolicies) setPolicies(JSON.parse(savedPolicies))
      if (savedOperational) setOperationalData(JSON.parse(savedOperational))
      if (savedBudget) setBudgetData(JSON.parse(savedBudget))
      if (savedAdmin === 'true') setIsAdmin(true)

      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_policies', JSON.stringify(policies))
    }
  }, [policies, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_operational', JSON.stringify(operationalData))
    }
  }, [operationalData, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_budget', JSON.stringify(budgetData))
    }
  }, [budgetData, isLoaded])

  // Admin login
  const loginAdmin = (key) => {
    if (key === ADMIN_KEY) {
      setIsAdmin(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('projectbold_admin', 'true')
      }
      return true
    }
    return false
  }

  // Admin logout
  const logoutAdmin = () => {
    setIsAdmin(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('projectbold_admin')
    }
  }

  // Update a single policy
  const updatePolicy = (policyId, updates) => {
    setPolicies(prev => prev.map(p =>
      p.id === policyId ? { ...p, ...updates } : p
    ))
  }

  // Update policy metrics
  const updatePolicyMetrics = (policyId, metrics) => {
    setPolicies(prev => prev.map(p =>
      p.id === policyId ? { ...p, metrics: { ...p.metrics, ...metrics } } : p
    ))
  }

  // Update operational data
  const updateOperational = (section, data) => {
    setOperationalData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  // Update budget
  const updateBudget = (updates) => {
    setBudgetData(prev => ({ ...prev, ...updates }))
  }

  // Update budget category
  const updateBudgetCategory = (categoryName, updates) => {
    setBudgetData(prev => ({
      ...prev,
      categories: prev.categories.map(c =>
        c.name === categoryName ? { ...c, ...updates } : c
      )
    }))
  }

  // Add tech loaner device
  const addTechDevice = (device) => {
    setOperationalData(prev => ({
      ...prev,
      techLoaners: {
        ...prev.techLoaners,
        devices: [...prev.techLoaners.devices, { ...device, id: Date.now() }]
      }
    }))
  }

  // Update tech device inventory
  const updateTechDevice = (deviceId, updates) => {
    setOperationalData(prev => ({
      ...prev,
      techLoaners: {
        ...prev.techLoaners,
        devices: prev.techLoaners.devices.map(d =>
          d.id === deviceId ? { ...d, ...updates } : d
        )
      }
    }))
  }

  // Update food pantry location
  const updatePantryLocation = (locationId, updates) => {
    setOperationalData(prev => ({
      ...prev,
      foodPantry: {
        ...prev.foodPantry,
        locations: prev.foodPantry.locations.map(l =>
          l.id === locationId ? { ...l, ...updates } : l
        )
      }
    }))
  }

  // Add training session
  const addTrainingSession = (type, session) => {
    setOperationalData(prev => ({
      ...prev,
      trainings: {
        ...prev.trainings,
        [type]: {
          ...prev.trainings[type],
          sessions: [...prev.trainings[type].sessions, { ...session, id: Date.now() }]
        }
      }
    }))
  }

  // Update petition signatures
  const updatePetitionSignatures = (petitionKey, count) => {
    setOperationalData(prev => ({
      ...prev,
      advocacy: {
        ...prev.advocacy,
        [petitionKey]: {
          ...prev.advocacy[petitionKey],
          signatures: count
        }
      }
    }))
  }

  // Reset all data to initial state
  const resetAllData = () => {
    setPolicies(initialPolicies)
    setOperationalData(initialOperationalData)
    setBudgetData(initialBudgetData)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('projectbold_policies')
      localStorage.removeItem('projectbold_operational')
      localStorage.removeItem('projectbold_budget')
    }
  }

  return (
    <AppContext.Provider value={{
      // State
      isAdmin,
      policies,
      operationalData,
      budgetData,
      isLoaded,

      // Auth
      loginAdmin,
      logoutAdmin,

      // Policy updates
      updatePolicy,
      updatePolicyMetrics,

      // Operational updates
      updateOperational,
      addTechDevice,
      updateTechDevice,
      updatePantryLocation,
      addTrainingSession,
      updatePetitionSignatures,

      // Budget updates
      updateBudget,
      updateBudgetCategory,

      // Reset
      resetAllData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
