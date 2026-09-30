/* eslint-disable @typescript-eslint/no-explicit-any */
// app/components/sections/FAQSectionManagement.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import { UploadImage } from '@/components/ui/UploadImage';
import {
  FiEdit2, FiSave, FiX, FiInfo, FiPlus, FiTrash2, FiCheck,
  FiRefreshCw, FiImage
} from 'react-icons/fi';

interface FAQSectionProps {
  college: College;
  templateId?: number;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQFormData {
  badgeText: string;
  heading: string;
  description: string;
  faqs: FAQItem[];
  image: string;
  imageBadgeText: string;
}

const defaultFormData: FAQFormData = {
  badgeText: 'Got Questions?',
  heading: 'Frequently Asked Questions',
  description:
    'Find answers to the most common questions about our college, admissions, and student life.',
  faqs: [
    {
      id: 1,
      question: 'What is the admission process at Al Noor College?',
      answer:
        'The admission process begins with filling out an online application form, followed by an entrance test and interview. After successful evaluation, candidates receive an admission offer.',
    },
    {
      id: 2,
      question: 'What are the college timings?',
      answer:
        'Our college timings are from 8:00 AM to 4:00 PM, Monday through Friday. Morning lectures start at 8:00 AM sharp.',
    },
    {
      id: 3,
      question: 'What extracurricular activities do you offer?',
      answer:
        'We offer sports (cricket, football, basketball, swimming), arts (painting, music, drama, dance), and academic clubs (science club, debate club, coding club).',
    },
  ],
  image: '',
  imageBadgeText: 'Have Questions?',
};

export function FAQSectionManagement({ college, templateId }: FAQSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<FAQFormData>(defaultFormData);
  const [lastUpdated, setLastUpdated] = useState('');

  const getActiveTemplateId = () => {
    return templateId || (college as any).template_id || 1;
  };

  const getCollegeId = () => {
    return parseInt((college as any).id);
  };

  // ✅ Load from database
  const loadFromDatabase = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);

      try {
        const activeTemplateId = getActiveTemplateId();
        const collegeId = getCollegeId();
        const timestamp = Date.now();
        const url = `/api/sections?template_id=${activeTemplateId}&section_name=FAQ&college_id=${collegeId}&_=${timestamp}`;

        console.log('🔄 [FAQ] Loading from:', url);

        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📦 [FAQ] API Response:', data);

          if (data.sections && data.sections.length > 0) {
            const dbContent = data.sections[0].content;
            setLastUpdated(data.sections[0].updated_at);

            if (dbContent && Object.keys(dbContent).length > 0) {
              setFormData({
                ...defaultFormData,
                ...dbContent,
                faqs:
                  Array.isArray(dbContent.faqs) && dbContent.faqs.length > 0
                    ? dbContent.faqs
                    : defaultFormData.faqs,
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ [FAQ] Failed to load:', error);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [templateId, college.template_id, college.id]
  );

  // ✅ Save to database
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const activeTemplateId = getActiveTemplateId();
      const collegeId = getCollegeId();

      console.log('💾 [FAQ] Saving formData:', formData);

      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: activeTemplateId,
          section_name: 'FAQ',
          college_id: collegeId,
          content: formData,
        }),
      });

      if (response.ok) {
        console.log('✅ [FAQ] Save successful');
        setShowSuccessPopup(true);
        setIsEditing(false);
        await loadFromDatabase(false);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        const errText = await response.text();
        console.error('❌ [FAQ] Save failed:', errText);
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('❌ [FAQ] Error saving:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ FAQ item handlers
  const addFAQ = () => {
    const newId = Math.max(0, ...formData.faqs.map((f) => f.id)) + 1;
    setFormData((prev) => ({
      ...prev,
      faqs: [
        ...prev.faqs,
        {
          id: newId,
          question: 'New Question?',
          answer: 'Answer here...',
        },
      ],
    }));
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFormData((prev) => ({ ...prev, faqs: newFaqs }));
  };

  const removeFAQ = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // ✅ Image handler
  const handleImageChange = (fileOrString: File | string | null) => {
    if (!fileOrString) return;

    if (typeof fileOrString === 'string') {
      setFormData((prev) => ({ ...prev, image: fileOrString }));
      return;
    }

    if (fileOrString instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(fileOrString);
    }
  };

  useEffect(() => {
    loadFromDatabase(true);
  }, [loadFromDatabase]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading FAQ section data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <FiCheck className="w-5 h-5" />
            <div>
              <p className="font-medium">FAQ Saved Successfully!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ Section</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage FAQ content</p>
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
                <FiEdit2 className="w-4 h-4 mr-2" /> Edit FAQ
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
                  className="bg-teal-600 hover:bg-teal-700 cursor-pointer disabled:cursor-not-allowed"
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
                  Modify FAQ content. Upload image directly from computer.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Settings */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Section Header
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Badge Text
              </label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, badgeText: e.target.value }))
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
                value={formData.heading}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, heading: e.target.value }))
                }
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              FAQ Items ({formData.faqs.length})
            </h3>
            {isEditing && (
              <Button
                size="sm"
                onClick={addFAQ}
                className="bg-teal-600 hover:bg-teal-700 cursor-pointer"
              >
                <FiPlus className="w-3 h-3 mr-1" /> Add FAQ
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {formData.faqs.map((faq, index) => (
              <div
                key={faq.id || index}
                className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    FAQ #{index + 1}
                  </span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFAQ(index)}
                      className="text-red-500 cursor-pointer"
                    >
                      <FiTrash2 />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Answer
                    </label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Side Image
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image Badge Text
              </label>
              <input
                type="text"
                value={formData.imageBadgeText}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, imageBadgeText: e.target.value }))
                }
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiImage className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Image <span className="text-xs text-gray-400">(Upload only)</span>
                </label>
              </div>
              <UploadImage
                value={formData.image || ''}
                onChange={(file) => handleImageChange(file as any)}
                onRemove={() => setFormData((prev) => ({ ...prev, image: '' }))}
                aspectRatio="portrait"
                disabled={!isEditing}
              />
              {formData.image && (
                <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Image uploaded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FAQSectionManagement;