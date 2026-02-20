'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Building2, Download, FileSpreadsheet, FileJson, X, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useLists } from '@/lib/hooks/useLists';
import { exportToCSV, exportToJSON } from '@/lib/utils/csvExport';
import mockCompanies from '@/lib/data/mockCompanies.json';

export default function ListsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [selectedList, setSelectedList] = useState(null);

  const { 
    getAllLists, 
    createList, 
    deleteList, 
    getListCompanies,
    removeFromList,
  } = useLists();

  const lists = getAllLists();

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    createList(newListName, newListDescription);
    setNewListName('');
    setNewListDescription('');
    setShowCreateModal(false);
  };

  const handleExportCSV = (list) => {
    const companyIds = getListCompanies(list.id);
    const companies = companyIds.map((id) => 
      mockCompanies.find((c) => c.id === id)
    ).filter(Boolean);
    
    const exportData = companies.map((c) => ({
      name: c.name,
      industry: c.industry,
      stage: c.stage,
      location: c.location,
      website: c.website,
    }));
    
    exportToCSV(exportData, `precision-list-${list.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleExportJSON = (list) => {
    const companyIds = getListCompanies(list.id);
    const companies = companyIds.map((id) => 
      mockCompanies.find((c) => c.id === id)
    ).filter(Boolean);
    
    exportToJSON(companies, `precision-list-${list.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const getCompanyDetails = (companyId) => {
    return mockCompanies.find((c) => c.id === companyId);
  };

  const getIndustryBadgeVariant = (industry) => {
    const variants = {
      'AI/ML': 'purple',
      'Fintech': 'success',
      'Healthcare': 'danger',
      'SaaS': 'primary',
      'Consumer': 'warning',
      'Enterprise': 'default',
    };
    return variants[industry] || 'default';
  };

  if (selectedList) {
    const list = lists.find((l) => l.id === selectedList);
    if (!list) {
      setSelectedList(null);
      return null;
    }

    const companyIds = getListCompanies(list.id);
    const companies = companyIds.map(getCompanyDetails).filter(Boolean);

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button 
            onClick={() => setSelectedList(null)}
            className="text-slate-500 hover:text-slate-700"
          >
            Lists
          </button>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-medium">{list.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{list.name}</h1>
            {list.description && (
              <p className="text-slate-500 mt-1">{list.description}</p>
            )}
            <p className="text-sm text-slate-400 mt-1">
              {companies.length} {companies.length === 1 ? 'company' : 'companies'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
              onClick={() => handleExportCSV(list)}
              disabled={companies.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileJson className="w-4 h-4" />}
              onClick={() => handleExportJSON(list)}
              disabled={companies.length === 0}
            >
              Export JSON
            </Button>
          </div>
        </div>

        {/* Companies in list */}
        {companies.length === 0 ? (
          <Card className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No companies yet</h3>
              <p className="text-slate-500 mb-4">Add companies to this list from the companies page</p>
              <Link href="/companies">
                <Button>Browse Companies</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/companies/${company.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getIndustryBadgeVariant(company.industry)} size="sm">
                        {company.industry}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{company.stage}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{company.location}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => removeFromList(list.id, company.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove from list"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Lists</h1>
          <p className="text-slate-500 mt-1">
            {lists.length} {lists.length === 1 ? 'list' : 'lists'} created
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create List
        </Button>
      </div>

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <Card className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No lists yet</h3>
            <p className="text-slate-500 mb-4">Create lists to organize and track companies</p>
            <Button onClick={() => setShowCreateModal(true)}>Create Your First List</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Card key={list.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedList(list.id)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{list.name}</CardTitle>
                    {list.description && (
                      <CardDescription className="mt-1">{list.description}</CardDescription>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this list?')) {
                        deleteList(list.id);
                      }
                    }}
                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Building2 className="w-4 h-4" />
                    {list.companyIds.length} {list.companyIds.length === 1 ? 'company' : 'companies'}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New List</h3>
            <form onSubmit={handleCreateList}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    List Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., AI Targets"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    placeholder="Brief description of this list"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!newListName.trim()}>
                  Create List
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
