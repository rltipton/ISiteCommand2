/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getWebhookUrl } from '../utils';
import { 
  Briefcase, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Truck,
  HardHat,
  Clock,
  Sparkles
} from 'lucide-react';

interface CareersProps {
  onBackToHome: () => void;
}

interface ApplicationForm {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  cdlStatus: string;
  dirtExperienceYears: string;
  selectedRole: string;
  proficiencies: string[];
  lastEmployer: string;
  additionalNotes: string;
  agreedToTerms: boolean;
}

export default function Careers({ onBackToHome }: CareersProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<ApplicationForm>({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    cdlStatus: 'none',
    dirtExperienceYears: '1',
    selectedRole: 'Heavy Machinery Operator',
    proficiencies: [],
    lastEmployer: '',
    additionalNotes: '',
    agreedToTerms: false
  });

  const [formError, setFormError] = useState('');

  const openRoles = [
    {
      title: 'Heavy Machinery Operator',
      type: 'Full-Time (Macon & Warner Robins)',
      compensation: '$24.00 - $34.00 / hour',
      description: 'Require minimum 3 years stable history operating Cat/Deere excavating tracks or bulldozers. Experience in final grading and laser site pads is highly favored.',
      icon: HardHat,
      color: 'text-brand-orange bg-amber-955'
    },
    {
      title: 'CDL Class A Dump Truck Driver',
      type: 'Full-Time (Middle Georgia Local)',
      compensation: '$22.00 - $30.00 / hour',
      description: 'Haul aggregate base, topsoil, and equipment transport between jobsites. Requires a clean driving record and heavy tri-axle truck maneuvering expertise.',
      icon: Truck,
      color: 'text-emerald-400 bg-emerald-955'
    },
    {
      title: 'Forestry Mulcher Specialist',
      type: 'Full-Time / Seasonal Options',
      compensation: '$25.00 - $32.00 / hour',
      description: 'Operate high-flow compact track loaders with Fecon mulching heads. Clearing thick brush and surveyor property lines safely in acreage locations like Greensboro.',
      icon: Briefcase,
      color: 'text-brand-orange bg-amber-955'
    },
    {
      title: 'Grade Foreman / Site General Tech',
      type: 'Full-Time',
      compensation: '$26.00 - $36.00 / hour',
      description: 'Read construction plans, drive grade stakes, manage crew workflow, and coordinate soil compaction certifications with state engineering inspectors.',
      icon: Award,
      color: 'text-emerald-400 bg-emerald-955'
    }
  ];

  const handleCheckboxChange = (proficiency: string) => {
    setFormData(prev => {
      const profs = prev.proficiencies.includes(proficiency)
        ? prev.proficiencies.filter(p => p !== proficiency)
        : [...prev.proficiencies, proficiency];
      return { ...prev, proficiencies: profs };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!formData.fullName.trim()) return setFormError('Please enter your full name.');
    if (!formData.phone.trim()) return setFormError('Please enter a callback phone number.');
    if (!formData.city.trim()) return setFormError('Please enter your city of residence.');
    if (!formData.agreedToTerms) return setFormError('You must agree to the employment verification terms.');

    // Save mock record in localStorage so that the private Operations Hub can audit and manage it!
    const existingApps = JSON.parse(localStorage.getItem('tjd_careers_applications') || '[]');
    const appSubmissionId = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newApp = {
      id: appSubmissionId,
      submittedAt: new Date().toLocaleString(),
      ...formData
    };

    localStorage.setItem('tjd_careers_applications', JSON.stringify([newApp, ...existingApps]));

    // Trigger Dynamic Google Sheet Webhook Sync for Careers Form!
    const formDataPayload = new URLSearchParams();
    formDataPayload.append('action', 'submit_career');
    formDataPayload.append('Submission_ID', appSubmissionId);
    formDataPayload.append('submission_id', appSubmissionId);
    formDataPayload.append('submitted_on', new Date().toISOString());
    formDataPayload.append('submitted_by', formData.fullName);
    formDataPayload.append('fullName', formData.fullName);
    formDataPayload.append('phone', formData.phone);
    formDataPayload.append('email', formData.email);
    formDataPayload.append('city', formData.city);
    formDataPayload.append('hasCDL', formData.hasCDL ? 'YES' : 'NO');
    formDataPayload.append('yearsExperience', String(formData.yearsExperience));
    formDataPayload.append('targetRole', formData.targetRole);
    formDataPayload.append('proficiencies', formData.proficiencies.join(', '));
    formDataPayload.append('lastEmployer', formData.lastEmployer);
    formDataPayload.append('notes', formData.notes);

    fetch(getWebhookUrl(), {
      method: 'POST',
      body: formDataPayload,
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(() => {
      console.log('Careers Application submitted natively to Sheets Webhook!');
    })
    .catch((err) => {
      console.warn('Workbook integration delayed/skipped', err);
    });
    
    // Smooth transition
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFormSubmitted(true);
  };

  return (
    <div className="bg-slate-900 border-t-4 border-emerald-600 text-white min-h-screen font-sans pb-24 text-left">
      
      {/* 1. Header Hero Banner */}
      <div className="relative py-16 md:py-24 bg-slate-950 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-6">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-brand-orange transition-colors duration-150 p-2 bg-slate-900 rounded-lg border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Main Site</span>
          </button>

          <div className="space-y-4 max-w-4xl">
            <span className="font-display font-black text-xs tracking-widest text-brand-orange uppercase bg-amber-950/40 border border-brand-orange/30 px-3.5 py-1.5 rounded-full inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              WE ARE HIRING DIRECTLY IN MIDDLE GEORGIA
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-none">
              A Ridge-Balanced Crew <br className="hidden sm:inline" />
              Built on <span className="text-brand-orange">Grit & Precision</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-medium font-sans">
              Since 2008, TJ Darley Construction has set the standard for Middle Georgia land prep, forestry mulching, and site excavation. We offer competitive pay, modern equipment, and a safety-first atmosphere.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {formSubmitted ? (
          
          /* SUCCESS SCREEN */
          <div className="bg-slate-950 border border-emerald-800/80 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full w-fit mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            
            <div className="space-y-3">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">Application Received!</h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto">
                Thank you for applying to join the TJ Darley crew, <strong className="text-emerald-400">{formData.fullName}</strong>. Your qualifications and machine proficiencies have been synced to our staff ledger database.
              </p>
              <p className="text-xs text-slate-400">
                A hiring manager will audit your application against our current schedules. We typically respond within 24–48 hours to confirm employment references.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto font-mono">
              <span className="font-bold text-slate-300 uppercase block tracking-wider font-display">Submitted Profile Summary:</span>
              <p className="text-slate-400">&bull; Target Role: <span className="text-white font-bold">{formData.selectedRole}</span></p>
              <p className="text-slate-400">&bull; Experience: <span className="text-white font-bold">{formData.dirtExperienceYears} Years in Dirt</span></p>
              <p className="text-slate-400">&bull; CDL License: <span className="text-white font-bold">{formData.cdlStatus.toUpperCase()}</span></p>
              <p className="text-slate-400">&bull; Contact Callback: <span className="text-brand-orange font-bold font-sans">{formData.phone}</span></p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={onBackToHome}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg transition-colors uppercase tracking-wider"
              >
                Return to Main Website
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({
                    fullName: '',
                    phone: '',
                    email: '',
                    city: '',
                    cdlStatus: 'none',
                    dirtExperienceYears: '1',
                    selectedRole: 'Heavy Machinery Operator',
                    proficiencies: [],
                    lastEmployer: '',
                    additionalNotes: '',
                    agreedToTerms: false
                  });
                }}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg transition-colors uppercase tracking-wider"
              >
                Submit Another Application
              </button>
            </div>
          </div>

        ) : (

          /* FORM & DETAIL SCREEN */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Hand: Open Roles Cards */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold text-brand-orange uppercase tracking-widest block">OPERATIONAL POSITIONS</span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white">Active Openings</h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-sans">
                  We look for dedicated operators who respect machinery, handle precision grading transits, and arrive on time. CDL-A or specialized GSWCC certificates are a strong asset.
                </p>
              </div>

              <div className="space-y-4" id="careers-roles-group">
                {openRoles.map((role) => {
                  const IconComp = role.icon;
                  return (
                    <div 
                      key={role.title}
                      onClick={() => setFormData(prev => ({ ...prev, selectedRole: role.title }))}
                      className={`group border rounded-2xl p-5 text-left transition-all cursor-pointer ${
                        formData.selectedRole === role.title 
                          ? 'bg-slate-950 border-brand-orange shadow-lg shadow-brand-orange/5' 
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${role.color}`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h3 className="font-display font-bold text-sm text-white group-hover:text-brand-orange transition-colors">
                              {role.title}
                            </h3>
                            <span className="text-[10px] font-bold font-mono text-brand-orange uppercase">Active</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between gap-1">
                            <span>{role.type}</span>
                            <span className="text-emerald-400 font-bold">{role.compensation}</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed pt-1.5 border-t border-slate-900/60 font-sans">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Company perks card */}
              <div className="bg-slate-950/80 border border-slate-800/80 p-6 rounded-2xl space-y-4">
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">TJD Site Benefits:</span>
                <ul className="text-xs text-slate-300 space-y-3 font-sans">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Excellent Pay Rates</strong>: Structured schedules with overtime allowances.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>High-Tier Equipment</strong>: Clean, air-conditioned late-model machinery (Cat, John Deere, Fecon).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Local Projects</strong>: Sleep in your own bed. Typical layouts throughout Macon, Greensboro, & Warner Robins.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Hand: Employment Form */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl" id=" careers-application-segment">
              
              <div className="space-y-1 border-b border-slate-900 pb-4">
                <h3 className="font-display font-black text-lg text-white">Employment Application</h3>
                <p className="text-slate-400 text-xs">
                  Fill out your qualifications. Your application is saved securely in our operations queue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {formError && (
                  <div className="bg-rose-950/60 border border-rose-900 text-rose-300 px-4 py-2.5 rounded-lg text-xs font-semibold text-center leading-relaxed">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300">Target Role</label>
                    <select
                      value={formData.selectedRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, selectedRole: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                    >
                      <option value="Heavy Machinery Operator">Heavy Machinery Operator</option>
                      <option value="CDL Class A Dump Truck Driver">CDL Class A Dump Truck Driver</option>
                      <option value="Forestry Mulcher Specialist">Forestry Mulcher Specialist</option>
                      <option value="Grade Foreman / Site General Tech">Grade Foreman / Site Tech</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300">Years in Dirt Work / Forestry</label>
                    <select
                      value={formData.dirtExperienceYears}
                      onChange={(e) => setFormData(prev => ({ ...prev, dirtExperienceYears: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                    >
                      <option value="0-1">Less than 1 Year</option>
                      <option value="1">1 to 2 Years</option>
                      <option value="3">3 to 5 Years</option>
                      <option value="6">5 to 10 Years</option>
                      <option value="10">10+ Years (Veteran Operator)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Kyle Simmons"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300">Callback Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="478-808-7789"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300">Email Address (Optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        placeholder="operator@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300">Current City Residence (GA) *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Greensboro, GA"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300">CDL License Classification</label>
                  <div className="flex gap-4">
                    {['none', 'CDL Class A', 'CDL Class B'].map((val) => (
                      <label key={val} className="inline-flex items-center gap-2 cursor-pointer mt-0 font-bold text-slate-300">
                        <input
                          type="radio"
                          name="cdl"
                          value={val}
                          checked={formData.cdlStatus === val}
                          onChange={(e) => setFormData(prev => ({ ...prev, cdlStatus: e.target.value }))}
                          className="accent-brand-orange h-4 w-4"
                        />
                        <span>{val === 'none' ? 'No CDL' : val}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Proficiencies Grid layout */}
                <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <label className="font-bold text-emerald-400 block pb-1 border-b border-slate-800">Check Heavily Operated Vehicles:</label>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-slate-300">
                    {[
                      '30-Ton Track Excavators',
                      'Finishing Laser Bulldozers',
                      'High-Flow Fecon Mulchers',
                      'Skid-Steers & Mini Diggers',
                      'Vibratory Compaction Rollers',
                      'Articulated Rock Trucks'
                    ].map((equip) => (
                      <label key={equip} className="flex items-center gap-2 cursor-pointer mt-0 py-0.5">
                        <input
                          type="checkbox"
                          checked={formData.proficiencies.includes(equip)}
                          onChange={() => handleCheckboxChange(equip)}
                          className="accent-brand-orange h-4.5 w-4.5 rounded border-slate-800"
                        />
                        <span className="text-[11px] truncate">{equip}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300 font-sans">Last Sub-Contractor or Employer (Optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Vance Grading Logistics"
                      value={formData.lastEmployer}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastEmployer: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300">Brief Dirt Experience & Safety Certs (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific machinery attachments, OSHA 10/30 cards, or GSWCC Blue Cards you possess..."
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors resize-none"
                  ></textarea>
                </div>

                <div className="space-y-1.5 text-xs pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-slate-400 mt-0">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                      className="accent-brand-orange h-4.5 w-4.5 rounded shrink-0"
                    />
                    <span className="leading-tight text-[11px] text-left">
                      I guarantee the details above represent an honest operator check. I authorize TJ Darley Construction to perform standard driving and safety background verification to confirm site safety compliance.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 mt-6"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>File Official Application</span>
                </button>

              </form>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
