/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Calculator, 
  ShieldCheck, 
  Check, 
  DollarSign, 
  Percent, 
  Coins, 
  Clock, 
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Briefcase,
  FileText,
  User,
  Mail,
  Phone,
  Home,
  ExternalLink
} from 'lucide-react';
import { useAppBranding, getWebhookUrl, sendSlackAlert, sendEmailAlert } from '../utils';
import { BidRequest } from '../types';

// Default trusted home improvement and land excavation funding portal (Hearth / Acorn style)
// Users or admin can change this URL easily to redirect clients directly to their active merchant portal.
const DEFAULT_PARTNER_PORTAL_URL = "https://www.acornfinance.com/"; 

interface FinanceProps {
  onBackToHome: () => void;
}

export default function Finance({ onBackToHome }: FinanceProps) {
  const branding = useAppBranding();

  // Custom partner link state in case client wants to customize it
  const [partnerUrl, setPartnerUrl] = useState<string>(DEFAULT_PARTNER_PORTAL_URL);

  // Calculator states
  const [projectCost, setProjectCost] = useState<number>(75000);
  const [downPayment, setDownPayment] = useState<number>(37500); // 50% default of 75,000 project cost
  const [termMonths, setTermMonths] = useState<number>(36);
  const [apr, setApr] = useState<number>(7.99);

  // Computed values
  const financedAmount = Math.max(0, projectCost - downPayment);
  const monthlyRate = apr / 12 / 100;
  
  let monthlyPayment = 0;
  if (financedAmount > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = financedAmount / termMonths;
    } else {
      monthlyPayment = (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                       (Math.pow(1 + monthlyRate, termMonths) - 1);
    }
  }

  const totalPayments = monthlyPayment * termMonths;
  const totalInterest = Math.max(0, totalPayments - financedAmount);
  const totalCostOfOwnership = projectCost + totalInterest;

  // Pre-qualification Form state
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('$5,000 - $7,500');
  const [employmentStatus, setEmploymentStatus] = useState('Employed Full-Time');
  const [creditScoreRange, setCreditScoreRange] = useState('Good (670 - 739)');
  const [requestedAmount, setRequestedAmount] = useState<number>(financedAmount);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  
  const [formSuccess, setFormSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep requested finance amount in sync with calculator unless edited manually
  useEffect(() => {
    setRequestedAmount(financedAmount);
  }, [financedAmount]);

  const handleSubmitPreQual = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim()) {
      setErrorMessage("Please complete all required fields (Name, Email, Phone) to submit your financing pre-qualification.");
      return;
    }

    const randomId = `TJD-FIN-F${Math.floor(1000 + Math.random() * 9000)}`;
    const detailsText = `
=== SECURE FINANCING PARTNER REFERRAL APPLICATION ===
- Applicant Name: ${applicantName}
- Employment Status: ${employmentStatus}
- Self-Reported Income Range: ${monthlyIncome}
- Self-Reported Credit Score: ${creditScoreRange}
- Financed Project Amount Requested: $${requestedAmount.toLocaleString()}
- Proposed Term: ${termMonths} Months at ${apr}% APR Est.
- Estimated Total Cost: $${projectCost.toLocaleString()}
- Proposed Down Payment: $${downPayment.toLocaleString()}
- Estimated Monthly Payment: $${Math.round(monthlyPayment).toLocaleString()}/month
- Contact Email: ${applicantEmail}
- Contact Phone: ${applicantPhone}
- Action Taken: Redirecting to partner funding portal (${partnerUrl})
===================================================
`;

    // Construct standard BidRequest layout so office crews see the lead in their logs
    const newFinancingLead: BidRequest = {
      id: randomId,
      clientName: applicantName,
      companyName: `Financing Partner Lead (${creditScoreRange})`,
      email: applicantEmail,
      phone: applicantPhone,
      location: "Georgia Site Location Pending Survey",
      serviceId: "res_pond_digs",
      projectSize: 1,
      unit: "acres",
      projectDetails: detailsText,
      status: "Received",
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      estimatedCostRange: `$${Math.round(monthlyPayment)}/mo for ${termMonths} mos`
    };

    // Prepend to native localStorage array
    try {
      const activeLocal = localStorage.getItem('tjd_earthworks_bids');
      const parsedList: BidRequest[] = activeLocal ? JSON.parse(activeLocal) : [];
      const updatedList = [newFinancingLead, ...parsedList];
      localStorage.setItem('tjd_earthworks_bids', JSON.stringify(updatedList));
      
      // Dispatch real-time update event so other screens sync instantly
      window.dispatchEvent(new Event('tjd_bids_updated'));
    } catch (err) {
      console.error('Failed writing financing lead to local database.', err);
    }

    // Trigger Dynamic Sheets Sync via Webhook
    const formDataPayload = new URLSearchParams();
    formDataPayload.append('action', 'submit_bid');
    formDataPayload.append('Submission_ID', randomId);
    formDataPayload.append('submission_id', randomId);
    formDataPayload.append('submitted_on', new Date().toISOString());
    formDataPayload.append('submitted_by', applicantName);
    formDataPayload.append('clientName', applicantName);
    formDataPayload.append('companyName', `Financing Partner Lead (${creditScoreRange})`);
    formDataPayload.append('email', applicantEmail);
    formDataPayload.append('phone', applicantPhone);
    formDataPayload.append('location', "Georgia Location Coordinates Pending");
    formDataPayload.append('serviceId', "financing_prequal");
    formDataPayload.append('projectSize', "1");
    formDataPayload.append('unit', 'acres');
    formDataPayload.append('projectDetails', detailsText);
    formDataPayload.append('estimatedCostRange', `$${Math.round(monthlyPayment)}/mo (${termMonths} Mos)`);

    fetch(getWebhookUrl(), {
      method: 'POST',
      body: formDataPayload,
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(() => {
      console.log('Financing lead logged to Sheets Webhook!');
    })
    .catch((err) => {
      console.warn('Webhook dynamic submit deferred/saved offline.', err);
    });

    // Fire off direct Slack notification to TJ Darley Construction phone
    sendSlackAlert({
      leadType: 'Financing Partner Referral Lead',
      clientName: applicantName,
      clientPhone: applicantPhone,
      clientEmail: applicantEmail,
      details: detailsText
    });

    // Also fire off direct business email notification to info@tjdarleyconstruction.com
    sendEmailAlert({
      leadType: 'Financing Partner Referral Lead',
      clientName: applicantName,
      clientPhone: applicantPhone,
      clientEmail: applicantEmail,
      details: detailsText
    });

    // Trigger external partner link opening
    try {
      window.open(partnerUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Popup blocked from opening partner URL automatically.', e);
    }

    setFormSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="tjd-finance-view">
      {/* Back to Home Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-500 hover:text-emerald-600 transition-colors bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm cursor-pointer"
        >
          <Home className="w-4 h-4 text-brand-orange" />
          <span>&lsaquo; Back to Main Page</span>
        </button>
        <span className="text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase font-bold shrink-0 tracking-wide select-none">
          Outsourced Capital Portal
        </span>
      </div>

      {/* Main Title Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-brand-coal to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 text-left relative overflow-hidden shadow-2xl mb-10">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none -z-10"></div>
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase font-mono tracking-wider">
            <Landmark className="w-4 h-4 animate-pulse" />
            <span>Outsourced Partner Funding Options</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-none">
            Convenient Landwork & Excavation Partner Financing
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Pond construction, deep clay cores, structural dams, roads, and heavy land clearing are major physical assets that improve property valuations for generations. TJ Darley Construction, LLC offers a link to partner funding sources for your convenience.
          </p>
        </div>
      </div>

      {/* Quick Settings Panel for Admin to change Partner URL */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-black">
            Contractor Settings Panel
          </span>
          <p className="text-xs text-slate-600">
            Configure your active third-party financing partner link (e.g. Hearth, Acorn, or your local credit union portal).
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto max-w-md">
          <input 
            type="url" 
            value={partnerUrl} 
            onChange={(e) => setPartnerUrl(e.target.value)} 
            placeholder="https://your-custom-partner-link.com"
            className="bg-white border border-slate-300 text-slate-800 rounded-xl py-1.5 px-3 text-xs w-full font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">Active Redirect Link</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INTERACTIVE PAYMENT ESTIMATOR & PROGRESS SCHEDULER (8 cols on desktop) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* SECTION A: PAYMENT CALCULATOR */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 text-left">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-slate-900">
                  Partner Financing Estimate Calculator
                </h3>
                <p className="text-xs text-slate-500">
                  Estimate monthly terms offered by our third-party funding partners
                </p>
              </div>
            </div>

            {/* SLIDERS GRID */}
            <div className="space-y-5">
              {/* Project Cost Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wide">1. Ballpark Project Cost</span>
                  <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    ${projectCost.toLocaleString()}
                  </span>
                </div>
                <input 
                  type="range" 
                  min={5000} 
                  max={250000} 
                  step={2500} 
                  value={projectCost}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setProjectCost(val);
                    // Ensure down payment never exceeds maximum allowed range (80% of project cost)
                    if (downPayment > val * 0.8) setDownPayment(Math.round(val * 0.5));
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$5k</span>
                  <span>$50k</span>
                  <span>$100k</span>
                  <span>$150k</span>
                  <span>$200k</span>
                  <span>$250k</span>
                </div>
              </div>

              {/* Down Payment Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wide">2. Desired Down Payment</span>
                  <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    ${downPayment.toLocaleString()} ({Math.round((downPayment / projectCost) * 100)}%)
                  </span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={Math.round(projectCost * 0.8)} 
                  step={1000} 
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$0 (No Money Down)</span>
                  <span>Max Limit (${Math.round(projectCost * 0.8).toLocaleString()})</span>
                </div>
              </div>

              {/* APR & Term Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* APR selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    3. Estimated Partner APR %
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-250 rounded-xl p-2 justify-between">
                    <input 
                      type="number" 
                      min={0.1} 
                      max={19.99} 
                      step={0.01}
                      value={apr} 
                      onChange={(e) => setApr(Math.max(0, Number(e.target.value)))}
                      className="bg-transparent border-0 outline-none p-1 text-sm font-mono font-bold text-slate-800 flex-1"
                    />
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 select-none">
                      <Percent className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-mono font-bold text-slate-500">APR</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[5.99, 7.99, 9.99, 12.99].map(rate => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setApr(rate)}
                        className={`text-[9px] font-mono font-bold px-2 py-1 rounded border transition-colors ${
                          apr === rate 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Term Months selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    4. Financing Term (Months)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {[12, 24, 36, 48, 60].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTermMonths(m)}
                        className={`py-3 text-xs font-mono font-black rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                          termMonths === m 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-105' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <span>{m}</span>
                        <span className="text-[7px] uppercase font-sans tracking-tight opacity-75">Mos</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* DYNAMIC METRIC OUTCOME DISPLAY */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-inner">
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Giant Monthly Payment Result */}
                <div className="space-y-1 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-800 pb-5 sm:pb-0 sm:pr-5">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-extrabold flex items-center justify-center sm:justify-start gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Estimated Monthly Payment
                  </span>
                  <div className="flex items-baseline justify-center sm:justify-start">
                    <span className="text-3xl font-mono text-slate-500 font-light">$</span>
                    <span className="text-5xl font-mono font-black tracking-tighter text-white">
                      {Math.round(monthlyPayment).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1">/mo</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    Typical partner program rate. Individual approval varies by partner.
                  </p>
                </div>

                {/* Sub-computations */}
                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Financed Amount:</span>
                    <span className="font-bold text-white">${financedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Term Length:</span>
                    <span className="font-bold text-white">{termMonths} Months ({termMonths / 12} Yrs)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Interest Rate (APR):</span>
                    <span className="font-bold text-emerald-400">{apr}% Est.</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Total Interest Cost:</span>
                    <span className="font-bold text-slate-300">${Math.round(totalInterest).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans font-bold">
                    <span className="text-slate-400">Total Out-of-Pocket:</span>
                    <span className="text-emerald-400">${Math.round(totalCostOfOwnership).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex gap-3 text-xs text-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold">Important Farmland Value Notice:</strong>
                <p className="leading-relaxed">
                  Unlike temporary luxury structures, earthen ponds and drainage improvements are classified as structural farmland capital improvements. Most local agricultural authorities confirm that a certified earthen lake adds up to 1.5x its design cost to the underlying property valuation.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION B: MILESTONE PAYMENT PROTOCOL */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md text-left space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-brand-orange/10 text-brand-orange rounded-2xl border border-brand-orange/10">
                <Coins className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-slate-900">
                  Standard Milestone Payment Protocol
                </h3>
                <p className="text-xs text-slate-500">
                  Standard operational stages for non-financed private landwork
                </p>
              </div>
            </div>

            <div className="space-y-4 font-sans text-sm text-slate-600">
              <p className="leading-relaxed">
                If you choose not to finance and prefer cash-contract draws, TJ Darley Construction, LLC utilizes a rigid **Milestone-Based Handoff Schedule** linked directly to heavy machinery physical stages. This eliminates risk for both parties:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Milestone 1 */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-2 relative">
                  <span className="absolute right-3 top-3 text-[10px] font-mono font-black text-slate-300">STAGE 1</span>
                  <div className="text-lg font-black text-slate-900">50% Draw</div>
                  <div className="font-bold text-xs text-brand-orange uppercase tracking-wider">Mobilization</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Paid prior to shipping heavy dozer, loader, and scraper excavator fleets to the jobsite. Secures diesel allocation, silt fence reels, and pre-prep permits.
                  </p>
                </div>

                {/* Milestone 2 */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-2 relative">
                  <span className="absolute right-3 top-3 text-[10px] font-mono font-black text-slate-300">STAGE 2</span>
                  <div className="text-lg font-black text-slate-900">25% Draw</div>
                  <div className="font-bold text-xs text-emerald-600 uppercase tracking-wider">Bulk Excavation & Shaping</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Paid upon completion of rough grading, primary site excavation, core subgrade shaping, and bulk earthwork structure preparation.
                  </p>
                </div>

                {/* Milestone 3 */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-2 relative">
                  <span className="absolute right-3 top-3 text-[10px] font-mono font-black text-slate-300">STAGE 3</span>
                  <div className="text-lg font-black text-slate-900">25% Draw</div>
                  <div className="font-bold text-xs text-indigo-600 uppercase tracking-wider">Final Laser-Handoff</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Paid immediately upon finished grading, final laser-transit elevation check, permanent stabilization seeding, and complete machinery demobilization.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: CERTIFICATION STANDARDS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-left text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-2xl shrink-0 animate-pulse">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="font-display font-black text-lg text-white">
                GSWCC Certified & Fully Bonded Operation
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                TJ Darley Construction, LLC carries complete industrial commercial general liability insurance, full equipment inland marine coverage, and certified GSWCC (Georgia Soil and Water Conservation Commission) storm-water permits to execute civil works. Your financing guarantees standard civil engineering bonding protection!
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PRE-QUALIFICATION SECURE FORM (5 cols on desktop) */}
        <div className="lg:col-span-5">
          
          <div className="bg-gradient-to-b from-brand-coal to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left relative overflow-hidden sticky top-24">
            {/* Decorative layout accent */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-xl pointer-events-none"></div>

            {!formSuccess ? (
              <form onSubmit={handleSubmitPreQual} className="space-y-5 relative">
                <div className="border-b border-slate-800 pb-4 space-y-1">
                  <span className="text-[9px] font-mono font-black tracking-widest text-brand-orange uppercase bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/20 inline-block">
                    Easy Multi-Lender Match
                  </span>
                  <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span>Submit Pre-Bid Approval Form</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Log your ballpark project with us first, and immediately activate our direct partner funding portals to view active rates without affecting your credit.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Robert L. Tipton"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="john@example.com"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        Phone Number *
                      </label>
                      <input 
                        type="tel" 
                        required
                        placeholder="706-555-0199"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Employment & Income Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                        Employment *
                      </label>
                      <select
                        value={employmentStatus}
                        onChange={(e) => setEmploymentStatus(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl py-2.5 px-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-sans"
                      >
                        <option value="Employed Full-Time">Employed Full-Time</option>
                        <option value="Self-Employed / Business">Self-Employed / Business</option>
                        <option value="Retired / Pension">Retired / Pension</option>
                        <option value="Agricultural Operator">Agricultural Operator</option>
                        <option value="Other / Seasonal">Other / Seasonal</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                        Monthly Income *
                      </label>
                      <select
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl py-2.5 px-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-sans"
                      >
                        <option value="Under $3,000">Under $3,000</option>
                        <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                        <option value="$5,000 - $7,500">$5,000 - $7,500</option>
                        <option value="$7,500 - $12,500">$7,500 - $12,500</option>
                        <option value="Over $12,500">Over $12,500</option>
                      </select>
                    </div>
                  </div>

                  {/* Credit Score & Financed Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                        Credit Estimate *
                      </label>
                      <select
                        value={creditScoreRange}
                        onChange={(e) => setCreditScoreRange(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl py-2.5 px-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-sans"
                      >
                        <option value="Excellent (740 - 850)">Excellent (740 - 850)</option>
                        <option value="Good (670 - 739)">Good (670 - 739)</option>
                        <option value="Fair (580 - 669)">Fair (580 - 669)</option>
                        <option value="Rebuilding (Under 580)">Rebuilding (Under 580)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                        Capital Requested *
                      </label>
                      <input 
                        type="number" 
                        required
                        min={1000}
                        max={300000}
                        value={requestedAmount}
                        onChange={(e) => setRequestedAmount(Number(e.target.value))}
                        className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Terms check */}
                  <div className="flex items-start gap-2.5 pt-2 select-none">
                    <input 
                      type="checkbox" 
                      id="finance-agree"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="h-4 w-4 rounded text-emerald-500 accent-emerald-500 bg-slate-950 border-slate-800 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="finance-agree" className="text-[10px] text-slate-400 leading-snug cursor-pointer font-sans">
                      I understand TJ Darley Construction, LLC is not a direct lender. I authorize logging my project pre-bid parameters, sending a notification to TJ Darley, and forwarding my profile to verified third-party funding platforms.
                    </label>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-950/40 border border-red-900/60 text-red-200 p-3 rounded-xl text-[11px] flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!agreedToTerms}
                  className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    agreedToTerms 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-550 hover:to-emerald-450 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-950/70 transform hover:-translate-y-0.5' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'
                  }`}
                >
                  <span>Submit & Launch Partner Funding Portal</span>
                  <ExternalLink className="w-4 h-4 animate-pulse" />
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-center py-6 animate-in fade-in duration-300 relative">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full inline-block">
                    Lead Registered Successfully
                  </span>
                  <h4 className="font-display font-black text-2xl text-white">
                    Lead Saved, {applicantName.split(' ')[0]}!
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-sans">
                    We have logged your project estimate with TJ Darley. Your external partner portal link should have opened in a new tab.
                  </p>
                </div>

                {/* Direct Action Link Button */}
                <a
                  href={partnerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange hover:to-amber-600 transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <span>Proceed to Partner Funding Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-left space-y-2.5 font-sans">
                  <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-orange" />
                    How Partner Financing Works:
                  </h5>
                  <ul className="text-[11px] text-slate-350 space-y-2 list-disc list-inside leading-relaxed pl-1">
                    <li>The external portal matches you with up to <strong className="text-white">12 trusted home & land lenders</strong>.</li>
                    <li>Offers are displayed instantly with soft checks that don't affect your credit report score.</li>
                    <li>Funds can be deposited to your checking account in as little as <strong className="text-white">24-48 hours</strong>.</li>
                    <li>Use the disbursed funds to fund the Stage 1 Draw directly to ship excavation fleets to your parcel!</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormSuccess(false);
                    setApplicantName('');
                    setApplicantEmail('');
                    setApplicantPhone('');
                  }}
                  className="w-full py-3 border border-slate-800 hover:border-slate-500 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase font-mono cursor-pointer"
                >
                  Configure / Apply For Another Estimate
                </button>
              </div>
            )}

            {/* Support section footer */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Have questions or need corporate development financing? Contact the Greensboro main office at <a href={`tel:${branding.phone}`} className="text-brand-orange font-bold hover:underline">{branding.phone}</a> or email <span className="text-slate-400">{branding.email}</span>.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

