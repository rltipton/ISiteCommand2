/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, ArrowRight, ShieldCheck, Award, ThumbsUp, Leaf, Landmark, Sparkles } from 'lucide-react';
import { useAppBranding } from '../utils';
import logoImage from '../assets/images/tjd_flat_logo_1781219210745.jpg';
import heroBgImage from '../assets/images/hero_excavation_1780832382386.png';

// High accuracy residential assets
import tjdResPond from '../assets/images/tjd_res_pond_1781114602276.png';

interface HeroProps {
  division: 'commercial' | 'residential';
  setDivision: (div: 'commercial' | 'residential') => void;
}

export default function Hero({ division, setDivision }: HeroProps) {
  const branding = useAppBranding();
  const isRes = division === 'residential';

  const activeBg = isRes ? tjdResPond : heroBgImage;
  const activeBadgeBorder = isRes ? 'border-emerald-500/30' : 'border-brand-orange/30';
  const activeBadgeBg = isRes ? 'bg-emerald-950/20 text-emerald-400' : 'bg-brand-orange/10 text-brand-orange';
  const activeDotBg = isRes ? 'bg-emerald-500' : 'bg-brand-orange';
  const activeGradient = isRes ? 'from-emerald-400 to-amber-300' : 'from-brand-orange to-amber-400';
  const activeBorder = isRes ? 'border-emerald-600' : 'border-brand-orange';
  const activeText = isRes ? 'text-emerald-400' : 'text-brand-orange';
  const activeCtaBg = isRes ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-orange hover:bg-brand-darkorange';
  const activeAccentText = isRes ? 'text-emerald-400' : 'text-brand-orange';

  return (
    <section className="relative overflow-hidden bg-brand-coal text-white" id="site-hero">
      {/* Background Image with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={activeBg}
          alt={isRes ? "Custom farm pond construction in Georgia" : "Professional excavation site development in Middle Georgia"}
          className="w-full h-full object-cover object-center opacity-35"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-coal via-brand-coal/90 to-brand-coal/75"></div>
        {/* Subtle grid pattern for commercial construction effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
        
        {/* Quick view division switcher card inside Hero */}
        <div className="mb-8 inline-flex items-center p-1 bg-slate-900/80 border border-slate-800 rounded-full text-xs gap-1.5 shadow-2xl">
          <span className="text-slate-400 pl-3 pr-1 text-[11px] font-sans">Division:</span>
          <button
            type="button"
            onClick={() => setDivision('commercial')}
            className={`py-1.5 px-3 sm:px-4 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              !isRes 
                ? 'bg-brand-orange text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Commercial
          </button>
          <button
            type="button"
            onClick={() => setDivision('residential')}
            className={`py-1.5 px-3 sm:px-4 rounded-full font-bold transition-all flex items-center gap-1.5 ${
              isRes 
                ? 'animate-slow-pulse-glow text-white shadow-md' 
                : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-800/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isRes ? 'bg-white animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            Residential
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left" id="hero-text-block">
            {/* Tagline showing logo badge + tagline text */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new Event('tjd_open_mobile_shortcut'));
                }}
                className="bg-transparent border-0 outline-none p-0 cursor-pointer hover:scale-105 transition-transform"
                title="Get mobile shortcut link to your cell phone!"
              >
                <img 
                  src={logoImage} 
                  alt="TJ Darley Logo" 
                  className="w-11 h-11 rounded-lg border border-slate-200 bg-white p-0.5 object-contain shrink-0 shadow-lg" 
                  referrerPolicy="no-referrer"
                />
              </button>
              <div className={`inline-flex items-center gap-2 px-3 py-1 ${activeBadgeBg} border ${activeBadgeBorder} rounded-full text-xs md:text-sm font-bold tracking-widest uppercase`}>
                <span className={`w-2 h-2 rounded-full ${activeDotBg} animate-ping`}></span>
                ESTABLISHED IN {branding.establishedYear || "2008"} &bull; {(branding.serviceAreas.split(',')[0] || "MIDDLE GEORGIA").toUpperCase()} CUSTOM EARTHWORKS
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]" id="hero-headline">
              {isRes ? (
                <>
                  Shape Your Private Acreage with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
                    {branding.companyName}!
                  </span>
                </>
              ) : (
                <>
                  Transform Your Site with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-400">
                    {branding.companyName}!
                  </span>
                </>
              )}
            </h1>

            {/* Sub-headline / Core Benefit */}
            <p className={`text-xl md:text-2xl text-slate-300 font-semibold border-l-4 ${activeBorder} pl-4 py-1 font-sans`}>
              {isRes ? "Stunning Private Ponds, Forestry Mulching, & Lot Preparation." : "Reliable, Safe, and Tailored Earthwork Solutions."}
            </p>

            {/* Paragraph Description */}
            <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
              {isRes ? (
                `Reclaim your Southern property. Across our service areas including ${branding.serviceAreas.split(',').slice(0, 3).join(', ')}, we excavate pristine farm ponds, construct rock-solid gravel driveways, and clear underbrush. We help private acreage owners turn raw dirt into beautiful, moisture-leveled estates.`
              ) : (
                `Since ${branding.establishedYear || "2008"}, we've delivered reliable, safe, and tailored earthwork solutions across our regional network. We collaborate with commercial and municipal clients to ensure each project meets its unique requirements. OSHA compliant and committed to quality workmanship, we're here to support your project every step of the way.`
              )}
            </p>

            {/* Micro Benefits Inline Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-slate-300" id="hero-bullet-grid">
              {isRes ? (
                <>
                  <div className="flex items-start gap-2">
                    <Leaf className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Forestry Mulching</h4>
                      <p className="text-xs text-slate-400">Eradicates dense underbrush into clean ground bedding.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Pond Clay Compaction</h4>
                      <p className="text-xs text-slate-400">Compacted core sealing to guarantee holding banks.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-orange shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Full OSHA Compliance</h4>
                      <p className="text-xs text-slate-400">Insured & bonded for absolute client security.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-brand-orange shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white text-sm">GSWCC Certified</h4>
                      <p className="text-xs text-slate-400">Certified environmental runoff & sediment protection.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Call To Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4" id="hero-cta-buttons">
              <a
                href="#estimator"
                className={`inline-flex justify-center items-center gap-2.5 ${activeCtaBg} text-white font-black py-4 px-8 rounded-md shadow-2xl transition-all duration-205 transform hover:-translate-y-0.5`}
                id="hero-estimator-cta"
              >
                <span>Calculate Ballpark Estimate</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href={`tel:${branding.phone.replace(/[^0-9]/g, '')}`}
                className="inline-flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-4 px-8 rounded-md shadow-md transition-all duration-200"
                id="hero-tel-cta"
              >
                <Phone className={`w-4 h-4 ${activeAccentText}`} />
                <span>Call {branding.phone} for consultation</span>
              </a>
            </div>
          </div>

          {/* Quick Credibility Board / Side Information Pane */}
          <div className="lg:col-span-5" id="hero-quick-badge-card">
            {/* Quick Clickable Wishlist Link */}
            <a 
              href="#estimator"
              className={`group flex items-center justify-between mb-4 bg-gradient-to-r ${isRes ? 'from-emerald-600/90 via-emerald-700/95 to-teal-700/95 hover:from-emerald-500 hover:via-emerald-600 hover:to-teal-650 border border-emerald-500/20 shadow-emerald-950/40' : 'from-orange-600/90 via-orange-700/95 to-amber-700/95 hover:from-orange-500 hover:via-orange-600 hover:to-amber-650 border border-orange-500/20 shadow-orange-950/40'} p-4 rounded-xl shadow-xl transition-all hover:scale-[1.01] hover:-translate-y-0.5 text-left cursor-pointer`}
              id="hero-wishlist-quick-link"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/25 rounded-lg text-white shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
                </div>
                <div>
                  <h4 className="text-white font-black text-xs uppercase tracking-wider flex items-center gap-1">
                    <span>Client Custom Wishlist</span>
                    <span className="text-[9px] bg-white/15 text-white/95 px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wider">NEW</span>
                  </h4>
                  <p className="text-[10px] text-white/90 font-medium leading-normal mt-0.5">
                    Build your own forestry, pond, and grading specifications in seconds!
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
            </a>

            <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-xl shadow-2xl space-y-6 backdrop-blur-sm">
              <div className={`flex items-center gap-2 ${activeText}`}>
                <ThumbsUp className="w-6 h-6" />
                <h3 className="font-display font-bold text-lg tracking-wide uppercase text-white">
                  {isRes ? "Why Landowners Trust Us" : "Why Georgia Trusts Us"}
                </h3>
              </div>

              <ul className="space-y-4" id="hero-credentials-list">
                {isRes ? (
                  <>
                    <li className="flex items-start gap-3">
                      <div className="bg-emerald-950/50 text-emerald-400 border border-emerald-900 p-1.5 rounded mt-0.5 font-display text-xs font-bold shrink-0">
                        01
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm font-sans">Compacted Pond Coring</h4>
                        <p className="text-xs text-slate-400">Certified earthmovers with extensive clay compaction experience so holding dams never leach.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-emerald-950/50 text-emerald-400 border border-emerald-900 p-1.5 rounded mt-0.5 font-display text-xs font-bold shrink-0">
                        02
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm font-sans font-medium">No Burn Pile Mess</h4>
                        <p className="text-xs text-slate-400 font-sans">Track mulchers grind Sweetgum briars & pine saplings back as organic nutrients for soil moisture.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-emerald-950/50 text-emerald-400 border border-emerald-900 p-1.5 rounded mt-0.5 font-display text-xs font-bold shrink-0">
                        03
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm font-sans font-medium">Flat-Rate Land Bidding</h4>
                        <p className="text-xs text-slate-400 font-sans">No hidden contractor add-ons. You receive itemized quotes directly before machines mobilize.</p>
                      </div>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <div className="bg-brand-orange/20 text-brand-orange p-1 rounded mt-0.5 font-display text-xs font-bold shrink-0">
                        01
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">Commercial & Municipal Focus</h4>
                        <p className="text-xs text-slate-400">Proven track-record collaborating with public utilities and general contractors.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-brand-orange/20 text-brand-orange p-1 rounded mt-0.5 font-display text-xs font-bold shrink-0">
                        02
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">Georgia Clay Experts</h4>
                        <p className="text-xs text-slate-400">Deep structural understanding of Middle Georgia soil density, moisture levels, and grading requirements.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-brand-orange/20 text-brand-orange p-1 rounded mt-0.5 font-display text-xs font-bold shrink-0">
                        03
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">Competitive & Literal Bidding</h4>
                        <p className="text-xs text-slate-400">No surprising add-ons. We deliver itemized schedules matching your blueprints and CAD files.</p>
                      </div>
                    </li>
                  </>
                )}
              </ul>

              {/* Call to Active bidding indicator */}
              <div className="pt-4 border-t border-slate-800 text-center flex justify-between items-center text-xs text-slate-400 font-sans">
                <span>Active project bidding:</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-405">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Operations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
