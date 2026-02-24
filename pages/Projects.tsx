import React from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Input } from '../components/ui/Input';
import { Search } from 'lucide-react';

export const Projects: React.FC = () => {
  const { t } = useLanguage();
  const { projects } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredProjects = projects.filter(project => {
    if (!project.isActive) return false;
    const term = searchTerm.toLowerCase();
    return (
      project.name_en.toLowerCase().includes(term) ||
      project.name_ar.includes(term) ||
      project.client_en.toLowerCase().includes(term) ||
      project.client_ar.includes(term)
    );
  });

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
           <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-2">{t('projects')}</h1>
           <p className="text-gray-500 dark:text-gray-400">{t('welcomeSubtitle')}</p>
        </div>
        <div className="w-full md:w-96">
          <Input 
            icon={<Search size={20} />} 
            placeholder={t('search')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!rounded-full shadow-lg shadow-gray-200/50 dark:shadow-black/20"
          />
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div key={project.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
             <Search size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{t('noResults')}</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
};
