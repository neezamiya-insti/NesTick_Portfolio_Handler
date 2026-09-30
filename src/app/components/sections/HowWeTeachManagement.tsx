/* eslint-disable @typescript-eslint/no-explicit-any */
// app/components/sections/HowWeTeachManagement.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import {
  FiEdit2, FiSave, FiX, FiInfo, FiPlus, FiTrash2, FiCheck,
  FiRefreshCw
} from 'react-icons/fi';

interface HowWeTeachProps {
  college: College;
  templateId?: number;
}

interface Step {
  id: string;
  number: string;
  title: string;
  description: string[];
  color: string;
}

interface HowWeTeachFormData {
  badgeText: string;
  heading: string;
  headingHighlight: string;
  subtitle: string;
  steps: Step[];
}

const defaultFormData: HowWeTeachFormData = {
  badgeText: 'HOW WE TEACH',
  heading: 'Our Learning',
  headingHighlight: 'Methodology',
  subtitle:
    'Innovative approaches that make learning engaging, effective, and fun for every student.',
  steps: [
    {
      id: 'interactive',
      number: '01',
      title: 'Interactive Learning',
      description: [
        'Engaging students through',
        'discussions, group work, and',
        'hands-on activities.',
      ],
      color: '#E8CA5E',
    },
    {
      id: 'inquiry',
      number: '02',
      title: 'Inquiry-Based Approach',
      description: [
        'Encouraging curiosity and',
        'critical thinking through',
        'questioning and exploration.',
      ],
      color: '#E8CA5E',
    },
    {
      id: 'collaborative',
      number: '03',
      title: 'Collaborative Culture',
      description: [
        'Fostering teamwork,',
        'communication, and',
        'peer-to-peer learning.',
      ],
      color: '#E8CA5E',
    },
    {
      id: 'personalized',
      number: '04',
      title: 'Personalized Support',
      description: [
        'Tailoring teaching to meet',
        'individual student needs',
        'and learning styles.',
      ],
      color: '#E8CA5E',
    },
  ],
};

export function HowWeTeachManagement({ college, templateId }: HowWeTeachProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<HowWeTeachFormData>(defaultFormData);
  const [lastUpdated, setLastUpdated] = useState('');

  const getActiveTemplateId = () => templateId || (college as any).template_id || 1;
  const getCollegeId = () => parseInt((college as any).id);

  const loadFromDatabase = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const url = `/api/sections?template_id=${getActiveTemplateId()}&section_name=HowWeTeach&college_id=${getCollegeId()}&_=${Date.now()}`;

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
                steps:
                  Array.isArray(dbContent.steps) && dbContent.steps.length > 0
                    ? dbContent.steps
                    : defaultFormData.steps,
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ [HowWeTeach] Load failed:', error);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [templateId, college.template_id, college.id]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: getActiveTemplateId(),
          section_name: 'HowWeTeach',
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
      console.error('❌ [HowWeTeach] Save error:', error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Step handlers
  const addStep = () => {
    const newId = `step_${Date.now()}`;
    const newNumber = String(formData.steps.length + 1).padStart(2, '0');
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: newId,
          number: newNumber,
          title: 'New Step',
          description: ['Description line 1', 'Description line 2'],
          color: '#E8CA5E',
        },
      ],
    }));
  };

  const updateStep = (index: number, field: keyof Step, value: any) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const updateDescriptionLine = (stepIndex: number, lineIndex: number, value: string) => {
    const newSteps = [...formData.steps];
    const newDesc = [...newSteps[stepIndex].description];
    newDesc[lineIndex] = value;
    newSteps[stepIndex] = { ...newSteps[stepIndex], description: newDesc };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const addDescriptionLine = (stepIndex: number) => {
    const newSteps = [...formData.steps];
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      description: [...newSteps[stepIndex].description, 'New line'],
    };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const removeDescriptionLine = (stepIndex: number, lineIndex: number) => {
    const newSteps = [...formData.steps];
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      description: newSteps[stepIndex].description.filter((_, i) => i !== lineIndex),
    };
    setFormData((prev) => ({ ...prev, steps: newSteps }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
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
          <p className="text-gray-500 dark:text-gray-400">Loading How We Teach data...</p>
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
              <p className="font-medium">How We Teach Saved!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How We Teach Section</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage teaching methodology steps</p>
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
                <FiEdit2 className="w-4 h-4 mr-2" /> Edit Section
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
                  Add/remove steps and edit description lines.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heading Highlight</label>
                <input
                  type="text"
                  value={formData.headingHighlight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, headingHighlight: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                disabled={!isEditing}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Steps ({formData.steps.length})
            </h3>
            {isEditing && (
              <Button size="sm" onClick={addStep} className="bg-teal-600 hover:bg-teal-700 cursor-pointer">
                <FiPlus className="w-3 h-3 mr-1" /> Add Step
              </Button>
            )}
          </div>

          <div className="space-y-5">
            {formData.steps.map((step, index) => (
              <div
                key={step.id || index}
                className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Step #{index + 1} ({step.number})
                  </span>
                  {isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => removeStep(index)} className="text-red-500 cursor-pointer">
                      <FiTrash2 />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Number</label>
                    <input
                      type="text"
                      value={step.number}
                      onChange={(e) => updateStep(index, 'number', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={step.color}
                        onChange={(e) => updateStep(index, 'color', e.target.value)}
                        disabled={!isEditing}
                        className="w-12 h-9 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={step.color}
                        onChange={(e) => updateStep(index, 'color', e.target.value)}
                        disabled={!isEditing}
                        className="flex-1 px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(index, 'title', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Description Lines
                    </label>
                    {isEditing && (
                      <Button size="sm" variant="outline" onClick={() => addDescriptionLine(index)} className="text-teal-600">
                        <FiPlus className="w-3 h-3 mr-1" /> Add Line
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {step.description.map((line, lineIdx) => (
                      <div key={lineIdx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={line}
                          onChange={(e) => updateDescriptionLine(index, lineIdx, e.target.value)}
                          disabled={!isEditing}
                          className="flex-1 px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                        />
                        {isEditing && step.description.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDescriptionLine(index, lineIdx)}
                            className="text-red-500 cursor-pointer"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default HowWeTeachManagement;