/**
 * Project Bold Policy Platform - API Server
 *
 * A unified digital hub for UNC Student Government
 * First, Best, For All
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// =============================================================================
// MIDDLEWARE
// =============================================================================

app.use(helmet());
app.use(compression());
app.use(cors({ origin: APP_URL.split(','), credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }
});
app.use(limiter);

// =============================================================================
// DATA - DEPARTMENTS & POLICIES (from Policy Book)
// =============================================================================

const DEPARTMENTS = {
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
    description: 'Strengthening bonds between Carolina and the community through service',
    color: '#5B2C6F',
  },
  'dei': {
    id: 'dei',
    name: 'Department of Diversity, Equity, and Inclusion',
    slug: 'dei',
    description: 'Celebrating identity, fostering belonging, and ensuring equity',
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
    description: 'Telling Carolina\'s story and ensuring transparency in student government',
    color: '#E8B00F',
  },
};

const POLICIES = [
  // Academic Affairs
  { id: 'aa-1', departmentId: 'academic-affairs', number: 1, title: 'University-Wide Peer Mentorship Network', shortTitle: 'Peer Mentorship', status: 'in_progress', progress: 25 },
  { id: 'aa-2', departmentId: 'academic-affairs', number: 2, title: 'Standardized Midterm Progress Check-Ins', shortTitle: 'Midterm Check-Ins', status: 'proposed', progress: 10 },
  { id: 'aa-3', departmentId: 'academic-affairs', number: 3, title: 'STEM Collaboration and Study Centers', shortTitle: 'STEM Centers', status: 'proposed', progress: 5 },
  { id: 'aa-4', departmentId: 'academic-affairs', number: 4, title: 'Enhance Dean\'s List Process', shortTitle: 'Dean\'s List', status: 'proposed', progress: 0 },
  { id: 'aa-5', departmentId: 'academic-affairs', number: 5, title: 'First-Year Gallup Strengths Integration', shortTitle: 'Gallup Strengths', status: 'proposed', progress: 15 },
  // Basic Needs
  { id: 'bn-1', departmentId: 'basic-needs', number: 1, title: 'On-Campus Farmers Markets & Chase Farm Stands', shortTitle: 'Farmers Markets', status: 'in_progress', progress: 40 },
  { id: 'bn-2', departmentId: 'basic-needs', number: 2, title: 'Centralize Food Security Access', shortTitle: 'Food Hub', status: 'in_progress', progress: 30 },
  { id: 'bn-3', departmentId: 'basic-needs', number: 3, title: 'Expand Plus Swipe Options', shortTitle: 'Plus Swipe', status: 'proposed', progress: 10 },
  { id: 'bn-4', departmentId: 'basic-needs', number: 4, title: 'Student Grocery Transportation', shortTitle: 'Grocery Shuttle', status: 'proposed', progress: 5 },
  { id: 'bn-5', departmentId: 'basic-needs', number: 5, title: 'Off-Campus Living Education', shortTitle: 'Housing Education', status: 'in_progress', progress: 20 },
  // Civic Engagement
  { id: 'ce-1', departmentId: 'civic-engagement', number: 1, title: 'Carolina Civic Award', shortTitle: 'Civic Award', status: 'proposed', progress: 15 },
  { id: 'ce-2', departmentId: 'civic-engagement', number: 2, title: 'Town-University Partnership Council', shortTitle: 'Town Council', status: 'proposed', progress: 10 },
  { id: 'ce-3', departmentId: 'civic-engagement', number: 3, title: 'Carolina Day of Service', shortTitle: 'Day of Service', status: 'in_progress', progress: 35 },
  { id: 'ce-4', departmentId: 'civic-engagement', number: 4, title: 'Centralized Service Engagement', shortTitle: 'Service Portal', status: 'in_progress', progress: 25 },
  { id: 'ce-5', departmentId: 'civic-engagement', number: 5, title: 'Nonpartisan Current Events Newsletter', shortTitle: 'Civics Newsletter', status: 'proposed', progress: 5 },
  // DEI
  { id: 'dei-1', departmentId: 'dei', number: 1, title: 'Student Success Syllabi Section', shortTitle: 'Syllabi Resources', status: 'in_progress', progress: 20 },
  { id: 'dei-2', departmentId: 'dei', number: 2, title: 'Cultural Organizations Council', shortTitle: 'Cultural Council', status: 'proposed', progress: 10 },
  { id: 'dei-3', departmentId: 'dei', number: 3, title: 'University-Wide Cultural Calendar', shortTitle: 'Cultural Calendar', status: 'in_progress', progress: 45 },
  { id: 'dei-4', departmentId: 'dei', number: 4, title: 'Cultural Programming Fund', shortTitle: 'Cultural Fund', status: 'proposed', progress: 15 },
  // Wellness & Safety
  { id: 'ws-1', departmentId: 'wellness-safety', number: 1, title: 'Expand CAPS Access', shortTitle: 'CAPS Expansion', status: 'in_progress', progress: 30 },
  { id: 'ws-2', departmentId: 'wellness-safety', number: 2, title: 'Off-Campus Safety Task Force & Rides', shortTitle: 'Safety Task Force', status: 'proposed', progress: 10 },
  { id: 'ws-3', departmentId: 'wellness-safety', number: 3, title: 'Plan B and Narcan Distribution', shortTitle: 'Plan B & Narcan', status: 'in_progress', progress: 50 },
  { id: 'ws-4', departmentId: 'wellness-safety', number: 4, title: 'Off-Campus Event Safety Planning', shortTitle: 'Event Safety', status: 'proposed', progress: 5 },
  { id: 'ws-5', departmentId: 'wellness-safety', number: 5, title: 'Canvas Student Wellness Button', shortTitle: 'Canvas Button', status: 'in_progress', progress: 60 },
  { id: 'ws-6', departmentId: 'wellness-safety', number: 6, title: 'ConnectCarolina Health Integration', shortTitle: 'Health Integration', status: 'proposed', progress: 5 },
  // Environmental
  { id: 'env-1', departmentId: 'environmental', number: 1, title: 'Sustain Carolina Week', shortTitle: 'Sustain Week', status: 'proposed', progress: 20 },
  { id: 'env-2', departmentId: 'environmental', number: 2, title: 'Too Good To Go Dining Pilot', shortTitle: 'Surplus Meals', status: 'proposed', progress: 10 },
  { id: 'env-3', departmentId: 'environmental', number: 3, title: 'Adopt-a-Space & Campus Cleanup', shortTitle: 'Adopt-a-Space', status: 'proposed', progress: 5 },
  { id: 'env-4', departmentId: 'environmental', number: 4, title: 'Expand Composting Stations', shortTitle: 'Composting', status: 'in_progress', progress: 25 },
  { id: 'env-5', departmentId: 'environmental', number: 5, title: 'Move-Out Donation Shop', shortTitle: 'Donation Shop', status: 'proposed', progress: 15 },
  // State & External
  { id: 'se-1', departmentId: 'state-external', number: 1, title: 'Heels on the Hill Lobby Day', shortTitle: 'Heels on Hill', status: 'in_progress', progress: 40 },
  { id: 'se-2', departmentId: 'state-external', number: 2, title: 'Legislators-in-Residence Day', shortTitle: 'Legislators Day', status: 'proposed', progress: 20 },
  { id: 'se-3', departmentId: 'state-external', number: 3, title: 'Alumni in Public Service Network', shortTitle: 'Alumni Network', status: 'proposed', progress: 10 },
  { id: 'se-4', departmentId: 'state-external', number: 4, title: 'Nonpartisan Roundtable Discussions', shortTitle: 'Roundtables', status: 'proposed', progress: 5 },
  // Communications
  { id: 'comm-1', departmentId: 'communications', number: 1, title: 'Who is Carolina Campaign', shortTitle: 'Who is Carolina', status: 'in_progress', progress: 35 },
  { id: 'comm-2', departmentId: 'communications', number: 2, title: 'Student Advisory Committee', shortTitle: 'Advisory Committee', status: 'proposed', progress: 15 },
  { id: 'comm-3', departmentId: 'communications', number: 3, title: 'Student Government Podcast', shortTitle: 'SG Podcast', status: 'in_progress', progress: 50 },
  { id: 'comm-4', departmentId: 'communications', number: 4, title: 'Arts & Student Talent Spotlights', shortTitle: 'Arts Spotlights', status: 'in_progress', progress: 30 },
  { id: 'comm-5', departmentId: 'communications', number: 5, title: 'Student Success Social Media', shortTitle: 'Success Stories', status: 'in_progress', progress: 45 },
  { id: 'comm-6', departmentId: 'communications', number: 6, title: 'Accountability Dashboard', shortTitle: 'Accountability', status: 'in_progress', progress: 70 },
];

// Wellness Resources
const WELLNESS_RESOURCES = [
  { id: 'caps', type: 'mental_health', name: 'CAPS', description: 'Counseling and Psychological Services', phone: '919-966-3658', location: 'James A. Taylor Building', hours: 'M-F 8am-5pm', available: true },
  { id: 'campus-health', type: 'health', name: 'Campus Health', description: 'Primary care and medical services', phone: '919-966-2281', location: 'James A. Taylor Building', hours: 'M-F 8am-5pm', available: true },
  { id: 'safewalk', type: 'safety', name: 'SafeWalk', description: 'Free walking escort service', phone: '919-962-SAFE', hours: 'Nightly 8pm-2am', available: true },
  { id: 'narcan-union', type: 'narcan', name: 'Narcan - Student Union', description: 'Free naloxone kits', location: 'Student Union', available: true },
  { id: 'narcan-davis', type: 'narcan', name: 'Narcan - Davis Library', description: 'Free naloxone kits', location: 'Davis Library', available: true },
  { id: 'plan-b', type: 'plan_b', name: 'Emergency Contraception', description: 'Available at Campus Health Pharmacy', location: 'Campus Health Pharmacy', available: true },
];

// Food Resources
const FOOD_RESOURCES = [
  { id: 'pantry-union', name: 'Carolina Cupboard', type: 'pantry', location: 'Student Union', hours: 'M-F 10am-4pm' },
  { id: 'swipe-out', name: 'Swipe Out Hunger', type: 'meal_swipes', description: 'Donated meal swipes for students in need' },
  { id: 'farmers-market', name: 'Chapel Hill Farmers Market', type: 'market', location: 'University Place', hours: 'Sat 8am-12pm' },
];

// Mock users for auth
const MOCK_USERS = {
  student: { id: 'user-1', pid: '730123456', firstName: 'Jane', lastName: 'Smith', email: 'jsmith@unc.edu', roles: ['student'] },
  senator: { id: 'user-2', pid: '730234567', firstName: 'Taylor', lastName: 'Williams', email: 'twilliams@unc.edu', roles: ['student', 'senator'] },
  cabinet: { id: 'user-3', pid: '730345678', firstName: 'Alex', lastName: 'Brown', email: 'abrown@unc.edu', roles: ['student', 'cabinet'] },
  admin: { id: 'user-4', pid: '730456789', firstName: 'Devin', lastName: 'Duncan', email: 'dduncan@unc.edu', roles: ['student', 'admin'] },
};

// In-memory storage
const serviceHours = [];
const mentorshipRequests = [];
const feedback = [];

// =============================================================================
// AUTH HELPERS
// =============================================================================

function generateToken(user) {
  return jwt.sign({ sub: user.id, pid: user.pid, roles: user.roles }, JWT_SECRET, { expiresIn: '24h' });
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, error: { message: 'Authentication required' } });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: { message: 'Invalid token' } });
  }
}

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch {}
  }
  next();
}

// =============================================================================
// ROUTES
// =============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Auth routes
app.get('/auth/login', (req, res) => {
  res.json({
    success: true,
    data: {
      mockMode: true,
      message: 'Use POST /auth/mock-login with role parameter',
      availableRoles: Object.keys(MOCK_USERS),
    }
  });
});

app.post('/auth/mock-login', (req, res) => {
  const { role = 'student' } = req.body;
  const user = MOCK_USERS[role];
  if (!user) return res.status(400).json({ success: false, error: { message: 'Invalid role' } });

  const token = generateToken(user);
  res.json({ success: true, data: { accessToken: token, user } });
});

app.get('/auth/me', authMiddleware, (req, res) => {
  res.json({ success: true, data: req.user });
});

// Departments
app.get('/api/v1/departments', optionalAuth, (req, res) => {
  const deps = Object.values(DEPARTMENTS).map(d => ({
    ...d,
    policyCount: POLICIES.filter(p => p.departmentId === d.id).length,
  }));
  res.json({ success: true, data: deps });
});

app.get('/api/v1/departments/:slug', optionalAuth, (req, res) => {
  const dept = DEPARTMENTS[req.params.slug];
  if (!dept) return res.status(404).json({ success: false, error: { message: 'Department not found' } });

  const policies = POLICIES.filter(p => p.departmentId === dept.id);
  res.json({ success: true, data: { ...dept, policies } });
});

// Policies
app.get('/api/v1/policies', optionalAuth, (req, res) => {
  let result = [...POLICIES];
  if (req.query.department) result = result.filter(p => p.departmentId === req.query.department);
  if (req.query.status) result = result.filter(p => p.status === req.query.status);

  result = result.map(p => ({ ...p, department: DEPARTMENTS[p.departmentId]?.name }));
  res.json({ success: true, data: result, meta: { total: result.length } });
});

app.get('/api/v1/policies/:id', optionalAuth, (req, res) => {
  const policy = POLICIES.find(p => p.id === req.params.id);
  if (!policy) return res.status(404).json({ success: false, error: { message: 'Policy not found' } });
  res.json({ success: true, data: { ...policy, department: DEPARTMENTS[policy.departmentId] } });
});

// Wellness
app.get('/api/v1/wellness/resources', optionalAuth, (req, res) => {
  let resources = [...WELLNESS_RESOURCES];
  if (req.query.type) resources = resources.filter(r => r.type === req.query.type);
  res.json({ success: true, data: resources });
});

// Food Resources
app.get('/api/v1/basic-needs/food', optionalAuth, (req, res) => {
  res.json({ success: true, data: FOOD_RESOURCES });
});

// Mentorship
app.get('/api/v1/academic/mentorship', authMiddleware, (req, res) => {
  const userRequests = mentorshipRequests.filter(r => r.userId === req.user.sub);
  res.json({ success: true, data: userRequests });
});

app.post('/api/v1/academic/mentorship/request', authMiddleware, (req, res) => {
  const request = {
    id: uuidv4(),
    userId: req.user.sub,
    role: req.body.role || 'mentee',
    disciplines: req.body.disciplines || [],
    goals: req.body.goals || '',
    createdAt: new Date().toISOString(),
    status: 'active',
  };
  mentorshipRequests.push(request);
  res.status(201).json({ success: true, data: request });
});

// Service Hours
app.get('/api/v1/civic/service-hours', authMiddleware, (req, res) => {
  const userHours = serviceHours.filter(h => h.userId === req.user.sub);
  const total = userHours.reduce((sum, h) => sum + h.hours, 0);
  res.json({ success: true, data: { hours: userHours, totalHours: total } });
});

app.post('/api/v1/civic/service-hours', authMiddleware, (req, res) => {
  const entry = {
    id: uuidv4(),
    userId: req.user.sub,
    hours: req.body.hours,
    date: req.body.date,
    description: req.body.description,
    organization: req.body.organization,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  serviceHours.push(entry);
  res.status(201).json({ success: true, data: entry });
});

// Feedback
app.post('/api/v1/feedback', optionalAuth, (req, res) => {
  const entry = {
    id: uuidv4(),
    userId: req.user?.sub || 'anonymous',
    type: req.body.type,
    category: req.body.category,
    subject: req.body.subject,
    message: req.body.message,
    createdAt: new Date().toISOString(),
  };
  feedback.push(entry);
  res.status(201).json({ success: true, data: { id: entry.id } });
});

// Metrics / Transparency Dashboard
app.get('/api/v1/communications/metrics', optionalAuth, (req, res) => {
  const totalPolicies = POLICIES.length;
  const completed = POLICIES.filter(p => p.status === 'completed').length;
  const inProgress = POLICIES.filter(p => p.status === 'in_progress').length;
  const avgProgress = Math.round(POLICIES.reduce((sum, p) => sum + p.progress, 0) / totalPolicies);

  const byDepartment = Object.values(DEPARTMENTS).map(d => {
    const deptPolicies = POLICIES.filter(p => p.departmentId === d.id);
    const deptAvg = deptPolicies.length > 0
      ? Math.round(deptPolicies.reduce((sum, p) => sum + p.progress, 0) / deptPolicies.length)
      : 0;
    return { department: d.name, slug: d.slug, color: d.color, policyCount: deptPolicies.length, averageProgress: deptAvg };
  });

  res.json({
    success: true,
    data: {
      overview: { totalPolicies, completed, inProgress, averageProgress: avgProgress },
      byDepartment,
      lastUpdated: new Date().toISOString(),
    }
  });
});

// Events
app.get('/api/v1/events', optionalAuth, (req, res) => {
  const events = [
    { id: 'evt-1', title: 'Lease Workshop', date: '2026-02-15', time: '5:00 PM', location: 'Student Union', department: 'basic-needs' },
    { id: 'evt-2', title: 'Heels on the Hill', date: '2026-03-25', location: 'Raleigh, NC', department: 'state-external' },
    { id: 'evt-3', title: 'Carolina Day of Service', date: '2026-04-10', location: 'Various', department: 'civic-engagement' },
  ];
  res.json({ success: true, data: events });
});

// Cultural Calendar
app.get('/api/v1/dei/calendar', optionalAuth, (req, res) => {
  const events = [
    { id: 'cal-1', title: 'Black History Month Celebration', date: '2026-02-15', type: 'heritage' },
    { id: 'cal-2', title: 'Latinx Heritage Festival', date: '2026-09-20', type: 'cultural' },
    { id: 'cal-3', title: 'Asian American Heritage Week', date: '2026-05-01', type: 'heritage' },
  ];
  res.json({ success: true, data: events });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: 'Endpoint not found' } });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: { message: 'Internal server error' } });
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         PROJECT BOLD POLICY PLATFORM API                 ║
║              First, Best, For All                        ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on port ${PORT}                            ║
║  Health: http://localhost:${PORT}/health                   ║
║  Docs:   http://localhost:${PORT}/api/v1/policies          ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
