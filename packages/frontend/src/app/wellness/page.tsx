'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Brain,
  Shield,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  AlertCircle,
  Pill,
  Stethoscope,
  Users,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';

const categories = [
  { id: 'all', name: 'All Resources', icon: Heart },
  { id: 'caps', name: 'Mental Health', icon: Brain },
  { id: 'health', name: 'Medical', icon: Stethoscope },
  { id: 'safety', name: 'Safety', icon: Shield },
  { id: 'narcan', name: 'Narcan', icon: Pill },
  { id: 'plan_b', name: 'Plan B', icon: Pill },
];

const resources = [
  {
    id: 'caps-main',
    type: 'caps',
    name: 'CAPS Main Office',
    description: 'Individual and group counseling, crisis intervention, and psychiatric services.',
    location: 'James A. Taylor Building, 4th Floor',
    phone: '919-966-3658',
    hours: 'Mon-Fri 8am-5pm, 24/7 crisis line',
    url: 'https://caps.unc.edu',
    isEmergency: false,
  },
  {
    id: 'caps-crisis',
    type: 'caps',
    name: 'CAPS 24/7 Crisis Line',
    description: 'Immediate support for mental health crises, available any time day or night.',
    phone: '919-966-3658',
    hours: '24/7',
    isEmergency: true,
  },
  {
    id: 'campus-health',
    type: 'health',
    name: 'Campus Health Services',
    description: 'Primary care, immunizations, lab services, pharmacy, and specialty clinics.',
    location: 'James A. Taylor Building',
    phone: '919-966-2281',
    hours: 'Mon-Fri 8am-5pm',
    url: 'https://campushealth.unc.edu',
    isEmergency: false,
  },
  {
    id: 'safewalk',
    type: 'safety',
    name: 'SafeWalk',
    description: 'Free walking escort service for students on campus at night.',
    phone: '919-962-SAFE (7233)',
    hours: 'Nightly 8pm-2am (Fall/Spring)',
    isEmergency: false,
  },
  {
    id: 'unc-police',
    type: 'safety',
    name: 'UNC Police - Emergency',
    description: 'Campus law enforcement for emergencies and safety concerns.',
    phone: '911 or 919-962-8100',
    hours: '24/7',
    isEmergency: true,
  },
  {
    id: 'narcan-union',
    type: 'narcan',
    name: 'Narcan - Student Union',
    description: 'Free Narcan (naloxone) kits available. No questions asked.',
    location: 'Student Union, Front Desk',
    hours: '24/7',
    stockStatus: 'available',
    isEmergency: false,
  },
  {
    id: 'narcan-health',
    type: 'narcan',
    name: 'Narcan - Campus Health',
    description: 'Free Narcan with brief training on overdose response.',
    location: 'James A. Taylor Building',
    hours: 'Mon-Fri 8am-5pm',
    stockStatus: 'available',
    isEmergency: false,
  },
  {
    id: 'plan-b-pharmacy',
    type: 'plan_b',
    name: 'Plan B - Campus Health Pharmacy',
    description: 'Emergency contraception available without prescription.',
    location: 'James A. Taylor Building',
    hours: 'Mon-Fri 8am-5pm',
    stockStatus: 'available',
    isEmergency: false,
  },
  {
    id: 'plan-b-cvs',
    type: 'plan_b',
    name: 'Plan B - CVS Franklin St',
    description: 'Plan B available over-the-counter.',
    location: '137 E Franklin St',
    hours: 'Open 24 hours',
    stockStatus: 'available',
    isEmergency: false,
  },
];

const quickLinks = [
  {
    title: 'Schedule CAPS Appointment',
    description: 'Book a counseling session',
    url: 'https://caps.unc.edu/appointments',
    icon: Brain,
  },
  {
    title: 'Crisis Support (24/7)',
    description: '919-966-3658',
    url: 'tel:919-966-3658',
    icon: Phone,
    isEmergency: true,
  },
  {
    title: 'Patient Portal',
    description: 'View records and messages',
    url: 'https://campushealth.unc.edu/patient-portal',
    icon: Stethoscope,
  },
  {
    title: 'Request SafeWalk',
    description: '919-962-SAFE',
    url: 'tel:919-962-7233',
    icon: Users,
  },
];

export default function WellnessPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredResources = activeCategory === 'all'
    ? resources
    : resources.filter(r => r.type === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Student Wellness</h1>
          <p className="text-gray-600">
            Access mental health, medical, and safety resources. Your well-being matters.
          </p>
        </div>

        {/* Emergency Banner */}
        <div className="bg-bold-red text-white rounded-xl p-4 mb-8 flex items-center">
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">In a crisis or emergency?</p>
            <p className="text-sm text-red-100">
              Call 911 or CAPS 24/7 crisis line:{' '}
              <a href="tel:919-966-3658" className="underline font-medium">919-966-3658</a>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link) => (
            <a
              key={link.title}
              href={link.url}
              target={link.url.startsWith('http') ? '_blank' : undefined}
              rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={clsx(
                'card p-4 flex items-center hover:shadow-md transition-shadow',
                link.isEmergency && 'border-2 border-bold-red'
              )}
            >
              <div className={clsx(
                'w-12 h-12 rounded-lg flex items-center justify-center mr-4',
                link.isEmergency ? 'bg-red-100' : 'bg-carolina-blue-100'
              )}>
                <link.icon className={clsx(
                  'w-6 h-6',
                  link.isEmergency ? 'text-bold-red' : 'text-carolina-blue'
                )} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{link.title}</p>
                <p className="text-sm text-gray-500">{link.description}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={clsx(
                'flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeCategory === category.id
                  ? 'bg-carolina-blue text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.name}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className={clsx(
                'card p-6',
                resource.isEmergency && 'border-2 border-bold-red'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                  {resource.isEmergency && (
                    <span className="badge-red mt-1">Emergency Service</span>
                  )}
                </div>
                {resource.stockStatus && (
                  <span className={clsx(
                    'badge',
                    resource.stockStatus === 'available' ? 'badge-green' : 'badge-yellow'
                  )}>
                    {resource.stockStatus}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">{resource.description}</p>

              <div className="space-y-2 text-sm">
                {resource.location && (
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{resource.location}</span>
                  </div>
                )}
                {resource.phone && (
                  <div className="flex items-center text-gray-500">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <a href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`} className="hover:text-carolina-blue">
                      {resource.phone}
                    </a>
                  </div>
                )}
                {resource.hours && (
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{resource.hours}</span>
                  </div>
                )}
              </div>

              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-carolina-blue text-sm mt-4 hover:underline"
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Canvas Integration Notice */}
        <div className="mt-12 card p-6 bg-carolina-blue-50 border-carolina-blue">
          <div className="flex items-start">
            <div className="w-12 h-12 rounded-lg bg-carolina-blue flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-navy">Canvas Integration</h3>
              <p className="text-sm text-gray-600 mt-1">
                The "Student Wellness" button in Canvas links directly to these resources.
                Look for it in your course navigation or the global menu.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Policy #5 - Add a "Student Wellness" Button in Canvas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
