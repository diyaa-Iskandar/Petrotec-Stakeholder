import React from 'react';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Briefcase, ChevronRight, ChevronLeft, Lock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { language, t, isRTL } = useLanguage();
  const isEn = language === 'en';
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="group relative bg-white/70 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-petrotec-300 dark:hover:border-petrotec-700 transition-all duration-300 hover:shadow-xl hover:shadow-petrotec-500/10 hover:-translate-y-1 flex flex-col h-full overflow-hidden">
        
        {/* Decorative Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-petrotec-600 via-cyan-400 to-petrotec-600 bg-[length:200%_100%] group-hover:animate-[gradient_3s_linear_infinite]"></div>

        <div className="p-6 flex flex-col flex-grow relative">
             {/* Status Badge */}
            <div className="absolute top-6 right-6 ltr:right-6 rtl:left-6 rtl:right-auto">
                <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border shadow-sm
                    ${project.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : ''}
                    ${project.status === 'Completed' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : ''}
                    ${project.status === 'On Hold' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : ''}
                `}>
                    {t(project.status === 'Active' ? 'active' : project.status === 'Completed' ? 'completed' : 'onHold')}
                </span>
            </div>

            <div className="mb-6 mt-2">
                <div className="w-12 h-12 rounded-xl bg-petrotec-50 dark:bg-petrotec-900/20 text-petrotec-600 dark:text-petrotec-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                    {isEn ? project.name_en : project.name_ar}
                </h3>
            </div>

            <div className="space-y-3 mt-auto">
                <div className="flex items-start text-sm text-gray-500 dark:text-gray-400">
                    <Briefcase size={16} className="ltr:mr-2 rtl:ml-2 mt-0.5 flex-shrink-0 text-petrotec-500" />
                    <span className="line-clamp-1 font-medium">{isEn ? project.client_en : project.client_ar}</span>
                </div>
                
                <div className="flex items-start text-sm text-gray-500 dark:text-gray-400">
                    <MapPin size={16} className="ltr:mr-2 rtl:ml-2 mt-0.5 flex-shrink-0 text-petrotec-500" />
                    <span className="line-clamp-1">{isEn ? project.location_en : project.location_ar}</span>
                </div>
            </div>
        </div>

        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700/50 flex gap-2">
            <Link to={`/projects/${project.id}`} className="flex-grow flex items-center justify-center py-2.5 px-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-petrotec-600 hover:border-petrotec-600 hover:text-white dark:hover:bg-petrotec-500 dark:hover:border-petrotec-500 transition-all shadow-sm hover:shadow-lg group/btn">
                <span className="flex items-center gap-2">
                    <Lock size={14} className="opacity-50" />
                    {t('openProject')}
                </span>
                <Arrow size={16} className="ltr:ml-1 rtl:mr-1 transform ltr:group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform"/>
            </Link>
            
            {project.google_map_url && (
                <a 
                    href={project.google_map_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-shrink-0 w-12 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-petrotec-600 hover:border-petrotec-300 dark:hover:text-petrotec-400 transition-all"
                    title={t('openMap')}
                >
                    <ExternalLink size={18} />
                </a>
            )}
        </div>
    </div>
  );
};
