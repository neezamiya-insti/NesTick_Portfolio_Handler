/* eslint-disable @typescript-eslint/no-explicit-any */

// app/components/sections/AchievementsManagement.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import { UploadImage } from '@/components/ui/UploadImage';
import {
  FiEdit2, FiSave, FiX, FiInfo, FiCheck, FiPlus, FiTrash2,
  FiRefreshCw, FiImage
} from 'react-icons/fi';

interface AchievementsProps {
  college: College;
  templateId?: number;
}

interface TimelineItem {
  year: string;
  title: string;
  desc: string;
  image: string;
}

interface ProudMoment {
  id: number;
  title: string;
  icon: string;
  description: string[];
  image: string;
}

interface AchievementsFormData {
  // Hero
  heroBadge: string;
  heroHeading: string;
  heroHeadingHighlight: string;
  heroDescription: string;
  heroImage: string;

  // Timeline
  timelineBadge: string;
  timelineHeading: string;
  timelineDescription: string;
  timeline: TimelineItem[];

  // Proud Moments
  proudBadge: string;
  proudHeading: string;
  proudDescription: string;
  proudMoments: ProudMoment[];
}

const defaultFormData: AchievementsFormData = {
  heroBadge: 'Our Achievements',
  heroHeading: 'Milestones',
  heroHeadingHighlight: 'That Inspire',
  heroDescription:
    'Each achievement is a step forward in our journey of excellence, commitment and impact in education.',
  heroImage: '',

  timelineBadge: 'OUR JOURNEY',
  timelineHeading: 'Building Excellence Over the Years',
  timelineDescription:
    'A timeline of our growth, achievements and continued pursuit of excellence.',
  timeline: [
    {
      year: '2015',
      title: 'The Beginning',
      desc: 'Laid the foundation with a vision to provide quality education.',
      image: '',
    },
    {
      year: '2017',
      title: 'Growing Stronger',
      desc: 'Expanded our facilities and introduced innovative learning.',
      image: '',
    },
    {
      year: '2019',
      title: 'Rising Higher',
      desc: 'Students excelled in academics, sports and co-curricular activities.',
      image: '',
    },
    {
      year: '2021',
      title: 'National Recognition',
      desc: 'Received national awards for excellence in greater impact.',
      image: '',
    },
    {
      year: '2023',
      title: 'Global Partnerships',
      desc: 'Collaborated with international institutions for greater impact.',
      image: '',
    },
    {
      year: '2025',
      title: 'Towards the Future',
      desc: 'Continuing our journey towards a brighter and better tomorrow.',
      image: '',
    },
  ],

  proudBadge: 'OUR PROUD MOMENTS',
  proudHeading: 'Celebrating Our Success',
  proudDescription:
    'Glimpses of our proudest achievements and memorable moments.',
  proudMoments: [
    {
      id: 1,
      title: 'Academic Excellence 2024',
      icon: '🏆',
      description: [
        'Recognized for outstanding academic performance',
        'Students achieved top positions in board examinations',
        'Multiple subject distinctions and awards',
      ],
      image: '',
    },
    {
      id: 2,
      title: 'Sports Champions',
      icon: '⚽',
      description: [
        'Won inter-school football and cricket tournaments',
        'Athletes achieved gold medals in district level competitions',
        'Sportsmanship and team spirit recognized',
      ],
      image: '',
    },
    {
      id: 3,
      title: 'Cultural Achievements',
      icon: '🎭',
      description: [
        'Students excelled in arts, music and drama competitions',
        'Won multiple awards in cultural festivals',
        'Creative expression and talent nurtured',
      ],
      image: '',
    },
    {
      id: 4,
      title: 'Community Impact',
      icon: '🌱',
      description: [
        'Active participation in community service projects',
        'Environmental awareness and sustainability initiatives',
        'Building responsible and compassionate citizens',
      ],
      image: '',
    },
  ],
};

export function AchievementsManagement({ college, templateId }: AchievementsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<AchievementsFormData>(defaultFormData);
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeSection, setActiveSection] = useState<'hero' | 'timeline' | 'proud'>('hero');

  const getActiveTemplateId = () => templateId || (college as any).template_id || 1;
  const getCollegeId = () => parseInt((college as any).id);

  // ✅ Load
  const loadFromDatabase = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const activeTemplateId = getActiveTemplateId();
        const collegeId = getCollegeId();
        const url = `/api/sections?template_id=${activeTemplateId}&section_name=Achievements&college_id=${collegeId}&_=${Date.now()}`;

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
                timeline:
                  Array.isArray(dbContent.timeline) && dbContent.timeline.length > 0
                    ? dbContent.timeline
                    : defaultFormData.timeline,
                proudMoments:
                  Array.isArray(dbContent.proudMoments) &&
                  dbContent.proudMoments.length > 0
                    ? dbContent.proudMoments
                    : defaultFormData.proudMoments,
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ [Achievements] Load failed:', error);
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
          section_name: 'Achievements',
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
      console.error('❌ [Achievements] Save error:', error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Image handler
  const handleImageChange = (
    fileOrString: File | string | null,
    type: 'hero' | 'timeline' | 'proud',
    index?: number
  ) => {
    if (!fileOrString) return;

    const applyValue = (value: string) => {
      if (type === 'hero') {
        setFormData((prev) => ({ ...prev, heroImage: value }));
      } else if (type === 'timeline' && typeof index === 'number') {
        setFormData((prev) => {
          const newTimeline = [...prev.timeline];
          newTimeline[index] = { ...newTimeline[index], image: value };
          return { ...prev, timeline: newTimeline };
        });
      } else if (type === 'proud' && typeof index === 'number') {
        setFormData((prev) => {
          const newProud = [...prev.proudMoments];
          newProud[index] = { ...newProud[index], image: value };
          return { ...prev, proudMoments: newProud };
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

  // ✅ Timeline CRUD
  const addTimelineItem = () => {
    setFormData((prev) => ({
      ...prev,
      timeline: [
        ...prev.timeline,
        {
          year: '2026',
          title: 'New Milestone',
          desc: 'Description here...',
          image: '',
        },
      ],
    }));
  };

  const removeTimelineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((_, i) => i !== index),
    }));
  };

  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: any) => {
    setFormData((prev) => {
      const newTimeline = [...prev.timeline];
      newTimeline[index] = { ...newTimeline[index], [field]: value };
      return { ...prev, timeline: newTimeline };
    });
  };

  // ✅ Proud Moments CRUD
  const addProudMoment = () => {
    setFormData((prev) => ({
      ...prev,
      proudMoments: [
        ...prev.proudMoments,
        {
          id: Date.now(),
          title: 'New Achievement',
          icon: '🏆',
          description: ['Achievement detail line 1', 'Achievement detail line 2'],
          image: '',
        },
      ],
    }));
  };

  const removeProudMoment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      proudMoments: prev.proudMoments.filter((_, i) => i !== index),
    }));
  };

  const updateProudMoment = (index: number, field: keyof ProudMoment, value: any) => {
    setFormData((prev) => {
      const newProud = [...prev.proudMoments];
      newProud[index] = { ...newProud[index], [field]: value };
      return { ...prev, proudMoments: newProud };
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
          <p className="text-gray-500 dark:text-gray-400">Loading Achievements data...</p>
        </div>
      </div>
    );
  }

  const sections = [
    { key: 'hero' as const, label: 'Hero Section' },
    { key: 'timeline' as const, label: 'Journey Timeline' },
    { key: 'proud' as const, label: 'Proud Moments' },
  ];

  return (
    <>
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <FiCheck className="w-5 h-5" />
            <div>
              <p className="font-medium">Achievements Saved!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements Section</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage hero, journey timeline & proud moments
            </p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-teal-600 dark:text-teal-400">
                Template ID: {getActiveTemplateId()}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                College ID: {getCollegeId()}
              </p>
              {lastUpdated && (
                <p className="text-xs text-gray-400">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 cursor-pointer"
              onClick={() => loadFromDatabase(true)}
            >
              <FiRefreshCw className="w-4 h-4" /> Refresh
            </Button>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-teal-600 hover:bg-teal-700 cursor-pointer"
              >
                <FiEdit2 className="w-4 h-4 mr-2" /> Edit Content
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="cursor-pointer"
                >
                  <FiX className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-teal-600 hover:bg-teal-700 cursor-pointer"
                >
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
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Edit Mode Active
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Edit hero, journey timeline steps, and proud moments.
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hero Section
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={formData.heroBadge}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, heroBadge: e.target.value }))
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heading Line 1
                </label>
                <input
                  type="text"
                  value={formData.heroHeading}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, heroHeading: e.target.value }))
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heading Highlight
                </label>
                <input
                  type="text"
                  value={formData.heroHeadingHighlight}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      heroHeadingHighlight: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.heroDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, heroDescription: e.target.value }))
                  }
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiImage className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hero Background Image
                </label>
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

        {/* ============ TIMELINE SECTION ============ */}
        {activeSection === 'timeline' && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Journey Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={formData.timelineBadge}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, timelineBadge: e.target.value }))
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heading
                </label>
                <input
                  type="text"
                  value={formData.timelineHeading}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, timelineHeading: e.target.value }))
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.timelineDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timelineDescription: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Timeline Items */}
            <div className="space-y-4">
              {formData.timeline.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Timeline Step {index + 1}
                    </h4>
                    {isEditing && formData.timeline.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimelineItem(index)}
                        className="text-red-500 cursor-pointer"
                      >
                        <FiTrash2 />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        value={item.year}
                        onChange={(e) => updateTimelineItem(index, 'year', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateTimelineItem(index, 'title', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Description
                      </label>
                      <textarea
                        value={item.desc}
                        onChange={(e) => updateTimelineItem(index, 'desc', e.target.value)}
                        disabled={!isEditing}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Image
                      </label>
                      <UploadImage
                        value={item.image || ''}
                        onChange={(file) => handleImageChange(file as any, 'timeline', index)}
                        onRemove={() => updateTimelineItem(index, 'image', '')}
                        aspectRatio="square"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {isEditing && (
                <Button
                  onClick={addTimelineItem}
                  className="w-full bg-teal-600 hover:bg-teal-700 cursor-pointer"
                >
                  <FiPlus className="w-4 h-4 mr-2" /> Add Timeline Step
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ============ PROUD MOMENTS ============ */}
        {activeSection === 'proud' && (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Proud Moments
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={formData.proudBadge}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, proudBadge: e.target.value }))
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heading
                </label>
                <input
                  type="text"
                  value={formData.proudHeading}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, proudHeading: e.target.value }))
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.proudDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      proudDescription: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {/* Proud Moments List */}
            <div className="space-y-4">
              {formData.proudMoments.map((moment, index) => (
                <div
                  key={moment.id || index}
                  className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Moment {index + 1}
                    </h4>
                    {isEditing && formData.proudMoments.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProudMoment(index)}
                        className="text-red-500 cursor-pointer"
                      >
                        <FiTrash2 />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={moment.title}
                        onChange={(e) => updateProudMoment(index, 'title', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Icon (emoji)
                      </label>
                      <input
                        type="text"
                        value={moment.icon}
                        onChange={(e) => updateProudMoment(index, 'icon', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Description (one per line)
                      </label>
                      <textarea
                        value={moment.description.join('\n')}
                        onChange={(e) =>
                          updateProudMoment(
                            index,
                            'description',
                            e.target.value.split('\n')
                          )
                        }
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Image
                      </label>
                      <UploadImage
                        value={moment.image || ''}
                        onChange={(file) => handleImageChange(file as any, 'proud', index)}
                        onRemove={() => updateProudMoment(index, 'image', '')}
                        aspectRatio="banner"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {isEditing && (
                <Button
                  onClick={addProudMoment}
                  className="w-full bg-teal-600 hover:bg-teal-700 cursor-pointer"
                >
                  <FiPlus className="w-4 h-4 mr-2" /> Add Proud Moment
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AchievementsManagement;