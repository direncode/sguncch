/**
 * Project Bold Platform - Shared Type Definitions
 *
 * All types map directly to the Project Bold Policy Book departments,
 * policies, values, and priorities.
 */

// =============================================================================
// CORE USER TYPES
// =============================================================================

export type UserRole =
  | 'student'
  | 'org_leader'
  | 'senator'
  | 'cabinet_member'
  | 'admin'
  | 'faculty'
  | 'staff';

export type UserAffiliation =
  | 'undergraduate'
  | 'graduate'
  | 'faculty'
  | 'staff'
  | 'alumni';

export interface User {
  id: string;
  pid: string;              // UNC PID
  onyen: string;            // UNC Onyen
  email: string;
  firstName: string;
  lastName: string;
  affiliation: UserAffiliation;
  roles: UserRole[];
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  displayTheme: 'light' | 'dark' | 'system';
  accessibilityMode: boolean;
  language: string;
}

export interface UserProfile extends User {
  bio?: string;
  major?: string;
  minor?: string;
  graduationYear?: number;
  organizations: OrganizationMembership[];
  interests: string[];
  strengths?: GallupStrengths;  // Policy #5 - First-Year Strengths Integration
}

// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

export interface AuthSession {
  userId: string;
  roles: UserRole[];
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  samlAttributes?: SAMLAttributes;
}

export interface SAMLAttributes {
  pid: string;
  onyen: string;
  email: string;
  firstName: string;
  lastName: string;
  affiliation: string;
  eduPersonEntitlement?: string[];
}

export interface JWTPayload {
  sub: string;        // User ID
  pid: string;
  roles: UserRole[];
  iat: number;
  exp: number;
}

// =============================================================================
// DEPARTMENT TYPES (Maps to Policy Book Departments)
// =============================================================================

export type DepartmentSlug =
  | 'academic-affairs'
  | 'basic-needs'
  | 'civic-engagement'
  | 'dei'
  | 'wellness-safety'
  | 'environmental'
  | 'state-external'
  | 'communications';

export interface Department {
  id: string;
  name: string;
  slug: DepartmentSlug;
  description: string;
  iconUrl?: string;
  policies: Policy[];
  leads: User[];
}

// =============================================================================
// POLICY TYPES (Maps to Policy Book Policies)
// =============================================================================

export type PolicyStatus =
  | 'proposed'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'deferred';

export interface Policy {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  status: PolicyStatus;
  priority: number;
  milestones: PolicyMilestone[];
  progress: number;           // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyMilestone {
  id: string;
  title: string;
  description: string;
  targetDate?: Date;
  completedAt?: Date;
  isCompleted: boolean;
}

export interface PolicyProgress {
  id: string;
  policyId: string;
  percentage: number;
  updateText: string;
  updatedAt: Date;
  updatedBy: string;
}

// =============================================================================
// ACADEMIC AFFAIRS TYPES (Department Policies #1-5)
// =============================================================================

// Policy #1 - Peer Mentorship Network
export interface MentorshipMatch {
  id: string;
  mentorId: string;
  menteeId: string;
  mentor: UserProfile;
  mentee: UserProfile;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  matchScore: number;         // AI-computed compatibility
  matchReason: string;        // AI-generated explanation
  discipline?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorshipRequest {
  userId: string;
  role: 'mentor' | 'mentee';
  disciplines: string[];
  topics: string[];
  availability: string[];
  goals: string;
  preferences: MentorshipPreferences;
}

export interface MentorshipPreferences {
  sameCollege: boolean;
  sameMajor: boolean;
  similarInterests: boolean;
  communicationStyle: 'frequent' | 'moderate' | 'occasional';
}

// Policy #2 - Midterm Progress Check-Ins
export interface MidtermCheckIn {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  semester: string;
  status: 'satisfactory' | 'needs_improvement' | 'at_risk';
  feedback?: string;
  resourceRecommendations: string[];
  createdAt: Date;
}

// Policy #3 - STEM Collaboration Centers
export interface STEMCenter {
  id: string;
  name: string;
  location: string;
  disciplines: string[];
  amenities: string[];
  is24Hour: boolean;
  capacity: number;
}

export interface STEMCenterBooking {
  id: string;
  centerId: string;
  userId: string;
  groupSize: number;
  purpose: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// Policy #5 - Gallup Strengths
export interface GallupStrengths {
  userId: string;
  assessmentDate: Date;
  topFive: string[];
  allStrengths?: string[];
  reportUrl?: string;
}

// =============================================================================
// BASIC NEEDS TYPES (Department Policies #1-5)
// =============================================================================

// Policy #2 - Food Security Hub
export interface FoodResource {
  id: string;
  type: 'pantry' | 'fridge' | 'farmers_market' | 'meal_swipe' | 'farm_stand';
  name: string;
  description: string;
  location: ResourceLocation;
  schedule: OperatingSchedule;
  contactInfo?: string;
  isActive: boolean;
}

export interface ResourceLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  building?: string;
  room?: string;
}

export interface OperatingSchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
  specialNotes?: string;
}

export interface DaySchedule {
  open: string;     // HH:MM format
  close: string;
  breaks?: { start: string; end: string }[];
}

// Policy #4 - Grocery Shuttle
export interface GroceryShuttle {
  id: string;
  routeName: string;
  stops: ShuttleStop[];
  schedule: ShuttleSchedule[];
  isActive: boolean;
}

export interface ShuttleStop {
  id: string;
  name: string;
  location: ResourceLocation;
  arrivalTime: string;
  departureTime: string;
}

export interface ShuttleSchedule {
  dayOfWeek: number;      // 0-6
  departureTime: string;
  returnTime: string;
}

// =============================================================================
// CIVIC ENGAGEMENT TYPES (Department Policies #1-5)
// =============================================================================

// Policy #1 - Carolina Civic Award
export interface CivicAward {
  id: string;
  year: number;
  category: 'student' | 'faculty' | 'organization';
  nomineeId: string;
  nomineeName: string;
  nominatorId: string;
  description: string;
  serviceHours?: number;
  status: 'nominated' | 'finalist' | 'winner';
  createdAt: Date;
}

export interface CivicAwardNomination {
  nomineeId?: string;
  nomineeEmail: string;
  category: 'student' | 'faculty' | 'organization';
  description: string;
  achievements: string[];
  supportingDocuments?: string[];
}

// Policy #4 - Service Hours Tracking
export interface ServiceHours {
  id: string;
  userId: string;
  organizationId?: string;
  eventId?: string;
  hours: number;
  date: Date;
  description: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  status: 'pending' | 'verified' | 'rejected';
}

export interface ServiceSummary {
  userId: string;
  totalHours: number;
  verifiedHours: number;
  pendingHours: number;
  semesterHours: number;
  yearHours: number;
  organizationBreakdown: { organizationName: string; hours: number }[];
}

// =============================================================================
// DEI TYPES (Department Policies #1-4)
// =============================================================================

// Policy #2 - Cultural Organizations Council
export interface CulturalOrganization {
  id: string;
  name: string;
  description: string;
  category: string[];       // e.g., ['African American', 'Cultural']
  contactEmail: string;
  websiteUrl?: string;
  socialLinks?: SocialLinks;
  members: OrganizationMembership[];
  events: Event[];
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
}

// Policy #3 - Cultural Calendar
export interface CulturalEvent {
  id: string;
  title: string;
  description: string;
  organizationId?: string;
  type: 'heritage_month' | 'celebration' | 'workshop' | 'performance' | 'other';
  heritageMonth?: string;
  startDate: Date;
  endDate: Date;
  location: ResourceLocation;
  isPublic: boolean;
  rsvpRequired: boolean;
  maxAttendees?: number;
}

// Policy #4 - Cultural Programming Fund
export interface FundingApplication {
  id: string;
  organizationIds: string[];      // Collaborative applications
  title: string;
  description: string;
  requestedAmount: number;
  eventDate: Date;
  expectedAttendees: number;
  budgetBreakdown: BudgetItem[];
  status: 'submitted' | 'under_review' | 'approved' | 'denied';
  approvedAmount?: number;
  submittedAt: Date;
  reviewedAt?: Date;
}

export interface BudgetItem {
  category: string;
  description: string;
  amount: number;
}

// =============================================================================
// WELLNESS & SAFETY TYPES (Department Policies #1-6)
// =============================================================================

// Policy #1 - CAPS Access
export interface WellnessResource {
  id: string;
  type: 'caps' | 'health' | 'safety' | 'emergency' | 'plan_b' | 'narcan';
  name: string;
  description: string;
  location?: ResourceLocation;
  contactPhone?: string;
  contactEmail?: string;
  websiteUrl?: string;
  isVirtual: boolean;
  availability: string;
  waitTime?: string;          // Average wait time info
}

// Policy #2 - Off-Campus Safety
export interface SafeRideRequest {
  id: string;
  userId: string;
  pickupLocation: ResourceLocation;
  dropoffLocation: ResourceLocation;
  requestedTime: Date;
  status: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  driverId?: string;
  estimatedArrival?: Date;
  completedAt?: Date;
}

// Policy #3 - Plan B/Narcan Locations
export interface DistributionLocation {
  id: string;
  type: 'plan_b' | 'narcan' | 'both';
  location: ResourceLocation;
  availability: 'always' | 'limited_hours';
  schedule?: OperatingSchedule;
  stockStatus: 'available' | 'low' | 'out_of_stock';
  lastRestocked?: Date;
}

// Policy #4 - Event Safety Plans
export interface EventSafetyPlan {
  id: string;
  eventId: string;
  organizationId: string;
  submittedBy: string;
  expectedAttendees: number;
  venueAddress: string;
  transportationPlan: string;
  crowdManagement: string;
  emergencyContacts: EmergencyContact[];
  alcoholPresent: boolean;
  securityMeasures?: string;
  status: 'draft' | 'submitted' | 'approved' | 'revision_required';
  feedback?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
}

export interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
}

// =============================================================================
// ENVIRONMENTAL AFFAIRS TYPES (Department Policies #1-5)
// =============================================================================

// Policy #1 - Sustain Carolina Week
export interface SustainabilityEvent {
  id: string;
  weekId: string;
  title: string;
  description: string;
  type: 'challenge' | 'workshop' | 'cleanup' | 'panel' | 'popup' | 'other';
  location: ResourceLocation;
  startTime: Date;
  endTime: Date;
  maxParticipants?: number;
  registeredCount: number;
}

// Policy #2 - Too Good To Go
export interface SurplusMeal {
  id: string;
  diningLocationId: string;
  diningLocationName: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  availableFrom: Date;
  availableUntil: Date;
  quantity: number;
  claimedCount: number;
  dietaryInfo?: string[];
}

// Policy #3 - Adopt-a-Space
export interface AdoptedSpace {
  id: string;
  organizationId: string;
  organizationName: string;
  spaceName: string;
  location: ResourceLocation;
  adoptedAt: Date;
  nextCleanupDate?: Date;
  cleanupHistory: CleanupEvent[];
}

export interface CleanupEvent {
  id: string;
  spaceId: string;
  date: Date;
  participantCount: number;
  trashCollectedLbs?: number;
  notes?: string;
  photos?: string[];
}

// Policy #5 - Move-Out Donation Shop
export interface DonationItem {
  id: string;
  category: 'furniture' | 'clothing' | 'electronics' | 'decor' | 'supplies' | 'other';
  title: string;
  description: string;
  condition: 'excellent' | 'good' | 'fair';
  imageUrls: string[];
  donorId?: string;
  price: number;
  status: 'available' | 'reserved' | 'sold' | 'donated';
  pickupLocation?: string;
  createdAt: Date;
}

// =============================================================================
// STATE & EXTERNAL AFFAIRS TYPES (Department Policies #1-4)
// =============================================================================

// Policy #1 - Heels on the Hill
export interface LobbyDayEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
  description: string;
  trainingRequired: boolean;
  trainingDate?: Date;
  issues: LegislativeIssue[];
  registrationDeadline: Date;
  maxParticipants: number;
  registeredCount: number;
}

export interface LegislativeIssue {
  id: string;
  title: string;
  summary: string;
  billNumber?: string;
  talkingPoints: string[];
  relevance: string;          // Why it matters to UNC students
}

// Policy #2 - Legislators-in-Residence
export interface LegislatorVisit {
  id: string;
  legislatorName: string;
  title: string;
  party?: string;
  district?: string;
  photoUrl?: string;
  visitDate: Date;
  events: LegislatorEvent[];
}

export interface LegislatorEvent {
  id: string;
  visitId: string;
  type: 'panel' | 'roundtable' | 'lecture' | 'office_hours';
  title: string;
  description: string;
  location: ResourceLocation;
  startTime: Date;
  endTime: Date;
  maxAttendees?: number;
  studentQuestions?: string[];  // Pre-submitted questions
}

// Policy #3 - Alumni Network
export interface AlumniMentor {
  id: string;
  userId?: string;          // If they have platform account
  name: string;
  email: string;
  graduationYear: number;
  currentTitle: string;
  organization: string;
  sector: 'government' | 'nonprofit' | 'advocacy' | 'policy' | 'other';
  bio: string;
  mentorshipType: 'micro' | 'short_term' | 'long_term';
  availability: string;
  linkedinUrl?: string;
}

// =============================================================================
// COMMUNICATIONS TYPES (Office Initiatives #1-6)
// =============================================================================

// Initiative #1 - Who is Carolina Campaign
export interface StorySubmission {
  id: string;
  userId: string;
  title: string;
  story: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: 'submitted' | 'approved' | 'published' | 'rejected';
  publishedAt?: Date;
  viewCount: number;
  createdAt: Date;
}

// Initiative #3 - Podcast
export interface PodcastEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  guestName?: string;
  guestTitle?: string;
  audioUrl: string;
  duration: number;          // seconds
  publishedAt: Date;
  showNotes?: string;
  topics: string[];
}

// Initiative #6 - Accountability Dashboard
export interface AccountabilityMetric {
  id: string;
  departmentId: string;
  metricName: string;
  metricDescription: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  lastUpdated: Date;
  trend: 'up' | 'down' | 'stable';
  history: MetricDataPoint[];
}

export interface MetricDataPoint {
  date: Date;
  value: number;
}

// =============================================================================
// EVENT & ORGANIZATION TYPES
// =============================================================================

export interface Organization {
  id: string;
  name: string;
  description: string;
  type: 'student_org' | 'cultural' | 'greek' | 'academic' | 'service' | 'sports' | 'other';
  logoUrl?: string;
  websiteUrl?: string;
  socialLinks?: SocialLinks;
  contactEmail: string;
  isRegistered: boolean;
  members: OrganizationMembership[];
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: 'member' | 'officer' | 'president' | 'advisor';
  joinedAt: Date;
  leftAt?: Date;
}

export interface Event {
  id: string;
  organizationId?: string;
  departmentId?: string;
  title: string;
  description: string;
  type: string;
  location: ResourceLocation;
  startTime: Date;
  endTime: Date;
  isPublic: boolean;
  rsvpRequired: boolean;
  maxAttendees?: number;
  currentAttendees: number;
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRSVP {
  id: string;
  eventId: string;
  userId: string;
  status: 'registered' | 'waitlisted' | 'attended' | 'no_show' | 'cancelled';
  registeredAt: Date;
  checkedInAt?: Date;
}

// =============================================================================
// FEEDBACK & COMMUNICATION TYPES
// =============================================================================

export interface Feedback {
  id: string;
  userId?: string;
  type: 'suggestion' | 'complaint' | 'question' | 'praise';
  category: DepartmentSlug | 'general';
  subject: string;
  message: string;
  isAnonymous: boolean;
  status: 'received' | 'in_review' | 'responded' | 'closed';
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  departmentId?: string;
  targetAudience: UserRole[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  publishedAt: Date;
  expiresAt?: Date;
  isPinned: boolean;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// CANVAS LTI TYPES
// =============================================================================

export interface LTILaunchContext {
  userId: string;
  canvasUserId: string;
  courseId?: string;
  courseName?: string;
  roles: string[];
  launchTime: Date;
}

export interface CanvasUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
