import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProjectAuthProvider } from './contexts/ProjectAuthContext';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SplashScreen } from './components/SplashScreen';

// Public routes wrapper
const PublicLayout: React.FC<{children: React.ReactNode}> = ({children}) => (
    <Layout>{children}</Layout>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Check if it's the first load in this session
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  return (
    <DataProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ProjectAuthProvider>
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            <HashRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
                <Route path="/projects/:id" element={<PublicLayout><ProjectDetail /></PublicLayout>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </HashRouter>
          </ProjectAuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </DataProvider>
  );
};

export default App;
