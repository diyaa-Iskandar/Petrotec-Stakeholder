export enum Language {
  EN = 'en',
  AR = 'ar',
}

export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
  role?: string;
}

export interface Company {
  id: string;
  name_en: string;
  name_ar: string;
  logo?: string;
  location?: string;
  location_url?: string;
  contact_persons?: ContactPerson[];
  type: 'Client' | 'Contractor' | 'Consultant';
}

export interface Project {
  id: string;
  name_en: string;
  name_ar: string;
  
  // Denormalized fields (for display) - populated from selection
  client_en: string;
  client_ar: string;
  location_en: string;
  location_ar: string;
  
  // References (Optional for backward compatibility/flexibility)
  client_id?: string;
  main_contractor_id?: string;
  consultant_id?: string;

  google_map_url?: string;
  main_contractor?: string; // Display name
  sub_contractor?: string; // Display name (or generic text)
  consultant?: string; // New: Display name
  scope?: string;
  status: 'Active' | 'Completed' | 'On Hold';
  password_hash: string;
  isActive: boolean;
  disciplines: string[];
}

export interface Discipline {
  id: string;
  name_en: string;
  name_ar: string;
  sort_order: number;
}

export interface TeamMember {
  id: string;
  full_name: string;
  job_title_en: string;
  job_title_ar: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  company?: string;
  notes?: string;
  type: 'Internal' | 'External'; // Internal = Team Member, External = Others Member
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  member_id: string;
  discipline: string;
  role_en: string;
  role_ar: string;
  sort_order: number;
}

export interface ProjectCompany {
  id: string;
  project_id: string;
  company_id: string;
  role: 'End Client' | 'Main Contractor' | 'Sub Contractor' | 'Consultant' | 'Other';
}
