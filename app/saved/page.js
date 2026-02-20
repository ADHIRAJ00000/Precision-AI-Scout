'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Trash2, Clock, Filter, ArrowRight, Bookmark } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useSavedSearches } from '@/lib/hooks/useSavedSearches';
import { formatRelativeTime } from '@/lib/utils/formatters';

export default function SavedSearchesPage() {
  const { getAllSearches, deleteSearch } = useSavedSearches();
  const searches = getAllSearches();

  const handleDelete = (searchId) => {
    if (confirm('Are you sure you want to delete this saved search?')) {
      deleteSearch(searchId);
    }
  };

  const buildSearchUrl = (filters) => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.industry && filters.industry !== 'All') params.set('industry', filters.industry);
    if (filters.stage && filters.stage !== 'All') params.set('stage', filters.stage);
    return `/companies?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Saved Searches</h1>
          <p className="text-slate-500 mt-1">
            {searches.length} {searches.length === 1 ? 'search' : 'searches'} saved
          </p>
        </div>
        <Link href="/companies">
          <Button leftIcon={<Search className="w-4 h-4" />}>
            New Search
          </Button>
        </Link>
      </div>

      {/* Saved Searches List */}
      {searches.length === 0 ? (
        <Card className="py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No saved searches</h3>
            <p className="text-slate-500 mb-4">Save your favorite search filters for quick access</p>
            <Link href="/companies">
              <Button>Browse Companies</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {searches.map((search) => (
            <Card key={search.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{search.name}</h3>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        Saved {formatRelativeTime(search.createdAt)}
                      </span>
                    </div>

                    {/* Filter badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {search.filters.query && (
                        <Badge variant="primary" size="sm">
                          Search: {search.filters.query}
                        </Badge>
                      )}
                      {search.filters.industry && search.filters.industry !== 'All' && (
                        <Badge variant="success" size="sm">
                          Industry: {search.filters.industry}
                        </Badge>
                      )}
                      {search.filters.stage && search.filters.stage !== 'All' && (
                        <Badge variant="warning" size="sm">
                          Stage: {search.filters.stage}
                        </Badge>
                      )}
                      {!search.filters.query && 
                       (!search.filters.industry || search.filters.industry === 'All') &&
                       (!search.filters.stage || search.filters.stage === 'All') && (
                        <span className="text-sm text-slate-400">No filters applied</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={buildSearchUrl(search.filters)}>
                      <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Run Search
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(search.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete saved search"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-1">How to save searches</h4>
              <p className="text-sm text-slate-600">
                While browsing companies, apply your desired filters and click the "Save Search" button. 
                Your filters will be saved here for quick access later.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
