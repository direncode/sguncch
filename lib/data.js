// Project Bold - Complete Policy Data and Digital Infrastructure Schema
// All progress starts at 0 - Admin can update via dashboard

// SECURITY: Admin key must be set via environment variable in production
// Default fallback is for development only - NEVER use in production!
const DEFAULT_DEV_KEY = 'dev-only-change-in-production'
// SECURITY: Only use server-side env var. NEVER use NEXT_PUBLIC_ prefix for secrets.
export const ADMIN_KEY = process.env.ADMIN_KEY || DEFAULT_DEV_KEY

// Warn if using default key in non-development environment
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && ADMIN_KEY === DEFAULT_DEV_KEY) {
  console.error('SECURITY WARNING: Using default admin key in production! Set ADMIN_KEY environment variable.')
}

export const departments = [
  { id: 'wellness', name: 'Student Wellness', icon: '', color: 'green', description: 'Mental health, safety, and holistic student wellbeing' },
  { id: 'basic-needs', name: 'Basic Needs', icon: '', color: 'orange', description: 'Food security, housing, textbooks, and financial support' },
  { id: 'academic', name: 'Academic Affairs', icon: '', color: 'blue', description: 'Registration, advising, research, and academic success' },
  { id: 'communications', name: 'Communications', icon: '', color: 'yellow', description: 'Outreach, transparency, and student voice' },
  { id: 'environmental', name: 'Environmental', icon: '', color: 'emerald', description: 'Sustainability, climate action, and green initiatives' },
]

// Initial policy data - all progress at 0
export const initialPolicies = [
  // STUDENT WELLNESS (6 policies)
  { id: 'caps-expansion', department: 'wellness', title: 'Expand CAPS Access Through Drop-In Hours and More Locations', description: 'Increase accessibility to CAPS by offering more drop-in hours and creating additional locations across campus. Integration with ConnectCarolina would streamline scheduling, while expanded virtual counseling options would allow students to access care regardless of location or schedule.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['drop-in-scheduler', 'location-finder', 'virtual-counseling', 'connectcarolina-integration'], metrics: { dropInHours: 0, locations: 0, virtualSessions: 0 } },
  { id: 'safety-taskforce', department: 'wellness', title: 'Launch Off-Campus Safety Task Force and Ride Programs', description: 'Create a task force dedicated to improving off-campus student safety, including evaluating and expanding SafeWalk. Explore peer-driven late-night ride programs modeled after Texas State\'s Bobcat Safe Rides, providing safe, affordable transportation home.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['ride-request', 'real-time-tracking', 'safety-reporting', 'volunteer-portal'], metrics: { rides: 0, volunteers: 0, safetyReports: 0 } },
  { id: 'planb-narcan', department: 'wellness', title: 'Increase Access to Plan B and Narcan Distribution', description: 'Ensure Plan B and Narcan are widely available on campus through strategic placement in high-traffic areas with clear signage and awareness campaigns. Prioritize educational efforts about proper use and overdose prevention.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['location-map', 'availability-tracker', 'education-portal', 'restock-alerts'], metrics: { locations: 0, distributed: 0, trainings: 0 } },
  { id: 'event-safety', department: 'wellness', title: 'Implement Off-Campus Event Safety Planning', description: 'Require registered student organizations to submit safety plans for off-campus events, outlining strategies for transportation, crowd management, and emergency response. Include workshops and guidance resources for creating effective safety plans.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['plan-submission', 'template-library', 'workshop-registration', 'approval-tracker'], metrics: { plansSubmitted: 0, workshops: 0, orgsCompliant: 0 } },
  { id: 'wellness-button', department: 'wellness', title: 'Add a "Student Wellness" Button in Canvas', description: 'Integrate a dedicated Student Wellness button in Canvas linking students directly to mental health, medical, and safety resources including CAPS, Plan B/Narcan locations, and ride services. This centralized access reduces barriers to support.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['canvas-integration', 'resource-directory', 'quick-access', 'crisis-hotline'], metrics: { clicks: 0, resourceViews: 0, satisfaction: 0 } },
  { id: 'health-integration', department: 'wellness', title: 'Integrate Campus Health Services into ConnectCarolina', description: 'Fully integrate Campus Health Services into ConnectCarolina, allowing students to schedule medical and mental health appointments in one centralized platform. This improves continuity of care and makes accessing services more convenient.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['unified-scheduling', 'health-records', 'appointment-reminders', 'care-coordination'], metrics: { appointments: 0, integrationComplete: 0, satisfaction: 0 } },

  // BASIC NEEDS (5 policies)
  { id: 'farmers-markets', department: 'basic-needs', title: 'Expand On-Campus Farmers Markets and Chase Farm Stands', description: 'Partner with Chapel Hill and Carrboro Farmers Markets to bring affordable, local produce directly to campus. Expand Chase Farm Stands into high-traffic spaces like the Pit to increase food access and support local farmers.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['market-schedule', 'vendor-directory', 'location-map', 'produce-availability'], metrics: { markets: 0, vendors: 0, students: 0 } },
  { id: 'food-security-hub', department: 'basic-needs', title: 'Centralize Food Security Access', description: 'Strengthen food security by expanding shared and donated meal swipe programs and creating a single, accessible resource hub that maps campus and community fridges, pantries, and food security programs for quick, consistent support.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['resource-map', 'meal-swipe-sharing', 'pantry-locator', 'crisis-support'], metrics: { resourcesListed: 0, swipesShared: 0, studentsHelped: 0 } },
  { id: 'plus-swipe-expansion', department: 'basic-needs', title: 'Expand Plus Swipe Options', description: 'Advocate for expanding Plus Swipe options to include healthier off-campus dining locations. Broadening eligible vendors would increase student choice and better align campus dining options with student wellness needs.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['vendor-list', 'nutrition-info', 'location-finder', 'feedback-system'], metrics: { vendors: 0, transactions: 0, satisfaction: 0 } },
  { id: 'grocery-shuttle', department: 'basic-needs', title: 'Create Student Grocery Transportation Access', description: 'Partner with P2P and Transportation & Parking to create a dedicated grocery shuttle helping students access affordable food off campus. Offer regular, scheduled trips to nearby grocery stores to reduce transportation barriers.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['shuttle-schedule', 'route-map', 'reservation-system', 'real-time-tracking'], metrics: { routes: 0, rides: 0, stores: 0 } },
  { id: 'offcampus-education', department: 'basic-needs', title: 'Launch Off-Campus Living Education', description: 'Partner with Off-Campus Student Life to offer monthly programming on leases, budgeting, and housing options. Add Housing as a subject area in CFWC training curriculum for Peer Financial Coaches to advise on housing-related budgeting.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['workshop-calendar', 'resource-library', 'coach-directory', 'budgeting-tools'], metrics: { workshops: 0, attendees: 0, coachesTrained: 0 } },

  // ACADEMIC AFFAIRS (5 policies)
  { id: 'peer-mentorship', department: 'academic', title: 'Establish University-Wide Peer Mentorship Network', description: 'Introduce a university-wide Peer Mentorship, Advising, and Tutoring Network connecting students to guidance and academic support across disciplines. Prioritize accessibility and responsiveness to ensure timely, personalized support.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['mentor-matching', 'appointment-booking', 'subject-directory', 'feedback-system'], metrics: { mentors: 0, sessions: 0, subjects: 0 } },
  { id: 'midterm-checkins', department: 'academic', title: 'Introduce Standardized Midterm Progress Check-Ins', description: 'Implement Midterm Progress Check-ins to help students better understand their academic standing before final grades are issued. Timely feedback allows students to address challenges early and make informed decisions.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['progress-portal', 'advisor-alerts', 'resource-recommendations', 'grade-projections'], metrics: { checkIns: 0, studentsReached: 0, interventions: 0 } },
  { id: 'stem-centers', department: 'academic', title: 'STEM Collaboration and Study Centers', description: 'Establish 24-hour access STEM Collaboration and Study Centers modeled after the Economics Aid Center. These centers would foster peer support and make academic support more accessible for mentorship, studying, and group projects.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['space-reservation', 'tutor-schedule', 'resource-library', 'group-finder'], metrics: { centers: 0, visits: 0, studyGroups: 0 } },
  { id: 'deans-list', department: 'academic', title: 'Enhance and Expedite the Dean\'s List Process', description: 'Formalize the Dean\'s List process with earlier notifications and enhanced recognition through official emails. Better celebrate student academic achievement and allow students to use the honor more effectively for opportunities.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['notification-system', 'digital-certificates', 'linkedin-integration', 'recognition-portal'], metrics: { recognized: 0, notificationTime: 0, satisfaction: 0 } },
  { id: 'strengths-integration', department: 'academic', title: 'First-Year Strengths Integration', description: 'Advocate for incorporating the Gallup Strengths assessment into first-year programs to help students identify their strengths and potential pathways early. Over 1,000 colleges including UT Knoxville, Purdue, and Virginia Tech use this model.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['assessment-portal', 'results-dashboard', 'pathway-recommendations', 'advisor-integration'], metrics: { assessments: 0, studentsMatched: 0, satisfaction: 0 } },

  // COMMUNICATIONS (6 initiatives)
  { id: 'who-is-carolina', department: 'communications', title: 'Launch "Who is Carolina" Storytelling Campaign', description: 'Highlight the diverse experiences and identities of the Tar Heel community through short-form, interview-style videos. Students filmed in everyday environments share their stories, humanizing the Carolina experience.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['submission-portal', 'video-gallery', 'social-integration', 'nomination-system'], metrics: { stories: 0, views: 0, nominations: 0 } },
  { id: 'vc-advisory', department: 'communications', title: 'Create Student Advisory Committee to Vice Chancellor', description: 'Establish a formal channel for student input on UNC\'s messaging and branding through a Student Advisory Committee to the Vice Chancellor for Communications. Ensure institutional messaging reflects student experiences and priorities.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['application-portal', 'meeting-scheduler', 'feedback-tracker', 'recommendation-log'], metrics: { members: 0, meetings: 0, recommendations: 0 } },
  { id: 'sg-podcast', department: 'communications', title: 'Produce a Student Government Podcast', description: 'Spotlight student leaders, athletes, administrators, and campus organizations by sharing their personal trajectories at UNC. Demystify how students can get involved and highlight opportunities students may not know exist.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['episode-archive', 'guest-nominations', 'subscription-manager', 'transcript-library'], metrics: { episodes: 0, listeners: 0, guests: 0 } },
  { id: 'talent-spotlight', department: 'communications', title: 'Showcase Student Talent through Social Media', description: 'Celebrate student creativity in Arts, Dance, Theater, and Comedy through social media reels featuring event previews, behind-the-scenes moments, and post-event highlights to help student artists reach broader audiences.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['submission-form', 'content-calendar', 'artist-directory', 'event-promotion'], metrics: { spotlights: 0, engagement: 0, artists: 0 } },
  { id: 'student-success', department: 'communications', title: 'Celebrate Student Success and Everyday Life', description: 'Expand video and social content to spotlight student achievements and everyday life at Carolina through short-form videos and reels. Present a more relatable picture of the Carolina experience.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['content-submission', 'story-highlights', 'achievement-tracker', 'community-feed'], metrics: { posts: 0, engagement: 0, submissions: 0 } },
  { id: 'accountability-campaign', department: 'communications', title: 'Lead an Assessment & Accountability Campaign', description: 'Establish measurable outcomes for every project with clear benchmarks, timelines, and success indicators students can track. Publish regular progress updates and adjust when results fall short. Accountability is not optional.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['progress-dashboard', 'benchmark-tracker', 'public-reports', 'feedback-system'], metrics: { projects: 0, benchmarksMet: 0, reportsPublished: 0 } },

  // ENVIRONMENTAL (5 policies)
  { id: 'sustain-carolina-week', department: 'environmental', title: 'Launch Sustain Carolina Week', description: 'Create a campus-wide celebration uniting student organizations, academic departments, and community partners. Feature zero-waste challenges, sustainable fashion pop-ups, faculty panels, and outdoor service projects like litter cleanups.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['event-calendar', 'challenge-tracker', 'partner-directory', 'impact-dashboard'], metrics: { events: 0, participants: 0, partners: 0 } },
  { id: 'too-good-to-go', department: 'environmental', title: 'Pilot "Too Good To Go" Dining Model', description: 'Partner with Carolina Dining Services to redistribute surplus dining hall meals through a low-cost or free student access platform. Reduce food waste while addressing food insecurity—a key intersection of sustainability and equity.', status: 'planned', priority: 'high', progress: 0, digitalFeatures: ['meal-availability', 'pickup-scheduler', 'waste-tracker', 'notification-system'], metrics: { mealsRedistributed: 0, wasteReduced: 0, studentsServed: 0 } },
  { id: 'adopt-a-space', department: 'environmental', title: 'Adopt-a-Space & Campus Trash Pickup Day', description: 'Empower student organizations, residence halls, and RAs to adopt designated campus spaces and maintain them through regular cleanup events. Monthly Campus Cleanup Days offer service hours and team-building opportunities.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['space-registry', 'cleanup-scheduler', 'hours-tracker', 'leaderboard'], metrics: { spacesAdopted: 0, cleanupEvents: 0, volunteers: 0 } },
  { id: 'composting-expansion', department: 'environmental', title: 'Expand Composting and Plate-Clearing Stations', description: 'Expand composting infrastructure across campus, particularly in dining halls. Collaborate with Carolina Dining and Facilities to install more compost bins and plate-clearing systems with educational signage and student ambassadors.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['location-map', 'waste-metrics', 'education-portal', 'ambassador-signup'], metrics: { stations: 0, wasteDiverted: 0, ambassadors: 0 } },
  { id: 'moveout-shop', department: 'environmental', title: 'Establish a Move-Out Donation Shop', description: 'Create a Carolina Thrift-style Move-Out Donation Shop operated semiannually to collect, sort, and resell or donate discarded items. Reduce landfill waste, promote reuse, and support affordability for students needing inexpensive supplies.', status: 'planned', priority: 'medium', progress: 0, digitalFeatures: ['donation-scheduler', 'inventory-browser', 'pickup-request', 'impact-tracker'], metrics: { itemsCollected: 0, itemsSold: 0, donated: 0 } },
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

// Budget data arrays removed — use real data from the store/database only

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
    { q: 'How do I access CAPS drop-in hours?', a: 'CAPS offers drop-in hours Monday-Wednesday 2-4pm at multiple locations. No appointment needed - just walk in during those times.' },
    { q: 'Where can I find Plan B or Narcan on campus?', a: 'Check the location map on this page for distribution points. These are available at Campus Health, residence halls, and other high-traffic locations.' },
    { q: 'How does the late-night ride program work?', a: 'Request a ride through our portal or app. Volunteer drivers provide safe transportation home from off-campus locations late at night.' },
    { q: 'What is the Student Wellness Button in Canvas?', a: 'It\'s a dedicated button in Canvas linking you directly to mental health, medical, and safety resources - CAPS, Plan B/Narcan locations, and ride services.' },
    { q: 'How do I submit a safety plan for an off-campus event?', a: 'Registered student organizations can submit safety plans through our portal. We also offer workshops on creating effective safety plans.' },
  ],
  'basic-needs': [
    { q: 'When are the on-campus farmers markets?', a: 'Check the market schedule on this page. Markets are typically held weekly in high-traffic areas like the Pit during the academic year.' },
    { q: 'How do I share or receive donated meal swipes?', a: 'Use the Food Security Hub to share excess swipes or request donated swipes. The system matches donors with students in need.' },
    { q: 'Where does the grocery shuttle go?', a: 'The shuttle runs to nearby grocery stores including Trader Joe\'s, Harris Teeter, and Walmart. Check the route map and schedule on this page.' },
    { q: 'What Plus Swipe locations are available off-campus?', a: 'We\'re expanding options to include healthier vendors. Check the current vendor list on this page for participating locations.' },
    { q: 'How can I learn about off-campus housing and budgeting?', a: 'Attend our monthly workshops with Off-Campus Student Life, or meet with a Peer Financial Coach trained in housing-related budgeting.' },
  ],
  academic: [
    { q: 'How do I find a peer mentor or tutor?', a: 'Use the Peer Mentorship Network portal to search by subject area and schedule appointments with trained peer mentors and tutors.' },
    { q: 'When do midterm check-ins happen?', a: 'Check-ins occur mid-semester before the withdrawal deadline. You\'ll receive an email with your progress report and advisor recommendations.' },
    { q: 'Where are the STEM Study Centers located?', a: 'Centers are located in key academic buildings with 24-hour access. Check the space reservation system for locations and availability.' },
    { q: 'When will I be notified about Dean\'s List?', a: 'We\'re working to expedite notifications. Currently, you\'ll receive an official email within 2-3 weeks of grades posting.' },
    { q: 'What is the Gallup Strengths assessment?', a: 'It\'s a tool to identify your top strengths and potential pathways. First-year students can access it through the assessment portal.' },
  ],
  communications: [
    { q: 'How can I be featured in "Who is Carolina"?', a: 'Submit your story through our nomination portal, or nominate a fellow student. We select diverse voices to highlight the Tar Heel experience.' },
    { q: 'How do I apply for the VC Communications Advisory Committee?', a: 'Applications open each fall semester. Look for announcements on our social media and the application portal.' },
    { q: 'Where can I listen to the SG Podcast?', a: 'Episodes are available on Spotify, Apple Podcasts, and our website. Subscribe to get notified of new episodes.' },
    { q: 'How do I get my performance or artwork featured?', a: 'Submit through our talent spotlight form. We feature arts, dance, theater, and comedy in our social media content.' },
    { q: 'Where can I track SG\'s progress on initiatives?', a: 'Visit our Accountability Dashboard to see benchmarks, timelines, and progress updates on all our projects.' },
  ],
  environmental: [
    { q: 'When is Sustain Carolina Week?', a: 'Sustain Carolina Week is held each spring semester. Check the event calendar for zero-waste challenges, pop-ups, and service projects.' },
    { q: 'How does the Too Good To Go program work?', a: 'Check meal availability at the end of dining hall service hours. Reserve a discounted meal through the app and pick it up at the designated time.' },
    { q: 'How can my organization adopt a campus space?', a: 'Register through the Adopt-a-Space portal. Your org commits to regular cleanup events and earns recognition on our leaderboard.' },
    { q: 'Where are the composting stations on campus?', a: 'Check the location map for all compost bins and plate-clearing stations. Look for educational signage showing what can be composted.' },
    { q: 'When is the Move-Out Donation Shop open?', a: 'The shop operates during move-out periods each semester. Donate items during finals week and shop for affordable supplies at semester start.' },
  ],
}

// Recent announcements for each department
export const departmentAnnouncements = {
  wellness: [
    { id: 1, date: '2026-01-25', title: 'New CAPS Drop-In Locations', content: 'CAPS drop-in hours now available at 3 campus locations. Walk in Monday-Wednesday 2-4pm.', type: 'update' },
    { id: 2, date: '2026-01-20', title: 'Late-Night Ride Program Pilot', content: 'Testing peer-driven safe ride program this semester. Sign up to volunteer or request rides.', type: 'event' },
    { id: 3, date: '2026-01-15', title: 'Plan B & Narcan Locations Expanded', content: 'New distribution points added in South Campus residence halls. Check the location map.', type: 'update' },
  ],
  'basic-needs': [
    { id: 1, date: '2026-01-24', title: 'Grocery Shuttle Launch', content: 'New shuttle to Trader Joe\'s and Harris Teeter starts Feb 1. Runs every Saturday 10am-4pm.', type: 'update' },
    { id: 2, date: '2026-01-18', title: 'Farmers Market on the Pit', content: 'First on-campus farmers market Feb 12! Fresh local produce and Chase Farm Stand items.', type: 'event' },
    { id: 3, date: '2026-01-10', title: 'Off-Campus Living Workshop', content: 'Learn about leases, budgeting, and housing options. Feb 8 at 5pm in the Union.', type: 'event' },
  ],
  academic: [
    { id: 1, date: '2026-01-22', title: 'Peer Mentorship Network Open', content: 'Connect with trained peer mentors across all subjects. Sign up on the portal now.', type: 'update' },
    { id: 2, date: '2026-01-17', title: 'STEM Study Center Hours Extended', content: 'Chemistry and Physics study centers now open 24/7 with tutor support until midnight.', type: 'update' },
    { id: 3, date: '2026-01-12', title: 'Gallup Strengths Available', content: 'First-year students can now take the Gallup Strengths assessment through the portal.', type: 'event' },
  ],
  communications: [
    { id: 1, date: '2026-01-25', title: 'Who is Carolina - Call for Stories', content: 'Share your Carolina story! Submit through the nomination portal to be featured.', type: 'event' },
    { id: 2, date: '2026-01-19', title: 'SG Podcast Episode 1 Live', content: 'Listen to our first episode featuring Student Body President on Spotify and Apple Podcasts.', type: 'update' },
    { id: 3, date: '2026-01-13', title: 'VC Advisory Committee Applications', content: 'Apply to advise the Vice Chancellor on student communications. Deadline Feb 15.', type: 'deadline' },
  ],
  environmental: [
    { id: 1, date: '2026-01-23', title: 'Sustain Carolina Week Coming', content: 'Mark your calendars for March 3-7! Zero-waste challenges, pop-ups, and service projects.', type: 'event' },
    { id: 2, date: '2026-01-16', title: 'Too Good To Go Pilot Starts', content: 'Get discounted end-of-service meals at Lenoir and Chase. Download the app to participate.', type: 'update' },
    { id: 3, date: '2026-01-09', title: 'Adopt-a-Space Registration Open', content: 'Student orgs can now register to adopt campus spaces for regular cleanup events.', type: 'event' },
  ],
}

// Step-by-step guides for common services
export const serviceGuides = {
  'caps-dropin': {
    title: 'How to Use CAPS Drop-In Hours',
    steps: [
      { step: 1, title: 'Find a Location', description: 'Check the location map for CAPS drop-in sites across campus' },
      { step: 2, title: 'Walk In During Hours', description: 'Visit Monday-Wednesday 2-4pm. No appointment needed.' },
      { step: 3, title: 'Check In', description: 'Sign in at the front desk and briefly describe what you need' },
      { step: 4, title: 'Meet with Counselor', description: 'You\'ll meet with an available counselor for a brief session' },
    ],
  },
  'safe-ride': {
    title: 'How to Request a Late-Night Safe Ride',
    steps: [
      { step: 1, title: 'Open the App', description: 'Access the ride request portal through our website or app' },
      { step: 2, title: 'Enter Pickup Location', description: 'Provide your off-campus pickup address and destination' },
      { step: 3, title: 'Wait for Match', description: 'You\'ll be matched with a volunteer driver and receive an ETA' },
      { step: 4, title: 'Confirm Arrival', description: 'Verify the driver and vehicle before getting in. Rate your ride after.' },
    ],
  },
  'grocery-shuttle': {
    title: 'How to Use the Grocery Shuttle',
    steps: [
      { step: 1, title: 'Check the Schedule', description: 'View shuttle times and routes on the Transportation page' },
      { step: 2, title: 'Reserve a Spot', description: 'Reservations recommended but not required. Walk-ons welcome if space allows.' },
      { step: 3, title: 'Board at the Stop', description: 'Arrive 5 minutes early at the designated campus pickup location' },
      { step: 4, title: 'Shop and Return', description: 'You\'ll have 1-2 hours to shop. Return shuttle departs on schedule.' },
    ],
  },
  'peer-mentor': {
    title: 'How to Connect with a Peer Mentor',
    steps: [
      { step: 1, title: 'Visit the Portal', description: 'Access the Peer Mentorship Network through the Academic Affairs page' },
      { step: 2, title: 'Search by Subject', description: 'Browse mentors by subject area, availability, and specialty' },
      { step: 3, title: 'Book a Session', description: 'Select a time slot that works for you and book directly' },
      { step: 4, title: 'Meet Your Mentor', description: 'Sessions can be in-person at STEM Centers or virtual' },
    ],
  },
  'adopt-space': {
    title: 'How to Adopt a Campus Space',
    steps: [
      { step: 1, title: 'Register Your Org', description: 'Student organizations can register through the Environmental portal' },
      { step: 2, title: 'Choose a Space', description: 'Select from available quads, walkways, or courtyards to adopt' },
      { step: 3, title: 'Commit to Cleanups', description: 'Agree to organize regular cleanup events (at least monthly)' },
      { step: 4, title: 'Track and Earn', description: 'Log your events to earn service hours and leaderboard recognition' },
    ],
  },
  'too-good-to-go': {
    title: 'How to Get Discounted Meals',
    steps: [
      { step: 1, title: 'Download the App', description: 'Get the Too Good To Go app or access through dining services' },
      { step: 2, title: 'Check Availability', description: 'See what meals are available near end of dining hall service hours' },
      { step: 3, title: 'Reserve Your Meal', description: 'Reserve and pay for a discounted meal through the app' },
      { step: 4, title: 'Pick Up', description: 'Collect your meal at the designated time and location' },
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
