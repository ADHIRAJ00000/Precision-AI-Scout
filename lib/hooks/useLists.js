'use client';

import { useLocalStorage } from './useLocalStorage';
import { useCallback } from 'react';

const STORAGE_KEY = 'precision_lists';

export function useLists() {
  const [lists, setLists] = useLocalStorage(STORAGE_KEY, {});

  const createList = useCallback((name, description = '') => {
    const id = `list_${Date.now()}`;
    const newList = {
      id,
      name,
      description,
      companyIds: [],
      createdAt: new Date().toISOString(),
    };
    
    setLists((prev) => ({
      ...prev,
      [id]: newList,
    }));
    
    return id;
  }, [setLists]);

  const deleteList = useCallback((listId) => {
    setLists((prev) => {
      const updated = { ...prev };
      delete updated[listId];
      return updated;
    });
  }, [setLists]);

  const addToList = useCallback((listId, companyId) => {
    setLists((prev) => {
      const list = prev[listId];
      if (!list) return prev;
      
      if (list.companyIds.includes(companyId)) return prev;
      
      return {
        ...prev,
        [listId]: {
          ...list,
          companyIds: [...list.companyIds, companyId],
        },
      };
    });
  }, [setLists]);

  const removeFromList = useCallback((listId, companyId) => {
    setLists((prev) => {
      const list = prev[listId];
      if (!list) return prev;
      
      return {
        ...prev,
        [listId]: {
          ...list,
          companyIds: list.companyIds.filter((id) => id !== companyId),
        },
      };
    });
  }, [setLists]);

  const isInList = useCallback((listId, companyId) => {
    const list = lists[listId];
    return list?.companyIds.includes(companyId) || false;
  }, [lists]);

  const getListCompanies = useCallback((listId) => {
    return lists[listId]?.companyIds || [];
  }, [lists]);

  const getAllLists = useCallback(() => {
    return Object.values(lists);
  }, [lists]);

  return {
    lists,
    createList,
    deleteList,
    addToList,
    removeFromList,
    isInList,
    getListCompanies,
    getAllLists,
  };
}
