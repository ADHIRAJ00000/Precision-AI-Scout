'use client';

import { useState, useRef, useEffect } from 'react';
import { List, Plus, Check, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLists } from '@/lib/hooks/useLists';

export default function SaveToList({ companyId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const dropdownRef = useRef(null);

  const { 
    getAllLists, 
    createList, 
    addToList, 
    removeFromList, 
    isInList 
  } = useLists();

  const lists = getAllLists();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const listId = createList(newListName);
    addToList(listId, companyId);
    setNewListName('');
    setShowCreateForm(false);
  };

  const toggleList = (listId) => {
    if (isInList(listId, companyId)) {
      removeFromList(listId, companyId);
    } else {
      addToList(listId, companyId);
    }
  };

  // Check if company is in any list
  const isInAnyList = lists.some((list) => isInList(list.id, companyId));

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant={isInAnyList ? 'primary' : 'secondary'}
        onClick={() => setIsOpen(!isOpen)}
        leftIcon={<List className="w-4 h-4" />}
        rightIcon={<ChevronDown className="w-4 h-4" />}
      >
        {isInAnyList ? 'Saved' : 'Save to List'}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 py-2">
          <div className="px-4 py-2 border-b border-slate-100">
            <h4 className="text-sm font-medium text-slate-900">Save to List</h4>
          </div>

          {lists.length === 0 && !showCreateForm ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-500 mb-3">No lists yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first list
              </button>
            </div>
          ) : (
            <>
              <div className="max-h-48 overflow-y-auto py-1">
                {lists.map((list) => {
                  const isCompanyInList = isInList(list.id, companyId);
                  return (
                    <button
                      key={list.id}
                      onClick={() => toggleList(list.id)}
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-900">{list.name}</p>
                        <p className="text-xs text-slate-500">{list.companyIds.length} companies</p>
                      </div>
                      {isCompanyInList && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {!showCreateForm ? (
                <div className="px-4 py-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Create new list
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3 border-t border-slate-100">
                  <form onSubmit={handleCreateList}>
                    <input
                      type="text"
                      placeholder="List name"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="flex-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newListName.trim()}
                        className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
