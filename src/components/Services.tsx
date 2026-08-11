/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SERVICES_DATA, RES_SERVICES_DATA } from '../data';
import { ServiceDetail } from '../types';
import { useAppBranding } from '../utils';
import { 
  Building2, 
  HardHat, 
  Droplets, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Hammer, 
  ShieldCheck, 
  Scale,
  Truck,
  Leaf
} from 'lucide-react';

// Maps string name to Lucide components safely
const IconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Building2: Building2,
  HardHat: HardHat,
  Droplets: Droplets,
  ShieldAlert: ShieldAlert,
  Truck: Truck,
  Leaf: Leaf
};

interface ServicesProps {
  division: 'commercial' | 'residential';
}

export default function Services({ division }: ServicesProps) {
  const branding = useAppBranding();
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const isRes = division === 'residential';
  const activeServices = isRes ? RES_SERVICES_DATA : SERVICES_DATA;

  const activeColor = isRes ? 'bg-emerald-600' : 'bg-brand-orange';
  const activeText = isRes ? 'text-emerald-500' : 'text-brand-orange';
  const hoverText = isRes ? 'hover:text-emerald-600' : 'hover:text-brand-orange';
  const activeBadgeBorder = isRes ? 'border-emerald-250' : 'border-amber-200';
  const activeBadgeBg = isRes ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-brand-orange';

  const getIcon = (name: string) => {
    const Component = IconMap[name];
    if (Component) return <Component className="w-8 h-8" />;
    if (name === 'Truck') return <Truck className="w-8 h-8" />;
    return <HardHat className="w-8 h-8" />;
  };

  return (
    <section className="py-20 bg-slate-50 relative animate-none" id="services">
      {/* Structural pattern backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className={`font-display font-bold text-xs tracking-widest uppercase px-3 py-1 rounded-full border ${activeBadgeBg} ${activeBadgeBorder}`}>
            {isRes ? `${(branding.companyName || "TJ DARLEY").toUpperCase()} RESIDENTIAL CAPABILITIES` : `${(branding.companyName || "TJ DARLEY").toUpperCase()} CAPABILITIES`}
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-coal tracking-tight" id="services-headline">
            {isRes ? "Custom Land & Acreage Craftsmanship" : "Professional Earthwork Engineering"}
          </h2>
          <div className={`w-16 h-1 ${activeColor} mx-auto rounded-full`}></div>
          <p className="text-slate-600 font-medium">
            {isRes ? (
              `Since ${branding.establishedYear || "2008"}, we've helped Southern landowners expand their acreage, shape private waterways, and prepare rock-solid foundation pads.`
            ) : (
              `Since ${branding.establishedYear || "2008"}, we have provided comprehensive site solutions with high-performance machinery, seasoned operators, and GSWCC certifications.`
            )}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" id="services-grid">
          {activeServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-350 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
              onClick={() => setSelectedService(service)}
              id={`service-card-${service.id}`}
            >
              {/* Image Section */}
              <div className="h-48 relative overflow-hidden bg-slate-900 border-b border-slate-100">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                
                {/* Floating Icon */}
                <div className={`absolute bottom-4 left-4 ${activeColor} text-white p-3 rounded-lg shadow-lg`}>
                  {getIcon(service.iconName)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between" id={`service-body-${service.id}`}>
                <div className="space-y-3">
                  <h3 className={`font-display font-bold text-lg text-brand-coal tracking-tight ${hoverText} transition-colors font-semibold`}>
                    {service.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className={`pt-6 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold ${activeText} group-hover:translate-x-1 transition-transform`}>
                  <span>Explore Specs & Case Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Banner Highlight */}
        <div className="mt-16 bg-brand-coal text-white rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden" id="safety-guarantee-banner">
          {/* Decorative warning stripe bar in right corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[repeating-linear-gradient(45deg,#10b981,#10b981_10px,#1e293b_10px,#1e293b_20px)] opacity-10 pointer-events-none rounded-bl-3xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-450 text-xs font-bold tracking-widest uppercase`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {isRes ? "GSWCC Soil Conservation Approved" : "Heavy Safety Guarantee"}
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white leading-tight">
                {isRes ? "Eco-Mindful Clearing & Site Engineering" : "OSHA Compliant for Your Utmost Peace of Mind"}
              </h3>
              <p className="text-slate-300 max-w-2xl text-sm md:text-base">
                {isRes ? (
                  "TJ Darley clears property while protecting valuable Georgia stream buffers and wetlands. We engineer stabilized creek overflows and protect neighboring soils from mud runoffs throughout Greensboro & Macon county."
                ) : (
                  "TJ Darley Construction has maintained an flawless safety record in Middle Georgia since 2008. Every task is governed by rigorous tailgate safety talks, certified hazardous utilities tracking, and GSWCC environmental inspection compliance."
                )}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                {isRes ? (
                  <>
                    <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className={`w-4 h-4 ${activeText}`} />
                      Property & Stream Buffer Protected
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className={`w-4 h-4 ${activeText}`} />
                      Silt & Sediment fencing compliant
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className={`w-4 h-4 ${activeText}`} />
                      Full Property Damage Insured (COI)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                      Macon-Bibb Approved Safe Operator
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                      Georgia utility safety (811) trained
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                      Comprehensive Workmans Comp
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col justify-center items-center lg:items-end gap-3" id="safety-actions-block">
              <p className="text-xs text-slate-400 text-center lg:text-right max-w-xs">
                {isRes ? "Need a detailed site layout appraisal or acreage mapping meeting?" : "Need our certificate of insurance (COI) or safety logs for your general bid?"}
              </p>
              <a
                href="#estimator"
                className={`${activeColor} hover:opacity-90 text-white text-center font-bold text-sm py-3.5 px-6 rounded shadow-lg transition-transform hover:-translate-y-0.5 duration-200 shrink-0`}
              >
                {isRes ? "Schedule Free Lot Review" : "Request Bid & COI Package"}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Pop-up Drawer (Service Detail Specs modal) */}
      {selectedService && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" id="service-modal">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Dark Mask Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={() => setSelectedService(null)}
            ></div>

            {/* Trick browser into centering the modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Body */}
            <div className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border-t-8 ${isRes ? 'border-emerald-600' : 'border-brand-orange'}`} id="modal-content-panel">
              {/* Header Visual with Image */}
              <div className="relative h-56 bg-slate-950">
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  className="w-full h-full object-cover opacity-85"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-slate-950/20"></div>
                <button
                  type="button"
                  className="absolute top-4 right-4 bg-slate-900/60 text-white rounded-full p-2 hover:bg-brand-orange hover:text-white transition-colors"
                  onClick={() => setSelectedService(null)}
                  id="close-service-modal-btn"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Floating Service Icon Header */}
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className={`${activeColor} text-white p-2.5 rounded-lg`}>
                    {getIcon(selectedService.iconName)}
                  </div>
                  <h3 className="font-display font-black text-xl text-brand-coal tracking-tight" id="modal-title">
                    {selectedService.title}
                  </h3>
                </div>
              </div>

              {/* Specs detailed panel */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">
                    Standard Scope of Work since 2008
                  </h4>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed font-sans">
                    {selectedService.longDescription}
                  </p>
                </div>

                <div className="space-y-3" id="modal-benefits-block">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display flex items-center gap-1.5 font-sans">
                    <Hammer className={`w-4 h-4 ${activeText}`} />
                    Key Capabilities & Inclusions
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="modal-benefits-list">
                    {selectedService.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-slate-700">
                        <CheckCircle2 className={`w-4.5 h-4.5 ${activeText} shrink-0 mt-0.5`} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical / Cost Stats Footer within Card */}
                <div className="bg-slate-50 rounded-xl p-4 md:p-5 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs md:text-sm" id="modal-spec-footer">
                  <div>
                    <span className="text-slate-400 font-medium block">Middle Georgia Baseline Unit Rates</span>
                    <span className={`${activeText} font-bold text-lg`}>{selectedService.averageRatePerUnit}</span>
                    <span className="text-slate-400"> / {isRes ? 'acre or linear foot (ballpark)' : 'square yard (ballpark)'}</span>
                  </div>
                  <div className={`shrink-0 flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 py-2 px-3.5 rounded-md font-semibold font-display`}>
                    <Scale className="w-4 h-4" />
                    GSWCC & OSHA Compliant
                  </div>
                </div>

                {/* Sub-Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2" id="modal-actions-container">
                  <a
                    href="#estimator"
                    onClick={() => setSelectedService(null)}
                    className={`flex-1 text-center ${activeColor} text-white font-bold py-3 px-4 rounded-md shadow-md hover:opacity-90 transition-colors text-sm`}
                  >
                    Load into Estimator Tool
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-md transition-colors text-sm"
                  >
                    Back to Capabilities
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
