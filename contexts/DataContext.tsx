import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, TeamMember, ProjectAssignment, Company, ProjectCompany } from '../types';
import { supabase } from '../src/lib/supabase';

interface DataContextType {
  projects: Project[];
  teamMembers: TeamMember[]; // Internal
  othersMembers: TeamMember[]; // External
  assignments: ProjectAssignment[];
  
  clients: Company[];
  contractors: Company[];
  consultants: Company[];
  projectCompanies: ProjectCompany[];

  loading: boolean;

  // Project Actions
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Team Actions
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;

  // Company Actions
  addCompany: (type: 'Client' | 'Contractor' | 'Consultant', company: Omit<Company, 'id'>) => Promise<void>;
  updateCompany: (type: 'Client' | 'Contractor' | 'Consultant', id: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (type: 'Client' | 'Contractor' | 'Consultant', id: string) => Promise<void>;

  // Assignment Actions
  assignMemberToProject: (assignment: Omit<ProjectAssignment, 'id'>) => Promise<void>;
  removeAssignment: (assignmentId: string) => Promise<void>;
  getProjectTeam: (projectId: string) => any[];

  // Project Company Actions
  addProjectCompany: (pc: Omit<ProjectCompany, 'id'>) => Promise<void>;
  removeProjectCompany: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  
  const [clients, setClients] = useState<Company[]>([]);
  const [contractors, setContractors] = useState<Company[]>([]);
  const [consultants, setConsultants] = useState<Company[]>([]);
  const [projectCompanies, setProjectCompanies] = useState<ProjectCompany[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Derived state
  const teamMembers = allMembers.filter(m => m.type === 'Internal');
  const othersMembers = allMembers.filter(m => m.type === 'External');

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: pData } = await supabase.from('projects').select('*');
            const { data: mData } = await supabase.from('team_members').select('*');
            const { data: aData } = await supabase.from('project_assignments').select('*');
            const { data: cData } = await supabase.from('companies').select('*');
            const { data: pcData } = await supabase.from('project_companies').select('*');

            if (pData) setProjects(pData.map(p => ({...p, isActive: p.is_active})));
            if (mData) setAllMembers(mData);
            if (aData) setAssignments(aData);
            if (cData) {
                setClients(cData.filter((c: any) => c.type === 'Client'));
                setContractors(cData.filter((c: any) => c.type === 'Contractor'));
                setConsultants(cData.filter((c: any) => c.type === 'Consultant'));
            }
            if (pcData) setProjectCompanies(pcData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();

    // Realtime Subscriptions
    const pSub = supabase.channel('projects').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') {
            const newProject = { ...payload.new, isActive: payload.new.is_active } as Project;
            setProjects(prev => prev.some(p => p.id === newProject.id) ? prev : [...prev, newProject]);
        }
        if (payload.eventType === 'UPDATE') {
            const updatedProject = { ...payload.new, isActive: payload.new.is_active } as Project;
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        }
        if (payload.eventType === 'DELETE') {
            setProjects(prev => prev.filter(p => p.id !== payload.old.id));
        }
    }).subscribe();

    const mSub = supabase.channel('team_members').on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, (payload) => {
        if (payload.eventType === 'INSERT') {
            const newMember = payload.new as TeamMember;
            setAllMembers(prev => prev.some(m => m.id === newMember.id) ? prev : [...prev, newMember]);
        }
        if (payload.eventType === 'UPDATE') {
            const updatedMember = payload.new as TeamMember;
            setAllMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
        }
        if (payload.eventType === 'DELETE') {
            setAllMembers(prev => prev.filter(m => m.id !== payload.old.id));
        }
    }).subscribe();

    const aSub = supabase.channel('project_assignments').on('postgres_changes', { event: '*', schema: 'public', table: 'project_assignments' }, (payload) => {
        if (payload.eventType === 'INSERT') {
            const newAssignment = payload.new as ProjectAssignment;
            setAssignments(prev => prev.some(a => a.id === newAssignment.id) ? prev : [...prev, newAssignment]);
        }
        if (payload.eventType === 'UPDATE') {
            const updatedAssignment = payload.new as ProjectAssignment;
            setAssignments(prev => prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a));
        }
        if (payload.eventType === 'DELETE') {
            setAssignments(prev => prev.filter(a => a.id !== payload.old.id));
        }
    }).subscribe();

    const cSub = supabase.channel('companies').on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, (payload) => {
        // Refresh companies on any change for simplicity
        supabase.from('companies').select('*').then(({ data }) => {
            if (data) {
                setClients(data.filter((c: any) => c.type === 'Client'));
                setContractors(data.filter((c: any) => c.type === 'Contractor'));
                setConsultants(data.filter((c: any) => c.type === 'Consultant'));
            }
        });
    }).subscribe();

    const pcSub = supabase.channel('project_companies').on('postgres_changes', { event: '*', schema: 'public', table: 'project_companies' }, (payload) => {
        if (payload.eventType === 'INSERT') {
            const newPC = payload.new as ProjectCompany;
            setProjectCompanies(prev => prev.some(pc => pc.id === newPC.id) ? prev : [...prev, newPC]);
        }
        if (payload.eventType === 'UPDATE') {
            const updatedPC = payload.new as ProjectCompany;
            setProjectCompanies(prev => prev.map(pc => pc.id === updatedPC.id ? updatedPC : pc));
        }
        if (payload.eventType === 'DELETE') {
            setProjectCompanies(prev => prev.filter(pc => pc.id !== payload.old.id));
        }
    }).subscribe();

    return () => {
        supabase.removeChannel(pSub);
        supabase.removeChannel(mSub);
        supabase.removeChannel(aSub);
        supabase.removeChannel(cSub);
        supabase.removeChannel(pcSub);
    };
  }, []);

  // --- Project Actions ---
  const addProject = async (projectData: Omit<Project, 'id'>) => {
    const { isActive, ...rest } = projectData;
    const dbPayload = { ...rest, is_active: isActive };
    const { data, error } = await supabase.from('projects').insert([dbPayload]).select().single();
    if (error) throw error;
    if (data) {
        const newProject = { ...data, isActive: data.is_active } as Project;
        setProjects(prev => prev.some(p => p.id === newProject.id) ? prev : [...prev, newProject]);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { isActive, ...rest } = updates;
    const dbPayload: any = { ...rest };
    if (isActive !== undefined) dbPayload.is_active = isActive;
    const { data, error } = await supabase.from('projects').update(dbPayload).eq('id', id).select().single();
    if (error) throw error;
    if (data) {
        const updatedProject = { ...data, isActive: data.is_active } as Project;
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    }
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // --- Team Actions ---
  const addTeamMember = async (memberData: Omit<TeamMember, 'id'>) => {
    const { data, error } = await supabase.from('team_members').insert([memberData]).select().single();
    if (error) throw error;
    if (data) {
        setAllMembers(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data as TeamMember]);
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    const { data, error } = await supabase.from('team_members').update(updates).eq('id', id).select().single();
    if (error) throw error;
    if (data) {
        setAllMembers(prev => prev.map(m => m.id === data.id ? data as TeamMember : m));
    }
  };

  const deleteTeamMember = async (id: string) => {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) throw error;
    setAllMembers(prev => prev.filter(m => m.id !== id));
  };

  // --- Company Actions ---
  const addCompany = async (type: 'Client' | 'Contractor' | 'Consultant', companyData: Omit<Company, 'id'>) => {
    const { data, error } = await supabase.from('companies').insert([{ ...companyData, type }]).select().single();
    if (error) throw error;
    // For companies, we rely on the subscription or manual refresh because we have separate states (clients, contractors, consultants)
    // But we can update locally too
    if (data) {
        if (type === 'Client') setClients(prev => [...prev, data]);
        if (type === 'Contractor') setContractors(prev => [...prev, data]);
        if (type === 'Consultant') setConsultants(prev => [...prev, data]);
    }
  };

  const updateCompany = async (type: 'Client' | 'Contractor' | 'Consultant', id: string, updates: Partial<Company>) => {
    const { data, error } = await supabase.from('companies').update(updates).eq('id', id).select().single();
    if (error) throw error;
    if (data) {
        if (type === 'Client') setClients(prev => prev.map(c => c.id === id ? data : c));
        if (type === 'Contractor') setContractors(prev => prev.map(c => c.id === id ? data : c));
        if (type === 'Consultant') setConsultants(prev => prev.map(c => c.id === id ? data : c));
    }
  };

  const deleteCompany = async (type: 'Client' | 'Contractor' | 'Consultant', id: string) => {
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) throw error;
    if (type === 'Client') setClients(prev => prev.filter(c => c.id !== id));
    if (type === 'Contractor') setContractors(prev => prev.filter(c => c.id !== id));
    if (type === 'Consultant') setConsultants(prev => prev.filter(c => c.id !== id));
  };

  // --- Assignment Actions ---
  const assignMemberToProject = async (data: Omit<ProjectAssignment, 'id'>) => {
    const { data: newAssignment, error } = await supabase.from('project_assignments').insert([data]).select().single();
    if (error) throw error;
    if (newAssignment) {
        setAssignments(prev => prev.some(a => a.id === newAssignment.id) ? prev : [...prev, newAssignment as ProjectAssignment]);
    }
  };

  const removeAssignment = async (id: string) => {
    const { error } = await supabase.from('project_assignments').delete().eq('id', id);
    if (error) throw error;
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const getProjectTeam = (projectId: string) => {
    const projectAssignments = assignments.filter(a => a.project_id === projectId);
    return projectAssignments.map(a => {
      const member = allMembers.find(m => m.id === a.member_id);
      if (!member) return null;
      return {
        ...member,
        role_en: a.role_en,
        role_ar: a.role_ar,
        discipline: a.discipline,
        assignment_id: a.id,
        assignment_sort_order: a.sort_order
      };
    }).filter(Boolean);
  };

  // --- Project Company Actions ---
  const addProjectCompany = async (pc: Omit<ProjectCompany, 'id'>) => {
      const { data, error } = await supabase.from('project_companies').insert([pc]).select().single();
      if (error) throw error;
      if (data) {
          setProjectCompanies(prev => prev.some(p => p.id === data.id) ? prev : [...prev, data as ProjectCompany]);
      }
  };

  const removeProjectCompany = async (id: string) => {
      const { error } = await supabase.from('project_companies').delete().eq('id', id);
      if (error) throw error;
      setProjectCompanies(prev => prev.filter(pc => pc.id !== id));
  };

  return (
    <DataContext.Provider value={{
      projects,
      teamMembers,
      othersMembers,
      assignments,
      clients,
      contractors,
      consultants,
      projectCompanies,
      loading,
      addProject,
      updateProject,
      deleteProject,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      addCompany,
      updateCompany,
      deleteCompany,
      assignMemberToProject,
      removeAssignment,
      getProjectTeam,
      addProjectCompany,
      removeProjectCompany
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
