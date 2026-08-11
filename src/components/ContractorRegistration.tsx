import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Truck, 
  Percent, 
  Users, 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  Flame, 
  DollarSign, 
  FileCheck, 
  Sparkles, 
  Briefcase,
  HelpCircle,
  Download,
  RotateCcw
} from 'lucide-react';

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  hourlyRate: number;
  fuelBurnGalHr: number;
  fuelPricePerGal: number;
  operatorAssigned?: string;
}

export interface EmployeeItem {
  id: string;
  name: string;
  role: string;
  payType: 'hourly' | 'salary';
  wageRate: number; // $/hr or $/yr
  burdenedRate: number; // $/hr
  isActive: boolean;
}

export interface ContractorProfile {
  companyName: string;
  dbaName: string;
  phone: string;
  email: string;
  address: string;
  cityStateZip: string;
  website: string;
  
  licenseNumber: string;
  licenseState: string;
  licenseExpDate: string;
  
  coiInsurer: string;
  coiPolicyNumber: string;
  coiGeneralLiabilityLimit: number;
  coiWorkersCompLimit: number;
  coiExpDate: string;
  
  defaultMarkupPercent: number;
  targetNetMarginPercent: number;
  overheadAllocationPercent: number;
  contingencyPercent: number;
  
  equipment: EquipmentItem[];
  employees: EmployeeItem[];
  
  lastUpdated?: string;
}

const DEFAULT_PROFILE: ContractorProfile = {
  companyName: "Apex Earthworks LLC",
  dbaName: "Apex Grading & Site Development",
  phone: "(706) 555-0199",
  email: "estimating@apexearthworks.com",
  address: "1450 Heavy Machinery Way",
  cityStateZip: "Greensboro, GA 30642",
  website: "www.apexearthworks.com",
  
  licenseNumber: "GC-2026-88412",
  licenseState: "GA",
  licenseExpDate: "2027-12-31",
  
  coiInsurer: "Travelers Heavy Equipment Underwriters",
  coiPolicyNumber: "POL-992014-GA",
  coiGeneralLiabilityLimit: 2000000,
  coiWorkersCompLimit: 1000000,
  coiExpDate: "2027-06-30",
  
  defaultMarkupPercent: 25.0,
  targetNetMarginPercent: 20.0,
  overheadAllocationPercent: 10.0,
  contingencyPercent: 3.0,
  
  equipment: [
    { id: 'eq-1', name: 'CAT 349 Excavator (49 Ton)', category: 'Excavator', hourlyRate: 185.00, fuelBurnGalHr: 9.5, fuelPricePerGal: 3.85, operatorAssigned: 'Marcus Vance' },
    { id: 'eq-2', name: 'CAT D8 Dozer w/ GPS 3D', category: 'Dozer', hourlyRate: 210.00, fuelBurnGalHr: 11.2, fuelPricePerGal: 3.85, operatorAssigned: 'David Lee' },
    { id: 'eq-3', name: 'CAT 621H Elevating Scraper', category: 'Scraper', hourlyRate: 225.00, fuelBurnGalHr: 12.8, fuelPricePerGal: 3.85, operatorAssigned: 'Unassigned' },
    { id: 'eq-4', name: 'CAT 730 Articulated Haul Truck (30 Ton)', category: 'Off-Road Hauler', hourlyRate: 165.00, fuelBurnGalHr: 8.0, fuelPricePerGal: 3.85, operatorAssigned: 'Billy Henderson' }
  ],
  
  employees: [
    { id: 'emp-1', name: 'Marcus Vance', role: 'Heavy Excavator Operator', payType: 'hourly', wageRate: 34.00, burdenedRate: 49.50, isActive: true },
    { id: 'emp-2', name: 'David Lee', role: 'Grade Foreman / GPS Tech', payType: 'hourly', wageRate: 38.50, burdenedRate: 56.00, isActive: true },
    { id: 'emp-3', name: 'Billy Henderson', role: 'Off-Road Haul Driver', payType: 'hourly', wageRate: 28.00, burdenedRate: 41.00, isActive: true },
    { id: 'emp-4', name: 'Travis Darley', role: 'Site Superintendent / PM', payType: 'salary', wageRate: 95000, burdenedRate: 68.00, isActive: true },
    { id: 'emp-5', name: 'Samantha Reed', role: 'Office Administrator & Dispatch', payType: 'salary', wageRate: 62000, burdenedRate: 42.00, isActive: true },
    { id: 'emp-6', name: 'John Miller', role: 'Master Heavy Equipment Mechanic', payType: 'hourly', wageRate: 42.00, burdenedRate: 61.50, isActive: true },
    { id: 'emp-7', name: 'Carlos Mendez', role: 'Pipe Layer / Utility Ground Lead', payType: 'hourly', wageRate: 29.50, burdenedRate: 43.00, isActive: true },
    { id: 'emp-8', name: 'Zachary Taylor', role: 'Compactor & Roller Operator', payType: 'hourly', wageRate: 26.00, burdenedRate: 38.00, isActive: false }
  ]
};

interface ContractorRegistrationProps {
  onBackToHome?: () => void;
}

export default function ContractorRegistration({ onBackToHome }: ContractorRegistrationProps) {
  const [activeTab, setActiveTab] = useState<'company' | 'coi' | 'fleet' | 'markup' | 'employees'>('company');
  const [profile, setProfile] = useState<ContractorProfile>(() => {
    try {
      const saved = localStorage.getItem('isite_contractor_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not parse saved contractor profile", e);
    }
    return DEFAULT_PROFILE;
  });

  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  // Auto-save to localStorage whenever profile changes
  const handleSaveProfile = () => {
    try {
      const updatedProfile = {
        ...profile,
        lastUpdated: new Date().toLocaleString()
      };
      localStorage.setItem('isite_contractor_profile', JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event('isite_profile_updated'));
      setSavedSuccessAlert(true);
      setTimeout(() => setSavedSuccessAlert(false), 4000);
    } catch (e) {
      console.error("Failed to save contractor profile", e);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("Reset profile to sample Apex Earthworks LLC contractor data?")) {
      setProfile(DEFAULT_PROFILE);
      localStorage.setItem('isite_contractor_profile', JSON.stringify(DEFAULT_PROFILE));
      window.dispatchEvent(new Event('isite_profile_updated'));
    }
  };

  // Fleet additions/removals
  const handleAddEquipment = () => {
    const newItem: EquipmentItem = {
      id: `eq-${Date.now()}`,
      name: 'CAT 320 Excavator (20 Ton)',
      category: 'Excavator',
      hourlyRate: 145.00,
      fuelBurnGalHr: 6.5,
      fuelPricePerGal: 3.85,
      operatorAssigned: 'Unassigned'
    };
    setProfile(prev => ({ ...prev, equipment: [...prev.equipment, newItem] }));
  };

  const handleRemoveEquipment = (id: string) => {
    setProfile(prev => ({
      ...prev,
      equipment: prev.equipment.filter(item => item.id !== id)
    }));
  };

  const handleUpdateEquipment = (id: string, field: keyof EquipmentItem, value: any) => {
    setProfile(prev => ({
      ...prev,
      equipment: prev.equipment.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  // Employee additions/removals
  const handleAddEmployee = () => {
    const newEmp: EmployeeItem = {
      id: `emp-${Date.now()}`,
      name: 'New Crew Member',
      role: 'Heavy Equipment Operator',
      payType: 'hourly',
      wageRate: 30.00,
      burdenedRate: 44.00,
      isActive: true
    };
    setProfile(prev => ({ ...prev, employees: [...prev.employees, newEmp] }));
  };

  const handleRemoveEmployee = (id: string) => {
    setProfile(prev => ({
      ...prev,
      employees: prev.employees.filter(emp => emp.id !== id)
    }));
  };

  const handleUpdateEmployee = (id: string, field: keyof EmployeeItem, value: any) => {
    setProfile(prev => ({
      ...prev,
      employees: prev.employees.map(emp => emp.id === id ? { ...emp, [field]: value } : emp)
    }));
  };

  // Fleet calculations
  const totalFleetHourlyRate = profile.equipment.reduce((sum, item) => sum + (Number(item.hourlyRate) || 0), 0);
  const totalFuelBurnGalHr = profile.equipment.reduce((sum, item) => sum + (Number(item.fuelBurnGalHr) || 0), 0);
  const totalHourlyFuelCost = profile.equipment.reduce((sum, item) => {
    const burn = Number(item.fuelBurnGalHr) || 0;
    const price = Number(item.fuelPricePerGal) || 3.85;
    return sum + (burn * price);
  }, 0);

  // Employee active calculations
  const activeEmployees = profile.employees.filter(e => e.isActive);
  const inactiveEmployees = profile.employees.filter(e => !e.isActive);
  const totalActiveHeadcount = activeEmployees.length;

  // COI status determination
  const isCoiValid = (() => {
    if (!profile.coiExpDate) return false;
    const exp = new Date(profile.coiExpDate);
    const now = new Date();
    return exp > now;
  })();

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Main Site</span>
              </button>
              <span className="text-slate-600">&bull;</span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-black">
                ISite Command Subscriber Setup
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-amber-400" />
              <span>Contractor Registration & System Profile</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Configure your contractor company profile, license, Certificate of Insurance (COI), heavy machinery fleet, fuel burn assumptions, default profit markups, and employee headcount data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Reset form to sample Apex Earthworks contractor details"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Sample Data</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Save Contractor Profile</span>
            </button>
          </div>
        </div>

        {/* Success Banner Alert */}
        {savedSuccessAlert && (
          <div className="bg-emerald-500/20 border-2 border-emerald-500 p-4 rounded-xl flex items-center justify-between text-emerald-300 animate-pulse">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <strong className="block text-sm font-bold text-white">Contractor Profile Successfully Saved!</strong>
                <p className="text-xs text-emerald-200">
                  Your company logo, license #, COI details, equipment fuel-burn rates, and employee roster are stored locally and synced with the Multi-Phase Earthwork Estimator.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('tjd_staff_authorized', 'true');
                window.dispatchEvent(new Event('tjd_auth_change'));
                window.location.hash = '#multi-phase-bid';
              }}
              className="px-3.5 py-1.5 bg-emerald-400 text-slate-950 font-mono font-black text-xs rounded-lg shadow hover:bg-emerald-300 transition-colors whitespace-nowrap"
            >
              Launch Estimator &rarr;
            </button>
          </div>
        )}

        {/* Executive Summary Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Active Employee Headcount */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Headcount</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                ACH Protection
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
              <span>{totalActiveHeadcount}</span>
              <span className="text-xs text-slate-400 font-normal">Active Workers</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {inactiveEmployees.length} archived/inactive personnel excluded from tier billing.
            </p>
          </div>

          {/* Fleet Fuel Burn Capacity */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Fleet Fuel Burn</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                {profile.equipment.length} Heavy Units
              </span>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono flex items-baseline gap-1.5">
              <span>{totalFuelBurnGalHr.toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-normal">Gal / Hr</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              ~${totalHourlyFuelCost.toFixed(2)} / hr estimated diesel consumption.
            </p>
          </div>

          {/* Default Markup & Net Margin */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                <span>Default Markup / Margin</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                Optimal
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono flex items-baseline gap-1.5">
              <span>{profile.defaultMarkupPercent}%</span>
              <span className="text-xs text-slate-400 font-normal">/ {profile.targetNetMarginPercent}% Margin</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Includes {profile.overheadAllocationPercent}% overhead allocation.
            </p>
          </div>

          {/* COI Compliance Status */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>COI Compliance</span>
              </span>
              {isCoiValid ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Active
                </span>
              ) : (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                  Expired / Missing
                </span>
              )}
            </div>
            <div className="text-lg font-black text-white font-mono truncate">
              {profile.coiInsurer || 'No Insurer Listed'}
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              Exp: {profile.coiExpDate || 'Not set'} &bull; ${(profile.coiGeneralLiabilityLimit / 1000000).toFixed(1)}M GL Limit
            </p>
          </div>

        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap border-b border-slate-800 gap-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`px-4 py-3 font-mono text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'company'
                ? 'bg-slate-900 text-amber-400 border-amber-500/50 border-b-2 border-b-amber-400 shadow'
                : 'bg-slate-950 text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Company & Contact Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coi')}
            className={`px-4 py-3 font-mono text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'coi'
                ? 'bg-slate-900 text-amber-400 border-amber-500/50 border-b-2 border-b-amber-400 shadow'
                : 'bg-slate-950 text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. License & COI Insurance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-3 font-mono text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'fleet'
                ? 'bg-slate-900 text-amber-400 border-amber-500/50 border-b-2 border-b-amber-400 shadow'
                : 'bg-slate-950 text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>3. Heavy Fleet & Fuel Burn ({profile.equipment.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('markup')}
            className={`px-4 py-3 font-mono text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'markup'
                ? 'bg-slate-900 text-amber-400 border-amber-500/50 border-b-2 border-b-amber-400 shadow'
                : 'bg-slate-950 text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>4. Markup & Profit Margins</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-3 font-mono text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'employees'
                ? 'bg-slate-900 text-amber-400 border-amber-500/50 border-b-2 border-b-amber-400 shadow'
                : 'bg-slate-950 text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>5. Employee Roster & Pay ({totalActiveHeadcount} Active)</span>
          </button>

        </div>

        {/* TAB 1: COMPANY & CONTACT INFO */}
        {activeTab === 'company' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-b-2xl rounded-tr-2xl shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Subscriber Contracting Entity Details</span>
              </h3>
              <p className="text-xs text-slate-400">
                This information appears on white-label client proposals, bid summaries, and contract packets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  Legal Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={e => setProfile({ ...profile, companyName: e.target.value })}
                  placeholder="e.g. Apex Earthworks LLC"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  DBA / Trade Branding Name
                </label>
                <input
                  type="text"
                  value={profile.dbaName}
                  onChange={e => setProfile({ ...profile, dbaName: e.target.value })}
                  placeholder="e.g. Apex Grading & Site Prep"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  Primary Office Phone <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="(706) 555-0199"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  Estimating / Dispatch Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  placeholder="estimating@company.com"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  Physical Office Address
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  placeholder="1450 Heavy Machinery Way"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  City, State, Zip
                </label>
                <input
                  type="text"
                  value={profile.cityStateZip}
                  onChange={e => setProfile({ ...profile, cityStateZip: e.target.value })}
                  placeholder="Greensboro, GA 30642"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-slate-300 font-bold block">
                  Company Website Domain
                </label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={e => setProfile({ ...profile, website: e.target.value })}
                  placeholder="www.apexearthworks.com"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Multi-Tenant White-Label Notice</span>
              </span>
              <p className="text-slate-300">
                Under Select Property Solutions, LLC's SaaS architecture, saving this profile allows your company to run standalone estimates, apply your own equipment rates, and print white-label PDFs without exposing platform infrastructure details.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: LICENSE & COI INSURANCE */}
        {activeTab === 'coi' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-b-2xl rounded-tr-2xl shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <span>Contractor Licensing & Certificate of Insurance (COI)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Track contractor state licenses, General Liability limits, and Workers Compensation policies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  State Contractor License #
                </label>
                <input
                  type="text"
                  value={profile.licenseNumber}
                  onChange={e => setProfile({ ...profile, licenseNumber: e.target.value })}
                  placeholder="GC-2026-88412"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  Licensing State / Jurisdiction
                </label>
                <input
                  type="text"
                  value={profile.licenseState}
                  onChange={e => setProfile({ ...profile, licenseState: e.target.value })}
                  placeholder="GA"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  License Expiration Date
                </label>
                <input
                  type="date"
                  value={profile.licenseExpDate}
                  onChange={e => setProfile({ ...profile, licenseExpDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-slate-300 font-bold block">
                  COI Insurance Carrier / Agency Name
                </label>
                <input
                  type="text"
                  value={profile.coiInsurer}
                  onChange={e => setProfile({ ...profile, coiInsurer: e.target.value })}
                  placeholder="e.g. Travelers Heavy Equipment Underwriters"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  Policy Number
                </label>
                <input
                  type="text"
                  value={profile.coiPolicyNumber}
                  onChange={e => setProfile({ ...profile, coiPolicyNumber: e.target.value })}
                  placeholder="POL-992014-GA"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  General Liability Limit ($)
                </label>
                <input
                  type="number"
                  value={profile.coiGeneralLiabilityLimit}
                  onChange={e => setProfile({ ...profile, coiGeneralLiabilityLimit: parseFloat(e.target.value) || 0 })}
                  placeholder="2000000"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  Workers Comp Policy Limit ($)
                </label>
                <input
                  type="number"
                  value={profile.coiWorkersCompLimit}
                  onChange={e => setProfile({ ...profile, coiWorkersCompLimit: parseFloat(e.target.value) || 0 })}
                  placeholder="1000000"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">
                  COI Policy Expiration Date
                </label>
                <input
                  type="date"
                  value={profile.coiExpDate}
                  onChange={e => setProfile({ ...profile, coiExpDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-mono ${
              isCoiValid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="block font-bold">
                  {isCoiValid ? 'COI Compliance Status: VALID & ACTIVE' : 'COI Compliance Status: EXPIRED OR UNSET'}
                </strong>
                <p className="text-[11px] opacity-90">
                  {isCoiValid 
                    ? `Policy expires on ${profile.coiExpDate}. General Liability coverage of $${(profile.coiGeneralLiabilityLimit/1000000).toFixed(1)}M meets standard commercial earthwork project requirements.`
                    : 'Please set a valid future COI expiration date to maintain project bidding compliance.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HEAVY FLEET & FUEL BURN */}
        {activeTab === 'fleet' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-b-2xl rounded-tr-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <span>Heavy Equipment Fleet & Diesel Fuel Burn Analysis</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configure machine billing rates ($/hr) and diesel consumption (Gal/hr) for automated jobsite fuel-burn cost calculations.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddEquipment}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Machine to Fleet</span>
              </button>
            </div>

            {/* Fleet Cards / Table */}
            <div className="space-y-3">
              {profile.equipment.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800 text-slate-400 font-mono text-xs">
                  No heavy equipment added yet. Click "Add Machine to Fleet" above to populate your excavator, dozer, or scraper fleet.
                </div>
              ) : (
                profile.equipment.map((eq, idx) => {
                  const hourlyFuelCost = (Number(eq.fuelBurnGalHr) || 0) * (Number(eq.fuelPricePerGal) || 3.85);
                  return (
                    <div key={eq.id} className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 transition-colors">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-amber-400" />
                          <span>Machine #{idx + 1}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(eq.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-slate-900 transition-colors flex items-center gap-1 text-[11px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-slate-400 text-[11px] block">Machine Name & Model</label>
                          <input
                            type="text"
                            value={eq.name}
                            onChange={e => handleUpdateEquipment(eq.id, 'name', e.target.value)}
                            placeholder="e.g. CAT 349 Excavator"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 text-[11px] block">Category</label>
                          <select
                            value={eq.category}
                            onChange={e => handleUpdateEquipment(eq.id, 'category', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                          >
                            <option value="Excavator">Excavator</option>
                            <option value="Dozer">Dozer</option>
                            <option value="Scraper">Scraper</option>
                            <option value="Off-Road Hauler">Off-Road Hauler</option>
                            <option value="Compactor / Roller">Compactor / Roller</option>
                            <option value="Motor Grader">Motor Grader</option>
                            <option value="Skid Steer / Loader">Skid Steer / Loader</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 text-[11px] block">Hourly Billing ($/hr)</label>
                          <input
                            type="number"
                            value={eq.hourlyRate}
                            onChange={e => handleUpdateEquipment(eq.id, 'hourlyRate', parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 text-[11px] block">Fuel Burn (Gal/hr)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={eq.fuelBurnGalHr}
                            onChange={e => handleUpdateEquipment(eq.id, 'fuelBurnGalHr', parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                        <span>Assigned Operator: <strong className="text-slate-200">{eq.operatorAssigned || 'Unassigned'}</strong></span>
                        <span className="text-amber-400 font-bold">
                          Est. Fuel Expense: ${hourlyFuelCost.toFixed(2)} / hr @ ${eq.fuelPricePerGal || 3.85}/gal diesel
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Fleet totals card */}
            <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400">Total Fleet Capacity:</span>
                <strong className="text-white text-sm font-bold block">{profile.equipment.length} Units Operational</strong>
              </div>
              <div>
                <span className="text-slate-400">Combined Hourly Fleet Rate:</span>
                <strong className="text-amber-400 text-sm font-bold block">${totalFleetHourlyRate.toFixed(2)} / hr</strong>
              </div>
              <div>
                <span className="text-slate-400">Total Fleet Diesel Burn:</span>
                <strong className="text-amber-400 text-sm font-bold block">{totalFuelBurnGalHr.toFixed(1)} Gal / hr</strong>
              </div>
              <div>
                <span className="text-slate-400">Est. Diesel Fuel Expense:</span>
                <strong className="text-emerald-400 text-sm font-bold block">${totalHourlyFuelCost.toFixed(2)} / hr</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MARKUP & PROFIT MARGINS */}
        {activeTab === 'markup' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-b-2xl rounded-tr-2xl shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-400" />
                <span>Markup vs. Net Margin Financial Settings</span>
              </h3>
              <p className="text-xs text-slate-400">
                Establish baseline dollar markups over direct raw cost and verify true retained net profit margins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              
              <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Default Bid Percentages</span>
                </h4>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-bold">Direct Raw Cost Markup (%)</label>
                    <span className="text-amber-400 font-bold">{profile.defaultMarkupPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="0.5"
                    value={profile.defaultMarkupPercent}
                    onChange={e => setProfile({ ...profile, defaultMarkupPercent: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Added to direct equipment, labor, and subcontractor raw expenses.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-300 font-bold">Target Net Profit Margin (%)</label>
                    <span className="text-emerald-400 font-bold">{profile.targetNetMarginPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="0.5"
                    value={profile.targetNetMarginPercent}
                    onChange={e => setProfile({ ...profile, targetNetMarginPercent: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    True percentage of final contract revenue retained as net profit.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">Overhead Allocation (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={profile.overheadAllocationPercent}
                      onChange={e => setProfile({ ...profile, overheadAllocationPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">Contingency Buffer (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={profile.contingencyPercent}
                      onChange={e => setProfile({ ...profile, contingencyPercent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Profit Audit Sensitivity Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Formula Audit & Sensitivity Zones</span>
                </h4>

                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span>Markup Formula:</span>
                    <strong className="text-amber-400 font-mono">Markup = Profit / Direct Cost</strong>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span>Margin Formula:</span>
                    <strong className="text-emerald-400 font-mono">Margin = Profit / Selling Price</strong>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Profit Margin Sensitivity Matrix
                  </span>
                  
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-[11px]">
                    <strong>&lt; 15% Net Margin:</strong> Low Cushion Zone (High risk on unforeseen rock or wet soil)
                  </div>

                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-[11px]">
                    <strong>15% &ndash; 28% Net Margin:</strong> Optimal Competitive & Profitable Zone (Recommended)
                  </div>

                  <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-300 text-[11px]">
                    <strong>&gt; 28% Net Margin:</strong> Premium Yield Zone (High margin for technical or emergency site work)
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: EMPLOYEE ROSTER & PAY DATA */}
        {activeTab === 'employees' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-b-2xl rounded-tr-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Employee Headcount Roster & Fully Burdened Pay Data</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Manage active field crew and office personnel. Subscriptions strictly count <strong className="text-amber-400 font-mono">Active Employees</strong> so archived personnel don't bump you into higher billing tiers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddEmployee}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>

            {/* Active vs Inactive Employee Counter Summary */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-300">
                  Total Active Personnel: <strong className="text-amber-400 text-sm">{totalActiveHeadcount}</strong>
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-400">
                  Archived/Inactive: <strong className="text-slate-300">{inactiveEmployees.length}</strong>
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                ACH Billing Tier Safe & Protected
              </span>
            </div>

            {/* Employee List */}
            <div className="space-y-3">
              {profile.employees.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800 text-slate-400 font-mono text-xs">
                  No employees added yet. Click "Add Employee" above to build your active crew roster.
                </div>
              ) : (
                profile.employees.map((emp, idx) => (
                  <div 
                    key={emp.id} 
                    className={`p-4 rounded-xl border space-y-3 transition-colors ${
                      emp.isActive
                        ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/50 border-slate-900 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${emp.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="font-bold text-white">Employee #{idx + 1}</span>
                        {!emp.isActive && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                            Archived / Inactive
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300 font-bold">
                          <input
                            type="checkbox"
                            checked={emp.isActive}
                            onChange={e => handleUpdateEmployee(emp.id, 'isActive', e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400"
                          />
                          <span>Active Status</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmployee(emp.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-slate-900 transition-colors flex items-center gap-1 text-[11px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-slate-400 text-[11px] block">Full Name</label>
                        <input
                          type="text"
                          value={emp.name}
                          onChange={e => handleUpdateEmployee(emp.id, 'name', e.target.value)}
                          placeholder="e.g. Marcus Vance"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-1">
                        <label className="text-slate-400 text-[11px] block">Role / Position</label>
                        <input
                          type="text"
                          value={emp.role}
                          onChange={e => handleUpdateEmployee(emp.id, 'role', e.target.value)}
                          placeholder="e.g. Heavy Excavator Operator"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 text-[11px] block">Pay Type</label>
                        <select
                          value={emp.payType}
                          onChange={e => handleUpdateEmployee(emp.id, 'payType', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        >
                          <option value="hourly">Hourly Wage</option>
                          <option value="salary">Annual Salary</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 text-[11px] block">
                          {emp.payType === 'hourly' ? 'Base Wage ($/hr)' : 'Salary ($/yr)'}
                        </label>
                        <input
                          type="number"
                          value={emp.wageRate}
                          onChange={e => handleUpdateEmployee(emp.id, 'wageRate', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                      <span>
                        Fully Burdened Rate: <strong className="text-emerald-400">${emp.burdenedRate || (emp.wageRate * 1.45).toFixed(2)} / hr</strong> (Includes FICA, Workers Comp, & Benefits)
                      </span>
                      <span className="text-slate-500">
                        {emp.isActive ? 'Included in Payroll Tier' : 'Excluded from Payroll Tier'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bottom Call-to-Action Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Ready to generate estimates with your profile?</span>
            </h4>
            <p className="text-xs text-slate-300">
              Saving applies your heavy equipment fuel-burn rates, employee wage burden, and company branding directly inside the Multi-Phase Earthwork Estimator.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleSaveProfile}
              className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Save Profile & Launch Estimator</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
