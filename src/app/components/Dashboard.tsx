// app/dashboard/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { CollegeData, SectionType } from '@/app/lib/gsap';
import { PortalLayout } from '@/app/components/layout/PortalLayout';
import { PreviewPane } from '@/app/components/PreviewModal';
import { AboutSection } from '@/app/components/sections/AboutSection';
import { FacultySection } from '@/app/components/sections/FacultySection';
import { EventsSection } from '@/app/components/sections/EventsSection';
import { GallerySection } from '@/app/components/sections/GallerySection';
import { CoursesSection } from '@/app/components/sections/CoursesSection';
import { ContactSection } from '@/app/components/sections/ContactSection';
import { HeroSection } from '@/app/components/sections/HeroSection';
import { NavbarSection } from '@/app/components/sections/NavbarSection';
import { ScholarshipsSection } from '@/app/components/sections/ScholarshipsSection';
import { FooterSection } from '@/app/components/sections/FooterSection';
import { StatsSection } from '@/app/components/sections/StatsSection';
import { AdmissionSection } from '@/app/components/sections/AdmissionSection';
import { AffiliationsSection } from '@/app/components/sections/AffilationsSections';
import { FormManagerSection } from '@/app/components/sections/FormManagerSection';
import { AboutCoursesHandler } from '@/app/components/sections/AboutCoursesHandler';
import { ScholarshipStatsHandler } from '@/app/components/sections/ScholarshipStatsHandler';
import { ProgramsStatsHandler } from '@/app/components/sections/ProgramsStatsHandler';
import { AboutStatsHandler } from '@/app/components/sections/AboutStatsHandler';
import { FacultyStatsHandler } from '@/app/components/sections/FacultyStatsHandler';

// ✅ Dynamic handlers
import { AboutJourneyManagement } from '@/app/components/sections/AboutJourneyManagement';
import { FAQSectionManagement } from '@/app/components/sections/FAQSectionManagement';
import { TestimonialsManagement } from '@/app/components/sections/TestimonialsManagement';
import { StudentLifeManagement } from '@/app/components/sections/StudentLifeManagement';

// ✅ NEW: Achievements
import { AchievementsManagement } from '@/app/components/sections/AchievementsManagement';

/* eslint-disable */

import {
  Lock,
  Bell,
  Eye,
  Grid3X3,
  Users,
  Calendar,
  Image,
  BookOpen,
  Phone,
  TrendingUp,
  Clock,
  Award,
  Star,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Sparkles,
  FormInput
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CoreValuesManagement from './sections/CoreValuesManagement';
import HowWeTeachManagement from './sections/HowWeTeachManagement';
import PrincipalMessageManagement from './sections/PrincipalMessageManagement';

interface DashboardProps {
  initialData: CollegeData;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetCollege: string;
  createdAt: string;
}

export interface College {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  modules: {
    about: boolean;
    faculty: boolean;
    events: boolean;
    gallery: boolean;
    achievements: boolean;
    courses: boolean;
    contact: boolean;
  };
  about?: any;
  faculty?: any;
  events?: any;
  gallery?: any;
  achievements?: any;
  courses?: any;
  contact?: any;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  country?: string;
  template_id?: number;
  template_name?: string;
}

interface AuthCollege {
  adminName: string;
  collegeId: string;
  collegeName: string;
  createdAt: string;
  email: string;
  password: string;
}

// Authentication check component
const AuthChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentCollegeId, setCurrentCollegeId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authCollege = localStorage.getItem('auth_college');

      if (!authCollege) {
        setIsAuthenticated(false);
        router.push('/College_Portfolio_Handler/login');
        return;
      }

      try {
        const authData: AuthCollege = JSON.parse(authCollege);
        setCurrentCollegeId(authData.collegeId);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('auth_college');
        setIsAuthenticated(false);
        router.push('/College_Portfolio_Handler/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin mx-auto mb-4"></div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

/* ========== STATS CARDS ========== */
const StatsCards: React.FC = () => {
  const stats = [
    {
      id: 1,
      title: 'Total Students',
      value: '2,547',
      change: '+12.5%',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-800',
      period: 'vs last month'
    },
    {
      id: 2,
      title: 'Faculty Members',
      value: '128',
      change: '+4.2%',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-100 dark:bg-purple-800',
      period: 'vs last month'
    },
    {
      id: 3,
      title: 'Courses Offered',
      value: '42',
      change: '+8.3%',
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-800',
      period: 'vs last month'
    },
    {
      id: 4,
      title: 'Events This Year',
      value: '24',
      change: '+32%',
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-800',
      iconBg: 'bg-orange-100 dark:bg-orange-800',
      period: 'vs last year'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-800 dark:to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
            <Sparkles className="absolute top-4 right-4 w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-xl", stat.iconBg)}>
                  <Icon className={cn("w-6 h-6", stat.textColor)} />
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                  stat.change.startsWith('+')
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                )}>
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>

              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</h3>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <Activity className="w-5 h-5 text-gray-300 dark:text-gray-600" />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {stat.period}
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800">
              <div className={cn("h-full bg-gradient-to-r", stat.color)} style={{ width: `${Math.random() * 40 + 60}%` }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* Quick Stats Row */
const QuickStats: React.FC = () => {
  const quickStats = [
    { label: 'Placement Rate', value: '94%', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Student Satisfaction', value: '4.8/5', icon: Star, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Research Papers', value: '156', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Live Projects', value: '23', icon: Zap, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {quickStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <Icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* Announcements Section */
const AnnouncementsSection: React.FC<{ announcements: Announcement[] }> = ({ announcements }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
        <Bell className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Announcements</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Latest updates from administration</p>
      </div>
      {announcements.length > 0 && (
        <span className="ml-auto bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
          {announcements.length} New
        </span>
      )}
    </div>

    {announcements.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No announcements yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for updates</p>
      </div>
    ) : (
      <div className="space-y-4">
        {announcements.map((announcement, index) => (
          <div
            key={announcement.id}
            className={cn(
              'p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
              index === 0
                ? 'border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/20 dark:to-transparent'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight">{announcement.title}</h4>
              {index === 0 && (
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> New
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{announcement.message}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(announcement.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* Status Card */
const StatusCard: React.FC<{ status: 'active' | 'inactive'; collegeName: string; collegeDetails?: any }> = ({
  status,
  collegeName,
  collegeDetails
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-800 dark:to-transparent rounded-bl-full opacity-50"></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl",
            status === 'active' ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-gray-500 to-gray-600'
          )}>
            {status === 'active' ? <Zap className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{collegeName}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
              <span>Principal Portal Dashboard</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>ID: {collegeDetails?.id}</span>
            </p>
          </div>
        </div>
        <div className={cn(
          'px-4 py-2 rounded-full text-sm font-medium border-2 flex items-center gap-2',
          status === 'active'
            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
        )}>
          {status === 'active' ? <Activity className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {status === 'active' ? 'Active' : 'Inactive'}
        </div>
      </div>

      {collegeDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {collegeDetails.email && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{collegeDetails.email}</p>
            </div>
          )}
          {collegeDetails.phone && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{collegeDetails.phone}</p>
            </div>
          )}
          {collegeDetails.city && collegeDetails.country && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{collegeDetails.city}, {collegeDetails.country}</p>
            </div>
          )}
          {collegeDetails.template_name && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Template</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{collegeDetails.template_name}</p>
            </div>
          )}
        </div>
      )}

      {status === 'inactive' && (
        <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
            <Lock className="w-5 h-5" />
            <p className="text-sm font-medium">Portal Access Restricted</p>
          </div>
          <p className="text-red-600 dark:text-red-300 text-sm mt-2 leading-relaxed">
            Your college portal is currently locked. Please contact{' '}
            <a href="https://nesticktech.com" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-red-800 dark:hover:text-red-200 transition-colors">
              nesticktech.com
            </a>{' '}
            to enable access.
          </p>
        </div>
      )}
    </div>
  </div>
);

/* Section Components */
const sectionComponents: Record<SectionType, React.ComponentType<any>> = {
  dashboard: () => null,
  about: AboutSection,
  faculty: FacultySection,
  events: EventsSection,
  gallery: GallerySection,
  courses: CoursesSection,
  contact: ContactSection,
  hero: HeroSection,
  navbar: NavbarSection,
  scholarships: ScholarshipsSection,
  programs: CoursesSection,
  footer: FooterSection,
  stats: StatsSection,
  admission: AdmissionSection,
  affiliations: AffiliationsSection,
  formmanager: FormManagerSection,
  aboutcourses: AboutCoursesHandler,
  scholarshipstats: ScholarshipStatsHandler,
  programsstats: ProgramsStatsHandler,
  aboutstats: AboutStatsHandler,
  facultystats: FacultyStatsHandler,
  // ✅ Dynamic handlers
  aboutjourney: AboutJourneyManagement,
  faq: FAQSectionManagement,
  testimonials: TestimonialsManagement,
  corevalues: CoreValuesManagement,
  howweteach: HowWeTeachManagement,
  principalmessage: PrincipalMessageManagement,
  studentlife: StudentLifeManagement,
  // ✅ NEW: Achievements
  achievements: AchievementsManagement,
  flexible: () => (
    <div className="text-gray-500 dark:text-gray-500 text-center py-16">
      <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p className="text-sm">Flexible section content</p>
    </div>
  ),
};

const normalizeSectionKey = (section: string): SectionType => {
  const normalized = section.toLowerCase().trim().replace(/[\s&/]+/g, '_').replace(/[^a-z0-9_]+/g, '').replace(/_+/g, '_').replace(/^_|_$/g, '');

  const aliases: Record<string, SectionType> = {
    dashboard: 'dashboard',
    about: 'about',
    about_us: 'about',
    faculty: 'faculty',
    faculty_members: 'faculty',
    events: 'events',
    gallery: 'gallery',
    courses: 'courses',
    programs: 'programs',
    contact: 'contact',
    contact_us: 'contact',
    hero: 'hero',
    hero_section: 'hero',
    navbar: 'navbar',
    navigation_bar: 'navbar',
    scholarships: 'scholarships',
    scholarships_financial_aid: 'scholarships',
    footer: 'footer',
    footer_section: 'footer',
    stats: 'stats',
    statistics: 'stats',
    admission: 'admission',
    admissions: 'admission',
    affiliations: 'affiliations',
    accreditation: 'affiliations',
    formmanager: 'formmanager',
    form_manager: 'formmanager',
    forms: 'formmanager',
    aboutcourses: 'aboutcourses',
    about_courses: 'aboutcourses',
    about_course: 'aboutcourses',
    scholarshipstats: 'scholarshipstats',
    scholarship_stat: 'scholarshipstats',
    scholarship_stats: 'scholarshipstats',
    programsstats: 'programsstats',
    program_stats: 'programsstats',
    programs_stat: 'programsstats',
    aboutstats: 'aboutstats',
    about_stat: 'aboutstats',
    about_stats: 'aboutstats',
    facultystats: 'facultystats',
    faculty_stats: 'facultystats',
    facultystat: 'facultystats',
    // ✅ Dynamic
    aboutjourney: 'aboutjourney',
    about_journey: 'aboutjourney',
    our_journey: 'aboutjourney',
    journey: 'aboutjourney',
    faq: 'faq',
    faqs: 'faq',
    frequently_asked_questions: 'faq',
    testimonials: 'testimonials',
    testimonial: 'testimonials',
    reviews: 'testimonials',
    student_testimonials: 'testimonials',
    flexible: 'flexible',
    corevalues: 'corevalues',
    core_values: 'corevalues',
    values: 'corevalues',
    howweteach: 'howweteach',
    how_we_teach: 'howweteach',
    methodology: 'howweteach',
    learning_methodology: 'howweteach',
    principalmessage: 'principalmessage',
    principal_message: 'principalmessage',
    principals_message: 'principalmessage',
    message: 'principalmessage',
    studentlife: 'studentlife',
    student_life: 'studentlife',
    campus_life: 'studentlife',
    life_at_campus: 'studentlife',
    // ✅ NEW: Achievements
    achievements: 'achievements',
    achievement: 'achievements',
    milestones: 'achievements',
    milestone: 'achievements',
    our_achievements: 'achievements',
    proud_moments: 'achievements',
    success_stories: 'achievements',
  };

  return aliases[normalized] || 'dashboard';
};

function DashboardContent({ initialData }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionType>('hero');
  const [collegeData, setCollegeData] = useState<CollegeData>(initialData);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCollegeId, setCurrentCollegeId] = useState<string | null>(null);
  const [collegeDetails, setCollegeDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gsap.fromTo('.section-content', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  }, [activeSection]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const authCollege = localStorage.getItem('auth_college');
    if (authCollege) {
      try {
        const parsed: AuthCollege = JSON.parse(authCollege);
        setCurrentCollegeId(parsed.collegeId);
      } catch (error) {
        console.error('Error parsing auth_college:', error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentCollegeId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/college/dashboard-data?collegeId=${currentCollegeId}`);
        const data = await response.json();

        if (data.success) {
          setCollegeDetails(data.college);
          setCollegeData(prev => ({
            ...prev,
            college: {
              ...prev.college,
              id: data.college.id,
              name: data.college.name,
              status: data.college.status,
              email: data.college.email,
              phone: data.college.phone,
              website: data.college.website,
              city: data.college.city,
              country: data.college.country,
              template_id: data.college.template_id,
              template_name: data.college.template_name
            }
          }));
          setAnnouncements(data.announcements);
          localStorage.setItem('college_data', JSON.stringify({ college: data.college, announcements: data.announcements }));
        } else {
          setError(data.error || 'Failed to load dashboard data');
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Network error. Loading cached data...');
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    }

    function loadFromLocalStorage() {
      const cached = localStorage.getItem('college_data');
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setCollegeDetails(cachedData.college);
          setCollegeData(prev => ({ ...prev, college: { ...prev.college, ...cachedData.college } }));
          setAnnouncements(cachedData.announcements || []);
        } catch (e) {
          console.error('Error parsing cached data:', e);
        }
      }
    }

    fetchDashboardData();
  }, [currentCollegeId]);

  const persistCollegeToLocal = (updatedCollege: College) => {
    if (typeof window === 'undefined' || !currentCollegeId) return;

    const rawColleges = localStorage.getItem('colleges');
    const colleges: College[] = rawColleges ? JSON.parse(rawColleges) : [];

    const idx = colleges.findIndex((c) => c.id === currentCollegeId);
    if (idx >= 0) colleges[idx] = updatedCollege;
    else colleges.push(updatedCollege);

    localStorage.setItem('colleges', JSON.stringify(colleges));
  };

  const updateSectionData = (section: SectionType, data: any) => {
    if (!currentCollegeId) return;

    setCollegeData((prev) => {
      const updated = structuredClone(prev);
      if (section === 'about') updated.college = { ...updated.college, ...data };
      else (updated as any)[section] = data;

      persistCollegeToLocal({
        id: currentCollegeId,
        name: updated.college.name,
        status: (updated.college as any).status,
        modules: { ...updated.college as any }.modules,
      });

      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin mx-auto mb-4"></div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 rounded-xl hover:shadow-lg transition-all duration-300 font-medium">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentCollegeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">College Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Unable to load college information.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 rounded-xl hover:shadow-lg transition-all duration-300 font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const collegeStatus = collegeDetails?.status || (collegeData.college as any)?.status || 'active';
  const collegeName = collegeDetails?.name || collegeData.college?.name || 'College Portal';

  if (collegeStatus === 'inactive') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Portal Locked</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Your college portal is currently locked. Please contact administration to enable access.
          </p>
          <a href="https://nesticktech.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 rounded-xl hover:shadow-lg transition-all duration-300 font-medium">
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  const ActiveComponent = sectionComponents[activeSection];
  const sectionData = activeSection === 'about' ? collegeData.college : activeSection === 'contact' ? collegeData.college?.contact : (collegeData as any)[activeSection];

  const handleSectionChange = (section: SectionType | string) => {
    setActiveSection(normalizeSectionKey(section));
  };

  return (
    <PortalLayout
      logo={collegeData.college?.logo || ''}
      onPreview={() => setIsPreviewOpen(true)}
      activeSection={activeSection}
      onSectionChange={(s) => handleSectionChange(s)}
    >
      {activeSection === 'dashboard' ? (
        <div className="space-y-8">
          <StatusCard status={collegeStatus} collegeName={collegeName} collegeDetails={collegeDetails} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-500" /> College Overview
            </h3>
            <StatsCards />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gray-500" /> Quick Insights
            </h3>
            <QuickStats />
          </div>
          <AnnouncementsSection announcements={announcements} />
        </div>
      ) : activeSection === 'principalmessage' ? (
        <PrincipalMessageManagement college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'about' ? (
        <AboutSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'gallery' ? (
        <GallerySection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'hero' ? (
        <HeroSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'navbar' ? (
        <NavbarSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'scholarships' ? (
        <ScholarshipsSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'programs' ? (
        <CoursesSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'courses' ? (
        <CoursesSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'footer' ? (
        <FooterSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'stats' ? (
        <StatsSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'admission' ? (
        <AdmissionSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'affiliations' ? (
        <AffiliationsSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'formmanager' ? (
        <FormManagerSection college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'aboutcourses' ? (
        <AboutCoursesHandler college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'scholarshipstats' ? (
        <ScholarshipStatsHandler college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'programsstats' ? (
        <ProgramsStatsHandler college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'aboutstats' ? (
        <AboutStatsHandler college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'corevalues' ? (
        <CoreValuesManagement college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'facultystats' ? (
        <FacultyStatsHandler college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'aboutjourney' ? (
        <AboutJourneyManagement college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'howweteach' ? (
        <HowWeTeachManagement college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'faq' ? (
        <FAQSectionManagement college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'testimonials' ? (
        <TestimonialsManagement college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'studentlife' ? (
        <StudentLifeManagement college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : activeSection === 'achievements' ? (
        <AchievementsManagement college={collegeData.college} templateId={collegeDetails?.template_id} />
      ) : ActiveComponent ? (
        <ActiveComponent
          data={sectionData}
          onUpdate={(data: any) => updateSectionData(activeSection, data)}
          college={collegeData.college}
          templateId={collegeDetails?.template_id}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
          This section is not available yet.
        </div>
      )}

      <PreviewPane isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} data={collegeData} />
    </PortalLayout>
  );
}

export default function DashboardPage({ initialData }: DashboardProps) {
  return (
    <AuthChecker>
      <DashboardContent initialData={initialData} />
    </AuthChecker>
  );
}