/**
 * Project Bold Platform - Shared Types
 * Inlined from @project-bold/shared for build compatibility
 */

// =============================================================================
// USER & AUTH TYPES
// =============================================================================

export interface JWTPayload {
  sub: string;
  pid: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}

export type UserRole = 'student' | 'org_leader' | 'senator' | 'cabinet' | 'admin';

export interface SAMLAttributes {
  pid: string;
  onyen: string;
  email: string;
  firstName: string;
  lastName: string;
  affiliation: string;
  eduPersonEntitlement: string[];
}

export interface User {
  id: string;
  pid: string;
  onyen: string;
  email: string;
  firstName: string;
  lastName: string;
  affiliation: string;
  roles: UserRole[];
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  roles: UserRole[];
  samlAttributes?: SAMLAttributes;
}

// =============================================================================
// DEPARTMENT & POLICY TYPES
// =============================================================================

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface Policy {
  id: string;
  departmentId: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
}

export type PolicyStatus = 'proposed' | 'in_progress' | 'completed' | 'on_hold';

// =============================================================================
// CONSTANTS - DEPARTMENTS
// =============================================================================

export const DEPARTMENTS: Record<string, Department> = {
  'academic-affairs': {
    id: 'academic-affairs',
    name: 'Department of Academic Affairs',
    slug: 'academic-affairs',
    description: 'Empowering academic success through mentorship, advising, and learning environments',
    color: '#4B9CD3',
  },
  'basic-needs': {
    id: 'basic-needs',
    name: 'Department of Basic Needs',
    slug: 'basic-needs',
    description: 'Ensuring every student has access to food, housing, health, and safety resources',
    color: '#007749',
  },
  'civic-engagement': {
    id: 'civic-engagement',
    name: 'Department of Civic Engagement and Outreach',
    slug: 'civic-engagement',
    description: 'Strengthening bonds between Carolina and the community through service and civic participation',
    color: '#5B2C6F',
  },
  'dei': {
    id: 'dei',
    name: 'Department of Diversity, Equity, and Inclusion',
    slug: 'dei',
    description: 'Celebrating identity, fostering belonging, and ensuring equity across the University',
    color: '#FF6B35',
  },
  'wellness-safety': {
    id: 'wellness-safety',
    name: 'Department of Student Wellness and Safety',
    slug: 'wellness-safety',
    description: 'Supporting student mental health, physical wellness, and campus safety',
    color: '#CC0000',
  },
  'environmental': {
    id: 'environmental',
    name: 'Department of Environmental Affairs',
    slug: 'environmental',
    description: 'Promoting sustainability, waste reduction, and environmental stewardship',
    color: '#2E8540',
  },
  'state-external': {
    id: 'state-external',
    name: 'Department of State and External Affairs',
    slug: 'state-external',
    description: 'Connecting students with government, alumni, and public service opportunities',
    color: '#13294B',
  },
  'communications': {
    id: 'communications',
    name: 'Office of Communications',
    slug: 'communications',
    description: 'Telling Carolina\'s story authentically and ensuring transparency in student government',
    color: '#E8B00F',
  },
};

// =============================================================================
// CONSTANTS - POLICIES (All 40 policies from the Policy Book)
// =============================================================================

export const POLICIES: Record<string, Policy> = {
  // Academic Affairs (5 policies)
  'aa-1': {
    id: 'aa-1',
    departmentId: 'academic-affairs',
    number: 1,
    title: 'Establish a University-Wide Peer Mentorship and Support Network',
    shortTitle: 'Peer Mentorship Network',
    description: 'Introduces a university-wide Peer Mentorship, Advising, and Tutoring Network that connects students to guidance and academic support across disciplines.',
  },
  'aa-2': {
    id: 'aa-2',
    departmentId: 'academic-affairs',
    number: 2,
    title: 'Introduce Standardized Midterm Progress Check-Ins',
    shortTitle: 'Midterm Check-Ins',
    description: 'Implements Midterm Progress Check-ins to help students understand their academic standing before final grades.',
  },
  'aa-3': {
    id: 'aa-3',
    departmentId: 'academic-affairs',
    number: 3,
    title: 'STEM Collaboration and Study Centers',
    shortTitle: 'STEM Centers',
    description: 'Establishes 24-hour access STEM Collaboration and Study Centers for peer support and academic collaboration.',
  },
  'aa-4': {
    id: 'aa-4',
    departmentId: 'academic-affairs',
    number: 4,
    title: 'Enhance and Expedite the Dean\'s List Process',
    shortTitle: 'Dean\'s List Enhancement',
    description: 'Formalizes the Dean\'s List process with earlier notifications and enhanced recognition.',
  },
  'aa-5': {
    id: 'aa-5',
    departmentId: 'academic-affairs',
    number: 5,
    title: 'First-Year Strengths Integration',
    shortTitle: 'Gallup Strengths',
    description: 'Incorporates the Gallup Strengths assessment into first-year programs.',
  },

  // Basic Needs (5 policies)
  'bn-1': {
    id: 'bn-1',
    departmentId: 'basic-needs',
    number: 1,
    title: 'Expand On-Campus Farmers Markets and Chase Farm Stands',
    shortTitle: 'Farmers Markets',
    description: 'Partners with Chapel Hill and Carrboro Farmers Markets to bring affordable, local produce to campus.',
  },
  'bn-2': {
    id: 'bn-2',
    departmentId: 'basic-needs',
    number: 2,
    title: 'Centralize Food Security Access',
    shortTitle: 'Food Security Hub',
    description: 'Creates a single, accessible resource hub mapping campus and community food resources.',
  },
  'bn-3': {
    id: 'bn-3',
    departmentId: 'basic-needs',
    number: 3,
    title: 'Expand Plus Swipe Options',
    shortTitle: 'Plus Swipe Expansion',
    description: 'Advocates for expanding Plus Swipe options to include healthier off-campus dining.',
  },
  'bn-4': {
    id: 'bn-4',
    departmentId: 'basic-needs',
    number: 4,
    title: 'Create a Student Grocery Transportation Access',
    shortTitle: 'Grocery Shuttle',
    description: 'Creates a dedicated grocery shuttle for student access to affordable food off campus.',
  },
  'bn-5': {
    id: 'bn-5',
    departmentId: 'basic-needs',
    number: 5,
    title: 'Launch Off-Campus Living Education',
    shortTitle: 'Off-Campus Education',
    description: 'Partners with Off-Campus Student Life for monthly programming on leases, budgeting, and housing.',
  },

  // Civic Engagement (5 policies)
  'ce-1': {
    id: 'ce-1',
    departmentId: 'civic-engagement',
    number: 1,
    title: 'Establish the Carolina Civic Award',
    shortTitle: 'Civic Award',
    description: 'Annual award recognizing outstanding civic and community engagement.',
  },
  'ce-2': {
    id: 'ce-2',
    departmentId: 'civic-engagement',
    number: 2,
    title: 'Town-University Partnership Council',
    shortTitle: 'Town Council',
    description: 'Establishes a council to strengthen collaboration between UNC and local government.',
  },
  'ce-3': {
    id: 'ce-3',
    departmentId: 'civic-engagement',
    number: 3,
    title: 'Carolina Day of Service',
    shortTitle: 'Day of Service',
    description: 'Campus-wide day of service with local schools, parks, and nonprofit organizations.',
  },
  'ce-4': {
    id: 'ce-4',
    departmentId: 'civic-engagement',
    number: 4,
    title: 'Centralized Service Engagement Initiative',
    shortTitle: 'Service Portal',
    description: 'Centralizes volunteer opportunities and requires SG representatives to complete service hours.',
  },
  'ce-5': {
    id: 'ce-5',
    departmentId: 'civic-engagement',
    number: 5,
    title: 'Informed, Nonpartisan Current Events Newsletter',
    shortTitle: 'Civics Newsletter',
    description: 'Launches a nonpartisan newsletter to help students stay civically engaged.',
  },

  // DEI (4 policies)
  'dei-1': {
    id: 'dei-1',
    departmentId: 'dei',
    number: 1,
    title: 'Create a Student Success & Engagement Syllabi Section',
    shortTitle: 'Syllabi Resources',
    description: 'Introduces a recommended section in course syllabi highlighting campus resources.',
  },
  'dei-2': {
    id: 'dei-2',
    departmentId: 'dei',
    number: 2,
    title: 'Organize a Cultural Organizations Council',
    shortTitle: 'Cultural Council',
    description: 'Establishes a council to strengthen collaboration among identity-based student organizations.',
  },
  'dei-3': {
    id: 'dei-3',
    departmentId: 'dei',
    number: 3,
    title: 'Establish a University-Wide Cultural Calendar',
    shortTitle: 'Cultural Calendar',
    description: 'Creates a calendar highlighting cultural events, heritage months, and celebrations.',
  },
  'dei-4': {
    id: 'dei-4',
    departmentId: 'dei',
    number: 4,
    title: 'Create a Collaborative Cultural Programming Fund',
    shortTitle: 'Cultural Fund',
    description: 'Creates a fund supporting monthly collaborations between cultural organizations.',
  },

  // Wellness & Safety (6 policies)
  'ws-1': {
    id: 'ws-1',
    departmentId: 'wellness-safety',
    number: 1,
    title: 'Expand CAPS Access Through Drop-In Hours and More Locations',
    shortTitle: 'CAPS Expansion',
    description: 'Increases accessibility to CAPS with more drop-in hours and additional locations.',
  },
  'ws-2': {
    id: 'ws-2',
    departmentId: 'wellness-safety',
    number: 2,
    title: 'Launch an Off-Campus Safety Task Force and Ride Programs',
    shortTitle: 'Safety Task Force',
    description: 'Creates a task force for off-campus safety including expanded SafeWalk and ride programs.',
  },
  'ws-3': {
    id: 'ws-3',
    departmentId: 'wellness-safety',
    number: 3,
    title: 'Increase Access to Plan B and Narcan Distribution',
    shortTitle: 'Plan B & Narcan',
    description: 'Ensures Plan B and Narcan are widely available with clear signage and education.',
  },
  'ws-4': {
    id: 'ws-4',
    departmentId: 'wellness-safety',
    number: 4,
    title: 'Implement Off-Campus Event Safety Planning for Registered Parties',
    shortTitle: 'Event Safety',
    description: 'Requires registered organizations to submit safety plans for off-campus events.',
  },
  'ws-5': {
    id: 'ws-5',
    departmentId: 'wellness-safety',
    number: 5,
    title: 'Add a "Student Wellness" Button in Canvas',
    shortTitle: 'Canvas Wellness Button',
    description: 'Integrates a dedicated wellness button in Canvas linking to health and safety resources.',
  },
  'ws-6': {
    id: 'ws-6',
    departmentId: 'wellness-safety',
    number: 6,
    title: 'Integrate Campus Health Services into ConnectCarolina',
    shortTitle: 'Health Integration',
    description: 'Fully integrates Campus Health Services into ConnectCarolina for centralized scheduling.',
  },

  // Environmental (5 policies)
  'env-1': {
    id: 'env-1',
    departmentId: 'environmental',
    number: 1,
    title: 'Launch Sustain Carolina Week',
    shortTitle: 'Sustain Week',
    description: 'Campus-wide celebration of sustainability with events and challenges.',
  },
  'env-2': {
    id: 'env-2',
    departmentId: 'environmental',
    number: 2,
    title: 'Pilot a "Too Good To Go" Dining Model',
    shortTitle: 'Surplus Meals',
    description: 'Redistributes surplus dining hall meals through a low-cost access platform.',
  },
  'env-3': {
    id: 'env-3',
    departmentId: 'environmental',
    number: 3,
    title: 'Adopt-a-Space & Campus Trash Pickup Day',
    shortTitle: 'Adopt-a-Space',
    description: 'Empowers organizations to adopt and maintain designated campus spaces.',
  },
  'env-4': {
    id: 'env-4',
    departmentId: 'environmental',
    number: 4,
    title: 'Expand Composting and Plate-Clearing Stations',
    shortTitle: 'Composting',
    description: 'Expands composting infrastructure across campus dining facilities.',
  },
  'env-5': {
    id: 'env-5',
    departmentId: 'environmental',
    number: 5,
    title: 'Establish a Move-Out Donation Shop',
    shortTitle: 'Move-Out Shop',
    description: 'Creates a thrift-style shop for collecting and reselling move-out items.',
  },

  // State & External (4 policies)
  'se-1': {
    id: 'se-1',
    departmentId: 'state-external',
    number: 1,
    title: 'Organize "Heels on the Hill"',
    shortTitle: 'Heels on the Hill',
    description: 'Establishes a coordinated State Lobby Day for student advocacy.',
  },
  'se-2': {
    id: 'se-2',
    departmentId: 'state-external',
    number: 2,
    title: 'Create an Annual Legislators-in-Residence Day',
    shortTitle: 'Legislators Day',
    description: 'Annual on-campus event bringing legislators into conversation with students.',
  },
  'se-3': {
    id: 'se-3',
    departmentId: 'state-external',
    number: 3,
    title: 'Build an Alumni in Public Service Network',
    shortTitle: 'Alumni Network',
    description: 'Connects students with alumni working in government, policy, and nonprofits.',
  },
  'se-4': {
    id: 'se-4',
    departmentId: 'state-external',
    number: 4,
    title: 'Facilitate Nonpartisan Roundtable Discussions',
    shortTitle: 'Roundtables',
    description: 'Creates structured spaces for respectful dialogue on public issues.',
  },

  // Communications (6 initiatives)
  'comm-1': {
    id: 'comm-1',
    departmentId: 'communications',
    number: 1,
    title: 'Launch "Who is Carolina" Storytelling Campaign',
    shortTitle: 'Who is Carolina',
    description: 'Highlights diverse experiences through interview-style videos.',
  },
  'comm-2': {
    id: 'comm-2',
    departmentId: 'communications',
    number: 2,
    title: 'Create a Student Advisory Committee to the Vice Chancellor for Communications',
    shortTitle: 'Advisory Committee',
    description: 'Creates a formal channel for student input on UNC\'s messaging.',
  },
  'comm-3': {
    id: 'comm-3',
    departmentId: 'communications',
    number: 3,
    title: 'Produce a Student Government Podcast',
    shortTitle: 'SG Podcast',
    description: 'Spotlights student leaders, athletes, and organizations.',
  },
  'comm-4': {
    id: 'comm-4',
    departmentId: 'communications',
    number: 4,
    title: 'Showcase Student Talent through Social Media',
    shortTitle: 'Arts Spotlights',
    description: 'Celebrates student creativity through social media content.',
  },
  'comm-5': {
    id: 'comm-5',
    departmentId: 'communications',
    number: 5,
    title: 'Celebrate Student Success and Everyday Life through Social Media',
    shortTitle: 'Student Success',
    description: 'Expands content to spotlight student achievements and campus life.',
  },
  'comm-6': {
    id: 'comm-6',
    departmentId: 'communications',
    number: 6,
    title: 'Lead an Assessment & Accountability Campaign',
    shortTitle: 'Accountability Dashboard',
    description: 'Establishes measurable outcomes with transparent progress tracking.',
  },
};

// =============================================================================
// PROJECT BOLD VALUES
// =============================================================================

export const PROJECT_BOLD_VALUES = {
  courage: {
    name: 'Courage',
    description: 'We lead fearlessly, even if the path forward is uncertain.',
  },
  community: {
    name: 'Community',
    description: 'We believe progress happens together.',
  },
  accountability: {
    name: 'Accountability',
    description: 'We follow through on our promises and lead with honesty and transparency.',
  },
  equity: {
    name: 'Equity',
    description: 'We ensure every Tar Heel has the opportunity to thrive, regardless of their background or identity.',
  },
  innovation: {
    name: 'Innovation',
    description: 'We think creatively about the challenges we face and act boldly to solve them.',
  },
};

// =============================================================================
// EXPRESS TYPE AUGMENTATION
// =============================================================================

declare global {
  namespace Express {
    interface User extends JWTPayload {}
  }
}

export {};
