// Project Bold - Complete Policy Data and Digital Infrastructure Schema
// All progress starts at 0 - Admin can update via dashboard

export const ADMIN_KEY = 'projectbold2026'

export const departments = [
  { id: 'wellness', name: 'Student Wellness', icon: '🏥', color: 'green', description: 'Mental health, safety, and holistic student wellbeing' },
  { id: 'basic-needs', name: 'Basic Needs', icon: '🍎', color: 'orange', description: 'Food security, housing, textbooks, and financial support' },
  { id: 'academic', name: 'Academic Affairs', icon: '📚', color: 'blue', description: 'Registration, advising, research, and academic success' },
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
  },

  // Events
  events: {
    townHalls: [],
  },

  // Petitions & Advocacy
  advocacy: {
    capsExpansion: { signatures: 0, signers: [] },
    carbonNeutrality: { signatures: 0, signers: [] },
  },

  // Registrations
  registrations: {
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

// Department contacts - Who to reach for help
export const departmentContacts = {
  wellness: {
    lead: { name: 'Jordan Mitchell', title: 'Wellness Chair', email: 'wellness@unc.edu' },
    office: 'Student Union, Room 3104',
    hours: 'Monday-Friday 10am-4pm',
    phone: '919-962-3195',
    socialMedia: '@UNCWellness',
  },
  'basic-needs': {
    lead: { name: 'Aisha Thompson', title: 'Basic Needs Chair', email: 'basicneeds@unc.edu' },
    office: 'Student Union, Room 3106',
    hours: 'Monday-Friday 9am-5pm',
    phone: '919-962-3196',
    socialMedia: '@UNCBasicNeeds',
  },
  academic: {
    lead: { name: 'Michael Chen', title: 'Academic Affairs Chair', email: 'academic@unc.edu' },
    office: 'Student Union, Room 3108',
    hours: 'Monday-Thursday 11am-3pm',
    phone: '919-962-3197',
    socialMedia: '@UNCAcademicAffairs',
  },
  communications: {
    lead: { name: 'David Park', title: 'Communications Chair', email: 'sgcomms@unc.edu' },
    office: 'Student Union, Room 3112',
    hours: 'Monday-Friday 10am-5pm',
    phone: '919-962-3199',
    socialMedia: '@UNCSG',
  },
  environmental: {
    lead: { name: 'Emma Rodriguez', title: 'Environmental Chair', email: 'environment@unc.edu' },
    office: 'Student Union, Room 3114',
    hours: 'Monday, Wednesday, Friday 1pm-5pm',
    phone: '919-962-3200',
    socialMedia: '@UNCGreen',
  },
}

// Department FAQs - Common questions students ask
export const departmentFAQs = {
  wellness: [
    { q: 'How do I schedule an appointment with CAPS?', a: 'Call 919-966-3658 or visit caps.unc.edu to schedule. Same-day appointments are available for urgent needs.' },
    { q: 'Is counseling confidential?', a: 'Yes, counseling sessions are confidential. Information is not shared without your consent, except in cases of imminent danger.' },
    { q: 'What if I need help after hours?', a: 'Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741 (Crisis Text Line) for 24/7 support. CAPS also has an after-hours crisis line.' },
    { q: 'How do I become a Wellness Ambassador?', a: 'Applications open each semester. Fill out the form on this page when applications are open, usually in the first two weeks of the semester.' },
    { q: 'Is Mental Health First Aid training free?', a: 'Yes, training is free for all UNC students. Sessions are 8 hours and include certification.' },
  ],
  'basic-needs': [
    { q: 'How do I access the food pantry?', a: 'Visit any Carolina Cupboard location during open hours. No appointment needed - just bring your UNC One Card.' },
    { q: 'Can I get emergency financial help?', a: 'Yes, the Dean of Students Office offers emergency funds. Apply through the Emergency Housing Fund portal on this page.' },
    { q: 'How do I borrow a laptop?', a: 'Submit a request through the Technology Loaner tab. Loans are typically approved within 2-3 business days.' },
    { q: 'Are there limits on food pantry visits?', a: 'No limits. Visit as often as you need. We recommend one visit per week to ensure availability for all students.' },
    { q: 'What if I\'m facing housing insecurity?', a: 'Contact the Dean of Students immediately at 919-966-4042. Emergency housing funds and temporary accommodations are available.' },
  ],
  academic: [
    { q: 'How can I find a research position?', a: 'Browse our Research Opportunities Database, attend lab fairs, or reach out directly to professors whose work interests you.' },
    { q: 'Why can\'t I see syllabi before registration?', a: 'We\'re advocating for syllabus transparency. Currently, you can email professors directly or check the Syllabus Repository for available syllabi.' },
    { q: 'How do I report registration issues?', a: 'Use the feedback form on this page or email registrar@unc.edu. We compile issues to advocate for improvements.' },
    { q: 'Can I transfer credits from community college?', a: 'Yes, use the Credit Transfer Portal to check equivalencies. Processing takes 2-4 weeks typically.' },
    { q: 'How do I change my academic advisor?', a: 'Contact your department\'s advising office. You can also use our Advisor Directory to find advisors with availability.' },
  ],
  communications: [
    { q: 'How do I subscribe to the newsletter?', a: 'Enter your email in the subscription form on this page. Newsletters go out every Wednesday during the academic year.' },
    { q: 'When are Town Halls held?', a: 'Town Halls are held monthly, typically the first Tuesday of each month at 6pm in the Student Union.' },
    { q: 'How can I submit a question for Town Hall?', a: 'Use the Question Submission form on this page. Questions can be submitted anonymously.' },
    { q: 'Where can I see how SG spends money?', a: 'Visit the Transparency Dashboard to see real-time budget allocation, spending, and policy progress.' },
    { q: 'How do I contact Student Government?', a: 'Email sg@unc.edu, DM us on Instagram @UNCSG, or visit our office in the Student Union Room 3102.' },
  ],
  environmental: [
    { q: 'How do I propose a sustainability project?', a: 'Apply to the Green Fund through the application portal. Projects can receive up to $5,000 in funding.' },
    { q: 'Where can I find bike share stations?', a: 'Check the interactive map on this page. Stations are located near major campus buildings and residence halls.' },
    { q: 'How is UNC progressing on carbon neutrality?', a: 'Track progress on the Carbon Neutrality tracker. UNC aims for carbon neutrality by 2040.' },
    { q: 'How can I reduce plastic use on campus?', a: 'Bring reusable containers to dining halls (discounts available), use water refill stations, and support sustainable dining initiatives.' },
    { q: 'How do I join the Climate Action Committee?', a: 'Applications open each August. Meetings are held biweekly and are open to all students to attend.' },
  ],
}

// Recent announcements for each department
export const departmentAnnouncements = {
  wellness: [
    { id: 1, date: '2026-01-25', title: 'New CAPS Drop-In Hours', content: 'CAPS now offers walk-in hours Monday-Wednesday 2-4pm. No appointment needed.', type: 'update' },
    { id: 2, date: '2026-01-20', title: 'Mental Health First Aid Training Open', content: 'Spring 2026 training sessions are now open for registration. Limited spots available.', type: 'event' },
    { id: 3, date: '2026-01-15', title: 'Wellness Ambassador Applications', content: 'Applications for Spring 2026 Wellness Ambassadors are now open through Feb 1.', type: 'deadline' },
  ],
  'basic-needs': [
    { id: 1, date: '2026-01-24', title: 'New Pantry Location Open', content: 'The North Campus Carolina Cupboard location is now open in Hinton James.', type: 'update' },
    { id: 2, date: '2026-01-18', title: 'Emergency Fund Deadline', content: 'Spring semester emergency housing fund applications due by Feb 15.', type: 'deadline' },
    { id: 3, date: '2026-01-10', title: 'Tech Loaner Inventory Expanded', content: '20 new laptops and 15 hotspots added to the loaner program.', type: 'update' },
  ],
  academic: [
    { id: 1, date: '2026-01-22', title: 'Registration Feedback Survey', content: 'Share your Spring 2026 registration experience to help us advocate for improvements.', type: 'survey' },
    { id: 2, date: '2026-01-17', title: 'Research Fair Coming Up', content: 'Undergraduate Research Fair on Feb 5 in the Union. Meet faculty from all departments.', type: 'event' },
    { id: 3, date: '2026-01-12', title: 'New OER Courses Added', content: '15 new courses now using Open Educational Resources - saving students over $20,000.', type: 'update' },
  ],
  communications: [
    { id: 1, date: '2026-01-25', title: 'Town Hall This Tuesday', content: 'Join us Feb 4 at 6pm in Union 3201 for our first Town Hall of the semester.', type: 'event' },
    { id: 2, date: '2026-01-19', title: 'Newsletter Redesign', content: 'Check out our redesigned weekly newsletter with improved readability.', type: 'update' },
    { id: 3, date: '2026-01-13', title: 'Campus Pulse Survey Live', content: 'Take our spring priorities survey to help shape SG initiatives.', type: 'survey' },
  ],
  environmental: [
    { id: 1, date: '2026-01-23', title: 'Green Fund Applications Open', content: 'Submit your sustainability project proposal by Feb 28 for spring funding.', type: 'deadline' },
    { id: 2, date: '2026-01-16', title: 'Dining Hall Plastic Reduction', content: 'Lenoir now offers 25¢ off when you bring your own container.', type: 'update' },
    { id: 3, date: '2026-01-09', title: 'Bike Share Expansion', content: '5 new stations added near South Campus residence halls.', type: 'update' },
  ],
}

// Step-by-step guides for common services
export const serviceGuides = {
  'caps-appointment': {
    title: 'How to Schedule a CAPS Appointment',
    steps: [
      { step: 1, title: 'Call or Visit', description: 'Call 919-966-3658 or visit caps.unc.edu during business hours (M-F 8am-5pm)' },
      { step: 2, title: 'Initial Screening', description: 'Complete a brief phone screening to assess your needs (10-15 minutes)' },
      { step: 3, title: 'Schedule Appointment', description: 'You\'ll be matched with a counselor and given appointment options' },
      { step: 4, title: 'First Session', description: 'Arrive 15 minutes early to complete paperwork. Sessions are 50 minutes.' },
    ],
  },
  'food-pantry': {
    title: 'How to Use Carolina Cupboard',
    steps: [
      { step: 1, title: 'Find a Location', description: 'Check the locations tab for hours and addresses of all pantry sites' },
      { step: 2, title: 'Visit During Hours', description: 'Walk in during open hours - no appointment needed' },
      { step: 3, title: 'Bring Your One Card', description: 'Show your UNC One Card for verification' },
      { step: 4, title: 'Shop Freely', description: 'Take what you need - there\'s no limit on items per visit' },
    ],
  },
  'tech-loaner': {
    title: 'How to Borrow a Laptop or Hotspot',
    steps: [
      { step: 1, title: 'Submit Request', description: 'Fill out the Tech Loaner request form on this page' },
      { step: 2, title: 'Wait for Approval', description: 'Requests are reviewed within 2-3 business days' },
      { step: 3, title: 'Pick Up Device', description: 'Collect your device from Davis Library Tech Desk with your One Card' },
      { step: 4, title: 'Return on Time', description: 'Loans are for the semester. Return by the last day of finals.' },
    ],
  },
  'research-position': {
    title: 'How to Find a Research Position',
    steps: [
      { step: 1, title: 'Browse Opportunities', description: 'Check our Research Database for posted positions across departments' },
      { step: 2, title: 'Prepare Materials', description: 'Have your resume, transcript, and research interests statement ready' },
      { step: 3, title: 'Reach Out', description: 'Email professors directly or apply through the database portal' },
      { step: 4, title: 'Follow Up', description: 'If you don\'t hear back in 2 weeks, send a polite follow-up email' },
    ],
  },
  'green-fund': {
    title: 'How to Apply for Green Fund',
    steps: [
      { step: 1, title: 'Develop Your Idea', description: 'Projects should have clear environmental benefits and measurable outcomes' },
      { step: 2, title: 'Find a Sponsor', description: 'You need a faculty or staff advisor to sponsor your project' },
      { step: 3, title: 'Submit Proposal', description: 'Complete the application with budget, timeline, and impact statement' },
      { step: 4, title: 'Present to Committee', description: 'Shortlisted projects present to the Green Fund Committee for final selection' },
    ],
  },
}

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
