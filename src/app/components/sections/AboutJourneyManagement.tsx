/* eslint-disable @typescript-eslint/no-explicit-any */
// app/components/sections/AboutJourneyManagement.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import { UploadImage } from '@/components/ui/UploadImage';
import {
  FiEdit2, FiSave, FiX, FiInfo, FiCheck,
  FiRefreshCw, FiImage
} from 'react-icons/fi';

interface AboutJourneyProps {
  college: College;
  templateId?: number;
}

interface AboutJourneyFormData {
  badgeText: string;
  heading: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  buttonText: string;
  buttonLink: string;
  topImage: string;
  leftImage: string;
  rightImage: string;
}

const defaultFormData: AboutJourneyFormData = {
  badgeText: 'About Our Journey',
  heading: 'Al Noor College',
  paragraph1:
    'Al Noor College has established itself as a beacon of quality education, nurturing young minds with a commitment to academic excellence and character development. From its humble beginnings, the institution has grown into a renowned center of learning, dedicated to empowering students for a bright future.',
  paragraph2:
    'Driven by a vision of holistic development, Al Noor College combines modern teaching methodologies with timeless values. Our dedicated faculty and supportive community work together to create an environment where every student can discover their true potential and thrive academically, socially, and ethically.',
  paragraph3:
    'Today, Al Noor College stands as a symbol of educational excellence, innovation, and integrity. With a legacy built on passion and commitment, we continue to inspire and prepare our students to become leaders of tomorrow, contributing positively to society and the world at large.',
  buttonText: 'Read More',
  buttonLink: '/about',
  topImage: '',
  leftImage: '',
  rightImage: '',
};

export function AboutJourneyManagement({ college, templateId }: AboutJourneyProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<AboutJourneyFormData>(defaultFormData);
  const [lastUpdated, setLastUpdated] = useState('');

  const getActiveTemplateId = () => templateId || (college as any).template_id || 1;
  const getCollegeId = () => parseInt((college as any).id);

  // ✅ Load
  const loadFromDatabase = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const activeTemplateId = getActiveTemplateId();
        const collegeId = getCollegeId();
        const url = `/api/sections?template_id=${activeTemplateId}&section_name=AboutJourney&college_id=${collegeId}&_=${Date.now()}`;

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
              setFormData({ ...defaultFormData, ...dbContent });
            }
          }
        }
      } catch (error) {
        console.error('❌ [AboutJourney] Load failed:', error);
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
          section_name: 'AboutJourney',
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
      console.error('❌ [AboutJourney] Save error:', error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Image handler
  const handleImageChange = (
    key: 'topImage' | 'leftImage' | 'rightImage',
    fileOrString: File | string | null
  ) => {
    if (!fileOrString) return;
    if (typeof fileOrString === 'string') {
      setFormData((prev) => ({ ...prev, [key]: fileOrString }));
      return;
    }
    if (fileOrString instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(fileOrString);
    }
  };

  const removeImage = (key: 'topImage' | 'leftImage' | 'rightImage') => {
    setFormData((prev) => ({ ...prev, [key]: '' }));
  };

  useEffect(() => {
    loadFromDatabase(true);
  }, [loadFromDatabase]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading About Journey data...</p>
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
              <p className="font-medium">About Journey Saved!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About Journey Section</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage About Journey content</p>
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
                  Edit text and upload 3 images (top circle + left oval + right oval).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Text Content</h3>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paragraph 1</label>
              <textarea
                value={formData.paragraph1}
                onChange={(e) => setFormData((prev) => ({ ...prev, paragraph1: e.target.value }))}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paragraph 2</label>
              <textarea
                value={formData.paragraph2}
                onChange={(e) => setFormData((prev) => ({ ...prev, paragraph2: e.target.value }))}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paragraph 3</label>
              <textarea
                value={formData.paragraph3}
                onChange={(e) => setFormData((prev) => ({ ...prev, paragraph3: e.target.value }))}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Text</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData((prev) => ({ ...prev, buttonText: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Link</label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData((prev) => ({ ...prev, buttonLink: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Images (3)</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Image */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiImage className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Top Image (Circle)
                </label>
              </div>
              <UploadImage
                value={formData.topImage || ''}
                onChange={(file) => handleImageChange('topImage', file as any)}
                onRemove={() => removeImage('topImage')}
                aspectRatio="square"
                disabled={!isEditing}
              />
              {formData.topImage && (
                <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Uploaded
                </div>
              )}
            </div>

            {/* Left Image */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiImage className="w-4 h-4 text-purple-600" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Left Image (Oval)
                </label>
              </div>
              <UploadImage
                value={formData.leftImage || ''}
                onChange={(file) => handleImageChange('leftImage', file as any)}
                onRemove={() => removeImage('leftImage')}
                aspectRatio="square"
                disabled={!isEditing}
              />
              {formData.leftImage && (
                <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Uploaded
                </div>
              )}
            </div>

            {/* Right Image */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiImage className="w-4 h-4 text-green-600" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Right Image (Oval)
                </label>
              </div>
              <UploadImage
                value={formData.rightImage || ''}
                onChange={(file) => handleImageChange('rightImage', file as any)}
                onRemove={() => removeImage('rightImage')}
                aspectRatio="square"
                disabled={!isEditing}
              />
              {formData.rightImage && (
                <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Uploaded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutJourneyManagement;