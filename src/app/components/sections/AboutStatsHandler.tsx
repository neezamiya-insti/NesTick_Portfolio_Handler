/* eslint-disable @typescript-eslint/no-explicit-any */
// app/components/sections/AboutStatsHandler.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import { UploadImage } from '@/components/ui/UploadImage';
import { 
  FiEdit2, FiSave, FiX, FiInfo, FiCheck,
  FiRefreshCw, FiImage, FiAward, FiTarget, FiEye
} from 'react-icons/fi';

interface AboutStatsHandlerProps {
  college: College;
  templateId?: number;
}

interface AboutStatsFormData {
  badgeText: string;
  headingFirst: string;
  headingHighlight: string;
  headingLast: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  desktopImage: string;
  mobileImage: string;
  quoteText: string;
}

const defaultFormData: AboutStatsFormData = {
  badgeText: 'About Our Institution',
  headingFirst: 'Our',
  headingHighlight: 'Mission.',
  headingLast: 'Our Vision.',
  description: 'Discover the driving force behind our institution\'s commitment to excellence, innovation, and student success in a rapidly evolving world. We believe in nurturing talent, fostering creativity, and building a community where every individual can thrive and make a meaningful impact on society.',
  buttonText: 'Explore Our Story',
  buttonLink: '/About',
  desktopImage: '',
  mobileImage: '',
  quoteText: 'Education is the foundation of every great achievement.'
};

export function AboutStatsHandler({ college, templateId }: AboutStatsHandlerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<AboutStatsFormData>(defaultFormData);
  const [lastUpdated, setLastUpdated] = useState('');

  const getActiveTemplateId = () => {
    return templateId || (college as any).template_id || 1;
  };

  const getCollegeId = () => {
    return parseInt((college as any).id);
  };

  // ✅ Load from database
  const loadFromDatabase = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    try {
      const activeTemplateId = getActiveTemplateId();
      const collegeId = getCollegeId();
      const timestamp = Date.now();
      const url = `/api/sections?template_id=${activeTemplateId}&section_name=AboutStats&college_id=${collegeId}&_=${timestamp}`;
      
      console.log('🔄 [AboutStats] Loading from:', url);
      
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 [AboutStats] API Response:', data);
        
        if (data.sections && data.sections.length > 0) {
          const dbContent = data.sections[0].content;
          setLastUpdated(data.sections[0].updated_at);
          
          if (dbContent && Object.keys(dbContent).length > 0) {
            console.log('📋 [AboutStats] DB content:', dbContent);
            setFormData({
              ...defaultFormData,
              ...dbContent
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ [AboutStats] Failed to load:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [templateId, college.template_id, college.id]);

  // ✅ Save to database
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const activeTemplateId = getActiveTemplateId();
      const collegeId = getCollegeId();
      
      console.log('💾 [AboutStats] Saving formData:', formData);
      
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: activeTemplateId,
          section_name: "AboutStats",
          college_id: collegeId,
          content: formData
        })
      });
      
      if (response.ok) {
        console.log('✅ [AboutStats] Save successful');
        setShowSuccessPopup(true);
        setIsEditing(false);
        await loadFromDatabase(false);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        const errText = await response.text();
        console.error('❌ [AboutStats] Save failed:', errText);
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('❌ [AboutStats] Error saving:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Image handler — FIXED to accept BOTH File and string
  // Pehle `if (typeof fileOrString === 'string') return;` string ko discard kar deta tha.
  // Ab agar UploadImage base64/URL string bhejta hai to seedha use kar lete hain.
  const handleImageChange = (
    key: 'desktopImage' | 'mobileImage',
    fileOrString: File | string | null
  ) => {
    console.log('🔵 [AboutStats] handleImageChange called', {
      key,
      typeofValue: typeof fileOrString,
      isFile: fileOrString instanceof File,
      valuePreview:
        typeof fileOrString === 'string'
          ? fileOrString.slice(0, 80)
          : fileOrString?.name || '(non-string)',
    });

    // Null / undefined safety
    if (!fileOrString) {
      console.warn('⚠️ [AboutStats] Empty fileOrString received, ignoring.');
      return;
    }

    // ✅ Case 1: Already a string (base64 data URL or http URL) → use directly
    if (typeof fileOrString === 'string') {
      console.log('🟡 [AboutStats] String received — using directly');
      setFormData(prev => {
        const updated = { ...prev, [key]: fileOrString };
        console.log('🟢 [AboutStats] Updated formData:', {
          key,
          length: fileOrString.length,
        });
        return updated;
      });
      return;
    }

    // ✅ Case 2: A File object → convert to base64 via FileReader
    if (fileOrString instanceof File) {
      console.log('🟠 [AboutStats] File object received — starting FileReader');
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('🟢 [AboutStats] FileReader done. base64 length:', result?.length);
        setFormData(prev => ({ ...prev, [key]: result }));
      };
      reader.onerror = (err) => {
        console.error('❌ [AboutStats] FileReader error:', err);
      };
      reader.readAsDataURL(fileOrString);
      return;
    }

    console.error('❌ [AboutStats] Unsupported type:', fileOrString);
  };

  // ✅ Remove image handler
  const removeImage = (key: 'desktopImage' | 'mobileImage') => {
    console.log(`🗑️ [AboutStats] Removing ${key}`);
    setFormData(prev => ({ ...prev, [key]: '' }));
  };

  useEffect(() => {
    loadFromDatabase(true);
  }, [loadFromDatabase]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading about stats data...</p>
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
              <p className="font-medium">About Stats Saved Successfully!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About Stats Section</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage about section content</p>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-teal-600 dark:text-teal-400">Template ID: {getActiveTemplateId()}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">College ID: {getCollegeId()}</p>
              {lastUpdated && (
                <p className="text-xs text-gray-400">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
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
                  Upload images directly from your computer. URL paste is not allowed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Settings */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Section Settings</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">Badge Text</label>
              <input
                type="text"
                value={formData.badgeText}
                onChange={(e) => setFormData(prev => ({ ...prev, badgeText: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">Heading First</label>
              <input
                type="text"
                value={formData.headingFirst}
                onChange={(e) => setFormData(prev => ({ ...prev, headingFirst: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">Heading Highlight</label>
              <input
                type="text"
                value={formData.headingHighlight}
                onChange={(e) => setFormData(prev => ({ ...prev, headingHighlight: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">Heading Last</label>
              <input
                type="text"
                value={formData.headingLast}
                onChange={(e) => setFormData(prev => ({ ...prev, headingLast: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">Button Text</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">Button Link</label>
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">Quote Text</label>
              <input
                type="text"
                value={formData.quoteText}
                onChange={(e) => setFormData(prev => ({ ...prev, quoteText: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 cursor-text"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiImage className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Desktop Image <span className="text-xs text-gray-400">(Upload only)</span>
                </label>
              </div>
              <UploadImage
                value={formData.desktopImage || ''}
                onChange={(file) => handleImageChange('desktopImage', file as any)}
                onRemove={() => removeImage('desktopImage')}
                aspectRatio="square"
                disabled={!isEditing}
              />
              {/* DEBUG: show current value length */}
              <div className="mt-1 text-[10px] text-gray-400">
                debug: desktopImage length = {formData.desktopImage?.length || 0}
              </div>
              {formData.desktopImage && (
                <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Desktop image uploaded
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiImage className="w-4 h-4 text-green-600" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Mobile Image <span className="text-xs text-gray-400">(Upload only)</span>
                </label>
              </div>
              <UploadImage
                value={formData.mobileImage || ''}
                onChange={(file) => handleImageChange('mobileImage', file as any)}
                onRemove={() => removeImage('mobileImage')}
                aspectRatio="square"
                disabled={!isEditing}
              />
              {/* DEBUG: show current value length */}
              <div className="mt-1 text-[10px] text-gray-400">
                debug: mobileImage length = {formData.mobileImage?.length || 0}
              </div>
              {formData.mobileImage && (
                <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Mobile image uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        {(formData.desktopImage || formData.mobileImage) && (
          <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.desktopImage && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Desktop</p>
                  <img 
                    src={formData.desktopImage} 
                    alt="Desktop preview" 
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      console.error('❌ [AboutStats] Desktop image failed to load:', formData.desktopImage?.slice(0, 80));
                    }}
                    onLoad={() => {
                      console.log('✅ [AboutStats] Desktop image loaded');
                    }}
                  />
                </div>
              )}
              {formData.mobileImage && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Mobile</p>
                  <img 
                    src={formData.mobileImage} 
                    alt="Mobile preview" 
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      console.error('❌ [AboutStats] Mobile image failed to load:', formData.mobileImage?.slice(0, 80));
                    }}
                    onLoad={() => {
                      console.log('✅ [AboutStats] Mobile image loaded');
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AboutStatsHandler;