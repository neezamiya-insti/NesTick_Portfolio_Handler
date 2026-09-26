/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/components/sections/ProgramsStatsHandler.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import { UploadImage } from '@/components/ui/UploadImage';
import { 
  FiEdit2, FiSave, FiX, FiInfo, FiPlus, FiTrash2, FiCheck,
  FiRefreshCw, FiBook, FiTarget, FiUsers, FiAward
} from 'react-icons/fi';

interface ProgramsStatsHandlerProps {
  college: College;
  templateId?: number;
}

interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  clipPath: string;
  desktopImage: string;
  position: 'left-up' | 'left-down' | 'right-up' | 'right-down';
}

interface ProgramsStatsFormData {
  badgeText: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  centerImage: string;
  features: FeatureCard[];
}

const defaultFeatures: FeatureCard[] = [
  {
    id: 'feature1',
    title: 'Diverse',
    subtitle: 'Programs',
    description: 'Wide range of undergraduate and graduate programs.',
    icon: 'BookOpen',
    color: 'blue',
    clipPath: "path('M5,5 L140,25 Q155,30 155,45 L155,230 Q155,245 140,245 L15,245 Q5,245 5,230 Z')",
    desktopImage: '',
    position: 'left-up'
  },
  {
    id: 'feature2',
    title: 'Industry',
    subtitle: 'Relevant',
    description: 'Curriculum designed to meet real-world industry needs.',
    icon: 'Target',
    color: 'indigo',
    clipPath: "path('M5,5 L140,25 Q155,30 155,45 L155,240 Q155,255 140,255 L15,255 Q5,255 5,240 Z')",
    desktopImage: '',
    position: 'left-down'
  },
  {
    id: 'feature3',
    title: 'Expert',
    subtitle: 'Faculty',
    description: 'Learn from experienced educators and industry leaders.',
    icon: 'Users',
    color: 'purple',
    clipPath: "path('M150,5 L15,25 Q0,30 0,45 L0,240 Q0,255 15,255 L140,255 Q150,255 150,240 Z')",
    desktopImage: '',
    position: 'right-up'
  },
  {
    id: 'feature4',
    title: 'Career',
    subtitle: 'Focused',
    description: 'Build skills for a successful and impactful career.',
    icon: 'Award',
    color: 'teal',
    clipPath: "path('M150,5 L15,25 Q0,30 0,45 L0,230 Q0,245 15,245 L140,245 Q150,245 150,230 Z')",
    desktopImage: '',
    position: 'right-down'
  }
];

const defaultFormData: ProgramsStatsFormData = {
  badgeText: 'ACADEMIC EXCELLENCE',
  title: 'Comprehensive Programs',
  subtitle: 'Choose from a diverse range of undergraduate and graduate programs designed to equip you with the skills needed for tomorrow\'s challenges.',
  buttonText: 'Browse Programs',
  buttonLink: '/Programms',
  centerImage: '',
  features: defaultFeatures
};

const iconMap: Record<string, any> = {
  BookOpen: FiBook,
  Target: FiTarget,
  Users: FiUsers,
  Award: FiAward
};

const colorMap: Record<string, { from: string; to: string; shadow: string }> = {
  blue: { from: '#3b82f6', to: '#2563eb', shadow: 'rgba(37,99,235,0.4)' },
  indigo: { from: '#6366f1', to: '#4f46e5', shadow: 'rgba(99,102,241,0.4)' },
  purple: { from: '#a855f7', to: '#9333ea', shadow: 'rgba(168,85,247,0.4)' },
  teal: { from: '#14b8a6', to: '#0d9488', shadow: 'rgba(20,184,166,0.4)' }
};

export function ProgramsStatsHandler({ college, templateId }: ProgramsStatsHandlerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<ProgramsStatsFormData>(defaultFormData);
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
      const url = `/api/sections?template_id=${activeTemplateId}&section_name=ProgramsStats&college_id=${collegeId}&_=${timestamp}`;
      
      console.log('🔄 [ProgramsStats] Loading from:', url);
      
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 [ProgramsStats] API Response:', data);
        
        if (data.sections && data.sections.length > 0) {
          const dbContent = data.sections[0].content;
          setLastUpdated(data.sections[0].updated_at);
          
          if (dbContent && Object.keys(dbContent).length > 0) {
            console.log('📋 [ProgramsStats] DB content:', dbContent);
            setFormData({
              ...defaultFormData,
              ...dbContent,
              features: dbContent.features || defaultFormData.features
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ [ProgramsStats] Failed to load:', error);
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
      
      console.log('💾 [ProgramsStats] Saving formData:', formData);
      
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: activeTemplateId,
          section_name: "ProgramsStats",
          college_id: collegeId,
          content: formData
        })
      });
      
      if (response.ok) {
        console.log('✅ [ProgramsStats] Save successful');
        setShowSuccessPopup(true);
        setIsEditing(false);
        await loadFromDatabase(false);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        const errText = await response.text();
        console.error('❌ [ProgramsStats] Save failed:', errText);
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('❌ [ProgramsStats] Error saving:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Feature handlers
  const addFeature = () => {
    console.log('➕ [ProgramsStats] Adding new feature');
    const newId = `feature${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, {
        id: newId,
        title: 'New',
        subtitle: 'Feature',
        description: 'Description here...',
        icon: 'BookOpen',
        color: 'blue',
        clipPath: "path('M5,5 L140,25 Q155,30 155,45 L155,230 Q155,245 140,245 L15,245 Q5,245 5,230 Z')",
        desktopImage: '',
        position: 'left-up'
      }]
    }));
  };

  const updateFeature = (index: number, field: string, value: string) => {
    console.log(`✏️ [ProgramsStats] updateFeature [${index}].${field}:`, value?.slice?.(0, 60));
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (index: number) => {
    console.log(`🗑️ [ProgramsStats] Removing feature at index ${index}`);
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // ✅ Image handler for centerImage — FIXED to accept BOTH File and string
  const handleImageChange = (
    key: 'centerImage',
    fileOrString: File | string | null
  ) => {
    console.log('🔵 [ProgramsStats] handleImageChange (center) called', {
      key,
      typeofValue: typeof fileOrString,
      isFile: fileOrString instanceof File,
      valuePreview:
        typeof fileOrString === 'string'
          ? fileOrString.slice(0, 80)
          : fileOrString?.name || '(non-string)',
    });

    if (!fileOrString) {
      console.warn('⚠️ [ProgramsStats] Empty fileOrString received, ignoring.');
      return;
    }

    // ✅ Case 1: Already a string (base64/URL) → use directly
    if (typeof fileOrString === 'string') {
      console.log('🟡 [ProgramsStats] String received — using directly');
      setFormData(prev => {
        console.log('🟢 [ProgramsStats] Updated centerImage, length:', fileOrString.length);
        return { ...prev, [key]: fileOrString };
      });
      return;
    }

    // ✅ Case 2: File object → convert via FileReader
    if (fileOrString instanceof File) {
      console.log('🟠 [ProgramsStats] File received — starting FileReader');
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('🟢 [ProgramsStats] FileReader done. base64 length:', result?.length);
        setFormData(prev => ({ ...prev, [key]: result }));
      };
      reader.onerror = (err) => {
        console.error('❌ [ProgramsStats] FileReader error:', err);
      };
      reader.readAsDataURL(fileOrString);
      return;
    }

    console.error('❌ [ProgramsStats] Unsupported type:', fileOrString);
  };

  // ✅ Image handler for feature cards — FIXED to accept BOTH File and string
  const handleFeatureImageChange = (
    index: number,
    fileOrString: File | string | null
  ) => {
    console.log('🔵 [ProgramsStats] handleFeatureImageChange called', {
      index,
      typeofValue: typeof fileOrString,
      isFile: fileOrString instanceof File,
      valuePreview:
        typeof fileOrString === 'string'
          ? fileOrString.slice(0, 80)
          : fileOrString?.name || '(non-string)',
    });

    if (!fileOrString) {
      console.warn('⚠️ [ProgramsStats] Empty fileOrString received, ignoring.');
      return;
    }

    // ✅ Case 1: Already a string
    if (typeof fileOrString === 'string') {
      console.log('🟡 [ProgramsStats] String received — using directly');
      setFormData(prev => {
        const newFeatures = [...prev.features];
        newFeatures[index] = { ...newFeatures[index], desktopImage: fileOrString };
        console.log('🟢 [ProgramsStats] Updated feature image, length:', fileOrString.length);
        return { ...prev, features: newFeatures };
      });
      return;
    }

    // ✅ Case 2: File object
    if (fileOrString instanceof File) {
      console.log('🟠 [ProgramsStats] File received — starting FileReader');
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('🟢 [ProgramsStats] FileReader done. base64 length:', result?.length);
        setFormData(prev => {
          const newFeatures = [...prev.features];
          newFeatures[index] = { ...newFeatures[index], desktopImage: result };
          return { ...prev, features: newFeatures };
        });
      };
      reader.onerror = (err) => {
        console.error('❌ [ProgramsStats] FileReader error:', err);
      };
      reader.readAsDataURL(fileOrString);
      return;
    }

    console.error('❌ [ProgramsStats] Unsupported type:', fileOrString);
  };

  // ✅ Remove feature image handler
  const removeFeatureImage = (index: number) => {
    console.log(`🗑️ [ProgramsStats] Removing feature ${index} image`);
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], desktopImage: '' };
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  useEffect(() => {
    loadFromDatabase(true);
  }, [loadFromDatabase]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading programs stats data...</p>
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
              <p className="font-medium">Programs Stats Saved Successfully!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Programs Stats Section</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage programs stats content</p>
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
                <FiEdit2 className="w-4 h-4 mr-2" /> Edit Stats
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600 cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">Subtitle</label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                disabled={!isEditing}
                rows={3}
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
          </div>
        </div>

        {/* Center Image */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Center Image</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 cursor-pointer">
              Center Image <span className="text-xs text-gray-400">(Upload only)</span>
            </label>
            <UploadImage
              value={formData.centerImage || ''}
              onChange={(file) => handleImageChange('centerImage', file as any)}
              onRemove={() => setFormData(prev => ({ ...prev, centerImage: '' }))}
              aspectRatio="portrait"
              disabled={!isEditing}
            />
            {/* DEBUG: show current value length */}
            <div className="mt-1 text-[10px] text-gray-400">
              debug: centerImage length = {formData.centerImage?.length || 0}
            </div>
            {formData.centerImage && (
              <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <FiCheck className="w-3 h-3" /> Center image uploaded
              </div>
            )}
          </div>
        </div>

        {/* Features Cards */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feature Cards</h3>
            {isEditing && (
              <Button size="sm" onClick={addFeature} className="bg-teal-600 hover:bg-teal-700 cursor-pointer">
                <FiPlus className="w-3 h-3 mr-1" /> Add Feature
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {formData.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || FiBook;
              const colors = colorMap[feature.color] || colorMap.blue;
              return (
                <div key={feature.id} className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Feature #{index + 1}</span>
                    {isEditing && (
                      <Button variant="ghost" size="sm" onClick={() => removeFeature(index)} className="text-red-500 cursor-pointer">
                        <FiTrash2 />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">Title</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 cursor-text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">Subtitle</label>
                      <input
                        type="text"
                        value={feature.subtitle}
                        onChange={(e) => updateFeature(index, 'subtitle', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 cursor-text"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">Description</label>
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 cursor-text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">Icon</label>
                      <select
                        value={feature.icon}
                        onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 cursor-pointer"
                      >
                        <option value="BookOpen">Book</option>
                        <option value="Target">Target</option>
                        <option value="Users">Users</option>
                        <option value="Award">Award</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">Color</label>
                      <select
                        value={feature.color}
                        onChange={(e) => updateFeature(index, 'color', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 cursor-pointer"
                      >
                        <option value="blue">Blue</option>
                        <option value="indigo">Indigo</option>
                        <option value="purple">Purple</option>
                        <option value="teal">Teal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">Position</label>
                      <select
                        value={feature.position}
                        onChange={(e) => updateFeature(index, 'position', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 cursor-pointer"
                      >
                        <option value="left-up">Left Up</option>
                        <option value="left-down">Left Down</option>
                        <option value="right-up">Right Up</option>
                        <option value="right-down">Right Down</option>
                      </select>
                    </div>
                  </div>

                  {/* Desktop Image Only */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer">
                      Desktop Image <span className="text-xs text-gray-400">(Upload only)</span>
                    </label>
                    <UploadImage
                      value={feature.desktopImage || ''}
                      onChange={(file) => handleFeatureImageChange(index, file as any)}
                      onRemove={() => removeFeatureImage(index)}
                      aspectRatio="square"
                      disabled={!isEditing}
                    />
                    {/* DEBUG: show current value length */}
                    <div className="mt-1 text-[10px] text-gray-400">
                      debug: feature[{index}].desktopImage length = {feature.desktopImage?.length || 0}
                    </div>
                    {feature.desktopImage && (
                      <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <FiCheck className="w-3 h-3" /> Feature image uploaded
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {formData.features.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No features added yet. Click "Add Feature" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProgramsStatsHandler;