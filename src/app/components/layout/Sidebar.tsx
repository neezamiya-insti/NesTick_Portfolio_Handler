'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SectionType } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import {
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { cn } from '@/lib/utils';
/* eslint-disable */
interface SidebarProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  onPreview: () => void;
  modules?: string[];
}

interface Section {
  id: string;
  name: string;
}

export function Sidebar({ activeSection, onSectionChange, onPreview, modules = [] }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [sections, setSections] = React.useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collegeName, setCollegeName] = useState<string>('College Name');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Fetch active sections from API
  useEffect(() => {
    async function fetchActiveSections() {
      try {
        setLoading(true);

        // Get logged in college from localStorage
        const authCollegeStr = localStorage.getItem('auth_college');
        if (!authCollegeStr) {
          setError('No college logged in');
          setLoading(false);
          return;
        }

        const authCollege = JSON.parse(authCollegeStr);
        const email = authCollege.email;

        // Set college name from localStorage
        if (authCollege.name) {
          setCollegeName(authCollege.name);
        }

        if (!email) {
          setError('College email not found');
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/sections/active_sectionsc?email=${encodeURIComponent(email)}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch sections');
        }

        const data = await res.json();

        console.log('Active sections response:', data);

        // Format sections from API response
        let formattedSections: Section[] = [];

        if (Array.isArray(data.sections)) {
          if (data.sections.length > 0 && typeof data.sections[0] === 'object') {
            formattedSections = data.sections
              .filter((section: any) => section.is_active === true)
              .map((section: any) => ({
                id: section.name.toLowerCase().replace(/\s+/g, '_'),
                name: section.name.charAt(0).toUpperCase() + section.name.slice(1).replace(/_/g, ' '),
              }));
          } else {
            formattedSections = data.sections.map((sectionName: string) => ({
              id: sectionName.toLowerCase().replace(/\s+/g, '_'),
              name: sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace(/_/g, ' '),
            }));
          }
        }

        // Always add dashboard if not present
        if (!formattedSections.some((s: any) => s.id === 'dashboard')) {
          formattedSections.unshift({ id: 'dashboard', name: 'Dashboard' });
        }

        setSections(formattedSections);

        // Update localStorage with sections
        localStorage.setItem('college_sections', JSON.stringify(formattedSections));
      } catch (err: any) {
        console.error('Error fetching active sections:', err);
        setError(err.message || 'Failed to load sections');

        // Fallback: Try to get from localStorage
        const cachedSections = localStorage.getItem('college_sections');
        if (cachedSections) {
          setSections(JSON.parse(cachedSections));
        } else {
          setSections([{ id: 'dashboard', name: 'Dashboard' }]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchActiveSections();
  }, []);

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    return sections.filter((section) =>
      section.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [sections, search]);

  // Group filtered sections alphabetically by first letter
  const groupedSections = useMemo(() => {
    const groups: Record<string, Section[]> = {};

    filteredSections.forEach((section) => {
      const firstLetter = section.name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#';

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(section);
    });

    // Sort groups A → Z, with '#' last
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });

    return sortedKeys.map((key) => ({
      letter: key,
      sections: groups[key].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [filteredSections]);

  // Initialize all groups as expanded when sections or search changes
  useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = {};
      groupedSections.forEach((group) => {
        // Preserve existing open state, default to true
        next[group.letter] = prev[group.letter] !== undefined ? prev[group.letter] : true;
      });
      return next;
    });
  }, [groupedSections]);

  const toggleGroup = (letter: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [letter]: !prev[letter],
    }));
  };

  // Split college name into words for wrapping
  const nameWords = collegeName.split(' ');
  const firstTwoWords = nameWords.slice(0, 2).join(' ');
  const remainingWords = nameWords.slice(2).join(' ');

  // Loading state
  if (loading) {
    return (
      <aside
        className={cn(
          'flex flex-col justify-between min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-md',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </aside>
    );
  }

  // Error state
  if (error && sections.length === 0) {
    return (
      <aside
        className={cn(
          'flex flex-col justify-between min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-md',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="p-4 text-center text-red-600 dark:text-red-400">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 text-gray-500">Showing dashboard only</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-4 items-start">
          <button
            onClick={() => onSectionChange('dashboard' as SectionType)}
            className={cn(
              'group flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium w-full text-left cursor-pointer transition-all duration-300 hover:scale-[1.02]',
              activeSection === 'dashboard'
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-l-4 border-gray-900 dark:border-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            {!isCollapsed && <span>Dashboard</span>}
          </button>
        </nav>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'flex flex-col justify-between min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-md transition-all duration-500 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header with Real College Name - Wrapped */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <div className="flex-1 min-w-0">
            <div className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              <span className="block">{firstTwoWords}</span>
              {remainingWords && (
                <span className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {remainingWords}
                </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-2xl font-bold text-gray-900 dark:text-white cursor-default">
            {collegeName.charAt(0).toUpperCase()}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 cursor-pointer flex-shrink-0"
        >
          {isCollapsed ? (
            <FiChevronRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          ) : (
            <FiChevronLeft
              size={18}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
          )}
        </Button>
      </div>

      {/* Search - Only show when expanded and there are sections */}
      {!isCollapsed && sections.length > 1 && (
        <div className="px-4 py-3 flex-shrink-0 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 transition-all duration-300 cursor-text border border-gray-200 dark:border-gray-700 focus:border-transparent"
            />
            <FiSearch className="absolute right-3 top-2.5 w-5 h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Navigation - Grouped accordion sections */}
      <nav className="flex-1 flex flex-col gap-1 px-4 items-start overflow-y-auto py-4">
        {groupedSections.length > 0 ? (
          groupedSections.map((group) => {
            const isOpen = openGroups[group.letter] ?? true;

            return (
              <div key={group.letter} className="w-full">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.letter)}
                  className={cn(
                    'flex items-center justify-between w-full px-2 py-2 rounded-lg',
                    'text-xs font-bold uppercase tracking-wider',
                    'text-gray-500 dark:text-gray-400',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'transition-all duration-200 cursor-pointer',
                    'select-none'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {isOpen ? (
                      <FiChevronDown size={14} className="transition-transform duration-200" />
                    ) : (
                      <FiChevronRight size={14} className="transition-transform duration-200" />
                    )}
                    <span>{group.letter}</span>
                  </span>
                  <span className="text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {group.sections.length}
                  </span>
                </button>

                {/* Group Sections */}
                {isOpen && (
                  <div className="flex flex-col gap-0.5 mt-0.5 ml-1">
                    {group.sections.map((section, index) => {
                      const isActive = activeSection === section.id;

                      return (
                        <button
                          key={section.id}
                          onClick={() => onSectionChange(section.id as SectionType)}
                          style={{
                            animationDelay: `${index * 40}ms`,
                          }}
                          className={cn(
                            'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left cursor-pointer',
                            'transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]',
                            'animate-in fade-in slide-in-from-left-2 duration-300',
                            isActive
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-l-4 border-gray-900 dark:border-white shadow-sm'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white hover:shadow-sm'
                          )}
                        >
                          {!isCollapsed && (
                            <span className="truncate transition-all duration-300">
                              {section.name}
                            </span>
                          )}
                          {isActive && !isCollapsed && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white animate-pulse flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          !isCollapsed && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4 w-full animate-in fade-in duration-300">
              <p className="text-sm">No sections available</p>
            </div>
          )
        )}
      </nav>
    </aside>
  );
}