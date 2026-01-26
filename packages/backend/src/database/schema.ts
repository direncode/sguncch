/**
 * Project Bold Platform - Database Schema
 *
 * PostgreSQL schema using Drizzle ORM.
 * Maps directly to Project Bold Policy Book departments and policies.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  decimal,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =============================================================================
// ENUMS
// =============================================================================

export const userRoleEnum = pgEnum('user_role', [
  'student',
  'org_leader',
  'senator',
  'cabinet_member',
  'admin',
  'faculty',
  'staff',
]);

export const userAffiliationEnum = pgEnum('user_affiliation', [
  'undergraduate',
  'graduate',
  'faculty',
  'staff',
  'alumni',
]);

export const policyStatusEnum = pgEnum('policy_status', [
  'proposed',
  'in_progress',
  'completed',
  'blocked',
  'deferred',
]);

export const mentorshipStatusEnum = pgEnum('mentorship_status', [
  'pending',
  'active',
  'completed',
  'cancelled',
]);

export const serviceHoursStatusEnum = pgEnum('service_hours_status', [
  'pending',
  'verified',
  'rejected',
]);

export const eventRsvpStatusEnum = pgEnum('event_rsvp_status', [
  'registered',
  'waitlisted',
  'attended',
  'no_show',
  'cancelled',
]);

export const feedbackStatusEnum = pgEnum('feedback_status', [
  'received',
  'in_review',
  'responded',
  'closed',
]);

export const fundingStatusEnum = pgEnum('funding_status', [
  'submitted',
  'under_review',
  'approved',
  'denied',
]);

export const safetyPlanStatusEnum = pgEnum('safety_plan_status', [
  'draft',
  'submitted',
  'approved',
  'revision_required',
]);

// =============================================================================
// CORE TABLES
// =============================================================================

/**
 * Users - Core user accounts linked to UNC SSO
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  pid: varchar('pid', { length: 9 }).unique().notNull(),
  onyen: varchar('onyen', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  affiliation: userAffiliationEnum('affiliation').notNull().default('undergraduate'),
  profileImageUrl: text('profile_image_url'),
  bio: text('bio'),
  major: varchar('major', { length: 255 }),
  minor: varchar('minor', { length: 255 }),
  graduationYear: integer('graduation_year'),
  interests: jsonb('interests').$type<string[]>().default([]),
  preferences: jsonb('preferences').$type<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    displayTheme: 'light' | 'dark' | 'system';
    accessibilityMode: boolean;
    language: string;
  }>().default({
    emailNotifications: true,
    pushNotifications: true,
    displayTheme: 'system',
    accessibilityMode: false,
    language: 'en',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * User Roles - Many-to-many relationship for user roles
 */
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: userRoleEnum('role').notNull(),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  grantedBy: uuid('granted_by').references(() => users.id),
});

/**
 * Departments - Maps to Policy Book departments
 */
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  description: text('description').notNull(),
  iconUrl: text('icon_url'),
  color: varchar('color', { length: 7 }), // Hex color
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Policies - Individual policies from the Policy Book
 */
export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  departmentId: uuid('department_id').references(() => departments.id).notNull(),
  policyNumber: integer('policy_number').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  shortTitle: varchar('short_title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  status: policyStatusEnum('status').notNull().default('proposed'),
  progress: integer('progress').default(0), // 0-100
  priority: integer('priority').default(0),
  milestones: jsonb('milestones').$type<{
    id: string;
    title: string;
    description: string;
    targetDate?: string;
    completedAt?: string;
    isCompleted: boolean;
  }[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Policy Progress Updates - Transparency tracking
 */
export const policyProgress = pgTable('policy_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  policyId: uuid('policy_id').references(() => policies.id).notNull(),
  percentage: integer('percentage').notNull(),
  updateText: text('update_text').notNull(),
  updatedBy: uuid('updated_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================================================
// ACADEMIC AFFAIRS TABLES
// =============================================================================

/**
 * Mentorship Requests - Policy #1
 */
export const mentorshipRequests = pgTable('mentorship_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'mentor' or 'mentee'
  disciplines: jsonb('disciplines').$type<string[]>().default([]),
  topics: jsonb('topics').$type<string[]>().default([]),
  availability: jsonb('availability').$type<string[]>().default([]),
  goals: text('goals'),
  preferences: jsonb('preferences').$type<{
    sameCollege: boolean;
    sameMajor: boolean;
    similarInterests: boolean;
    communicationStyle: 'frequent' | 'moderate' | 'occasional';
  }>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Mentorship Matches - AI-powered matching
 */
export const mentorshipMatches = pgTable('mentorship_matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  mentorId: uuid('mentor_id').references(() => users.id).notNull(),
  menteeId: uuid('mentee_id').references(() => users.id).notNull(),
  status: mentorshipStatusEnum('status').notNull().default('pending'),
  matchScore: decimal('match_score', { precision: 5, scale: 2 }),
  matchReason: text('match_reason'),
  discipline: varchar('discipline', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Gallup Strengths - Policy #5
 */
export const gallupStrengths = pgTable('gallup_strengths', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  assessmentDate: date('assessment_date').notNull(),
  topFive: jsonb('top_five').$type<string[]>().notNull(),
  allStrengths: jsonb('all_strengths').$type<string[]>(),
  reportUrl: text('report_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================================================
// CIVIC ENGAGEMENT TABLES
// =============================================================================

/**
 * Service Hours - Policy #4
 */
export const serviceHours = pgTable('service_hours', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  eventId: uuid('event_id').references(() => events.id),
  hours: decimal('hours', { precision: 5, scale: 2 }).notNull(),
  date: date('date').notNull(),
  description: text('description').notNull(),
  status: serviceHoursStatusEnum('status').notNull().default('pending'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Civic Awards - Policy #1
 */
export const civicAwards = pgTable('civic_awards', {
  id: uuid('id').primaryKey().defaultRandom(),
  year: integer('year').notNull(),
  category: varchar('category', { length: 50 }).notNull(), // 'student', 'faculty', 'organization'
  nomineeId: uuid('nominee_id').references(() => users.id),
  nomineeOrganizationId: uuid('nominee_org_id').references(() => organizations.id),
  nominatorId: uuid('nominator_id').references(() => users.id).notNull(),
  description: text('description').notNull(),
  achievements: jsonb('achievements').$type<string[]>().default([]),
  status: varchar('status', { length: 50 }).notNull().default('nominated'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================================================
// DEI TABLES
// =============================================================================

/**
 * Cultural Events - Policy #3
 */
export const culturalEvents = pgTable('cultural_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  type: varchar('type', { length: 50 }).notNull(),
  heritageMonth: varchar('heritage_month', { length: 100 }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  locationId: uuid('location_id').references(() => locations.id),
  isPublic: boolean('is_public').default(true),
  rsvpRequired: boolean('rsvp_required').default(false),
  maxAttendees: integer('max_attendees'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Cultural Funding Applications - Policy #4
 */
export const fundingApplications = pgTable('funding_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationIds: jsonb('organization_ids').$type<string[]>().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  requestedAmount: decimal('requested_amount', { precision: 10, scale: 2 }).notNull(),
  approvedAmount: decimal('approved_amount', { precision: 10, scale: 2 }),
  eventDate: date('event_date').notNull(),
  expectedAttendees: integer('expected_attendees').notNull(),
  budgetBreakdown: jsonb('budget_breakdown').$type<{
    category: string;
    description: string;
    amount: number;
  }[]>().notNull(),
  status: fundingStatusEnum('status').notNull().default('submitted'),
  submittedBy: uuid('submitted_by').references(() => users.id).notNull(),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================================================
// WELLNESS & SAFETY TABLES
// =============================================================================

/**
 * Wellness Resources - Policies #1, #3
 */
export const wellnessResources = pgTable('wellness_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).notNull(), // caps, health, safety, plan_b, narcan
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  locationId: uuid('location_id').references(() => locations.id),
  contactPhone: varchar('contact_phone', { length: 20 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  websiteUrl: text('website_url'),
  isVirtual: boolean('is_virtual').default(false),
  availability: text('availability'),
  waitTime: varchar('wait_time', { length: 100 }),
  stockStatus: varchar('stock_status', { length: 50 }), // For Plan B/Narcan
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Event Safety Plans - Policy #4
 */
export const eventSafetyPlans = pgTable('event_safety_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  submittedBy: uuid('submitted_by').references(() => users.id).notNull(),
  expectedAttendees: integer('expected_attendees').notNull(),
  venueAddress: text('venue_address').notNull(),
  transportationPlan: text('transportation_plan').notNull(),
  crowdManagement: text('crowd_management').notNull(),
  emergencyContacts: jsonb('emergency_contacts').$type<{
    name: string;
    role: string;
    phone: string;
  }[]>().notNull(),
  alcoholPresent: boolean('alcohol_present').default(false),
  securityMeasures: text('security_measures'),
  status: safetyPlanStatusEnum('status').notNull().default('draft'),
  feedback: text('feedback'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================================================
// ENVIRONMENTAL TABLES
// =============================================================================

/**
 * Adopted Spaces - Policy #3
 */
export const adoptedSpaces = pgTable('adopted_spaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  spaceName: varchar('space_name', { length: 255 }).notNull(),
  locationId: uuid('location_id').references(() => locations.id).notNull(),
  adoptedAt: timestamp('adopted_at').defaultNow().notNull(),
  nextCleanupDate: date('next_cleanup_date'),
  isActive: boolean('is_active').default(true),
});

/**
 * Donation Items - Policy #5
 */
export const donationItems = pgTable('donation_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: varchar('category', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  condition: varchar('condition', { length: 50 }).notNull(),
  imageUrls: jsonb('image_urls').$type<string[]>().default([]),
  donorId: uuid('donor_id').references(() => users.id),
  price: decimal('price', { precision: 10, scale: 2 }).default('0'),
  status: varchar('status', { length: 50 }).notNull().default('available'),
  pickupLocation: text('pickup_location'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =============================================================================
// STATE & EXTERNAL TABLES
// =============================================================================

/**
 * Alumni Mentors - Policy #3
 */
export const alumniMentors = pgTable('alumni_mentors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  graduationYear: integer('graduation_year').notNull(),
  currentTitle: varchar('current_title', { length: 255 }).notNull(),
  organization: varchar('organization', { length: 255 }).notNull(),
  sector: varchar('sector', { length: 50 }).notNull(),
  bio: text('bio'),
  mentorshipType: varchar('mentorship_type', { length: 50 }).notNull(),
  availability: text('availability'),
  linkedinUrl: text('linkedin_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =============================================================================
// COMMUNICATIONS TABLES
// =============================================================================

/**
 * Story Submissions - Initiative #1
 */
export const storySubmissions = pgTable('story_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  story: text('story').notNull(),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  status: varchar('status', { length: 50 }).notNull().default('submitted'),
  publishedAt: timestamp('published_at'),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Accountability Metrics - Initiative #6
 */
export const accountabilityMetrics = pgTable('accountability_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  departmentId: uuid('department_id').references(() => departments.id).notNull(),
  metricName: varchar('metric_name', { length: 255 }).notNull(),
  metricDescription: text('metric_description'),
  currentValue: decimal('current_value', { precision: 15, scale: 2 }).notNull(),
  targetValue: decimal('target_value', { precision: 15, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  trend: varchar('trend', { length: 20 }).default('stable'),
  history: jsonb('history').$type<{ date: string; value: number }[]>().default([]),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================================================
// SHARED TABLES
// =============================================================================

/**
 * Organizations - Student organizations
 */
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  socialLinks: jsonb('social_links').$type<{
    instagram?: string;
    twitter?: string;
    facebook?: string;
  }>(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  isRegistered: boolean('is_registered').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Organization Memberships
 */
export const organizationMemberships = pgTable('organization_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
});

/**
 * Locations - Reusable location data
 */
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  building: varchar('building', { length: 255 }),
  room: varchar('room', { length: 50 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Events - General events system
 */
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id),
  departmentId: uuid('department_id').references(() => departments.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  locationId: uuid('location_id').references(() => locations.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  isPublic: boolean('is_public').default(true),
  rsvpRequired: boolean('rsvp_required').default(false),
  maxAttendees: integer('max_attendees'),
  tags: jsonb('tags').$type<string[]>().default([]),
  imageUrl: text('image_url'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Event RSVPs
 */
export const eventRsvps = pgTable('event_rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: eventRsvpStatusEnum('status').notNull().default('registered'),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  checkedInAt: timestamp('checked_in_at'),
});

/**
 * Feedback
 */
export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isAnonymous: boolean('is_anonymous').default(false),
  status: feedbackStatusEnum('status').notNull().default('received'),
  response: text('response'),
  respondedBy: uuid('responded_by').references(() => users.id),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Announcements
 */
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  targetAudience: jsonb('target_audience').$type<string[]>().default([]),
  priority: varchar('priority', { length: 20 }).notNull().default('normal'),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================================================
// RELATIONS
// =============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  mentorshipRequests: many(mentorshipRequests),
  serviceHours: many(serviceHours),
  organizationMemberships: many(organizationMemberships),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  policies: many(policies),
  events: many(events),
  metrics: many(accountabilityMetrics),
}));

export const policiesRelations = relations(policies, ({ one, many }) => ({
  department: one(departments, {
    fields: [policies.departmentId],
    references: [departments.id],
  }),
  progressUpdates: many(policyProgress),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMemberships),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [events.organizationId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [events.departmentId],
    references: [departments.id],
  }),
  location: one(locations, {
    fields: [events.locationId],
    references: [locations.id],
  }),
  rsvps: many(eventRsvps),
}));
