'use client';

import { useLocalStorage } from './useLocalStorage';
import { useCallback } from 'react';

const STORAGE_KEY = 'precision_saved_searches';

export function useSavedSearches() {
  const [searches, setSearches] = useLocalStorage(STORAGE_KEY, {});

  const saveSearch = useCallback((name, filters) => {
    const id = `search_${Date.now()}`;
    const newSearch = {
      id,
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    
    setSearches((prev) => ({
      ...prev,
      [id]: newSearch,
    }));
    
    return id;
  }, [setSearches]);

  const deleteSearch = useCallback((searchId) => {
    setSearches((prev) => {
      const updated = { ...prev };
      delete updated[searchId];
      return updated;
    });
  }, [setSearches]);

  const getSearch = useCallback((searchId) => {
    return searches[searchId];
  }, [searches]);

  const getAllSearches = useCallback(() => {
    return Object.values(searches).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [searches]);

  return {
    searches,
    saveSearch,
    deleteSearch,
    getSearch,
    getAllSearches,
  };
}
