import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ProblemSubmission, ProblemStatus } from '@/types';
import {
  getStoredProblems,
  setStoredProblems,
  getStoredNextId,
  setStoredNextId,
} from '@/utils/problemsStorage';

interface ProblemsContextValue {
  problems: ProblemSubmission[];
  addProblem: (p: Omit<ProblemSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  updateStatus: (id: string, status: ProblemStatus) => void;
  deleteProblem: (id: string) => void;
  deleteAllProblems: () => void;
  refreshFromStorage: () => void;
  isLoading: boolean;
}

const ProblemsContext = createContext<ProblemsContextValue | null>(null);

export function ProblemsProvider({ children }: { children: React.ReactNode }) {
  const [problems, setProblems] = useState<ProblemSubmission[]>(getStoredProblems);
  const [nextId, setNextId] = useState(getStoredNextId);
  const [isLoading, setIsLoading] = useState(false);

  const refreshFromStorage = useCallback(() => {
    setProblems(getStoredProblems());
    setNextId(getStoredNextId());
  }, []);

  useEffect(() => {
    setStoredProblems(problems);
    setStoredNextId(nextId);
  }, [problems, nextId]);

  const addProblem = useCallback(
    (p: Omit<ProblemSubmission, 'id' | 'submittedAt' | 'status'>) => {
      setIsLoading(true);
      setTimeout(() => {
        const id = String(nextId);
        const newProblem: ProblemSubmission = {
          ...p,
          id,
          status: 'Pending',
          submittedAt: new Date().toISOString(),
        };
        setNextId((prev) => prev + 1);
        setProblems((prev) => [newProblem, ...prev]);
        setIsLoading(false);
      }, 600);
    },
    [nextId]
  );

  const updateStatus = useCallback((id: string, status: ProblemStatus) => {
    setProblems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }, []);

  const deleteProblem = useCallback((id: string) => {
    setProblems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const deleteAllProblems = useCallback(() => {
    setProblems([]);
  }, []);

  const value: ProblemsContextValue = {
    problems,
    addProblem,
    updateStatus,
    deleteProblem,
    deleteAllProblems,
    refreshFromStorage,
    isLoading,
  };

  return <ProblemsContext.Provider value={value}>{children}</ProblemsContext.Provider>;
}

export function useProblems() {
  const ctx = useContext(ProblemsContext);
  if (!ctx) throw new Error('useProblems must be used within ProblemsProvider');
  return ctx;
}
