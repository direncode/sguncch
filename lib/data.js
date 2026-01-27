// Project Bold - World-Class Digital Governance Platform
// Inspired by Singapore Smart Nation & UAE Dubai Smart Government
// All progress starts at 0 - Admin can update via dashboard

export const ADMIN_KEY = 'projectbold2026'

// ============================================
// DEPARTMENT CONFIGURATION
// Singapore/UAE-style service delivery framework
// ============================================
export const departments = [
  {
    id: 'wellness',
    name: 'Student Wellness',
    icon: '🏥',
    color: 'green',
    accentColor: '#3fb950',
    description: 'Mental health, safety, and holistic student wellbeing',
    tagline: 'Your wellbeing is our priority',
    sla: { responseTime: '24h', resolutionTime: '72h' },
    serviceLevel: 'PREMIUM',
    satisfactionTarget: 95,
    channels: ['in-person', 'digital', 'hotline', 'chat']
  },
  {
    id: 'basic-needs',
    name: 'Basic Needs',
    icon: '🍎',
    color: 'orange',
    accentColor: '#d29922',
    description: 'Food security, housing, textbooks, and financial support',
    tagline: 'No student left behind',
    sla: { responseTime: '4h', resolutionTime: '48h' },
    serviceLevel: 'CRITICAL',
    satisfactionTarget: 98,
    channels: ['in-person', 'digital', 'emergency-line']
  },
  {
    id: 'academic',
    name: 'Academic Affairs',
    icon: '📚',
    color: 'blue',
    accentColor: '#388bfd',
    description: 'Registration, advising, research, and academic success',
    tagline: 'Excellence in education',
    sla: { responseTime: '48h', resolutionTime: '5d' },
    serviceLevel: 'STANDARD',
    satisfactionTarget: 90,
    channels: ['digital', 'appointment', 'walk-in']
  },
  {
    id: 'civic',
    name: 'Civic Engagement',
    icon: '🗳️',
    color: 'purple',
    accentColor: '#a371f7',
    description: 'Voting, service, and community participation',
    tagline: 'Your voice matters',
    sla: { responseTime: '24h', resolutionTime: '72h' },
    serviceLevel: 'STANDARD',
    satisfactionTarget: 92,
    channels: ['digital', 'events', 'partnerships']
  },
  {
    id: 'communications',
    name: 'Communications',
    icon: '📢',
    color: 'cyan',
    accentColor: '#00d4ff',
    description: 'Outreach, transparency, and student voice',
    tagline: 'Transparent by design',
    sla: { responseTime: '12h', resolutionTime: '48h' },
    serviceLevel: 'PREMIUM',
    satisfactionTarget: 94,
    channels: ['digital', 'social', 'newsletter', 'townhall']
  },
  {
    id: 'environmental',
    name: 'Environmental',
    icon: '🌱',
    color: 'emerald',
    accentColor: '#10b981',
    description: 'Sustainability, climate action, and green initiatives',
    tagline: 'Building a sustainable future',
    sla: { responseTime: '48h', resolutionTime: '7d' },
    serviceLevel: 'STANDARD',
    satisfactionTarget: 90,
    channels: ['digital', 'projects', 'committees']
  },
]

// ============================================
// COMPREHENSIVE POLICY DATA
// World-class service delivery with KPIs
// ============================================
export const initialPolicies = [
  // ========== STUDENT WELLNESS ==========
  {
    id: 'wellness-button',
    department: 'wellness',
    title: 'Smart Wellness Portal',
    description: 'AI-powered wellness hub with instant resource matching, appointment booking, and crisis intervention',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Design',
    targetDate: '2026-03-01',
    budget: 15000,
    lead: 'Wellness Committee',
    digitalFeatures: ['ai-triage', 'instant-booking', 'crisis-detection', 'resource-matching', 'mood-tracking'],
    metrics: { users: 0, sessions: 0, satisfaction: 0, avgResponseTime: 0 },
    kpis: [
      { name: 'User Adoption', target: 5000, current: 0, unit: 'students' },
      { name: 'Avg Response Time', target: 30, current: 0, unit: 'seconds' },
      { name: 'Crisis Interventions', target: 100, current: 0, unit: '%' },
      { name: 'Satisfaction Score', target: 4.8, current: 0, unit: '/5' }
    ],
    milestones: [
      { name: 'Requirements Gathering', status: 'pending', date: '2026-01-15' },
      { name: 'UI/UX Design', status: 'pending', date: '2026-02-01' },
      { name: 'Development', status: 'pending', date: '2026-02-15' },
      { name: 'Beta Launch', status: 'pending', date: '2026-03-01' }
    ]
  },
  {
    id: 'mental-health-first-aid',
    department: 'wellness',
    title: 'Mental Health First Responder Network',
    description: 'Certified peer responder program with real-time dispatch, location tracking, and incident management',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Planning',
    targetDate: '2026-04-01',
    budget: 25000,
    lead: 'CAPS Partnership',
    digitalFeatures: ['responder-app', 'real-time-dispatch', 'incident-logging', 'certification-portal', 'shift-management'],
    metrics: { trained: 0, incidents: 0, responseTime: 0, satisfaction: 0 },
    kpis: [
      { name: 'Certified Responders', target: 200, current: 0, unit: 'students' },
      { name: 'Avg Dispatch Time', target: 5, current: 0, unit: 'minutes' },
      { name: 'Coverage Hours', target: 168, current: 0, unit: 'hrs/week' },
      { name: 'Success Rate', target: 95, current: 0, unit: '%' }
    ],
    milestones: [
      { name: 'Curriculum Development', status: 'pending', date: '2026-01-20' },
      { name: 'App Development', status: 'pending', date: '2026-02-15' },
      { name: 'Pilot Training', status: 'pending', date: '2026-03-15' },
      { name: 'Full Deployment', status: 'pending', date: '2026-04-01' }
    ]
  },
  {
    id: 'wellness-ambassadors',
    department: 'wellness',
    title: 'Wellness Ambassador Intelligence Network',
    description: 'Data-driven peer support network with sentiment analysis and predictive outreach capabilities',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Concept',
    targetDate: '2026-05-01',
    budget: 12000,
    lead: 'Student Affairs',
    digitalFeatures: ['ambassador-dashboard', 'outreach-scheduler', 'impact-analytics', 'peer-matching-ai'],
    metrics: { ambassadors: 0, outreaches: 0, impactScore: 0 },
    kpis: [
      { name: 'Active Ambassadors', target: 100, current: 0, unit: 'students' },
      { name: 'Monthly Outreaches', target: 500, current: 0, unit: 'contacts' },
      { name: 'Referral Success', target: 80, current: 0, unit: '%' }
    ]
  },
  {
    id: 'caps-expansion',
    department: 'wellness',
    title: 'CAPS Capacity Enhancement Initiative',
    description: 'Strategic expansion of counseling services with telehealth integration and extended hours',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Advocacy',
    targetDate: '2026-06-01',
    budget: 0,
    lead: 'Executive Board',
    digitalFeatures: ['petition-tracker', 'impact-dashboard', 'stakeholder-portal'],
    metrics: { signatures: 0, meetings: 0, mediaHits: 0 },
    kpis: [
      { name: 'Petition Signatures', target: 5000, current: 0, unit: 'signatures' },
      { name: 'Admin Meetings', target: 10, current: 0, unit: 'meetings' },
      { name: 'Wait Time Reduction', target: 50, current: 0, unit: '%' }
    ]
  },
  {
    id: 'crisis-text-line',
    department: 'wellness',
    title: '24/7 Crisis Support Integration',
    description: 'Seamless integration with national crisis services including real-time analytics and follow-up protocols',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Partnership',
    targetDate: '2026-02-01',
    budget: 5000,
    lead: 'Wellness Committee',
    digitalFeatures: ['crisis-dashboard', 'follow-up-automation', 'resource-integration'],
    metrics: { awareness: 0, utilization: 0, followUps: 0 },
    kpis: [
      { name: 'Awareness Rate', target: 90, current: 0, unit: '%' },
      { name: 'Monthly Utilization', target: 100, current: 0, unit: 'sessions' },
      { name: 'Follow-up Rate', target: 100, current: 0, unit: '%' }
    ]
  },

  // ========== BASIC NEEDS ==========
  {
    id: 'carolina-cupboard',
    department: 'basic-needs',
    title: 'Smart Pantry Network',
    description: 'IoT-enabled food pantry system with real-time inventory, predictive restocking, and anonymous access',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Design',
    targetDate: '2026-03-15',
    budget: 35000,
    lead: 'Basic Needs Committee',
    digitalFeatures: ['inventory-iot', 'predictive-ordering', 'anonymous-checkout', 'nutrition-tracking', 'donation-portal'],
    metrics: { visits: 0, itemsDistributed: 0, uniqueUsers: 0, donationsReceived: 0 },
    kpis: [
      { name: 'Daily Visits', target: 200, current: 0, unit: 'visits' },
      { name: 'Inventory Accuracy', target: 99, current: 0, unit: '%' },
      { name: 'Waste Reduction', target: 90, current: 0, unit: '%' },
      { name: 'User Satisfaction', target: 4.9, current: 0, unit: '/5' }
    ],
    milestones: [
      { name: 'IoT Sensor Installation', status: 'pending', date: '2026-01-30' },
      { name: 'App Development', status: 'pending', date: '2026-02-15' },
      { name: 'Pilot at Main Location', status: 'pending', date: '2026-03-01' },
      { name: 'Full Network Rollout', status: 'pending', date: '2026-03-15' }
    ]
  },
  {
    id: 'emergency-housing',
    department: 'basic-needs',
    title: 'Emergency Housing Response System',
    description: 'Rapid-response housing assistance with 4-hour processing, partner hotel network, and case management',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Setup',
    targetDate: '2026-02-01',
    budget: 50000,
    lead: 'Housing Partnership',
    digitalFeatures: ['instant-application', 'case-tracker', 'partner-network', 'fund-management'],
    metrics: { applications: 0, approved: 0, avgProcessTime: 0, fundsDistributed: 0 },
    kpis: [
      { name: 'Processing Time', target: 4, current: 0, unit: 'hours' },
      { name: 'Approval Rate', target: 85, current: 0, unit: '%' },
      { name: 'Students Housed', target: 100, current: 0, unit: 'students/year' },
      { name: 'Fund Utilization', target: 95, current: 0, unit: '%' }
    ]
  },
  {
    id: 'textbook-affordability',
    department: 'basic-needs',
    title: 'Open Education Resource Hub',
    description: 'Comprehensive OER platform with course matching, savings calculator, and faculty adoption tracking',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Development',
    targetDate: '2026-04-01',
    budget: 20000,
    lead: 'Academic Partnership',
    digitalFeatures: ['oer-search', 'savings-calculator', 'faculty-portal', 'adoption-tracker'],
    metrics: { oerCourses: 0, studentSavings: 0, facultyAdoptions: 0 },
    kpis: [
      { name: 'OER Courses', target: 200, current: 0, unit: 'courses' },
      { name: 'Annual Savings', target: 500000, current: 0, unit: '$' },
      { name: 'Faculty Adoption', target: 50, current: 0, unit: '%' }
    ]
  },
  {
    id: 'technology-loaner',
    department: 'basic-needs',
    title: 'Digital Equity Device Program',
    description: 'Enterprise-grade device lending with automated checkout, remote support, and predictive maintenance',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Expansion',
    targetDate: '2026-02-15',
    budget: 75000,
    lead: 'IT Partnership',
    digitalFeatures: ['smart-checkout', 'remote-support', 'device-tracking', 'maintenance-ai'],
    metrics: { devices: 0, activeLoans: 0, supportTickets: 0 },
    kpis: [
      { name: 'Device Fleet', target: 500, current: 0, unit: 'devices' },
      { name: 'Utilization Rate', target: 90, current: 0, unit: '%' },
      { name: 'Support Response', target: 15, current: 0, unit: 'minutes' },
      { name: 'Device Uptime', target: 99, current: 0, unit: '%' }
    ]
  },
  {
    id: 'financial-literacy',
    department: 'basic-needs',
    title: 'Financial Wellness Academy',
    description: 'Gamified financial education platform with AI coaching, budgeting tools, and scholarship matching',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Design',
    targetDate: '2026-05-01',
    budget: 15000,
    lead: 'Financial Aid Partnership',
    digitalFeatures: ['learning-modules', 'budget-ai', 'scholarship-matcher', 'progress-tracking'],
    metrics: { enrollments: 0, completions: 0, scholarshipsMatched: 0 },
    kpis: [
      { name: 'Program Enrollments', target: 2000, current: 0, unit: 'students' },
      { name: 'Completion Rate', target: 80, current: 0, unit: '%' },
      { name: 'Financial Confidence', target: 40, current: 0, unit: '% increase' }
    ]
  },

  // ========== ACADEMIC AFFAIRS ==========
  {
    id: 'registration-reform',
    department: 'academic',
    title: 'Smart Registration System',
    description: 'AI-powered course recommendation with predictive waitlist, conflict detection, and degree planning',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Advocacy',
    targetDate: '2026-08-01',
    budget: 0,
    lead: 'Academic Committee',
    digitalFeatures: ['ai-recommendations', 'waitlist-predictor', 'degree-planner', 'feedback-portal'],
    metrics: { feedbackSubmitted: 0, issuesResolved: 0, satisfactionIncrease: 0 },
    kpis: [
      { name: 'Feedback Collected', target: 3000, current: 0, unit: 'responses' },
      { name: 'Issues Escalated', target: 50, current: 0, unit: 'issues' },
      { name: 'Admin Engagement', target: 10, current: 0, unit: 'meetings' }
    ]
  },
  {
    id: 'advising-enhancement',
    department: 'academic',
    title: 'Advising Excellence Program',
    description: 'Standardized advising framework with real-time appointment booking and satisfaction tracking',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Planning',
    targetDate: '2026-06-01',
    budget: 10000,
    lead: 'Academic Committee',
    digitalFeatures: ['advisor-matching', 'instant-booking', 'feedback-system', 'quality-metrics'],
    metrics: { appointments: 0, avgRating: 0, issuesReported: 0 },
    kpis: [
      { name: 'Booking Time', target: 2, current: 0, unit: 'minutes' },
      { name: 'Advisor Rating', target: 4.5, current: 0, unit: '/5' },
      { name: 'Issue Resolution', target: 90, current: 0, unit: '%' }
    ]
  },
  {
    id: 'research-opportunities',
    department: 'academic',
    title: 'Research Connect Platform',
    description: 'AI-matched research placement system with faculty profiles, project tracking, and outcomes dashboard',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Development',
    targetDate: '2026-04-01',
    budget: 25000,
    lead: 'Research Office Partnership',
    digitalFeatures: ['ai-matching', 'faculty-profiles', 'application-tracker', 'outcomes-dashboard'],
    metrics: { positions: 0, applications: 0, placements: 0, publications: 0 },
    kpis: [
      { name: 'Active Positions', target: 500, current: 0, unit: 'positions' },
      { name: 'Match Rate', target: 70, current: 0, unit: '%' },
      { name: 'Student Placements', target: 300, current: 0, unit: 'students/year' }
    ]
  },
  {
    id: 'syllabus-transparency',
    department: 'academic',
    title: 'Course Intelligence Repository',
    description: 'Comprehensive course database with syllabi, workload analytics, and peer reviews',
    status: 'planned',
    priority: 'low',
    progress: 0,
    phase: 'Concept',
    targetDate: '2026-09-01',
    budget: 8000,
    lead: 'Academic Committee',
    digitalFeatures: ['syllabus-search', 'workload-ratings', 'peer-reviews', 'professor-analytics'],
    metrics: { syllabi: 0, reviews: 0, coursesCovered: 0 },
    kpis: [
      { name: 'Course Coverage', target: 80, current: 0, unit: '%' },
      { name: 'Review Count', target: 10000, current: 0, unit: 'reviews' },
      { name: 'User Satisfaction', target: 4.0, current: 0, unit: '/5' }
    ]
  },
  {
    id: 'credit-transfer',
    department: 'academic',
    title: 'Transfer Credit Navigator',
    description: 'Instant credit evaluation with equivalency database, appeal tracking, and advisor integration',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Planning',
    targetDate: '2026-07-01',
    budget: 12000,
    lead: 'Registrar Partnership',
    digitalFeatures: ['equivalency-search', 'instant-evaluation', 'appeal-tracker', 'advisor-sync'],
    metrics: { evaluations: 0, approvalRate: 0, avgProcessTime: 0 },
    kpis: [
      { name: 'Processing Time', target: 48, current: 0, unit: 'hours' },
      { name: 'Approval Rate', target: 85, current: 0, unit: '%' },
      { name: 'User Satisfaction', target: 4.2, current: 0, unit: '/5' }
    ]
  },

  // ========== CIVIC ENGAGEMENT ==========
  {
    id: 'voter-registration',
    department: 'civic',
    title: 'Democracy Hub',
    description: 'One-stop voter services with registration, polling info, ballot preview, and turnout tracking',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Development',
    targetDate: '2026-09-01',
    budget: 20000,
    lead: 'Civic Committee',
    digitalFeatures: ['instant-registration', 'polling-finder', 'ballot-preview', 'turnout-dashboard', 'reminder-system'],
    metrics: { registered: 0, turnout: 0, events: 0 },
    kpis: [
      { name: 'Students Registered', target: 10000, current: 0, unit: 'students' },
      { name: 'Turnout Rate', target: 75, current: 0, unit: '%' },
      { name: 'Event Attendance', target: 2000, current: 0, unit: 'students' }
    ]
  },
  {
    id: 'civic-fellows',
    department: 'civic',
    title: 'Public Service Fellowship',
    description: 'Competitive fellowship with government placements, mentorship network, and career tracking',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Setup',
    targetDate: '2026-05-01',
    budget: 30000,
    lead: 'Career Services Partnership',
    digitalFeatures: ['application-portal', 'placement-tracker', 'mentor-network', 'alumni-directory'],
    metrics: { applicants: 0, fellows: 0, placements: 0 },
    kpis: [
      { name: 'Applications', target: 200, current: 0, unit: 'applications' },
      { name: 'Fellowship Placements', target: 30, current: 0, unit: 'fellows' },
      { name: 'Career Conversion', target: 60, current: 0, unit: '%' }
    ]
  },
  {
    id: 'town-gown',
    department: 'civic',
    title: 'Community Partnership Portal',
    description: 'Digital bridge between campus and community with project matching and impact measurement',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Planning',
    targetDate: '2026-06-01',
    budget: 15000,
    lead: 'Town Relations Committee',
    digitalFeatures: ['project-board', 'partner-directory', 'impact-tracker', 'event-calendar'],
    metrics: { partnerships: 0, projects: 0, volunteersHours: 0 },
    kpis: [
      { name: 'Active Partnerships', target: 50, current: 0, unit: 'partners' },
      { name: 'Community Projects', target: 100, current: 0, unit: 'projects' },
      { name: 'Volunteer Hours', target: 10000, current: 0, unit: 'hours' }
    ]
  },
  {
    id: 'election-transit',
    department: 'civic',
    title: 'Vote Express Transit System',
    description: 'Real-time shuttle tracking to polling locations with capacity management and accessibility features',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Partnership',
    targetDate: '2026-10-01',
    budget: 25000,
    lead: 'Transit Partnership',
    digitalFeatures: ['live-tracking', 'capacity-monitor', 'accessibility-booking', 'route-optimizer'],
    metrics: { rides: 0, locations: 0, accessibility: 0 },
    kpis: [
      { name: 'Riders Transported', target: 3000, current: 0, unit: 'rides' },
      { name: 'Wait Time', target: 10, current: 0, unit: 'minutes' },
      { name: 'Accessibility Score', target: 100, current: 0, unit: '%' }
    ]
  },
  {
    id: 'democracy-week',
    department: 'civic',
    title: 'Democracy Festival',
    description: 'Annual civic celebration with speakers, workshops, debates, and interactive civic tech demos',
    status: 'planned',
    priority: 'low',
    progress: 0,
    phase: 'Planning',
    targetDate: '2026-10-15',
    budget: 40000,
    lead: 'Events Committee',
    digitalFeatures: ['event-app', 'speaker-profiles', 'session-booking', 'engagement-gamification'],
    metrics: { events: 0, attendance: 0, speakers: 0 },
    kpis: [
      { name: 'Total Attendance', target: 5000, current: 0, unit: 'attendees' },
      { name: 'Events Hosted', target: 30, current: 0, unit: 'events' },
      { name: 'Engagement Score', target: 4.5, current: 0, unit: '/5' }
    ]
  },

  // ========== COMMUNICATIONS ==========
  {
    id: 'newsletter',
    department: 'communications',
    title: 'Smart Newsletter Platform',
    description: 'AI-personalized newsletter with dynamic content, engagement analytics, and A/B testing',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Development',
    targetDate: '2026-02-01',
    budget: 8000,
    lead: 'Communications Director',
    digitalFeatures: ['ai-personalization', 'engagement-analytics', 'ab-testing', 'auto-scheduling'],
    metrics: { subscribers: 0, openRate: 0, clickRate: 0 },
    kpis: [
      { name: 'Subscribers', target: 15000, current: 0, unit: 'students' },
      { name: 'Open Rate', target: 45, current: 0, unit: '%' },
      { name: 'Click Rate', target: 15, current: 0, unit: '%' }
    ]
  },
  {
    id: 'town-halls',
    department: 'communications',
    title: 'Interactive Town Hall Platform',
    description: 'Hybrid town halls with live polling, Q&A queue, sentiment analysis, and automatic transcription',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Setup',
    targetDate: '2026-02-15',
    budget: 12000,
    lead: 'Communications Director',
    digitalFeatures: ['live-polling', 'qa-queue', 'sentiment-analysis', 'auto-transcription', 'archive-search'],
    metrics: { townHalls: 0, attendance: 0, questions: 0, sentiment: 0 },
    kpis: [
      { name: 'Monthly Attendance', target: 500, current: 0, unit: 'students' },
      { name: 'Questions Answered', target: 90, current: 0, unit: '%' },
      { name: 'Sentiment Score', target: 4.0, current: 0, unit: '/5' }
    ]
  },
  {
    id: 'social-media',
    department: 'communications',
    title: 'Social Command Center',
    description: 'Unified social media management with scheduling, analytics, crisis monitoring, and influencer network',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Implementation',
    targetDate: '2026-01-30',
    budget: 5000,
    lead: 'Social Media Manager',
    digitalFeatures: ['unified-inbox', 'auto-scheduling', 'crisis-monitor', 'influencer-network', 'trend-analysis'],
    metrics: { followers: 0, engagement: 0, reach: 0 },
    kpis: [
      { name: 'Total Followers', target: 25000, current: 0, unit: 'followers' },
      { name: 'Engagement Rate', target: 8, current: 0, unit: '%' },
      { name: 'Monthly Reach', target: 100000, current: 0, unit: 'impressions' }
    ]
  },
  {
    id: 'transparency-dashboard',
    department: 'communications',
    title: 'Open Government Dashboard',
    description: 'Real-time transparency portal with budget visualization, voting records, and meeting archives',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Development',
    targetDate: '2026-03-01',
    budget: 20000,
    lead: 'Transparency Committee',
    digitalFeatures: ['budget-visualizer', 'vote-tracker', 'meeting-archive', 'document-search', 'api-access'],
    metrics: { pageViews: 0, documentsAccessed: 0, apiCalls: 0 },
    kpis: [
      { name: 'Monthly Views', target: 10000, current: 0, unit: 'views' },
      { name: 'Document Access', target: 5000, current: 0, unit: 'downloads' },
      { name: 'Trust Score', target: 4.5, current: 0, unit: '/5' }
    ]
  },
  {
    id: 'campus-pulse',
    department: 'communications',
    title: 'Campus Pulse Intelligence',
    description: 'Real-time sentiment tracking with predictive analytics, issue detection, and policy impact measurement',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Design',
    targetDate: '2026-04-01',
    budget: 15000,
    lead: 'Research Committee',
    digitalFeatures: ['live-sentiment', 'predictive-analytics', 'issue-radar', 'impact-measurement'],
    metrics: { responses: 0, sentimentScore: 0, issuesDetected: 0 },
    kpis: [
      { name: 'Response Rate', target: 30, current: 0, unit: '%' },
      { name: 'Issue Detection', target: 90, current: 0, unit: '%' },
      { name: 'Policy Correlation', target: 0.8, current: 0, unit: 'r²' }
    ]
  },

  // ========== ENVIRONMENTAL ==========
  {
    id: 'carbon-neutrality',
    department: 'environmental',
    title: 'Carbon Zero Command Center',
    description: 'Real-time campus carbon tracking with reduction targets, action campaigns, and impact visualization',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Planning',
    targetDate: '2026-06-01',
    budget: 25000,
    lead: 'Sustainability Office Partnership',
    digitalFeatures: ['carbon-tracker', 'reduction-targets', 'action-campaigns', 'impact-visualizer', 'leaderboard'],
    metrics: { carbonReduction: 0, actionsCompleted: 0, participants: 0 },
    kpis: [
      { name: 'Carbon Reduction', target: 15, current: 0, unit: '%' },
      { name: 'Active Participants', target: 5000, current: 0, unit: 'students' },
      { name: 'Actions Completed', target: 50000, current: 0, unit: 'actions' }
    ]
  },
  {
    id: 'sustainable-dining',
    department: 'environmental',
    title: 'Zero Waste Dining Initiative',
    description: 'Smart dining system with waste tracking, reusable container program, and sustainability scoring',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Pilot',
    targetDate: '2026-03-01',
    budget: 30000,
    lead: 'Dining Services Partnership',
    digitalFeatures: ['waste-tracker', 'reusable-program', 'sustainability-score', 'impact-dashboard'],
    metrics: { wasteReduction: 0, reusableUsage: 0, locations: 0 },
    kpis: [
      { name: 'Waste Reduction', target: 50, current: 0, unit: '%' },
      { name: 'Reusable Adoption', target: 40, current: 0, unit: '%' },
      { name: 'Dining Locations', target: 10, current: 0, unit: 'locations' }
    ]
  },
  {
    id: 'green-fund',
    department: 'environmental',
    title: 'Student Green Investment Fund',
    description: 'Student-governed sustainability fund with project proposals, voting, and impact measurement',
    status: 'planned',
    priority: 'medium',
    progress: 0,
    phase: 'Setup',
    targetDate: '2026-04-01',
    budget: 100000,
    lead: 'Green Fund Committee',
    digitalFeatures: ['proposal-portal', 'student-voting', 'impact-tracking', 'fund-dashboard'],
    metrics: { proposals: 0, funded: 0, totalInvested: 0 },
    kpis: [
      { name: 'Proposals Submitted', target: 50, current: 0, unit: 'proposals' },
      { name: 'Projects Funded', target: 20, current: 0, unit: 'projects' },
      { name: 'Student Participation', target: 3000, current: 0, unit: 'voters' }
    ]
  },
  {
    id: 'bike-share',
    department: 'environmental',
    title: 'Smart Mobility Hub',
    description: 'Integrated bike and scooter sharing with real-time availability, maintenance AI, and trip planning',
    status: 'planned',
    priority: 'low',
    progress: 0,
    phase: 'Planning',
    targetDate: '2026-08-01',
    budget: 50000,
    lead: 'Transportation Partnership',
    digitalFeatures: ['live-availability', 'maintenance-ai', 'trip-planner', 'carbon-calculator'],
    metrics: { rides: 0, activeVehicles: 0, carbonSaved: 0 },
    kpis: [
      { name: 'Daily Rides', target: 500, current: 0, unit: 'rides' },
      { name: 'Fleet Size', target: 200, current: 0, unit: 'vehicles' },
      { name: 'Carbon Saved', target: 50, current: 0, unit: 'tons/year' }
    ]
  },
  {
    id: 'climate-committee',
    department: 'environmental',
    title: 'Student Climate Council',
    description: 'Student advisory body on climate policy with research capabilities and direct admin access',
    status: 'planned',
    priority: 'high',
    progress: 0,
    phase: 'Formation',
    targetDate: '2026-02-15',
    budget: 10000,
    lead: 'Environmental Committee',
    digitalFeatures: ['member-portal', 'research-tools', 'policy-tracker', 'admin-channel'],
    metrics: { members: 0, researchProjects: 0, policiesInfluenced: 0 },
    kpis: [
      { name: 'Council Members', target: 25, current: 0, unit: 'members' },
      { name: 'Research Projects', target: 10, current: 0, unit: 'projects' },
      { name: 'Policy Impact', target: 5, current: 0, unit: 'policies' }
    ]
  },
]

// ============================================
// OPERATIONAL DATA
// Real-time service delivery metrics
// ============================================
export const initialOperationalData = {
  // Technology Loaner Inventory
  techLoaners: {
    devices: [
      { id: 1, type: 'laptop-windows', name: 'Dell Latitude 5520', total: 0, available: 0, onLoan: 0, condition: 'excellent' },
      { id: 2, type: 'laptop-mac', name: 'MacBook Air M2', total: 0, available: 0, onLoan: 0, condition: 'excellent' },
      { id: 3, type: 'laptop-chromebook', name: 'HP Chromebook', total: 0, available: 0, onLoan: 0, condition: 'good' },
      { id: 4, type: 'hotspot', name: 'T-Mobile 5G Hotspot', total: 0, available: 0, onLoan: 0, condition: 'excellent' },
      { id: 5, type: 'tablet', name: 'iPad 10th Gen', total: 0, available: 0, onLoan: 0, condition: 'excellent' },
      { id: 6, type: 'charger', name: 'Universal Charger Kit', total: 0, available: 0, onLoan: 0, condition: 'good' },
    ],
    loans: [],
    waitlist: [],
    sla: { checkoutTime: 5, returnProcessing: 15 }, // minutes
    satisfaction: 0,
  },

  // Smart Pantry Network
  foodPantry: {
    locations: [
      { id: 1, name: 'Main Hub - Student Union', address: 'FPG Student Union, Suite 2100', hours: 'M-F 8am-8pm, Sat 10am-4pm', inventory: 'unknown', visits: 0, capacity: 500, coordinates: { lat: 35.9101, lng: -79.0485 } },
      { id: 2, name: 'South Campus Station', address: 'Ram Village Community Center', hours: 'M-F 10am-6pm', inventory: 'unknown', visits: 0, capacity: 200, coordinates: { lat: 35.9045, lng: -79.0456 } },
      { id: 3, name: 'North Campus Station', address: 'Hinton James Residence Hall', hours: 'M-F 2pm-8pm', inventory: 'unknown', visits: 0, capacity: 200, coordinates: { lat: 35.9134, lng: -79.0512 } },
      { id: 4, name: 'Health Sciences Station', address: 'Health Sciences Library', hours: 'M-F 9am-5pm', inventory: 'unknown', visits: 0, capacity: 150, coordinates: { lat: 35.9067, lng: -79.0534 } },
    ],
    totalVisits: 0,
    uniqueUsers: 0,
    donations: 0,
    itemsDistributed: 0,
    sla: { restockTime: 24 }, // hours
    satisfaction: 0,
  },

  // Emergency Housing Response
  emergencyHousing: {
    applications: [],
    totalFunded: 0,
    amountDistributed: 0,
    avgProcessingTime: 0,
    partnerHotels: 3,
    availableUnits: 0,
    sla: { processingTime: 4, responseTime: 1 }, // hours
    satisfaction: 0,
  },

  // Training Programs
  trainings: {
    mentalHealthFirstAid: {
      sessions: [],
      totalTrained: 0,
      certifications: 0,
      avgRating: 0,
      nextSession: null
    },
  },

  // Ambassadors/Fellows Programs
  programs: {
    wellnessAmbassadors: {
      members: [],
      events: [],
      outreaches: 0,
      impactScore: 0
    },
    civicFellows: {
      fellows: [],
      placements: [],
      activePartners: 0,
      careerConversions: 0
    },
  },

  // Events Management
  events: {
    townHalls: [],
    democracyWeek: [],
    upcomingEvents: [],
    totalAttendance: 0,
    avgSatisfaction: 0,
  },

  // Advocacy Campaigns
  advocacy: {
    capsExpansion: { signatures: 0, signers: [], target: 5000, deadline: '2026-04-01' },
    carbonNeutrality: { signatures: 0, signers: [], target: 3000, deadline: '2026-05-01' },
  },

  // Registration Services
  registrations: {
    voterRegistration: { total: 0, records: [], target: 10000 },
    newsletter: { subscribers: 0, emails: [], target: 15000 },
  },

  // Research Connect
  research: {
    positions: [],
    applications: [],
    placements: 0,
    matchRate: 0,
  },

  // Green Fund
  greenFund: {
    projects: [],
    totalFunded: 0,
    availableFunds: 100000,
    votingActive: false,
  },

  // Mobility Hub
  mobilityHub: {
    vehicles: [],
    stations: [],
    totalRides: 0,
    carbonSaved: 0,
    activeUsers: 0,
  },

  // Service Metrics (Singapore/UAE-style)
  serviceMetrics: {
    overallSatisfaction: 0,
    avgResponseTime: 0,
    slaCompliance: 0,
    activeUsers: 0,
    totalTransactions: 0,
    issuesResolved: 0,
  }
}

// ============================================
// BUDGET DATA
// Financial transparency framework
// ============================================
export const initialBudgetData = {
  total: 0,
  allocated: 0,
  spent: 0,
  reserved: 0,
  fiscalYear: '2025-2026',
  lastUpdated: null,
  categories: [
    { name: 'Student Wellness', allocated: 0, spent: 0, department: 'wellness' },
    { name: 'Basic Needs Services', allocated: 0, spent: 0, department: 'basic-needs' },
    { name: 'Academic Programs', allocated: 0, spent: 0, department: 'academic' },
    { name: 'Civic Engagement', allocated: 0, spent: 0, department: 'civic' },
    { name: 'Communications & Outreach', allocated: 0, spent: 0, department: 'communications' },
    { name: 'Environmental Initiatives', allocated: 0, spent: 0, department: 'environmental' },
    { name: 'Operations & Administration', allocated: 0, spent: 0, department: 'admin' },
    { name: 'Emergency Reserve', allocated: 0, spent: 0, department: 'reserve' },
  ],
  transactions: [],
}

// ============================================
// WELLNESS RESOURCES
// Comprehensive support directory
// ============================================
export const wellnessResources = [
  { id: 1, name: 'CAPS (Counseling & Psychological Services)', phone: '919-966-3658', url: 'https://caps.unc.edu', hours: 'M-F 8am-5pm', emergency: true, waitTime: '3-5 days', services: ['individual', 'group', 'crisis'] },
  { id: 2, name: 'Campus Health Services', phone: '919-966-2281', url: 'https://campushealth.unc.edu', hours: 'M-F 8am-5pm', emergency: false, waitTime: 'Same day', services: ['medical', 'pharmacy', 'lab'] },
  { id: 3, name: 'Student Wellness', phone: '919-962-9355', url: 'https://studentwellness.unc.edu', hours: 'M-F 8am-5pm', emergency: false, waitTime: '1-2 days', services: ['coaching', 'workshops', 'resources'] },
  { id: 4, name: 'Crisis Text Line', phone: 'Text HOME to 741741', url: 'https://www.crisistextline.org', hours: '24/7', emergency: true, waitTime: 'Immediate', services: ['crisis', 'text-based'] },
  { id: 5, name: '988 Suicide & Crisis Lifeline', phone: '988', url: 'https://988lifeline.org', hours: '24/7', emergency: true, waitTime: 'Immediate', services: ['crisis', 'phone', 'chat'] },
  { id: 6, name: 'LGBTQ Center', phone: '919-843-5376', url: 'https://lgbtq.unc.edu', hours: 'M-F 9am-5pm', emergency: false, waitTime: '1-2 days', services: ['support', 'resources', 'community'] },
]

// ============================================
// SERVICE LEVEL AGREEMENTS
// Dubai/Singapore-style service guarantees
// ============================================
export const serviceLevelAgreements = {
  critical: { responseTime: 1, resolutionTime: 4, availability: 99.9 }, // hours, %
  premium: { responseTime: 4, resolutionTime: 24, availability: 99.5 },
  standard: { responseTime: 24, resolutionTime: 72, availability: 99.0 },
  basic: { responseTime: 48, resolutionTime: 168, availability: 98.0 },
}

// ============================================
// HELPER FUNCTIONS
// ============================================
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

export function getDepartmentProgress(policies, departmentId) {
  const deptPolicies = policies?.filter(p => p.department === departmentId) || []
  return getOverallProgress(deptPolicies)
}

export function getKPIStatus(current, target) {
  const ratio = current / target
  if (ratio >= 1) return 'achieved'
  if (ratio >= 0.8) return 'on-track'
  if (ratio >= 0.5) return 'at-risk'
  return 'behind'
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(num) {
  return `${Math.round(num)}%`
}
