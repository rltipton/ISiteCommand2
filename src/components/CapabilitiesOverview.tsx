import React from 'react';
import { 
  CheckCircle, 
  Layers, 
  Calculator, 
  TrendingUp, 
  Globe, 
  Truck, 
  HardHat, 
  Compass, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles,
  Search,
  CloudLightning,
  FileCheck2,
  Boxes,
  HelpCircle,
  Clock
} from 'lucide-react';

interface CapabilitiesOverviewProps {
  onBackToHome: () => void;
}

export default function CapabilitiesOverview({ onBackToHome }: CapabilitiesOverviewProps) {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col relative overflow-hidden" id="app-capabilities-overview">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-950/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Back Button & Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 w-full relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800">
        <button
          onClick={onBackToHome}
          className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 px-4 py-2 rounded-xl text-xs sm:text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Main Page</span>
        </button>
        <div className="flex items-center gap-2 text-xs font-mono bg-amber-950/40 border border-brand-orange/30 text-brand-orange px-3 py-1.5 rounded-full uppercase tracking-widest font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          TJ Darley System Architecture
        </div>
      </div>

      {/* Hero Intro Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6 relative z-10">
        <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight">
          Discover Our Advanced <br />
          <span className="text-brand-orange">Earthwork Technology Suite</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
          Explore how our cloud-native construction platform combines raw physical civil engineering metrics with intelligent margin protection, live bid indexing, and real-time field operations.
        </p>
      </div>

      {/* Main Core Modules Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Large High-Impact Feature Breakdown (Multi-Phase Takeoffs & Estimates) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 border border-brand-orange/30 rounded-2xl text-brand-orange shrink-0">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-brand-orange font-mono font-bold tracking-widest uppercase">Proprietary Core</span>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-white">Multi-Phase Subgrade Takeoff Engine</h2>
              </div>
            </div>

            <p className="text-slate-350 text-xs sm:text-sm leading-relaxed">
              Our advanced <strong>Takeoff Bid Estimator</strong> operates on an enterprise-grade calculus modeled directly after our field workbook. Unlike standard estimation tools that generate high-level numbers, our engine calculates down to exact physical material components, logistics, and overhead protections:
            </p>

            {/* Concrete list of physical items calculated */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950/70 border border-slate-850 p-4 rounded-xl space-y-2">
                <span className="font-mono text-[10px] text-brand-orange font-black uppercase tracking-wider block">1. Material Computation</span>
                <ul className="space-y-1.5 text-slate-300 text-xs font-sans list-none">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Straw Mulch:</strong> Computes exact bales needed for stabilization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Grass Seed:</strong> Multi-blend density formulas per acre</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Schedule 40 PVC & Corrugated Piping:</strong> Linear ft run + couplers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Silt Fencing & Geotextiles:</strong> Filter barrier roles & erosion mats</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950/70 border border-slate-850 p-4 rounded-xl space-y-2">
                <span className="font-mono text-[10px] text-emerald-400 font-black uppercase tracking-wider block">2. Margin Protection Filters</span>
                <ul className="space-y-1.5 text-slate-300 text-xs font-sans list-none">
                  <li className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Shipping & Transit Fees:</strong> Calculated based on quarry haul miles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <HardHat className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Attendant Labor Rates:</strong> Loaded hourly wage + mobilization overhead</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Contractor Markups:</strong> Custom tier margins to prevent budget creep</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>Two-Tier Outputting:</strong> Shows internal true cost vs client-facing proposals</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 flex items-center gap-3">
              <Boxes className="w-6 h-6 text-brand-orange shrink-0" />
              <p className="text-slate-400 text-xs leading-relaxed">
                <strong className="text-white">Protecting Your Profit Margins:</strong> The application automatically compiles mobilization fees (including 4x4 UTV support vehicles for rapid tool trailer acquisition runs), fuel surcharges, and secondary physical materials so that no out-of-pocket costs go unbilled.
              </p>
            </div>
          </div>

          {/* Sourcing Section: Regional Georgia Bids Index */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-2xl text-blue-400 shrink-0">
                <Globe className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-blue-400 font-mono font-bold tracking-widest uppercase">Live Sourcing</span>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-white">Live Georgia Opportunity Index</h2>
              </div>
            </div>

            <p className="text-slate-350 text-xs sm:text-sm leading-relaxed">
              We integrated a state-wide <strong>Live Earthwork Bidding & RFP Finder</strong>. Utilizing Google Search Grounding powered by Gemini, the system bypasses stale directories to find live active grading, excavation, pond, and road projects across Middle Georgia:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span><strong>Government Portals:</strong> Directly crawls county procurement and municipal tender boards (e.g., Bibb County, Warner Robins).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span><strong>Value Estimations:</strong> Extracts contract budget limits, bid closing dates, and sourcing link portals.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Highlights & System Statistics */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Quick Stats Sheet */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-display font-black text-lg text-white uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-orange" />
              <span>Platform Security</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Competitor Isolation</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your raw estimators, staff spreadsheets, employee clocks, and bid opportunity finders are guarded strictly inside the secure <strong>Office Hub</strong>. It requires a private Staff PIN, keeping sensitive bid calculations completely out of reach of competitors.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Client Ballpark Calculator</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The public-facing side of the app provides standard, simple square-footage ballpark calculators. This acts as a high-conversion sales funnel to preheat leads before passing them into your advanced internal multi-phase engine.
                </p>
              </div>
            </div>
          </div>

          {/* Real-time sync capabilities */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <CloudLightning className="w-5 h-5 text-emerald-400" />
              <span>Office Hub & Field Operations</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
                <Calculator className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">Spreadsheet Integration</strong>
                  Syncs with cloud sheets (OneDrive) for instant billing backups.
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
                <Compass className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">Rugged 10" Field Tablet Optimization</strong>
                  Built for field tablets in heavy equipment cabs—oversized touch targets, glare-free high-contrast typography, and zero fat-finger errors (no sitting at laptops or squinting at tiny phones).
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
                <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <strong className="text-slate-200 block">Slack & Dispatch Notifications</strong>
                  Instantly triggers notifications to office dispatchers when new bids or crew logs are completed.
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic CTA Footer Section */}
      <div className="bg-slate-900 border-t border-slate-800 py-12 relative z-10 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h3 className="font-display font-black text-xl sm:text-2xl text-white">
            Ready to test the advanced capabilities?
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Head back to the main landing screen, toggle between residential or commercial divisions, and utilize the tools designed for your client audience or staff operations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onBackToHome}
              className="px-6 py-3 bg-brand-orange text-white hover:bg-opacity-90 font-bold rounded-xl text-xs sm:text-sm tracking-wider uppercase transition-all duration-150"
            >
              Open Main Site
            </button>
            <button
              onClick={() => {
                window.location.hash = '#multi-phase-bid';
              }}
              className="px-6 py-3 bg-slate-950 hover:bg-slate-850 text-brand-orange border border-slate-800 font-bold rounded-xl text-xs sm:text-sm tracking-wider uppercase transition-all duration-150"
            >
              Open Takeoff Estimator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
