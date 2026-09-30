/* eslint-disable @typescript-eslint/no-explicit-any */
// app/components/sections/TestimonialsManagement.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { College } from '@/app/lib/gsap';
import { Button } from '@/components/ui/button';
import { UploadImage } from '@/components/ui/UploadImage';
import {
  FiEdit2, FiSave, FiX, FiInfo, FiPlus, FiTrash2, FiCheck,
  FiRefreshCw, FiImage
} from 'react-icons/fi';

interface TestimonialsProps {
  college: College;
  templateId?: number;
}

interface Student {
  id: number;
  name: string;
  tag: string;
  quote: string;
  image: string;
  year: string;
  since: string;
  club: string;
}

interface TestimonialsFormData {
  badgeText: string;
  heading: string;
  description: string;
  hintText: string;
  students: Student[];
}

const defaultFormData: TestimonialsFormData = {
  badgeText: 'Testimonials',
  heading: 'What our students say',
  description:
    'Tap on any student card to read their full story and feedback.',
  hintText: 'Tap on card to read full feedback',
  students: [
    {
      id: 1,
      name: 'Maya K.',
      tag: 'BSCS · ID 2309',
      quote:
        'The library used to be my least favourite place. Now I go there just to think — no one\'s ever told me I was reading the wrong kind of book.',
      image: '',
      year: 'BSCS',
      since: 'Since 2023',
      club: 'Library Club',
    },
    {
      id: 2,
      name: 'Daniyal O.',
      tag: 'BBA · ID 2147',
      quote:
        'I joined the business society to network, if I\'m honest. Stayed three years — it\'s the first time I\'ve actually enjoyed working in a team.',
      image: '',
      year: 'BBA',
      since: 'Since 2021',
      club: 'Business Society',
    },
    {
      id: 3,
      name: 'Sana R.',
      tag: 'BA · ID 2461',
      quote:
        'My professor noticed I\'d gone quiet before I did. She didn\'t make a thing of it — just left space for me to speak when I was ready.',
      image: '',
      year: 'BA',
      since: 'Since 2024',
      club: 'Art Studio',
    },
  ],
};

export function TestimonialsManagement({ college, templateId }: TestimonialsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<TestimonialsFormData>(defaultFormData);
  const [lastUpdated, setLastUpdated] = useState('');

  const getActiveTemplateId = () => templateId || (college as any).template_id || 1;
  const getCollegeId = () => parseInt((college as any).id);

  // ✅ Load
  const loadFromDatabase = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const url = `/api/sections?template_id=${getActiveTemplateId()}&section_name=Testimonials&college_id=${getCollegeId()}&_=${Date.now()}`;

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
                students:
                  Array.isArray(dbContent.students) && dbContent.students.length > 0
                    ? dbContent.students
                    : defaultFormData.students,
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ [Testimonials] Load failed:', error);
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
          section_name: 'Testimonials',
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
      console.error('❌ [Testimonials] Save error:', error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Student handlers
  const addStudent = () => {
    const newId = Math.max(0, ...formData.students.map((s) => s.id)) + 1;
    setFormData((prev) => ({
      ...prev,
      students: [
        ...prev.students,
        {
          id: newId,
          name: 'New Student',
          tag: 'Program · ID 0000',
          quote: 'Student feedback here...',
          image: '',
          year: 'Program',
          since: 'Since 2024',
          club: 'Club',
        },
      ],
    }));
  };

  const updateStudent = (index: number, field: keyof Student, value: string) => {
    const newStudents = [...formData.students];
    newStudents[index] = { ...newStudents[index], [field]: value };
    setFormData((prev) => ({ ...prev, students: newStudents }));
  };

  const removeStudent = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.filter((_, i) => i !== index),
    }));
  };

  // ✅ Image
  const handleImageChange = (index: number, fileOrString: File | string | null) => {
    if (!fileOrString) return;
    if (typeof fileOrString === 'string') {
      const newStudents = [...formData.students];
      newStudents[index] = { ...newStudents[index], image: fileOrString };
      setFormData((prev) => ({ ...prev, students: newStudents }));
      return;
    }
    if (fileOrString instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newStudents = [...formData.students];
        newStudents[index] = { ...newStudents[index], image: reader.result as string };
        setFormData((prev) => ({ ...prev, students: newStudents }));
      };
      reader.readAsDataURL(fileOrString);
    }
  };

  const removeImage = (index: number) => {
    const newStudents = [...formData.students];
    newStudents[index] = { ...newStudents[index], image: '' };
    setFormData((prev) => ({ ...prev, students: newStudents }));
  };

  useEffect(() => {
    loadFromDatabase(true);
  }, [loadFromDatabase]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading Testimonials...</p>
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
              <p className="font-medium">Testimonials Saved!</p>
              <p className="text-sm text-green-100">Data refreshed from database.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials Section</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage student testimonials</p>
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
                <FiEdit2 className="w-4 h-4 mr-2" /> Edit Testimonials
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
                  Add/remove students, edit quotes, and upload photos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Header Text */}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hint Text</label>
              <input
                type="text"
                value={formData.hintText}
                onChange={(e) => setFormData((prev) => ({ ...prev, hintText: e.target.value }))}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-900 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Students ({formData.students.length})
            </h3>
            {isEditing && (
              <Button size="sm" onClick={addStudent} className="bg-teal-600 hover:bg-teal-700 cursor-pointer">
                <FiPlus className="w-3 h-3 mr-1" /> Add Student
              </Button>
            )}
          </div>

          <div className="space-y-5">
            {formData.students.map((student, index) => (
              <div
                key={student.id || index}
                className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Student #{index + 1}</span>
                  {isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => removeStudent(index)} className="text-red-500 cursor-pointer">
                      <FiTrash2 />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => updateStudent(index, 'name', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tag (Program · ID)</label>
                    <input
                      type="text"
                      value={student.tag}
                      onChange={(e) => updateStudent(index, 'tag', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Year / Program</label>
                    <input
                      type="text"
                      value={student.year}
                      onChange={(e) => updateStudent(index, 'year', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Since</label>
                    <input
                      type="text"
                      value={student.since}
                      onChange={(e) => updateStudent(index, 'since', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Club</label>
                    <input
                      type="text"
                      value={student.club}
                      onChange={(e) => updateStudent(index, 'club', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quote</label>
                    <textarea
                      value={student.quote}
                      onChange={(e) => updateStudent(index, 'quote', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <FiImage className="w-4 h-4 text-blue-600" />
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Photo <span className="text-gray-400">(Upload only)</span>
                      </label>
                    </div>
                    <UploadImage
                      value={student.image || ''}
                      onChange={(file) => handleImageChange(index, file as any)}
                      onRemove={() => removeImage(index)}
                      aspectRatio="square"
                      disabled={!isEditing}
                    />
                    {student.image && (
                      <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <FiCheck className="w-3 h-3" /> Photo uploaded
                      </div>
                    )}
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

export default TestimonialsManagement;