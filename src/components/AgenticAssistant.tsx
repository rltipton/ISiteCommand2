/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Calendar, 
  Mail, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertTriangle, 
  Zap, 
  Cpu, 
  FileText, 
  Plus, 
  RefreshCw, 
  Check, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  User, 
  MapPin, 
  Layers, 
  Sliders, 
  ChevronRight, 
  MessageSquare,
  Copy,
  ExternalLink,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';
import { getSmtpConfig, sendEmailAlert } from '../utils';

interface EmailInquiry {
  id: string;
  senderName: string;
  senderEmail: string;
  projectTitle: string;
  dateReceived: string;
  inquiryText: string;
  status: 'New' | 'Drafted' | 'Sent';
  draftedSubject?: string;
  draftedBody?: string;
}

interface ScheduleTask {
  id: string;
  jobName: string;
  stepName: string;
  assignee: string;
  dueDate: string;
  status: 'On Schedule' | 'At Risk' | 'Delayed' | 'Completed';
  notes: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface MaterialOrder {
  id: string;
  poNumber: string;
  materialName: string;
  quantity: string;
  supplier: string;
  unitCost: number;
  totalCost: number;
  siteLocation: string;
  status: 'PO Drafted' | 'Dispatched to Quarry' | 'In Transit' | 'Delivered';
  targetDeliveryDate: string;
}

interface AppImprovement {
  id: string;
  title: string;
  aiOrigin: string;
  description: string;
  impactLevel: 'High' | 'Medium' | 'Critical';
  status: 'Active' | 'Available' | 'Deployed';
  codeSnippet?: string;
}

export default function AgenticAssistant() {
  const [activeTab, setActiveTab] = useState<'prompt' | 'email' | 'schedule' | 'materials' | 'improvements'>('prompt');
  
  // Custom user prompt state
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<any | null>(null);

  // Email Queue State
  const [emailQueue, setEmailQueue] = useState<EmailInquiry[]>([
    {
      id: 'EM-101',
      senderName: 'Oakwood Acreage Developers',
      senderEmail: 'bids@oakwooddev.com',
      projectTitle: 'Oakwood Ridge Estate Pond & Dam',
      dateReceived: 'Today at 08:30 AM',
      inquiryText: 'Hi TJ, please send over the official estimate and contract terms for the 3.5-acre pond build in Greensboro. We need to verify down payment requirements and mobilize date.',
      status: 'Drafted',
      draftedSubject: 'Estimate Proposal & Mobilization Contract - Oakwood Ridge Estate Pond & Dam',
      draftedBody: `Hi Oakwood Acreage Developers,\n\nThank you for reaching out to T.J. Darley Construction! We have reviewed the 3.5-acre pond and clay core dam specifications for Oakwood Ridge Estate.\n\nOur total contract estimate is $125,000, which includes heavy excavator clearing, core keyway digging, and subsoil red clay compaction. Per our standard mobilization protocol, a 50% initial payment ($62,500) is due prior to fleet mobilization.\n\nWe can reserve dozer and excavator dispatch windows within 5 business days of receiving the deposit.\n\nBest regards,\nTJ Darley & Operations Team\nT.J. Darley Construction, LLC | (478) 808-7789`
    },
    {
      id: 'EM-102',
      senderName: 'Lake Oconee Custom Homes',
      senderEmail: 'projects@oconeehomes.org',
      projectTitle: 'Subdivision Road Crown & GAB Base',
      dateReceived: 'Yesterday at 04:15 PM',
      inquiryText: 'Can you provide pricing for 1,200 linear feet of crowned GAB gravel road on Lot 14? Also confirm utility locate timeline.',
      status: 'New'
    },
    {
      id: 'EM-103',
      senderName: 'Macon Commercial Realty',
      senderEmail: 'info@maconrealty.com',
      projectTitle: 'Building Pad Excavation & Silt Fence',
      dateReceived: 'Jul 23, 2026',
      inquiryText: 'Looking for a general contractor bid on pad excavation and sediment basins for our commercial strip in Bibb County.',
      status: 'Sent',
      draftedSubject: 'Bid Proposal Submitted - Macon Commercial Strip Pad & Silt Fence',
      draftedBody: `Dear Macon Commercial Realty team,\n\nOur full itemized multi-phase bid for pad excavation and sediment control has been generated and dispatched. Contact us at (478) 808-7789 to schedule a site walkthrough.`
    }
  ]);

  // Schedule & Deadline State
  const [scheduleTasks, setScheduleTasks] = useState<ScheduleTask[]>([
    {
      id: 'TSK-201',
      jobName: 'Oakwood Ridge Estate Pond & Dam',
      stepName: 'Project Step 01: Pre-Bid Site Topographic Survey & 811 Locates',
      assignee: 'TJ Darley (Foreman)',
      dueDate: '2026-07-28',
      status: 'On Schedule',
      notes: 'Georgia 811 utility ticket submitted. Private line markings pending homeowner confirmation.',
      priority: 'High'
    },
    {
      id: 'TSK-202',
      jobName: 'Oakwood Ridge Estate Pond & Dam',
      stepName: 'Project Step 02: Core Keyway Red Clay Excavation & Compaction',
      assignee: 'Dozer Fleet Alpha (Mike S.)',
      dueDate: '2026-08-02',
      status: 'At Risk',
      notes: 'Rain forecasted for Middle Georgia on Thursday. Weather delay clause may auto-extend compaction by 2 days.',
      priority: 'High'
    },
    {
      id: 'TSK-203',
      jobName: 'Lake Oconee Subdivision Road',
      stepName: 'Step 01: Subgrade Grading & Geotextile Fabric Laydown',
      assignee: 'Grading Fleet Crew B',
      dueDate: '2026-08-05',
      status: 'On Schedule',
      notes: 'Waiting on Ferguson Waterworks 6oz geotextile roll delivery.',
      priority: 'Medium'
    }
  ]);

  // Material Orders State
  const [materialOrders, setMaterialOrders] = useState<MaterialOrder[]>([
    {
      id: 'MAT-301',
      poNumber: 'PO-TJD-2026-089',
      materialName: 'GAB Crushed Granite Aggregate Base',
      quantity: '150 Tons',
      supplier: 'Vulcan Materials - Macon Quarry',
      unitCost: 28.00,
      totalCost: 4200.00,
      siteLocation: 'Oakwood Ridge Estate Parkway, Greensboro GA',
      status: 'Dispatched to Quarry',
      targetDeliveryDate: '2026-07-29'
    },
    {
      id: 'MAT-302',
      poNumber: 'PO-TJD-2026-090',
      materialName: 'Type 3 Heavy Riprap Stone for Dam Spillway',
      quantity: '45 Tons',
      supplier: 'Martin Marietta Aggregates',
      unitCost: 46.66,
      totalCost: 2100.00,
      siteLocation: 'Oakwood Ridge Estate Pond Spillway',
      status: 'PO Drafted',
      targetDeliveryDate: '2026-08-01'
    },
    {
      id: 'MAT-303',
      poNumber: 'PO-TJD-2026-091',
      materialName: 'Off-Road Heavy Equipment Red Diesel',
      quantity: '500 Gallons',
      supplier: 'Middle Georgia Fuel Distributors',
      unitCost: 3.47,
      totalCost: 1735.00,
      siteLocation: 'TJ Darley Macon Yard & Mobile Fleet Fueler',
      status: 'Delivered',
      targetDeliveryDate: '2026-07-24'
    }
  ]);

  // AI App Improvement Benchmark State
  const [improvements, setImprovements] = useState<AppImprovement[]>([
    {
      id: 'IMP-01',
      title: 'Multimodal Site Takeoff Analyzer',
      aiOrigin: 'Inspired by Gemini 2.5 Flash / Vision',
      description: 'Allows clients and foremen to upload site photos or engineering drawings to auto-extract earthmoving acreage, soil depth, and clearing complexity.',
      impactLevel: 'Critical',
      status: 'Active'
    },
    {
      id: 'IMP-02',
      title: 'Legal Contract & 50% Down Payment Auto-Embedding',
      aiOrigin: 'Inspired by Claude 3.5 Sonnet Technical Precision',
      description: 'Automatically embeds formal Georgia earthwork legal terms, utility damage waivers, and 50% mobilization rules inside every estimate PDF.',
      impactLevel: 'High',
      status: 'Active'
    },
    {
      id: 'IMP-03',
      title: 'Predictive Weather Delay & Rain Soil Saturation Radar',
      aiOrigin: 'Inspired by DeepSeek R1 & Predictive AI Models',
      description: 'Automatically checks Macon/Greensboro rain forecasts and calculates soil moisture hold times before dozer clay compaction.',
      impactLevel: 'High',
      status: 'Available'
    },
    {
      id: 'IMP-04',
      title: 'Automated Carrier SMS & Crew Deadline Nudge Relay',
      aiOrigin: 'Inspired by GPT-4o Conversational Automation',
      description: 'Sends automated SMS/email alerts to operators and suppliers when step deadlines are approaching or material POs are approved.',
      impactLevel: 'Medium',
      status: 'Deployed'
    }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Run AI Agent Command
  const handleRunAgentPrompt = async (customText?: string) => {
    const promptToUse = customText || userPrompt;
    if (!promptToUse.trim()) return;

    setIsProcessing(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/agent-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          contextData: {
            activeLead: emailQueue[0],
            scheduleCount: scheduleTasks.length,
            materialCount: materialOrders.length
          }
        })
      });

      const data = await res.json();
      setAiResponse(data);
      showNotification('🤖 Agentic Assistant completed your command!');
    } catch (err) {
      console.error('Agent assistant execution failed:', err);
      showNotification('Error processing command. Check console.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Dispatching Email Response via SMTP
  const handleSendEmailResponse = async (email: EmailInquiry) => {
    try {
      const smtp = getSmtpConfig();
      if (!smtp.user || !smtp.pass) {
        showNotification('⚠️ SMTP parameters missing. Opening draft text instead.');
        navigator.clipboard.writeText(email.draftedBody || '');
        return;
      }

      await sendEmailAlert({
        clientName: email.senderName,
        clientPhone: '(478) 808-7789',
        clientEmail: email.senderEmail,
        leadType: email.projectTitle,
        details: email.draftedBody
      });

      // Update email queue status
      setEmailQueue(prev => prev.map(item => item.id === email.id ? { ...item, status: 'Sent' } : item));
      showNotification(`✅ Email successfully dispatched to ${email.senderEmail}`);
    } catch (err) {
      console.error('Email dispatch failed:', err);
      showNotification('Failed sending email via SMTP relay.');
    }
  };

  // Dispatch Material PO
  const handleDispatchMaterialPO = (order: MaterialOrder) => {
    setMaterialOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Dispatched to Quarry' } : o));
    showNotification(`🚚 Purchase Order ${order.poNumber} dispatched to ${order.supplier}!`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 text-slate-100 shadow-2xl relative overflow-hidden">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-orange-600 text-white font-mono font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl border border-orange-400 flex items-center gap-3 animate-bounce">
          <Zap className="w-4 h-4 fill-current text-amber-200" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl text-white shadow-lg shadow-orange-900/30 border border-orange-400/30">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-2xl uppercase tracking-wider text-white">
                Agentic AI Project &amp; Schedule Assistant
              </h2>
              <span className="bg-orange-950 text-orange-400 border border-orange-800 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Autonomous Mode
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              Automates personal workflows, project schedules, client email responses, team deadline enforcement, and material procurement for T.J. Darley Construction, LLC.
            </p>
          </div>
        </div>

        {/* Top Action Indicators */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-300">Neural Engine:</span>
            <strong className="text-emerald-400">Online</strong>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('prompt')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'prompt' 
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-700/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Command Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'email' 
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-700/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Responder</span>
          {emailQueue.some(e => e.status === 'New' || e.status === 'Drafted') && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'schedule' 
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-700/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedules &amp; Deadlines</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'materials' 
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-700/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Material Procurement</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('improvements')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'improvements' 
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-700/30' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>AI Improvement Engine</span>
        </button>
      </div>

      {/* TAB 1: AI COMMAND HUB */}
      {activeTab === 'prompt' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-display font-bold text-sm uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Bot className="w-4 h-4 text-orange-400" />
                <span>Command Agentic Assistant</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">Gemini 3.5 Neural Integration Active</span>
            </div>

            <div className="relative">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Type any instruction... e.g., 'Draft a formal email reply to Oakwood Ridge for $125k pond estimate with 50% down terms', or 'Calculate material needed for Step 02 keyway and create supplier PO', or 'Audit team deadlines for next week'."
                className="w-full h-28 bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all font-sans leading-relaxed resize-none"
              />
              
              <button
                type="button"
                onClick={() => handleRunAgentPrompt()}
                disabled={isProcessing || !userPrompt.trim()}
                className="absolute bottom-3 right-3 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white font-mono font-bold text-xs uppercase rounded-lg shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Execute Agent Command</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Trigger Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Suggested Quick Actions:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const prompt = "Draft an automated email response to Oakwood Ridge Estate regarding their 3.5-acre pond estimate and 50% mobilization down payment requirement.";
                    setUserPrompt(prompt);
                    handleRunAgentPrompt(prompt);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-xl font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-orange-400" />
                  <span>Draft Client Email Reply</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prompt = "Auto-calculate GAB stone and riprap requirements for active bids and create formal supplier PO requests for Vulcan Materials.";
                    setUserPrompt(prompt);
                    handleRunAgentPrompt(prompt);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-xl font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Create Material POs</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prompt = "Audit team step deadlines and send automated SMS reminders to dozer foremen for weather delay risks.";
                    setUserPrompt(prompt);
                    handleRunAgentPrompt(prompt);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-xl font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audit Team Deadlines</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prompt = "Analyze the TJ Darley app and suggest continuous feature improvements mirroring Claude Sonnet and GPT-4o qualities.";
                    setUserPrompt(prompt);
                    handleRunAgentPrompt(prompt);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs rounded-xl font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>Suggest App Upgrades</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Execution Output Drawer */}
          {aiResponse && (
            <div className="bg-slate-950 border-2 border-orange-500/80 p-6 rounded-2xl space-y-6 shadow-2xl animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-display font-bold text-base uppercase text-white tracking-wider">
                    Agentic Execution Result
                  </h3>
                </div>
                <span className="text-xs font-mono bg-orange-950 text-orange-400 px-3 py-1 rounded-full border border-orange-800">
                  {aiResponse.actionType || 'Completed'}
                </span>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {aiResponse.reply}
              </div>

              {/* Email Draft Output */}
              {aiResponse.suggestedEmail && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      <span>Generated Email Reply Draft</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(aiResponse.suggestedEmail.body);
                        showNotification('Email draft copied to clipboard!');
                      }}
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </button>
                  </div>
                  <div className="text-xs font-mono text-slate-400 space-y-1">
                    <div><strong>To:</strong> {aiResponse.suggestedEmail.recipient}</div>
                    <div><strong>Subject:</strong> {aiResponse.suggestedEmail.subject}</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-850">
                    {aiResponse.suggestedEmail.body}
                  </div>
                </div>
              )}

              {/* Material Order Output */}
              {aiResponse.suggestedMaterials && aiResponse.suggestedMaterials.length > 0 && (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    <span>Calculated Material Procurement POs</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {aiResponse.suggestedMaterials.map((mat: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
                        <span className="text-xs font-bold text-white block">{mat.item}</span>
                        <span className="text-xs text-orange-400 font-mono block">{mat.quantity} &bull; ${mat.estCost?.toLocaleString()}</span>
                        <span className="text-[10.5px] text-slate-400 font-sans block">{mat.supplier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EMAIL RESPONDER */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white">
                Automated Estimating Email Handler
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Automatically parses client inquiries, pre-fills estimate figures and 50% mobilization rules, and prepares ready-to-send emails.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
              {emailQueue.length} Active Leads Logged
            </span>
          </div>

          <div className="space-y-4">
            {emailQueue.map((email) => (
              <div key={email.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-950 text-orange-400 border border-orange-900 rounded-xl">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{email.senderName}</h4>
                      <span className="text-xs text-slate-400 font-mono">{email.senderEmail} &bull; {email.projectTitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">{email.dateReceived}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
                      email.status === 'Sent' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : email.status === 'Drafted'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-sky-950 text-sky-400 border border-sky-800'
                    }`}>
                      {email.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 font-sans border border-slate-850">
                  <strong className="text-slate-400 uppercase text-[10px] font-mono tracking-wider block mb-1">Incoming Client Inquiry:</strong>
                  "{email.inquiryText}"
                </div>

                {/* AI Drafted Response */}
                {email.draftedBody && (
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-orange-900/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Bot className="w-4 h-4" />
                        <span>AI Smart Auto-Draft (TJ Darley Estimating Standards)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(email.draftedBody || '');
                          showNotification('Copied email draft!');
                        }}
                        className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Draft</span>
                      </button>
                    </div>

                    <div className="text-xs font-mono text-slate-300 space-y-1">
                      <div><strong>Subject:</strong> {email.draftedSubject}</div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-850">
                      {email.draftedBody}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleSendEmailResponse(email)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs uppercase rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Approve &amp; Send via SMTP</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULES & DEADLINES */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white">
                Project Workflow &amp; Team Schedule Manager
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Monitors milestone deadlines, foremen dispatch, and automated weather delay adjustments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => showNotification('Crew SMS reminders dispatched to Foremen!')}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-orange-400 rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Nudge Crew via SMS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scheduleTasks.map((task) => (
              <div key={task.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">{task.id}</span>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[9.5px] font-extrabold uppercase ${
                      task.status === 'On Schedule' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white line-clamp-2">{task.stepName}</h4>
                  <span className="text-xs text-orange-400 font-mono block font-bold">{task.jobName}</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-900 text-xs font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Assignee:</span>
                    <span className="text-slate-200 font-bold">{task.assignee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span className="text-amber-400 font-bold">{task.dueDate}</span>
                  </div>
                  <p className="text-[11px] font-sans text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-850 mt-1">
                    {task.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MATERIAL PROCUREMENT */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white">
                Automated Material Procurement &amp; PO Dispatch
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Auto-calculates required granite aggregates, riprap stone, geotextiles, and diesel for active bids.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Quarry Connect: Vulcan &amp; Martin Marietta
            </span>
          </div>

          <div className="space-y-3">
            {materialOrders.map((order) => (
              <div key={order.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-orange-400">{order.poNumber}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">&bull; {order.id}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{order.materialName}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Quantity: <strong className="text-white">{order.quantity}</strong> &bull; Supplier: <strong className="text-slate-200">{order.supplier}</strong>
                  </p>
                  <span className="text-[11px] text-slate-500 font-sans block">Site: {order.siteLocation}</span>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Est:</span>
                    <span className="text-sm font-bold text-emerald-400">${order.totalCost.toLocaleString()}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDispatchMaterialPO(order)}
                    disabled={order.status === 'Dispatched to Quarry' || order.status === 'Delivered'}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      order.status === 'Dispatched to Quarry'
                        ? 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{order.status === 'Dispatched to Quarry' ? 'Dispatched' : 'Dispatch PO'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AI IMPROVEMENT ENGINE */}
      {activeTab === 'improvements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white">
                Continuous AI Mirroring &amp; App Upgrade Engine
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Extracts the top qualities from leading AI paradigms (Gemini, Claude, GPT-4o, DeepSeek) to continuously improve TJ Darley app capabilities.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-800 font-bold">
              Multi-Model Intelligence Benchmark
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {improvements.map((imp) => (
              <div key={imp.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">{imp.aiOrigin}</span>
                    <span className="px-2 py-0.5 rounded-full font-mono text-[9.5px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {imp.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white">{imp.title}</h4>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{imp.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-[10.5px] font-mono text-slate-500">Impact: <strong className="text-orange-400">{imp.impactLevel}</strong></span>
                  <button
                    type="button"
                    onClick={() => showNotification(`✨ Applied ${imp.title} capabilities into system!`)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simulate Upgrade</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
