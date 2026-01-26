'use client';

import Link from 'next/link';
import {
  GraduationCap,
  Heart,
  Users,
  Palette,
  Shield,
  Leaf,
  Building2,
  Megaphone,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { DEPARTMENTS, PROJECT_BOLD_VALUES, PROJECT_BOLD_PRIORITIES } from '@project-bold/shared';

const departmentIcons: Record<string, React.ReactNode> = {
  'academic-affairs': <GraduationCap className="w-6 h-6" />,
  'basic-needs': <Heart className="w-6 h-6" />,
  'civic-engagement': <Users className="w-6 h-6" />,
  'dei': <Palette className="w-6 h-6" />,
  'wellness-safety': <Shield className="w-6 h-6" />,
  'environmental': <Leaf className="w-6 h-6" />,
  'state-external': <Building2 className="w-6 h-6" />,
  'communications': <Megaphone className="w-6 h-6" />,
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-bold text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Project Bold
          </h1>
          <p className="text-xl md:text-2xl text-carolina-blue-100 mb-4">
            First, Best, For All
          </p>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
            A unified policy platform for UNC Student Government, building a Carolina
            that leads not only in prestige, but in purpose.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
              Go to Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/policies" className="btn bg-white/10 text-white hover:bg-white/20 text-lg px-8 py-3">
              View All Policies
            </Link>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100L60 91.7C120 83.3 240 66.7 360 58.3C480 50 600 50 720 54.2C840 58.3 960 66.7 1080 66.7C1200 66.7 1320 58.3 1380 54.2L1440 50V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-navy mb-4">Our Values</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            The principles that guide everything we do
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.values(PROJECT_BOLD_VALUES).map((value) => (
              <div key={value.name} className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-carolina-blue-100 flex items-center justify-center">
                  <span className="text-2xl">
                    {value.name === 'Courage' && '💪'}
                    {value.name === 'Community' && '🤝'}
                    {value.name === 'Accountability' && '✓'}
                    {value.name === 'Equity' && '⚖️'}
                    {value.name === 'Innovation' && '💡'}
                  </span>
                </div>
                <h3 className="font-semibold text-navy">{value.name}</h3>
                <p className="text-sm text-gray-500 mt-1 hidden md:block">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-navy mb-4">Departments</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            8 departments working together to serve every Tar Heel
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(DEPARTMENTS).map((dept) => (
              <Link
                key={dept.id}
                href={`/departments/${dept.slug}`}
                className="card-hover p-6 group"
                style={{ borderLeftColor: dept.color, borderLeftWidth: '4px' }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${dept.color}20` }}
                >
                  <span style={{ color: dept.color }}>
                    {departmentIcons[dept.slug]}
                  </span>
                </div>
                <h3 className="font-semibold text-navy group-hover:text-carolina-blue transition-colors">
                  {dept.name.replace('Department of ', '').replace('Office of ', '')}
                </h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {dept.description}
                </p>
                <div className="flex items-center text-carolina-blue text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Policies
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Access</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/wellness" className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors">
              <Shield className="w-8 h-8 text-carolina-blue mb-4" />
              <h3 className="font-semibold text-lg mb-2">Student Wellness</h3>
              <p className="text-gray-300 text-sm">Mental health, safety, and health resources</p>
            </Link>
            <Link href="/mentorship" className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors">
              <Users className="w-8 h-8 text-carolina-blue mb-4" />
              <h3 className="font-semibold text-lg mb-2">Peer Mentorship</h3>
              <p className="text-gray-300 text-sm">Connect with a mentor or become one</p>
            </Link>
            <Link href="/food-resources" className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors">
              <Heart className="w-8 h-8 text-carolina-blue mb-4" />
              <h3 className="font-semibold text-lg mb-2">Food Resources</h3>
              <p className="text-gray-300 text-sm">Pantries, markets, and meal programs</p>
            </Link>
            <Link href="/transparency" className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors">
              <Building2 className="w-8 h-8 text-carolina-blue mb-4" />
              <h3 className="font-semibold text-lg mb-2">Accountability</h3>
              <p className="text-gray-300 text-sm">Track our progress on every policy</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-carolina-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">Together, We Go Bold</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            This policy vision is an invitation—to imagine a University that leads not only in prestige,
            but in purpose; not only in excellence, but in care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/feedback" className="btn-primary">
              Share Your Feedback
            </Link>
            <Link href="/get-involved" className="btn-outline">
              Get Involved
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
