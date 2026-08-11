/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, Landmark, ShieldCheck, Menu, X, Smartphone, QrCode, Copy, Check, ExternalLink, Share2, Home, Compass, Key, Layers, Building2, HelpCircle } from 'lucide-react';
import { useAppBranding } from '../utils';
import logoImage from '../assets/images/tjd_flat_logo_1781219210745.jpg';

interface HeaderProps {
  division: 'commercial' | 'residential';
  setDivision: (div: 'commercial' | 'residential') => void;
}

export default function Header({ division, setDivision }: HeaderProps) {
  const branding = useAppBranding();
  const [isOpen, setIsOpen] = useState(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isNavGuideOpen, setIsNavGuideOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isStaffAuthorized, setIsStaffAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('tjd_staff_authorized') === 'true';
  });

  useEffect(() => {
    const handleAuthChange = () => {
      setIsStaffAuthorized(sessionStorage.getItem('tjd_staff_authorized') === 'true');
    };
    const handleOpenShortcut = () => {
      setIsShortcutModalOpen(true);
    };
    window.addEventListener('tjd_auth_change', handleAuthChange);
    window.addEventListener('tjd_open_mobile_shortcut', handleOpenShortcut);
    return () => {
      window.removeEventListener('tjd_auth_change', handleAuthChange);
      window.removeEventListener('tjd_open_mobile_shortcut', handleOpenShortcut);
    };
  }, []);

  const activeColorClass = division === 'residential' ? 'border-emerald-600' : 'border-brand-orange';
  const activeBtnClass = division === 'residential' ? 'bg-emerald-600 hover:bg-emerald-750' : 'bg-brand-orange hover:bg-brand-darkorange';
  const activeTextClass = division === 'residential' ? 'text-emerald-500' : 'text-brand-orange';
  const hoverTextClass = division === 'residential' ? 'hover:text-emerald-450' : 'hover:text-brand-orange';

  return (
    <header className={`sticky top-0 z-50 bg-brand-coal text-white shadow-md border-b-4 ${activeColorClass}`} id="site-header">
      {/* Top Banner - Utility Information */}
      <div className="bg-slate-900 px-4 py-2 text-xs md:text-sm font-medium flex flex-wrap justify-between items-center max-w-7xl mx-auto border-b border-slate-800" id="top-utility-bar">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-300">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${division === 'residential' ? 'bg-emerald-500' : 'bg-brand-orange'} animate-pulse`}></span>
            {branding.serviceAreas.split(',')[0] || "Middle Georgia"} Earthwork Experts &bull; <span className="font-bold">{division === 'residential' ? 'Residential Acreage Division' : 'Commercial Developments'}</span>
          </span>
          <span className="hidden md:inline text-slate-400">Est. {branding.establishedYear || "2008"}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNavGuideOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-[11px] px-2.5 py-1 rounded-md shadow transition-all animate-pulse"
            title="Click for App Navigation Guide & Map"
          >
            <Compass className="w-3.5 h-3.5 text-slate-950" />
            <span>🧭 Where Do I Click? Nav Map</span>
          </button>
          <span className="hidden md:inline text-slate-500">&bull;</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className={`w-4 h-4 ${activeTextClass}`} />
            OSHA Compliant & GSWCC Certified
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="navbar-container">
        <div className="flex justify-between h-20 items-center gap-4">
          {/* Logo Brand */}
          <div className="flex-shrink-0 flex items-center">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setIsShortcutModalOpen(true);
              }}
              className="flex items-center gap-3 group"
              title="Click to install this app shortcut on your cell phone!"
            >
              <img 
                src={logoImage} 
                alt={`${branding.companyName} Logo`} 
                className="w-12 h-12 rounded-lg bg-white border border-slate-200 shadow-lg object-contain shrink-0 group-hover:scale-105 transition-transform p-0.5" 
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col items-start leading-none">
                <span className="font-display text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1 text-white group-hover:text-brand-orange transition-colors">
                  {branding.logoText || "TJ DARLEY"}
                  <span className={activeTextClass}>.</span>
                </span>
                <span className="font-sans text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 mt-1 uppercase flex items-center gap-1 flex-wrap">
                  CONSTRUCTION & EARTHWORK
                  <span className="text-brand-orange animate-pulse font-black text-[7px] bg-slate-950/70 border border-brand-orange/30 px-1 py-0.5 rounded ml-0.5 inline-block shrink-0">MOBILE LINK</span>
                </span>
                <span className="text-[8px] sm:text-[9px] text-slate-500 font-medium tracking-normal mt-1 normal-case font-mono block">
                  Powered by Terra Earthwork Estimating System (TEES)™
                </span>
              </div>
            </a>
          </div>

          {/* Core Division Switcher Pilled Slider */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-full text-xs font-bold gap-1 shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setDivision('commercial')}
              className={`py-1.5 px-3 sm:px-4 rounded-full transition-all flex items-center gap-1.5 ${
                division === 'commercial' 
                  ? 'bg-brand-orange text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${division === 'commercial' ? 'bg-white' : 'bg-slate-500'}`} />
              Commercial
            </button>
            <button
              type="button"
              onClick={() => setDivision('residential')}
              className={`py-1.5 px-3 sm:px-4 rounded-full transition-all flex items-center gap-1.5 ${
                division === 'residential' 
                  ? 'animate-slow-pulse-glow text-white shadow-md' 
                  : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-800/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${division === 'residential' ? 'bg-white animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              Residential
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex space-x-6 text-xs xl:text-sm items-center font-semibold tracking-wide">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '';
              }}
              className="font-bold py-2 text-slate-350 hover:text-white transition-colors duration-200 flex items-center gap-1.5"
            >
              <Home className="w-4 h-4 text-brand-orange" />
              <span>Home</span>
            </a>
            <a 
              href="#multi-phase-bid" 
              onClick={(e) => {
                if (!isStaffAuthorized) {
                  e.preventDefault();
                  window.dispatchEvent(new Event('tjd_trigger_staff_auth'));
                  // Once they authenticate, they can select this from the header or it will direct them if hash is set
                  // Setting the hash after a tiny delay so that once authorized they load the estimator
                  const handleAuthSuccess = () => {
                    window.location.hash = '#multi-phase-bid';
                    window.removeEventListener('tjd_auth_change', handleAuthSuccess);
                  };
                  window.addEventListener('tjd_auth_change', handleAuthSuccess);
                }
              }}
              className={`font-bold py-2 transition-colors duration-200 flex items-center gap-1 ${
                isStaffAuthorized 
                  ? 'text-orange-400 hover:text-orange-350' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Takeoff Bid Estimator</span>
              {!isStaffAuthorized && (
                <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-sans uppercase font-bold tracking-wider select-none shrink-0">
                  Staff PIN
                </span>
              )}
            </a>
            <a 
              href="#automation-hub" 
              onClick={(e) => {
                if (!isStaffAuthorized) {
                  e.preventDefault();
                  window.dispatchEvent(new Event('tjd_trigger_staff_auth'));
                }
              }}
              className={`font-bold py-2 transition-colors duration-200 ${
                isStaffAuthorized 
                  ? 'text-emerald-400 hover:text-emerald-300' 
                  : 'text-slate-300 hover:text-white flex items-center gap-1.5'
              }`}
            >
              <span>Office Hub</span>
              {!isStaffAuthorized && (
                <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-sans uppercase font-bold tracking-wider select-none">
                  Staff
                </span>
              )}
            </a>
            <a 
              href="#capabilities"
              className={`font-bold py-2 text-slate-300 hover:text-white transition-colors duration-200 flex items-center gap-1.5`}
            >
              <span>App Capabilities</span>
              <span className="text-[8px] bg-amber-950/40 text-brand-orange border border-brand-orange/30 px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wider select-none shrink-0">
                PRO
              </span>
            </a>
            <a 
              href="#isite-command"
              className={`font-bold py-2 text-amber-400 hover:text-amber-300 transition-colors duration-200 flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-full`}
            >
              <span>iSite Command</span>
              <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider select-none shrink-0">
                SaaS
              </span>
            </a>
            <a 
              href="#contractor-signup"
              className={`font-bold py-2 text-sky-400 hover:text-sky-300 transition-colors duration-200 flex items-center gap-1.5`}
            >
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Contractor Setup</span>
            </a>
            {division === 'residential' && (
              <a 
                href="#finance"
                className={`font-bold py-2 text-slate-300 hover:text-white transition-colors duration-200 flex items-center gap-1.5`}
              >
                <Landmark className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Financing</span>
              </a>
            )}
            <a href="#careers" className={`text-brand-orange font-bold ${hoverTextClass} transition-colors duration-200 py-2`}>
              Join Our Crew
            </a>
          </nav>

          {/* Call To Action Direct Link */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:4788087789"
              className={`group flex items-center gap-2 ${activeBtnClass} text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-md shadow-lg transition-transform hover:-translate-y-0.5 duration-200`}
              id="header-phone-cta"
            >
              <Phone className="w-4 h-4 group-hover:animate-bounce" />
              <span>478-808-7789</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex xl:hidden" id="mobile-menu-toggle-container">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-slate-800 p-2 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              id="mobile-menu-btn"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu, show/hide based on menu */}
      {isOpen && (
        <div className="xl:hidden bg-slate-900 border-t border-slate-800" id="mobile-menu">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 text-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                window.location.hash = '';
              }}
              className="px-3 py-3 rounded-md text-base font-bold text-slate-300 hover:text-white hover:bg-slate-800 text-center flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5 text-brand-orange" />
              <span>Home / Main Page</span>
            </a>
            <a
              href="#multi-phase-bid"
              onClick={(e) => {
                setIsOpen(false);
                if (!isStaffAuthorized) {
                  e.preventDefault();
                  window.dispatchEvent(new Event('tjd_trigger_staff_auth'));
                  const handleAuthSuccess = () => {
                    window.location.hash = '#multi-phase-bid';
                    window.removeEventListener('tjd_auth_change', handleAuthSuccess);
                  };
                  window.addEventListener('tjd_auth_change', handleAuthSuccess);
                }
              }}
              className={`block px-3 py-3 rounded-md text-base font-bold transition-all text-center ${
                isStaffAuthorized 
                  ? 'text-orange-400 hover:bg-slate-800' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Takeoff Bid Estimator</span>
              {!isStaffAuthorized && (
                <span className="ml-1.5 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wider relative -top-0.5 select-none shrink-0">
                  Staff PIN
                </span>
              )}
            </a>
            <a
              href="#automation-hub"
              onClick={(e) => {
                setIsOpen(false);
                if (!isStaffAuthorized) {
                  e.preventDefault();
                  window.dispatchEvent(new Event('tjd_trigger_staff_auth'));
                }
              }}
              className={`block px-3 py-3 rounded-md text-base font-bold transition-all text-center ${
                isStaffAuthorized 
                  ? 'text-emerald-400 hover:bg-slate-800' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Office Hub</span>
              {!isStaffAuthorized && (
                <span className="ml-1.5 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wider relative -top-0.5 select-none">
                  Staff
                </span>
              )}
            </a>
            <a
              href="#capabilities"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 text-slate-300 hover:text-white hover:bg-slate-800 font-bold rounded-md text-base text-center flex items-center justify-center gap-1.5"
            >
              <span>App Capabilities</span>
              <span className="text-[8px] bg-amber-950/40 text-brand-orange border border-brand-orange/30 px-1.5 py-0.5 rounded font-sans uppercase font-bold tracking-wider select-none shrink-0">
                PRO
              </span>
            </a>
            <a
              href="#isite-command"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 text-amber-400 hover:text-amber-300 hover:bg-slate-800 font-bold rounded-md text-base text-center flex items-center justify-center gap-1.5"
            >
              <span>iSite Command SaaS Landing Page</span>
              <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider select-none shrink-0">
                1 Free Bid
              </span>
            </a>
            <a
              href="#contractor-signup"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 text-sky-400 hover:text-sky-300 hover:bg-slate-800 font-bold rounded-md text-base text-center flex items-center justify-center gap-1.5"
            >
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Contractor Registration & Setup</span>
            </a>
            <a
              href="#careers"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 text-brand-orange font-bold rounded-md text-base hover:bg-slate-800`}
            >
              Join Our Crew (Careers)
            </a>
            {division === 'residential' && (
              <a
                href="#finance"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-bold text-slate-300 hover:text-white hover:bg-slate-800 text-center flex items-center justify-center gap-2"
              >
                <Landmark className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span>Financing & Payments</span>
              </a>
            )}
            <div className="pt-4 pb-2 border-t border-slate-800 mt-2 flex justify-center">
              <a
                href="tel:4788087789"
                className={`flex items-center justify-center gap-2 w-11/12 ${activeBtnClass} text-white font-black py-4 px-4 rounded shadow-md`}
                id="mobile-phone-cta-button"
              >
                <Phone className="w-5 h-5" />
                <span>Call 478-808-7789</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic scan-to-mobile applet link modal overlay */}
      {isShortcutModalOpen && (
        <div 
          onClick={() => setIsShortcutModalOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-brand-coal border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative text-left my-auto max-h-[92vh] flex flex-col cursor-default" 
            id="shortcut-link-modal shadow-orange"
          >
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 pb-4 border-b border-slate-800 flex justify-between items-start shrink-0">
              <div className="flex items-center gap-3 pr-2">
                <div className="p-2.5 bg-brand-orange/10 text-brand-orange rounded-xl shrink-0">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display font-black text-base text-white">
                    TJ Darley Construction App
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Add a direct shortcut link to your cell phone
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShortcutModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 flex items-center gap-1 text-xs font-mono font-bold shrink-0"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Direct Navigation Shortcut to iSite Command Landing Page */}
              <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 inline-block">
                    Looking for iSite Command?
                  </span>
                  <h5 className="font-bold text-xs text-white font-display">
                    Multi-Tenant SaaS Platform Landing Page
                  </h5>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsShortcutModalOpen(false);
                    window.location.hash = '#isite-command';
                  }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open iSite Command</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scan-to-install Container */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[9px] uppercase font-black tracking-widest text-brand-orange bg-brand-orange/5 px-2 py-0.5 rounded border border-brand-orange/20 inline-block">
                    Easy Scan Action
                  </span>
                  <h5 className="font-bold text-xs text-white">
                    Open Instantly on Mobile
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-[210px]">
                    Point your smartphone's camera at the QR code on the right to load this app instantly on your phone.
                  </p>
                </div>
                {/* QR server public API using current viewport origin */}
                <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 shrink-0 select-none flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(window.location.href)}`}
                    alt="TJ Darley App QR Code"
                    className="w-24 h-24 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Direct Copy Section */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                  Or Copy Mobile Link directly:
                </label>
                <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="bg-transparent border-0 outline-none p-1.5 text-[10px] text-slate-350 font-mono flex-1 select-all overflow-hidden text-ellipsis"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const url = window.location.href;
                      try {
                        await navigator.clipboard.writeText(url);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      } catch (err) {
                        const t = document.createElement("textarea");
                        t.value = url;
                        document.body.appendChild(t);
                        t.select();
                        document.execCommand("copy");
                        document.body.removeChild(t);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }
                    }}
                    className={`px-3 py-1.5 ${isCopied ? 'bg-emerald-600' : 'bg-brand-orange hover:bg-brand-darkorange'} text-white text-[9px] uppercase tracking-wide font-black rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step instructions */}
              <div className="space-y-3 pt-1">
                <h6 className="font-display font-bold text-[10px] text-slate-300 uppercase tracking-widest border-l-2 border-brand-orange pl-2">
                  How to save this on your Mobile home screen:
                </h6>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* iOS Safari */}
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-300 text-[9px] flex items-center justify-center border border-slate-700">1</span>
                      <span>Apple iOS / Safari</span>
                    </div>
                    <ol className="text-[10px] text-slate-400 space-y-1 list-decimal list-inside leading-relaxed pl-0.5">
                      <li>Open in <strong className="text-white font-sans">Safari</strong> on phone</li>
                      <li>Tap the <strong className="text-slate-300 font-sans">Share</strong> button at bottom</li>
                      <li>Choose <strong className="text-brand-orange font-sans">"Add to Home Screen"</strong></li>
                    </ol>
                  </div>

                  {/* Android Chrome */}
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-800 text-slate-300 text-[9px] flex items-center justify-center border border-slate-700">2</span>
                      <span>Android / Chrome</span>
                    </div>
                    <ol className="text-[10px] text-slate-400 space-y-1 list-decimal list-inside leading-relaxed pl-0.5">
                      <li>Open in <strong className="text-white font-sans">Chrome</strong> on phone</li>
                      <li>Tap the <strong className="text-slate-300 font-sans">3 dots menu</strong> at corner</li>
                      <li>Choose <strong className="text-brand-orange font-sans">"Add to Home Screen"</strong></li>
                    </ol>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
              <span className="text-[9px] text-slate-400 font-sans tracking-wide">
                Tap anywhere outside or button to close
              </span>
              <button
                type="button"
                onClick={() => setIsShortcutModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NAVIGATION MAP & WHERE DO I CLICK GUIDE MODAL */}
      {isNavGuideOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
          onClick={() => setIsNavGuideOpen(false)}
        >
          <div 
            className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 text-slate-200 cursor-default my-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsNavGuideOpen(false)}
              className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-md flex items-center gap-1 text-xs font-mono font-bold"
            >
              <span>Close Map</span>
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 pr-16">
              <div className="p-3 bg-amber-500 rounded-xl text-slate-950 font-black shadow-lg">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                  App Navigation Guide & Site Map
                </h3>
                <p className="text-xs text-amber-400 font-mono">
                  Where to click to find the Multi-Phase Estimator and internal tools
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Map Item 1: Multi-Phase Estimator */}
              <div className="bg-slate-950 border border-amber-500/40 p-3.5 rounded-xl space-y-1.5 hover:border-amber-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-amber-400 uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>1. Takeoff Bid Estimator (Multi-Phase Bidding)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    Passcode: 2026
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click <strong className="text-white">"Takeoff Bid Estimator"</strong> in the top header. If prompted for Office Staff PIN, enter <strong className="text-amber-400 font-mono">2026</strong> to unlock cut/fill mass calculations, soil swell adjustments, and machine rate tables.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsNavGuideOpen(false);
                    if (!isStaffAuthorized) {
                      window.dispatchEvent(new Event('tjd_trigger_staff_auth'));
                    } else {
                      window.location.hash = '#multi-phase-bid';
                    }
                  }}
                  className="mt-1 text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                >
                  <span>Go directly to Multi-Phase Estimator now &rarr;</span>
                </button>
              </div>

              {/* Map Item 2: Office Hub */}
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-emerald-400 uppercase flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>2. Office Hub (Client Proposals & Sensitivity Ledger)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    Passcode: 2026
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click <strong className="text-white">"Office Hub"</strong> in the top header to manage saved proposals, audit markup vs margin profit matrices, and access staff automation tools.
                </p>
              </div>

              {/* Map Item 3: iSite Command SaaS */}
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-amber-300 uppercase flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-300" />
                    <span>3. iSite Command Subscriber Copy & Early Access</span>
                  </span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    Public Portal
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click the gold <strong className="text-amber-400 font-mono">"iSite Command"</strong> pill button in the top right header to review subscriber tier plans ($149–$499/mo based on Active Employee Payroll Headcount) or claim 1 Free Full Project Estimate!
                </p>
              </div>

              {/* Map Item 4: Contractor Registration & Profile Setup */}
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-sky-400 uppercase flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-sky-400" />
                    <span>4. Contractor Registration & Fleet/Payroll Setup</span>
                  </span>
                  <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                    #contractor-signup
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click <strong className="text-white">"Contractor Setup"</strong> or navigate to <strong className="text-sky-400 font-mono">#contractor-signup</strong> to input your company details, license #, COI insurance limits, equipment fuel-burn rates, markup margins, and active employee headcount.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsNavGuideOpen(false);
                    window.location.hash = '#contractor-signup';
                  }}
                  className="mt-1 text-[11px] font-mono font-bold text-sky-400 hover:text-sky-300 underline flex items-center gap-1"
                >
                  <span>Open Contractor Registration Form now &rarr;</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Authorized Office Staff PIN:</span>
              <span className="text-amber-400 font-black bg-slate-900 px-2.5 py-1 rounded border border-amber-500/40">2026</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
