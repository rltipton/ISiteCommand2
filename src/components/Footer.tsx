/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, MapPin, Calendar, Clock, Landmark, ShieldCheck } from 'lucide-react';
import { useAppBranding } from '../utils';
import logoImage from '../assets/images/tjd_flat_logo_1781219210745.jpg';

export default function Footer() {
  const branding = useAppBranding();
  return (
    <footer className="bg-brand-coal text-slate-300 border-t-8 border-brand-orange text-left" id="site-footer">
      
      {/* Prime call out banner (re-emphasizing the user's explicit CTA) */}
      <div className="bg-slate-900 py-10 border-b border-slate-800" id="footer-cta-strip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6" id="footer-cta-wrapper">
            <div className="space-y-2 text-center lg:text-left max-w-3xl">
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Ready to transform your site?
              </h3>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-sans">
                Ready to get started? Call us today at <a href={`tel:${branding.phone.replace(/[^0-9]/g, '')}`} className="text-brand-orange font-bold hover:underline">{branding.phone}</a> for a free consultation or to request a competitive bid!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0 justify-center">
              <a
                href={`tel:${branding.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-darkorange text-white font-black py-4 px-6 rounded-md shadow-lg transition-transform hover:-translate-y-0.5 duration-200 text-sm tracking-wider uppercase font-display"
                id="footer-dial-now"
              >
                <Phone className="w-5 h-5" />
                <span>Call {branding.phone}</span>
              </a>
              <a
                href="#bid-proposal-form"
                className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 px-6 rounded-md text-sm border border-slate-700 transition-colors"
              >
                Request Competitive Bid
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="footer-directories">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt={`${branding.companyName} Logo`} 
                className="w-10 h-10 rounded-lg border border-slate-200 bg-white p-0.5 object-contain shrink-0" 
                referrerPolicy="no-referrer"
              />
              <h4 className="font-display font-black text-xl text-white tracking-tight">
                {branding.logoText || "TJ DARLEY"}<span className="text-brand-orange">.</span>
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Since {branding.establishedYear || "2008"}, delivering high-precision earthmoving, professional site clearing, grading, and stormwater installations throughout our service areas. We stand for OSHA compliance and reliable performance.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-md w-fit">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
              Fully Insured & Bonded
            </div>
          </div>

          {/* Service Links directory */}
          <div>
            <h5 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">
              Our Capabilities
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#services" className="hover:text-white hover:underline transition-colors block">
                  Professional Site Prep
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white hover:underline transition-colors block">
                  Expert Excavation & Grading
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white hover:underline transition-colors block">
                  Effective Drainage Systems
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white hover:underline transition-colors block">
                  Erosion Control Specialists
                </a>
              </li>
              <li className="pt-2 border-t border-slate-800">
                <a href="#careers" className="text-brand-orange font-bold hover:text-white hover:underline transition-colors block">
                  Join Our Crew (Careers) &rarr;
                </a>
              </li>
              <li>
                <a href="#blog" className="text-emerald-450 font-bold hover:text-white hover:underline transition-colors block">
                  Project Updates & Tips &rarr;
                </a>
              </li>
            </ul>
          </div>

          {/* Regional coverage map details */}
          <div>
            <h5 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">
              Georgia Service Area
            </h5>
            <ul className="space-y-2 text-xs" id="footer-coverage-list">
              {branding.serviceAreas.split(',').map((area, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                  <span>{area.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours and direct links */}
          <div>
            <h5 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">
              Operating Hours
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Monday &mdash; Friday</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-slate-200">
                <Clock className="w-3.5 h-3.5 text-brand-orange" />
                <span>7:00 AM &mdash; 6:00 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Saturdays</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-slate-200">
                <Clock className="w-3.5 h-3.5 text-brand-orange" />
                <span>8:00 AM &mdash; 1:00 PM</span>
              </li>
              <li className="text-[10px] text-slate-500">
                Sundays: Closed for safety maintenance.
              </li>
            </ul>
          </div>

        </div>

        {/* copyright metadata */}
        <div className="pt-12 border-t border-slate-800 mt-12 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4" id="footer-metadata-bar">
          <div>
            &copy; {new Date().getFullYear()} {branding.companyName}. All rights reserved. Registered Contractor in {branding.address}.
          </div>
          
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Statement</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">OSHA Standards Charter</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 cursor-pointer">Licensed / Insured</span>
            <span>&bull;</span>
            <button 
              type="button"
              onClick={() => {
                window.dispatchEvent(new Event('tjd_trigger_staff_auth'));
              }}
              className="hover:text-emerald-400 font-semibold cursor-pointer transition-colors bg-transparent border-0 outline-none p-0 inline-flex items-center gap-1"
            >
              Staff Portal
            </button>
            <span>&bull;</span>
            <a 
              href="#isite-command"
              className="text-amber-400 hover:text-amber-300 font-bold font-mono cursor-pointer transition-colors"
            >
              iSite Command SaaS
            </a>
          </div>
        </div>

      </div>

    </footer>
  );
}
