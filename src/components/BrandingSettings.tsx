/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppBranding, saveAppBranding, AppBranding } from '../utils';
import { Sparkles, Save, RotateCcw, Building, Phone, Mail, MapPin, Calendar, Globe, AlertCircle, CheckCircle, Coins, QrCode, Printer, Truck, Wrench, ShieldCheck, Copy, Check } from 'lucide-react';

export default function BrandingSettings() {
  const branding = useAppBranding();
  
  const [formData, setFormData] = useState<AppBranding>({
    companyName: branding.companyName,
    logoText: branding.logoText,
    phone: branding.phone,
    email: branding.email,
    address: branding.address,
    establishedYear: branding.establishedYear,
    website: branding.website,
    serviceAreas: branding.serviceAreas,
    ratesMarkupPercent: branding.ratesMarkupPercent || 0,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activeDecalView, setActiveDecalView] = useState<'trailer' | 'truck'>('trailer');
  const [copiedLink, setCopiedLink] = useState(false);

  const clockInUrl = typeof window !== 'undefined' ? `${window.location.origin}#clock-in` : 'https://isitecommand.com#clock-in';
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(clockInUrl)}&color=0f172a&bgcolor=ffffff`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ratesMarkupPercent' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAppBranding(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to restore the default 'TJ Darley Construction' settings?")) {
      setIsResetting(true);
      const defaults: AppBranding = {
        companyName: "TJ Darley Construction",
        logoText: "TJ DARLEY",
        phone: "478-808-7789",
        email: "tjdarleyconstruction@gmail.com",
        address: "Middle Georgia",
        establishedYear: "2008",
        website: "https://tjdarleyconstruction.com",
        serviceAreas: "Warner Robins, Macon, Perry, Fort Valley, Milledgeville, Dublin, Greensboro",
        ratesMarkupPercent: 0,
      };
      saveAppBranding(defaults);
      setFormData(defaults);
      setTimeout(() => {
        setIsResetting(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }, 500);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="branding-settings-tab">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="font-display font-black text-lg text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            App Customization & White-Label Panel
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Rebrand this contractor software app instantaneously. Put in your own business profile details to customize the client calculators, public-facing margins, and footer records.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 rounded-lg text-xs font-bold font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              Contractor/Business Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Acme Grading LLC"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500 text-white"
            />
            <p className="text-[10px] text-slate-500">Appears in copyright lines, testimonials, and estimate files.</p>
          </div>

          {/* Logo Abbreviation */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Header Logo Text (Short)
            </label>
            <input
              type="text"
              name="logoText"
              value={formData.logoText}
              onChange={handleChange}
              placeholder="e.g. ACME GRADING"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500 text-white font-display font-black tracking-tight"
            />
            <p className="text-[10px] text-slate-500">Displayed in uppercase bold letters in the main header.</p>
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 555-019-2831"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500 text-white font-mono"
            />
            <p className="text-[10px] text-slate-500">Used for direct consultation clicks and primary footer calls.</p>
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. office@acmegrading.com"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500 text-white"
            />
            <p className="text-[10px] text-slate-500">Receives client ballpark bids when local webhooks are synchronized.</p>
          </div>

          {/* Physical Office Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Primary Region/HQ Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. North Georgia"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500 text-white"
            />
            <p className="text-[10px] text-slate-500">Displayed next to copyright footer details.</p>
          </div>

          {/* Established Year */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Established Year
            </label>
            <input
              type="text"
              name="establishedYear"
              value={formData.establishedYear}
              onChange={handleChange}
              placeholder="e.g. 2015"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500 text-white font-mono"
            />
            <p className="text-[10px] text-slate-500">Displayed in the header top bar and hero credentials.</p>
          </div>

          {/* Website Link */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Website URL
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="e.g. https://acmegrading.com"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500 text-white font-mono"
            />
            <p className="text-[10px] text-slate-500">The canonical address listed on proposals.</p>
          </div>

          {/* Rates Markup Margin */}
          <div className="space-y-2 md:col-span-2 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-brand-orange animate-bounce" />
              In-House Rate Margin Markup (Profit Protector)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="ratesMarkupPercent"
                min="0"
                max="50"
                step="1"
                value={formData.ratesMarkupPercent}
                onChange={handleChange}
                className="flex-1 accent-brand-orange cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
              />
              <span className="text-sm font-mono font-black text-brand-orange bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg shrink-0">
                +{formData.ratesMarkupPercent}% Markup
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              Protects your margins automatically! This parameter scales up raw labor & material estimates inside the <b>In-House Estimator</b> sheet to shield you against unexpected shipping fees or price surges.
            </p>
          </div>

          {/* Regional Service Areas */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Regional Service Areas (Comma Separated)
            </label>
            <textarea
              name="serviceAreas"
              value={formData.serviceAreas}
              onChange={handleChange}
              placeholder="e.g. Warner Robins, Macon, Perry, Fort Valley"
              required
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500 text-white font-sans"
            />
            <p className="text-[10px] text-slate-500">Write your specific operating towns separated by commas. Each town will be listed with an interactive location marker in the footer site-directory!</p>
          </div>

        </div>

        {/* Action Status Notifications */}
        {isSaved && (
          <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-4 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-emerald-300">
              Branding Customizer Applied Successfully! The app header, hero sections, and footers have updated in real time.
            </span>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply Rebranding</span>
          </button>
        </div>

      </form>

      {/* JOBSITE TOOL TRAILER & FLEET VEHICLE QR DECAL STUDIO */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                Subscriber Hardware Branding Feature
              </span>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Print & Vinyl Ready
              </span>
            </div>
            <h4 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-2">
              Jobsite Tool Trailer & Fleet Vehicle QR Decal Studio
            </h4>
            <p className="text-slate-300 text-xs max-w-2xl">
              Equip your jobsite tool trailer, pickup doors, and dump trucks with a custom vinyl QR wrap pass. Employees scan the trailer or truck door decal with a tablet or phone to clock in and submit daily site progress reports instantly without typing a URL!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveDecalView('trailer')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDecalView === 'trailer'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Tool Trailer Wrap</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDecalView('truck')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDecalView === 'truck'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Truck Door Wrap</span>
            </button>
          </div>
        </div>

        {/* DECAL PREVIEW CANVAS */}
        {activeDecalView === 'trailer' ? (
          /* TOOL TRAILER DECAL BANNER PREVIEW */
          <div className="bg-slate-950 border-4 border-amber-500/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-amber-500/30 pb-6">
              <div className="space-y-2 text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>JOBSITE TOOL TRAILER DECAL BANNER</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight uppercase">
                  {formData.companyName || 'T.J. DARLEY CONSTRUCTION, LLC'}
                </h2>
                <p className="text-amber-400 font-mono text-xs font-bold tracking-widest uppercase">
                  PROFESSIONAL EARTHWORK SOLUTIONS • {formData.phone || '478.808.7789'}
                </p>
                <p className="text-slate-300 text-xs italic font-sans">
                  "BUILDING BETTER LAND. BUILDING LASTING VALUE."
                </p>
              </div>

              {/* QR CODE BOX */}
              <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-amber-500 shrink-0 text-center space-y-2 max-w-[220px]">
                <img
                  src={qrCodeApiUrl}
                  alt="Jobsite Clock-In QR Pass"
                  className="w-36 h-36 mx-auto object-contain"
                />
                <div className="bg-slate-950 text-amber-400 font-mono font-black text-[9px] uppercase px-2 py-1 rounded tracking-wider">
                  SCAN TO CLOCK IN / LOG PROGRESS
                </div>
              </div>
            </div>

            {/* SERVICES ICON STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-[11px] font-mono text-slate-300">
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl font-bold">
                🚜 LAND CLEARING
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl font-bold">
                🏗️ EXCAVATION
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl font-bold">
                📐 GRADING & SITE PREP
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl font-bold">
                🌊 POND CONSTRUCTION
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl font-bold">
                🛣️ DRIVEWAYS & ROADS
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl font-bold">
                🚛 HAULING & DELIVERY
              </div>
            </div>
          </div>
        ) : (
          /* TRUCK DOOR DECAL MOCKUP PREVIEW */
          <div className="bg-slate-900 border-4 border-amber-500/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="bg-slate-200 text-slate-950 p-6 sm:p-10 rounded-2xl border-2 border-slate-400 shadow-inner relative overflow-hidden">
              <div className="absolute top-2 right-4 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                Fleet Vehicle Pickup & Dump Truck Door Decal Mockup
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {/* Excavator Emblem Icon */}
                  <div className="w-20 h-20 rounded-full bg-slate-950 border-4 border-amber-500 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                    <Truck className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-display font-black text-slate-950 uppercase tracking-tight leading-none">
                      {formData.companyName || 'T.J. DARLEY CONSTRUCTION, LLC'}
                    </h3>
                    <p className="text-amber-600 font-mono font-black text-base tracking-wider">
                      {formData.phone || '478.808.7789'}
                    </p>
                    <p className="text-slate-700 text-xs font-semibold">
                      {formData.website || 'tjdarleyconstruction.com'}
                    </p>
                  </div>
                </div>

                {/* Door QR Pass Badge */}
                <div className="bg-white p-3 rounded-xl border-2 border-slate-900 text-center shadow-md shrink-0">
                  <img
                    src={qrCodeApiUrl}
                    alt="Truck Door Clock-In QR Pass"
                    className="w-24 h-24 mx-auto object-contain"
                  />
                  <div className="text-[8px] font-mono font-black text-slate-900 uppercase mt-1">
                    Crew Clock-In QR
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTROLS & LINK COPY */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 w-full sm:w-auto">
            <span className="text-slate-400">Target Clock-In URL:</span>
            <span className="text-amber-400 font-bold truncate max-w-[220px] sm:max-w-xs">{clockInUrl}</span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(clockInUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="text-amber-400 hover:text-amber-300 font-bold p-1 rounded hover:bg-slate-900 transition-colors shrink-0"
              title="Copy URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const printWin = window.open('', '_blank');
              if (printWin) {
                printWin.document.write(`
                  <html>
                    <head>
                      <title>${formData.companyName} - Jobsite QR Decal Sheet</title>
                      <style>
                        body { font-family: system-ui, sans-serif; padding: 40px; text-align: center; background: #0f172a; color: white; }
                        .banner { border: 4px solid #f59e0b; padding: 40px; border-radius: 20px; background: #020617; max-width: 800px; margin: 0 auto; }
                        h1 { font-size: 32px; font-weight: 900; margin: 0 0 10px 0; color: white; text-transform: uppercase; }
                        .phone { font-size: 24px; color: #f59e0b; font-weight: bold; font-family: monospace; }
                        .qr-box { background: white; padding: 20px; border-radius: 16px; display: inline-block; margin: 25px 0; border: 4px solid #f59e0b; }
                        .qr-box img { width: 220px; height: 220px; }
                        .instructions { font-size: 14px; color: #94a3b8; margin-top: 15px; font-family: monospace; }
                      </style>
                    </head>
                    <body>
                      <div class="banner">
                        <h1>${formData.companyName || 'T.J. DARLEY CONSTRUCTION, LLC'}</h1>
                        <div class="phone">PROFESSIONAL EARTHWORK SOLUTIONS • ${formData.phone || '478.808.7789'}</div>
                        <p style="color:#cbd5e1; font-style:italic;">"BUILDING BETTER LAND. BUILDING LASTING VALUE."</p>
                        <div class="qr-box">
                          <img src="${qrCodeApiUrl}" alt="QR Code" />
                          <div style="color:#020617; font-weight:bold; font-size:12px; margin-top:8px;">SCAN TO CLOCK IN / LOG SITE PROGRESS</div>
                        </div>
                        <div class="instructions">SCAN WITH 10" FIELD TABLET OR PHONE CAMERA ON JOBSITE</div>
                      </div>
                      <script>window.onload = function() { window.print(); }</script>
                    </body>
                  </html>
                `);
                printWin.document.close();
              }
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print Decal Proof Sheet</span>
          </button>
        </div>
      </div>

      {/* Developer notice */}
      <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Single Tenant White-Label Mode</h5>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            This deployment leverages your browser's persistent key-value vault (<code className="font-mono bg-slate-900 text-indigo-300 px-1 py-0.5 rounded text-[10px]">localStorage</code>) to store branding details. If you clear your browser cookies or load the app in another browser, you can re-apply or share these parameters instantly. Ready for production SaaS distribution!
          </p>
        </div>
      </div>

    </div>
  );
}
