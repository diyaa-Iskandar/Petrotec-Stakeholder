import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogOut, LayoutGrid, Users, Plus, Trash2, Edit2, X, Search, Briefcase, Home, Menu, Building2, HardHat, UserPlus, FileText, MapPin, Sun, Moon, Globe, CheckCircle, Bell, Phone, Mail } from 'lucide-react';
import { Project, TeamMember, ProjectAssignment, ProjectCompany } from '../../types';
import { CompanyManager } from './CompanyManager';
import { TeamManager } from './TeamManager';
import { Language } from '../../types';

// --- Sub-Components ---

// Tag Input Component for Dynamic Disciplines
const TagInput = ({ tags, onChange }: { tags: string[], onChange: (tags: string[]) => void }) => {
    const [input, setInput] = useState('');
    const { t } = useLanguage();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const trimmed = input.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
            setInput('');
        }
    };

    const removeTag = (tag: string) => {
        onChange(tags.filter(t => t !== tag));
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">{t('disciplineEn')} / {t('disciplineAr')}</label>
            <div className="flex gap-2 mb-2">
                <Input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder={t('addDisciplinePlaceholder')} 
                />
                <Button type="button" onClick={addTag} icon={<Plus size={18}/>} className="flex-shrink-0" />
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-petrotec-50 dark:bg-petrotec-900/30 text-petrotec-700 dark:text-petrotec-300 rounded-full text-sm font-medium flex items-center gap-1 border border-petrotec-100 dark:border-petrotec-800">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14}/></button>
                    </span>
                ))}
            </div>
        </div>
    );
};

// 1. Project List & Create Modal
const ManageProjects = ({ onEditProject }: { onEditProject: (p: Project) => void }) => {
  const { projects, addProject, deleteProject } = useData();
  const { t, language } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name_en: '', name_ar: '', 
    status: 'Active', password_hash: '', isActive: true,
    disciplines: ['Management', 'Construction', 'HSE', 'QA/QC', 'Technical Office']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name_en && newProject.password_hash) {
      await addProject(newProject as any);
      setIsCreating(false);
      alert(t('projectCreatedSuccess'));
      setNewProject({ 
          name_en: '', name_ar: '', status: 'Active', password_hash: '', isActive: true,
          disciplines: ['Management', 'Construction', 'HSE', 'QA/QC', 'Technical Office']
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('projectDirectory')}</h2>
        <Button onClick={() => setIsCreating(true)} icon={<Plus size={18} />}>{t('newProject')}</Button>
      </div>

      {isCreating && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-petrotec-200 dark:border-gray-700 shadow-xl animate-fade-in">
          <h3 className="font-bold mb-4 text-lg dark:text-white">{t('createProject')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('nameEn')} value={newProject.name_en} onChange={e => setNewProject({...newProject, name_en: e.target.value})} required />
                <Input label={t('nameAr')} value={newProject.name_ar} onChange={e => setNewProject({...newProject, name_ar: e.target.value})} />
                <Input label={t('password')} value={newProject.password_hash} onChange={e => setNewProject({...newProject, password_hash: e.target.value})} required />
                <div>
                    <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">{t('status')}</label>
                    <select 
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/50"
                        value={newProject.status}
                        onChange={(e) => setNewProject({...newProject, status: e.target.value as any})}
                    >
                        <option value="Active">{t('active')}</option>
                        <option value="Completed">{t('completed')}</option>
                        <option value="On Hold">{t('onHold')}</option>
                    </select>
                </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
               <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>{t('cancel')}</Button>
               <Button type="submit">{t('createProject')}</Button>
            </div>
            <p className="text-sm text-gray-500 text-center">{t('createProjectNote')}</p>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map(p => (
            <div key={p.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg dark:text-white line-clamp-1">{language === 'en' ? p.name_en : (p.name_ar || p.name_en)}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${p.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700'}`}>
                        {t(p.status === 'Active' ? 'active' : p.status === 'Completed' ? 'completed' : 'onHold')}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                    <MapPin size={12}/> {language === 'en' ? p.location_en : p.location_ar || 'No Location'}
                </p>
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => onEditProject(p)}>{t('edit')}</Button>
                    <button onClick={() => deleteProject(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

// 3. Project Detail Editor
const ProjectEditor = ({ project, onBack }: { project: Project; onBack: () => void }) => {
    const { updateProject, teamMembers, othersMembers, assignments, assignMemberToProject, updateProjectAssignment, removeAssignment, clients, contractors, consultants, projectCompanies, addProjectCompany, updateProjectCompany, removeProjectCompany } = useData();
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'info' | 'partners' | 'team'>('partners');
    
    // Project Info State
    const [pInfo, setPInfo] = useState(project);

    useEffect(() => {
        setPInfo(project);
    }, [project]);
    
    // Assignment State
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedDiscipline, setSelectedDiscipline] = useState('');
    const [roleEn, setRoleEn] = useState('');
    const [roleAr, setRoleAr] = useState('');

    // Partner State
    const [selectedPartner, setSelectedPartner] = useState('');
    const [partnerRole, setPartnerRole] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProject(project.id, pInfo);
            alert(t('saveChanges') + '!');
        } catch (error) {
            console.error("Error updating project:", error);
            alert("Failed to update project.");
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMember && selectedDiscipline) {
            try {
                await assignMemberToProject({
                    project_id: project.id,
                    member_id: selectedMember,
                    discipline: selectedDiscipline,
                    role_en: roleEn,
                    role_ar: roleAr,
                    sort_order: 1
                });
                setRoleEn('');
                setRoleAr('');
            } catch (error) {
                console.error("Error assigning member:", error);
                alert("Failed to assign member.");
            }
        }
    };

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPartner && partnerRole) {
            try {
                if (editingPartnerId) {
                    await updateProjectCompany(editingPartnerId, {
                        company_id: selectedPartner,
                        role: partnerRole as any,
                        selected_contacts: selectedContacts
                    });
                } else {
                    await addProjectCompany({
                        project_id: project.id,
                        company_id: selectedPartner,
                        role: partnerRole as any,
                        selected_contacts: selectedContacts
                    });
                }
                setSelectedPartner('');
                setPartnerRole('');
                setSelectedContacts([]);
                setEditingPartnerId(null);
            } catch (error) {
                console.error("Error adding/updating partner:", error);
                alert("Failed to save partner. Please try again.");
            }
        }
    };

    const handleEditPartner = (pc: ProjectCompany) => {
        setEditingPartnerId(pc.id);
        setSelectedPartner(pc.company_id);
        setPartnerRole(pc.role);
        setSelectedContacts(pc.selected_contacts || []);
    };

    const projectAssignments = assignments.filter(a => a.project_id === project.id);
    const currentProjectPartners = projectCompanies.filter(pc => pc.project_id === project.id);
    const availableDisciplines = pInfo.disciplines || [];
    const allAvailableMembers = [...teamMembers, ...othersMembers];
    const allCompanies = [...clients, ...contractors, ...consultants];

    // Ensure discipline is selected if list changes
    if (!selectedDiscipline && availableDisciplines.length > 0) {
        setSelectedDiscipline(availableDisciplines[0]);
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <Button variant="ghost" size="sm" onClick={onBack} icon={<X size={16} />}>{t('close')}</Button>
                <h2 className="text-xl font-bold dark:text-white truncate">{t('edit')}: {language === 'en' ? project.name_en : project.name_ar}</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
                <Button variant={activeTab === 'partners' ? 'primary' : 'ghost'} onClick={() => setActiveTab('partners')} icon={<Briefcase size={16}/>}>{t('stakeholders')}</Button>
                <Button variant={activeTab === 'team' ? 'primary' : 'ghost'} onClick={() => setActiveTab('team')} icon={<Users size={16}/>}>{t('manageTeam')}</Button>
                <Button variant={activeTab === 'info' ? 'primary' : 'ghost'} onClick={() => setActiveTab('info')} icon={<Edit2 size={16}/>}>{t('projectInfo')}</Button>
            </div>

            {activeTab === 'info' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleUpdateInfo} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Input label={t('nameEn')} value={pInfo.name_en} onChange={e => setPInfo({...pInfo, name_en: e.target.value})} />
                             <Input label={t('nameAr')} value={pInfo.name_ar} onChange={e => setPInfo({...pInfo, name_ar: e.target.value})} />
                             <Input label={t('password')} value={pInfo.password_hash} onChange={e => setPInfo({...pInfo, password_hash: e.target.value})} />
                             
                             <Input label={t('locationEn')} value={pInfo.location_en} onChange={e => setPInfo({...pInfo, location_en: e.target.value})} />
                             <Input label={t('locationAr')} value={pInfo.location_ar} onChange={e => setPInfo({...pInfo, location_ar: e.target.value})} />
                             <Input label={t('mapUrl')} value={pInfo.google_map_url || ''} onChange={e => setPInfo({...pInfo, google_map_url: e.target.value})} />
                        </div>
                        <Input label={t('projectScope')} value={pInfo.scope || ''} onChange={e => setPInfo({...pInfo, scope: e.target.value})} />
                        
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <TagInput 
                                tags={pInfo.disciplines || []} 
                                onChange={tags => setPInfo({...pInfo, disciplines: tags})} 
                            />
                        </div>

                        <Button type="submit">{t('saveChanges')}</Button>
                    </form>
                </div>
            )}

            {activeTab === 'partners' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Partner Form */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-fit">
                        <h3 className="font-bold mb-4 dark:text-white">{t('addStakeholder')}</h3>
                        <form onSubmit={handleAddPartner} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('company')}</label>
                                <select 
                                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    value={selectedPartner}
                                    onChange={e => setSelectedPartner(e.target.value)}
                                    required
                                >
                                    <option value="">{t('selectCompany')}</option>
                                    {allCompanies.map(c => (
                                        <option key={c.id} value={c.id}>{language === 'en' ? c.name_en : (c.name_ar || c.name_en)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('role')}</label>
                                <select 
                                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    value={partnerRole}
                                    onChange={e => setPartnerRole(e.target.value)}
                                    required
                                >
                                    <option value="">{t('selectRole')}</option>
                                    <option value="End Client">{t('endClient')}</option>
                                    <option value="Main Contractor">{t('mainContractor')}</option>
                                    <option value="Sub Contractor">{t('subContractor')}</option>
                                    <option value="Consultant">{t('consultant')}</option>
                                    <option value="Other">{t('other')}</option>
                                </select>
                            </div>

                            {selectedPartner && (
                                (() => {
                                    const comp = allCompanies.find(c => c.id === selectedPartner);
                                    if (comp && comp.contact_persons && comp.contact_persons.length > 0) {
                                        return (
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('keyContacts')} ({t('optional')})</label>
                                                <p className="text-xs text-gray-500 mb-2">Select which contacts are involved in this project. If none selected, all will be shown.</p>
                                                <div className="space-y-2 max-h-40 overflow-y-auto p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                                    {comp.contact_persons.map((cp, i) => (
                                                        <label key={i} className="flex items-center gap-2 text-sm dark:text-gray-300 cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={selectedContacts.includes(cp.name)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedContacts([...selectedContacts, cp.name]);
                                                                    } else {
                                                                        setSelectedContacts(selectedContacts.filter(n => n !== cp.name));
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 text-petrotec-600 focus:ring-petrotec-500"
                                                            />
                                                            {cp.name} {cp.role ? `(${cp.role})` : ''}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()
                            )}

                            <div className="flex gap-2">
                                {editingPartnerId && (
                                    <Button type="button" variant="ghost" onClick={() => {
                                        setEditingPartnerId(null);
                                        setSelectedPartner('');
                                        setPartnerRole('');
                                        setSelectedContacts([]);
                                    }} className="flex-1">{t('cancel')}</Button>
                                )}
                                <Button type="submit" className="flex-1" icon={editingPartnerId ? <Edit2 size={16}/> : <Plus size={16}/>}>
                                    {editingPartnerId ? t('saveChanges') : t('add')}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Partners List */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                         <h3 className="font-bold mb-4 dark:text-white">{t('stakeholders')} ({currentProjectPartners.length})</h3>
                         <div className="space-y-3">
                            {currentProjectPartners.map(pc => {
                                const comp = allCompanies.find(c => c.id === pc.company_id);
                                if (!comp) return null;
                                return (
                                    <div key={pc.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                                {comp.logo ? <img src={comp.logo} className="w-full h-full object-contain rounded-lg"/> : <Building2 size={20} className="text-gray-400"/>}
                                            </div>
                                            <div>
                                                <div className="font-bold dark:text-white">{language === 'en' ? comp.name_en : (comp.name_ar || comp.name_en)}</div>
                                                <div className="text-xs font-semibold text-petrotec-600 bg-petrotec-50 dark:bg-petrotec-900/30 px-2 py-0.5 rounded-md w-fit mt-1">
                                                    {pc.role}
                                                </div>
                                                {pc.selected_contacts && pc.selected_contacts.length > 0 && (
                                                    <div className="text-[10px] text-gray-500 mt-1">
                                                        {pc.selected_contacts.length} contact(s) selected
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEditPartner(pc)} className="text-blue-400 hover:text-blue-600 p-2"><Edit2 size={16}/></button>
                                            <button onClick={() => removeProjectCompany(pc.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                )
                            })}
                            {currentProjectPartners.length === 0 && <div className="text-gray-400 text-center py-10">{t('noPartners')}</div>}
                         </div>
                    </div>
                </div>
            )}

            {activeTab === 'team' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Member Form */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-fit">
                        <h3 className="font-bold mb-4 dark:text-white">{t('assignMember')}</h3>
                        <form onSubmit={handleAssign} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('teamMembers')}</label>
                                <select 
                                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    value={selectedMember}
                                    onChange={e => {
                                        setSelectedMember(e.target.value);
                                        const member = allAvailableMembers.find(m => m.id === e.target.value);
                                        if (member && !roleEn) {
                                            setRoleEn(member.job_title_en);
                                            setRoleAr(member.job_title_ar);
                                        }
                                    }}
                                    required
                                >
                                    <option value="">{t('selectMember')}</option>
                                    <optgroup label={t('internal')}>
                                        {teamMembers.map(m => (
                                            <option key={m.id} value={m.id}>{m.full_name}</option>
                                        ))}
                                    </optgroup>
                                    {allCompanies.map(c => {
                                        const companyEmployees = othersMembers.filter(m => m.company_id === c.id);
                                        if (companyEmployees.length === 0) return null;
                                        return (
                                            <optgroup key={c.id} label={language === 'en' ? c.name_en : (c.name_ar || c.name_en)}>
                                                {companyEmployees.map(m => (
                                                    <option key={m.id} value={m.id}>{m.full_name}</option>
                                                ))}
                                            </optgroup>
                                        );
                                    })}
                                    {othersMembers.filter(m => !m.company_id).length > 0 && (
                                        <optgroup label={t('otherMembers')}>
                                            {othersMembers.filter(m => !m.company_id).map(m => (
                                                <option key={m.id} value={m.id}>{m.full_name} {m.company ? `(${m.company})` : ''}</option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('disciplineEn')}</label>
                                <select 
                                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                                    value={selectedDiscipline}
                                    onChange={e => setSelectedDiscipline(e.target.value)}
                                    required
                                >
                                    {availableDisciplines.length === 0 && <option value="">No Disciplines Created</option>}
                                    {availableDisciplines.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                {availableDisciplines.length === 0 && <p className="text-xs text-red-500 mt-1">Please add disciplines in "Project Details" first.</p>}
                            </div>
                            <Input label={t('role') + " (EN)"} value={roleEn} onChange={e => setRoleEn(e.target.value)} required />
                            <Input label={t('role') + " (AR)"} value={roleAr} onChange={e => setRoleAr(e.target.value)} />
                            <Button type="submit" className="w-full" icon={<Plus size={16}/>} disabled={availableDisciplines.length === 0}>{t('add')}</Button>
                        </form>
                    </div>

                    {/* Current Team List */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                         <h3 className="font-bold mb-4 dark:text-white">{t('assignedTeam')} ({projectAssignments.length})</h3>
                         <div className="space-y-3">
                            {availableDisciplines.map(disc => {
                                const discAssignments = projectAssignments.filter(a => a.discipline === disc);
                                if (discAssignments.length === 0) return null;
                                return (
                                    <div key={disc} className="mb-4">
                                        <h4 className="text-xs uppercase font-bold text-gray-400 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">{disc}</h4>
                                        {discAssignments.map(a => {
                                            const member = allAvailableMembers.find(m => m.id === a.member_id);
                                            if(!member) return null;
                                            const isPending = a.status === 'Pending';
                                            return (
                                                <div key={a.id} className={`flex justify-between items-center p-3 rounded-lg mb-2 border ${isPending ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-900/50 border-transparent'}`}>
                                                    <div>
                                                        <div className="font-semibold dark:text-gray-200 flex items-center gap-2">
                                                            {member.full_name}
                                                            {member.type === 'External' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded">Ext</span>}
                                                            {isPending && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded animate-pulse">{t('pending')}</span>}
                                                        </div>
                                                        <div className="text-xs text-petrotec-600">{language === 'en' ? a.role_en : a.role_ar}</div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {isPending && (
                                                            <button onClick={() => updateProjectAssignment(a.id, { status: 'Approved' })} className="text-green-500 hover:text-green-700 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg" title={language === 'en' ? "Approve" : "موافقة"}>
                                                                <CheckCircle size={16}/>
                                                            </button>
                                                        )}
                                                        <button onClick={() => removeAssignment(a.id)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg" title={language === 'en' ? "Remove" : "حذف"}>
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                            {projectAssignments.length === 0 && <div className="text-gray-400 text-center py-10">{t('noTeamAssigned')}</div>}
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Pending Approvals Component ---
const PendingApprovals = () => {
    const { assignments, allMembers, projects, updateProjectAssignment, updateTeamMember, removeAssignment, deleteTeamMember } = useData();
    const { t, language } = useLanguage();
    
    const pendingAssignments = assignments.filter(a => a.status === 'Pending');

    const handleApprove = async (assignment: ProjectAssignment) => {
        await updateProjectAssignment(assignment.id, { status: 'Approved' });
        await updateTeamMember(assignment.member_id, { status: 'Approved' });
    };

    const handleReject = async (assignment: ProjectAssignment) => {
        await removeAssignment(assignment.id);
        await deleteTeamMember(assignment.member_id);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('pendingApprovals')}</h2>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {pendingAssignments.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                        <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{t('noFound')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {pendingAssignments.map(a => {
                            const member = allMembers.find(m => m.id === a.member_id);
                            const project = projects.find(p => p.id === a.project_id);
                            if (!member || !project) return null;
                            
                            return (
                                <div key={a.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg dark:text-white">{member.full_name}</h3>
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">{t('pending')}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-2">
                                            {language === 'en' ? member.job_title_en : member.job_title_ar}
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-sm">
                                            {member.phone && <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Phone size={14}/> {member.phone}</span>}
                                            {member.email && <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Mail size={14}/> {member.email}</span>}
                                            {member.company && <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Building2 size={14}/> {member.company}</span>}
                                        </div>
                                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-petrotec-50 dark:bg-petrotec-900/30 text-petrotec-700 dark:text-petrotec-300 rounded-lg text-sm font-medium border border-petrotec-100 dark:border-petrotec-800">
                                            <Briefcase size={14} />
                                            {t('suggestedBy')} {language === 'en' ? project.name_en : project.name_ar} 
                                            <span className="opacity-50 mx-1">|</span> 
                                            {language === 'en' ? a.role_en : a.role_ar}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleApprove(a)} className="bg-green-500 hover:bg-green-600 text-white" icon={<CheckCircle size={16}/>}>
                                            {t('approve')}
                                        </Button>
                                        <Button onClick={() => handleReject(a)} variant="outline" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30" icon={<Trash2 size={16}/>}>
                                            {t('reject')}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---

type ViewType = 'projects' | 'clients' | 'contractors' | 'consultants' | 'team' | 'others' | 'pending';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects, deleteProject, assignments } = useData();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeView, setActiveView] = useState<ViewType>('projects');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const editingProject = projects.find(p => p.id === editingProjectId);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const toggleLanguage = () => {
    setLanguage(language === Language.EN ? Language.AR : Language.EN);
  };

  const menuItems: { id: ViewType; label: string; icon: any }[] = [
      { id: 'projects', label: t('projects'), icon: LayoutGrid },
      { id: 'clients', label: t('clients'), icon: Building2 },
      { id: 'contractors', label: t('contractors'), icon: HardHat },
      { id: 'consultants', label: t('consultants'), icon: FileText },
      { id: 'team', label: t('teamMembers'), icon: Users },
      { id: 'others', label: t('otherMembers'), icon: UserPlus },
      { id: 'pending', label: t('pendingApprovals'), icon: Bell },
  ];

  const pendingCount = assignments.filter(a => a.status === 'Pending').length;

  const SidebarContent = ({ closeMenu }: { closeMenu?: () => void }) => (
      <>
         <div className="p-6 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 flex items-center justify-center">
                     <img src="https://i.ibb.co/pj75GXSs/logo.png" alt="Logo" className="w-full h-full object-contain" />
                 </div>
                 <span className="font-bold text-lg dark:text-white">{t('adminPanel')}</span>
             </div>
             {closeMenu && (
                 <button onClick={closeMenu} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg">
                     <X size={20} />
                 </button>
             )}
         </div>
         
         <div className="px-4 py-3 flex gap-2 justify-center border-b border-gray-200/50 dark:border-gray-800/50">
             <button
               onClick={toggleLanguage}
               className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-petrotec-50 dark:hover:bg-petrotec-900/30 hover:text-petrotec-600 transition-colors text-sm font-bold border border-transparent hover:border-petrotec-200 dark:hover:border-petrotec-800"
             >
               <Globe size={16}/> {language === 'en' ? 'Arabic' : 'English'}
             </button>
             <button
               onClick={toggleTheme}
               className="flex-1 py-2 rounded-xl flex items-center justify-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-petrotec-50 dark:hover:bg-petrotec-900/30 hover:text-petrotec-600 transition-colors border border-transparent hover:border-petrotec-200 dark:hover:border-petrotec-800"
             >
               {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
             </button>
         </div>

         <nav className="p-4 space-y-2 flex-grow overflow-y-auto">
             {menuItems.map(item => (
                 <button 
                    key={item.id}
                    onClick={() => { setActiveView(item.id); setEditingProjectId(null); if(closeMenu) closeMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === item.id ? 'bg-gradient-to-r from-petrotec-500 to-cyan-500 text-white shadow-md shadow-petrotec-500/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                 >
                     <item.icon size={20} className={activeView === item.id ? 'text-white' : ''} /> 
                     <span className="flex-grow text-left">{item.label}</span>
                     {item.id === 'pending' && pendingCount > 0 && (
                         <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
                     )}
                 </button>
             ))}
             
             <div className="my-4 border-t border-gray-200/50 dark:border-gray-800/50"></div>

             <Link 
                to="/"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
             >
                 <Home size={20} /> {t('backToHome')}
             </Link>
         </nav>
         <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium">
                 <LogOut size={20} /> {t('logout')}
             </button>
         </div>
      </>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden glass-panel border-b border-gray-200/50 dark:border-gray-800/50 p-4 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Menu size={24}/>
          </button>
          <div className="font-bold text-lg dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                  <img src="https://i.ibb.co/pj75GXSs/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              {t('adminPanel')}
          </div>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-r border-gray-200/50 dark:border-gray-800/50 flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
         <SidebarContent />
      </aside>

      {/* Sidebar (Mobile Overlay) */}
      {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl w-4/5 max-w-sm h-full shadow-2xl flex flex-col border-r border-white/20 dark:border-gray-700/50 animate-slide-right" onClick={e => e.stopPropagation()}>
                  <SidebarContent closeMenu={() => setIsMobileMenuOpen(false)} />
              </div>
          </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow min-w-0 lg:ltr:ml-64 lg:rtl:mr-64 p-4 md:p-8 lg:p-12 overflow-y-auto">
          {editingProject ? (
              <ProjectEditor project={editingProject} onBack={() => setEditingProjectId(null)} />
          ) : (
              <>
                {activeView === 'projects' && <ManageProjects onEditProject={(p) => setEditingProjectId(p.id)} />}
                {activeView === 'clients' && <CompanyManager type="Client" title={t('clients')} />}
                {activeView === 'contractors' && <CompanyManager type="Contractor" title={t('contractors')} />}
                {activeView === 'consultants' && <CompanyManager type="Consultant" title={t('consultants')} />}
                {activeView === 'team' && <TeamManager type="Internal" title={t('teamMembers')} />}
                {activeView === 'others' && <TeamManager type="External" title={t('otherMembers')} />}
                {activeView === 'pending' && <PendingApprovals />}
              </>
          )}
      </main>
    </div>
  );
};
