/* eslint-disable @typescript-eslint/no-explicit-any */
// app/components/sections/CoreValuesManagement.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import {
  FiEdit2, FiSave, FiX, FiInfo, FiPlus, FiTrash2, FiCheck,
  FiRefreshCw
} from 'react-icons/fi';

interface CoreValuesProps {
  college: College;
  templateId?: number;
}

interface ValueItem {
  icon: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

interface CoreValuesFormData {
  badgeText: string;
  heading: string;
  description: string;
  values: ValueItem[];
}

const defaultFormData: CoreValuesFormData = {
  badgeText: 'What We Stand For',
  heading: 'Our Core Values',
  description:
    'These values guide everything we do at our institution, shaping our culture and defining our commitment to every student.',
  values: [
    {
      icon: 'Heart',
      title: 'Integrity',
      description: 'Honesty and ethics in everything we do.',
      color: '#E8CA5E',
      bgColor: '#E8CA5E',
    },
    {
      icon: 'Users',
      title: 'Compassion',
      description: 'A caring environment for every individual.',
      color: '#E8CA5E',
      bgColor: '#E8CA5E',
    },
    {
      icon: 'Lightbulb',
      title: 'Innovation',
      description: 'Creative thinking and new ideas in learning.',
      color: '#E8CA5E',
      bgColor: '#E8CA5E',
    },
    {
      icon: 'Shield',
      title: 'Community',
      description: 'Strong partnerships with parents and community.',
      color: '#E8CA5E',
      bgColor: '#E8CA5E',
    },
    {
      icon: 'Sparkles',
      title: 'Lifelong Learning',
      description: 'A love for learning beyond the classroom.',
      color: '#0B0F19',
      bgColor: '#0B0F19',
    },
    {
      icon: 'GraduationCap',
      title: 'Excellence',
      description: 'Striving for excellence in education and growth.',
      color: '#E8CA5E',
      bgColor: '#E8CA5E',
    },
  ],
};

const ICON_OPTIONS = [
  'Heart',
  'Users',
  'Lightbulb',
  'Shield',
  'Sparkles',
  'GraduationCap',
  'Star',
  'Award',
  'Target',
  'BookOpen',
  'Zap',
  'Globe',
];

export function CoreValuesManagement({ college, templateId }: CoreValuesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<CoreValuesFormData>(defaultFormData);
  const [lastUpdated, setLastUpdated] = useState('');

  const getActiveTemplateId = () => templateId || (college as any).template_id || 1;
  const getCollegeId = () => parseInt((college as any).id);

  // ✅ Load
  const loadFromDatabase = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const url = `/api/sections?template_id=${getActiveTemplateId()}&section_name=CoreValues&college_id=${getCollegeId()}&_=${Date.now()}`;

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
                values:
                  Array.isArray(dbContent.values) && dbContent.values.length > 0
                    ? dbContent.values
                    : defaultFormData.values,
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ [CoreValues] Load failed:', error);
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
          section_name: 'CoreValues',
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
      console.error('❌ [CoreValues] Save error:', error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Value handlers
  const addValue = () => {
    setFormData((prev) => ({
      ...prev,
      values: [
        ...prev.values,
        {
          icon: 'Heart',
          title: 'New Value',
          description: 'Description here...',
          color: '#E8CA5E',
          bgColor: '#E8CA5E',
        },
      ],
    }));
  };

  const updateValue = (index: number, field: keyof ValueItem, value: string) => {
    const newValues = [...formData.values];
    newValues[index] = { ...newValues[index], [field]: value };
    setFormData((prev) => ({ ...prev, values: newValues }));
  };

  const removeValue = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    loadFromDatabase(true);
  }, [loadFromDatabase]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading Core Values...</p>
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
              <p className="font-medium">Core Values Saved!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Core Values Section</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage core values content</p>
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
                <FiEdit2 className="w-4 h-4 mr-2" /> Edit Values
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
                  Add/remove values, choose icons, and customize colors. <strong>Only first 6 values</strong> will show on the public site.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Section Header</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge Text</label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) => setFormData((prev) => ({ ...prev, badgeText: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading</label>
              <input
                type="text"
                value={formData.heading}
                onChange={(e) => setFormData((prev) => ({ ...prev, heading: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                disabled={!isEditing}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Values ({formData.values.length})
            </h3>
            {isEditing && (
              <Button size="sm" onClick={addValue} className="bg-teal-600 hover:bg-teal-700 cursor-pointer">
                <FiPlus className="w-3 h-3 mr-1" /> Add Value
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.values.map((value, index) => (
              <div
                key={index}
                className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    Value #{index + 1}
                    {index >= 6 && (
                      <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        Hidden on site
                      </span>
                    )}
                  </span>
                  {isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => removeValue(index)} className="text-red-500 cursor-pointer">
                      <FiTrash2 />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Icon</label>
                    <select
                      value={value.icon}
                      onChange={(e) => updateValue(index, 'icon', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    >
                      {ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={value.title}
                      onChange={(e) => updateValue(index, 'title', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                    <textarea
                      value={value.description}
                      onChange={(e) => updateValue(index, 'description', e.target.value)}
                      disabled={!isEditing}
                      rows={2}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Icon Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={value.color}
                        onChange={(e) => updateValue(index, 'color', e.target.value)}
                        disabled={!isEditing}
                        className="w-12 h-9 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value.color}
                        onChange={(e) => updateValue(index, 'color', e.target.value)}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Background Color (filled cards)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={value.bgColor}
                        onChange={(e) => updateValue(index, 'bgColor', e.target.value)}
                        disabled={!isEditing}
                        className="w-12 h-9 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value.bgColor}
                        onChange={(e) => updateValue(index, 'bgColor', e.target.value)}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {formData.values.length > 6 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                ⚠️ Only the first <strong>6 values</strong> will be visible on the public site. Extra values will be saved but not displayed.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CoreValuesManagement;