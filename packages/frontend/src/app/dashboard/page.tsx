'use client';

import Link from 'next/link';
import {
  GraduationCap,
  Heart,
  Users,
  Shield,
  Calendar,
  Bell,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { DEPARTMENTS, POLICIES } from '@project-bold/shared';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  // Quick stats (would come from API in production)
  const stats = {
    policiesTotal: Object.keys(POLICIES).length,
    policiesInProgress: 12,
    policiesCompleted: 3,
    mentorshipMatches: 0,
    serviceHours: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-carolina-blue to-navy rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isAuthenticated && user
                  ? `Welcome back, ${user.firstName}!`
                  : 'Welcome to Project Bold'}
              </h1>
              <p className="text-carolina-blue-100">
                {isAuthenticated
                  ? 'Here\'s what\'s happening with your Carolina experience.'
                  : 'Sign in to access personalized features and track your engagement.'}
              </p>
            </div>
            {!isAuthenticated && (
              <button
                onClick={() => login('student')}
                className="mt-4 md:mt-0 btn bg-white text-navy hover:bg-gray-100"
              >
                Sign in with Onyen
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Policies</p>
                <p className="text-3xl font-bold text-navy">{stats.policiesTotal}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-carolina-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-carolina-blue" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-3xl font-bold text-bold-gold">{stats.policiesInProgress}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-bold-gold" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-bold-green">{stats.policiesCompleted}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-bold-green" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Departments</p>
                <p className="text-3xl font-bold text-navy">{Object.keys(DEPARTMENTS).length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-navy/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-navy" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/wellness"
                  className="flex items-center p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors group"
                >
                  <Shield className="w-8 h-8 text-bold-red mr-4" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Student Wellness</p>
                    <p className="text-sm text-gray-500">Access health & safety resources</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>
                <Link
                  href="/mentorship"
                  className="flex items-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
                >
                  <GraduationCap className="w-8 h-8 text-carolina-blue mr-4" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Peer Mentorship</p>
                    <p className="text-sm text-gray-500">Find or become a mentor</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>
                <Link
                  href="/food-resources"
                  className="flex items-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
                >
                  <Heart className="w-8 h-8 text-bold-green mr-4" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Food Resources</p>
                    <p className="text-sm text-gray-500">Pantries, markets & more</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>
                <Link
                  href="/civic/service-hours"
                  className="flex items-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group"
                >
                  <Users className="w-8 h-8 text-bold-purple mr-4" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Service Hours</p>
                    <p className="text-sm text-gray-500">Log volunteer time</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>
              </div>
            </div>

            {/* Policy Progress */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-navy">Policy Progress</h2>
                <Link href="/policies" className="text-sm text-carolina-blue hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {Object.values(POLICIES).slice(0, 5).map((policy) => (
                  <div key={policy.id} className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {policy.shortTitle}
                      </p>
                      <p className="text-xs text-gray-500">{policy.departmentId}</p>
                    </div>
                    <div className="ml-4 w-32">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '15%' }} />
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-500 w-10 text-right">15%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Announcements */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-navy">Announcements</h2>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-carolina-blue pl-4">
                  <p className="text-sm font-medium text-gray-900">Platform Launch</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Welcome to Project Bold! Explore our policy platform.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Today</p>
                </div>
                <div className="border-l-4 border-bold-green pl-4">
                  <p className="text-sm font-medium text-gray-900">Mentorship Open</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Peer mentorship matching is now available.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">2 days ago</p>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-navy">Upcoming Events</h2>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-carolina-blue-100 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-carolina-blue">FEB</span>
                    <span className="text-lg font-bold text-navy">15</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Lease Workshop</p>
                    <p className="text-xs text-gray-500">5:00 PM - Student Union</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-bold-green/20 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-bold-green">MAR</span>
                    <span className="text-lg font-bold text-navy">25</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Heels on the Hill</p>
                    <p className="text-xs text-gray-500">Raleigh, NC</p>
                  </div>
                </div>
              </div>
              <Link href="/events" className="block text-sm text-carolina-blue hover:underline mt-4 text-center">
                View all events
              </Link>
            </div>

            {/* Role-Based Features */}
            {isAuthenticated && user?.roles?.includes('senator') && (
              <div className="card p-6 border-l-4 border-bold-purple">
                <h2 className="text-lg font-semibold text-navy mb-4">Senator Tools</h2>
                <div className="space-y-2">
                  <Link href="/civic/service-hours" className="block text-sm text-gray-600 hover:text-carolina-blue">
                    Log Service Hours (4 required)
                  </Link>
                  <Link href="/policies/progress" className="block text-sm text-gray-600 hover:text-carolina-blue">
                    Update Policy Progress
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
