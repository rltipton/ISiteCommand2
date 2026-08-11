/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TESTIMONIALS_DATA, 
  RES_TESTIMONIALS_DATA, 
  FAQS, 
  RES_FAQS, 
  TRUST_PARTNERS 
} from '../data';
import { useAppBranding } from '../utils';
import { 
  Star, 
  Quote, 
  Plus, 
  Minus, 
  ShieldCheck,
  Building 
} from 'lucide-react';

interface TestimonialsProps {
  division: 'commercial' | 'residential';
}

export default function Testimonials({ division }: TestimonialsProps) {
  const branding = useAppBranding();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const isRes = division === 'residential';

  // Helper to dynamically translate hardcoded references in text datasets
  const cleanText = (str: string) => {
    if (!str) return str;
    return str
      .replace(/TJ Darley Construction/g, branding.companyName)
      .replace(/TJ Darley/g, branding.companyName)
      .replace(/office@tjdarley\.com/gi, branding.email)
      .replace(/tjdarleyconstruction@gmail\.com/gi, branding.email)
      .replace(/478-808-7789/g, branding.phone)
      .replace(/2008/g, branding.establishedYear);
  };

  // Toggle dynamic datasets with translation layers applied
  const activeTestimonials = (isRes ? RES_TESTIMONIALS_DATA : TESTIMONIALS_DATA).map(t => ({
    ...t,
    text: cleanText(t.text),
  }));
  
  const activeFaqsGrid = (isRes ? RES_FAQS : FAQS).map(f => ({
    q: cleanText(f.q),
    a: cleanText(f.a),
  }));

  const btnThemeColor = isRes ? 'bg-emerald-600' : 'bg-brand-orange';
  const textThemeColor = isRes ? 'text-emerald-400' : 'text-brand-orange';
  const bgBadgeTheme = isRes ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/50' : 'bg-white/5 border-white/10 text-brand-orange';

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-slate-900 text-white relative animate-none" id="testimonials">
      {/* Structural topography backdrop grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Testimonials Block */}
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className={`font-display font-bold text-xs tracking-widest uppercase px-3.5 py-1.5 rounded-full border ${bgBadgeTheme}`}>
              {isRes ? "GEORGIA HOMEOWNER REPUTATION" : "GEORGIA REPUTATION"}
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white">
              {isRes ? "What Southern Acreage Owners Say About Us" : "Endorsed by Top Developers & Municipalities"}
            </h2>
            <div className={`w-16 h-1 ${isRes ? 'bg-emerald-600' : 'bg-brand-orange'} mx-auto rounded-full`}></div>
            <p className="text-slate-400 font-medium text-sm md:text-base">
              {isRes ? (
                "We treat your custom house site, private lake, or family farm roads with the ultimate level of professional earthworks craftsmanship."
              ) : (
                `Operating continuously since ${branding.establishedYear || "2008"}, custom quality speaks through our commercial partners.`
              )}
            </p>
          </div>

          {/* Testimonials Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="testimonials-grid">
            {activeTestimonials.map((t) => (
              <div 
                key={t.id} 
                className="bg-slate-800/80 border border-slate-700 p-6 md:p-8 rounded-xl shadow-lg relative flex flex-col justify-between transition-transform duration-305 hover:-translate-y-1"
                id={`testimonial-${t.id}`}
              >
                {/* Floating Double Quote */}
                <Quote className={`absolute top-6 right-6 w-10 h-10 ${textThemeColor} opacity-15 pointer-events-none`} />

                <div className="space-y-4">
                  {/* Rating stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${textThemeColor} fill-current`} />
                    ))}
                  </div>

                  <p className="text-slate-300 text-sm md:text-base leading-relaxed italic">
                    "{t.text}"
                  </p>
                </div>

                {/* Profile info footer */}
                <div className="pt-6 border-t border-slate-700 mt-6 flex items-center justify-between" id={`testimonial-info-${t.id}`}>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-none mt-1">
                      {t.role}
                    </p>
                    {t.company && (
                      <p className={`text-[11px] ${textThemeColor} font-semibold mt-0.5`}>
                        {t.company}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-700 py-1 px-2.5 rounded font-medium">
                    {t.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Credibility / Local trust badges */}
        <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 sm:p-10" id="trustbar-section">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-4 space-y-2">
              <h3 className="font-display font-bold text-sm sm:text-base tracking-wider uppercase text-slate-300">
                Middle Georgia Professional Affiliations
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We maintain active clearance with local municipalities, drainage utility councils, farm associations, and regional land planners.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4" id="trustbar-grid">
              {TRUST_PARTNERS.map((partner, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-700/50 rounded-lg p-4 text-center space-y-1">
                  <Building className={`w-5 h-5 ${textThemeColor} mx-auto opacity-75`} />
                  <h4 className="font-display font-bold text-xs text-slate-200 line-clamp-1">{partner.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono block">{partner.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs Accordion Block */}
        <div className="pt-8 border-t border-slate-800" id="faq">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="faq-layout">
            
            {/* Left side text column */}
            <div className="lg:col-span-4 space-y-4">
              <span className={`${textThemeColor} font-bold text-xs tracking-widest uppercase font-display block`}>
                {isRes ? "ACREAGE & GEOLOGICAL PERMIT GUIDANCE" : "GEOLOGICAL & PERMIT GUIDANCE"}
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                {isRes ? "Acreage & Custom Drainage FAQs" : "Frequently Asked Earthwork Questions"}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Preparing sites involves unique local approvals, sediment runoff regulations, and challenging soils. We have organized standard answers from our {new Date().getFullYear() - (parseInt(branding.establishedYear) || 2008)}+ years of field operations.
              </p>
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className={`w-5 h-5 ${textThemeColor} shrink-0 mt-0.5`} />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Have a customized blueprint query? Direct-dial our headquarters mapping engineer at <a href={`tel:${branding.phone.replace(/[^0-9]/g, '')}`} className={`${textThemeColor} font-semibold hover:underline`}>{branding.phone}</a>.
                </p>
              </div>
            </div>

            {/* Right side Accordion container */}
            <div className="lg:col-span-8 divide-y divide-slate-800 bg-slate-950/45 border border-slate-800 rounded-2xl p-4 sm:p-6" id="faq-accordions-group">
              {activeFaqsGrid.map((faq, index) => (
                <div key={index} className="py-4 first:pt-0 last:pb-0" id={`faq-item-${index}`}>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between text-left text-white py-2 focus:ring-0 focus:outline-none group"
                    aria-expanded={activeFaq === index}
                    id={`faq-toggle-btn-${index}`}
                  >
                    <span className={`font-display font-semibold text-sm sm:text-base tracking-wide ${isRes ? 'group-hover:text-emerald-400' : 'group-hover:text-brand-orange'} transition-colors`}>
                      {faq.q}
                    </span>
                    <span className={`bg-slate-850 ${textThemeColor} p-1.5 rounded transition-transform`}>
                      {activeFaq === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      activeFaq === index ? 'max-h-[350px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}
                    id={`faq-answer-block-${index}`}
                  >
                    <p className={`text-xs sm:text-sm text-slate-400 leading-relaxed bg-slate-900/60 p-4 rounded-lg border-l-2 ${isRes ? 'border-emerald-600' : 'border-brand-orange'}`}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
