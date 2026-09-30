/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import { UploadImage } from '@/components/ui/UploadImage';
import {
  FiEdit2, FiSave, FiX, FiInfo, FiPlus, FiTrash2, FiCheck,
  FiRefreshCw, FiImage, FiCalendar, FiMapPin, FiClock, FiStar
} from 'react-icons/fi';

/* eslint-disable */

interface EventsSectionProps {
  college: College;
  templateId?: number;
}

interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  category: 'news' | 'event';
  featured?: boolean;
}

interface EventsHeroData {
  badgeText: string;
  heading: string;
  headingHighlight: string;
  description: string;
  backgroundImage: string;
}

interface EventsFormData {
  hero: EventsHeroData;
  events: EventItem[];
}

const defaultFormData: EventsFormData = {
  hero: {
    badgeText: '✦ Stay Updated ✦',
    heading: 'News &',
    headingHighlight: 'Events',
    description:
      'Stay connected with the latest happenings, upcoming events, and important announcements from our college.',
    backgroundImage: '',
  },
  events: [
    {
      id: 1,
      title: 'Annual College Festival 2025',
      date: 'December 15, 2025',
      time: '9:00 AM - 6:00 PM',
      location: 'Main Campus',
      description:
        'Join us for a day of celebration, talent showcase, and community bonding.',
      image: '',
      category: 'event',
      featured: true,
    },
    {
      id: 2,
      title: 'College Ranked Top 10 in Pakistan',
      date: 'December 10, 2025',
      time: 'All Day',
      location: 'Main Campus',
      description:
        'Our college has been ranked among the top 10 educational institutions for academic excellence.',
      image: '',
      category: 'news',
    },
  ],
};

export function EventsSection({ college, templateId }: EventsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<EventsFormData>(defaultFormData);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const getActiveTemplateId = () => templateId || college.template_id || 1;
  const getCollegeId = () => parseInt(college.id);

  // ✅ Load
  const loadFromDatabase = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const url = `/api/sections?template_id=${getActiveTemplateId()}&section_name=Events&college_id=${getCollegeId()}&_=${Date.now()}`;

        const response = await fetch(url, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.sections && data.sections.length > 0) {
            const dbContent = data.sections[0].content;
            setLastUpdated(data.sections[0].updated_at);

            if (dbContent) {
              // ✅ Backward compatibility — purane events ko naye format me convert karo
              let events: EventItem[] = [];

              if (Array.isArray(dbContent.events)) {
                events = dbContent.events.map((e: any) => ({
                  id: e.id ?? Math.random(),
                  title: e.title || '',
                  date: e.date || '',
                  time: e.time || '',
                  location: e.location || '',
                  description: e.description || '',
                  image: e.image || e.featuredImage || '',
                  category: e.category === 'news' ? 'news' : 'event',
                  featured: !!e.featured,
                }));
              }

              setFormData({
                hero: {
                  badgeText: dbContent.hero?.badgeText || defaultFormData.hero.badgeText,
                  heading: dbContent.hero?.heading || defaultFormData.hero.heading,
                  headingHighlight:
                    dbContent.hero?.headingHighlight || defaultFormData.hero.headingHighlight,
                  description: dbContent.hero?.description || defaultFormData.hero.description,
                  backgroundImage: dbContent.hero?.backgroundImage || '',
                },
                events: events.length > 0 ? events : defaultFormData.events,
              });

              console.log('✅ [Events] Loaded', events.length, 'events');
            }
          }
        }
      } catch (error) {
        console.error('❌ [Events] Load failed:', error);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [templateId, college.template_id, college.id]
  );

  useEffect(() => {
    loadFromDatabase(true);
  }, [loadFromDatabase]);

  // ✅ Save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: getActiveTemplateId(),
          section_name: 'Events',
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
        const error = await response.json();
        alert('Failed to save: ' + (error.error || error.message));
      }
    } catch (error) {
      console.error('Error saving events:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Event handlers
  const addEvent = () => {
    const newId = Math.max(0, ...formData.events.map((e) => e.id)) + 1;
    setFormData((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          id: newId,
          title: '',
          date: '',
          time: '10:00 AM',
          location: '',
          description: '',
          image: '',
          category: 'event',
          featured: false,
        },
      ],
    }));
  };

  const updateEvent = (index: number, field: keyof EventItem, value: any) => {
    const newEvents = [...formData.events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setFormData((prev) => ({ ...prev, events: newEvents }));
  };

  const removeEvent = (index: number) => {
    if (confirm('Are you sure you want to remove this event?')) {
      setFormData((prev) => ({
        ...prev,
        events: prev.events.filter((_, i) => i !== index),
      }));
    }
  };

  const moveEvent = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.events.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newEvents = [...formData.events];
    [newEvents[index], newEvents[newIndex]] = [newEvents[newIndex], newEvents[index]];
    setFormData((prev) => ({ ...prev, events: newEvents }));
  };

  // ✅ Hero image
  const handleHeroImageChange = (fileOrString: File | string) => {
    if (typeof fileOrString === 'string') {
      setFormData((prev) => ({ ...prev, hero: { ...prev.hero, backgroundImage: fileOrString } }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        hero: { ...prev.hero, backgroundImage: reader.result as string },
      }));
    };
    reader.readAsDataURL(fileOrString);
  };

  // ✅ Event image
  const handleEventImageChange = (index: number, fileOrString: File | string) => {
    if (typeof fileOrString === 'string') {
      updateEvent(index, 'image', fileOrString);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updateEvent(index, 'image', reader.result as string);
    };
    reader.readAsDataURL(fileOrString);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading events data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <FiCheck className="w-5 h-5" />
            <div>
              <p className="font-medium">Events Saved!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Events Section</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage events and news</p>
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
            <Button variant="outline" className="gap-2 cursor-pointer" onClick={() => loadFromDatabase(true)}>
              <FiRefreshCw className="w-4 h-4" /> Refresh
            </Button>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-teal-600 hover:bg-teal-700 cursor-pointer">
                <FiEdit2 className="w-4 h-4 mr-2" /> Manage Events
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
                  Edit hero, add/remove/reorder events, upload images.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hero Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge Text</label>
              <input
                type="text"
                value={formData.hero.badgeText}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, hero: { ...prev.hero, badgeText: e.target.value } }))
                }
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading</label>
              <input
                type="text"
                value={formData.hero.heading}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, hero: { ...prev.hero, heading: e.target.value } }))
                }
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading Highlight</label>
              <input
                type="text"
                value={formData.hero.headingHighlight}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, headingHighlight: e.target.value },
                  }))
                }
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={formData.hero.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))
                }
                disabled={!isEditing}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <FiImage className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Background Image
                </label>
              </div>
              <UploadImage
                value={formData.hero.backgroundImage || ''}
                onChange={(file) => handleHeroImageChange(file as any)}
                onRemove={() =>
                  setFormData((prev) => ({ ...prev, hero: { ...prev.hero, backgroundImage: '' } }))
                }
                aspectRatio="banner"
                disabled={!isEditing}
              />
              {formData.hero.backgroundImage && (
                <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Background image uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Events ({formData.events.length})
            </h3>
            {isEditing && (
              <Button size="sm" onClick={addEvent} className="bg-teal-600 hover:bg-teal-700 cursor-pointer">
                <FiPlus className="w-3 h-3 mr-1" /> Add Event
              </Button>
            )}
          </div>

          <div className="space-y-5">
            {formData.events.map((event, index) => (
              <div
                key={event.id || index}
                className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Event #{index + 1}
                    </span>
                    {event.featured && (
                      <span className="text-xs bg-[#E8CA5E]/20 text-[#E8CA5E] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FiStar className="w-3 h-3" /> Featured
                      </span>
                    )}
                    {isEditing && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveEvent(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-teal-600 disabled:opacity-30 cursor-pointer"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveEvent(index, 'down')}
                          disabled={index === formData.events.length - 1}
                          className="p-1 text-gray-500 hover:text-teal-600 disabled:opacity-30 cursor-pointer"
                        >
                          ↓
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvent(index)}
                      className="text-red-500 cursor-pointer"
                    >
                      <FiTrash2 />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) => updateEvent(index, 'title', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" /> Date
                    </label>
                    <input
                      type="text"
                      value={event.date}
                      onChange={(e) => updateEvent(index, 'date', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. December 15, 2025"
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <FiClock className="w-3 h-3" /> Time
                    </label>
                    <input
                      type="text"
                      value={event.time}
                      onChange={(e) => updateEvent(index, 'time', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. 9:00 AM - 6:00 PM"
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <FiMapPin className="w-3 h-3" /> Location
                    </label>
                    <input
                      type="text"
                      value={event.location}
                      onChange={(e) => updateEvent(index, 'location', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Category
                    </label>
                    <select
                      value={event.category}
                      onChange={(e) => updateEvent(index, 'category', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    >
                      <option value="news">News</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={event.description}
                      onChange={(e) => updateEvent(index, 'description', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!event.featured}
                        onChange={(e) => updateEvent(index, 'featured', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 cursor-pointer accent-[#E8CA5E]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <FiStar className="w-3 h-3" /> Featured (big card at top)
                      </span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <FiImage className="w-4 h-4 text-blue-600" />
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Event Image
                      </label>
                    </div>
                    <UploadImage
                      value={event.image || ''}
                      onChange={(file) => handleEventImageChange(index, file as any)}
                      onRemove={() => updateEvent(index, 'image', '')}
                      aspectRatio="video"
                      disabled={!isEditing}
                    />
                    {event.image && (
                      <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <FiCheck className="w-3 h-3" /> Image uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {formData.events.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No events added yet. Click "Add Event" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default EventsSection;