import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Company, ContactPerson, TeamMember } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, Edit2, Search, Building2, MapPin, User, Mail, Phone, X, Upload, Loader2, Briefcase, Users } from 'lucide-react';
import { supabase } from '../../src/lib/supabase';
import { CompanyLogo } from '../../components/CompanyLogo';

interface CompanyManagerProps {
    type: 'Client' | 'Contractor' | 'Consultant';
    title: string;
}

export const CompanyManager: React.FC<CompanyManagerProps> = ({ type, title }) => {
    const { clients, contractors, consultants, addCompany, updateCompany, deleteCompany, projectCompanies, projects, othersMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useData();
    const { t, language } = useLanguage();
    const isEn = language === 'en';
    
    const data = type === 'Client' ? clients : type === 'Contractor' ? contractors : consultants;
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Company>>({ 
        name_en: '', 
        name_ar: '', 
        location: '', 
        logo: '',
        contact_persons: [] 
    });
    const [companyEmployees, setCompanyEmployees] = useState<Partial<TeamMember>[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name_en) {
            let savedCompany: Company | undefined;
            if (currentId) {
                savedCompany = await updateCompany(type, currentId, formData);
            } else {
                savedCompany = await addCompany(type, formData as any);
            }

            if (savedCompany) {
                // Save employees
                for (const emp of companyEmployees) {
                    if (emp.id) {
                        // Update existing
                        await updateTeamMember(emp.id, { ...emp, company_id: savedCompany.id, company: savedCompany.name_en });
                    } else {
                        // Add new
                        await addTeamMember({ ...emp, company_id: savedCompany.id, company: savedCompany.name_en, type: 'External' } as any);
                    }
                }
            }
            resetForm();
        }
    };

    const handleEdit = (company: Company) => {
        setFormData({ 
            name_en: company.name_en, 
            name_ar: company.name_ar,
            location: company.location || '',
            location_url: company.location_url || '',
            logo: company.logo || '',
            contact_persons: company.contact_persons || []
        });
        setCurrentId(company.id);
        // Load employees for this company
        const employees = othersMembers.filter(m => m.company_id === company.id);
        setCompanyEmployees(employees);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({ name_en: '', name_ar: '', location: '', location_url: '', logo: '', contact_persons: [] });
        setCompanyEmployees([]);
        setCurrentId(null);
        setIsEditing(false);
    };

    // --- File Upload Logic ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        
        // Limit file size to 2MB to prevent database bloat
        if (file.size > 2 * 1024 * 1024) {
            alert(isEn ? 'Image is too large. Please choose an image under 2MB.' : 'حجم الصورة كبير جداً. يرجى اختيار صورة بحجم أقل من 2 ميجابايت.');
            return;
        }

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, logo: base64String }));
                setUploading(false);
            };
            reader.onerror = () => {
                alert(isEn ? 'Error reading file' : 'حدث خطأ أثناء قراءة الملف');
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing image:', error);
            alert(isEn ? 'Error processing image' : 'حدث خطأ أثناء معالجة الصورة');
            setUploading(false);
        }
    };

    // --- Contact Person Logic ---
    const addContactPerson = () => {
        const newPerson: ContactPerson = { name: '', email: '', phone: '', role: '' };
        setFormData(prev => ({
            ...prev,
            contact_persons: [...(prev.contact_persons || []), newPerson]
        }));
    };

    const removeContactPerson = (index: number) => {
        setFormData(prev => ({
            ...prev,
            contact_persons: (prev.contact_persons || []).filter((_, i) => i !== index)
        }));
    };

    const updateContactPerson = (index: number, field: keyof ContactPerson, value: string) => {
        setFormData(prev => ({
            ...prev,
            contact_persons: (prev.contact_persons || []).map((p, i) => i === index ? { ...p, [field]: value } : p)
        }));
    };

    // --- Company Employees Logic ---
    const addEmployee = () => {
        const newEmployee: Partial<TeamMember> = { full_name: '', job_title_en: '', phone: '', email: '', type: 'External' };
        setCompanyEmployees(prev => [...prev, newEmployee]);
    };

    const removeEmployee = async (index: number) => {
        const emp = companyEmployees[index];
        if (emp.id) {
            if (window.confirm(isEn ? 'Are you sure you want to delete this employee?' : 'هل أنت متأكد من حذف هذا الموظف؟')) {
                await deleteTeamMember(emp.id);
                setCompanyEmployees(prev => prev.filter((_, i) => i !== index));
            }
        } else {
            setCompanyEmployees(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateEmployee = (index: number, field: keyof TeamMember, value: string) => {
        setCompanyEmployees(prev => prev.map((emp, i) => i === index ? { ...emp, [field]: value } : emp));
    };

    const filteredData = data.filter(item => 
        item.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.name_ar.includes(searchTerm)
    );

    const getCompanyProjects = (companyId: string) => {
        const companyAssignments = projectCompanies.filter(pc => pc.company_id === companyId);
        return companyAssignments.map(pc => {
            const project = projects.find(p => p.id === pc.project_id);
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
                <Button onClick={() => setIsEditing(true)} icon={<Plus size={18} />}>{t('addNew')}</Button>
            </div>

            {isEditing && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
                    <h3 className="font-bold mb-4 dark:text-white">{currentId ? t('edit') : t('add')} {type}</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label={t('companyNameEn')} value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} required />
                            <Input label={t('companyNameAr')} value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} />
                            <Input label={t('locationAddress')} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} icon={<MapPin size={16}/>} />
                            <Input label={t('googleMapsUrl')} value={formData.location_url || ''} onChange={e => setFormData({...formData, location_url: e.target.value})} icon={<MapPin size={16}/>} placeholder="https://maps.google.com/..." />
                            
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 dark:text-gray-300">{t('companyLogo')}</label>
                                <div className="flex items-center gap-3">
                                    <CompanyLogo logo={formData.logo} name={formData.name_en || 'New'} id={currentId || 'new'} className="w-10 h-10 flex-shrink-0" iconSize={20} />
                                    <label className="flex-grow cursor-pointer">
                                        <div className={`flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {uploading ? <Loader2 size={18} className="animate-spin"/> : <Upload size={18} />}
                                            <span className="text-sm text-gray-500">{uploading ? t('uploading') : t('uploadImage')}</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Contact Persons Section */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-sm uppercase text-gray-500">{t('contactPersons')}</h4>
                                <Button type="button" size="sm" variant="outline" onClick={addContactPerson} icon={<Plus size={14}/>}>{t('addContact')}</Button>
                            </div>
                            
                            <div className="space-y-3">
                                {(formData.contact_persons || []).map((person, index) => (
                                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 relative group">
                                        <button 
                                            type="button" 
                                            onClick={() => removeContactPerson(index)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                            <Input 
                                                placeholder={t('nameEn')} 
                                                value={person.name} 
                                                onChange={e => updateContactPerson(index, 'name', e.target.value)} 
                                                className="!bg-white dark:!bg-gray-800"
                                                icon={<User size={14}/>}
                                            />
                                            <Input 
                                                placeholder={t('role')} 
                                                value={person.role || ''} 
                                                onChange={e => updateContactPerson(index, 'role', e.target.value)} 
                                                className="!bg-white dark:!bg-gray-800"
                                            />
                                            <Input 
                                                placeholder={t('email')} 
                                                value={person.email} 
                                                onChange={e => updateContactPerson(index, 'email', e.target.value)} 
                                                className="!bg-white dark:!bg-gray-800"
                                                icon={<Mail size={14}/>}
                                            />
                                            <Input 
                                                placeholder={t('phoneNumber')} 
                                                value={person.phone} 
                                                onChange={e => updateContactPerson(index, 'phone', e.target.value)} 
                                                className="!bg-white dark:!bg-gray-800"
                                                icon={<Phone size={14}/>}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(formData.contact_persons || []).length === 0 && (
                                    <div className="text-center py-4 text-sm text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                        {t('noMembersFound')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Company Employees Section */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h4 className="font-bold text-sm uppercase text-gray-500">{isEn ? 'Company Employees' : 'موظفي الشركة'}</h4>
                                    <p className="text-xs text-gray-400">{isEn ? 'These employees will automatically appear in projects this company is assigned to.' : 'سيظهر هؤلاء الموظفون تلقائياً في المشاريع التي يتم تعيين هذه الشركة فيها.'}</p>
                                </div>
                                <Button type="button" size="sm" variant="outline" onClick={addEmployee} icon={<Plus size={14}/>}>{isEn ? 'Add Employee' : 'إضافة موظف'}</Button>
                            </div>
                            
                            <div className="space-y-3">
                                {companyEmployees.map((emp, index) => (
                                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 relative group">
                                        <button 
                                            type="button" 
                                            onClick={() => removeEmployee(index)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                            <Input 
                                                placeholder={t('fullName')} 
                                                value={emp.full_name || ''} 
                                                onChange={e => updateEmployee(index, 'full_name', e.target.value)} 
                                                className="!bg-white dark:!bg-gray-800"
                                                icon={<User size={14}/>}
                                                required
                                            />
                                            <Input 
                                                placeholder={t('jobTitleEn')} 
                                                value={emp.job_title_en || ''} 
                                                onChange={e => updateEmployee(index, 'job_title_en', e.target.value)} 
                                                className="!bg-white dark:!bg-gray-800"
                                                required
                                            />
                                            <Input 
                                                placeholder={t('email')} 
                                                value={emp.email || ''} 
                                                onChange={e => updateEmployee(index, 'email', e.target.value)} 
                                                className="!bg-white dark:!bg-gray-800"
                                                icon={<Mail size={14}/>}
                                            />
                                            <Input 
                                                placeholder={t('phoneNumber')} 
                                                value={emp.phone || ''} 
                                                onChange={e => updateEmployee(index, 'phone', e.target.value)} 
                                                className="!bg-white dark:!bg-gray-800"
                                                icon={<Phone size={14}/>}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {companyEmployees.length === 0 && (
                                    <div className="text-center py-4 text-sm text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                        {t('noMembersFound')}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Button type="button" variant="ghost" onClick={resetForm}>{t('cancel')}</Button>
                            <Button type="submit" disabled={uploading}>{t('saveCompany')}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mb-4">
                <Input icon={<Search size={16}/>} placeholder={t('searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map(item => {
                    const companyProjects = getCompanyProjects(item.id);
                    return (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4 group hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <CompanyLogo logo={item.logo} name={item.name_en} id={item.id} className="w-12 h-12" iconSize={24} />
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{item.name_en}</div>
                                    <div className="text-xs text-gray-500 line-clamp-1">{item.name_ar}</div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={16}/></button>
                                <button onClick={() => deleteCompany(type, item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        
                        {item.location && (
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <MapPin size={14} className="flex-shrink-0"/>
                                <span className="truncate">{item.location}</span>
                            </div>
                        )}

                        {companyProjects.length > 0 && (
                            <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <div className="text-xs font-bold text-gray-400 uppercase mb-2">{t('projects')}</div>
                                <div className="flex flex-wrap gap-1">
                                    {companyProjects.map((pName, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-petrotec-50 dark:bg-petrotec-900/30 text-petrotec-700 dark:text-petrotec-300 text-xs border border-petrotec-100 dark:border-petrotec-800">
                                            <Briefcase size={10} />
                                            {pName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.contact_persons && item.contact_persons.length > 0 && (
                            <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <div className="text-xs font-bold text-gray-400 uppercase mb-2">{t('keyContacts')}</div>
                                <div className="space-y-2">
                                    {item.contact_persons.slice(0, 2).map((p, i) => (
                                        <div key={i} className="text-sm flex items-center justify-between">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{p.name}</span>
                                            <div className="flex gap-2 text-gray-400">
                                                {p.phone && <a href={`tel:${p.phone}`} className="hover:text-green-500"><Phone size={14}/></a>}
                                                {p.email && <a href={`mailto:${p.email}`} className="hover:text-blue-500"><Mail size={14}/></a>}
                                            </div>
                                        </div>
                                    ))}
                                    {item.contact_persons.length > 2 && (
                                        <div className="text-xs text-center text-petrotec-600 cursor-pointer hover:underline" onClick={() => handleEdit(item)}>
                                            + {item.contact_persons.length - 2} {t('more')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )})}
                {filteredData.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-400">{t('noFound')}</div>
                )}
            </div>
        </div>
    );
};
