import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TeamMember } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, Search, Users, UserPlus, Briefcase } from 'lucide-react';

interface TeamManagerProps {
    type: 'Internal' | 'External';
    title: string;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ type, title }) => {
    const { teamMembers, othersMembers, addTeamMember, deleteTeamMember, assignments, projects } = useData();
    const { t, language } = useLanguage();
    const isEn = language === 'en';
    
    const members = type === 'Internal' ? teamMembers : othersMembers;
    
    const [isAdding, setIsAdding] = useState(false);
    const [newMember, setNewMember] = useState<Partial<TeamMember>>({
        full_name: '', job_title_en: '', job_title_ar: '', phone: '', email: '', type: type
    });
    const [searchTerm, setSearchTerm] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMember.full_name) {
            addTeamMember({ ...newMember, type } as any);
            setNewMember({ full_name: '', job_title_en: '', job_title_ar: '', phone: '', email: '', type: type });
            setIsAdding(false);
        }
    };

    const filteredMembers = members.filter(m => 
        m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.job_title_en.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getMemberProjects = (memberId: string) => {
        const memberAssignments = assignments.filter(a => a.member_id === memberId);
        return memberAssignments.map(a => {
            const project = projects.find(p => p.id === a.project_id);
            return project ? (isEn ? project.name_en : project.name_ar || project.name_en) : null;
        }).filter(Boolean);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                   <p className="text-sm text-gray-500">{t('manageList')}</p>
                </div>
                <Button onClick={() => setIsAdding(true)} icon={<Plus size={18} />}>
                    {type === 'Internal' ? t('addEmployee') : t('addMember')}
                </Button>
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-petrotec-200 dark:border-gray-700 shadow-xl animate-fade-in">
                    <h3 className="font-bold mb-4 dark:text-white">
                        {type === 'Internal' ? t('addNewEmployee') : t('addNewMember')}
                    </h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label={t('fullName')} value={newMember.full_name} onChange={e => setNewMember({...newMember, full_name: e.target.value})} required />
                        <Input label={t('phoneNumber')} value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} required />
                        <Input label={t('jobTitleEn')} value={newMember.job_title_en} onChange={e => setNewMember({...newMember, job_title_en: e.target.value})} required />
                        <Input label={t('jobTitleAr')} value={newMember.job_title_ar} onChange={e => setNewMember({...newMember, job_title_ar: e.target.value})} />
                        <Input label={t('email')} value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
                        {type === 'External' && (
                             <Input label={t('companyName')} value={newMember.company} onChange={e => setNewMember({...newMember, company: e.target.value})} />
                        )}
                        <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>{t('cancel')}</Button>
                            <Button type="submit">{t('addToList')}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mb-4">
                <Input icon={<Search size={16}/>} placeholder={t('searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                            <th className="p-4">{t('nameEn')}</th>
                            <th className="p-4">{t('jobTitle')}</th>
                            <th className="p-4">{t('contact')}</th>
                            {type === 'External' && <th className="p-4">{t('company')}</th>}
                            <th className="p-4">{t('projects')}</th>
                            <th className="p-4 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredMembers.map(m => {
                            const memberProjects = getMemberProjects(m.id);
                            return (
                                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-medium dark:text-gray-200 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                                            {type === 'Internal' ? <Users size={14}/> : <UserPlus size={14}/>}
                                        </div>
                                        {m.full_name}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        <div>{m.job_title_en}</div>
                                        <div className="text-xs opacity-70">{m.job_title_ar}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">{m.phone}</td>
                                    {type === 'External' && <td className="p-4 text-sm text-gray-500">{m.company || '-'}</td>}
                                    <td className="p-4 text-sm text-gray-500">
                                        {memberProjects.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {memberProjects.map((pName, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-petrotec-50 dark:bg-petrotec-900/30 text-petrotec-700 dark:text-petrotec-300 text-xs border border-petrotec-100 dark:border-petrotec-800">
                                                        <Briefcase size={10} />
                                                        {pName}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => deleteTeamMember(m.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredMembers.length === 0 && (
                            <tr>
                                <td colSpan={type === 'External' ? 6 : 5} className="p-8 text-center text-gray-400">
                                    {t('noMembersFound')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
