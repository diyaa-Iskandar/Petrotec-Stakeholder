import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Maps projectId -> expiration timestamp
interface ProjectAuthContextType {
  authorizeProject: (projectId: string) => void;
  isProjectAuthorized: (projectId: string) => boolean;
  refreshProjectSession: (projectId: string) => void;
}

const ProjectAuthContext = createContext<ProjectAuthContextType | undefined>(undefined);

// 5 Minutes in milliseconds
const SESSION_DURATION = 5 * 60 * 1000;

export const ProjectAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store map of ProjectID -> ExpiryTimestamp
  const [authSessions, setAuthSessions] = useState<Record<string, number>>(() => {
    // Try to restore from local storage, filtering out expired ones
    const stored = localStorage.getItem('projectAuthSessions');
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const valid: Record<string, number> = {};
      Object.keys(parsed).forEach(pid => {
        if (parsed[pid] > now) {
          valid[pid] = parsed[pid];
        }
      });
      return valid;
    }
    return {};
  });

  // Save to storage whenever state changes
  useEffect(() => {
    localStorage.setItem('projectAuthSessions', JSON.stringify(authSessions));
  }, [authSessions]);

  // Periodic cleanup of expired sessions (runs every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        setAuthSessions(prev => {
            const next = { ...prev };
            let changed = false;
            Object.keys(next).forEach(pid => {
                if (next[pid] < now) {
                    delete next[pid];
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const authorizeProject = (projectId: string) => {
    const expiry = Date.now() + SESSION_DURATION;
    setAuthSessions(prev => ({ ...prev, [projectId]: expiry }));
  };

  const refreshProjectSession = (projectId: string) => {
    // Only refresh if currently authorized
    if (authSessions[projectId] && authSessions[projectId] > Date.now()) {
        const expiry = Date.now() + SESSION_DURATION;
        setAuthSessions(prev => ({ ...prev, [projectId]: expiry }));
    }
  };

  const isProjectAuthorized = (projectId: string) => {
    const expiry = authSessions[projectId];
    return !!expiry && expiry > Date.now();
  };

  return (
    <ProjectAuthContext.Provider value={{ authorizeProject, isProjectAuthorized, refreshProjectSession }}>
      {children}
    </ProjectAuthContext.Provider>
  );
};

export const useProjectAuth = () => {
  const context = useContext(ProjectAuthContext);
  if (!context) {
    throw new Error('useProjectAuth must be used within a ProjectAuthProvider');
  }
  return context;
};
