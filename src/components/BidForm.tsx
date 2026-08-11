/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SERVICES_DATA, RES_SERVICES_DATA } from '../data';
import { BidRequest } from '../types';
import { getWebhookUrl, sendSlackAlert } from '../utils';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  Trash2, 
  Building, 
  MapPin, 
  Clock, 
  PhoneCall, 
  User, 
  Mail, 
  FileSpreadsheet,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

interface BidFormProps {
  preFillData: {
    serviceId: string;
    projectSize: number;
    unit: 'sq_ft' | 'acres';
    estimatedRangeUrl?: string; // actually estimatedCostRange representation
  } | null;
  clearPreFill: () => void;
  division: 'commercial' | 'residential';
}

export default function BidForm({ preFillData, clearPreFill, division }: BidFormProps) {
  // Local active list of submissions stored relative to browser
  const [bidsList, setBidsList] = useState<BidRequest[]>([]);
  
  // Active form data values
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    location: 'Warner Robins, GA',
    serviceId: SERVICES_DATA[0].id,
    projectSize: 15000,
    unit: 'sq_ft' as 'sq_ft' | 'acres',
    projectDetails: '',
    submissionType: 'bid_request' as 'bid_request' | 'consultation',
    bestTimeToCall: 'Anytime / Text is Best',
    utilityDamageWaiver: false
  });

  const [formSuccess, setFormSuccess] = useState<BidRequest | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Sync state with division shifts
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      serviceId: division === 'residential' ? RES_SERVICES_DATA[0].id : SERVICES_DATA[0].id,
      unit: division === 'residential' ? 'acres' : 'sq_ft',
      projectSize: division === 'residential' ? 2 : 15000,
    }));
  }, [division]);

  // Sync pre-fills from Calculator
  useEffect(() => {
    if (preFillData) {
      setFormData(prev => ({
        ...prev,
        serviceId: preFillData.serviceId,
        projectSize: preFillData.projectSize,
        unit: preFillData.unit,
        projectDetails: preFillData.estimatedRangeUrl 
          ? `Pre-filled via TJ Darley Ballpark Calculator: Estimated baseline ${preFillData.estimatedRangeUrl}. `
          : prev.projectDetails
      }));
    }
  }, [preFillData]);

  // Load existing bids from localStorage reactively
  useEffect(() => {
    const loadBids = () => {
      const local = localStorage.getItem('tjd_earthworks_bids');
      if (local) {
        try {
          setBidsList(JSON.parse(local));
        } catch (e) {
          console.error('Failed restoring localStorage bid profiles.');
        }
      } else {
        setBidsList([]);
      }
    };

    loadBids();

    window.addEventListener('tjd_bids_updated', loadBids);
    return () => {
      window.removeEventListener('tjd_bids_updated', loadBids);
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUnitToggle = (unitVal: 'sq_ft' | 'acres') => {
    setFormData(prev => ({
      ...prev,
      unit: unitVal
    }));
  };

  const handleDeleteBid = (idToDelete: string) => {
    const filtered = bidsList.filter(b => b.id !== idToDelete);
    setBidsList(filtered);
    localStorage.setItem('tjd_earthworks_bids', JSON.stringify(filtered));
    window.dispatchEvent(new Event('tjd_bids_updated'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    // Light Validation
    if (!formData.clientName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorStatus("Client Name, Email address, and active Business Phone number are strictly required before submitting.");
      return;
    }

    // Capture baseline range if possible from pre-fill or local calculator approximation
    let costApprox = undefined;
    if (preFillData && preFillData.estimatedRangeUrl) {
      costApprox = preFillData.estimatedRangeUrl;
    }

    // Instantiate unique ID
    const randomId = `TJD-2026-X${Math.floor(1000 + Math.random() * 9000)}`;
    const disclaimerText = formData.utilityDamageWaiver
      ? "\n\n[LEGAL DISCLAIMER - UTILITY DAMAGE WAIVER ACKNOWLEDGED]: Client assumes full responsibility for locating and physically marking all non-member private underground utilities (irrigation piping, invisible pet fencing, secondary electrical feeds, gas lines, water services, septic tanks/drain fields). T.J. Darley Construction, LLC is released from financial liability for damage to unmarked or improperly marked private lines during excavation and grading operations."
      : "";
    const finalDetails = `${formData.projectDetails}\n\n[Best Time to Call: ${formData.bestTimeToCall}]${disclaimerText}`;
    const newBidSubmission: BidRequest = {
      id: randomId,
      clientName: formData.clientName,
      companyName: formData.companyName || undefined,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      serviceId: formData.serviceId,
      projectSize: Number(formData.projectSize),
      unit: formData.unit,
      projectDetails: finalDetails,
      status: 'Received',
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      estimatedCostRange: costApprox,
      bestTimeToCall: formData.bestTimeToCall,
      utilityDamageWaiver: formData.utilityDamageWaiver
    };

    // Prepend to array
    const updatedList = [newBidSubmission, ...bidsList];
    setBidsList(updatedList);
    localStorage.setItem('tjd_earthworks_bids', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('tjd_bids_updated'));

    // Trigger Dynamic Sheets Sync for Client Bids Form!
    const formDataPayload = new URLSearchParams();
    formDataPayload.append('action', 'submit_bid');
    formDataPayload.append('Submission_ID', randomId);
    formDataPayload.append('submission_id', randomId);
    formDataPayload.append('submitted_on', new Date().toISOString());
    formDataPayload.append('submitted_by', formData.clientName);
    formDataPayload.append('clientName', formData.clientName);
    formDataPayload.append('companyName', formData.companyName || '');
    formDataPayload.append('email', formData.email);
    formDataPayload.append('phone', formData.phone);
    formDataPayload.append('best_time_to_call', formData.bestTimeToCall);
    formDataPayload.append('location', formData.location);
    formDataPayload.append('serviceId', formData.serviceId);
    formDataPayload.append('projectSize', String(formData.projectSize));
    formDataPayload.append('unit', formData.unit);
    formDataPayload.append('projectDetails', finalDetails);
    formDataPayload.append('estimatedCostRange', costApprox || '');
    formDataPayload.append('utility_damage_waiver', formData.utilityDamageWaiver ? 'YES - WAIVER ACKNOWLEDGED' : 'NO');

    fetch(getWebhookUrl(), {
      method: 'POST',
      body: formDataPayload,
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(() => {
      console.log('Client Bid submitted natively to Sheets Webhook!');
    })
    .catch((err) => {
      console.warn('Webhook transfer delayed/offline', err);
    });

    // Fire off direct Slack notification to TJ Darley Construction phone
    sendSlackAlert({
      leadType: 'Contract Construction Request',
      clientName: formData.clientName,
      clientPhone: formData.phone,
      clientEmail: formData.email,
      details: `Service ID: ${formData.serviceId}\nApprox Size: ${formData.projectSize} ${formData.unit}\nEstimated Price: ${costApprox || 'N/A'}\nDetails: ${finalDetails}`
    });

    // Show success dialog
    setFormSuccess(newBidSubmission);

    // Clean inputs
    setFormData({
      clientName: '',
      companyName: '',
      email: '',
      phone: '',
      location: 'Warner Robins, GA',
      serviceId: division === 'residential' ? RES_SERVICES_DATA[0].id : SERVICES_DATA[0].id,
      projectSize: division === 'residential' ? 2 : 15000,
      unit: division === 'residential' ? 'acres' : 'sq_ft',
      projectDetails: '',
      submissionType: 'bid_request',
      bestTimeToCall: 'Anytime / Text is Best',
      utilityDamageWaiver: false
    });

    clearPreFill();
  };

  return (
    <section className="py-20 bg-slate-50 relative border-t border-slate-200" id="bid-proposal-form">
      {/* Decorative caution warning strip in background */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-[repeating-linear-gradient(90deg,#ea580c,#ea580c_12px,#1e293b_12px,#1e293b_24px)] pointer-events-none opacity-90"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dynamic header container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="bids-section-grid">
          
          {/* Form Booking Panel */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 space-y-6" id="form-interactive-panel">
            
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <span className="text-xs font-bold text-brand-orange uppercase tracking-widest font-display block">
                HEADQUARTERS ROUTING PORTAL
              </span>
              <h3 className="font-display font-black text-2xl text-brand-coal tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6 text-brand-orange" />
                Submit Bid Package / Consultation Request
              </h3>
              <p className="text-slate-500 text-sm">
                Ready to get started? Fill out the details below. For urgent emergencies or custom blueprints, call us directly at <a href="tel:4788087789" className="text-brand-orange font-bold hover:underline">478-808-7789</a>!
              </p>
            </div>

            {formSuccess ? (
              /* Success Receipt Block */
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 space-y-6 text-slate-800" id="bids-receipt-panel">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 text-white p-2 rounded-full">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg text-emerald-950">
                      Request Transmitted Successfully!
                    </h4>
                    <span className="text-xs text-emerald-600 font-mono">ID Code: {formSuccess.id}</span>
                  </div>
                </div>

                <div className="bg-white border border-emerald-100 p-4 rounded-lg space-y-3 text-xs md:text-sm" id="receipt-invoice-mock">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-bold text-slate-500">CLIENT</span>
                    <span className="font-bold text-slate-800">{formSuccess.clientName} {formSuccess.companyName ? `(${formSuccess.companyName})` : ''}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-bold text-slate-500">SERVICE DETAILS</span>
                    <span className="font-medium text-slate-800">
                      {(division === 'residential' ? RES_SERVICES_DATA : SERVICES_DATA).find(s => s.id === formSuccess.serviceId)?.title || formSuccess.serviceId}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-bold text-slate-500">PROJECT REGION</span>
                    <span className="font-medium text-slate-800">{formSuccess.location}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-bold text-slate-500">FOOTPRINT AREA</span>
                    <span className="font-bold text-slate-800">
                      {formSuccess.projectSize.toLocaleString()} {formSuccess.unit === 'sq_ft' ? 'Sq. Ft.' : 'Acres'}
                    </span>
                  </div>
                  {formSuccess.estimatedCostRange && (
                    <div className="flex justify-between border-b pb-2 bg-amber-50 p-1.5 rounded">
                      <span className="font-bold text-brand-darkorange">CALCULATOR ATTACHED</span>
                      <span className="font-black text-brand-darkorange">{formSuccess.estimatedCostRange}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 bg-slate-50 px-1.5 rounded">
                    <span className="text-slate-400 font-mono">STATUS TIME</span>
                    <span className="text-slate-500 font-mono">{formSuccess.submittedAt}</span>
                  </div>
                </div>

                {/* Simulated Email Envelope Representation */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Email Mock Header */}
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <div className="flex items-center gap-1.5 text-brand-orange">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="font-bold uppercase tracking-wider">Client Auto-Reply Confirmation Email</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] text-emerald-600 font-bold font-mono">DISPATCHED</span>
                    </div>
                  </div>

                  {/* Mail headers */}
                  <div className="p-3 bg-slate-50 border-b border-slate-200/60 font-mono text-[10px] text-slate-600 space-y-1">
                    <div><span className="font-bold text-slate-400 w-12 inline-block">From:</span>tjdcllc@gmail.com <span className="text-slate-400 italic font-sans">(T.J. Darley Earthwork)</span></div>
                    <div><span className="font-bold text-slate-400 w-12 inline-block">To:</span><span className="text-brand-orange font-bold font-sans">{formSuccess.email}</span> &lt;{formSuccess.email}&gt;</div>
                    <div><span className="font-bold text-slate-400 w-12 inline-block">Subject:</span>Thank you for your inquiry - T.J. Darley Construction</div>
                  </div>

                  {/* Mail content */}
                  <div className="p-4 bg-white text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                    <p className="font-semibold text-slate-900 text-sm">Hello {formSuccess.clientName},</p>
                    <p>
                      Thank you for submitting your earthwork bid package request. This is to confirm we have received your project details and queued them for dynamic engineering review.
                    </p>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 text-[11px]">
                      <div className="font-bold font-sans text-brand-coal uppercase text-[10px] tracking-wide mb-1 border-b pb-1 text-slate-500">
                        Received Specifications
                      </div>
                      <div>&bull; <strong className="text-slate-500 font-semibold mr-1">Project Type:</strong> {(division === 'residential' ? RES_SERVICES_DATA : SERVICES_DATA).find(s => s.id === formSuccess.serviceId)?.title || formSuccess.serviceId}</div>
                      <div>&bull; <strong className="text-slate-500 font-semibold mr-1">Site Location:</strong> {formSuccess.location}</div>
                      <div>&bull; <strong className="text-slate-500 font-semibold mr-1">Scope Area:</strong> {formSuccess.projectSize.toLocaleString()} {formSuccess.unit === 'sq_ft' ? 'Sq. Ft.' : 'Acres'}</div>
                      {formSuccess.estimatedCostRange && (
                        <div>&bull; <strong className="text-slate-500 font-semibold mr-1">Acreage cost ballpark:</strong> {formSuccess.estimatedCostRange}</div>
                      )}
                      <div>&bull; <strong className="text-slate-500 font-semibold mr-1">Preferred Callback Window:</strong> {formSuccess.bestTimeToCall || 'Anytime / Text is Best'}</div>
                      {formSuccess.utilityDamageWaiver && (
                        <div className="mt-1 pt-1 border-t border-slate-200 text-amber-800 font-semibold bg-amber-50/80 p-1.5 rounded text-[10px] flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Utility Damage Waiver: Attached & Included (Liability Disclaimer Embedded)</span>
                        </div>
                      )}
                    </div>
                    <p>
                      An estimating engineer at our Middle Georgia headquarters is currently reviewing your land site overlay parameters against geological GIS clay maps. We will reach out to you within 24 hours at <strong className="text-slate-900">{formSuccess.phone}</strong> to confirm your complimentary walk-through.
                    </p>
                    <p>
                      Thank you for choosing T.J. Darley Construction &amp; Earthwork!
                    </p>
                    <div className="border-t border-slate-100 pt-3 text-slate-500 text-[11px]">
                      <p className="font-bold">Warm regards,</p>
                      <p className="font-black text-slate-800 mt-0.5">T.J. Darley, Owner</p>
                      <p>T.J. Darley Construction, LLC</p>
                      <p className="text-brand-orange font-bold font-mono">478-808-7789</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold">Next Steps:</p>
                  <p>&bull; The thank-you email above has been auto-dispatched to the client's inbox ({formSuccess.email}).</p>
                  <p>&bull; We will follow up via call at <span className="font-bold">{formSuccess.phone}</span> or email within 24 hours to book a physical visit.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormSuccess(null)}
                    className="flex-1 bg-brand-coal hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-md transition-all text-sm font-display text-center"
                    id="submit-another-bid-btn"
                  >
                    Submit Another Scope
                  </button>
                  <a
                    href="tel:4788087789"
                    className="block text-center bg-brand-orange hover:bg-brand-darkorange text-white font-bold py-3 px-4 rounded-md transition-all text-sm"
                  >
                    Call 478-808-7789
                  </a>
                </div>
              </div>
            ) : (
              /* Actual Submission Form */
              <form onSubmit={handleSubmit} className="space-y-5" id="proposal-input-form">
                
                {errorStatus && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-lg flex items-center gap-2 text-xs font-semibold" id="form-error-panel">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <span>{errorStatus}</span>
                  </div>
                )}

                {/* Grid for basics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      required
                      value={formData.clientName}
                      onChange={handleTextChange}
                      placeholder="e.g. John Darley Collins"
                      className="w-full border border-slate-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none focus:border-brand-orange transition-all"
                      id="input-form-client-name"
                    />
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Company / Municipality
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleTextChange}
                      placeholder="e.g. Peach Logistics LLC (Optional)"
                      className="w-full border border-slate-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none focus:border-brand-orange transition-all"
                      id="input-form-company-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleTextChange}
                      placeholder="e.g. developer@gmail.com"
                      className="w-full border border-slate-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none focus:border-brand-orange transition-all"
                      id="input-form-email"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                      Contact Telephone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleTextChange}
                      placeholder="e.g. 478-555-0199"
                      className="w-full border border-slate-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none focus:border-brand-orange transition-all"
                      id="input-form-phone"
                    />
                  </div>

                  {/* Best Time to Call */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Best Time to Call
                    </label>
                    <select
                      name="bestTimeToCall"
                      value={formData.bestTimeToCall}
                      onChange={handleTextChange}
                      className="w-full border border-slate-300 bg-white rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none focus:border-brand-orange transition-all"
                    >
                      <option value="Anytime / Text is Best">Anytime / Text is Best</option>
                      <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (12:00 PM - 5:00 PM)">Afternoon (12:00 PM - 5:00 PM)</option>
                      <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Service type and location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Service capability dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Desired Capability Required
                    </label>
                    <select
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleTextChange}
                      className="w-full border border-slate-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none transition-all"
                      id="input-form-service-id"
                    >
                      {(division === 'residential' ? RES_SERVICES_DATA : SERVICES_DATA).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Area dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Middle GA Project Location
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleTextChange}
                      className="w-full border border-slate-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none transition-all animate-none"
                      id="input-form-location"
                    >
                      <option value="Warner Robins, GA">Warner Robins, GA</option>
                      <option value="Macon, GA">Macon, GA</option>
                      <option value="Perry, GA">Perry, GA</option>
                      <option value="Fort Valley, GA">Fort Valley, GA</option>
                      <option value="Dublin, GA">Dublin, GA</option>
                      <option value="Milledgeville, GA">Milledgeville, GA</option>
                      <option value="Lake Oconee, GA">Lake Oconee, GA</option>
                      <option value="Greensboro, GA">Greensboro, GA</option>
                      <option value="Georgia (Other/Contract)">Other Georgia Area</option>
                    </select>
                  </div>
                </div>

                {/* Footprint prefilled size */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Known Boundary Footprint Area
                    </label>
                    <input
                      type="number"
                      name="projectSize"
                      min="0"
                      value={formData.projectSize}
                      onChange={handleTextChange}
                      className="w-full border border-slate-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none transition-all"
                      id="input-form-project-size"
                    />
                  </div>
                  <div className="sm:col-span-4 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block text-center">
                      Unit
                    </label>
                    <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 border h-11 border-slate-200" id="form-unit-tab">
                      <button
                        type="button"
                        onClick={() => handleUnitToggle('sq_ft')}
                        className={`text-xs font-bold rounded py-1 transition-all ${
                          formData.unit === 'sq_ft' ? 'bg-white shadow text-brand-orange' : 'text-slate-500'
                        }`}
                      >
                        Sq. Ft
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitToggle('acres')}
                        className={`text-xs font-bold rounded py-1 transition-all ${
                          formData.unit === 'acres' ? 'bg-white shadow text-brand-orange' : 'text-slate-500'
                        }`}
                      >
                        Acres
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submission Category toggle (radio/tabs) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Submission Category
                  </label>
                  <div className="grid grid-cols-2 gap-4" id="submission-category-cards">
                    <label className={`border rounded-lg p-3.5 flex items-start gap-2.5 cursor-pointer transition-all ${
                      formData.submissionType === 'bid_request' 
                        ? 'border-brand-orange bg-amber-50/20' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="submissionType"
                        value="bid_request"
                        checked={formData.submissionType === 'bid_request'}
                        onChange={() => setFormData(prev => ({ ...prev, submissionType: 'bid_request' }))}
                        className="mt-1 text-brand-orange focus:ring-brand-orange"
                      />
                      <div>
                        <span className="font-bold text-xs md:text-sm text-slate-950 block">Quote / Competitive Bid</span>
                        <span className="text-[10px] text-slate-500">I have drawings or pre-drafted specs.</span>
                      </div>
                    </label>

                    <label className={`border rounded-lg p-3.5 flex items-start gap-2.5 cursor-pointer transition-all ${
                      formData.submissionType === 'consultation' 
                        ? 'border-brand-orange bg-amber-50/20' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="submissionType"
                        value="consultation"
                        checked={formData.submissionType === 'consultation'}
                        onChange={() => setFormData(prev => ({ ...prev, submissionType: 'consultation' }))}
                        className="mt-1 text-brand-orange focus:ring-brand-orange"
                      />
                      <div>
                        <span className="font-bold text-xs md:text-sm text-slate-950 block">Free Site Consultation</span>
                        <span className="text-[10px] text-slate-500">I need field guidance and mapping advice.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Description details */}
                <div className="space-y-1.5 font-sans">
                  <label className="text-xs font-bold text-slate-700 block">
                    Site Description, Scope Objectives & Project Photos/Sketches
                  </label>
                  <textarea
                    name="projectDetails"
                    rows={4}
                    value={formData.projectDetails}
                    onChange={handleTextChange}
                    placeholder="Provide details of existing structures, wet spots, heavy clay sections, trees to save, or links to property photos/sketches..."
                    className="w-full border border-slate-300 rounded-lg py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-brand-orange focus:outline-none focus:border-brand-orange transition-all"
                    id="input-form-details-textarea"
                  ></textarea>
                </div>

                {/* Optional Utility Damage Waiver Checkbox */}
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5 space-y-1.5 font-sans">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="utilityDamageWaiver"
                      checked={formData.utilityDamageWaiver}
                      onChange={(e) => setFormData(prev => ({ ...prev, utilityDamageWaiver: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-orange focus:ring-brand-orange cursor-pointer shrink-0"
                      id="input-form-utility-waiver-checkbox"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                        Include Utility Damage Waiver for Unmarked Underground Lines (Optional)
                      </span>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Acknowledge that Client is responsible for marking private underground lines (irrigation, pet fences, private gas/electric). Adds standard legal liability disclaimer to the contract text releasing T.J. Darley Construction from financial liability for damage to unmarked lines.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Form Trigger CTA */}
                <button
                  type="submit"
                  className="w-full bg-brand-orange hover:bg-brand-darkorange text-white text-center font-black py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex justify-center items-center gap-2 text-sm uppercase tracking-wider font-display shrink-0"
                  id="submit-proposal-form-btn"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Official Request Pack</span>
                </button>

                {division === 'residential' && (
                  <p className="text-[10.5px] text-center text-slate-500 leading-normal mt-3 px-1.5 font-sans">
                    * Due to Georgia sub-soil variables and grade slopes, a complimentary <strong>physical site evaluation is required</strong> to inspect access routes and finalize a firm-fixed proposal.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Active Submissions Tracker Dashboard - Right Column */}
          <div className="lg:col-span-5 space-y-6" id="dashboard-tracker-panel">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5 relative overflow-hidden" id="dashboard-tracker-scaffolding">
              
              <div className="flex items-center gap-2 pb-4 border-b border-rose-50" id="tracker-header">
                <FileSpreadsheet className="w-5 h-5 text-brand-orange" />
                <div>
                  <h4 className="font-display font-bold text-base text-brand-coal leading-none">
                    Local Client Bid Tracker
                  </h4>
                  <span className="text-[10px] text-slate-400">Manage submissions on this browser</span>
                </div>
              </div>

              {bidsList.length === 0 ? (
                /* Empty tracker state */
                <div className="text-center py-12 px-4 space-y-4" id="empty-dashboard-states">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">No active local bids found</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Use our ballpark calculator or enter your parameters on the left to initialize a project path.
                    </p>
                  </div>
                </div>
              ) : (
                /* Submissions dynamic listing */
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2" id="dashboard-tracker-list">
                  {bidsList.map((bid) => (
                    <div
                      key={bid.id}
                      className="border border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-4 space-y-3 relative transition-all"
                      id={`tracker-item-${bid.id}`}
                    >
                      {/* Delete button from local storage */}
                      <button
                        onClick={() => handleDeleteBid(bid.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors p-1 rounded hover:bg-rose-50"
                        title="Remove tracking"
                        id={`tracker-delete-${bid.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 py-0.5 px-2 rounded">
                            {bid.id}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-brand-darkorange animate-pulse">
                            {bid.status}
                          </span>
                        </div>
                        <h5 className="font-display font-bold text-sm text-slate-900 line-clamp-1">
                          {(SERVICES_DATA.find(s => s.id === bid.serviceId)?.title || RES_SERVICES_DATA.find(s => s.id === bid.serviceId)?.title) || bid.serviceId}
                        </h5>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-brand-orange" />
                          <span>{bid.location} &bull; {bid.projectSize.toLocaleString()} {bid.unit === 'sq_ft' ? 'Sq. Ft.' : 'Acres'}</span>
                        </p>
                      </div>

                      {bid.estimatedCostRange && (
                        <div className="text-[11px] font-bold text-brand-darkorange bg-brand-orange/5 border border-brand-orange/10 px-2.5 py-1 rounded-md">
                          Calculator Bound: {bid.estimatedCostRange}
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 border-t pt-2 flex justify-between items-center">
                        <span>Submitted: {bid.submittedAt}</span>
                        <span className="text-brand-orange font-bold hover:underline cursor-pointer">
                          Direct Link
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Central Contact box reinforcement */}
              <div className="bg-slate-900 text-white rounded-lg p-4 border-l-4 border-brand-orange flex items-center justify-between" id="dashboard-contact-reinforcement">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 block uppercase">
                    DIAL DIRECT HIGHWAY
                  </span>
                  <a href="tel:4788087789" className="font-display font-black text-white hover:text-brand-orange text-sm md:text-base tracking-tight transition-colors">
                    478-808-7789
                  </a>
                </div>
                <div className="shrink-0 bg-brand-orange text-white p-2.5 rounded-full">
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
