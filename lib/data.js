// Project Bold - Complete Policy Data and Digital Infrastructure Schema

export const departments = [
  { id: 'wellness', name: 'Student Wellness', icon: '🏥', color: 'green', description: 'Mental health, safety, and holistic student wellbeing' },
  { id: 'basic-needs', name: 'Basic Needs', icon: '🍎', color: 'orange', description: 'Food security, housing, textbooks, and financial support' },
  { id: 'academic', name: 'Academic Affairs', icon: '📚', color: 'blue', description: 'Registration, advising, research, and academic success' },
  { id: 'civic', name: 'Civic Engagement', icon: '🗳️', color: 'purple', description: 'Voting, service, and community participation' },
  { id: 'communications', name: 'Communications', icon: '📢', color: 'yellow', description: 'Outreach, transparency, and student voice' },
  { id: 'dei', name: 'DEI', icon: '🤝', color: 'pink', description: 'Diversity, equity, inclusion, and belonging' },
  { id: 'environmental', name: 'Environmental', icon: '🌱', color: 'emerald', description: 'Sustainability, climate action, and green initiatives' },
  { id: 'external', name: 'State & External', icon: '🏛️', color: 'indigo', description: 'Advocacy, legislation, and external partnerships' },
]

export const policies = [
  // ==================== STUDENT WELLNESS (5 policies) ====================
  {
    id: 'wellness-button',
    department: 'wellness',
    title: 'Student Wellness Button',
    description: 'One-click Canvas LTI button connecting students to CAPS, Counseling, and wellness resources',
    status: 'in_progress',
    priority: 'high',
    progress: 45,
    digitalFeatures: ['resource-directory', 'quick-access', 'crisis-hotline'],
    metrics: { users: 1250, clicks: 8420, satisfaction: 4.2 },
  },
  {
    id: 'mental-health-first-aid',
    department: 'wellness',
    title: 'Mental Health First Aid Training',
    description: 'Training program for student leaders and RAs on mental health crisis response',
    status: 'in_progress',
    priority: 'high',
    progress: 30,
    digitalFeatures: ['training-registration', 'certification-tracking', 'resource-library'],
    metrics: { trained: 156, sessions: 12, completion: 89 },
  },
  {
    id: 'wellness-ambassadors',
    department: 'wellness',
    title: 'Wellness Ambassadors Program',
    description: 'Peer support network promoting mental health awareness across campus',
    status: 'planned',
    priority: 'medium',
    progress: 15,
    digitalFeatures: ['ambassador-portal', 'event-management', 'peer-matching'],
    metrics: { ambassadors: 45, events: 8, reach: 2100 },
  },
  {
    id: 'caps-expansion',
    department: 'wellness',
    title: 'CAPS Expansion Advocacy',
    description: 'Advocate for expanded CAPS hours and additional counselors',
    status: 'in_progress',
    priority: 'high',
    progress: 25,
    digitalFeatures: ['petition-system', 'progress-tracker', 'contact-reps'],
    metrics: { signatures: 3420, meetings: 5, coverage: 67 },
  },
  {
    id: 'crisis-text-line',
    department: 'wellness',
    title: 'Crisis Text Line Partnership',
    description: 'Partner with Crisis Text Line for 24/7 text-based support',
    status: 'planned',
    priority: 'medium',
    progress: 10,
    digitalFeatures: ['info-portal', 'usage-stats', 'resource-links'],
    metrics: { awareness: 2100, texts: 0, partners: 1 },
  },

  // ==================== BASIC NEEDS (5 policies) ====================
  {
    id: 'carolina-cupboard',
    department: 'basic-needs',
    title: 'Carolina Cupboard Expansion',
    description: 'Expand food pantry hours and locations across campus',
    status: 'in_progress',
    priority: 'high',
    progress: 60,
    digitalFeatures: ['location-finder', 'hours-schedule', 'inventory-status', 'donation-portal'],
    metrics: { visits: 4200, locations: 3, donations: 890 },
  },
  {
    id: 'emergency-housing',
    department: 'basic-needs',
    title: 'Emergency Housing Fund',
    description: 'Create emergency fund for students facing housing insecurity',
    status: 'planned',
    priority: 'high',
    progress: 20,
    digitalFeatures: ['application-portal', 'status-tracker', 'resource-guide'],
    metrics: { applications: 45, funded: 12, amount: 18500 },
  },
  {
    id: 'textbook-affordability',
    department: 'basic-needs',
    title: 'Textbook Affordability Initiative',
    description: 'Expand OER adoption and textbook lending library',
    status: 'in_progress',
    priority: 'medium',
    progress: 35,
    digitalFeatures: ['oer-database', 'textbook-exchange', 'cost-calculator'],
    metrics: { oerCourses: 127, savings: 245000, exchanges: 890 },
  },
  {
    id: 'technology-loaner',
    department: 'basic-needs',
    title: 'Technology Loaner Program',
    description: 'Provide laptops and hotspots to students in need',
    status: 'in_progress',
    priority: 'high',
    progress: 55,
    digitalFeatures: ['request-system', 'inventory-tracker', 'return-scheduling'],
    metrics: { devices: 150, activeLoans: 89, waitlist: 23 },
  },
  {
    id: 'financial-literacy',
    department: 'basic-needs',
    title: 'Financial Literacy Program',
    description: 'Workshops on budgeting, credit, and financial aid',
    status: 'planned',
    priority: 'medium',
    progress: 15,
    digitalFeatures: ['workshop-registration', 'resource-library', 'budget-tools'],
    metrics: { workshops: 6, attendees: 234, resources: 45 },
  },

  // ==================== ACADEMIC AFFAIRS (5 policies) ====================
  {
    id: 'registration-reform',
    department: 'academic',
    title: 'Course Registration Reform',
    description: 'Advocate for improved registration system and waitlist transparency',
    status: 'in_progress',
    priority: 'high',
    progress: 30,
    digitalFeatures: ['feedback-portal', 'issue-tracker', 'petition-system'],
    metrics: { feedback: 1890, issues: 156, resolved: 45 },
  },
  {
    id: 'advising-enhancement',
    department: 'academic',
    title: 'Academic Advising Enhancement',
    description: 'Push for more accessible and consistent advising across departments',
    status: 'planned',
    priority: 'medium',
    progress: 20,
    digitalFeatures: ['advisor-directory', 'feedback-system', 'resource-hub'],
    metrics: { reviews: 456, avgRating: 3.8, resources: 34 },
  },
  {
    id: 'research-opportunities',
    department: 'academic',
    title: 'Research Opportunities Database',
    description: 'Create database of undergraduate research positions',
    status: 'in_progress',
    priority: 'medium',
    progress: 45,
    digitalFeatures: ['position-board', 'application-tracker', 'mentor-matching'],
    metrics: { positions: 234, applications: 567, placements: 89 },
  },
  {
    id: 'syllabus-transparency',
    department: 'academic',
    title: 'Syllabus Transparency Initiative',
    description: 'Require syllabi to be available before registration',
    status: 'planned',
    priority: 'low',
    progress: 10,
    digitalFeatures: ['syllabus-repository', 'course-reviews', 'workload-ratings'],
    metrics: { syllabi: 890, reviews: 2340, courses: 456 },
  },
  {
    id: 'credit-transfer',
    department: 'academic',
    title: 'Credit Transfer Portal',
    description: 'Streamline transfer credit evaluation process',
    status: 'planned',
    priority: 'medium',
    progress: 5,
    digitalFeatures: ['equivalency-database', 'request-tracker', 'guide-resources'],
    metrics: { equivalencies: 1234, requests: 234, processed: 189 },
  },

  // ==================== CIVIC ENGAGEMENT (5 policies) ====================
  {
    id: 'voter-registration',
    department: 'civic',
    title: 'Voter Registration Drives',
    description: 'Coordinate campus-wide voter registration before elections',
    status: 'in_progress',
    priority: 'high',
    progress: 70,
    digitalFeatures: ['registration-portal', 'status-checker', 'polling-locator', 'reminder-system'],
    metrics: { registered: 4560, events: 23, volunteers: 89 },
  },
  {
    id: 'civic-fellows',
    department: 'civic',
    title: 'Civic Fellows Program',
    description: 'Fellowship connecting students with local government internships',
    status: 'planned',
    priority: 'medium',
    progress: 25,
    digitalFeatures: ['application-portal', 'placement-tracker', 'alumni-network'],
    metrics: { fellows: 24, placements: 18, partners: 12 },
  },
  {
    id: 'town-gown',
    department: 'civic',
    title: 'Town-Gown Relations',
    description: 'Strengthen partnership with Chapel Hill and Carrboro',
    status: 'in_progress',
    priority: 'medium',
    progress: 35,
    digitalFeatures: ['meeting-calendar', 'issue-tracker', 'contact-directory'],
    metrics: { meetings: 12, initiatives: 8, partnerships: 5 },
  },
  {
    id: 'election-transit',
    department: 'civic',
    title: 'Election Day Transit',
    description: 'Free transit to polling locations on election days',
    status: 'planned',
    priority: 'high',
    progress: 40,
    digitalFeatures: ['schedule-viewer', 'route-planner', 'reminder-signup'],
    metrics: { routes: 5, rides: 1200, locations: 8 },
  },
  {
    id: 'democracy-week',
    department: 'civic',
    title: 'Democracy Week',
    description: 'Annual week of civic education and engagement events',
    status: 'planned',
    priority: 'low',
    progress: 15,
    digitalFeatures: ['event-calendar', 'registration-system', 'speaker-info'],
    metrics: { events: 15, attendees: 890, speakers: 12 },
  },

  // ==================== COMMUNICATIONS (5 policies) ====================
  {
    id: 'newsletter',
    department: 'communications',
    title: 'SG Weekly Newsletter',
    description: 'Regular updates on Student Government activities and wins',
    status: 'in_progress',
    priority: 'high',
    progress: 80,
    digitalFeatures: ['subscription-manager', 'archive-browser', 'feedback-form'],
    metrics: { subscribers: 8900, openRate: 34, editions: 24 },
  },
  {
    id: 'town-halls',
    department: 'communications',
    title: 'Town Hall Series',
    description: 'Monthly open forums for student feedback',
    status: 'in_progress',
    priority: 'medium',
    progress: 50,
    digitalFeatures: ['event-registration', 'question-submission', 'recording-archive'],
    metrics: { townHalls: 8, attendance: 456, questions: 234 },
  },
  {
    id: 'social-media',
    department: 'communications',
    title: 'Social Media Revamp',
    description: 'Modernize SG social media presence and engagement',
    status: 'in_progress',
    priority: 'medium',
    progress: 65,
    digitalFeatures: ['content-calendar', 'analytics-dashboard', 'engagement-tracker'],
    metrics: { followers: 12400, engagement: 5.2, posts: 156 },
  },
  {
    id: 'transparency-dashboard',
    department: 'communications',
    title: 'Transparency Dashboard',
    description: 'Public dashboard showing SG budget and policy progress',
    status: 'in_progress',
    priority: 'high',
    progress: 55,
    digitalFeatures: ['budget-viewer', 'policy-tracker', 'meeting-minutes', 'voting-records'],
    metrics: { views: 4500, updates: 89, documents: 234 },
  },
  {
    id: 'campus-pulse',
    department: 'communications',
    title: 'Campus Pulse Surveys',
    description: 'Regular surveys to gauge student opinion on key issues',
    status: 'planned',
    priority: 'medium',
    progress: 30,
    digitalFeatures: ['survey-platform', 'results-dashboard', 'trend-analysis'],
    metrics: { surveys: 12, responses: 3400, insights: 45 },
  },

  // ==================== DEI (5 policies) ====================
  {
    id: 'cultural-centers',
    department: 'dei',
    title: 'Cultural Center Support',
    description: 'Advocate for increased funding for cultural centers',
    status: 'in_progress',
    priority: 'high',
    progress: 35,
    digitalFeatures: ['center-directory', 'event-calendar', 'advocacy-portal'],
    metrics: { centers: 8, events: 67, funding: 125000 },
  },
  {
    id: 'inclusive-excellence',
    department: 'dei',
    title: 'Inclusive Excellence Awards',
    description: 'Recognize students and orgs advancing DEI on campus',
    status: 'planned',
    priority: 'low',
    progress: 20,
    digitalFeatures: ['nomination-portal', 'voting-system', 'past-recipients'],
    metrics: { nominations: 89, categories: 5, recipients: 15 },
  },
  {
    id: 'first-gen',
    department: 'dei',
    title: 'First-Gen Support Network',
    description: 'Mentorship and resources for first-generation students',
    status: 'in_progress',
    priority: 'high',
    progress: 45,
    digitalFeatures: ['mentor-matching', 'resource-hub', 'community-forum'],
    metrics: { mentors: 67, mentees: 234, matches: 156 },
  },
  {
    id: 'accessibility-audit',
    department: 'dei',
    title: 'Accessibility Audit',
    description: 'Review campus accessibility and advocate for improvements',
    status: 'planned',
    priority: 'medium',
    progress: 25,
    digitalFeatures: ['issue-reporter', 'progress-tracker', 'resource-guide'],
    metrics: { issues: 156, resolved: 45, buildings: 89 },
  },
  {
    id: 'bias-training',
    department: 'dei',
    title: 'Bias Response Training',
    description: 'Training for student leaders on responding to bias incidents',
    status: 'planned',
    priority: 'medium',
    progress: 15,
    digitalFeatures: ['training-registration', 'resource-library', 'certification-tracker'],
    metrics: { trained: 89, sessions: 6, completion: 92 },
  },

  // ==================== ENVIRONMENTAL (5 policies) ====================
  {
    id: 'carbon-neutrality',
    department: 'environmental',
    title: 'Carbon Neutrality Push',
    description: 'Advocate for accelerated carbon neutrality timeline',
    status: 'in_progress',
    priority: 'high',
    progress: 30,
    digitalFeatures: ['progress-tracker', 'action-portal', 'impact-calculator'],
    metrics: { reduction: 12, actions: 45, advocates: 890 },
  },
  {
    id: 'sustainable-dining',
    department: 'environmental',
    title: 'Sustainable Dining Initiative',
    description: 'Reduce single-use plastics in dining halls',
    status: 'in_progress',
    priority: 'medium',
    progress: 50,
    digitalFeatures: ['impact-tracker', 'location-guide', 'feedback-system'],
    metrics: { plasticsReduced: 45000, locations: 12, satisfaction: 4.1 },
  },
  {
    id: 'green-fund',
    department: 'environmental',
    title: 'Green Fund Expansion',
    description: 'Increase student green fund for sustainability projects',
    status: 'planned',
    priority: 'medium',
    progress: 25,
    digitalFeatures: ['application-portal', 'project-showcase', 'voting-system'],
    metrics: { projects: 23, funded: 156000, applications: 45 },
  },
  {
    id: 'bike-share',
    department: 'environmental',
    title: 'Bike Share Program',
    description: 'Expand campus bike share availability',
    status: 'planned',
    priority: 'low',
    progress: 15,
    digitalFeatures: ['availability-map', 'reservation-system', 'maintenance-reporter'],
    metrics: { bikes: 89, stations: 12, rides: 4500 },
  },
  {
    id: 'climate-committee',
    department: 'environmental',
    title: 'Climate Action Committee',
    description: 'Student committee advising on campus climate policy',
    status: 'in_progress',
    priority: 'high',
    progress: 40,
    digitalFeatures: ['meeting-calendar', 'member-directory', 'initiative-tracker'],
    metrics: { members: 15, meetings: 12, initiatives: 8 },
  },

  // ==================== STATE & EXTERNAL (5 policies) ====================
  {
    id: 'tuition-advocacy',
    department: 'external',
    title: 'Tuition Advocacy',
    description: 'Lobby General Assembly against tuition increases',
    status: 'in_progress',
    priority: 'high',
    progress: 55,
    digitalFeatures: ['action-alerts', 'contact-reps', 'petition-system', 'impact-tracker'],
    metrics: { signatures: 6700, contacts: 2340, meetings: 8 },
  },
  {
    id: 'unc-coalition',
    department: 'external',
    title: 'UNC System Coalition',
    description: 'Coordinate with other UNC system student governments',
    status: 'in_progress',
    priority: 'medium',
    progress: 45,
    digitalFeatures: ['partner-directory', 'initiative-tracker', 'communication-hub'],
    metrics: { partners: 16, initiatives: 12, meetings: 24 },
  },
  {
    id: 'lobby-day',
    department: 'external',
    title: 'Legislative Lobby Day',
    description: 'Annual trip to Raleigh to advocate for higher ed funding',
    status: 'planned',
    priority: 'high',
    progress: 35,
    digitalFeatures: ['registration-system', 'training-modules', 'schedule-planner'],
    metrics: { participants: 89, meetings: 34, legislators: 45 },
  },
  {
    id: 'bot-liaison',
    department: 'external',
    title: 'Board of Trustees Liaison',
    description: 'Strengthen student voice in BOT meetings',
    status: 'in_progress',
    priority: 'medium',
    progress: 50,
    digitalFeatures: ['meeting-tracker', 'agenda-viewer', 'feedback-portal'],
    metrics: { meetings: 8, items: 23, feedback: 156 },
  },
  {
    id: 'federal-advocacy',
    department: 'external',
    title: 'Federal Advocacy',
    description: 'Engage with federal representatives on student issues',
    status: 'planned',
    priority: 'low',
    progress: 20,
    digitalFeatures: ['action-alerts', 'rep-directory', 'issue-tracker'],
    metrics: { actions: 12, contacts: 890, issues: 8 },
  },
]

// Wellness Resources
export const wellnessResources = [
  { id: 1, name: 'CAPS (Counseling & Psychological Services)', phone: '919-966-3658', url: 'https://caps.unc.edu', hours: 'M-F 8am-5pm', emergency: true },
  { id: 2, name: 'Campus Health Services', phone: '919-966-2281', url: 'https://campushealth.unc.edu', hours: 'M-F 8am-5pm', emergency: false },
  { id: 3, name: 'Student Wellness', phone: '919-962-9355', url: 'https://studentwellness.unc.edu', hours: 'M-F 8am-5pm', emergency: false },
  { id: 4, name: 'Crisis Text Line', phone: 'Text HOME to 741741', url: 'https://www.crisistextline.org', hours: '24/7', emergency: true },
  { id: 5, name: 'National Suicide Prevention Lifeline', phone: '988', url: 'https://988lifeline.org', hours: '24/7', emergency: true },
  { id: 6, name: 'LGBTQ Center', phone: '919-843-5376', url: 'https://lgbtq.unc.edu', hours: 'M-F 9am-5pm', emergency: false },
]

// Food Pantry Locations
export const pantryLocations = [
  { id: 1, name: 'Carolina Cupboard - Student Union', address: 'Frank Porter Graham Student Union', hours: 'M-F 10am-4pm', inventory: 'high' },
  { id: 2, name: 'Carolina Cupboard - South Campus', address: 'Ram Village Community Center', hours: 'T/Th 2pm-6pm', inventory: 'medium' },
  { id: 3, name: 'Carolina Cupboard - North Campus', address: 'Hinton James Residence Hall', hours: 'M/W 3pm-7pm', inventory: 'high' },
]

// Research Positions
export const researchPositions = [
  { id: 1, title: 'Undergraduate Research Assistant - Psychology', department: 'Psychology', professor: 'Dr. Sarah Chen', type: 'paid', hours: '10-15/week', deadline: '2026-02-15' },
  { id: 2, title: 'Lab Assistant - Biochemistry', department: 'Chemistry', professor: 'Dr. Michael Torres', type: 'credit', hours: '8-12/week', deadline: '2026-02-28' },
  { id: 3, title: 'Data Analysis Intern - Public Policy', department: 'Public Policy', professor: 'Dr. Amanda Wright', type: 'paid', hours: '15-20/week', deadline: '2026-03-01' },
  { id: 4, title: 'Field Research Assistant - Environmental Science', department: 'Environmental Sciences', professor: 'Dr. James Park', type: 'credit', hours: '10/week', deadline: '2026-02-20' },
  { id: 5, title: 'Clinical Research Coordinator - Medicine', department: 'School of Medicine', professor: 'Dr. Lisa Johnson', type: 'paid', hours: '20/week', deadline: '2026-03-15' },
]

// Cultural Centers
export const culturalCenters = [
  { id: 1, name: 'Stone Center for Black Culture and History', location: 'South Building', phone: '919-962-9001', events: 12 },
  { id: 2, name: 'American Indian Center', location: 'Abernethy Hall', phone: '919-962-5236', events: 8 },
  { id: 3, name: 'Asian American Center', location: 'SASB North', phone: '919-962-0411', events: 10 },
  { id: 4, name: 'Carolina Latinx Center', location: 'SASB North', phone: '919-962-3250', events: 9 },
  { id: 5, name: 'LGBTQ Center', location: 'SASB North', phone: '919-843-5376', events: 15 },
]

// Town Hall Events
export const townHallEvents = [
  { id: 1, title: 'Spring Semester Kickoff Town Hall', date: '2026-01-28', time: '6:00 PM', location: 'Carroll Hall Auditorium', topics: ['Spring priorities', 'Budget updates', 'Q&A'] },
  { id: 2, title: 'Mental Health & Wellness Forum', date: '2026-02-15', time: '5:30 PM', location: 'Student Union Great Hall', topics: ['CAPS expansion', 'Wellness resources', 'Student concerns'] },
  { id: 3, title: 'Tuition & Affordability Discussion', date: '2026-03-05', time: '6:00 PM', location: 'Genome Sciences Building', topics: ['Tuition freeze', 'Financial aid', 'Cost of living'] },
]

// Budget Data for Transparency
export const budgetData = {
  total: 425000,
  allocated: 312500,
  spent: 198750,
  categories: [
    { name: 'Student Organizations', allocated: 125000, spent: 89000 },
    { name: 'Events & Programming', allocated: 75000, spent: 45000 },
    { name: 'Basic Needs Initiatives', allocated: 50000, spent: 32000 },
    { name: 'Wellness Programs', allocated: 35000, spent: 18000 },
    { name: 'Advocacy & Outreach', allocated: 27500, spent: 14750 },
  ]
}

// Helper functions
export function getPolicyById(id) {
  return policies.find(p => p.id === id)
}

export function getPoliciesByDepartment(deptId) {
  return policies.filter(p => p.department === deptId)
}

export function getDepartmentById(id) {
  return departments.find(d => d.id === id)
}

export function getOverallProgress() {
  const total = policies.reduce((sum, p) => sum + p.progress, 0)
  return Math.round(total / policies.length)
}

export function getStatusCounts() {
  return {
    completed: policies.filter(p => p.status === 'completed').length,
    in_progress: policies.filter(p => p.status === 'in_progress').length,
    planned: policies.filter(p => p.status === 'planned').length,
  }
}
