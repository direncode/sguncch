'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DEPARTMENTS, POLICIES, BRANDING } from '@project-bold/shared';
import { clsx } from 'clsx';

// Mock progress data (would come from API)
const mockProgress: Record<string, { progress: number; status: string }> = {
  'aa-1': { progress: 25, status: 'in_progress' },
  'aa-2': { progress: 10, status: 'in_progress' },
  'ws-5': { progress: 40, status: 'in_progress' },
  'bn-2': { progress: 30, status: 'in_progress' },
  'ce-4': { progress: 15, status: 'in_progress' },
};

const statusColors = {
  proposed: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
  deferred: 'bg-purple-100 text-purple-700',
};

const statusLabels = {
  proposed: 'Proposed',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
  deferred: 'Deferred',
};

export default function TransparencyPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Calculate statistics
  const allPolicies = Object.values(POLICIES);
  const totalPolicies = allPolicies.length;

  const statusCounts = allPolicies.reduce((acc, policy) => {
    const status = mockProgress[policy.id]?.status || 'proposed';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalProgress = allPolicies.reduce((sum, policy) => {
    return sum + (mockProgress[policy.id]?.progress || 0);
  }, 0);
  const averageProgress = Math.round(totalProgress / totalPolicies);

  // Department statistics
  const departmentStats = Object.values(DEPARTMENTS).map(dept => {
    const deptPolicies = allPolicies.filter(p => p.departmentId === dept.slug);
    const deptProgress = deptPolicies.reduce(
      (sum, p) => sum + (mockProgress[p.id]?.progress || 0),
      0
    );
    const avgProgress = deptPolicies.length > 0
      ? Math.round(deptProgress / deptPolicies.length)
      : 0;

    return {
      ...dept,
      policyCount: deptPolicies.length,
      averageProgress: avgProgress,
      completedCount: deptPolicies.filter(
        p => mockProgress[p.id]?.status === 'completed'
      ).length,
    };
  });

  // Filter policies
  let filteredPolicies = allPolicies;
  if (selectedDepartment) {
    filteredPolicies = filteredPolicies.filter(p => p.departmentId === selectedDepartment);
  }
  if (selectedStatus) {
    filteredPolicies = filteredPolicies.filter(p => {
      const status = mockProgress[p.id]?.status || 'proposed';
      return status === selectedStatus;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Accountability Dashboard</h1>
          <p className="text-gray-600">
            Tracking progress on all {totalPolicies} policies. Transparency is accountability.
          </p>
          <p className="text-sm text-carolina-blue mt-1 font-medium">
            {BRANDING.TAGLINE}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Policies</p>
                <p className="text-3xl font-bold text-navy">{totalPolicies}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-carolina-blue-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-carolina-blue" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Progress</p>
                <p className="text-3xl font-bold text-carolina-blue">{averageProgress}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-carolina-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-carolina-blue" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-3xl font-bold text-bold-gold">{statusCounts.in_progress || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-bold-gold" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-bold-green">{statusCounts.completed || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-bold-green" />
              </div>
            </div>
          </div>
        </div>

        {/* Department Progress */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-navy mb-6">Progress by Department</h2>
          <div className="space-y-4">
            {departmentStats.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(
                  selectedDepartment === dept.slug ? null : dept.slug
                )}
                className={clsx(
                  'w-full text-left p-4 rounded-lg border-2 transition-colors',
                  selectedDepartment === dept.slug
                    ? 'border-carolina-blue bg-carolina-blue-50'
                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="font-medium text-gray-900">
                      {dept.name.replace('Department of ', '').replace('Office of ', '')}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({dept.policyCount} policies)
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-navy">
                    {dept.averageProgress}%
                  </span>
                </div>
                <div className="progress-bar h-3">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${dept.averageProgress}%`,
                      backgroundColor: dept.color,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center text-gray-500">
            <Filter className="w-5 h-5 mr-2" />
            <span className="text-sm">Filter:</span>
          </div>
          <select
            value={selectedDepartment || ''}
            onChange={(e) => setSelectedDepartment(e.target.value || null)}
            className="input py-2 px-3 w-auto"
          >
            <option value="">All Departments</option>
            {Object.values(DEPARTMENTS).map((dept) => (
              <option key={dept.id} value={dept.slug}>
                {dept.name.replace('Department of ', '').replace('Office of ', '')}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="input py-2 px-3 w-auto"
          >
            <option value="">All Statuses</option>
            <option value="proposed">Proposed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
            <option value="deferred">Deferred</option>
          </select>
          {(selectedDepartment || selectedStatus) && (
            <button
              onClick={() => {
                setSelectedDepartment(null);
                setSelectedStatus(null);
              }}
              className="text-sm text-carolina-blue hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Policies List */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPolicies.map((policy) => {
                  const progress = mockProgress[policy.id]?.progress || 0;
                  const status = mockProgress[policy.id]?.status || 'proposed';
                  const dept = Object.values(DEPARTMENTS).find(d => d.slug === policy.departmentId);

                  return (
                    <tr key={policy.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{policy.shortTitle}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{policy.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: dept?.color }}
                          />
                          <span className="text-sm text-gray-600">
                            {dept?.name.replace('Department of ', '').replace('Office of ', '')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          'badge',
                          statusColors[status as keyof typeof statusColors]
                        )}>
                          {statusLabels[status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center w-32">
                          <div className="flex-1 progress-bar mr-2">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-10 text-right">
                            {progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/policies/${policy.id}`}
                          className="text-carolina-blue hover:underline text-sm inline-flex items-center"
                        >
                          View
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accountability Statement */}
        <div className="mt-8 card p-6 bg-navy text-white">
          <h3 className="text-lg font-semibold mb-2">Our Commitment to Accountability</h3>
          <p className="text-gray-300 text-sm">
            "Through this campaign, the Office of Communications will establish measurable outcomes
            for every project: this includes clear benchmarks, timelines, and success indicators that
            students can track. Accountability is not optional; it's the difference between making
            promises and making progress."
          </p>
          <p className="text-carolina-blue mt-4 text-sm font-medium">
            — Initiative #6, Office of Communications
          </p>
        </div>
      </div>
    </div>
  );
}
