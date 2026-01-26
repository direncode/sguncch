/**
 * Project Bold Platform - Database Seed
 *
 * Seeds the database with initial data including:
 * - Departments from the Policy Book
 * - All 40 policies mapped to departments
 * - Sample locations
 * - Initial metrics
 */

import { db } from './index.js';
import { departments, policies, locations, wellnessResources, accountabilityMetrics } from './schema.js';
import { DEPARTMENTS, POLICIES } from '../types/index.js';
import { logger } from '../utils/logger.js';

async function seed() {
  logger.info('Starting database seed...');

  try {
    // ==========================================================================
    // SEED DEPARTMENTS
    // ==========================================================================
    logger.info('Seeding departments...');

    const departmentData = Object.values(DEPARTMENTS).map((dept, index) => ({
      id: dept.id,
      name: dept.name,
      slug: dept.slug,
      description: dept.description,
      color: dept.color,
      displayOrder: index,
    }));

    await db.insert(departments).values(departmentData).onConflictDoNothing();

    // ==========================================================================
    // SEED POLICIES
    // ==========================================================================
    logger.info('Seeding policies...');

    const policyData = Object.values(POLICIES).map(policy => ({
      id: policy.id,
      departmentId: policy.departmentId,
      policyNumber: policy.number,
      title: policy.title,
      shortTitle: policy.shortTitle,
      description: policy.description,
      status: 'proposed' as const,
      progress: 0,
      priority: policy.number,
    }));

    await db.insert(policies).values(policyData).onConflictDoNothing();

    // ==========================================================================
    // SEED LOCATIONS
    // ==========================================================================
    logger.info('Seeding locations...');

    const locationData = [
      {
        id: 'loc-student-union',
        name: 'Frank Porter Graham Student Union',
        address: '101 E Franklin St, Chapel Hill, NC 27514',
        building: 'Student Union',
        latitude: '35.9108',
        longitude: '-79.0520',
      },
      {
        id: 'loc-campus-health',
        name: 'Campus Health Services',
        address: 'James A. Taylor Bldg, Campus Box 7470',
        building: 'James A. Taylor Building',
        latitude: '35.9067',
        longitude: '-79.0483',
      },
      {
        id: 'loc-caps',
        name: 'Counseling and Psychological Services',
        address: 'James A. Taylor Bldg, 4th Floor',
        building: 'James A. Taylor Building',
        room: '4th Floor',
        latitude: '35.9067',
        longitude: '-79.0483',
      },
      {
        id: 'loc-davis-library',
        name: 'Davis Library',
        address: '208 Raleigh St, Chapel Hill, NC 27514',
        building: 'Davis Library',
        latitude: '35.9107',
        longitude: '-79.0478',
      },
      {
        id: 'loc-the-pit',
        name: 'The Pit',
        address: 'The Pit, UNC Campus',
        latitude: '35.9107',
        longitude: '-79.0508',
      },
      {
        id: 'loc-chase-hall',
        name: 'Chase Hall',
        address: 'Chase Hall, UNC Campus',
        building: 'Chase Hall',
        latitude: '35.9115',
        longitude: '-79.0467',
      },
    ];

    await db.insert(locations).values(locationData).onConflictDoNothing();

    // ==========================================================================
    // SEED WELLNESS RESOURCES
    // ==========================================================================
    logger.info('Seeding wellness resources...');

    const wellnessData = [
      {
        id: 'wr-caps-main',
        type: 'caps',
        name: 'CAPS Main Office',
        description: 'Counseling and Psychological Services offers individual and group counseling, crisis intervention, and psychiatric services.',
        locationId: 'loc-caps',
        contactPhone: '919-966-3658',
        contactEmail: 'caps@unc.edu',
        websiteUrl: 'https://caps.unc.edu',
        isVirtual: false,
        availability: 'Monday-Friday 8am-5pm, 24/7 crisis line available',
        waitTime: 'Same-day appointments available for urgent needs',
      },
      {
        id: 'wr-campus-health',
        type: 'health',
        name: 'Campus Health Services',
        description: 'Primary care, immunizations, lab services, pharmacy, and specialty clinics.',
        locationId: 'loc-campus-health',
        contactPhone: '919-966-2281',
        websiteUrl: 'https://campushealth.unc.edu',
        isVirtual: false,
        availability: 'Monday-Friday 8am-5pm',
      },
      {
        id: 'wr-safewalk',
        type: 'safety',
        name: 'SafeWalk',
        description: 'Free walking escort service for students on campus at night.',
        contactPhone: '919-962-SAFE',
        isVirtual: false,
        availability: 'Nightly 8pm-2am during fall and spring semesters',
      },
      {
        id: 'wr-narcan-union',
        type: 'narcan',
        name: 'Narcan Distribution - Student Union',
        description: 'Free Narcan (naloxone) kits available to all students.',
        locationId: 'loc-student-union',
        isVirtual: false,
        availability: '24/7 availability',
        stockStatus: 'available',
      },
      {
        id: 'wr-plan-b-pharmacy',
        type: 'plan_b',
        name: 'Emergency Contraception - Campus Health Pharmacy',
        description: 'Plan B and other emergency contraception available without prescription.',
        locationId: 'loc-campus-health',
        isVirtual: false,
        availability: 'Pharmacy hours: Monday-Friday 8am-5pm',
        stockStatus: 'available',
      },
    ];

    await db.insert(wellnessResources).values(wellnessData).onConflictDoNothing();

    // ==========================================================================
    // SEED ACCOUNTABILITY METRICS
    // ==========================================================================
    logger.info('Seeding accountability metrics...');

    const metricsData = [
      {
        departmentId: 'academic-affairs',
        metricName: 'Peer Mentorship Matches',
        metricDescription: 'Number of active mentor-mentee pairs in the network',
        currentValue: '0',
        targetValue: '500',
        unit: 'pairs',
        trend: 'stable',
        history: [],
      },
      {
        departmentId: 'basic-needs',
        metricName: 'Food Security Resources Accessed',
        metricDescription: 'Monthly student interactions with food resources',
        currentValue: '0',
        targetValue: '2000',
        unit: 'interactions',
        trend: 'stable',
        history: [],
      },
      {
        departmentId: 'civic-engagement',
        metricName: 'Total Service Hours Logged',
        metricDescription: 'Cumulative verified service hours this semester',
        currentValue: '0',
        targetValue: '10000',
        unit: 'hours',
        trend: 'stable',
        history: [],
      },
      {
        departmentId: 'dei',
        metricName: 'Cultural Events Hosted',
        metricDescription: 'Number of cultural events this semester',
        currentValue: '0',
        targetValue: '50',
        unit: 'events',
        trend: 'stable',
        history: [],
      },
      {
        departmentId: 'wellness-safety',
        metricName: 'Wellness Resource Views',
        metricDescription: 'Canvas wellness button clicks and resource page views',
        currentValue: '0',
        targetValue: '5000',
        unit: 'views',
        trend: 'stable',
        history: [],
      },
      {
        departmentId: 'environmental',
        metricName: 'Waste Diverted',
        metricDescription: 'Pounds of waste diverted through composting and donations',
        currentValue: '0',
        targetValue: '10000',
        unit: 'lbs',
        trend: 'stable',
        history: [],
      },
      {
        departmentId: 'state-external',
        metricName: 'Civic Engagement Events',
        metricDescription: 'Lobby days, legislator visits, and roundtables hosted',
        currentValue: '0',
        targetValue: '20',
        unit: 'events',
        trend: 'stable',
        history: [],
      },
      {
        departmentId: 'communications',
        metricName: 'Policy Progress Updates',
        metricDescription: 'Number of public progress updates published',
        currentValue: '0',
        targetValue: '100',
        unit: 'updates',
        trend: 'stable',
        history: [],
      },
    ];

    await db.insert(accountabilityMetrics).values(metricsData).onConflictDoNothing();

    logger.info('✅ Database seed completed successfully');
  } catch (error) {
    logger.error('Database seed failed', { error });
    throw error;
  }
}

// Run seed if executed directly
seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
