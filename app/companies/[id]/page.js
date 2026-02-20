'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, MapPin, Globe, Tag, Sparkles, StickyNote, Clock, Activity } from 'lucide-react';
import mockCompanies from '@/lib/data/mockCompanies.json';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { formatRelativeTime, formatDateTime } from '@/lib/utils/formatters';
import SaveToList from '@/components/companies/CompanyProfile/SaveToList';

export default function CompanyProfilePage() {
  const { id } = useParams();
  const company = mockCompanies.find((c) => c.id === id);

  // Notes state
  const [notes, setNotes] = useLocalStorage(`notes_${id}`, '');

  // Enrichment state
  const [enrichmentData, setEnrichmentData] = useLocalStorage(`enrichment_${id}`, null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState(null);

  if (!company) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Company not found</h1>
        <p className="text-slate-500 mb-4">The company you are looking for does not exist.</p>
        <Link href="/companies">
          <Button variant="secondary">Back to Companies</Button>
        </Link>
      </div>
    );
  }

  const handleEnrich = async () => {
    setIsEnriching(true);
    setEnrichError(null);

    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: company.website }),
      });

      if (!response.ok) {
        throw new Error('Failed to enrich company data');
      }

      const data = await response.json();
      setEnrichmentData(data);
    } catch (error) {
      setEnrichError(error.message);
    } finally {
      setIsEnriching(false);
    }
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

  // Mock signals data
  const mockSignals = [
    { id: 1, type: 'funding', title: 'Series B funding announced', date: '2024-01-15', description: 'Raised $50M led by Andreessen Horowitz' },
    { id: 2, type: 'hiring', title: 'Active hiring', date: '2024-02-01', description: '50+ open positions in Engineering and Sales' },
    { id: 3, type: 'product', title: 'Product launch', date: '2024-02-10', description: 'Launched new enterprise tier with advanced features' },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/companies" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Companies
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{company.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <Badge variant={getIndustryBadgeVariant(company.industry)}>
              {company.industry}
            </Badge>
            <Badge variant="default">{company.stage}</Badge>
            <span className="flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="w-4 h-4" />
              {company.location}
            </span>
            <a 
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              <Globe className="w-4 h-4" />
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <SaveToList companyId={company.id} />
          <Button
            onClick={handleEnrich}
            isLoading={isEnriching}
            disabled={isEnriching || enrichmentData}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {enrichmentData ? 'Enriched' : 'Enrich'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Enrichment & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrichment Results */}
          {enrichmentData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <CardTitle>AI-Enriched Insights</CardTitle>
                  </div>
                  <span className="text-xs text-slate-400">
                    Enriched {formatRelativeTime(enrichmentData.enrichedAt)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                {enrichmentData.summary && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Summary</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{enrichmentData.summary}</p>
                  </div>
                )}

                {/* What They Do */}
                {enrichmentData.whatTheyDo && enrichmentData.whatTheyDo.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-2">What They Do</h4>
                    <ul className="space-y-2">
                      {enrichmentData.whatTheyDo.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Keywords */}
                {enrichmentData.keywords && enrichmentData.keywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {enrichmentData.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="primary" size="sm">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signals */}
                {enrichmentData.signals && enrichmentData.signals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Detected Signals</h4>
                    <div className="flex flex-wrap gap-2">
                      {enrichmentData.signals.map((signal, idx) => (
                        <Badge key={idx} variant="success" size="sm">
                          {signal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {enrichmentData.sources && enrichmentData.sources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Sources</h4>
                    <div className="space-y-2">
                      {enrichmentData.sources.map((source, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <a 
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline truncate max-w-md"
                          >
                            {source.url}
                          </a>
                          <span className="text-slate-400 text-xs">
                            {formatDateTime(source.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error state */}
          {enrichError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600">{enrichError}</p>
              <button 
                onClick={() => setEnrichError(null)}
                className="text-sm text-red-700 hover:underline mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading state */}
          {isEnriching && (
            <Card className="py-12">
              <LoadingSpinner text="Analyzing company website with AI..." />
            </Card>
          )}

          {/* Signals Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-600" />
                <CardTitle>Signals Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSignals.map((signal) => (
                  <div key={signal.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        signal.type === 'funding' && 'bg-green-500',
                        signal.type === 'hiring' && 'bg-blue-500',
                        signal.type === 'product' && 'bg-purple-500'
                      )} />
                      <div className="w-0.5 h-full bg-slate-200 mt-1" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900">{signal.title}</span>
                        <Badge variant="default" size="sm">{signal.type}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{signal.description}</p>
                      <span className="text-xs text-slate-400 mt-1">{formatDateTime(signal.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Notes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-slate-600" />
                <CardTitle>Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes about this company..."
                className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Auto-saved to local storage
              </p>
            </CardContent>
          </Card>

          {/* Company Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-600" />
                <CardTitle>Company Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Industry</label>
                <p className="text-sm text-slate-900 mt-1">{company.industry}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Stage</label>
                <p className="text-sm text-slate-900 mt-1">{company.stage}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Location</label>
                <p className="text-sm text-slate-900 mt-1">{company.location}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Website</label>
                <a 
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline mt-1 block"
                >
                  {company.website}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function for signal colors
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
