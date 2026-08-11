import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  CheckCircle2,
  Sparkles,
  Layers,
  TrendingUp,
  Building2,
  Users,
  FileText,
  Compass,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  Info,
  Maximize2,
  Award,
  Megaphone,
  Home
} from 'lucide-react';

interface TourStep {
  title: string;
  subtitle: string;
  narration: string;
  targetX: number; // percentage on canvas (0-100)
  targetY: number; // percentage on canvas (0-100)
  actionType: 'click' | 'type' | 'drag' | 'scan' | 'highlight';
  actionLabel: string;
  simulatedValue?: string;
  durationMs: number;
}

interface TourModule {
  id: string;
  title: string;
  badge: string;
  icon: any;
  color: string;
  summary: string;
  steps: TourStep[];
}

interface InteractiveVideoTourProps {
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const TOUR_MODULES: TourModule[] = [
  {
    id: 'navigation-guide',
    title: '0. How To Navigate & Find Multi-Phase Estimator',
    badge: 'App Navigation Map',
    icon: Home,
    color: 'from-sky-500 to-blue-600',
    summary: 'Master the top navigation bar to access the Multi-Phase Estimator, Office Hub, and iSite Command SaaS.',
    steps: [
      {
        title: 'Finding the Multi-Phase Takeoff Bid Estimator',
        subtitle: 'Located directly in the top dark navigation bar',
        narration: 'To launch the Multi-Phase Earthwork Estimator at any time, click "Takeoff Bid Estimator" in the top navigation bar. When prompted for Office Staff Passcode, enter 2026 to unlock full bidding tools.',
        targetX: 50,
        targetY: 10,
        actionType: 'click',
        actionLabel: 'Clicking "Takeoff Bid Estimator" (Passcode 2026)',
        simulatedValue: '#multi-phase-bid',
        durationMs: 8500
      },
      {
        title: 'Switching to Office Hub & Automation Dashboard',
        subtitle: 'Office Staff Passcode 2026 unlocks internal tools',
        narration: 'Click "Office Hub" in the top header to view client proposals, sensitivity ledger audits, and floating AI assistant tools.',
        targetX: 62,
        targetY: 10,
        actionType: 'click',
        actionLabel: 'Clicking "Office Hub" (Passcode 2026)',
        simulatedValue: '#automation-hub',
        durationMs: 8000
      },
      {
        title: 'iSite Command SaaS & Commercial Switcher',
        subtitle: 'Toggle between TJD Construction and iSite Command subscriber portal',
        narration: 'Use the gold "iSite Command" button in the top right header to view subscriber capabilities, or use the Commercial/Residential pill switcher to flip earthwork divisions.',
        targetX: 78,
        targetY: 10,
        actionType: 'highlight',
        actionLabel: 'Highlighting "iSite Command" SaaS Tab',
        simulatedValue: '#isite-command',
        durationMs: 8000
      }
    ]
  },
  {
    id: 'estimating',
    title: '1. Multi-Phase Earthwork Estimator',
    badge: 'Tier 1 Core',
    icon: Layers,
    color: 'from-amber-500 to-amber-600',
    summary: 'Calculate excavation, grading, embankment, and hauling costs with custom production rates.',
    steps: [
      {
        title: 'Project Setup & Site Parameters',
        subtitle: 'Inputting cut/fill quantities and soil swell factors',
        narration: 'Welcome to the iSite Command Multi-Phase Estimator. Here contractors select soil type, compaction swell factors, and hauling distance to build a precision earthwork bid.',
        targetX: 25,
        targetY: 30,
        actionType: 'type',
        actionLabel: 'Entering 45,000 CY Cut / 38,000 CY Fill',
        simulatedValue: '45,000 CY Cut',
        durationMs: 7500
      },
      {
        title: 'Equipment Production Rates',
        subtitle: 'Applying scraper, excavator, and articulated dump truck cycle times',
        narration: 'Next, the system automatically applies your fleet production rates. Adjust fuel burn rates and operator hourly wages in real time.',
        targetX: 60,
        targetY: 45,
        actionType: 'click',
        actionLabel: 'Selecting CAT 349 Excavator & Fleet Batch',
        simulatedValue: '$185.00/hr fleet rate',
        durationMs: 7500
      },
      {
        title: 'Multi-Phase Subcontractor Rate Table',
        subtitle: 'Itemizing clearing, grubbing, utility trenching, and asphalt paving',
        narration: 'Break down complex jobsite bids into granular phases. Every phase maintains individual material and labor line items for complete transparency.',
        targetX: 75,
        targetY: 70,
        actionType: 'click',
        actionLabel: 'Calculated Raw Direct Cost: $142,850.00',
        simulatedValue: 'Direct Raw: $142,850',
        durationMs: 7500
      }
    ]
  },
  {
    id: 'profit-margin',
    title: '2. Profit Sensitivity & Margin Ledger',
    badge: 'Tier 1 Core',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
    summary: 'Audit exact dollar markup vs net margin percentages to protect project profit margins.',
    steps: [
      {
        title: 'Markup vs. Margin Calculation Audit',
        subtitle: 'Comparing dollar added to baseline raw cost against percentage retained',
        narration: 'Never confuse markup with margin! iSite Command automatically calculates both values to ensure your bid retains real net profit after overhead.',
        targetX: 30,
        targetY: 35,
        actionType: 'drag',
        actionLabel: 'Adjusting Target Profit Slider to 22%',
        simulatedValue: 'Target Markup: 28.2%',
        durationMs: 7500
      },
      {
        title: 'Live Sensitivity Zone Indicator',
        subtitle: 'Monitoring risk zones (<15% Low Cushion, 15-28% Optimal, >28% Premium)',
        narration: 'The live Sensitivity Matrix alerts you if your net margin falls into a low-cushion risk zone, keeping your contractor business competitive and protected.',
        targetX: 70,
        targetY: 55,
        actionType: 'highlight',
        actionLabel: 'Optimal Yield Zone Active (21.8% Net Margin)',
        simulatedValue: 'Net Profit: $39,800',
        durationMs: 7500
      }
    ]
  },
  {
    id: 'white-label',
    title: '3. Subscriber White-Label Branding',
    badge: 'Multi-Tenant SaaS',
    icon: Building2,
    color: 'from-blue-500 to-indigo-600',
    summary: 'Insert your own logo, company details, and rates on subscriber client proposal PDFs.',
    steps: [
      {
        title: 'Upload Company Logo & Branding',
        subtitle: 'Replacing generic headers with your contractor branding',
        narration: 'As a subscriber, iSite Command is completely white-labeled to your company. Upload your high-res logo, set brand colors, and add contact details.',
        targetX: 20,
        targetY: 25,
        actionType: 'click',
        actionLabel: 'Uploading "Apex Earthworks LLC" Gold Logo',
        simulatedValue: 'Logo Applied',
        durationMs: 7500
      },
      {
        title: 'Generate Client Proposal PDF',
        subtitle: 'Exporting professional client-facing proposal without internal profit data',
        narration: 'With one click, generate a clean, polished PDF bid for project owners. Internal raw costs and markups remain hidden, showing only professional scope and final price.',
        targetX: 80,
        targetY: 80,
        actionType: 'click',
        actionLabel: 'Generating Client Proposal PDF',
        simulatedValue: 'White-Label PDF Ready',
        durationMs: 7500
      }
    ]
  },
  {
    id: 'mobile-hr',
    title: '4. Mobile Crew Clock-In & Geo-Fence (Tier 2)',
    badge: 'Tier 2 HR',
    icon: Users,
    color: 'from-purple-500 to-violet-600',
    summary: 'Track field employee hours with geo-fenced jobsite clock-in and active headcount protection.',
    steps: [
      {
        title: 'Geo-Fenced Jobsite Timecard',
        subtitle: 'Field workers clock in directly from mobile devices',
        narration: 'Tier 2 introduces mobile crew clock-ins. Workers verify their location via jobsite GPS geo-fencing before timecards submit to payroll.',
        targetX: 45,
        targetY: 40,
        actionType: 'scan',
        actionLabel: 'GPS Verified: Highway 80 Earthwork Jobsite',
        simulatedValue: 'Worker Clocked In 7:00 AM',
        durationMs: 7500
      },
      {
        title: 'Active Employee Headcount Protection',
        subtitle: 'Terminated or archived personnel are excluded from ACH billing tiers',
        narration: 'Our subscription pricing strictly counts active employees. Archived workers remain in your historical records without bumping you into higher billing brackets.',
        targetX: 65,
        targetY: 65,
        actionType: 'click',
        actionLabel: 'Archiving Worker Record & Verifying Tier 2 Billing',
        simulatedValue: '12 Active Personnel',
        durationMs: 7500
      }
    ]
  },
  {
    id: 'cad-takeoff',
    title: '5. CAD Blueprint & Site Plan Takeoff (Tier 3)',
    badge: 'Tier 3 CAD',
    icon: FileText,
    color: 'from-orange-500 to-amber-600',
    summary: 'Upload PDF site plans to auto-interpret contours, soil profiles, and earthwork volumes.',
    steps: [
      {
        title: 'Upload Civil PDF Site Plan',
        subtitle: 'Parsing grading contours and utility easements',
        narration: 'In Tier 3, upload civil engineering PDF blueprints. The AI site interpreter reads existing vs proposed elevation contours automatically.',
        targetX: 35,
        targetY: 30,
        actionType: 'click',
        actionLabel: 'Parsing Civil Sheet C-201 Grading Plan',
        simulatedValue: 'PDF Imported',
        durationMs: 7500
      },
      {
        title: 'Automated Soil Profile & Cut/Fill Takeoff',
        subtitle: 'Calculating topsoil strip, rock excavation, and structural fill',
        narration: 'View immediate cut/fill balance maps with color-coded depth zones, saving hours of manual digitizing.',
        targetX: 75,
        targetY: 60,
        actionType: 'highlight',
        actionLabel: 'Color-Coded Cut/Fill Mesh Computed',
        simulatedValue: 'Net Earthwork: 7,000 CY Import Needed',
        durationMs: 7500
      }
    ]
  },
  {
    id: 'drone-3d',
    title: '6. Drone Photogrammetry & Stockpile Audits (Tier 4)',
    badge: 'Tier 4 Drone',
    icon: Compass,
    color: 'from-cyan-500 to-blue-600',
    summary: 'Process 3D drone surface point clouds and perform instant stockpile volume audits.',
    steps: [
      {
        title: 'Import 3D Drone Point Cloud Mesh',
        subtitle: 'Comparing active site surface against CAD design baselines',
        narration: 'Tier 4 brings drone command. Upload aerial photogrammetry scans to compare real-time site surface mesh against your civil engineering CAD design.',
        targetX: 50,
        targetY: 35,
        actionType: 'click',
        actionLabel: 'Loading 3D Point Cloud Mesh (1.2M points)',
        simulatedValue: '3D Surface Loaded',
        durationMs: 7500
      },
      {
        title: 'Live Stockpile Volume Audit',
        subtitle: 'Measuring gravel and crushed stone stockpiles in seconds',
        narration: 'Draw a boundary around any dirt or aggregate stockpile to compute exact cubic yardage instantly for inventory and billing audits.',
        targetX: 55,
        targetY: 70,
        actionType: 'click',
        actionLabel: 'Stockpile #4 Measured: 3,420 Cubic Yards',
        simulatedValue: 'Vol: 3,420 CY Gravel',
        durationMs: 7500
      }
    ]
  },
  {
    id: 'zero-security',
    title: '7. Zero Financial Data ACH Security',
    badge: 'Bank-Grade Security',
    icon: ShieldCheck,
    color: 'from-emerald-600 to-green-700',
    summary: 'Bank-to-bank direct wire & ACH settlement with unique automated reference codes.',
    steps: [
      {
        title: 'Zero Card/Bank Storage Security Mandate',
        subtitle: 'Protecting subscribers and site owners from data breach liabilities',
        narration: 'To protect your business from cyber liability, iSite Command NEVER stores, processes, or holds credit cards or bank account PINs.',
        targetX: 40,
        targetY: 50,
        actionType: 'highlight',
        actionLabel: 'Encrypted Reference Code Generated: #ISC-2026-ACH-9821',
        simulatedValue: 'Zero Data Stored',
        durationMs: 7500
      }
    ]
  }
];

export const InteractiveVideoTour: React.FC<InteractiveVideoTourProps> = ({
  onClose,
  isEmbedded = false
}) => {
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.85); // Default to relaxed 0.85x speed for high comprehension
  const [showCaptions, setShowCaptions] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);
  const [showFacebookAdKit, setShowFacebookAdKit] = useState(false);
  const [copiedAdText, setCopiedAdText] = useState(false);

  const currentModule = TOUR_MODULES[activeModuleIdx];
  const currentStep = currentModule.steps[activeStepIdx];

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Function to speak narration
  const speakNarration = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      if (isMuted) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechSpeed;
      utterance.pitch = 1.0;
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Playback timer & auto-advance
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isPlaying) {
      speakNarration(currentStep.narration);

      const stepDuration = currentStep.durationMs / speechSpeed;
      const startTime = Date.now();

      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / stepDuration) * 100);
        setProgressPercent(pct);
      }, 50);

      timer = setTimeout(() => {
        // Advance to next step or next module
        if (activeStepIdx < currentModule.steps.length - 1) {
          setActiveStepIdx(prev => prev + 1);
        } else if (activeModuleIdx < TOUR_MODULES.length - 1) {
          setActiveModuleIdx(prev => prev + 1);
          setActiveStepIdx(0);
        } else {
          // Loop back to start or pause
          setIsPlaying(false);
          setProgressPercent(100);
        }
      }, stepDuration);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [isPlaying, activeModuleIdx, activeStepIdx, isMuted, speechSpeed]);

  const handleNextStep = () => {
    if (activeStepIdx < currentModule.steps.length - 1) {
      setActiveStepIdx(prev => prev + 1);
    } else if (activeModuleIdx < TOUR_MODULES.length - 1) {
      setActiveModuleIdx(prev => prev + 1);
      setActiveStepIdx(0);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIdx > 0) {
      setActiveStepIdx(prev => prev - 1);
    } else if (activeModuleIdx > 0) {
      setActiveModuleIdx(prev => prev - 1);
      setActiveStepIdx(TOUR_MODULES[activeModuleIdx - 1].steps.length - 1);
    }
  };

  const handleRestart = () => {
    setActiveModuleIdx(0);
    setActiveStepIdx(0);
    setIsPlaying(true);
    setProgressPercent(0);
  };

  return (
    <div className={`bg-slate-950 text-slate-100 flex flex-col ${isEmbedded ? 'rounded-3xl border border-amber-500/40 p-4 sm:p-6 shadow-2xl' : 'min-h-screen p-4 sm:p-8'}`}>
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white font-display uppercase tracking-wide flex items-center gap-2">
              <span>iSite Command Interactive Video & Demo Simulator</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                Guided Audio Tour
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live software walk-through with voice narration and interactive pointing finger action
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowFacebookAdKit(true)}
            className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <Megaphone className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span>📱 Facebook Ad Kit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`px-2.5 py-2 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 ${
              isMuted ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span>{isMuted ? 'Muted' : 'Voice On'}</span>
          </button>

          {/* Calibrated Speech Speed Selector for High Comprehension */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5 text-xs font-mono">
            {[
              { label: '0.75x Relaxed', speed: 0.75 },
              { label: '0.85x Natural', speed: 0.85 },
              { label: '1.0x Normal', speed: 1.0 }
            ].map(opt => (
              <button
                key={opt.speed}
                type="button"
                onClick={() => setSpeechSpeed(opt.speed)}
                className={`px-2 py-1 rounded-lg transition-colors font-bold ${
                  speechSpeed === opt.speed
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Module Selector Sidebar + Live Demo Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 flex-1">
        
        {/* Left Column: Feature Module Playlist (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Feature Demo Playlist ({TOUR_MODULES.length})</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Module {activeModuleIdx + 1} of {TOUR_MODULES.length}
            </span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {TOUR_MODULES.map((mod, mIdx) => {
              const Icon = mod.icon;
              const isActive = mIdx === activeModuleIdx;

              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setActiveModuleIdx(mIdx);
                    setActiveStepIdx(0);
                    setIsPlaying(true);
                    setProgressPercent(0);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 relative overflow-hidden ${
                    isActive
                      ? 'bg-slate-800/90 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Left Accent Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeModuleIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600"
                    />
                  )}

                  <div className={`p-2 rounded-lg text-white font-bold shrink-0 bg-gradient-to-r ${mod.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate font-display">
                        {mod.title}
                      </h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 shrink-0">
                        {mod.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {mod.summary}
                    </p>

                    {/* Step progress dots if active */}
                    {isActive && (
                      <div className="flex items-center gap-1 mt-2">
                        {mod.steps.map((st, sIdx) => (
                          <div
                            key={sIdx}
                            className={`h-1.5 rounded-full transition-all ${
                              sIdx === activeStepIdx
                                ? 'w-6 bg-amber-400'
                                : sIdx < activeStepIdx
                                ? 'w-2 bg-emerald-400'
                                : 'w-2 bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Introductory Offer Callout Box */}
          <div className="mt-auto bg-gradient-to-r from-amber-950/60 to-slate-950 border border-amber-500/30 p-3.5 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
              🎁 1 FREE Full Project Estimate
            </span>
            <p className="text-[11px] text-slate-300 font-sans">
              Experience the complete multi-phase bidding engine with your own company logo prior to subscribing!
            </p>
          </div>
        </div>

        {/* Right Column: Simulated Screen Canvas & Animated Pointer Finger (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Main Simulated UI Screen Viewport */}
          <div className="relative w-full aspect-video bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-6 bg-grid-pattern">
            
            {/* Top Software Navigation Header Mock */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 bg-slate-900/80 -mx-4 -mt-4 p-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs font-mono">
                  iS
                </div>
                <div>
                  <h3 className="text-xs font-black text-white font-display tracking-tight uppercase">
                    iSite Command &bull; {currentModule.title}
                  </h3>
                  <p className="text-[10px] font-mono text-amber-400">
                    Step {activeStepIdx + 1}: {currentStep.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE DEMO SIMULATOR
                </span>
              </div>
            </div>

            {/* Simulated Dynamic UI Content Canvas */}
            <div className="my-auto py-2 relative z-10 space-y-3">
              
              {/* Animated Action Headline Banner */}
              <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                    AUDIO NARRATION STEP {activeStepIdx + 1}:
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white font-display flex items-center gap-2">
                    <span>{currentStep.actionLabel}</span>
                    {currentStep.simulatedValue && (
                      <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-lg border border-amber-500/30 font-mono font-normal">
                        {currentStep.simulatedValue}
                      </span>
                    )}
                  </h4>
                </div>
                
                {/* DIRECT LAUNCH BUTTON INTO REAL MULTI-PHASE ESTIMATOR */}
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem('tjd_staff_authorized', 'true');
                    window.dispatchEvent(new Event('tjd_auth_change'));
                    window.location.hash = '#multi-phase-bid';
                    if (onClose) onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 shadow-lg transition-all flex items-center gap-1.5 animate-pulse"
                >
                  <span>🚀 Open Real Estimator</span>
                </button>
              </div>

              {/* MODULE 0: App Navigation Guide */}
              {activeModuleIdx === 0 && (
                <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl space-y-3">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Top Navigation Header Mockup (Passcode: 2026)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    
                    {/* Item 1: Takeoff Bid Estimator */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      activeStepIdx === 0
                        ? 'ring-4 ring-amber-400 bg-amber-500/20 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse scale-105 z-20'
                        : 'bg-slate-900 border-slate-800 opacity-60'
                    }`}>
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span>Takeoff Bid Estimator</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono mt-1">
                        Multi-Phase Earthwork Engine (PIN: 2026)
                      </p>
                      {activeStepIdx === 0 && (
                        <span className="mt-2 inline-block bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2 py-0.5 rounded shadow">
                          👉 CLICK HERE IN HEADER
                        </span>
                      )}
                    </div>

                    {/* Item 2: Office Hub */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      activeStepIdx === 1
                        ? 'ring-4 ring-emerald-400 bg-emerald-500/20 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.8)] animate-pulse scale-105 z-20'
                        : 'bg-slate-900 border-slate-800 opacity-60'
                    }`}>
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <span>Office Hub</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono mt-1">
                        Client Proposals & Sensitivity Audit
                      </p>
                      {activeStepIdx === 1 && (
                        <span className="mt-2 inline-block bg-emerald-400 text-slate-950 text-[10px] font-mono font-black px-2 py-0.5 rounded shadow">
                          👉 CLICK HERE IN HEADER
                        </span>
                      )}
                    </div>

                    {/* Item 3: iSite Command SaaS */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      activeStepIdx === 2
                        ? 'ring-4 ring-amber-400 bg-amber-500/20 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse scale-105 z-20'
                        : 'bg-slate-900 border-slate-800 opacity-60'
                    }`}>
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>iSite Command</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono mt-1">
                        Subscriber Portal & 1 Free Estimate
                      </p>
                      {activeStepIdx === 2 && (
                        <span className="mt-2 inline-block bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-2 py-0.5 rounded shadow">
                          👉 CLICK GOLD HEADER PILL
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* MODULE 1: Multi-Phase Earthwork Estimator Controls */}
              {activeModuleIdx === 1 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    
                    {/* Phase 1: Cut/Fill Volume */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      activeStepIdx === 0
                        ? 'ring-4 ring-amber-400 bg-amber-500/15 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse z-20'
                        : 'bg-slate-900/90 border-slate-800 opacity-60'
                    }`}>
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                        Phase 1: Cut / Fill Earthwork
                      </span>
                      <div className="text-xs font-mono text-white mt-1 space-y-0.5">
                        <div>Cut: <strong className="text-amber-300">45,000 CY</strong></div>
                        <div>Fill: <strong className="text-amber-300">38,000 CY</strong></div>
                        <div>Soil: Red Clay (20% Swell)</div>
                      </div>
                      {activeStepIdx === 0 && (
                        <span className="mt-2 inline-block bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                          👉 ENTER CUT & FILL CY HERE
                        </span>
                      )}
                    </div>

                    {/* Phase 2: Equipment Fleet Rates */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      activeStepIdx === 1
                        ? 'ring-4 ring-amber-400 bg-amber-500/15 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse z-20'
                        : 'bg-slate-900/90 border-slate-800 opacity-60'
                    }`}>
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                        Phase 2: Heavy Machine Fleet
                      </span>
                      <div className="text-xs font-mono text-white mt-1 space-y-0.5">
                        <div>CAT 349 Excavator @ $185/hr</div>
                        <div>CAT D8 Dozer @ $210/hr</div>
                        <div>Scraper Batch: 3x 621H</div>
                      </div>
                      {activeStepIdx === 1 && (
                        <span className="mt-2 inline-block bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                          👉 SELECT FLEET & HOURLY RATES
                        </span>
                      )}
                    </div>

                    {/* Phase 3: Subcontractor Rates */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      activeStepIdx === 2
                        ? 'ring-4 ring-amber-400 bg-amber-500/15 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse z-20'
                        : 'bg-slate-900/90 border-slate-800 opacity-60'
                    }`}>
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                        Phase 3: Subcontractor Rates
                      </span>
                      <div className="text-xs font-mono text-white mt-1 space-y-0.5">
                        <div>Clearing: $2,800 / Acre</div>
                        <div>Bulk Dirt: $3.75 / CY</div>
                        <div>Direct Raw: $142,850</div>
                      </div>
                      {activeStepIdx === 2 && (
                        <span className="mt-2 inline-block bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                          👉 ADJUST SUBCONTRACTOR UNIT RATES
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* MODULE 2: Sensitivity & Net Margin Matrix */}
              {activeModuleIdx === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Slider Control */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    activeStepIdx === 0
                      ? 'ring-4 ring-amber-400 bg-amber-500/15 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse z-20'
                      : 'bg-slate-900/90 border-slate-800 opacity-60'
                  }`}>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                      Target Profit Sensitivity Slider
                    </span>
                    <div className="text-xs font-mono text-white mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Applied Dollar Markup:</span>
                        <strong className="text-amber-300">28.2%</strong>
                      </div>
                      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full w-[65%]" />
                      </div>
                    </div>
                    {activeStepIdx === 0 && (
                      <span className="mt-2 inline-block bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                        👉 DRAG SLIDER TO SET PROFIT
                      </span>
                    )}
                  </div>

                  {/* Sensitivity Zone Audit */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    activeStepIdx === 1
                      ? 'ring-4 ring-emerald-400 bg-emerald-500/15 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.8)] animate-pulse z-20'
                      : 'bg-slate-900/90 border-slate-800 opacity-60'
                  }`}>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">
                      Live Net Margin Audit Matrix
                    </span>
                    <div className="text-xs font-mono text-white mt-1 space-y-0.5">
                      <div>Direct Cost: $142,850</div>
                      <div>Net Profit: <strong className="text-emerald-300">$39,800</strong></div>
                      <div>Actual Net Margin: <strong className="text-emerald-300">21.8%</strong></div>
                    </div>
                    {activeStepIdx === 1 && (
                      <span className="mt-2 inline-block bg-emerald-400 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                        👉 GREEN OPTIMAL YIELD ZONE ACTIVE
                      </span>
                    )}
                  </div>

                </div>
              )}

              {/* MODULE 3: White-Label Branding */}
              {activeModuleIdx === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    activeStepIdx === 0
                      ? 'ring-4 ring-amber-400 bg-amber-500/15 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse z-20'
                      : 'bg-slate-900/90 border-slate-800 opacity-60'
                  }`}>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                      Subscriber Company Logo
                    </span>
                    <div className="mt-2 text-xs font-mono text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                        AE
                      </div>
                      <div>
                        <strong>Apex Earthworks LLC</strong>
                        <div className="text-[10px] text-slate-400">Custom Rates & Phone Applied</div>
                      </div>
                    </div>
                    {activeStepIdx === 0 && (
                      <span className="mt-2 inline-block bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                        👉 UPLOAD YOUR LOGO HERE
                      </span>
                    )}
                  </div>

                  <div className={`p-3.5 rounded-xl border transition-all ${
                    activeStepIdx === 1
                      ? 'ring-4 ring-amber-400 bg-amber-500/15 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-pulse z-20'
                      : 'bg-slate-900/90 border-slate-800 opacity-60'
                  }`}>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                      Export Client Proposal PDF
                    </span>
                    <div className="mt-2">
                      <button type="button" className="w-full bg-amber-500 text-slate-950 font-mono font-black text-xs py-2 rounded-lg shadow">
                        📄 Generate Proposal PDF
                      </button>
                    </div>
                    {activeStepIdx === 1 && (
                      <span className="mt-2 inline-block bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                        👉 CLICK TO EXPORT PDF TO CLIENT
                      </span>
                    )}
                  </div>

                </div>
              )}

              {/* MODULE 4, 5, 6 fallback */}
              {activeModuleIdx >= 4 && (
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-bold">
                    <span>{currentModule.title}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/40 ring-2 ring-amber-400 animate-pulse text-xs font-mono text-white">
                    {currentStep.actionLabel}: <strong className="text-amber-300">{currentStep.simulatedValue}</strong>
                  </div>
                </div>
              )}

            </div>

            {/* ANIMATED POINTING FINGER / CURSOR OVERLAY */}
            <motion.div
              className="absolute z-30 pointer-events-none flex items-center gap-2"
              initial={{ left: `${currentStep.targetX}%`, top: `${currentStep.targetY}%` }}
              animate={{ left: `${currentStep.targetX}%`, top: `${currentStep.targetY}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              {/* Hand Pointing Finger Icon */}
              <div className="relative">
                <span className="text-3xl sm:text-4xl filter drop-shadow-lg select-none transform -rotate-12">
                  👉
                </span>
                {/* Pulsing Ripple Effect under finger */}
                <span className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-amber-400/50 animate-ping" />
              </div>

              {/* Action Tooltip Box floating next to finger */}
              <div className="bg-slate-900 border-2 border-amber-400 text-white text-[11px] font-mono px-2.5 py-1 rounded-xl shadow-2xl font-bold whitespace-nowrap flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{currentStep.actionLabel}</span>
              </div>
            </motion.div>

            {/* Captions & Voice Subtitle Bar at Bottom of Canvas */}
            {showCaptions && (
              <div className="bg-slate-900/95 border-t border-slate-800 -mx-4 -mb-4 p-3.5 rounded-b-2xl flex items-center gap-3">
                <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-mono font-bold shrink-0">
                  🎙️ VOICE
                </div>
                <p className="text-xs text-slate-200 font-mono italic leading-snug flex-1">
                  "{currentStep.narration}"
                </p>
              </div>
            )}

          </div>

          {/* Interactive Player Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Play/Pause & Step Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700"
                title="Previous Step"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span className="text-xs font-mono font-bold uppercase">
                  {isPlaying ? 'Pause Demo' : 'Play Demo'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700"
                title="Next Step"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors border border-slate-700 ml-2"
                title="Restart Tour from Beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Active Step Indicator & Captions Toggle */}
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>
                Step <strong className="text-white">{activeStepIdx + 1}</strong> of <strong className="text-white">{currentModule.steps.length}</strong>
              </span>

              <button
                type="button"
                onClick={() => setShowCaptions(!showCaptions)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                  showCaptions ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {showCaptions ? 'Subtitles ON' : 'Subtitles OFF'}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Footer Summary & Contact Inquiries */}
      <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Select Property Solutions, LLC &bull; Official iSite Command Demonstration Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFacebookAdKit(true)}
            className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Facebook Ad Guide & Copy</span>
          </button>
          <span>&bull;</span>
          <div>
            Subscriber Support: <strong className="text-amber-400">subscribe@isitecommand.com</strong>
          </div>
        </div>
      </div>

      {/* FACEBOOK AD KIT MODAL OVERLAY */}
      <AnimatePresence>
        {showFacebookAdKit && (
          <div
            onClick={() => setShowFacebookAdKit(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/50 rounded-2xl sm:rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto text-slate-200 my-auto cursor-default"
            >
              <button
                onClick={() => setShowFacebookAdKit(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-md flex items-center gap-1 text-xs font-mono font-bold"
              >
                <span>Close</span>
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4 pr-16">
                <div className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-slate-950 font-black shadow-lg">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                    Facebook & Social Video Ad Launch Kit
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    Turn this video tour into high-converting Meta / Facebook video ads
                  </p>
                </div>
              </div>

              {/* Steps to convert tour to Facebook Ad */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Step 1: Record Screen</span>
                  <p className="text-slate-300">
                    Open this Video Tour full-screen and record using OBS, QuickTime, Loom, or phone screen recorder.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Step 2: Subtitles Included</span>
                  <p className="text-slate-300">
                    85% of Facebook users watch ads with sound off! Our built-in subtitles and pointing finger grab instant attention.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Step 3: Meta Target</span>
                  <p className="text-slate-300">
                    Target Earthwork Contractors, Heavy Civil Site Engineers, Excavation Business Owners, & General Contractors.
                  </p>
                </div>
              </div>

              {/* Ready-to-copy Facebook Ad Copy */}
              <div className="space-y-2 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Facebook Ad Primary Text (Copy & Paste Ready)</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const adText = `🚜 Earthwork Contractors: Stop losing money on cut/fill estimates or relying on messy spreadsheets!

Meet iSite Command — the intelligent site command & multi-phase earthwork estimator built specifically for heavy civil, site prep, and excavation contractors.

✅ Multi-Phase Dirt & Hauling Calculations (Scrapers, Excavators, Dump Trucks)
✅ Markup vs. True Net Margin Audit Matrix (Protect Your Profit!)
✅ White-Label Subscriber Branding (Your Company Logo on Client PDF Proposals)
✅ Mobile Crew Clock-In & GPS Geo-Fencing
✅ Zero Financial Data Storage Security Mandate

🎁 TRY YOUR 1st PROJECT ESTIMATE 100% FREE!
👉 Click 'Learn More' or visit subscribe@isitecommand.com to start your free project estimate!`;

                      navigator.clipboard.writeText(adText);
                      setCopiedAdText(true);
                      setTimeout(() => setCopiedAdText(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5"
                  >
                    {copiedAdText ? <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    <span>{copiedAdText ? 'Copied to Clipboard!' : 'Copy Facebook Ad Text'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={8}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50"
                  value={`🚜 Earthwork Contractors: Stop losing money on cut/fill estimates or relying on messy spreadsheets!

Meet iSite Command — the intelligent site command & multi-phase earthwork estimator built specifically for heavy civil, site prep, and excavation contractors.

✅ Multi-Phase Dirt & Hauling Calculations (Scrapers, Excavators, Dump Trucks)
✅ Markup vs. True Net Margin Audit Matrix (Protect Your Profit!)
✅ White-Label Subscriber Branding (Your Company Logo on Client PDF Proposals)
✅ Mobile Crew Clock-In & GPS Geo-Fencing
✅ Zero Financial Data Storage Security Mandate

🎁 TRY YOUR 1st PROJECT ESTIMATE 100% FREE!
👉 Click 'Learn More' or visit subscribe@isitecommand.com to start your free project estimate!`}
                />
              </div>

              {/* Recommended Facebook Headlines */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Recommended Facebook Ad Headlines:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300">
                    "The Multi-Phase Earthwork Estimator Built for Civil Contractors"
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300">
                    "Never Lose Money on Markup vs. Margin Again — iSite Command"
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300">
                    "White-Label Your Bids: Your Logo, Rates, & Client PDF Exports"
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300">
                    "Get 1 Free Full Project Estimate Prior to Subscribing!"
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
