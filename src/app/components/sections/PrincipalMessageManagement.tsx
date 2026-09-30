/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/components/sections/PrincipalMessageManagement.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import { UploadImage } from '@/components/ui/UploadImage';
import {
  FiEdit2, FiSave, FiX, FiInfo, FiCheck,
  FiRefreshCw, FiImage, FiUser
} from 'react-icons/fi';

interface PrincipalMessageProps {
  college: College;
  templateId?: number;
}

interface PrincipalMessageFormData {
  badgeText: string;
  principalName: string;
  paragraphs: string[];
  signature: string;
  image: string;
}

const defaultFormData: PrincipalMessageFormData = {
  badgeText: "Principal's Message",
  principalName: 'Dr. Fatima Al Noor',
  paragraphs: [
    '"Education is the foundation upon which we build our future. At our college, we believe that true learning goes beyond textbooks — it shapes character, builds resilience, and ignites the passion for lifelong discovery.',
    'Our distinguished faculty and dedicated staff are committed to providing an environment where every student can thrive academically, socially, and ethically. We strive to nurture leaders who will make meaningful contributions to their communities and the world at large.',
    "I warmly invite you to join our college family — where excellence is a tradition, and every student's potential is our priority.\"",
  ],
  signature: '— Dr. Fatima Al Noor, Principal',
  image: '',
};

export function PrincipalMessageManagement({ college, templateId }: PrincipalMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<PrincipalMessageFormData>(defaultFormData);
  const [lastUpdated, setLastUpdated] = useState('');

  const getActiveTemplateId = () => templateId || (college as any).template_id || 1;
  const getCollegeId = () => parseInt((college as any).id);

  // ✅ Load
  const loadFromDatabase = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const url = `/api/sections?template_id=${getActiveTemplateId()}&section_name=PrincipalMessage&college_id=${getCollegeId()}&_=${Date.now()}`;

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
                paragraphs:
                  Array.isArray(dbContent.paragraphs) && dbContent.paragraphs.length > 0
                    ? dbContent.paragraphs
                    : defaultFormData.paragraphs,
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ [PrincipalMessage] Load failed:', error);
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
          section_name: 'PrincipalMessage',
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
      console.error('❌ [PrincipalMessage] Save error:', error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Paragraph handlers
  const addParagraph = () => {
    setFormData((prev) => ({
      ...prev,
      paragraphs: [...prev.paragraphs, 'New paragraph...'],
    }));
  };

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...formData.paragraphs];
    newParagraphs[index] = value;
    setFormData((prev) => ({ ...prev, paragraphs: newParagraphs }));
  };

  const removeParagraph = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((_, i) => i !== index),
    }));
  };

  // ✅ Image handler
  const handleImageChange = (fileOrString: File | string) => {
    if (typeof fileOrString === 'string') {
      setFormData((prev) => ({ ...prev, image: fileOrString }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(fileOrString);
  };

  useEffect(() => {
    loadFromDatabase(true);
  }, [loadFromDatabase]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading Principal Message...</p>
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
              <p className="font-medium">Principal Message Saved!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Principal&apos;s Message Section</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage principal's message content</p>
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
                  Edit principal's name, message paragraphs, and upload image.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge Text</label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) => setFormData((prev) => ({ ...prev, badgeText: e.target.value }))}
                disabled={!isEditing}
                placeholder="Principal's Message"
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal Name</label>
              <input
                type="text"
                value={formData.principalName}
                onChange={(e) => setFormData((prev) => ({ ...prev, principalName: e.target.value }))}
                disabled={!isEditing}
                placeholder="Dr. Fatima Al Noor"
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Signature Line</label>
              <input
                type="text"
                value={formData.signature}
                onChange={(e) => setFormData((prev) => ({ ...prev, signature: e.target.value }))}
                disabled={!isEditing}
                placeholder="— Dr. Fatima Al Noor, Principal"
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiUser className="text-teal-500" /> Principal Image
          </h3>
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
            aspectRatio="square"
            disabled={!isEditing}
          />
          {formData.image && (
            <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
              <FiCheck className="w-3 h-3" /> Image uploaded
            </div>
          )}
        </div>

        {/* Paragraphs */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Message Paragraphs ({formData.paragraphs.length})
            </h3>
            {isEditing && (
              <Button size="sm" onClick={addParagraph} className="bg-teal-600 hover:bg-teal-700 cursor-pointer">
                + Add Paragraph
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {formData.paragraphs.map((paragraph, index) => (
              <div key={index} className="flex gap-2">
                <textarea
                  value={paragraph}
                  onChange={(e) => updateParagraph(index, e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  placeholder={`Paragraph ${index + 1}`}
                  className="flex-1 px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 resize-none"
                />
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParagraph(index)}
                    className="text-red-500 cursor-pointer"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default PrincipalMessageManagement;