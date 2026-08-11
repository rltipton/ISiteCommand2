import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  HelpCircle, 
  ChevronRight, 
  Building2, 
  UserPlus, 
  FileText, 
  Lock, 
  MapPin, 
  Truck, 
  Layers, 
  Maximize2, 
  Minimize2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    hash?: string;
    onClick?: () => void;
  };
  quickSuggestions?: string[];
}

// Custom Unique TJD AI Heavy Civil Emblem Icon
const TjdAiIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Metallic Shield/Crest Outer Frame */}
    <path 
      d="M32 4L54 14V30C54 44.5 44.5 56.2 32 60C19.5 56.2 10 44.5 10 30V14L32 4Z" 
      fill="url(#tjd-crest-grad)" 
      stroke="#f97316" 
      strokeWidth="2.5" 
      strokeLinejoin="round"
    />
    
    {/* Excavator Dozer Blade & Hardhat Line Art */}
    <path 
      d="M20 28H44M22 34H42M24 40H40M28 40V46M36 40V46M26 46H38" 
      stroke="#ffffff" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    
    {/* Hard Hat Top Shell */}
    <path 
      d="M20 26C20 18.5 25.3 16 32 16C38.7 16 44 18.5 44 26" 
      stroke="#fbbf24" 
      strokeWidth="2.5" 
      strokeLinecap="round"
    />
    <path 
      d="M32 16V26" 
      stroke="#fbbf24" 
      strokeWidth="2" 
    />

    {/* Glowing AI Sparkle Core */}
    <path 
      d="M32 6L33.5 10L37.5 11.5L33.5 13L32 17L30.5 13L26.5 11.5L30.5 10L32 6Z" 
      fill="#38bdf8"
    />
    <circle cx="16" cy="22" r="2" fill="#06b6d4" />
    <circle cx="48" cy="22" r="2" fill="#06b6d4" />

    {/* SVG Gradients */}
    <defs>
      <linearGradient id="tjd-crest-grad" x1="10" y1="4" x2="54" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0f172a" />
        <stop offset="0.5" stopColor="#1e293b" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
    </defs>
  </svg>
);

export default function TjdAiAssistantWidget() {
  const [isStaffAuthorized, setIsStaffAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('tjd_staff_authorized') === 'true';
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [unreadBadge, setUnreadBadge] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      setIsStaffAuthorized(sessionStorage.getItem('tjd_staff_authorized') === 'true');
    };
    
    checkAuth();
    window.addEventListener('tjd_auth_change', checkAuth);
    window.addEventListener('hashchange', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('tjd_auth_change', checkAuth);
      window.removeEventListener('hashchange', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "👋 Welcome to **T.J. Darley AI Assistant**! I am your intelligent civil operations and app guide.\n\nHow can I help you today? You can ask me how to create multi-phase bids, add employees, upload site plans, or estimate Georgia red clay compaction.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickSuggestions: [
        "⚡ How do I create a multi-phase bid?",
        "👷 How do I add an employee or track crew clock-in?",
        "📄 Where do I upload Civil Site Plans?",
        "🚜 How is Georgia Red Clay compaction calculated?",
        "💰 How do 1099 Subcontractor Work Orders work?"
      ]
    }
  ]);

  // Auto-scroll to bottom of message list
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleOpenWidget = () => {
    setIsOpen(true);
    setUnreadBadge(false);
  };

  // Local knowledge base dispatcher for instant, high-precision answers
  const getInstantKnowledgeAnswer = (query: string): ChatMessage | null => {
    const q = query.toLowerCase();

    if (q.includes('multi-phase') || q.includes('multiphase') || q.includes('create a bid') || q.includes('how do i create a bid')) {
      const isAuth = sessionStorage.getItem('tjd_staff_authorized') === 'true';
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `⚡ **How to Create a Multi-Phase Bid:**\n\n` +
              `1. **Access Authorization**: The Multi-Phase Line Item Estimator is protected inside the **Office Hub** to keep proprietary rates secure.\n` +
              `2. **Open the Estimator**: Click **Office Hub** in the top menu and enter passcode \`2026\` (or click the button below).\n` +
              `3. **Build Sub-Phases**: Select pre-loaded civil templates (Site Clearing, Subgrade Excavation, Pond Digging, Storm Drainage, Asphalt Paving).\n` +
              `4. **Add Equipment & Materials**: Configure dozer fleet hours, dump truck passes, GAB stone, and labor crews.\n` +
              `5. **1099 Subcontractor Option**: Mark any phase as Subcontracted to automatically embed markup and generate **IRS Form W-9 Work Orders**.\n` +
              `6. **Print / Export PDF**: Generate branded formal client proposals with custom payment schedules.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: {
          label: isAuth ? "Launch Multi-Phase Estimator" : "Unlock Office Hub (Passcode: 2026)",
          hash: isAuth ? "#multi-phase-bid" : "#field-intake"
        }
      };
    }

    if (q.includes('employee') || q.includes('add employee') || q.includes('clock in') || q.includes('clock-in') || q.includes('timecard') || q.includes('crew')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `👷 **Managing Employees & Crew Clock-In:**\n\n` +
              `1. **Adding an Employee**: Navigate to the **Office Hub** (#field-intake) with passcode \`2026\`. Go to the **"Crew & Payroll"** tab and click **"+ Add New Employee / Equipment Operator"**.\n` +
              `2. **Crew Clock-In**: Field personnel can click **"Crew Clock-In"** in the top navigation bar to select their name, equipment operated, site location (e.g. Windsong Townhomes or Greensboro), and submit digital shift logs with GPS verification.\n` +
              `3. **Payroll Audit**: Supervisors view real-time daily shift hours and equipment fuel consumption inside the Office Hub Payroll Ledger.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: {
          label: "Open Crew Clock-In Portal",
          hash: "#clock-in"
        }
      };
    }

    if (q.includes('site plan') || q.includes('upload') || q.includes('blueprint') || q.includes('takeoff') || q.includes('pdf')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `📄 **Uploading & Parsing Civil Site Plans:**\n\n` +
              `1. **Public Site Plan Parser**: Scroll to the **"Instant Estimator & Site Plan Takeoff"** section on the main page. Drag & drop any PDF site drawing or click **"Gemini Civil AI Site Takeoff"**.\n` +
              `2. **Office Hub Takeoff**: For multi-phase proposals, open the **Multi-Phase Estimator** in the Office Hub and click **"Upload PDF Site Plan / Blueprint Takeoff"**.\n` +
              `3. **Auto-Extraction**: Gemini AI automatically parses acreage, building pad FFEs, storm sewer RCP pipe linear feet, silt fence, and GAB paving square yards.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: {
          label: "Go to Main Site Plan Takeoff Tool",
          hash: "#estimator"
        }
      };
    }

    if (q.includes('clay') || q.includes('red clay') || q.includes('compaction') || q.includes('soil') || q.includes('shrink') || q.includes('swell')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `🚜 **Georgia Red Clay & Soil Dynamics:**\n\n` +
              `• **Swell Factor**: Bank-measure Georgia red clay expands by approximately **20% to 25%** upon initial excavation (\`Bank Cu Yds x 1.25 = Loose Cu Yds\`).\n` +
              `• **Compaction Requirement**: Structural building pads mandate **95% Standard Proctor Density** achieved via sheepsfoot vibratory rollers at Optimum Moisture Content (OMC).\n` +
              `• **SmartGrade Dozers**: T.J. Darley deploys John Deere 700K GPS laser bulldozers to grade clay pads within ±0.05 ft precision.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: {
          label: "View Earthwork Services",
          hash: "#services"
        }
      };
    }

    if (q.includes('subcontractor') || q.includes('1099') || q.includes('w-9') || q.includes('work order') || q.includes('markup')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `💰 **1099 Subcontractor Work Orders & Markup:**\n\n` +
              `1. **Marking Subcontracted Work**: When building a sub-phase in the Multi-Phase Estimator, check the **"Subcontracted Out (1099 Entity)"** box.\n` +
              `2. **Set Markup**: Enter the Subcontractor Payout Cost and desired TJD Markup % (e.g. 15% - 25%).\n` +
              `3. **Print Work Order & W-9 Packet**: Click **"Work Order (PDF)"** to print a formal Subcontract Agreement complete with mandatory **IRS Form W-9 Taxpayer Declaration** required prior to check draws.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    return null;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // 1. Check local instant knowledge base
    const instantAns = getInstantKnowledgeAnswer(query);

    if (instantAns) {
      setTimeout(() => {
        setMessages(prev => [...prev, instantAns]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // 2. Call backend Gemini AI agent API
    try {
      const response = await fetch('/api/agent-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          actionType: 'general',
          contextData: { source: 'TJD Floating AI Assistant Widget' }
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || "I processed your request using T.J. Darley AI. How else can I assist with your earthmoving or project estimation needs?";

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('TJD AI Widget error:', err);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `I understand you are asking about: "${query}".\n\nFor immediate operations or multi-phase bidding guidance, you can unlock the **Office Hub** (#field-intake) using passcode \`2026\`, or call T.J. Darley Construction dispatch directly at **(478) 808-7789**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (hash?: string) => {
    if (hash) {
      window.location.hash = hash;
      setIsOpen(false);
    }
  };

  if (!isStaffAuthorized) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* 1. FLOATING BUTTON TRIGGER WITH UNIQUE TJD AI ICON & BADGE */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpenWidget}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-orange-500 hover:border-amber-400 text-white px-4 py-3 rounded-2xl shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          title="Open T.J. Darley AI Operations Assistant"
        >
          {/* Animated Glow Halo */}
          <span className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-300 animate-pulse"></span>
          
          <div className="relative flex items-center gap-2.5 z-10">
            {/* Unique TJD AI Emblem */}
            <div className="relative">
              <TjdAiIcon className="w-8 h-8 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              {unreadBadge && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1 font-mono">
                <span>TJD AI ASSISTANT</span>
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <div className="text-[10px] text-slate-300 font-medium">Ask Bidding & Operations</div>
            </div>
          </div>
        </button>
      )}

      {/* 2. FLOATING ASSISTANT DIALOG WINDOW */}
      {isOpen && (
        <div 
          className={`bg-slate-950 border-2 border-slate-700/80 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
            isExpanded 
              ? 'w-[92vw] sm:w-[650px] h-[85vh] fixed bottom-4 right-4 sm:bottom-6 sm:right-6' 
              : 'w-[92vw] sm:w-[420px] h-[550px] max-h-[80vh]'
          }`}
        >
          {/* WIDGET HEADER */}
          <div className="bg-slate-900 border-b border-slate-800 p-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-950 border border-orange-500/50 rounded-xl shadow-inner">
                <TjdAiIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <span>T.J. DARLEY AI ASSISTANT</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase">Active</span>
                </div>
                <div className="text-[10px] text-slate-400">Civil Earthmoving & App Guidance Engine</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? "Collapse Window" : "Expand Window"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs text-left bg-gradient-to-b from-slate-950 to-slate-900">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 font-mono">
                  {msg.sender === 'assistant' && (
                    <span className="font-bold text-orange-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> TJD AI
                    </span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>

                <div 
                  className={`p-3 rounded-2xl max-w-[88%] leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-orange-600 text-white rounded-br-none shadow-md font-medium' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}

                  {/* Optional Action Button */}
                  {msg.actionButton && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleActionClick(msg.actionButton?.hash)}
                        className="w-full py-2 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <span>{msg.actionButton.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Suggestion Chips */}
                {msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                  <div className="pt-2 space-y-1.5 w-full">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Quick Topic Suggestions:</span>
                    <div className="flex flex-col gap-1.5">
                      {msg.quickSuggestions.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(sug)}
                          className="text-left py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 text-slate-300 hover:text-white rounded-xl text-[11px] transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <span>{sug}</span>
                          <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl w-fit text-slate-400 text-xs font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
                <span>TJD AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* CHAT INPUT FORM */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 shrink-0">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about bids, employees, site plans..."
                className="flex-1 bg-slate-950 border border-slate-700/80 focus:border-orange-500 text-white text-xs rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="p-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all cursor-pointer shrink-0 shadow-md"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1.5 px-1 font-mono">
              <span>Powered by T.J. Darley Construction AI</span>
              <span>Passcode for Office Hub: <strong>2026</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
