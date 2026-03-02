import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProjectAuth } from '../contexts/ProjectAuthContext';
import { useData } from '../contexts/DataContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Lock, Search, Phone, Mail, MessageCircle, Copy, Check, Filter, ShieldAlert, ArrowLeft, ExternalLink, HardHat, FileText, Building2, MapPin, X, Globe, Users, Sun, Moon, ChevronDown, ChevronUp, Briefcase, Plus } from 'lucide-react';
import { Company, TeamMember } from '../types';
import { Language } from '../types';
import { CompanyLogo } from '../components/CompanyLogo';

const CollapsibleCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; count?: number }> = ({ title, icon, children, defaultOpen = false, count }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
          {icon}
          {title}
          {count !== undefined && (
            <span className="text-sm font-bold text-petrotec-600 dark:text-petrotec-400 bg-petrotec-50 dark:bg-petrotec-900/30 px-3 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={24} className="text-gray-500" /> : <ChevronDown size={24} className="text-gray-500" />}
      </button>
      {isOpen && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const MemberCard: React.FC<{ s: any; isEn: boolean; t: any; copyToClipboard: (text: string, id: string) => void; copiedId: string | null }> = ({ s, isEn, t, copyToClipboard, copiedId }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-petrotec-600 transition-colors">{s.full_name}</h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {isEn ? s.job_title_en : s.job_title_ar}
          </p>
          <div className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-petrotec-50 text-petrotec-700 dark:bg-petrotec-900/30 dark:text-petrotec-300 border border-petrotec-100 dark:border-petrotec-800">
            {isEn ? s.role_en : s.role_ar}
          </div>
        </div>
    </div>

    {/* Actions */}
    <div className="grid grid-cols-2 gap-3 mb-4">
        <a 
            href={`tel:${s.phone}`} 
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 hover:bg-green-500 hover:text-white text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-green-600 transition-all font-semibold text-sm"
        >
            <Phone size={16} />
            {t('call')}
        </a>
        {s.whatsapp ? (
            <a 
                href={`https://wa.me/${s.whatsapp.replace('+', '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 hover:bg-emerald-500 hover:text-white text-gray-700 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-emerald-600 transition-all font-semibold text-sm"
            >
                <MessageCircle size={16} />
                {t('whatsapp')}
            </a>
        ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl"></div>
        )}
    </div>

    <div className="space-y-2">
        {/* Phone Display */}
        <button 
          onClick={() => copyToClipboard(s.phone, `phone-${s.id}`)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all group/item"
        >
          <span className="font-mono">{s.phone}</span>
          {copiedId === `phone-${s.id}` ? <Check size={14} className="text-green-500"/> : <Copy size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity"/>}
        </button>

        {/* Email Display */}
        {s.email && (
          <a 
            href={`mailto:${s.email}`} 
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all group/item"
          >
            <span className="truncate">{s.email}</span>
            <Mail size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity"/>
          </a>
        )}
    </div>
  </div>
);

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isProjectAuthorized, authorizeProject, refreshProjectSession } = useProjectAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { projects, getProjectTeam, projectCompanies, clients, contractors, consultants, othersMembers, addTeamMember, assignMemberToProject } = useData();
  const isEn = language === 'en';

  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  
  // Directory States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHasWhatsapp, setFilterHasWhatsapp] = useState(false);
  const [filterHasEmail, setFilterHasEmail] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSuggestingMember, setIsSuggestingMember] = useState(false);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
      full_name: '', job_title_en: '', phone: '', email: '', type: 'External'
  });
  const [newMemberRole, setNewMemberRole] = useState('');

  const project = projects.find(p => p.id === id);

  const toggleLanguage = () => {
    setLanguage(language === Language.EN ? Language.AR : Language.EN);
  };

  // --- Session Logic ---
  useEffect(() => {
    if (!project) return;
    
    const checkAuth = () => {
        const authorized = isProjectAuthorized(project.id);
        setIsLocked(!authorized);
    };

    checkAuth(); 

    const interval = setInterval(checkAuth, 1000); 
    return () => clearInterval(interval);
  }, [project, isProjectAuthorized]);

  useEffect(() => {
    if (isLocked) return;

    const handleActivity = () => {
        if (project) {
            refreshProjectSession(project.id);
        }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('click', handleActivity);
        window.removeEventListener('touchstart', handleActivity);
    };
  }, [isLocked, project, refreshProjectSession]);


  if (!project) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <ShieldAlert size={64} className="text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200">Project Not Found</h2>
            <Link to="/projects" className="mt-4 text-petrotec-600 hover:underline">{t('backToProjects')}</Link>
        </div>
    );
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === project.password_hash) {
      authorizeProject(project.id);
      setIsLocked(false);
      setErrorMsg('');
    } else {
      setErrorMsg(t('wrongPassword'));
    }
  };

  // --- Data Logic ---
  const projectTeam = useMemo(() => {
    if (isLocked) return [];
    
    // 1. Get explicitly assigned members (only Approved)
    const assigned = getProjectTeam(project.id).filter(a => a.assignment_status === 'Approved');
    
    // 2. Get auto-included company employees
    const involvedCompanyIds = projectCompanies
        .filter(pc => pc.project_id === project.id)
        .map(pc => pc.company_id);
    
    const companyEmployees = othersMembers.filter(m => m.company_id && involvedCompanyIds.includes(m.company_id));
    
    // Merge them, avoiding duplicates
    const assignedIds = new Set(assigned.map(a => a.id));
    const autoIncluded = companyEmployees.filter(m => !assignedIds.has(m.id)).map(m => ({
        ...m,
        role_en: 'Company Staff',
        role_ar: 'موظف شركة',
        discipline: 'Other',
        assignment_sort_order: 999
    }));

    return [...assigned, ...autoIncluded];
  }, [isLocked, project.id, getProjectTeam, projectCompanies, othersMembers]);

  const { filteredManagers, filteredInternal, filteredExternal } = useMemo(() => {
    let filtered = projectTeam.filter(s => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        s.full_name.toLowerCase().includes(search) ||
        s.role_en.toLowerCase().includes(search) ||
        s.role_ar.includes(search);
      
      const matchesWa = filterHasWhatsapp ? !!s.whatsapp : true;
      const matchesEmail = filterHasEmail ? !!s.email : true;

      return matchesSearch && matchesWa && matchesEmail;
    });

    const managers = filtered.filter(m => m.role_en.toLowerCase().includes('manager') || m.role_ar.includes('مدير'));
    const internal = filtered.filter(m => m.type === 'Internal' && !managers.includes(m));
    const external = filtered.filter(m => m.type === 'External' && !managers.includes(m));

    return { filteredManagers: managers, filteredInternal: internal, filteredExternal: external };
  }, [projectTeam, searchTerm, filterHasWhatsapp, filterHasEmail]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get Project Partners
  const partners = useMemo(() => {
      if (isLocked) return [];
      const allCompanies = [...clients, ...contractors, ...consultants];
      return projectCompanies
        .filter(pc => pc.project_id === project.id)
        .map(pc => {
            const company = allCompanies.find(c => c.id === pc.company_id);
            return { ...pc, company };
        })
        .filter(item => {
            if (!item.company) return false;
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                item.company.name_en.toLowerCase().includes(search) ||
                (item.company.name_ar && item.company.name_ar.includes(search)) ||
                item.role.toLowerCase().includes(search)
            );
        });
  }, [isLocked, projectCompanies, project.id, clients, contractors, consultants, searchTerm]);


  const handleSuggestMember = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newMember.full_name) {
          try {
              // 1. Create the team member
              const createdMember = await addTeamMember(newMember as any);
              
              if (createdMember) {
                  // 2. Create pending assignment
                  await assignMemberToProject({
                      project_id: project.id,
                      member_id: createdMember.id,
                      discipline: 'Other',
                      role_en: newMemberRole,
                      role_ar: newMemberRole,
                      sort_order: 999,
                      status: 'Pending'
                  });
                  
                  alert(isEn ? 'Member suggestion submitted for approval.' : 'تم إرسال اقتراح العضو للموافقة.');
                  setIsSuggestingMember(false);
                  setNewMember({ full_name: '', job_title_en: '', phone: '', email: '', type: 'External' });
                  setNewMemberRole('');
              }
          } catch (error) {
              console.error('Error suggesting member:', error);
              alert(isEn ? 'Error submitting suggestion.' : 'حدث خطأ أثناء إرسال الاقتراح.');
          }
      }
  };

  // --- Render: Locked ---
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
        <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-petrotec-600 to-cyan-400"></div>
          <div className="flex justify-center mb-8">
            <div className="p-5 bg-gradient-to-br from-petrotec-100 to-white dark:from-petrotec-900/30 dark:to-gray-800 rounded-2xl shadow-inner">
              <Lock size={48} className="text-petrotec-600 dark:text-petrotec-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900 dark:text-white">
            {isEn ? project.name_en : project.name_ar}
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8 font-medium">
            {t('projectLockedMsg')}
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <Input
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="text-center text-2xl tracking-[0.5em] font-bold h-14"
                autoFocus
              />
            </div>
            {errorMsg && (
              <p className="text-red-500 text-sm text-center animate-pulse bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">
                  {errorMsg}
              </p>
            )}
            <Button type="submit" className="w-full h-14 text-lg shadow-petrotec-500/40 hover:shadow-petrotec-500/60">
              {t('submit')}
            </Button>
          </form>
          <div className="mt-8 text-center">
            <Link to="/projects" className="text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-center gap-2">
              <ArrowLeft size={14}/>
              {t('backToProjects')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Directory ---
  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
      
      {/* Header Info */}
      <div className="mb-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
         {/* Top Banner */}
         <div className="bg-gradient-to-r from-petrotec-900 to-slate-900 p-8 text-white relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-petrotec-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="relative z-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-petrotec-300 text-sm uppercase tracking-wider font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            {t(project.status === 'Active' ? 'active' : project.status === 'Completed' ? 'completed' : 'onHold')}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 leading-tight">
                            {isEn ? project.name_en : project.name_ar}
                        </h1>
                        <p className="text-gray-300 flex items-center gap-2">
                             <MapPin size={16} /> {isEn ? project.location_en : project.location_ar}
                        </p>
                    </div>

                    {project.google_map_url && (
                        <a 
                            href={project.google_map_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl transition-all text-white font-semibold"
                        >
                            <ExternalLink size={20} />
                            {t('openMap')}
                        </a>
                    )}
                 </div>
             </div>
         </div>

         {/* Project Scope */}
         <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-2 text-gray-500 mb-1 font-semibold text-sm">
                 <FileText size={16}/> {t('projectScope')}
             </div>
             <div className="text-gray-900 dark:text-gray-200 font-medium">{project.scope || "General Engineering Services"}</div>
         </div>
      </div>

      {/* Stakeholders Blocks */}
      <CollapsibleCard title={t('stakeholders')} icon={<Building2 className="text-petrotec-600"/>} defaultOpen={true} count={partners.length}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((p, idx) => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedCompany(p.company!)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                      <div className="flex items-start justify-between mb-4">
                          <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700 p-2 overflow-hidden">
                              <CompanyLogo logo={p.company!.logo} name={p.company!.name_en} id={p.company!.id} className="w-full h-full" iconSize={32} />
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-petrotec-50 text-petrotec-700 dark:bg-petrotec-900/30 dark:text-petrotec-300 border border-petrotec-100 dark:border-petrotec-800">
                              {t(p.role === 'End Client' ? 'endClient' : p.role === 'Main Contractor' ? 'mainContractor' : p.role === 'Sub Contractor' ? 'subContractor' : p.role === 'Consultant' ? 'consultant' : 'other')}
                          </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-petrotec-600 transition-colors line-clamp-2">
                          {isEn ? p.company!.name_en : (p.company!.name_ar || p.company!.name_en)}
                      </h3>
                      {p.company!.location && (
                          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                              <MapPin size={14}/> {p.company!.location}
                          </p>
                      )}
                  </div>
              ))}
              {partners.length === 0 && (
                  <div className="col-span-full py-10 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                      {t('noPartners')}
                  </div>
              )}
          </div>
      </CollapsibleCard>

      {/* Sticky Search & Filter */}
      <div className="sticky top-4 z-30 mb-8">
         <div className="glass-panel p-3 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3">
             <div className="relative flex-grow">
                <Input 
                  placeholder={t('searchPlaceholder')} 
                  icon={<Search size={20} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!bg-gray-100/50 dark:!bg-gray-800/50 border-transparent focus:bg-white dark:focus:bg-gray-800"
                />
             </div>
             <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterHasWhatsapp(!filterHasWhatsapp)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2
                    ${filterHasWhatsapp 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  <MessageCircle size={16} />
                  <span className="hidden sm:inline">{t('hasWhatsapp')}</span>
                </button>
                <button 
                  onClick={() => setFilterHasEmail(!filterHasEmail)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2
                    ${filterHasEmail 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  <Mail size={16} />
                  <span className="hidden sm:inline">{t('hasEmail')}</span>
                </button>
                <button 
                  onClick={() => setIsSuggestingMember(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 bg-petrotec-600 text-white hover:bg-petrotec-700 shadow-lg shadow-petrotec-500/30"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">{isEn ? 'Suggest Member' : 'اقتراح عضو'}</span>
                </button>
             </div>
         </div>
      </div>

      {/* Team Lists */}
      <div className="space-y-6">
        {filteredManagers.length > 0 && (
            <CollapsibleCard title={t('managers')} icon={<Briefcase className="text-petrotec-600"/>} defaultOpen={true} count={filteredManagers.length}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredManagers.map(s => (
                        <MemberCard key={s.id} s={s} isEn={isEn} t={t} copyToClipboard={copyToClipboard} copiedId={copiedId} />
                    ))}
                </div>
            </CollapsibleCard>
        )}

        {filteredInternal.length > 0 && (
            <CollapsibleCard title={t('teamMembers')} icon={<HardHat className="text-petrotec-600"/>} defaultOpen={true} count={filteredInternal.length}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredInternal.map(s => (
                        <MemberCard key={s.id} s={s} isEn={isEn} t={t} copyToClipboard={copyToClipboard} copiedId={copiedId} />
                    ))}
                </div>
            </CollapsibleCard>
        )}

        {filteredExternal.length > 0 && (
            <CollapsibleCard title={t('other')} icon={<Users className="text-petrotec-600"/>} defaultOpen={true} count={filteredExternal.length}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredExternal.map(s => (
                        <MemberCard key={s.id} s={s} isEn={isEn} t={t} copyToClipboard={copyToClipboard} copiedId={copiedId} />
                    ))}
                </div>
            </CollapsibleCard>
        )}

        {filteredManagers.length === 0 && filteredInternal.length === 0 && filteredExternal.length === 0 && (
          <div className="py-20 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
             <Filter size={48} className="mx-auto mb-4 opacity-20"/>
             <p className="text-lg font-medium">{t('noResults')}</p>
             <p className="text-sm opacity-60">Check your filters or search term</p>
          </div>
        )}
      </div>

      {/* Company Details Modal */}
      {selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedCompany(null)}>
              <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 p-2 overflow-hidden">
                              <CompanyLogo logo={selectedCompany.logo} name={selectedCompany.name_en} id={selectedCompany.id} className="w-full h-full" iconSize={32} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold dark:text-white">{isEn ? selectedCompany.name_en : (selectedCompany.name_ar || selectedCompany.name_en)}</h3>
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin size={14}/> {selectedCompany.location || 'No Location'}
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setSelectedCompany(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                          <X size={20} className="text-gray-500"/>
                      </button>
                  </div>
                  
                  <div className="p-6">
                      {selectedCompany.location_url && (
                          <a 
                              href={selectedCompany.location_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:underline mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl w-fit"
                          >
                              <Globe size={16}/> {t('openMap')}
                          </a>
                      )}

                      <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Users size={18} className="text-petrotec-600"/> {t('teamMembers')}
                      </h4>
                      
                      <div className="space-y-3">
                          {selectedCompany.contact_persons && selectedCompany.contact_persons.length > 0 ? (
                              selectedCompany.contact_persons.map((p, i) => (
                                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                      <div>
                                          <div className="font-bold dark:text-white">{p.name}</div>
                                          <div className="text-sm text-gray-500">{p.role}</div>
                                      </div>
                                      <div className="flex gap-2">
                                          {p.phone && (
                                              <a href={`tel:${p.phone}`} className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:text-green-600 hover:shadow-sm transition-all border border-gray-200 dark:border-gray-700">
                                                  <Phone size={18}/>
                                              </a>
                                          )}
                                          {p.email && (
                                              <a href={`mailto:${p.email}`} className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:shadow-sm transition-all border border-gray-200 dark:border-gray-700">
                                                  <Mail size={18}/>
                                              </a>
                                          )}
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <div className="text-center text-gray-400 py-4 italic">{t('noTeamAssigned')}</div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Suggest Member Modal */}
      {isSuggestingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsSuggestingMember(false)}>
              <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="text-xl font-bold dark:text-white">{isEn ? 'Suggest Team Member' : 'اقتراح عضو للفريق'}</h3>
                      <button onClick={() => setIsSuggestingMember(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                          <X size={20} className="text-gray-500"/>
                      </button>
                  </div>
                  <form onSubmit={handleSuggestMember} className="p-6 space-y-4">
                      <p className="text-sm text-gray-500 mb-4">
                          {isEn ? 'This member will be added to the project after admin approval.' : 'سيتم إضافة هذا العضو للمشروع بعد موافقة الإدارة.'}
                      </p>
                      <Input label={t('fullName')} value={newMember.full_name} onChange={e => setNewMember({...newMember, full_name: e.target.value})} required />
                      <Input label={t('jobTitleEn')} value={newMember.job_title_en} onChange={e => setNewMember({...newMember, job_title_en: e.target.value})} required />
                      <Input label={t('phoneNumber')} value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} required />
                      <Input label={t('email')} value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
                      <Input label={isEn ? 'Role in Project' : 'الدور في المشروع'} value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)} required />
                      
                      <div className="flex justify-end gap-2 mt-6">
                          <Button type="button" variant="ghost" onClick={() => setIsSuggestingMember(false)}>{t('cancel')}</Button>
                          <Button type="submit">{t('submit')}</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
