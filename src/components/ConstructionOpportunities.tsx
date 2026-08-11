import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Calendar, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  DollarSign, 
  Briefcase, 
  CheckCircle2, 
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

export interface Opportunity {
  title: string;
  location: string;
  agency: string;
  postedDate: string;
  deadline: string;
  link: string;
  description: string;
  estimatedValue: string;
  isLive?: boolean;
}

export default function ConstructionOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [isLiveSearch, setIsLiveSearch] = useState<boolean>(false);
  const [asOfDate, setAsOfDate] = useState<string>('');
  const [systemNote, setSystemNote] = useState<string | null>(null);

  // Load default/cached bids on mount
  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async (searchQuery: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search-opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customQuery: searchQuery || undefined })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve opportunities from the server.');
      }

      const data = await response.json();
      
      // Keep safety array formatting
      let list: Opportunity[] = data.opportunities || [];
      
      // Client-side helper: Sort by posted date newest on top if parsable, else keep order
      const parseDate = (dStr: string) => {
        try {
          return Date.parse(dStr) || 0;
        } catch {
          return 0;
        }
      };

      list.sort((a, b) => {
        const dateA = parseDate(a.postedDate);
        const dateB = parseDate(b.postedDate);
        if (dateA !== 0 && dateB !== 0) {
          return dateB - dateA; // descending newest first
        }
        return 0; // retain secondary ranking from model search
      });

      setOpportunities(list);
      setIsLiveSearch(!!data.live);
      setAsOfDate(data.asOfDate || new Date().toLocaleDateString('en-US'));
      setSystemNote(data.note || null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An unexpected error occurred while fetching bid updates.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities(customQuery);
  };

  return (
    <section className="bg-slate-900 py-16 border-t border-b border-slate-950 text-left relative overflow-hidden" id="earthwork-opportunities-dashboard">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-10 pointer-events-none"></div>
      <div className="absolute -bottom-10 right-10 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-10">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-3">
            <span className="font-mono text-[10px] sm:text-xs text-brand-orange font-bold uppercase tracking-widest inline-flex items-center gap-1.5 bg-amber-950/40 border border-brand-orange/30 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              LIVE GEORGIA OPPORTUNITY INDEX
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-none">
              Bid & Contract <span className="text-brand-orange">Opportunities</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Find and track active public RFPs, municipal tenders, and commercial site preparation contracts in real-time. Results are fetched via Google Search Grounding with the newest listings sorted on top.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-xs whitespace-nowrap bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg">
              Updated: <strong className="text-white">{asOfDate || 'Today'}</strong>
            </span>
            <button
              onClick={() => fetchOpportunities(customQuery)}
              disabled={loading}
              className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all disabled:opacity-50"
              title="Refresh listings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-orange' : ''}`} />
            </button>
          </div>
        </div>

        {/* Info Banner on System State */}
        {systemNote && (
          <div className="p-4 bg-blue-950/30 border border-blue-900/50 rounded-xl text-xs text-blue-300 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Sandbox Offline Preview Notice</span>
              {systemNote}
            </div>
          </div>
        )}

        {/* Live Search Form & Statistics */}
        <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 space-y-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Search by location or scope (e.g., Macon, Retention Pond, Grading, Bibb County)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-brand-orange text-slate-200 text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-orange font-sans placeholder-slate-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-brand-orange text-white hover:bg-opacity-90 font-bold rounded-xl text-xs sm:text-sm tracking-wide uppercase transition-all duration-150 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Searching...' : 'Scan Portals'}</span>
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900 text-xs">
            <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">Quick Filters:</span>
            {[
              { label: 'All Georgia', query: '' },
              { label: 'Macon / Bibb County', query: 'Macon Bibb County earthwork grading' },
              { label: 'Retention Ponds', query: 'retention pond sedimentation basin excavation Georgia' },
              { label: 'Site Prep & Excavating', query: 'site preparation grading excavation bidding Georgia' },
              { label: 'Road & Gravel Work', query: 'gravel road roadwork grading construction Georgia' }
            ].map((filt) => (
              <button
                key={filt.label}
                type="button"
                onClick={() => {
                  setCustomQuery(filt.query);
                  fetchOpportunities(filt.query);
                }}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-sans transition-all duration-150 ${
                  customQuery === filt.query 
                    ? 'bg-brand-orange border-brand-orange text-white font-bold' 
                    : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {filt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main List Container */}
        <div className="space-y-6">
          {loading && opportunities.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-10 h-10 text-brand-orange animate-spin" />
              <p className="text-slate-400 font-mono text-xs">Querying public portals & search indexing...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-red-950/25 border border-red-900/40 rounded-2xl flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-brand-orange shrink-0 mt-0.5" />
              <div className="space-y-2 text-left">
                <h4 className="font-display font-bold text-red-400">Search Grounding Interrupted</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
                <button
                  onClick={() => fetchOpportunities(customQuery)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 font-mono text-[11px] text-white"
                >
                  Retry Search
                </button>
              </div>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="py-16 text-center bg-slate-950/30 rounded-2xl border border-dashed border-slate-800 space-y-4">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-slate-300 font-bold text-sm">No recent matching opportunities found</p>
                <p className="text-slate-500 text-xs">Try broader search terms or clear your query to view general bids.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="opportunities-grid-view">
              {opportunities.map((opp, idx) => {
                // Determine if a badge is warranted
                const isNew = idx < 2 && !customQuery;
                return (
                  <div 
                    key={opp.title + idx}
                    className="bg-slate-950/45 hover:bg-slate-950/80 border border-slate-800/80 hover:border-brand-orange/60 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between group shadow-xl relative"
                  >
                    {isNew && (
                      <span className="absolute top-4 right-4 bg-brand-orange text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        NEWEST LISTING
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Sub-Header info */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                        <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-brand-orange font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {opp.isLive ? 'Live Verified' : 'Archived/Sourced'}
                        </span>
                        <span className="text-slate-400 inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                          {opp.location}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-black text-base sm:text-lg text-white group-hover:text-brand-orange transition-colors leading-snug tracking-tight">
                        {opp.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-400 text-xs leading-relaxed font-sans line-clamp-3">
                        {opp.description}
                      </p>

                      {/* Structural Metadata Blocks */}
                      <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-slate-900">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Procurement Agency</span>
                          <span className="text-slate-300 font-sans font-semibold text-[11px] flex items-center gap-1 truncate" title={opp.agency}>
                            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            {opp.agency}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Estimated Budget</span>
                          <span className="text-amber-400 font-mono font-bold text-xs flex items-center gap-0.5">
                            <DollarSign className="w-3.5 h-3.5 text-brand-orange" />
                            {opp.estimatedValue}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action bar */}
                    <div className="pt-4 mt-6 border-t border-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          Posted: {opp.postedDate}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          Close: {opp.deadline}
                        </span>
                      </div>

                      <a
                        href={opp.link}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="p-2 bg-slate-900 hover:bg-brand-orange hover:text-white border border-slate-800 hover:border-brand-orange text-slate-300 rounded-lg transition-all duration-150 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                        title={`Navigate directly to ${opp.agency} bidding documentation`}
                      >
                        <span>View Portal</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Direct Subcontracting CTA / Self-service */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <h4 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-brand-orange" />
              <span>Need Subcontracting or Site Takeoffs For These Bids?</span>
            </h4>
            <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">
              We collaborate with general contractors on major municipal, industrial, and infrastructure project bids. Instantly upload grading diagrams and blueprints in our <strong>Blueprint takeoff helper</strong> above to generate subgrade bid pricing immediately.
            </p>
          </div>
          <button 
            onClick={() => {
              // Scroll gracefully to multi-phase-bid or bid-form
              const elem = document.getElementById('bidding-form-deck') || document.getElementById('estimator-ballpark-calculator');
              if (elem) {
                elem.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-bold text-brand-orange uppercase tracking-wider rounded-lg shrink-0 transition-all"
          >
            Submit Takeoff Pricing
          </button>
        </div>

      </div>
    </section>
  );
}
