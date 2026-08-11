/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  User, 
  Compass, 
  Clock, 
  Cpu, 
  ClipboardCheck, 
  ArrowLeft, 
  FileText, 
  RotateCw, 
  CheckCircle2, 
  HardHat, 
  PenTool,
  Sliders,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getWebhookUrl, decimalToDMS, decimalToDDM, decimalToUTM, parseFuzzyCoordinates } from '../utils';

interface FieldIntakeProps {
  onBackToHome?: () => void;
  embedded?: boolean;
}

interface IntakeForm {
  operatorName: string;
  machineryType: string;
  engineHours: string;
  siteLocation: string;
  fuelLevel: string;
  dailyNotes: string;
  clearedAcres: string;
  soilCondition: string;
  safetySigned: boolean;
  signatureInitials: string;
}

export default function FieldIntake({ onBackToHome, embedded = false }: FieldIntakeProps) {
  const [submissionId, setSubmissionId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Manual GPS overrides area
  const [manualMode, setManualMode] = useState(false);
  const [manualLatInput, setManualLatInput] = useState('');
  const [manualLngInput, setManualLngInput] = useState('');
  const [manualPrecisionAlert, setManualPrecisionAlert] = useState('');

  const [formData, setFormData] = useState<IntakeForm>({
    operatorName: 'Kyle Simmons',
    machineryType: 'High-Flow Fecon Forestry Mulcher',
    engineHours: '',
    siteLocation: 'Greensboro Lot (Lake Oconee, GA)',
    fuelLevel: '75%',
    dailyNotes: '',
    clearedAcres: '1.2',
    soilCondition: 'moist_clay',
    safetySigned: false,
    signatureInitials: ''
  });

  // Extract query variables upon mount - support both traditional ?search and hash-appended values
  useEffect(() => {
    const parseUrlParameters = () => {
      // 1. Check window.location.search
      const searchParams = new URLSearchParams(window.location.search);
      let sid = searchParams.get('submission_id') || '';
      let lat = searchParams.get('lat') || '';
      let lng = searchParams.get('lng') || '';

      // 2. Check window.location.hash for in-page route params
      if (!sid || !lat || !lng) {
        const hash = window.location.hash;
        if (hash.includes('?')) {
          const hashQuery = hash.split('?')[1];
          const hashParams = new URLSearchParams(hashQuery);
          sid = sid || hashParams.get('submission_id') || '';
          lat = lat || hashParams.get('lat') || '';
          lng = lng || hashParams.get('lng') || '';
        }
      }

      setSubmissionId(sid || `SUB-${Date.now()}-${Math.floor(Math.random() * 100000)}`);
      setLatitude(lat);
      setLongitude(lng);
    };

    parseUrlParameters();
  }, []);

  const handleFetchGPSLive = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
        },
        () => {
          alert("Unable to retrieve high-accuracy GPS coordinates. Please confirm GPS is active on your mobile phone.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert("GPS Geolocation is not supported by your browser software.");
    }
  };

  const handleSaveManualGPS = (e: React.FormEvent) => {
    e.preventDefault();
    setManualPrecisionAlert('');

    if (!manualLatInput.trim() || !manualLngInput.trim()) {
      setManualPrecisionAlert('Please populate both GPS input fields to initialize manual geo-pointing.');
      return;
    }

    const parsed = parseFuzzyCoordinates(manualLatInput, manualLngInput);
    if (!parsed) {
      setManualPrecisionAlert('Invalid surveyor coordinates entry format. Examples: DMS [32 35 49 N] or standard Decimals.');
      return;
    }

    const la = parsed.latitude.toFixed(6);
    const lo = parsed.longitude.toFixed(6);

    setLatitude(la);
    setLongitude(lo);

    // Clear manual inputs
    setManualLatInput('');
    setManualLngInput('');

    alert(`GPS Calibration Succeeded!\n\nParsed Coordinates Decoded:\nLat: ${la}° Decimal\nLon: ${lo}° Decimal\n\nThese coordinates are now fully locked into your daily progress report.`);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!formData.engineHours.trim() || isNaN(Number(formData.engineHours))) {
      return setFormError('Please enter a valid numeric engine hours reading (e.g., 2841.5).');
    }
    if (!formData.signatureInitials.trim()) {
      return setFormError('You must enter your operator authentication initials (digital sign-off).');
    }
    if (!formData.safetySigned) {
      return setFormError('You must finalize the Machinery Pre-Op Inspection Walkaround check.');
    }

    const payload = {
      id: submissionId,
      submittedAt: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      latitude,
      longitude,
      isSynced: false,
      ...formData
    };

    // Save report natively to local storage so the supervisor can review it securely inside the staff panel!
    const existingReports = JSON.parse(localStorage.getItem('tjd_daily_reports') || '[]');
    localStorage.setItem('tjd_daily_reports', JSON.stringify([payload, ...existingReports]));

    // Dispatch window custom event to notify AutomationHub immediately of new progress report
    window.dispatchEvent(new Event('tjd_daily_reports_changed'));

    // Trigger dynamic sheets dispatcher
    const formDataPayload = new URLSearchParams();
    formDataPayload.append('Submission_ID', submissionId);
    formDataPayload.append('submission_id', submissionId);
    formDataPayload.append('submitted_on', new Date().toISOString());
    formDataPayload.append('submitted_by', formData.operatorName);
    formDataPayload.append('Foreman', formData.operatorName);
    formDataPayload.append('Job Name', formData.siteLocation);
    formDataPayload.append('Job Notes', `Fuel: ${formData.fuelLevel}. Completed Cleared: ${formData.clearedAcres} Acres. Notes: ${formData.dailyNotes}`);
    formDataPayload.append('Soil Type', formData.soilCondition);
    formDataPayload.append('Depth Height Feet', formData.engineHours);
    formDataPayload.append('Special Concerns', `Rig: ${formData.machineryType}`);
    formDataPayload.append('Latitude', String(latitude));
    formDataPayload.append('latitude', String(latitude));
    formDataPayload.append('Longitude', String(longitude));
    formDataPayload.append('longitude', String(longitude));
    formDataPayload.append('timestamp', new Date().toISOString());

    fetch(getWebhookUrl(), {
      method: 'POST',
      body: formDataPayload,
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(() => {
      console.log("Daily progress report recorded directly in Sheets webhook!");
      // Mark as fully synced in local storage
      const freshReports = JSON.parse(localStorage.getItem('tjd_daily_reports') || '[]');
      const updatedReports = freshReports.map((r: any) => r.id === submissionId ? { ...r, isSynced: true } : r);
      localStorage.setItem('tjd_daily_reports', JSON.stringify(updatedReports));
      window.dispatchEvent(new Event('tjd_daily_reports_changed'));
    })
    .catch((err) => {
      console.warn("Direct Sheets webhook upload skipped/delayed.", err);
    });

    if (!embedded) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setFormSubmitted(true);
  };

  return (
    <div className={embedded ? "text-white text-left font-sans" : "bg-slate-900 border-t-4 border-brand-orange text-white min-h-screen font-sans pb-24 text-left"}>
      
      {/* 1. Header Hero Banner */}
      {!embedded && (
        <div className="relative py-12 md:py-16 bg-slate-950 border-b border-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35 pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative space-y-4">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors duration-150 p-2 bg-slate-900 rounded-lg border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4 text-brand-orange" />
              <span>Return to Main Site</span>
            </button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-black text-[10px] tracking-widest text-emerald-400 uppercase bg-emerald-950/40 border border-emerald-800/50 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                  TJD FIELD INTAKE WEB-APP
                </span>
                <span className="font-display font-black text-[10px] tracking-widest text-amber-400 uppercase bg-amber-950/40 border border-amber-800/50 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                  10" Rugged Tablet Mode
                </span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white leading-none">
                Daily Operator <span className="text-brand-orange">Site & Progress Report</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                Optimized for 10" field tablets in heavy machinery cabs—large touch targets, glare-free high-contrast controls for logging engine hours, site progression, and GPS position without laptops or tiny phones.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Form container */}
      <div className={embedded ? "w-full" : "max-w-3xl mx-auto px-4 sm:px-6 py-12"}>
        {formSubmitted ? (

          /* SUCCESS VIEW */
          <div className="bg-slate-950 border border-emerald-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-emerald-950 border border-emerald-850 text-emerald-400 rounded-full w-fit mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10 animate-bounce text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-white">Report Transmitted!</h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
                Thank you, <strong className="text-emerald-400">{formData.operatorName}</strong>. Your daily progress logs and walkaround inspections have been recorded securely.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left text-xs space-y-2.5 max-w-md mx-auto font-mono">
              <span className="font-bold text-slate-300 uppercase block tracking-wider font-display">Log Information:</span>
              <p className="text-slate-400">&bull; Report ID: <span className="text-white font-bold">{submissionId}</span></p>
              <p className="text-slate-400">&bull; Machinery: <span className="text-white font-bold">{formData.machineryType}</span></p>
              <p className="text-slate-400">&bull; Hours Logged: <span className="text-emerald-400 font-bold">{formData.engineHours} Hrs</span></p>
              <p className="text-slate-400">&bull; Coordinates: <span className="text-emerald-400 font-bold">{latitude || 'None'}, {longitude || 'None'}</span></p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              {!embedded && onBackToHome && (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="py-3 px-6 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg transition-colors uppercase tracking-wider"
                >
                  Return to Main Site
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({
                    operatorName: 'Kyle Simmons',
                    machineryType: 'High-Flow Fecon Forestry Mulcher',
                    engineHours: '',
                    siteLocation: 'Greensboro Lot (Lake Oconee, GA)',
                    fuelLevel: '75%',
                    dailyNotes: '',
                    clearedAcres: '1.2',
                    soilCondition: 'moist_clay',
                    safetySigned: false,
                    signatureInitials: ''
                  });
                  setSubmissionId(`SUB-${Date.now()}-${Math.floor(Math.random() * 100000)}`);
                }}
                className="py-3 px-6 bg-brand-orange hover:bg-brand-darkorange text-white text-xs font-black rounded-lg transition-colors uppercase tracking-wider shadow-lg shadow-amber-950/40"
              >
                Log New Site Shift
              </button>
            </div>
          </div>

        ) : (

          /* INTAKE FORM LAYOUT */
          <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl leading-relaxed">
            
            {/* GPS coordinates status banner with Precise Surveyor Converter Decoders */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all pb-6 ${
              latitude && longitude 
                ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' 
                : 'bg-indigo-950/30 border-indigo-900 text-indigo-300'
            }`} id="coordinates-banner">
              
              {/* Header block with mode triggers */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-900/60 pb-3 text-left w-full">
                <div className="space-y-1">
                  <h4 className="font-bold flex items-center gap-1.5 text-xs text-slate-100 uppercase tracking-wider">
                    <MapPin className={`w-4 h-4 shrink-0 ${(latitude && longitude) ? 'text-emerald-400' : 'text-indigo-400 animate-pulse'}`} />
                    <span>Precise Geological Coordinates Engine</span>
                  </h4>
                  <p className="text-[10px] text-slate-450 font-sans max-w-xl leading-normal">
                    Land tract calibration for John Deere SmartGrade & Trimble laser-guided bulldozers. Bypasses inaccurate Google Maps postal indexes.
                  </p>
                </div>
                
                {/* Mode toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setManualMode(!manualMode);
                    setManualPrecisionAlert('');
                  }}
                  className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded font-black uppercase tracking-wider text-slate-300 transition-all cursor-pointer shadow whitespace-nowrap self-start sm:self-center"
                >
                  {manualMode ? '🔌 Switch to Satellite Auto' : '⌨️ Enter Coordinates Manually'}
                </button>
              </div>

              {!manualMode ? (
                /* AUTOMATIC SATELLITE LOCATOR VIEW */
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left w-full">
                  <div className="flex-1 space-y-3">
                    {latitude && longitude ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/80 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider select-none leading-none">
                            Satellite Verified
                          </span>
                        </div>
                        
                        {/* Dynamic Decoders Roster */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono bg-slate-950 border border-slate-900 rounded-xl p-3" id="coordinates-precision-decoders">
                          <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900/80 space-y-1">
                            <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">1. Surveyor DMS</span>
                            <span className="text-white font-bold block truncate" title={decimalToDMS(parseFloat(latitude), parseFloat(longitude)).combined}>
                              {decimalToDMS(parseFloat(latitude), parseFloat(longitude)).combined}
                            </span>
                          </div>
                          <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900/80 space-y-1">
                            <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">2. Trimble/Dozer UTM Grid</span>
                            <span className="text-emerald-400 font-bold block truncate" title={decimalToUTM(parseFloat(latitude), parseFloat(longitude)).formatted}>
                              {decimalToUTM(parseFloat(latitude), parseFloat(longitude)).formatted}
                            </span>
                          </div>
                          <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900/80 space-y-1">
                            <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">3. Standard Decimal</span>
                            <span className="text-slate-300 font-bold block truncate">
                              {latitude}, {longitude}
                            </span>
                          </div>
                          <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900/80 space-y-1">
                            <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">4. Navigator DDM</span>
                            <span className="text-slate-400 font-bold block truncate" title={decimalToDDM(parseFloat(latitude), parseFloat(longitude)).combined}>
                              {decimalToDDM(parseFloat(latitude), parseFloat(longitude)).combined}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-sky-400 hover:text-sky-300 underline font-sans"
                          >
                            <span>🛰️ Verify Satellites on Google Maps Layer</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        ⚠️ Coordinates absent. Daily logs must have certified satellite parameters to verify location check-in audits. Click "Acquire Satellite Link" below.
                      </p>
                    )}
                  </div>

                  {!latitude || !longitude ? (
                    <button
                      type="button"
                      onClick={handleFetchGPSLive}
                      className="py-2.5 px-4 bg-brand-orange hover:bg-brand-darkorange text-white text-[11px] font-black rounded-xl uppercase tracking-wider transition-all shadow shrink-0 cursor-pointer"
                    >
                      Acquire Satellite Link
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFetchGPSLive}
                      className="py-2 px-3 bg-emerald-800 hover:bg-emerald-750 text-white text-[10px] font-bold rounded border border-emerald-700 uppercase tracking-widest transition-all cursor-pointer shadow shrink-0 leading-none"
                    >
                      🔄 Re-acquire GPS
                    </button>
                  )}
                </div>
              ) : (
                /* MANUAL INPUT MODE FOR PRECISE COORDS */
                <div className="space-y-4 animate-in fade-in duration-200 w-full text-left">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4">
                    <span className="text-[9px] text-brand-orange uppercase font-mono font-bold tracking-widest block text-left">
                      ⌨️ Surveyor Workbook Coordinate Input Grid
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-xs text-left">
                        <label className="font-bold text-slate-300 block">
                          SITE LATITUDE PROPERTY INDEX:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder='e.g. 33.5756 or 33° 34&apos; 32.16" N'
                          value={manualLatInput}
                          onChange={(e) => setManualLatInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-250 font-mono focus:border-brand-orange outline-none shadow-inner"
                        />
                      </div>
                      
                      <div className="space-y-1.5 text-xs text-left">
                        <label className="font-bold text-slate-300 block">
                          SITE LONGITUDE PROPERTY INDEX:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder='e.g. -83.1818 or 83° 10&apos; 54.48" W'
                          value={manualLngInput}
                          onChange={(e) => setManualLngInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-250 font-mono focus:border-brand-orange outline-none shadow-inner"
                        />
                      </div>
                    </div>

                    <p className="text-[9.5px] text-slate-450 font-sans leading-relaxed text-left">
                      💡 <strong>Flexible Input Parser:</strong> Supports degree symbols (<code>32° 35&apos; 49.5&quot; N</code>), space separation (<code>32 35 49 S</code>), degree decimal minutes, or traditional positive/negative decimals (<code>32.5971, -83.8856</code>).
                    </p>

                    {manualPrecisionAlert && (
                      <p className="text-[10.5px] text-rose-400 font-bold font-sans text-left">
                        ⚠️ {manualPrecisionAlert}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleSaveManualGPS}
                      className="py-2.5 px-4 bg-brand-orange text-white hover:bg-orange-500 rounded-lg text-xs font-black uppercase tracking-wider shadow cursor-pointer transition-all"
                    >
                      💾 Lock Manual Coordinates
                    </button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-5">
              
              {formError && (
                <div className="bg-rose-950/60 border border-rose-900 text-rose-300 px-4 py-2.5 rounded-lg text-xs font-semibold text-center">
                  ⚠️ {formError}
                </div>
              )}

              {/* Readonly SubID Metadata row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Submission Hash ID</label>
                  <input
                    type="text"
                    value={submissionId}
                    readOnly
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-400 outline-none font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300">Logged Operator Name</label>
                  <select
                    value={formData.operatorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, operatorName: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                  >
                    <option value="Kyle Simmons">Kyle Simmons (Lead Operator)</option>
                    <option value="Marcus Cole">Marcus Cole (Finisher Tech)</option>
                    <option value="Terry Vance">Terry Vance (Heavy Excavation)</option>
                    <option value="Becky Miller">Becky Miller (Administrative Clerk)</option>
                    <option value="TJ Darley">TJ Darley (Owner / Director)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300">Active Duty Equipment / Rig</label>
                  <select
                    value={formData.machineryType}
                    onChange={(e) => setFormData(prev => ({ ...prev, machineryType: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                  >
                    <option value="High-Flow Fecon Forestry Mulcher">High-Flow Fecon Forestry Mulcher</option>
                    <option value="Cat 315 LGP Heavy Track Excavator">Cat 315 LGP Heavy Track Excavator</option>
                    <option value="John Deere 700K GPS Bulldozer">John Deere 700K GPS Bulldozer</option>
                    <option value="Heavy Compact Track Loader (CTL)">Heavy Skid-Steer / Loader</option>
                    <option value="Tri-Axle 40-Ton Dump Truck">Tri-Axle 40-Ton Dump Truck</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300">Active Dispatch Site Location</label>
                  <select
                    value={formData.siteLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, siteLocation: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                  >
                    <option value="Greensboro Lot (Lake Oconee, GA)">Greensboro Lot (Lake Oconee, GA)</option>
                    <option value="Peach County Warehouse Pad">Peach County Warehouse Hub (GA)</option>
                    <option value="Warner Robins Commercial lot">Warner Robins Pad Site (GA)</option>
                    <option value="Macon Highway Drainage runoff">Macon Interstate Outlets (GA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-900 pt-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300">Current Engine Hours *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. 2481.5"
                      value={formData.engineHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, engineHours: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-brand-orange font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300">Fuel Level Status</label>
                  <select
                    value={formData.fuelLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelLevel: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange"
                  >
                    <option value="100% (Tank Full)">100% (Tank Full)</option>
                    <option value="75%">75% Fuel</option>
                    <option value="50% (Half Tank)">50% Fuel</option>
                    <option value="25% (Refueling Required)">25% (Low level)</option>
                    <option value="Reserve (Critically Low)">Reserve (Shut off soon)</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300">Est. Cleared Area (Acres/Shift)</label>
                  <input
                    type="text"
                    placeholder="e.g., 0.8"
                    value={formData.clearedAcres}
                    onChange={(e) => setFormData(prev => ({ ...prev, clearedAcres: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-300">Soil moisture profile & strata</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'dry_dusty', label: 'Dry / Dusty Loam' },
                    { value: 'moist_clay', label: 'Moist Georgia Red Clay' },
                    { value: 'sludgy_pond', label: 'Wet/Saturated Strata' },
                    { value: 'rocky_granite', label: 'Rocky / Hard Granite' }
                  ].map((soil) => (
                    <label 
                      key={soil.value} 
                      className={`border rounded-lg p-2.5 text-center cursor-pointer block transition-colors ${
                        formData.soilCondition === soil.value 
                          ? 'border-brand-orange bg-amber-955 text-white font-bold' 
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="soil"
                        value={soil.value}
                        checked={formData.soilCondition === soil.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, soilCondition: e.target.value }))}
                        className="sr-only"
                      />
                      <span className="text-[11px]">{soil.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-300">Daily Task Completed & Machinery Notes</label>
                <textarea
                  rows={4}
                  placeholder="Record today's tasks completed, e.g., 'Cleared underbrush on boundary lines. Changed mulcher teeth to tackle thick pine logs, verified 811 marks...'"
                  value={formData.dailyNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyNotes: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-brand-orange resize-none"
                ></textarea>
              </div>

              {/* PRE-OP SAFETY SIGN OFF */}
              <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl space-y-3.5 text-xs" id="safety-pre-op-checklist">
                <span className="font-bold text-brand-orange block pb-1 border-b border-slate-800 uppercase tracking-wider font-display">Heavy Machinery Pre-Op Inspection (OSHA Check):</span>
                
                <div className="space-y-2 text-slate-300 text-[11px]">
                  <p>&bull; Engine fluids (oil, coolant, hydraulic reserves) are adequate.</p>
                  <p>&bull; Undercarriage tracks are clear of debris jams; grease seals are intact.</p>
                  <p>&bull; Safety orange hazard flashing symbols and fire extinguishers are securely mounted.</p>
                </div>

                <div className="pt-2 border-t border-slate-850/60 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                  
                  <label className="flex items-center gap-2 cursor-pointer mt-0 font-bold text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.safetySigned}
                      onChange={(e) => setFormData(prev => ({ ...prev, safetySigned: e.target.checked }))}
                      className="accent-brand-orange h-4.5 w-4.5 rounded text-brand-orange"
                    />
                    <span>I have completed the Walkaround</span>
                  </label>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Sign-off Initials</span>
                    <input
                      type="text"
                      placeholder="e.g. KS"
                      maxLength={4}
                      value={formData.signatureInitials}
                      onChange={(e) => setFormData(prev => ({ ...prev, signatureInitials: e.target.value }))}
                      className="w-16 bg-slate-950 border border-slate-800 rounded py-1 px-2 text-center uppercase font-mono font-bold text-brand-orange outline-none focus:border-brand-orange"
                    />
                  </div>

                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-orange hover:bg-brand-darkorange text-white font-black text-xs rounded-xl tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
              >
                <ClipboardCheck className="w-5 h-5" />
                <span>Submit Field Intake Report</span>
              </button>

            </form>

          </div>
        )}
      </div>

    </div>
  );
}
