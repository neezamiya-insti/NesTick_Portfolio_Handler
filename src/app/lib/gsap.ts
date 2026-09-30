export interface College {
  template_id: number | undefined;
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  mission: string;
  vision: string;
  logo?: string;
 
  coverImage?: string;
  contact: ContactInfo;
}
/* eslint-disable */

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface Faculty {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  image?: string;
  bio: string;
  order: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  location: string;
  type: 'event' | 'announcement';
  featured: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  category: 'award' | 'photo' | 'achievement';
}

export interface Course {
  id: string;
  name: string;
  duration: string;
  department: string;
  description: string;
  image?: string;
  credits: number;
  syllabus?: string;
  feeStructure?: string;
}

export interface FlexibleSection {
  id: string;
  type: string;
  title: string;
  content: any;
  order: number;
}

export interface CollegeData {
  college: College;
  
  faculty: Faculty[];
  events: Event[];
  gallery: GalleryItem[];
  courses: Course[];
  flexibleSections: FlexibleSection[];
}

export type SectionType = 
  | 'dashboard'
  | 'about'
  | 'faculty'
  | 'events'
  | 'gallery'
  | 'courses'
  | 'contact'
  | 'hero'
  | 'navbar'
  | 'scholarships'
  | 'programs'
  | 'footer'
  | 'stats'
  | 'admission'
  | 'affiliations'
  | 'formmanager'
  | 'aboutcourses'
  | 'scholarshipstats'
  | 'programsstats'
  | 'aboutstats'
  | 'facultystats'
  // ✅ NEW
  | 'aboutjourney'
  | 'faq'
  | 'testimonials'
  | 'flexible'
  | 'corevalues'
  | 'howweteach'
  | 'principalmessage'


export interface SectionConfig {
  id: SectionType;
  title: string;
  description: string;
  icon: string;
}