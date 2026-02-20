'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Bookmark, ArrowUpDown } from 'lucide-react';
import mockCompanies from '@/lib/data/mockCompanies.json';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useSavedSearches } from '@/lib/hooks/useSavedSearches';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const INDUSTRIES = ['All', 'AI/ML', 'Fintech', 'Healthcare', 'SaaS', 'Consumer', 'Enterprise'];
const STAGES = ['All', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Public'];
const ITEMS_PER_PAGE = 20;

export default function CompaniesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveSearch } = useSavedSearches();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get('industry') || 'All');
  const [selectedStage, setSelectedStage] = useState(searchParams.get('stage') || 'All');
  const [sortField, setSortField] = useState(searchParams.get('sort') || 'name');
  const [sortDirection, setSortDirection] = useState(searchParams.get('dir') || 'asc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedIndustry !== 'All') params.set('industry', selectedIndustry);
    if (selectedStage !== 'All') params.set('stage', selectedStage);
    if (sortField !== 'name') params.set('sort', sortField);
    if (sortDirection !== 'asc') params.set('dir', sortDirection);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    router.replace(`/companies?${params.toString()}`, { scroll: false });
  }, [searchQuery, selectedIndustry, selectedStage, sortField, sortDirection, currentPage, router]);

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    let result = [...mockCompanies];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.industry.toLowerCase().includes(query) ||
          company.location.toLowerCase().includes(query)
      );
    }

    // Industry filter
    if (selectedIndustry !== 'All') {
      result = result.filter((company) => company.industry === selectedIndustry);
    }

    // Stage filter
    if (selectedStage !== 'All') {
      result = result.filter((company) => company.stage === selectedStage);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [searchQuery, selectedIndustry, selectedStage, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCompanies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCompanies, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSaveSearch = () => {
    if (!searchName.trim()) return;
    
    saveSearch(searchName, {
      query: searchQuery,
      industry: selectedIndustry,
      stage: selectedStage,
    });
    
    setShowSaveSearchModal(false);
    setSearchName('');
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

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
          <p className="text-slate-500 mt-1">
            {filteredCompanies.length} companies found
          </p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<Bookmark className="w-4 h-4" />}
          onClick={() => setShowSaveSearchModal(true)}
        >
          Save Search
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Industry Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[160px]"
            >
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry === 'All' ? 'All Industries' : industry}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Stage Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[160px]"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage === 'All' ? 'All Stages' : stage}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Active filters */}
        {(searchQuery || selectedIndustry !== 'All' || selectedStage !== 'All') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-sm text-slate-500">Active filters:</span>
            {searchQuery && (
              <Badge variant="primary" size="sm">
                Search: {searchQuery}
              </Badge>
            )}
            {selectedIndustry !== 'All' && (
              <Badge variant="primary" size="sm">
                Industry: {selectedIndustry}
              </Badge>
            )}
            {selectedStage !== 'All' && (
              <Badge variant="primary" size="sm">
                Stage: {selectedStage}
              </Badge>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedIndustry('All');
                setSelectedStage('All');
                setCurrentPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Company
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('industry')}
                >
                  <div className="flex items-center gap-2">
                    Industry
                    <SortIcon field="industry" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('stage')}
                >
                  <div className="flex items-center gap-2">
                    Stage
                    <SortIcon field="stage" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center gap-2">
                    Location
                    <SortIcon field="location" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Website
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedCompanies.map((company) => (
                <tr 
                  key={company.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link href={`/companies/${company.id}`} className="block">
                      <span className="font-medium text-slate-900 hover:text-blue-600 transition-colors">
                        {company.name}
                      </span>
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
                  <td className="px-6 py-4">
                    <a 
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginatedCompanies.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No companies found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredCompanies.length)} of{' '}
              {filteredCompanies.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Search Modal */}
      {showSaveSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Save Search</h3>
            <p className="text-sm text-slate-500 mb-4">
              Save your current filters to quickly access them later.
            </p>
            <input
              type="text"
              placeholder="Search name (e.g., AI Companies)"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowSaveSearchModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSearch} disabled={!searchName.trim()}>
                Save Search
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
