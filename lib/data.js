// Project Bold - Complete Policy Data and Digital Infrastructure Schema
// All progress starts at 0 - Admin can update via dashboard

export const ADMIN_KEY = 'projectbold2026'

export const departments = [
  { id: 'wellness', name: 'Student Wellness', icon: '🏥', color: 'green', description: 'Mental health, safety, and holistic student wellbeing' },
  { id: 'basic-needs', name: 'Basic Needs', icon: '🍎', color: 'orange', description: 'Food security, housing, textbooks, and financial support' },
  { id: 'academic', name: 'Academic Affairs', icon: '📚', color: 'blue', description: 'Registration, advising, research, and academic success' },
  { id: 'civic', name: 'Civic Engagement', icon: '🗳️', color: 'purple', description: 'Voting, service, and community participation' },
  { id: 'communications', name: 'Communications', icon: '📢', color: 'yellow', description: 'Outreach, transparency, and student voice' },
  { id: 'environmental', name: 'Environmental', icon: '🌱', color: 'emerald', description: 'Sustainability, climate action, and green initiatives' },
]

// Initial policy data - all progress at 0
export const initialPolicies = [
  // STUDENT WELLNESS
  { id: 'wellness-button', department: 'wellness', title: 'Student Wellness Button', description: 'One-click Canvas LTI button connecting students to CAPS, Counseling, and wellness resources', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['resource-directory', 'quick-access', 'crisis-hotline'], metrics: { users: 0, clicks: 0, satisfaction: 0 } },
  { id: 'mental-health-first-aid', department: 'wellness', title: 'Mental Health First Aid Training', description: 'Training program for student leaders and RAs on mental health crisis response', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['training-registration', 'certification-tracking', 'resource-library'], metrics: { trained: 0, sessions: 0, completion: 0 } },
  { id: 'wellness-ambassadors', department: 'wellness', title: 'Wellness Ambassadors Program', description: 'Peer support network promoting mental health awareness across campus', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['ambassador-portal', 'event-management', 'peer-matching'], metrics: { ambassadors: 0, events: 0, reach: 0 } },
  { id: 'caps-expansion', department: 'wellness', title: 'CAPS Expansion Advocacy', description: 'Advocate for expanded CAPS hours and additional counselors', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['petition-system', 'progress-tracker', 'contact-reps'], metrics: { signatures: 0, meetings: 0, coverage: 0 } },
  { id: 'crisis-text-line', department: 'wellness', title: 'Crisis Text Line Partnership', description: 'Partner with Crisis Text Line for 24/7 text-based support', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['info-portal', 'usage-stats', 'resource-links'], metrics: { awareness: 0, texts: 0, partners: 0 } },

  // BASIC NEEDS
  { id: 'carolina-cupboard', department: 'basic-needs', title: 'Carolina Cupboard Expansion', description: 'Expand food pantry hours and locations across campus', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['location-finder', 'hours-schedule', 'inventory-status', 'donation-portal'], metrics: { visits: 0, locations: 0, donations: 0 } },
  { id: 'emergency-housing', department: 'basic-needs', title: 'Emergency Housing Fund', description: 'Create emergency fund for students facing housing insecurity', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['application-portal', 'status-tracker', 'resource-guide'], metrics: { applications: 0, funded: 0, amount: 0 } },
  { id: 'textbook-affordability', department: 'basic-needs', title: 'Textbook Affordability Initiative', description: 'Expand OER adoption and textbook lending library', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['oer-database', 'textbook-exchange', 'cost-calculator'], metrics: { oerCourses: 0, savings: 0, exchanges: 0 } },
  { id: 'technology-loaner', department: 'basic-needs', title: 'Technology Loaner Program', description: 'Provide laptops and hotspots to students in need', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['request-system', 'inventory-tracker', 'return-scheduling'], metrics: { devices: 0, activeLoans: 0, waitlist: 0 } },
  { id: 'financial-literacy', department: 'basic-needs', title: 'Financial Literacy Program', description: 'Workshops on budgeting, credit, and financial aid', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['workshop-registration', 'resource-library', 'budget-tools'], metrics: { workshops: 0, attendees: 0, resources: 0 } },

  // ACADEMIC AFFAIRS
  { id: 'registration-reform', department: 'academic', title: 'Course Registration Reform', description: 'Advocate for improved registration system and waitlist transparency', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['feedback-portal', 'issue-tracker', 'petition-system'], metrics: { feedback: 0, issues: 0, resolved: 0 } },
  { id: 'advising-enhancement', department: 'academic', title: 'Academic Advising Enhancement', description: 'Push for more accessible and consistent advising across departments', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['advisor-directory', 'feedback-system', 'resource-hub'], metrics: { reviews: 0, avgRating: 0, resources: 0 } },
  { id: 'research-opportunities', department: 'academic', title: 'Research Opportunities Database', description: 'Create database of undergraduate research positions', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['position-board', 'application-tracker', 'mentor-matching'], metrics: { positions: 0, applications: 0, placements: 0 } },
  { id: 'syllabus-transparency', department: 'academic', title: 'Syllabus Transparency Initiative', description: 'Require syllabi to be available before registration', status: 'planned', priority: 'low', progress: 0, digitalFeatures: ['syllabus-repository', 'course-reviews', 'workload-ratings'], metrics: { syllabi: 0, reviews: 0, courses: 0 } },
  { id: 'credit-transfer', department: 'academic', title: 'Credit Transfer Portal', description: 'Streamline transfer credit evaluation process', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['equivalency-database', 'request-tracker', 'guide-resources'], metrics: { equivalencies: 0, requests: 0, processed: 0 } },

  // CIVIC ENGAGEMENT
  { id: 'voter-registration', department: 'civic', title: 'Voter Registration Drives', description: 'Coordinate campus-wide voter registration before elections', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['registration-portal', 'status-checker', 'polling-locator', 'reminder-system'], metrics: { registered: 0, events: 0, volunteers: 0 } },
  { id: 'civic-fellows', department: 'civic', title: 'Civic Fellows Program', description: 'Fellowship connecting students with local government internships', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['application-portal', 'placement-tracker', 'alumni-network'], metrics: { fellows: 0, placements: 0, partners: 0 } },
  { id: 'town-gown', department: 'civic', title: 'Town-Gown Relations', description: 'Strengthen partnership with Chapel Hill and Carrboro', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['meeting-calendar', 'issue-tracker', 'contact-directory'], metrics: { meetings: 0, initiatives: 0, partnerships: 0 } },
  { id: 'election-transit', department: 'civic', title: 'Election Day Transit', description: 'Free transit to polling locations on election days', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['schedule-viewer', 'route-planner', 'reminder-signup'], metrics: { routes: 0, rides: 0, locations: 0 } },
  { id: 'democracy-week', department: 'civic', title: 'Democracy Week', description: 'Annual week of civic education and engagement events', status: 'planned', priority: 'low', progress: 0, digitalFeatures: ['event-calendar', 'registration-system', 'speaker-info'], metrics: { events: 0, attendees: 0, speakers: 0 } },

  // COMMUNICATIONS
  { id: 'newsletter', department: 'communications', title: 'SG Weekly Newsletter', description: 'Regular updates on Student Government activities and wins', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['subscription-manager', 'archive-browser', 'feedback-form'], metrics: { subscribers: 0, openRate: 0, editions: 0 } },
  { id: 'town-halls', department: 'communications', title: 'Town Hall Series', description: 'Monthly open forums for student feedback', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['event-registration', 'question-submission', 'recording-archive'], metrics: { townHalls: 0, attendance: 0, questions: 0 } },
  { id: 'social-media', department: 'communications', title: 'Social Media Revamp', description: 'Modernize SG social media presence and engagement', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['content-calendar', 'analytics-dashboard', 'engagement-tracker'], metrics: { followers: 0, engagement: 0, posts: 0 } },
  { id: 'transparency-dashboard', department: 'communications', title: 'Transparency Dashboard', description: 'Public dashboard showing SG budget and policy progress', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['budget-viewer', 'policy-tracker', 'meeting-minutes', 'voting-records'], metrics: { views: 0, updates: 0, documents: 0 } },
  { id: 'campus-pulse', department: 'communications', title: 'Campus Pulse Surveys', description: 'Regular surveys to gauge student opinion on key issues', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['survey-platform', 'results-dashboard', 'trend-analysis'], metrics: { surveys: 0, responses: 0, insights: 0 } },

  // ENVIRONMENTAL
  { id: 'carbon-neutrality', department: 'environmental', title: 'Carbon Neutrality Push', description: 'Advocate for accelerated carbon neutrality timeline', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['progress-tracker', 'action-portal', 'impact-calculator'], metrics: { reduction: 0, actions: 0, advocates: 0 } },
  { id: 'sustainable-dining', department: 'environmental', title: 'Sustainable Dining Initiative', description: 'Reduce single-use plastics in dining halls', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['impact-tracker', 'location-guide', 'feedback-system'], metrics: { plasticsReduced: 0, locations: 0, satisfaction: 0 } },
  { id: 'green-fund', department: 'environmental', title: 'Green Fund Expansion', description: 'Increase student green fund for sustainability projects', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['application-portal', 'project-showcase', 'voting-system'], metrics: { projects: 0, funded: 0, applications: 0 } },
  { id: 'bike-share', department: 'environmental', title: 'Bike Share Program', description: 'Expand campus bike share availability', status: 'planned', priority: 'low', progress: 0, digitalFeatures: ['availability-map', 'reservation-system', 'maintenance-reporter'], metrics: { bikes: 0, stations: 0, rides: 0 } },
  { id: 'climate-committee', department: 'environmental', title: 'Climate Action Committee', description: 'Student committee advising on campus climate policy', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['meeting-calendar', 'member-directory', 'initiative-tracker'], metrics: { members: 0, meetings: 0, initiatives: 0 } },
]

// Initial operational data - all zeroed
export const initialOperationalData = {
  // Technology Loaner Inventory
  techLoaners: {
    devices: [
      { id: 1, type: 'laptop-windows', name: 'Dell Laptop', total: 0, available: 0, onLoan: 0 },
      { id: 2, type: 'laptop-mac', name: 'MacBook Air', total: 0, available: 0, onLoan: 0 },
      { id: 3, type: 'hotspot', name: 'Wi-Fi Hotspot', total: 0, available: 0, onLoan: 0 },
    ],
    loans: [],
    waitlist: [],
  },

  // Food Pantry
  foodPantry: {
    locations: [
      { id: 1, name: 'Carolina Cupboard - Student Union', address: 'Frank Porter Graham Student Union', hours: 'M-F 10am-4pm', inventory: 'unknown', visits: 0 },
      { id: 2, name: 'Carolina Cupboard - South Campus', address: 'Ram Village Community Center', hours: 'T/Th 2pm-6pm', inventory: 'unknown', visits: 0 },
      { id: 3, name: 'Carolina Cupboard - North Campus', address: 'Hinton James Residence Hall', hours: 'M/W 3pm-7pm', inventory: 'unknown', visits: 0 },
    ],
    totalVisits: 0,
    donations: 0,
  },

  // Emergency Housing
  emergencyHousing: {
    applications: [],
    totalFunded: 0,
    amountDistributed: 0,
  },

  // Training Programs
  trainings: {
    mentalHealthFirstAid: { sessions: [], totalTrained: 0 },
  },

  // Ambassadors/Fellows
  programs: {
    wellnessAmbassadors: { members: [], events: [] },
    civicFellows: { fellows: [], placements: [] },
  },

  // Events
  events: {
    townHalls: [],
    democracyWeek: [],
  },

  // Petitions & Advocacy
  advocacy: {
    capsExpansion: { signatures: 0, signers: [] },
    carbonNeutrality: { signatures: 0, signers: [] },
  },

  // Registrations
  registrations: {
    voterRegistration: { total: 0, records: [] },
    newsletter: { subscribers: 0, emails: [] },
  },

  // Research Positions
  research: {
    positions: [],
    applications: [],
  },

  // Accessibility
  accessibility: {
    issues: [],
    resolved: 0,
  },

  // Green Fund
  greenFund: {
    projects: [],
    totalFunded: 0,
  },

  // Bike Share
  bikeShare: {
    stations: [],
    totalRides: 0,
  },
}

// Initial budget data - zeroed
export const initialBudgetData = {
  total: 0,
  allocated: 0,
  spent: 0,
  categories: [
    { name: 'Student Organizations', allocated: 0, spent: 0 },
    { name: 'Events & Programming', allocated: 0, spent: 0 },
    { name: 'Basic Needs Initiatives', allocated: 0, spent: 0 },
    { name: 'Wellness Programs', allocated: 0, spent: 0 },
    { name: 'Advocacy & Outreach', allocated: 0, spent: 0 },
  ]
}

// Static reference data (doesn't change)
export const wellnessResources = [
  { id: 1, name: 'CAPS (Counseling & Psychological Services)', phone: '919-966-3658', url: 'https://caps.unc.edu', hours: 'M-F 8am-5pm', emergency: true },
  { id: 2, name: 'Campus Health Services', phone: '919-966-2281', url: 'https://campushealth.unc.edu', hours: 'M-F 8am-5pm', emergency: false },
  { id: 3, name: 'Student Wellness', phone: '919-962-9355', url: 'https://studentwellness.unc.edu', hours: 'M-F 8am-5pm', emergency: false },
  { id: 4, name: 'Crisis Text Line', phone: 'Text HOME to 741741', url: 'https://www.crisistextline.org', hours: '24/7', emergency: true },
  { id: 5, name: 'National Suicide Prevention Lifeline', phone: '988', url: 'https://988lifeline.org', hours: '24/7', emergency: true },
  { id: 6, name: 'LGBTQ Center', phone: '919-843-5376', url: 'https://lgbtq.unc.edu', hours: 'M-F 9am-5pm', emergency: false },
]

// Helper functions
export function getOverallProgress(policies) {
  if (!policies || policies.length === 0) return 0
  const total = policies.reduce((sum, p) => sum + (p.progress || 0), 0)
  return Math.round(total / policies.length)
}

export function getStatusCounts(policies) {
  if (!policies) return { completed: 0, in_progress: 0, planned: 0 }
  return {
    completed: policies.filter(p => p.status === 'completed').length,
    in_progress: policies.filter(p => p.status === 'in_progress').length,
    planned: policies.filter(p => p.status === 'planned').length,
  }
}
