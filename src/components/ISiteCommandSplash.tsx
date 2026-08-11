import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import isitePatriotBg from '../assets/images/isite_patriot_bg_1786209846559.jpg';
import isiteGoldLogo from '../assets/images/isite_command_transparent_badge_1786284200000_png_1786284084637.jpg';
import { 
  Sparkles, 
  Send, 
  CheckCircle, 
  Phone, 
  Mail, 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  Calculator, 
  FileText, 
  Share2, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Layers,
  Zap,
  Lock,
  Award,
  Users,
  MessageSquare,
  AlertTriangle,
  Star,
  Info,
  Filter,
  Check,
  Download,
  X,
  QrCode,
  Printer,
  ListChecks,
  DollarSign,
  HardHat,
  Megaphone,
  Image as ImageIcon,
  Video,
  Play
} from 'lucide-react';
import { InteractiveVideoTour } from './InteractiveVideoTour';

interface ISiteCommandSplashProps {
  onClose?: () => void;
}

interface FeedbackEntry {
  id: string;
  timestamp: string;
  contractorName: string;
  companyName: string;
  email: string;
  category: 'Criticism / Discrepancy' | 'Calculation Formula Check' | 'Feature Request' | 'Bug Report' | 'General Feedback';
  rating: number;
  subject: string;
  details: string;
  status: 'Logged' | 'Under Review' | 'Resolved';
}

const INITIAL_FEEDBACK: FeedbackEntry[] = [
  {
    id: 'FB-2026-001',
    timestamp: '2026-08-05 14:22',
    contractorName: 'Brad Henderson',
    companyName: 'Piedmont Dirt & Grading, LLC',
    email: 'bhenderson@piedmontdirt.com',
    category: 'Calculation Formula Check',
    rating: 5,
    subject: 'Clay Compaction Shrinkage Precision',
    details: 'The 15% clay compaction shrinkage factor in mass cut/fill is spot on for Middle Georgia red clay. Suggest adding an option for hard rock swell factor (+25% to +35%) when jackhammering granite.',
    status: 'Under Review'
  },
  {
    id: 'FB-2026-002',
    timestamp: '2026-08-06 09:15',
    contractorName: 'Marcus Vance',
    companyName: 'Vance Site Utilities',
    email: 'marcus@vancesite.com',
    category: 'Feature Request',
    rating: 5,
    subject: 'Off-Road Diesel Tax Credit Tracker',
    details: 'Love the Markup vs Net Margin sensitivity audit matrix! It saved us from under-bidding a $180k commercial site prep. Requesting a field for off-road fuel tax credit export in the office copy.',
    status: 'Logged'
  },
  {
    id: 'FB-2026-003',
    timestamp: '2026-08-07 16:40',
    contractorName: 'David Lee',
    companyName: 'Oakwood Grading & Clearing',
    email: 'dlee@oakwoodgrading.com',
    category: 'Criticism / Discrepancy',
    rating: 4,
    subject: 'Contractor Liability Disclaimer Visibility',
    details: 'Great software. Make sure the calculation responsibility disclaimer is printed in bold at the top of the office proposal copy so estimators remember to double check site utility lines before signing.',
    status: 'Resolved'
  }
];

export const ISiteCommandSplash: React.FC<ISiteCommandSplashProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    activeEmployees: '1–3 Active Employees',
    interest: 'Estimating & Multi-Phase Bidding'
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [copiedTipIndex, setCopiedTipIndex] = useState<number | null>(null);

  // Disclaimer, Feedback Repository, QR Access, Capabilities Sheet & Logo Modal State
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCapabilitiesModal, setShowCapabilitiesModal] = useState(false);
  const [showArtModal, setShowArtModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showStaticAdModal, setShowStaticAdModal] = useState(false);
  const [showVideoTourModal, setShowVideoTourModal] = useState(false);
  const [adRegion, setAdRegion] = useState('Middle Georgia & Southeast Earthwork Contractors');
  const [customRegion, setCustomRegion] = useState('');
  const [adTheme, setAdTheme] = useState<'dark' | 'yellow' | 'patriot'>('dark');
  const [copiedAdText, setCopiedAdText] = useState(false);
  const [selectedAdFeatures, setSelectedAdFeatures] = useState<string[]>([
    'Multi-Phase Bidding Engine & Custom Rate Tables',
    'Profit Sensitivity Ledger (Markup vs Margin Audit)',
    'White-Label Subscriber Custom Branding (Your Logo)',
    'Mobile Crew Clock-In & Geo-Fenced Timecards (Tier 2)',
    'CAD Blueprint & PDF Site Plan Interpreter (Tier 3)',
    'Drone Photogrammetry & Stockpile Volume Audits (Tier 4)',
    'Zero Financial Data Storage ACH Billing Security'
  ]);
  const [copiedQrLink, setCopiedQrLink] = useState(false);
  const [copiedCapList, setCopiedCapList] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(() => {
    try {
      const saved = localStorage.getItem('isite_command_feedback_repository');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FEEDBACK;
  });

  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('All');
  const [newFeedback, setNewFeedback] = useState({
    contractorName: '',
    companyName: '',
    email: '',
    category: 'Criticism / Discrepancy' as FeedbackEntry['category'],
    rating: 5,
    subject: '',
    details: ''
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('isite_command_feedback_repository', JSON.stringify(feedbackList));
    } catch (e) {
      console.error(e);
    }
  }, [feedbackList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.company) return;
    setSubmitted(true);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.details || !newFeedback.email || !newFeedback.companyName) return;

    const created: FeedbackEntry = {
      id: `FB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      contractorName: newFeedback.contractorName || 'Anonymous Contractor',
      companyName: newFeedback.companyName,
      email: newFeedback.email,
      category: newFeedback.category,
      rating: newFeedback.rating,
      subject: newFeedback.subject || `${newFeedback.category} Submission`,
      details: newFeedback.details,
      status: 'Logged'
    };

    setFeedbackList([created, ...feedbackList]);
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setNewFeedback({
        contractorName: '',
        companyName: '',
        email: '',
        category: 'Criticism / Discrepancy',
        rating: 5,
        subject: '',
        details: ''
      });
    }, 3500);
  };

  const contractorTips = [
    {
      title: "Work ON It — Not Just IN It",
      subtitle: "6 Steps to Scale Your Earthwork Business",
      badge: "Contractor Tip #1",
      points: [
        "Visit the job site — don't live there. Next job is found outside the current one.",
        "Invest in marketing — consistent leads create consistent revenue.",
        "Empower a foreman — you can't scale if every decision depends on you.",
        "Hire an estimator — better estimates lead to better profits.",
        "Train people on the shovel before the machine.",
        "Offer financing — many customers afford payments even if not upfront cash."
      ],
      quote: "Successful contractors don't just build projects — they build SYSTEMS that keep projects coming.",
      caption: "🚨 EARTHWORK CONTRACTOR TIP: Are you working ON your excavating business, or trapped working IN it? To scale beyond $1M+, you need automated estimating systems, empowered foremen, and razor-sharp bid margins. Learn how iSite Command helps earthwork contractors double their bidding velocity: www.isitecommand.com"
    },
    {
      title: "What Makes an Earthwork Job Expensive?",
      subtitle: "Look Beyond the Dirt Before Giving a Price",
      badge: "Contractor Tip #2",
      points: [
        "1. Volume — More dirt moved = more machine hours, fuel, and trucking.",
        "2. Subsurface Conditions — Rock, wet soil, and groundwater double cycle times.",
        "3. Haul Distance — Off-site disposal or import dirt is a major cost driver.",
        "4. Site Access — Tight entrances and steep terrain reduce operator production.",
        "5. Environmental Controls — Silt fence, turbidity curtains, and NPDES permits."
      ],
      quote: "KNOW THE SITE. KNOW THE QUANTITIES. KNOW WHERE THE DIRT IS GOING.",
      caption: "🚜 BEFORE YOU GIVE A DIRT PRICE: Look beyond the cubic yards! Wet clay, tight access, and long haul distances can wipe out your margin. iSite Command's built-in soil compaction and equipment fuel-burn calculators protect your profits before you mobilize: www.isitecommand.com"
    },
    {
      title: "Heavy Equipment Safety & Pre-Op Routine",
      subtitle: "Safe Today. Here Tomorrow.",
      badge: "Contractor Tip #3",
      points: [
        "Know your equipment — understand operational limitations.",
        "Daily pre-op inspections — check fluids, hydraulic lines, and brakes.",
        "Maintain safe work zones — use spotters around swing radiuses.",
        "Wear proper PPE — hard hat, high-vis, gloves, and boots always.",
        "Zero distractions — focus on the site and ground crew."
      ],
      quote: "SAFETY ISN'T JUST A RULE. IT'S HOW WE GET HOME.",
      caption: "⚡ HEAVY EQUIPMENT OPERATOR SAFETY: Protect your crew and your fleet. iSite Command includes pre-mobilization safety checklists and IRS W-9 / COI contractor verification sheets built directly into every job packet. Coming soon to a site near you! www.isitecommand.com"
    },
    {
      title: "More Than An Estimator — Full Contractor Command",
      subtitle: "HR, Payroll Timecards & Crew Job-Costing",
      badge: "Contractor Tip #4",
      points: [
        "1. Mobile Crew Timecards — Field clock-in for equipment operators, drivers, and ground crews.",
        "2. Job-Costed Payroll Export — Track true labor costs against estimated phase allowances.",
        "3. Fully Burdened Labor Rates — Automatically factor payroll taxes, workers' comp, and benefits.",
        "4. Subcontractor COI & W-9 Verification — Prevent compliance liability before dispatching 1099s.",
        "5. Unified Contractor Command — Run bidding, margin audits, HR, and payroll under one brand."
      ],
      quote: "GREAT ESTIMATES GET THE JOB. GREAT HR & PAYROLL SYSTEMS KEEP THE PROFIT.",
      caption: "🚨 ISITE COMMAND IS MORE THAN AN ESTIMATOR! In addition to multi-phase cut/fill earthwork bidding, iSite Command handles field crew timecard payroll, fully burdened labor rate accounting, subcontractor W-9/COI compliance, and live margin audits. Upgrade your excavating business today: www.isitecommand.com"
    }
  ];

  const copyCaption = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTipIndex(index);
    setTimeout(() => setCopiedTipIndex(null), 2500);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner */}
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-pulse text-slate-950" />
        <span>PRE-LAUNCH SUBSCRIBER PORTAL — SELECT PROPERTY SOLUTIONS, LLC</span>
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-auto bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors"
          >
            Close Preview
          </button>
        )}
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowLogoModal(true)}
              className="w-11 h-11 rounded-xl bg-slate-950 border border-amber-500/50 p-0.5 shadow-lg shadow-amber-500/20 overflow-hidden shrink-0 hover:border-amber-400 transition-colors group cursor-pointer"
              title="Click to view & download official 3D gold emblem logo"
            >
              <img 
                src={isiteGoldLogo} 
                alt="iSite Command Logo - Gold Quill & Lightning Bolt Emblem" 
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white font-display">iSite Command</span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold">
                  Subscriber SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Intelligent Earthwork Estimating & Operations System</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => setShowVideoTourModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-black transition-all shadow-lg shadow-amber-500/25 animate-pulse"
            >
              <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              <span>Watch Interactive Video Tour</span>
            </button>

            <button
              onClick={() => setShowStaticAdModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all shadow-md shadow-amber-500/20"
            >
              <Megaphone className="w-3.5 h-3.5 text-slate-950" />
              <span>Regional Static Ad</span>
            </button>

            <button
              onClick={() => setShowLogoModal(true)}
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all shadow-md shadow-amber-500/10"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download Logo HD</span>
            </button>

            <button
              onClick={() => setShowCapabilitiesModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all shadow-md shadow-amber-500/20"
            >
              <FileText className="w-3.5 h-3.5 text-slate-950" />
              <span>Promotional Feature Sheet</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Mobile QR Pass</span>
            </button>

            <button
              onClick={() => setShowDisclaimerModal(true)}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Liability Disclaimer</span>
            </button>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Feedback Repository ({feedbackList.length})</span>
            </button>

            <a 
              href="mailto:info@isitecommand.com" 
              className="hidden xl:flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors font-mono"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>info@isitecommand.com</span>
            </a>
            <a 
              href="mailto:support@isitecommand.com" 
              className="hidden xl:flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors font-mono"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>support@isitecommand.com</span>
            </a>
            <a 
              href="mailto:subscribe@isitecommand.com" 
              className="hidden lg:flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition-colors font-mono"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>subscribe@isitecommand.com</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Patriotic Civil Construction Backdrop */}
      <section className="relative pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden rounded-3xl my-4 border border-slate-800 shadow-2xl">
        {/* Background Image Layer */}
        <div className="absolute inset-0 -z-20">
          <img 
            src={isitePatriotBg} 
            alt="U.S. Armed Forces Army Navy Air Force Marine Corps and Civil Earthwork Contractor Saluting American Flag on Jobsite" 
            className="w-full h-full object-cover object-center opacity-30 filter brightness-90 contrast-110"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Dark Gradient Overlay for High Contrast Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-slate-950/95 -z-10" />

        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold mb-6 shadow-xl backdrop-blur-md">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono tracking-wide">iSite Command: Taking Command and Control of your Earthwork Construction Project.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-6 font-display drop-shadow-md">
            WORK <span className="text-amber-400 underline decoration-amber-500/50 underline-offset-8">ON</span> YOUR BUSINESS — NOT JUST IN IT.
          </h1>

          <p className="text-lg text-slate-200 leading-relaxed font-sans mb-8 drop-shadow">
            iSite Command is far more than an earthwork estimator. It is a complete contractor operating system — unifying multi-phase bidding with live profit margin auditing, field HR & crew timecard payroll, subcontractor W-9/COI compliance, and custom white-label branding.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Multi-Phase Bidding
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> HR & Crew Payroll Timecards
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Markup vs Margin Audit
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Sub W-9 & COI Compliance
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Your Logo & White-Label
            </span>
          </div>

          {/* Interactive Video Tour & Patriotic Art Showcase Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowVideoTourModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-mono font-black text-xs px-5 py-2.5 rounded-xl shadow-xl transition-all animate-bounce"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Watch Interactive Video Tour with Audio & Pointer</span>
            </button>

            <button
              onClick={() => setShowArtModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
            >
              <span>🇺🇸 View High-Res Patriotic Hero Artwork</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Lead Capture Form Card */}
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Get Early Access & Subscriber Pricing</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Be the first earthwork contractor in your region to launch iSite Command with your custom logo and rate tables.
            </p>
          </div>

          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-6 text-center space-y-3"
            >
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">VIP Priority Access Registered!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thank you, <strong className="text-emerald-300">{formData.name}</strong> from <strong className="text-emerald-300">{formData.company}</strong>. We have logged your inquiry and reserved subscriber spot for your fleet.
              </p>
              <div className="p-3 bg-slate-950/60 rounded-lg text-[11px] font-mono text-slate-400 text-left space-y-1">
                <div>&bull; Subscriptions & Trials: <span className="text-sky-400 font-bold">subscribe@isitecommand.com</span></div>
                <div>&bull; Subscriber Support: <span className="text-emerald-400 font-bold">support@isitecommand.com</span></div>
                <div>&bull; General Inquiries: <span className="text-amber-400 font-bold">info@isitecommand.com</span></div>
                <div>&bull; Parent Entity: <span className="text-white">Select Property Solutions, LLC</span></div>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 underline font-mono"
              >
                Submit another inquiry
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. T.J. Darley"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company / Business Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Apex Dirtworks, LLC"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Business Email *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="you@yourcompany.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (Mobile/Office)</label>
                  <input 
                    type="tel" 
                    placeholder="(555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Active Employees (Payroll Headcount) *</label>
                  <select 
                    value={formData.activeEmployees}
                    onChange={(e) => setFormData({ ...formData, activeEmployees: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="1–3 Active Employees">1 – 3 Active Employees ($149/mo Starter)</option>
                    <option value="4–10 Active Employees">4 – 10 Active Employees ($299/mo Growth)</option>
                    <option value="11+ Active Employees">11+ Active Employees ($499/mo Enterprise)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Primary Interest</label>
                  <select 
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Estimating & Multi-Phase Bidding">Multi-Phase Earthwork Bidding</option>
                    <option value="White-Label Branding">Subscriber Custom Branding & Rates</option>
                    <option value="Profit & Margin Audit">Profit & Sensitivity Audit Matrix</option>
                    <option value="Field HR & Crew Timecards">Field HR & Crew Clock-In Timecards</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Claim Your 1 Free Full Estimate & Early Access</span>
              </button>

              <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-lg p-2.5 text-center space-y-1 font-mono">
                <span className="text-emerald-400 font-bold text-[11px] block flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 1 Free Full Project Estimate Included
                </span>
                <p className="text-[10px] text-slate-400">
                  Build and export 1 complete multi-phase earthwork estimate with custom branding before choosing a monthly subscription plan.
                </p>
              </div>

              <p className="text-[10px] text-slate-500 text-center font-mono">
                Direct Inquiry Routing: info@isitecommand.com &bull; Powered by Select Property Solutions, LLC
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Pricing & Subscription Tiers Section */}
      <section className="py-16 bg-slate-950 border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              Scalable Subscription Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-display mt-3">
              Simple, Predictable Pricing For Earthwork Contractors
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-mono">
              Start with <strong>1 Free Full Estimate</strong> — upgrade to a monthly plan based on your <strong>Active Employee Payroll Headcount</strong>. Cancel anytime with zero long-term lock-in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tier 1: Solo / Small Crew */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative hover:border-slate-700 transition-colors">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Starter / Small Crew</span>
                  <span className="bg-slate-800 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30 font-bold">1–3 Active Employees</span>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-black text-white">$149</span>
                  <span className="text-xs font-mono text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Perfect for independent owner-operators and small grading crews bidding residential site prep, land clearing, and pond excavations.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 font-sans border-t border-slate-800 pt-4">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-Phase Bidding Engine</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Live Markup vs Margin Sensitivity Matrix</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Custom White-Label Logo & Rate Tables</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Professional PDF Proposal Export</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 3 Active Payroll Employees</li>
                </ul>
              </div>
              <a
                href="#early-access-form"
                className="w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition-colors"
              >
                Claim 1 Free Estimate Trial
              </a>
            </div>

            {/* Tier 2: Growth Contractor (POPULAR) */}
            <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-amber-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-mono font-extrabold uppercase px-3 py-0.5 rounded-full shadow">
                Most Popular For Active Fleets
              </div>
              <div>
                <div className="flex justify-between items-center mb-2 mt-1">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">Growth Contractor</span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">4–10 Active Employees</span>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-black text-white">$299</span>
                  <span className="text-xs font-mono text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-300 mb-4">
                  Full contractor operating platform for growing earthmoving companies needing mobile field timecards and sub compliance.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200 font-sans border-t border-amber-500/30 pt-4">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Everything in Solo Starter Plan</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Mobile Crew HR & Payroll Timecards</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Fully Burdened Operator Cost Calculator</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Subcontractor 1099 W-9 & COI Compliance</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Direct ACH Bank Remittance Setup</li>
                </ul>
              </div>
              <a
                href="#early-access-form"
                className="w-full text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                Get Started With 1 Free Estimate
              </a>
            </div>

            {/* Tier 3: Enterprise Crew */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative hover:border-slate-700 transition-colors">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Enterprise Fleet</span>
                  <span className="bg-slate-800 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30 font-bold">11+ Active Employees</span>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-black text-white">$499</span>
                  <span className="text-xs font-mono text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Comprehensive enterprise command suite for large civil earthwork, roadbuilding, and multi-site excavation firms.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 font-sans border-t border-slate-800 pt-4">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Everything in Growth Contractor Plan</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited Active Payroll Employees</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-User Superintendent Mobile Logins</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Priority VIP Engineering Support</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Custom Domain Integration Assistance</li>
                </ul>
              </div>
              <a
                href="#early-access-form"
                className="w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition-colors"
              >
                Contact For Enterprise Access
              </a>
            </div>
          </div>

          {/* Active Employee Headcount Protection, Zero Financial Data Security & $10 Referral Program */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                    Active Headcount ACH Safeguard
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] font-mono px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                    Terminated Protection
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Subscription tiers are calculated strictly from <strong>Active Employees</strong> in your HR Payroll tab. Terminated, archived, or former workers stay in your historical records for tax compliance without triggering higher monthly ACH billing tier deductions.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                    Zero Financial Data Storage Security Mandate
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                    Direct Bank ACH
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>iSite Command NEVER collects, stores, or processes credit card numbers, bank logins, or PINs</strong>. All subscription payments occur out-of-band directly bank-to-bank via encrypted ACH transfers with unique client reference codes.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border-2 border-amber-400/80 rounded-2xl p-5 flex items-start gap-4 shadow-xl">
              <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300 shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                    $10 Contractor Referral Rewards
                  </span>
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase">
                    Earn $10 / Signup
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  <strong>Get a $10.00 credit for every verified contractor you refer!</strong> When a referred earthwork contractor completes their 1 Free Estimate Trial and upgrades to a paid plan, we credit $10.00 directly to your monthly subscription invoice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide">
              Why Earthwork Contractors Choose iSite Command
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              Designed by experienced excavators to eliminate guess-work and protect profit margins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Bulletproof Multi-Phase Bidding</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Break complex land development down into cleared acres, mass cut/fill, utility trenching, stone base compaction, and grassing with zero manual math errors.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Markup vs. Margin Sensitivity Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time internal ledger matrices display exact direct raw costs, gross markup dollars, and net margin percentages, flagging aggressive vs optimal profit zones instantly.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Tenant White-Labeling</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Subscribers input their own company logo, phone numbers, labor rates, and equipment haulage fees. Print professional client proposals in seconds under your own brand.
              </p>
            </div>
          </div>

          {/* Jobsite Pitfall Prevention & Live Digital Site Control Section */}
          <div className="mt-12 bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-1">
                <span className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Earthwork Contractor Pro-Tip & Site Health Standards</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                  Preventing Earthwork Jobsite Pitfalls With iSite Command
                </h3>
                <p className="text-xs text-slate-400 max-w-3xl">
                  Eliminate revenue leaks, unbilled cut/fill volumes, idle machine fuel waste, and field rework with standardized digital site tracking measures.
                </p>
              </div>
              <a
                href="#early-access-form"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl font-mono text-xs transition-all shadow-lg shrink-0"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Get 1 Free Trial Project Estimate</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1: Tech & Data */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white font-display">1. Tech & Data Usage</h4>
                    <span className="text-[10px] text-sky-400 font-mono font-semibold">Live Site Visibility</span>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Fleet Telematics:</strong> Monitor live idle time, fuel burn rates, and cycle times linked directly to equipment cost profiling.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Weekly Drone Scans:</strong> Compare autonomous 3D point cloud surface scans against original CAD baselines to track true cut/fill progress.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Daily Production Dashboard:</strong> Review daily CY/hr moved metrics every evening rather than waiting for weekly paper logs.</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 2: Machine & Materials */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white font-display">2. Machine & Materials</h4>
                    <span className="text-[10px] text-amber-400 font-mono font-semibold">Precision Dirt Control</span>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>3D GPS Grade Control:</strong> Feed 3D surface files into excavators & dozers to cut over-excavation by 95% and slash staking costs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Swell/Shrink Balancing:</strong> Apply dynamic soil bank-to-loose expansion coefficients to balance cut/fill and avoid surprise import/export bills.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Laser Stockpile Auditing:</strong> Measure topsoil, gravel, and crushed stone piles with laser 3D mesh scans instead of visual guessing.</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 3: Communication & Planning */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                    <HardHat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white font-display">3. Communication & Planning</h4>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">Instant Field-to-Office Sync</span>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Field Rock & Wet Soil Logs:</strong> Operators flag unexpected subsurface conditions with photos & GPS coordinates to issue immediate change orders.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Digital Proof-Rolling Audits:</strong> Log tandem dump truck proof-rolling passes digitally before stone base or paving to guarantee subgrade compliance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Crew Timecards & Sub Compliance:</strong> Mobile clock-in with geo-fencing ensuring actual field labor aligns with estimated project phases.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive iSite Command Promotional Abilities Directory */}
      <section className="py-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Promotional Capabilities Index</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-display mt-1">
                iSite Command Core Abilities & SaaS Modules
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                A complete breakdown of functional capabilities built into every subscriber copy of iSite Command for earthwork contractors, utility builders, and site developers.
              </p>
            </div>

            <button
              onClick={() => setShowCapabilitiesModal(true)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shrink-0"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Open Printable Feature Sheet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ability 1 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Module 01</span>
              </div>
              <h3 className="text-base font-bold text-white">1. Multi-Phase Earthwork Bidding</h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                <li><strong>Mass Cut & Fill Math:</strong> Auto-calculates yardages with customizable soil compaction shrinkage (10%-25%) and rock swell factors.</li>
                <li><strong>Trenching Geometry:</strong> Input pipe run lengths, top/bottom ditch widths, and bedding depths for exact cubic yards.</li>
                <li><strong>Line Item Breakdown:</strong> Clearing, grubbing, topsoil strip, stone base, and hydroseeding grassing sub-phases.</li>
              </ul>
            </div>

            {/* Ability 2 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded">Module 02</span>
              </div>
              <h3 className="text-base font-bold text-white">2. Markup vs. Margin Profit Safeguard</h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                <li><strong>Live Sensitivity Matrix:</strong> Displays exact Direct Raw Costs, Gross Profit Markup $, and True Net Profit Margin %.</li>
                <li><strong>Color-Coded Profit Zones:</strong> Low Margin Risk (&lt;15%), Optimal Competitive Zone (15%-28%), Premium Yield (&gt;28%).</li>
                <li><strong>Overhead Allocation:</strong> Tracks shop overhead coverage so indirect costs don't drain project profit.</li>
              </ul>
            </div>

            {/* Ability 3 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">Module 03</span>
              </div>
              <h3 className="text-base font-bold text-white">3. Multi-Tenant White-Labeling</h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                <li><strong>Subscriber Branding:</strong> Insert your company logo, phone numbers, email address, and estimator license ID instantly.</li>
                <li><strong>Custom Fleet Rate Tables:</strong> Save default operator hourly rates, heavy equipment burn fees, and stone per-ton rates.</li>
                <li><strong>Dual Proposal Output:</strong> Generate formal Client Proposals or detailed internal Office Audit Copies with 1-click PDF print.</li>
              </ul>
            </div>

            {/* Ability 4 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <HardHat className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Module 04</span>
              </div>
              <h3 className="text-base font-bold text-white">4. Field HR, Payroll & Sub Compliance</h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                <li><strong>Mobile HR & Crew Timecards:</strong> Digital field clock-in portal for machine operators, dump truck drivers, and labor crews with job-costed time logs for payroll export.</li>
                <li><strong>Fully Burdened Labor Rates:</strong> Calculates base pay, workers' comp insurance, payroll taxes, and benefits into true hourly operator costs.</li>
                <li><strong>Subcontractor 1099 Work Orders:</strong> Generates dedicated 1099 Work Orders with mandatory W-9 tax and Certificate of Insurance (COI) verification before dispatch.</li>
              </ul>
            </div>

            {/* Ability 5 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Module 05</span>
              </div>
              <h3 className="text-base font-bold text-white">5. Client Lead Gen & QR Pass</h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                <li><strong>Educational Tip Campaign:</strong> Ready-to-publish social ad graphics and captions ("Work ON it—not just IN it").</li>
                <li><strong>Jobsite QR Code Generator:</strong> Instant mobile QR pass for trailer doors, truck decals, and proposal covers.</li>
                <li><strong>Lead Conversion Form:</strong> Early access signup engine routing inquiries directly to subscribe@isitecommand.com.</li>
              </ul>
            </div>

            {/* Ability 6 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-300 px-2 py-0.5 rounded">Module 06</span>
              </div>
              <h3 className="text-base font-bold text-white">6. Legal Shield & Criticism Audit</h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-sans">
                <li><strong>Contractor Liability Shield:</strong> Built-in legal disclaimer policy establishing contractor calculation responsibility.</li>
                <li><strong>Criticism & Feedback Repository:</strong> Dedicated contractor channel for logging formula checks, bug reports, and suggestions.</li>
                <li><strong>Select Property Solutions Shield:</strong> Protects software provider while empowering excavators with audit trails.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Earthwork Contractor Tip Marketing Campaign Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-amber-400 text-xs font-mono uppercase tracking-widest font-bold">Marketing & Lead Gen Engine</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display mt-1">
              "Earthwork Contractor Tip" Social Campaign Cards
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Use these battle-tested educational graphics and social captions to build anticipation, attract contractor subscribers, and convert leads.
            </p>
          </div>

          <a 
            href="mailto:subscribe@isitecommand.com?subject=Contractor%20Tip%20Campaign%20Request"
            className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3.5 py-2 rounded-lg hover:bg-amber-900/60 transition-colors self-start md:self-auto"
          >
            <Share2 className="w-4 h-4" />
            <span>Request Full Ad Package</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {contractorTips.map((tip, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded-md font-bold">
                    {tip.badge}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">iSite Command Educational</span>
                </div>

                <h3 className="text-lg font-extrabold text-white leading-snug">{tip.title}</h3>
                <p className="text-xs text-amber-400/90 font-mono mb-4">{tip.subtitle}</p>

                <ul className="space-y-2 mb-4">
                  {tip.points.map((pt, pIdx) => (
                    <li key={pIdx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-amber-400 font-bold font-mono text-[11px]">&bull;</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-slate-950 border-l-2 border-amber-500 p-3 rounded-r-lg mb-4">
                  <p className="text-[11px] font-bold text-white italic">"{tip.quote}"</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Copy Ready Caption:</span>
                  <button
                    onClick={() => copyCaption(tip.caption, idx)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {copiedTipIndex === idx ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Post Text</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-400 line-clamp-3 font-mono bg-slate-950 p-2 rounded border border-slate-800/80">
                  {tip.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contractor Calculation Responsibility Disclaimer Banner */}
      <section className="py-8 bg-slate-900/90 border-y border-amber-500/30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                  Contractor Calculation Responsibility & Liability Shield
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/40">
                  Legal Safeguard
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-4xl">
                Notice: All calculations, soil compaction factors, heavy fleet fuel-burn formulas, and unit rate pricing generated by iSite Command serve as estimation assistance models. <strong>Subscribing Contractors are solely and strictly responsible for independently verifying all field dimensions, cut/fill yardages, subcontractor quotes, and proposal totals prior to submitting bids.</strong> Select Property Solutions, LLC assumes no financial liability for bidding inaccuracies or project cost variances.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDisclaimerModal(true)}
            className="shrink-0 bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-500/40 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors"
          >
            Read Full Disclaimer Policy
          </button>
        </div>
      </section>

      {/* Contractor Feedback & Criticism Repository Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-bold tracking-wider">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Contractor Communication Channel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display mt-1">
              Feedback, Criticisms & Discrepancy Repository
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Help us sharpen iSite Command. Submit comments, formula criticisms, or feature requests directly to our software engineering team.
            </p>
          </div>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all font-mono"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Submit Feedback / Criticism</span>
          </button>
        </div>

        {/* Live Feedback Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feedbackList.slice(0, 3).map((fb) => (
            <div key={fb.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    fb.category === 'Criticism / Discrepancy' 
                      ? 'bg-red-950/80 text-red-400 border border-red-800' 
                      : fb.category === 'Calculation Formula Check'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      : 'bg-sky-950/80 text-sky-400 border border-sky-800'
                  }`}>
                    {fb.category}
                  </span>
                  <span className="text-slate-500">{fb.id}</span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{fb.subject}</h4>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-slate-950 p-2.5 rounded border border-slate-800/80">
                  "{fb.details}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div>
                  <span className="text-white font-bold">{fb.contractorName}</span>
                  <div className="text-[10px] text-slate-500">{fb.companyName}</div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: fb.rating }).map((_, r) => (
                    <Star key={r} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer & Contact Options */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                iS
              </div>
              <span className="font-bold text-lg text-white">iSite Command</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Intelligent Earthwork Bidding & Operations Software. Standalone subscriber copies powered by Select Property Solutions, LLC.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              &copy; 2026 Select Property Solutions, LLC. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-3">Inquiry & Support Channels</h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <a href="mailto:info@isitecommand.com" className="hover:text-white transition-colors">
                  info@isitecommand.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <a href="mailto:support@isitecommand.com" className="hover:text-white transition-colors">
                  support@isitecommand.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <a href="mailto:subscribe@isitecommand.com" className="hover:text-white transition-colors">
                  subscribe@isitecommand.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-emerald-400">
                <Phone className="w-3.5 h-3.5" />
                <span>Google Voice Line Integrated</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono mb-3">Low-Cost Launch Setup</h4>
            <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
              <p>1. Domain forwarding for <strong className="text-amber-400">isitecommand.com</strong></p>
              <p>2. Direct lead forwarding to <strong className="text-white">subscribe@isitecommand.com</strong></p>
              <p>3. Google Voice phone line routed directly to mobile device</p>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL 1: Full Contractor Calculation Liability Disclaimer Policy */}
      <AnimatePresence>
        {showDisclaimerModal && (
          <div 
            onClick={() => setShowDisclaimerModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto text-slate-200 my-auto cursor-default"
            >
              <button
                onClick={() => setShowDisclaimerModal(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-md flex items-center gap-1 text-xs font-mono font-bold"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 pr-16">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">Contractor Liability & Calculation Disclaimer</h3>
                  <p className="text-xs text-amber-400 font-mono">Select Property Solutions, LLC / iSite Command</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans border-t border-b border-slate-800 py-4">
                <div className="bg-amber-950/50 border-l-4 border-amber-500 p-3 rounded-r text-amber-200 font-mono text-[11px]">
                  <strong>CRITICAL ESTIMATING STATEMENT:</strong> All mathematical formulas, soil compaction shrinkage rates, equipment production cycle times, fuel burn rates, and unit pricing calculations contained in iSite Command are provided strictly for estimation and operational planning assistance.
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide font-mono mb-1">1. Sole Contractor Responsibility</h4>
                  <p>
                    The subscribing Contractor, estimator, or authorized representative is solely and exclusively responsible for independently auditing, verifying, and approving all site dimensions, topographic contours, cut/fill quantities, soil conditions, subcontractor quotes, and proposal prices prior to submitting bids or executing contracts with project owners or general contractors.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide font-mono mb-1">2. No Financial Liability Guarantee</h4>
                  <p>
                    Neither Select Property Solutions, LLC, iSite Command, nor their officers, developers, or affiliates shall be held financially liable for any bidding underestimations, mathematical variances, unforeseen site rock/water conditions, material price surges, labor overruns, or project financial losses incurred by the Contractor.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wide font-mono mb-1">3. Field Condition Verification</h4>
                  <p>
                    All earthwork estimating models assume standard soil workability. Contractors are required to perform field site walks, verify utility locates via 811, inspect subsurface geotechnical reports, and confirm equipment access routes independently.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-emerald-400 text-sm uppercase tracking-wide font-mono mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>4. Zero Financial Data Storage & Data Breach Liability Protection</span>
                  </h4>
                  <p className="text-slate-300">
                    To eliminate cybersecurity vulnerabilities and hacking risks, <strong>iSite Command and Select Property Solutions, LLC do NOT collect, store, process, or transmit credit card details, bank account logins, SSNs, or sensitive client financial credentials inside the application database</strong>. All subscription billing and client invoice remittances occur out-of-band directly between banking institutions via encrypted ACH or Wire transfer. Subscribing Contractors, their clients, and Select Property Solutions, LLC are hereby fully exempt from financial data breach liabilities associated with in-app payment processing.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDisclaimerModal(false)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs font-mono transition-colors"
                >
                  I Understand & Acknowledge Terms
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Contractor Feedback & Criticism Repository */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div 
            onClick={() => setShowFeedbackModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto text-slate-200 my-auto cursor-default"
            >
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-md flex items-center gap-1 text-xs font-mono font-bold"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Contractor Feedback & Criticism Repository</h3>
                    <p className="text-xs text-slate-400 font-mono">Submit Comments, Discrepancies & Calculation Audits</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Total Logged:</span>
                  <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                    {feedbackList.length} Items
                  </span>
                </div>
              </div>

              {/* Feedback Form */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Submit New Feedback / Criticism Entry</span>
                </h4>

                {feedbackSubmitted ? (
                  <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-mono flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <strong>Feedback Logged & Routed!</strong> Your entry has been saved to the repository and routed to <span className="underline">info@isitecommand.com</span>.
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Contractor / Your Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Mark Stephens"
                          value={newFeedback.contractorName}
                          onChange={(e) => setNewFeedback({ ...newFeedback, contractorName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Company / Business *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Stephens Dirtworks, LLC"
                          value={newFeedback.companyName}
                          onChange={(e) => setNewFeedback({ ...newFeedback, companyName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Business Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="you@company.com"
                          value={newFeedback.email}
                          onChange={(e) => setNewFeedback({ ...newFeedback, email: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Feedback Category *</label>
                        <select
                          value={newFeedback.category}
                          onChange={(e) => setNewFeedback({ ...newFeedback, category: e.target.value as FeedbackEntry['category'] })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="Criticism / Discrepancy">Criticism / Discrepancy</option>
                          <option value="Calculation Formula Check">Calculation Formula Check</option>
                          <option value="Feature Request">Feature Request</option>
                          <option value="Bug Report">Bug Report</option>
                          <option value="General Feedback">General Feedback</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Rating (1 to 5 Stars)</label>
                        <select
                          value={newFeedback.rating}
                          onChange={(e) => setNewFeedback({ ...newFeedback, rating: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value={5}>5 Stars - Excellent Software</option>
                          <option value={4}>4 Stars - Solid Performance</option>
                          <option value={3}>3 Stars - Needs Formula Tweak</option>
                          <option value={2}>2 Stars - Substantial Criticism</option>
                          <option value={1}>1 Star - Serious Discrepancy</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Topic / Subject Title</label>
                        <input
                          type="text"
                          placeholder="Brief title..."
                          value={newFeedback.subject}
                          onChange={(e) => setNewFeedback({ ...newFeedback, subject: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Detailed Comment, Formula Criticism, or Feedback *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe your calculation observation, site rate suggestion, or software feedback in detail..."
                        value={newFeedback.details}
                        onChange={(e) => setNewFeedback({ ...newFeedback, details: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-600"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Log Feedback Entry</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Saved Feedback List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-300">Logged Contractor Submissions:</span>
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={feedbackCategoryFilter}
                      onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[11px]"
                    >
                      <option value="All">All Categories</option>
                      <option value="Criticism / Discrepancy">Criticisms Only</option>
                      <option value="Calculation Formula Check">Calculation Checks</option>
                      <option value="Feature Request">Feature Requests</option>
                      <option value="Bug Report">Bug Reports</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {feedbackList
                    .filter(item => feedbackCategoryFilter === 'All' || item.category === feedbackCategoryFilter)
                    .map((item) => (
                      <div key={item.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold">{item.id}</span>
                            <span className="text-slate-500">&bull;</span>
                            <span className="text-slate-400">{item.timestamp}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.category === 'Criticism / Discrepancy'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : 'bg-slate-900 text-sky-400 border border-sky-800'
                            }`}>
                              {item.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex text-amber-400">
                              {Array.from({ length: item.rating }).map((_, r) => (
                                <Star key={r} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                            <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded text-[10px]">
                              {item.status}
                            </span>
                          </div>
                        </div>

                        <h5 className="text-xs font-bold text-white">{item.subject}</h5>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800">
                          {item.details}
                        </p>

                        <div className="text-[10.5px] text-slate-500 font-mono flex items-center justify-between pt-1">
                          <span>Submitted by: <strong className="text-slate-300">{item.contractorName}</strong> ({item.companyName})</span>
                          <a href={`mailto:${item.email}`} className="text-amber-400 hover:underline">{item.email}</a>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Mobile QR Code Access Pass */}
      <AnimatePresence>
        {showQrModal && (
          <div 
            onClick={() => setShowQrModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto text-slate-200 my-auto cursor-default"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-md flex items-center gap-1 text-xs font-mono font-bold z-10"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4 pr-16">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">iSite Command Mobile Pass</h3>
                  <p className="text-xs text-amber-400 font-mono">Instant Field Access & Jobsite QR Code</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Scan this QR code using any smartphone camera to instantly launch <strong>iSite Command</strong> on your mobile phone or tablet on the job site.
                </p>

                {/* Styled QR Code Box */}
                <div className="bg-white p-6 rounded-2xl inline-block shadow-xl border-4 border-amber-500/80 relative group">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent('https://isitecommand.com#isite-command')}&color=0f172a&bgcolor=ffffff`}
                    alt="iSite Command Mobile QR Code"
                    className="w-48 h-48 mx-auto object-contain"
                  />
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-900 font-black tracking-wider uppercase">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>iSite Command SaaS Pass</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Direct Mobile URL:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://isitecommand.com#isite-command');
                        setCopiedQrLink(true);
                        setTimeout(() => setCopiedQrLink(false), 2000);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      {copiedQrLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedQrLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-amber-300 break-all bg-slate-900 p-2 rounded border border-slate-800/80">
                    https://isitecommand.com#isite-command
                  </div>
                </div>

                <div className="text-left space-y-2 text-[11px] text-slate-400 font-mono bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <strong className="text-white block font-sans text-xs">Why use QR Codes for iSite Command?</strong>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-300 font-sans">
                    <li><strong>Printed Proposal Verification:</strong> Attach to client PDFs so general contractors & site owners can verify bids instantly.</li>
                    <li><strong>Trucks & Equipment Trailers:</strong> Display on job site trailers so field superintendents can log daily crew hours and cut/fill loads.</li>
                    <li><strong>White-Label Customization:</strong> Subscribing contractors get their own dedicated QR code linked directly to their branded instance.</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowQrModal(false)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs font-mono transition-colors"
                >
                  Close Pass Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Promotional Capabilities & Feature Overview Sheet */}
      <AnimatePresence>
        {showCapabilitiesModal && (
          <div 
            onClick={() => setShowCapabilitiesModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto text-slate-200 my-auto cursor-default"
            >
              <button
                onClick={() => setShowCapabilitiesModal(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-md flex items-center gap-1 text-xs font-mono font-bold z-10"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-display">iSite Command Promotional Feature Sheet</h3>
                    <p className="text-xs text-amber-400 font-mono">Select Property Solutions, LLC / SaaS Subscriber Flyer</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = `iSite Command - Earthwork Estimating & Operations SaaS\n` +
                        `-----------------------------------------------------\n` +
                        `1. Multi-Phase Earthwork Bidding Engine (Mass cut/fill, compaction shrink %, trenching V-ditches, stone base)\n` +
                        `2. Live Markup vs Net Margin Sensitivity Audit Matrix (Profit / Cost vs Profit / Price, 15%-28% sweet spot)\n` +
                        `3. Multi-Tenant White-Labeling (Insert contractor logo, custom fleet rate tables, phone, address)\n` +
                        `4. HR, Payroll & Sub Compliance (Mobile crew timecards, job-costed payroll export, labor burden rates, W-9 & COI verification)\n` +
                        `5. Contractor Lead Generation Engine ("Earthwork Contractor Tip" campaign & mobile QR pass)\n` +
                        `6. Contractor Legal Liability Shield & Criticism Repository\n\n` +
                        `Contact: info@isitecommand.com | subscribe@isitecommand.com\n` +
                        `Powered by Select Property Solutions, LLC`;
                      navigator.clipboard.writeText(text);
                      setCopiedCapList(true);
                      setTimeout(() => setCopiedCapList(false), 2000);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                  >
                    {copiedCapList ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCapList ? 'Copied Text!' : 'Copy Summary'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Flyer</span>
                  </button>
                </div>
              </div>

              {/* Printable Content Block */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6 text-slate-200">
                <div className="border-b border-slate-800 pb-4 text-center space-y-1">
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold border border-amber-500/30">
                    SaaS Promotional Capabilities Sheet
                  </span>
                  <h2 className="text-2xl font-black text-white font-display uppercase tracking-wide">
                    ISITE COMMAND &trade;
                  </h2>
                  <p className="text-xs text-amber-400 font-mono">
                    Intelligent Site Command for Heavy Civil & Earthwork Contractors
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-amber-400 font-mono text-xs uppercase flex items-center gap-1.5">
                      <Calculator className="w-4 h-4" />
                      <span>01. Multi-Phase Estimating</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Calculates mass cut/fill yards with soil compaction shrinkage factors, trench excavation V-ditches, aggregate base tonnage, hydroseeding, and equipment fuel burn.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-sky-400 font-mono text-xs uppercase flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>02. Profit Audit Matrix</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Live dual audit comparing dollar <strong>Markup</strong> vs true percentage <strong>Net Margin</strong>. Instantly flags risk zones (&lt;15%) vs optimal competitive yield (15%–28%).
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-emerald-400 font-mono text-xs uppercase flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      <span>03. Multi-Tenant White-Label</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Subscribers insert contractor branding, logos, custom hourly labor & fleet rates. Generate formal Client Proposals or detailed internal Office Audit Copies.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-purple-400 font-mono text-xs uppercase flex items-center gap-1.5">
                      <HardHat className="w-4 h-4" />
                      <span>04. HR, Payroll & Sub Compliance</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Digital crew timecards with job-costed payroll export, fully burdened labor rate calculations, pre-op safety logs, and 1099 Subcontractor W-9 & COI compliance.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-amber-400 font-mono text-xs uppercase flex items-center gap-1.5">
                      <Share2 className="w-4 h-4" />
                      <span>05. Lead Gen & QR Mobile Pass</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      High-converting "Earthwork Contractor Tip" educational social graphics, copyable ad text, and instant job site trailer QR code passes.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-1.5">
                    <h4 className="font-bold text-red-400 font-mono text-xs uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>06. Legal Shield & Criticism Audit</span>
                    </h4>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Contractor calculation responsibility disclaimer policies and built-in feedback repository for logging formula checks and software suggestions.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
                  <span>Inquiries & Subscription: <strong className="text-white">subscribe@isitecommand.com</strong></span>
                  <span>Parent Entity: <strong className="text-amber-400">Select Property Solutions, LLC</strong></span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCapabilitiesModal(false)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs font-mono transition-colors"
                >
                  Close Feature Sheet
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* High-Res Official Brand Logo Lightbox Modal */}
        {showLogoModal && (
          <div 
            onClick={() => setShowLogoModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/50 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto cursor-default relative"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 pr-12">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-display">
                      Official iSite Command Brand Emblem
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      3D Gold Feather Quill Crossed with Gold Lightning Bolt over Industrial Steel Medallion
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoModal(false)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-md flex items-center gap-1 text-xs font-mono font-bold"
                >
                  <span>Close</span>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-4 overflow-y-auto flex-1 rounded-2xl border border-amber-500/30 bg-slate-950 p-4 flex flex-col items-center justify-center gap-4">
                <div className="relative group max-w-md w-full aspect-square rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-500/20">
                  <img
                    src={isiteGoldLogo}
                    alt="iSite Command Official Brand Logo - Gold Quill & Lightning Bolt Emblem"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={isiteGoldLogo}
                      download="iSite_Command_Official_Gold_Emblem.jpg"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs font-mono shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <Download className="w-4 h-4" />
                      <span>Click to Save High-Res File</span>
                    </a>
                  </div>
                </div>

                <div className="text-center max-w-md space-y-1">
                  <p className="text-xs font-mono text-amber-300 font-bold">
                    Official Brand Symbolism:
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    <strong>Gold Lightning Bolt</strong> = High-Speed Earthwork Calculations & Field Productivity.<br/>
                    <strong>Gold Feather Quill</strong> = Legal Proposal Precision, Contract Integrity & Accuracy.<br/>
                    <strong>Industrial Steel Medallion</strong> = Heavy Equipment Construction Authority.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3">
                <span className="text-[11px] text-slate-400">Select Property Solutions, LLC — Official SaaS Brand Asset</span>
                <div className="flex items-center gap-2">
                  <a
                    href={isiteGoldLogo}
                    download="iSite_Command_Official_Gold_Emblem.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image (JPG)</span>
                  </a>
                  <button
                    onClick={() => setShowLogoModal(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition-colors border border-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* High-Res Patriotic Hero Artwork Lightbox Modal */}
        {showArtModal && (
          <div 
            onClick={() => setShowArtModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto cursor-default relative"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 pr-12">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇺🇸</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-display">
                      iSite Command Patriotic Hero Background
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      U.S. Armed Forces (Army, Navy, Air Force, Marine Corps) & Civil Earthwork Contractor Saluting American Flag
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowArtModal(false)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-md flex items-center gap-1 text-xs font-mono font-bold"
                >
                  <span>Close</span>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-4 overflow-y-auto flex-1 rounded-2xl border border-slate-800 bg-slate-950 p-2 flex items-center justify-center">
                <img
                  src={isitePatriotBg}
                  alt="U.S. Armed Forces Army Navy Air Force Marine Corps and Civil Contractor Saluting American Flag on Earthwork Construction Jobsite"
                  className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Honoring American Service Members & Hardworking Infrastructure Builders</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={isitePatriotBg}
                    download="iSite_Command_Patriotic_Hero.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JPG Image</span>
                  </a>
                  <button
                    onClick={() => setShowArtModal(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs font-mono transition-colors border border-slate-700"
                  >
                    Close Showcase
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Interactive Regional Static Ad Poster Generator Modal */}
        {showStaticAdModal && (
          <div 
            onClick={() => setShowStaticAdModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/50 rounded-2xl sm:rounded-3xl max-w-5xl w-full p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto cursor-default relative"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-800 pr-12">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-display flex flex-wrap items-center gap-2">
                      <span>iSite Command Regional Static Ad & Poster Generator</span>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                        Official Marketing Asset
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Generate, preview, copy social ad copy, and download print-ready promotional posters with your official logo.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStaticAdModal(false)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-md flex items-center gap-1 text-xs font-mono font-bold"
                >
                  <span>Close</span>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body: Controls & Live Ad Preview Canvas */}
              <div className="my-4 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pr-1">
                {/* Control Panel (5 cols) */}
                <div className="lg:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Ad Configuration Controls</span>
                  </h4>

                  {/* Target Region Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Target Region / Launch Market</label>
                    <select
                      value={adRegion}
                      onChange={(e) => setAdRegion(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Middle Georgia & Southeast Earthwork Contractors">Middle Georgia & Southeast Earthwork Contractors</option>
                      <option value="Texas & Gulf Coast Earthwork Operators">Texas & Gulf Coast Earthwork Operators</option>
                      <option value="Midwest Site Prep & Excavation Contractors">Midwest Site Prep & Excavation Contractors</option>
                      <option value="Carolinas & East Coast Earthwork Crews">Carolinas & East Coast Earthwork Crews</option>
                      <option value="Nationwide Contractor Launch Rollout">Nationwide Contractor Launch Rollout</option>
                      <option value="Custom">Custom Region Name...</option>
                    </select>

                    {adRegion === 'Custom' && (
                      <input
                        type="text"
                        placeholder="Enter custom region e.g. North Florida Excavators"
                        value={customRegion}
                        onChange={(e) => setCustomRegion(e.target.value)}
                        className="w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    )}
                  </div>

                  {/* Theme Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Visual Aesthetic Preset</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setAdTheme('dark')}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                          adTheme === 'dark' 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        ⚡ Industrial Steel
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdTheme('yellow')}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                          adTheme === 'yellow' 
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        ⚠️ Jobsite Caution
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdTheme('patriot')}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                          adTheme === 'patriot' 
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        🇺🇸 Patriot Flag
                      </button>
                    </div>
                  </div>

                  {/* Feature Checkboxes */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 block">Featured Capabilities on Ad</label>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {[
                        'Multi-Phase Bidding Engine & Custom Rate Tables',
                        'Profit Sensitivity Ledger (Markup vs Margin Audit)',
                        'White-Label Subscriber Custom Branding (Your Logo)',
                        'Mobile Crew Clock-In & Geo-Fenced Timecards (Tier 2)',
                        'CAD Blueprint & PDF Site Plan Interpreter (Tier 3)',
                        'Drone Photogrammetry & Stockpile Volume Audits (Tier 4)',
                        'Zero Financial Data Storage ACH Billing Security'
                      ].map((feat) => {
                        const checked = selectedAdFeatures.includes(feat);
                        return (
                          <label key={feat} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer bg-slate-900 p-2 rounded-lg border border-slate-800 hover:border-slate-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setSelectedAdFeatures(selectedAdFeatures.filter(f => f !== feat));
                                } else {
                                  setSelectedAdFeatures([...selectedAdFeatures, feat]);
                                }
                              }}
                              className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                            />
                            <span className="truncate">{feat}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Copy Social Ad Copy Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const activeReg = adRegion === 'Custom' ? (customRegion || 'Your Local Area') : adRegion;
                      const text = `🚨 ATTENTION EARTHWORK CONTRACTORS & EXCAVATORS IN ${activeReg.toUpperCase()}! 🚨\n\nTake Command and Control of your Earthwork Construction Projects with iSite Command! 🚜⚡\n\n🔥 RICH FEATURES NOW AVAILABLE & COMING SOON TO YOUR AREA:\n${selectedAdFeatures.map(f => `✅ ${f}`).join('\n')}\n\n🎁 SPECIAL INTRODUCTORY OFFER:\nGet 1 FREE Full Project Estimate with your company's logo & custom labor/equipment rates!\n\n💰 Plans start at just $149/mo (Tier 1 Core Estimator) based on Active Payroll Headcount — zero contracts, cancel anytime!\n\n📩 Claim your spot today:\nEmail: subscribe@isitecommand.com | info@isitecommand.com\nPowered by Select Property Solutions, LLC\n\n#EarthworkContractors #Excavation #DronePhotogrammetry #ConstructionTech #iSiteCommand #HeavyEquipment`;
                      navigator.clipboard.writeText(text);
                      setCopiedAdText(true);
                      setTimeout(() => setCopiedAdText(false), 2500);
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedAdText ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Social Media Ad Copy Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-amber-400" />
                        <span>Copy Post Text (FB / LinkedIn / Email)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live Static Ad Poster Canvas Preview (7 cols) */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center">
                  <div 
                    id="isite-static-ad-canvas"
                    className={`w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden border-2 flex flex-col justify-between space-y-5 transition-all ${
                      adTheme === 'yellow'
                        ? 'bg-slate-950 border-yellow-500 shadow-yellow-500/20'
                        : adTheme === 'patriot'
                        ? 'bg-slate-950 border-blue-500/80 shadow-blue-500/20'
                        : 'bg-slate-950 border-amber-500/60 shadow-amber-500/20'
                    }`}
                  >
                    {/* Background Subtle Gradient Glow */}
                    <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
                      adTheme === 'yellow' ? 'bg-yellow-500/10' : adTheme === 'patriot' ? 'bg-blue-500/15' : 'bg-amber-500/15'
                    }`} />

                    {/* Top Ad Announcement Bar */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        adTheme === 'yellow'
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                          : adTheme === 'patriot'
                          ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        📢 OFFICIAL COMMERCIAL ANNOUNCEMENT
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        EST. 2024
                      </span>
                    </div>

                    {/* Header Logo & Main Headline */}
                    <div className="space-y-3 text-center">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-900 border-2 border-amber-500/50 p-1 shadow-2xl shadow-amber-500/20 overflow-hidden">
                        <img 
                          src={isiteGoldLogo} 
                          alt="iSite Command Official Brand Emblem" 
                          className="w-full h-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display uppercase leading-none">
                          iSITE COMMAND
                        </h2>
                        <p className={`text-xs font-mono font-bold mt-1 uppercase ${
                          adTheme === 'yellow' ? 'text-yellow-400' : adTheme === 'patriot' ? 'text-blue-400' : 'text-amber-400'
                        }`}>
                          "Taking Command and Control of your Earthwork Construction Project"
                        </p>
                      </div>

                      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
                        <h3 className="text-sm font-black text-white font-display uppercase">
                          REVOLUTIONARY EARTHWORK SOFTWARE IS COMING TO YOUR AREA SOON!
                        </h3>
                        <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                          Now Launching for Contractors in: <strong className="text-white underline">{adRegion === 'Custom' ? (customRegion || 'Your Region') : adRegion}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                        Power-Packed Contractor System Capabilities:
                      </span>
                      <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-200">
                        {selectedAdFeatures.map((feat) => (
                          <li key={feat} className="flex items-center gap-2 text-[11px]">
                            <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${
                              adTheme === 'yellow' ? 'text-yellow-400' : adTheme === 'patriot' ? 'text-blue-400' : 'text-emerald-400'
                            }`} />
                            <span className="truncate">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Special Introductory Offer Box */}
                    <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/50 p-3.5 rounded-2xl text-center space-y-1">
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 uppercase">
                        🎁 FREE TRIAL INTRO OFFER
                      </span>
                      <h4 className="text-xs font-bold text-white font-display">
                        Includes 1 FREE Full Project Estimate with Your Custom Branding!
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Tier 1 Core Estimator starts at $149/mo &bull; Based on Active Employee Payroll &bull; Zero Contracts
                      </p>
                    </div>

                    {/* Footer Contact Info */}
                    <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-400 gap-1">
                      <div>
                        Inquiries: <span className="text-amber-400 font-bold">subscribe@isitecommand.com</span>
                      </div>
                      <div>
                        Select Property Solutions, LLC
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-3">
                <span className="text-[11px] text-slate-400">Official iSite Command Regional Launch Asset Generator</span>
                <div className="flex items-center gap-2">
                  <a
                    href={isiteGoldLogo}
                    download={`iSite_Command_Regional_Ad_${adTheme}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Poster Logo Asset</span>
                  </a>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2.5 rounded-xl text-xs font-mono transition-colors border border-slate-700 flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print Flyer</span>
                  </button>
                  <button
                    onClick={() => setShowStaticAdModal(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs font-mono transition-colors border border-slate-700"
                  >
                    Close Generator
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL 5: Interactive Video Tour & Demo Simulator with Voice & Pointer Finger */}
        {showVideoTourModal && (
          <div 
            onClick={() => setShowVideoTourModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/50 rounded-2xl sm:rounded-3xl max-w-6xl w-full p-2 sm:p-4 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] my-auto cursor-default relative"
            >
              <InteractiveVideoTour onClose={() => setShowVideoTourModal(false)} isEmbedded={true} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
