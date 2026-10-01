/* eslint-disable @typescript-eslint/no-explicit-any */

// app/components/sections/StudentLifeManagement.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import { UploadImage } from '@/components/ui/UploadImage';
import {
  FiEdit2, FiSave, FiX, FiInfo, FiCheck, FiPlus, FiTrash2,
  FiRefreshCw, FiImage, FiChevronUp, FiChevronDown
} from 'react-icons/fi';

interface StudentLifeProps {
  college: College;
  templateId?: number;
}

interface SportItem {
  id: number;
  title: string;
  icon: string;
  description: string[];
  image: string;
}

interface ClubItem {
  id: number;
  title: string;
  icon: string;
  description: string[];
  image: string;
}

interface StudentLifeFormData {
  // Hero
  heroBadge: string;
  heroHeading: string;
  heroHeadingHighlight: string;
  heroDescription: string;
  heroImage: string;
  heroSearchPlaceholder: string;
  heroContactText: string;
  heroContactLink: string;

  // Sports section
  sportsBadge: string;
  sportsHeading: string;
  sportsHeadingHighlight: string;
  sportsDescription: string;
  sports: SportItem[];

  // Clubs section
  clubsBadge: string;
  clubsHeading: string;
  clubsHeadingHighlight: string;
  clubsDescription: string;
  clubs: ClubItem[];

  // Admission CTA
  admissionHeading: string;
  admissionHeadingHighlight: string;
  admissionDescription: string;
  admissionButtonText: string;
  admissionButtonLink: string;
}

const defaultFormData: StudentLifeFormData = {
  heroBadge: 'Welcome to Greenfield',
  heroHeading: 'Learn, Grow &',
  heroHeadingHighlight: 'Inspire Together',
  heroDescription:
    'Where every child discovers their potential through quality education, character building, and holistic development.',
  heroImage: '',
  heroSearchPlaceholder: 'Search for sports, activities...',
  heroContactText: 'Contact Us',
  heroContactLink: '/contact',

  sportsBadge: 'Sports & Wellness',
  sportsHeading: 'Stronger',
  sportsHeadingHighlight: 'Every Day',
  sportsDescription:
    'Discover our wide range of sports activities designed to build confidence, teamwork, and a healthy spirit.',
  sports: [
    {
      id: 1,
      title: 'Football',
      icon: '⚽',
      description: [
        'Build teamwork and leadership skills',
        'Develop strategy and endurance',
        'Learn sportsmanship and discipline',
      ],
      image: '',
    },
    {
      id: 2,
      title: 'Basketball',
      icon: '🏀',
      description: [
        'Improve agility and coordination',
        'Enhance team spirit and communication',
        'Focus on skill development',
      ],
      image: '',
    },
  ],

  clubsBadge: 'Clubs & Societies',
  clubsHeading: 'Explore',
  clubsHeadingHighlight: 'Your Passion',
  clubsDescription:
    'Discover our diverse range of clubs and societies where students can explore their interests and develop new skills.',
  clubs: [
    {
      id: 1,
      title: 'Debate Club',
      icon: '🎤',
      description: [
        'Develop critical thinking and public speaking skills',
        'Participate in inter-school debates and competitions',
        'Build confidence and persuasive communication',
      ],
      image: '',
    },
    {
      id: 2,
      title: 'Science Club',
      icon: '🔬',
      description: [
        'Explore scientific concepts through hands-on experiments',
        'Participate in science fairs and exhibitions',
        'Develop analytical and research skills',
      ],
      image: '',
    },
  ],

  admissionHeading: 'Ready to Join',
  admissionHeadingHighlight: 'Greenfield?',
  admissionDescription:
    'Give your child the gift of quality education, character building, and endless opportunities.',
  admissionButtonText: 'Apply Now for Admission',
  admissionButtonLink: '/admissions',
};

export function StudentLifeManagement({ college, templateId }: StudentLifeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<StudentLifeFormData>(defaultFormData);
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeSection, setActiveSection] = useState<'hero' | 'sports' | 'clubs' | 'admission'>('hero');

  const getActiveTemplateId = () => templateId || (college as any).template_id || 1;
  const getCollegeId = () => parseInt((college as any).id);

  // ✅ Load
  const loadFromDatabase = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const activeTemplateId = getActiveTemplateId();
        const collegeId = getCollegeId();
        const url = `/api/sections?template_id=${activeTemplateId}&section_name=StudentLife&college_id=${collegeId}&_=${Date.now()}`;

        const response = await fetch(url, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.sections && data.sections.length > 0) {
            const dbContent = data.sections[0].content;
            setLastUpdated(data.sections[0].updated_at);
            if (dbContent && Object.keys(dbContent).length > 0) {
              setFormData({
                ...defaultFormData,
                ...dbContent,
                sports: Array.isArray(dbContent.sports) && dbContent.sports.length > 0
                  ? dbContent.sports
                  : defaultFormData.sports,
                clubs: Array.isArray(dbContent.clubs) && dbContent.clubs.length > 0
                  ? dbContent.clubs
                  : defaultFormData.clubs,
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ [StudentLife] Load failed:', error);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [templateId, college.template_id, college.id]
  );

  // ✅ Save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: getActiveTemplateId(),
          section_name: 'StudentLife',
          college_id: getCollegeId(),
          content: formData,
        }),
      });

      if (response.ok) {
        setShowSuccessPopup(true);
        setIsEditing(false);
        await loadFromDatabase(false);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('❌ [StudentLife] Save error:', error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Image handler
  const handleImageChange = (
    fileOrString: File | string | null,
    type: 'hero' | 'sport' | 'club',
    index?: number
  ) => {
    if (!fileOrString) return;

    const applyValue = (value: string) => {
      if (type === 'hero') {
        setFormData((prev) => ({ ...prev, heroImage: value }));
      } else if (type === 'sport' && typeof index === 'number') {
        setFormData((prev) => {
          const newSports = [...prev.sports];
          newSports[index] = { ...newSports[index], image: value };
          return { ...prev, sports: newSports };
        });
      } else if (type === 'club' && typeof index === 'number') {
        setFormData((prev) => {
          const newClubs = [...prev.clubs];
          newClubs[index] = { ...newClubs[index], image: value };
          return { ...prev, clubs: newClubs };
        });
      }
    };

    if (typeof fileOrString === 'string') {
      applyValue(fileOrString);
      return;
    }
    if (fileOrString instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => applyValue(reader.result as string);
      reader.readAsDataURL(fileOrString);
    }
  };

  // ✅ Add/Remove Sport
  const addSport = () => {
    setFormData((prev) => ({
      ...prev,
      sports: [
        ...prev.sports,
        {
          id: Date.now(),
          title: 'New Sport',
          icon: '🏆',
          description: ['Description line 1', 'Description line 2'],
          image: '',
        },
      ],
    }));
  };

  const removeSport = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.filter((_, i) => i !== index),
    }));
  };

  const updateSport = (index: number, field: keyof SportItem, value: any) => {
    setFormData((prev) => {
      const newSports = [...prev.sports];
      newSports[index] = { ...newSports[index], [field]: value };
      return { ...prev, sports: newSports };
    });
  };

  // ✅ Add/Remove Club
  const addClub = () => {
    setFormData((prev) => ({
      ...prev,
      clubs: [
        ...prev.clubs,
        {
          id: Date.now(),
          title: 'New Club',
          icon: '🎯',
          description: ['Description line 1', 'Description line 2'],
          image: '',
        },
      ],
    }));
  };

  const removeClub = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      clubs: prev.clubs.filter((_, i) => i !== index),
    }));
  };

  const updateClub = (index: number, field: keyof ClubItem, value: any) => {
    setFormData((prev) => {
      const newClubs = [...prev.clubs];
      newClubs[index] = { ...newClubs[index], [field]: value };
      return { ...prev, clubs: newClubs };
    });
  };

  useEffect(() => {
    loadFromDatabase(true);
  }, [loadFromDatabase]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading Student Life data...</p>
        </div>
      </div>
    );
  }

  // Sections nav
  const sections = [
    { key: 'hero' as const, label: 'Hero Section' },
    { key: 'sports' as const, label: 'Sports Section' },
    { key: 'clubs' as const, label: 'Clubs Section' },
    { key: 'admission' as const, label: 'Admission CTA' },
  ];

  return (
    <>
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <FiCheck className="w-5 h-5" />
            <div>
              <p className="font-medium">Student Life Saved!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Life Section</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage hero, sports, clubs & admission CTA</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-teal-600 dark:text-teal-400">Template ID: {getActiveTemplateId()}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">College ID: {getCollegeId()}</p>
              {lastUpdated && (
                <p className="text-xs text-gray-400">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 cursor-pointer" onClick={() => loadFromDatabase(true)}>
              <FiRefreshCw className="w-4 h-4" /> Refresh
            </Button>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-teal-600 hover:bg-teal-700 cursor-pointer">
                <FiEdit2 className="w-4 h-4 mr-2" /> Edit Content
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="cursor-pointer">
                  <FiX className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 cursor-pointer">
                  <FiSave className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save All Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Edit Mode Active</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Edit all sections: hero, sports cards, clubs, and admission CTA.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeSection === s.key
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ============ HERO SECTION ============ */}
        {activeSection === 'hero' && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hero Section</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={formData.heroBadge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroBadge: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading Line 1</label>
                <input
                  type="text"
                  value={formData.heroHeading}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroHeading: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading Highlight</label>
                <input
                  type="text"
                  value={formData.heroHeadingHighlight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroHeadingHighlight: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Placeholder</label>
                <input
                  type="text"
                  value={formData.heroSearchPlaceholder}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroSearchPlaceholder: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.heroDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroDescription: e.target.value }))}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Button Text</label>
                <input
                  type="text"
                  value={formData.heroContactText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroContactText: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Link</label>
                <input
                  type="text"
                  value={formData.heroContactLink}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroContactLink: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiImage className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hero Background Image</label>
              </div>
              <UploadImage
                value={formData.heroImage || ''}
                onChange={(file) => handleImageChange(file as any, 'hero')}
                onRemove={() => setFormData((prev) => ({ ...prev, heroImage: '' }))}
                aspectRatio="banner"
                disabled={!isEditing}
              />
            </div>
          </div>
        )}

        {/* ============ SPORTS SECTION ============ */}
        {activeSection === 'sports' && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sports Section</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={formData.sportsBadge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sportsBadge: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading</label>
                <input
                  type="text"
                  value={formData.sportsHeading}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sportsHeading: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading Highlight</label>
                <input
                  type="text"
                  value={formData.sportsHeadingHighlight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sportsHeadingHighlight: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.sportsDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sportsDescription: e.target.value }))}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Sports List */}
            <div className="space-y-4">
              {formData.sports.map((sport, index) => (
                <div key={sport.id || index} className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Sport {index + 1}</h4>
                    {isEditing && formData.sports.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeSport(index)} className="text-red-500 cursor-pointer">
                        <FiTrash2 />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={sport.title}
                        onChange={(e) => updateSport(index, 'title', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Icon (emoji)</label>
                      <input
                        type="text"
                        value={sport.icon}
                        onChange={(e) => updateSport(index, 'icon', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Description (one per line)
                      </label>
                      <textarea
                        value={sport.description.join('\n')}
                        onChange={(e) => updateSport(index, 'description', e.target.value.split('\n'))}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Image</label>
                      <UploadImage
                        value={sport.image || ''}
                        onChange={(file) => handleImageChange(file as any, 'sport', index)}
                        onRemove={() => updateSport(index, 'image', '')}
                        aspectRatio="banner"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {isEditing && (
                <Button onClick={addSport} className="w-full bg-teal-600 hover:bg-teal-700 cursor-pointer">
                  <FiPlus className="w-4 h-4 mr-2" /> Add Sport
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ============ CLUBS SECTION ============ */}
        {activeSection === 'clubs' && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clubs Section</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={formData.clubsBadge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clubsBadge: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading</label>
                <input
                  type="text"
                  value={formData.clubsHeading}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clubsHeading: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading Highlight</label>
                <input
                  type="text"
                  value={formData.clubsHeadingHighlight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clubsHeadingHighlight: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.clubsDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clubsDescription: e.target.value }))}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Clubs List */}
            <div className="space-y-4">
              {formData.clubs.map((club, index) => (
                <div key={club.id || index} className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Club {index + 1}</h4>
                    {isEditing && formData.clubs.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeClub(index)} className="text-red-500 cursor-pointer">
                        <FiTrash2 />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={club.title}
                        onChange={(e) => updateClub(index, 'title', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Icon (emoji)</label>
                      <input
                        type="text"
                        value={club.icon}
                        onChange={(e) => updateClub(index, 'icon', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Description (one per line)
                      </label>
                      <textarea
                        value={club.description.join('\n')}
                        onChange={(e) => updateClub(index, 'description', e.target.value.split('\n'))}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Image</label>
                      <UploadImage
                        value={club.image || ''}
                        onChange={(file) => handleImageChange(file as any, 'club', index)}
                        onRemove={() => updateClub(index, 'image', '')}
                        aspectRatio="banner"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {isEditing && (
                <Button onClick={addClub} className="w-full bg-teal-600 hover:bg-teal-700 cursor-pointer">
                  <FiPlus className="w-4 h-4 mr-2" /> Add Club
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ============ ADMISSION CTA ============ */}
        {activeSection === 'admission' && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admission CTA Section</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading</label>
                <input
                  type="text"
                  value={formData.admissionHeading}
                  onChange={(e) => setFormData((prev) => ({ ...prev, admissionHeading: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading Highlight</label>
                <input
                  type="text"
                  value={formData.admissionHeadingHighlight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, admissionHeadingHighlight: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.admissionDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, admissionDescription: e.target.value }))}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Text</label>
                <input
                  type="text"
                  value={formData.admissionButtonText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, admissionButtonText: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Link</label>
                <input
                  type="text"
                  value={formData.admissionButtonLink}
                  onChange={(e) => setFormData((prev) => ({ ...prev, admissionButtonLink: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default StudentLifeManagement;