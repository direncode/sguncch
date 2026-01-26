/**
 * Project Bold Platform - Shared Constants
 *
 * All constants map directly to the Project Bold Policy Book values,
 * priorities, and organizational structure.
 */

// =============================================================================
// PROJECT BOLD VALUES (From Policy Book)
// =============================================================================

export const PROJECT_BOLD_VALUES = {
  COURAGE: {
    name: 'Courage',
    description: 'We lead fearlessly, even if the path forward is uncertain.',
    icon: 'shield',
  },
  COMMUNITY: {
    name: 'Community',
    description: 'We believe progress happens together.',
    icon: 'users',
  },
  ACCOUNTABILITY: {
    name: 'Accountability',
    description: 'We follow through on our promises and lead with honesty and transparency.',
    icon: 'check-circle',
  },
  EQUITY: {
    name: 'Equity',
    description: 'We ensure every Tar Heel has the opportunity to thrive, regardless of their background or identity.',
    icon: 'scale',
  },
  INNOVATION: {
    name: 'Innovation',
    description: 'We think creatively about the challenges we face and act boldly to solve them.',
    icon: 'lightbulb',
  },
} as const;

// =============================================================================
// PROJECT BOLD PRIORITIES (From Policy Book)
// =============================================================================

export const PROJECT_BOLD_PRIORITIES = {
  ACADEMIC_SUCCESS: {
    name: 'Empowering Academic Success',
    description: 'Reimagining advising, mentorship, and learning environments so every Tar Heel can thrive.',
    order: 1,
  },
  BASIC_NEEDS: {
    name: 'Supporting Basic Needs and Well-Being',
    description: 'Ensuring every student has access to food, housing, health, and safety resources.',
    order: 2,
  },
  CIVIC_ENGAGEMENT: {
    name: 'Building Civic and Community Engagement',
    description: 'Strengthening the bond between Carolina and the community through service, civic participation, and outreach.',
    order: 3,
  },
  DEI: {
    name: 'Championing Diversity, Equity, and Inclusion',
    description: 'Celebrating identity, fostering belonging, and ensuring equity across every corner of our University.',
    order: 4,
  },
  COMMUNICATION: {
    name: 'Strengthening Communication and Transparency',
    description: "Telling Carolina's story authentically and ensuring student voices shape university decision-making.",
    order: 5,
  },
} as const;

// =============================================================================
// DEPARTMENTS (From Policy Book)
// =============================================================================

export const DEPARTMENTS = {
  ACADEMIC_AFFAIRS: {
    id: 'academic-affairs',
    name: 'Department of Academic Affairs',
    slug: 'academic-affairs',
    description: 'Focused on peer mentorship, advising, and academic support.',
    policyCount: 5,
    color: '#4B9CD3', // Carolina Blue
  },
  BASIC_NEEDS: {
    id: 'basic-needs',
    name: 'Department of Basic Needs',
    slug: 'basic-needs',
    description: 'Ensuring food security, housing support, and essential resources.',
    policyCount: 5,
    color: '#13294B', // Navy
  },
  CIVIC_ENGAGEMENT: {
    id: 'civic-engagement',
    name: 'Department of Civic Engagement and Outreach',
    slug: 'civic-engagement',
    description: 'Building community connections through service and civic participation.',
    policyCount: 5,
    color: '#007749', // Green
  },
  DEI: {
    id: 'dei',
    name: 'Department of Diversity, Equity, and Inclusion',
    slug: 'dei',
    description: 'Celebrating identity, fostering belonging, and ensuring equity.',
    policyCount: 4,
    color: '#E8B00F', // Gold
  },
  WELLNESS_SAFETY: {
    id: 'wellness-safety',
    name: 'Department of Student Wellness and Safety',
    slug: 'wellness-safety',
    description: 'Expanding access to mental health, medical, and safety resources.',
    policyCount: 6,
    color: '#CC0000', // Red
  },
  ENVIRONMENTAL: {
    id: 'environmental',
    name: 'Department of Environmental Affairs',
    slug: 'environmental',
    description: 'Promoting sustainability, waste reduction, and environmental stewardship.',
    policyCount: 5,
    color: '#2E8540', // Forest Green
  },
  STATE_EXTERNAL: {
    id: 'state-external',
    name: 'Department of State and External Affairs',
    slug: 'state-external',
    description: 'Connecting students with legislators, alumni, and public service opportunities.',
    policyCount: 4,
    color: '#5B2C6F', // Purple
  },
  COMMUNICATIONS: {
    id: 'communications',
    name: 'Office of Communications',
    slug: 'communications',
    description: "Telling Carolina's story and ensuring transparency and accountability.",
    policyCount: 6,
    color: '#FF6B35', // Orange
  },
} as const;

// =============================================================================
// TASKFORCES (From Policy Book)
// =============================================================================

export const TASKFORCES = {
  AI_ACADEMIC: {
    id: 'ai-academic',
    name: 'Taskforce on AI & Academic Affairs',
    description: 'Developing recommendations to strengthen academic advising, mentorship, and student support. Focus on AI, accessibility, academic well-being, and innovation in teaching, learning, and advising.',
  },
  COMMUNITY_BELONGING: {
    id: 'community-belonging',
    name: 'Taskforce on Community & Belonging',
    description: 'Exploring ways to restore connection, unity, and school spirit across campus, addressing isolation and disconnection.',
  },
  CIVIC_OUTREACH: {
    id: 'civic-outreach',
    name: 'Taskforce on Civic Engagement & Outreach',
    description: "Renewing Carolina's spirit of service and leadership, empowering students to engage in communities and strengthen democracy.",
  },
} as const;

// =============================================================================
// ALL POLICIES BY DEPARTMENT (From Policy Book)
// =============================================================================

export const POLICIES = {
  // Academic Affairs (5 policies)
  PEER_MENTORSHIP: {
    id: 'aa-1',
    departmentId: 'academic-affairs',
    number: 1,
    title: 'Establish a University-Wide Peer Mentorship and Support Network',
    shortTitle: 'Peer Mentorship Network',
    description: 'Connects students to guidance and academic support across disciplines through a peer mentorship, advising, and tutoring network.',
  },
  MIDTERM_CHECKINS: {
    id: 'aa-2',
    departmentId: 'academic-affairs',
    number: 2,
    title: 'Introduce Standardized Midterm Progress Check-Ins',
    shortTitle: 'Midterm Check-Ins',
    description: 'Helps students understand their academic standing before final grades through timely feedback and guidance.',
  },
  STEM_CENTERS: {
    id: 'aa-3',
    departmentId: 'academic-affairs',
    number: 3,
    title: 'STEM Collaboration and Study Centers',
    shortTitle: 'STEM Centers',
    description: 'Establishes 24-hour access STEM centers modeled after the Economics Aid Center for peer support and academic collaboration.',
  },
  DEANS_LIST: {
    id: 'aa-4',
    departmentId: 'academic-affairs',
    number: 4,
    title: "Enhance and Expedite the Dean's List Process",
    shortTitle: "Dean's List Enhancement",
    description: 'Formalizes Dean\'s List with earlier notifications and enhanced recognition through official emails.',
  },
  GALLUP_STRENGTHS: {
    id: 'aa-5',
    departmentId: 'academic-affairs',
    number: 5,
    title: 'First-Year Strengths Integration',
    shortTitle: 'Gallup Strengths',
    description: 'Incorporates Gallup Strengths assessment into first-year programs to identify strengths and pathways early.',
  },

  // Basic Needs (5 policies)
  FARMERS_MARKETS: {
    id: 'bn-1',
    departmentId: 'basic-needs',
    number: 1,
    title: 'Expand On-Campus Farmers Markets and Chase Farm Stands',
    shortTitle: 'Farmers Markets',
    description: 'Partners with local markets to bring affordable produce directly to campus, including expansion to the Pit.',
  },
  FOOD_SECURITY_HUB: {
    id: 'bn-2',
    departmentId: 'basic-needs',
    number: 2,
    title: 'Centralize Food Security Access',
    shortTitle: 'Food Security Hub',
    description: 'Creates a single resource hub mapping campus and community fridges, pantries, and food security programs.',
  },
  PLUS_SWIPE: {
    id: 'bn-3',
    departmentId: 'basic-needs',
    number: 3,
    title: 'Expand Plus Swipe Options',
    shortTitle: 'Plus Swipe Expansion',
    description: 'Advocates for expanding Plus Swipe to include healthier off-campus dining locations.',
  },
  GROCERY_SHUTTLE: {
    id: 'bn-4',
    departmentId: 'basic-needs',
    number: 4,
    title: 'Create a Student Grocery Transportation Access',
    shortTitle: 'Grocery Shuttle',
    description: 'Partners with P2P and Transportation to create dedicated grocery shuttle trips to nearby stores.',
  },
  OFFCAMPUS_EDUCATION: {
    id: 'bn-5',
    departmentId: 'basic-needs',
    number: 5,
    title: 'Launch Off-Campus Living Education',
    shortTitle: 'Off-Campus Education',
    description: 'Monthly programming on leases, budgeting, and housing; adds Housing certification for Peer Financial Coaches.',
  },

  // Civic Engagement (5 policies)
  CIVIC_AWARD: {
    id: 'ce-1',
    departmentId: 'civic-engagement',
    number: 1,
    title: 'Establish the Carolina Civic Award',
    shortTitle: 'Civic Award',
    description: 'Annual award recognizing outstanding civic and community engagement among students, faculty, or organizations.',
  },
  TOWN_COUNCIL: {
    id: 'ce-2',
    departmentId: 'civic-engagement',
    number: 2,
    title: 'Town-University Partnership Council',
    shortTitle: 'Town Partnership',
    description: 'Creates a council to strengthen UNC-Chapel Hill collaboration and create student public service opportunities.',
  },
  DAY_OF_SERVICE: {
    id: 'ce-3',
    departmentId: 'civic-engagement',
    number: 3,
    title: 'Carolina Day of Service',
    shortTitle: 'Day of Service',
    description: 'Campus-wide day where students volunteer with local schools, parks, and nonprofits.',
  },
  CENTRALIZED_SERVICE: {
    id: 'ce-4',
    departmentId: 'civic-engagement',
    number: 4,
    title: 'Centralized Service Engagement Initiative',
    shortTitle: 'Service Portal',
    description: '"Find Their Place to Serve" portal within Learn to Lead; requires SG reps to complete 4 service hours annually.',
  },
  CIVICS_NEWSLETTER: {
    id: 'ce-5',
    departmentId: 'civic-engagement',
    number: 5,
    title: 'Informed, Nonpartisan Current Events Newsletter',
    shortTitle: 'Civics Newsletter',
    description: 'Newsletter helping students stay informed without misinformation, modeled after peer institutions.',
  },

  // DEI (4 policies)
  SYLLABI_SECTION: {
    id: 'dei-1',
    departmentId: 'dei',
    number: 1,
    title: 'Create a Student Success & Engagement Syllabi Section',
    shortTitle: 'Syllabi Resources',
    description: 'Works with Faculty Council to add recommended section highlighting wellness, mentorship, and leadership resources.',
  },
  CULTURAL_COUNCIL: {
    id: 'dei-2',
    departmentId: 'dei',
    number: 2,
    title: 'Organize a Cultural Organizations Council',
    shortTitle: 'Cultural Council',
    description: 'Establishes council for identity-based organizations to coordinate, advocate, and share resources.',
  },
  CULTURAL_CALENDAR: {
    id: 'dei-3',
    departmentId: 'dei',
    number: 3,
    title: 'Establish a University-Wide Cultural Calendar',
    shortTitle: 'Cultural Calendar',
    description: 'Centralizes cultural events, heritage months, and celebrations for visibility and reduced scheduling conflicts.',
  },
  CULTURAL_FUND: {
    id: 'dei-4',
    departmentId: 'dei',
    number: 4,
    title: 'Create a Collaborative Cultural Programming Fund',
    shortTitle: 'Cultural Fund',
    description: 'Student Engagement Fund supporting monthly collaborations between cultural organizations.',
  },

  // Wellness & Safety (6 policies)
  CAPS_EXPANSION: {
    id: 'ws-1',
    departmentId: 'wellness-safety',
    number: 1,
    title: 'Expand CAPS Access Through Drop-In Hours and More Locations',
    shortTitle: 'CAPS Expansion',
    description: 'Increases drop-in hours, adds locations, integrates with ConnectCarolina, and expands virtual options.',
  },
  OFFCAMPUS_SAFETY: {
    id: 'ws-2',
    departmentId: 'wellness-safety',
    number: 2,
    title: 'Launch an Off-Campus Safety Task Force and Ride Programs',
    shortTitle: 'Safety Task Force',
    description: 'Creates task force for off-campus safety, evaluates SafeWalk, and explores peer-driven late-night rides.',
  },
  PLAN_B_NARCAN: {
    id: 'ws-3',
    departmentId: 'wellness-safety',
    number: 3,
    title: 'Increase Access to Plan B and Narcan Distribution',
    shortTitle: 'Plan B & Narcan',
    description: 'Ensures wide availability with strategic placement, clear signage, and educational campaigns.',
  },
  EVENT_SAFETY: {
    id: 'ws-4',
    departmentId: 'wellness-safety',
    number: 4,
    title: 'Implement Off-Campus Event Safety Planning for Registered Parties',
    shortTitle: 'Event Safety Plans',
    description: 'Requires registered organizations to submit safety plans for off-campus events.',
  },
  CANVAS_WELLNESS: {
    id: 'ws-5',
    departmentId: 'wellness-safety',
    number: 5,
    title: 'Add a "Student Wellness" Button in Canvas',
    shortTitle: 'Canvas Wellness Button',
    description: 'Integrates wellness button in Canvas linking to mental health, medical, and safety resources.',
  },
  CONNECTCAROLINA_HEALTH: {
    id: 'ws-6',
    departmentId: 'wellness-safety',
    number: 6,
    title: 'Integrate Campus Health Services into ConnectCarolina',
    shortTitle: 'Health Integration',
    description: 'Full integration allowing centralized medical and mental health appointment scheduling.',
  },

  // Environmental (5 policies)
  SUSTAIN_WEEK: {
    id: 'env-1',
    departmentId: 'environmental',
    number: 1,
    title: 'Launch Sustain Carolina Week',
    shortTitle: 'Sustain Week',
    description: 'Campus-wide sustainability celebration with zero-waste challenges, panels, and service projects.',
  },
  TOO_GOOD_TO_GO: {
    id: 'env-2',
    departmentId: 'environmental',
    number: 2,
    title: 'Pilot a "Too Good To Go" Dining Model',
    shortTitle: 'Surplus Meals',
    description: 'Redistributes surplus dining meals through low-cost or free student access platform.',
  },
  ADOPT_A_SPACE: {
    id: 'env-3',
    departmentId: 'environmental',
    number: 3,
    title: 'Adopt-a-Space & Campus Trash Pickup Day',
    shortTitle: 'Adopt-a-Space',
    description: 'Empowers organizations to adopt and maintain campus spaces through regular cleanups.',
  },
  COMPOSTING: {
    id: 'env-4',
    departmentId: 'environmental',
    number: 4,
    title: 'Expand Composting and Plate-Clearing Stations',
    shortTitle: 'Composting Expansion',
    description: 'Expands composting infrastructure with educational signage and student ambassador programs.',
  },
  MOVEOUT_SHOP: {
    id: 'env-5',
    departmentId: 'environmental',
    number: 5,
    title: 'Establish a Move-Out Donation Shop',
    shortTitle: 'Donation Shop',
    description: 'Collects, sorts, and resells move-out items to reduce waste and support affordability.',
  },

  // State & External (4 policies)
  HEELS_ON_HILL: {
    id: 'se-1',
    departmentId: 'state-external',
    number: 1,
    title: 'Organize "Heels on the Hill"',
    shortTitle: 'Heels on the Hill',
    description: 'Coordinated State Lobby Day with pre-trip training on legislative issues and professional etiquette.',
  },
  LEGISLATORS_DAY: {
    id: 'se-2',
    departmentId: 'state-external',
    number: 2,
    title: 'Create an Annual Legislators-in-Residence Day',
    shortTitle: 'Legislators Day',
    description: 'Brings legislators and public servants to campus for panels, roundtables, and conversations.',
  },
  ALUMNI_NETWORK: {
    id: 'se-3',
    departmentId: 'state-external',
    number: 3,
    title: 'Build an Alumni in Public Service Network',
    shortTitle: 'Alumni Network',
    description: 'Connects students with alumni in government, policy, nonprofits; includes directory and mentorship.',
  },
  ROUNDTABLES: {
    id: 'se-4',
    departmentId: 'state-external',
    number: 4,
    title: 'Facilitate Nonpartisan Roundtable Discussions',
    shortTitle: 'Roundtables',
    description: 'Two roundtables per semester partnering with different organizations for cross-campus dialogue.',
  },

  // Communications (6 initiatives)
  WHO_IS_CAROLINA: {
    id: 'comm-1',
    departmentId: 'communications',
    number: 1,
    title: 'Launch "Who is Carolina" Storytelling Campaign',
    shortTitle: 'Who is Carolina',
    description: 'Short-form interview videos highlighting diverse student experiences through open submissions.',
  },
  ADVISORY_COMMITTEE: {
    id: 'comm-2',
    departmentId: 'communications',
    number: 2,
    title: 'Create a Student Advisory Committee to the Vice Chancellor for Communications',
    shortTitle: 'Communications Advisory',
    description: 'Formal student input channel on UNC messaging and branding to reflect student priorities.',
  },
  PODCAST: {
    id: 'comm-3',
    departmentId: 'communications',
    number: 3,
    title: 'Produce a Student Government Podcast',
    shortTitle: 'SG Podcast',
    description: 'Spotlights student leaders, athletes, administrators with focus on getting involved.',
  },
  ARTS_SPOTLIGHT: {
    id: 'comm-4',
    departmentId: 'communications',
    number: 4,
    title: 'Showcase Student Talent through Social Media',
    shortTitle: 'Arts Spotlight',
    description: 'Celebrates student creativity in arts, dance, theater, comedy through social media features.',
  },
  SUCCESS_SPOTLIGHT: {
    id: 'comm-5',
    departmentId: 'communications',
    number: 5,
    title: 'Celebrate Student Success and Everyday Life through Social Media',
    shortTitle: 'Success Spotlight',
    description: 'Expands video content spotlighting achievements and everyday Carolina life.',
  },
  ACCOUNTABILITY_DASHBOARD: {
    id: 'comm-6',
    departmentId: 'communications',
    number: 6,
    title: 'Lead an Assessment & Accountability Campaign',
    shortTitle: 'Accountability Dashboard',
    description: 'Establishes measurable outcomes with clear benchmarks, timelines, and public progress updates.',
  },
} as const;

// =============================================================================
// USER ROLES & PERMISSIONS
// =============================================================================

export const USER_ROLES = {
  STUDENT: 'student',
  ORG_LEADER: 'org_leader',
  SENATOR: 'senator',
  CABINET_MEMBER: 'cabinet_member',
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STAFF: 'staff',
} as const;

export const ROLE_PERMISSIONS = {
  student: ['view:dashboard', 'view:resources', 'submit:feedback', 'register:events'],
  org_leader: ['view:dashboard', 'view:resources', 'submit:feedback', 'register:events', 'manage:org', 'submit:safety_plan'],
  senator: ['view:dashboard', 'view:resources', 'submit:feedback', 'register:events', 'view:analytics', 'log:service_hours'],
  cabinet_member: ['view:dashboard', 'view:resources', 'submit:feedback', 'register:events', 'view:analytics', 'manage:department', 'update:policy_progress'],
  admin: ['*'],
  faculty: ['view:dashboard', 'view:resources'],
  staff: ['view:dashboard', 'view:resources', 'view:analytics'],
} as const;

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_SAML_LOGIN: '/auth/saml/login',
  AUTH_SAML_CALLBACK: '/auth/saml/callback',
  AUTH_SAML_METADATA: '/auth/saml/metadata',

  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  USER_PREFERENCES: '/users/preferences',

  // Departments & Policies
  DEPARTMENTS: '/departments',
  POLICIES: '/policies',
  POLICY_PROGRESS: '/policies/:id/progress',

  // Academic Affairs
  MENTORSHIP: '/academic/mentorship',
  MENTORSHIP_MATCH: '/academic/mentorship/match',
  STEM_CENTERS: '/academic/stem-centers',
  MIDTERM_CHECKINS: '/academic/midterm-checkins',

  // Basic Needs
  FOOD_RESOURCES: '/basic-needs/food-resources',
  GROCERY_SHUTTLE: '/basic-needs/grocery-shuttle',

  // Civic Engagement
  SERVICE_HOURS: '/civic/service-hours',
  CIVIC_AWARDS: '/civic/awards',
  VOLUNTEER_OPPORTUNITIES: '/civic/opportunities',

  // DEI
  CULTURAL_CALENDAR: '/dei/cultural-calendar',
  CULTURAL_ORGS: '/dei/organizations',
  FUNDING_APPLICATIONS: '/dei/funding',

  // Wellness & Safety
  WELLNESS_RESOURCES: '/wellness/resources',
  SAFE_RIDE: '/wellness/safe-ride',
  DISTRIBUTION_LOCATIONS: '/wellness/distribution',
  SAFETY_PLANS: '/wellness/safety-plans',

  // Environmental
  SUSTAINABILITY_EVENTS: '/environmental/events',
  SURPLUS_MEALS: '/environmental/surplus-meals',
  ADOPTED_SPACES: '/environmental/adopted-spaces',
  DONATION_ITEMS: '/environmental/donations',

  // State & External
  LOBBY_DAYS: '/state/lobby-days',
  LEGISLATOR_VISITS: '/state/legislator-visits',
  ALUMNI_MENTORS: '/state/alumni-mentors',

  // Communications
  STORIES: '/communications/stories',
  PODCAST_EPISODES: '/communications/podcast',
  ANNOUNCEMENTS: '/communications/announcements',
  METRICS: '/communications/metrics',

  // Events
  EVENTS: '/events',
  EVENT_RSVP: '/events/:id/rsvp',

  // Feedback
  FEEDBACK: '/feedback',

  // Canvas LTI
  LTI_LAUNCH: '/lti/launch',
  LTI_JWKS: '/lti/jwks',
} as const;

// =============================================================================
// UNC-SPECIFIC CONSTANTS
// =============================================================================

export const UNC_CONFIG = {
  SHIBBOLETH_IDP: 'https://sso.unc.edu/idp/profile/SAML2/Redirect/SSO',
  CANVAS_URL: 'https://canvas.unc.edu',
  CONNECT_CAROLINA_URL: 'https://connectcarolina.unc.edu',
  COLORS: {
    CAROLINA_BLUE: '#4B9CD3',
    NAVY: '#13294B',
    WHITE: '#FFFFFF',
  },
  ACADEMIC_TERMS: ['Fall', 'Spring', 'Summer I', 'Summer II'],
} as const;

// =============================================================================
// SLOGAN & BRANDING
// =============================================================================

export const BRANDING = {
  TAGLINE: 'First, Best, For All',
  SLOGAN: 'Together, We Go Bold',
  CAMPAIGN: 'Project Bold',
  CANDIDATE: 'Devin Duncan',
  POSITION: 'Student Body President',
  TERM: '2026-2027',
} as const;
