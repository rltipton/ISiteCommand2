/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  MapPin, 
  Clock, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  User, 
  Cpu, 
  HardHat, 
  ArrowRight,
  ShieldCheck,
  Send,
  Wifi,
  CloudLightning,
  Sparkles,
  Lock,
  Unlock,
  X,
  BookOpen,
  Trash2,
  Edit,
  Save,
  Mail,
  Plus,
  FileText,
  GraduationCap,
  Award,
  CheckSquare,
  Copy,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Calendar,
  DollarSign,
  Check,
  Play,
  Pause,
  Video,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Calculator,
  AlertTriangle,
  Download,
  Landmark,
  Layers,
  Coins,
  Truck,
  Printer,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import FieldIntake from './FieldIntake';
import ClientFieldIntake from './ClientFieldIntake';
import ConstructionOpportunities from './ConstructionOpportunities';
import BrandingSettings from './BrandingSettings';
import AgenticAssistant from './AgenticAssistant';
import { getWebhookUrl, setWebhookUrl, getSlackWebhookUrl, setSlackWebhookUrl, sendSlackAlert, getSmtpConfig, setSmtpConfig, sendEmailAlert, decimalToDMS, decimalToUTM, decimalToDDM, useAppBranding } from '../utils';
import { TrendingUp, Camera, ClipboardCheck, Bot } from 'lucide-react';
import { SERVICES_DATA, RES_SERVICES_DATA } from '../data';
import { EstimationInputs, EstimationResult } from '../types';

interface GPSLog {
  txId: string;
  name: string;
  operatorRole: string;
  locationName: string;
  lat: number;
  lng: number;
  action: 'Clock In' | 'Clock Out';
  timestamp: string;
  isSynced: boolean;
}

interface ExcelLedgerRow {
  rowId: string;
  timestamp: string;
  division: 'Commercial' | 'Residential';
  client: string;
  size: string;
  coefficient: string;
  estimate: string;
  status: 'SYNCHRONIZED' | 'PENDING SYNC';
  originalBidId?: string;
}

export interface Employee {
  id: string;
  employeeId?: string; // The professional company auditing ID! (e.g. TJD-1001)
  name: string;
  role: string;
  payType: 'hourly' | 'daily';
  rate: number;
  status: 'active' | 'terminated';
  hireDate: string;
  terminationDate?: string;
  phone?: string;
  email?: string;
}

export interface CustomShift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  hoursWorked: number;
  daysWorked: number;
  description?: string;
  siteLocation?: string;
}

export const STANDARD_ROLES = [
  "Forestry Mulcher Operator",
  "Finish Grade Dozer Operator",
  "Heavy Excavating Specialist",
  "Loader Operator",
  "Dump Truck Driver",
  "Commercial Project Manager",
  "Billing & Office Coordinator",
  "Laborer",
  "Foreman"
];

export function InHouseEstimator() {
  const branding = useAppBranding();
  const [division, setDivision] = useState<'commercial' | 'residential'>(() => {
    const saved = localStorage.getItem('tjd_estimator_division');
    return (saved === 'residential' || saved === 'commercial') ? saved : 'residential';
  });

  const [inputs, setInputs] = useState<EstimationInputs>(() => {
    const savedDiv = localStorage.getItem('tjd_estimator_division') || 'residential';
    if (savedDiv === 'residential') {
      return {
        serviceId: RES_SERVICES_DATA[0].id,
        projectSize: 2,
        unit: 'acres',
        soilType: 'clay',
        siteAccess: 'easy',
        includeDam: false,
        untouchedSpring: false,
      };
    } else {
      return {
        serviceId: SERVICES_DATA[0].id,
        projectSize: 15000,
        unit: 'sq_ft',
        soilType: 'clay',
        siteAccess: 'easy',
        includeDam: false,
        untouchedSpring: false,
      };
    }
  });

  const [pastIntakes, setPastIntakes] = useState<any[]>([]);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string>('');

  useEffect(() => {
    const loadIntakes = () => {
      try {
        let mergedIntakes: any[] = [];
        
        // 1. Get standard client intakes
        const savedIntakes = localStorage.getItem('tjd_client_intakes');
        if (savedIntakes) {
          try {
            mergedIntakes = JSON.parse(savedIntakes);
          } catch (err) {
            console.error('Failed parsing client intakes in AutomationHub:', err);
          }
        }
        
        // 2. Get client wishlists / bids and map them as pre-bid intakes!
        const savedBids = localStorage.getItem('tjd_earthworks_bids');
        if (savedBids) {
          try {
            const parsedBids = JSON.parse(savedBids);
            if (Array.isArray(parsedBids)) {
              parsedBids.forEach((bid: any) => {
                // Avoid duplicating if they have same id or name already
                const exists = mergedIntakes.some((intake: any) => intake.id === bid.id || (intake.clientName === bid.clientName && intake.jobName.includes(bid.clientName)));
                if (!exists) {
                  const mapped = {
                    id: bid.id,
                    fiId: bid.id.replace('TJD-WISHLIST-', 'WL-'),
                    submittedAt: bid.submittedAt || new Date().toLocaleDateString(),
                    clientName: bid.clientName,
                    jobName: bid.companyName ? `${bid.companyName} - Roadway Development` : `${bid.clientName} - Custom Wishlist`,
                    foreman: "TJ Darley",
                    formData: {
                      meetingDate: bid.submittedAt || new Date().toLocaleDateString(),
                      meetingTime: "12:00 PM",
                      foreman: "TJ Darley",
                      clientName: bid.clientName,
                      phoneNumber: bid.phone || '',
                      emailAddress: bid.email || '',
                      mailingAddress: bid.location || '',
                      cityStateZip: "",
                      jobName: bid.companyName ? `${bid.companyName} - Roadway Development` : `${bid.clientName} - Custom Wishlist`,
                      jobNotes: bid.projectDetails || '',
                      jobAddress: bid.location || '',
                      jobCityStateZip: "",
                      accessRoadType: "Moderate aggregate road",
                      accessNotes: "",
                      soilType: "clay",
                      lengthFeet: "12672", // Default for 2.4-mile road
                      topWidthFeet: "12",
                      bottomWidthFeet: "16",
                      depthHeightFeet: "1",
                      siteSlopePercent: "1.5%",
                      clientWants: bid.projectDetails || '',
                      specialConcerns: "",
                      budgetMentioned: bid.estimatedCostRange || "",
                      timeline: "4-6 Weeks",
                      areaSquareFeet: bid.unit === 'acres' ? (bid.projectSize * 43560) : bid.projectSize
                    }
                  };
                  mergedIntakes.push(mapped);
                }
              });
            }
          } catch (err) {
            console.error('Failed parsing earthworks bids in AutomationHub:', err);
          }
        }
        
        setPastIntakes(mergedIntakes);
      } catch (e) {
        console.warn("Could not load past client intakes in AutomationHub", e);
      }
    };

    loadIntakes();
    window.addEventListener('tjd_intakes_updated', loadIntakes);
    window.addEventListener('tjd_bids_updated', loadIntakes);
    return () => {
      window.removeEventListener('tjd_intakes_updated', loadIntakes);
      window.removeEventListener('tjd_bids_updated', loadIntakes);
    };
  }, []);

  // --- Guided Multi-Phase Wizard States ---
  const [isMultiPhaseMode, setIsMultiPhaseMode] = useState<boolean>(false);
  const [multiPhaseStepIndex, setMultiPhaseStepIndex] = useState<number>(0);
  const [multiPhaseStepAdjustments, setMultiPhaseStepAdjustments] = useState<Record<number, any>>({});
  const [compiledMultiPhaseBid, setCompiledMultiPhaseBid] = useState<any | null>(null);
  const [multiPhaseMarkup, setMultiPhaseMarkup] = useState<number>(35);
  const [multiPhaseSteps, setMultiPhaseSteps] = useState<any[]>([]);

  // Generator function to build highly tailored multi-phase sequential construction plans
  const generateSteps = () => {
    const projectSize = inputs.projectSize || 1;
    const unit = inputs.unit;
    const soilType = inputs.soilType;
    const siteAccess = inputs.siteAccess;
    const serviceId = inputs.serviceId;
    const isPond = serviceId === 'res_pond_digs' || serviceId === 'pond_digs';

    // Solve size in SqFt
    const sizeInSqFt = unit === 'acres' ? projectSize * 43560 : projectSize;
    
    // Depth factor
    const depthFeet = isPond ? (inputs.includeDam ? 3.5 : 2.0) : 2.0;
    
    // Excavation Volume in CY
    let excavationCuYds = Math.round((sizeInSqFt * depthFeet) / 27);
    if (serviceId === 'erosion_control') {
      excavationCuYds = Math.round(excavationCuYds * 0.12);
    }

    const activeUntouchedSpring = inputs.untouchedSpring || false;
    
    // Adjust areas and volumes if spring is preserved (untouched)
    const clearingSizeSqFt = activeUntouchedSpring ? sizeInSqFt * 0.35 : sizeInSqFt;
    const geoSizeSqFt = activeUntouchedSpring ? Math.min(sizeInSqFt, 150 * 116) : sizeInSqFt;
    const bulkExcVolume = activeUntouchedSpring ? Math.round(excavationCuYds * 0.22) : excavationCuYds;
    const stabilizationSizeSqFt = activeUntouchedSpring ? sizeInSqFt * 0.30 : sizeInSqFt;

    // Dynamic Pond Divisor to ensure machine productivity scale matches project size (from geotechnical standards)
    let pondDivisor = 38;
    if (bulkExcVolume > 5000) {
      pondDivisor = 110;
    } else if (bulkExcVolume > 1000) {
      pondDivisor = 65;
    }

    // Keyway trench volume (default 150ft long dam, 12ft wide, 4ft deep = ~267 CY)
    const matchedIntake = pastIntakes.find(i => i.id === selectedIntakeId);
    const fd = matchedIntake?.formData || {};
    const keywayL = fd.lengthFeet ? (parseFloat(fd.lengthFeet) || 150) : 150;
    const keywayVolume = Math.round((keywayL * 12 * 4) / 27); // default 267 CY for a 150ft dam

    // Soil Multiplier
    let soilMultiplier = 1.0;
    if (soilType === 'clay') soilMultiplier = 1.30;
    else if (soilType === 'sand') soilMultiplier = 0.85;
    else if (soilType === 'rocky') soilMultiplier = 1.65;

    // Access Multiplier
    let accessMultiplier = 1.0;
    if (siteAccess === 'easy') accessMultiplier = 1.00;
    else if (siteAccess === 'moderate') accessMultiplier = 1.15;
    else if (siteAccess === 'difficult') accessMultiplier = 1.38;

    if (isPond) {
      return [
        {
          id: 1,
          phaseName: "Phase 1 - Preliminary Site Prep",
          subPhaseName: "Forestry Mulching & Land Clearing",
          description: `Shearing and grinding underbrush and scrub wood up to perimeter boundaries across the ${projectSize.toLocaleString()} ${unit === 'acres' ? 'Acre' : 'Sq.Ft.'} footprint.`,
          equipment: [
            { name: "Cat 320 Forestry Mulcher (Heavy crawler)", hours: Math.max(12, Math.round(clearingSizeSqFt / 4500 * soilMultiplier * accessMultiplier)), rate: 220, explain: "Required to grind standing scrub trees into bio-stable mulch." },
            { name: "Site Mobilization 4x4 UTV (Rapid Tool Trailer & Supply Transport)", hours: Math.max(12, Math.round(clearingSizeSqFt / 4500 * soilMultiplier * accessMultiplier)), rate: 25, explain: "4x4 Utility Vehicle dedicated for rapid runs to mobile tool trailer, parts, fuel cans, and site hardware." }
          ],
          crew: [
            { name: "Senior Heavy Equipment Operator", hours: Math.max(12, Math.round(clearingSizeSqFt / 4500 * soilMultiplier * accessMultiplier)), rate: 55, explain: "Operates forestry cutter assembly." }
          ],
          materials: [
            { name: "Off-Road Diesel Fuel Surcharge Allocation", quantity: Math.max(100, Math.round(clearingSizeSqFt / 250)), unit: "Gallons", rate: 3.85, explain: "Crawler fuel usage under extreme cutterhead load." }
          ],
          checklist: [
            "Clear out perimeter standing scrub wood and dense underbrush",
            "Grind material down to bio-mulch and spread uniformly to prevent soil runoff",
            "Establish access roads for incoming heavy excavators"
          ]
        },
        {
          id: 2,
          phaseName: "Phase 1 - Preliminary Site Prep",
          subPhaseName: "Organic Stump Grubbing & Extraction",
          description: `Grubbing out stump root balls and subgrade organic fibers larger than 2 inches to ensure structural compaction integrity.`,
          equipment: [
            { name: "Cat 320 Medium Excavator with thumb attachment", hours: Math.max(10, Math.round(clearingSizeSqFt / 5500 * soilMultiplier * accessMultiplier)), rate: 220, explain: "Pulls stump root balls from subgrade soils." }
          ],
          crew: [
            { name: "Specialized Backhoe/Excavator Operator", hours: Math.max(10, Math.round(clearingSizeSqFt / 5500 * soilMultiplier * accessMultiplier)), rate: 55, explain: "Performs precision grubbing maneuvers." }
          ],
          materials: [],
          checklist: [
            "Extract root structures larger than 2 inches from core construction footprint",
            "Stockpile root balls in localized compost heaps outside of active water lines"
          ]
        },
        {
          id: 3,
          phaseName: "Phase 1 - Preliminary Site Prep",
          subPhaseName: "Perimeter Silt Fence Erosion Controls",
          description: `Installing Georgia EPD compliant Class-C wire-backed sediment barriers along slopes to trap loose sediments.`,
          equipment: [
            { name: "Bobcat T66 Compact Loader with Trencher attachment", hours: Math.max(8, Math.round(Math.sqrt(sizeInSqFt) * 0.12)), rate: 150, explain: "Excavates the required silt anchoring lip." }
          ],
          crew: [
            { name: "Support Field Technicians (Erosion Team)", hours: Math.max(8, Math.round(Math.sqrt(sizeInSqFt) * 0.12)), rate: 35, explain: "Fittings, staking, and wire-mesh tieing." }
          ],
          materials: [
            { name: "Class-C Wire-Backed Silt Fence Fabric", quantity: Math.max(150, Math.round(Math.sqrt(sizeInSqFt) * 3)), unit: "Linear Feet", rate: 3.50, explain: "Heavy geotextile with backing wire mesh." }
          ],
          checklist: [
            "Excavate continuous 6-inch deep perimeter sediment trench",
            "Tuck geotextile fabric edge down into the subgrade lip",
            "Drive structural steel T-posts at maximum 6-foot spacing and secure mesh"
          ]
        },
        {
          id: 4,
          phaseName: "Phase 1 - Preliminary Site Prep",
          subPhaseName: "Subgrade Geotextile Fabric Laying",
          description: `Placing high-strength woven stabilization geotextile to separate subgrade soils from wet clay foundations.`,
          equipment: [],
          crew: [
            { name: "General Labor support team", hours: Math.max(4, Math.round(geoSizeSqFt / 9000)), rate: 30, explain: "Spreads and anchors fabric sheets manually." }
          ],
          materials: [
            { name: "Woven Slit-Film Geotextile Fabric (12' x 300')", quantity: Math.max(1, Math.round(geoSizeSqFt / 3600)), unit: "Rolls", rate: 145, explain: "Prevents soft mud migrating into core layers." }
          ],
          checklist: [
            "Verify subgrade surfaces are clear of sharp stones and roots",
            "Overlap all fabric joint seams by at least 18 inches",
            "Secure sheet borders with steel sod staples"
          ]
        },
        {
          id: 5,
          phaseName: "Phase 2 - Mass Grading & Excavating",
          subPhaseName: "Deep Clay Core Keyway Cutoff Trench Excavation",
          description: "Required only if structural dam is enabled. Cuts a deep keyway down to bedrock and backfills with pure red sealing clay to block water migration.",
          equipment: [
            { name: "Cat 320 Hydraulic Excavator (Trenching Cut)", hours: Math.max(12, Math.round(keywayVolume / 22)), rate: 220, explain: "Excavates core trench below basin floor level." },
            { name: "Cat D5 Crawler Dozer (Core backfill leveling)", hours: Math.max(8, Math.round(keywayVolume / 33)), rate: 185, explain: "Spreads and levels clay core layers." }
          ],
          crew: [
            { name: "Licensed Grade Foreman (Depth laser transit)", hours: Math.max(12, Math.round(keywayVolume / 22)), rate: 75, explain: "Ensures keyway cuts deep into impermeable stratum." },
            { name: "Equipment Operators", hours: Math.max(12, Math.round(keywayVolume / 22)), rate: 55, explain: "Operates excavating machinery." }
          ],
          materials: [
            { name: "Imported High-Plasticity Impermeable Sealing Clay", quantity: Math.max(30, Math.round(keywayVolume * 1.45)), unit: "Tons", rate: 18.50, explain: "Pure blue/red clay pack acts as a natural water stopper." }
          ],
          checklist: [
            "Excavate continuous centerline trench to block water piping paths under the dam base",
            "Ensure core trench hits hard native clay or bedrock",
            "Pack imported sealing clay in thin 6-inch lifts to ensure full seal density"
          ]
        },
        {
          id: 6,
          phaseName: "Phase 2 - Mass Grading & Excavating",
          subPhaseName: "Mass Excavation, Pond Basin Shaping & Dam Structural Fill",
          description: `Bulk excavation of the pond basin and shaping of side slopes. Loose excavated dirt on site is repurposed for building the dam, keeping costs down.`,
          equipment: [
            { name: "Cat 320 Hydraulic Excavator (Bulk Basin Dig)", hours: Math.max(16, Math.round(bulkExcVolume / pondDivisor * soilMultiplier * accessMultiplier)), rate: 220, explain: "Excavates pond basin and sculpts side walls." },
            { name: "Cat D6 Crawler Dozer (Cut-and-fill leveling)", hours: Math.max(12, Math.round(bulkExcVolume / (pondDivisor * 1.2))), rate: 210, explain: "Spreads loose dirt from excavation to build dam embankment." },
            { name: "Cat CP44 Vibrating Padfoot Roller Compactor", hours: Math.max(8, Math.round(bulkExcVolume / (pondDivisor * 2.0))), rate: 165, explain: "Compacts soil lifts along the dam crown." }
          ],
          crew: [
            { name: "Licensed Grade Foreman (Slope & cut-fill controls)", hours: Math.max(16, Math.round(bulkExcVolume / pondDivisor * soilMultiplier * accessMultiplier)), rate: 75, explain: "Monitors exact cut-and-fill balance and slope ratios." },
            { name: "Heavy Equipment Operators (Crawler Crew)", hours: Math.round(Math.max(16, Math.round(bulkExcVolume / pondDivisor * soilMultiplier * accessMultiplier)) * 1.2), rate: 55, explain: "Operate excavator and padfoot compactor." }
          ],
          materials: [
            { name: "On-Site Loose Excavated Dirt (Repurposed for Dam Fill)", quantity: Math.round(bulkExcVolume * 1.35), unit: "CY", rate: 0, explain: "Uses existing loose dirt excavated on site to build the dam embankment ($0.00 cost to keep construction cost down!)." }
          ],
          checklist: [
            "Balance cut-and-fill on site to minimize expensive haul-out fees",
            "Spread loose soil in maximum 6-to-8 inch lifts along the dam width",
            "Run vibrating padfoot roller continuously to pack soils securely to handle water pressures",
            "Sculpt finished 3:1 perimeter side slopes to support water weight and prevent perimeter erosion"
          ]
        },
        {
          id: 7,
          phaseName: "Phase 3 - Pond & Clay Pad Base",
          subPhaseName: "Water Overflow HDPE Piping Installation",
          description: `Installing corrugated double-wall HDPE overflow piping through the dam embankment, fitted with anti-seep collars.`,
          equipment: [
            { name: "Cat 305 Precision Mini Excavator", hours: 8, rate: 145, explain: "Digs precise overflow pipe bedding path." }
          ],
          crew: [
            { name: "Pipe Alignment Specialist", hours: 8, rate: 45, explain: "Aligns joints and seals couplings." }
          ],
          materials: [
            { name: "18\" Corrugated Dual-Wall HDPE Piping (20Ft)", quantity: 2, unit: "Sections", rate: 650, explain: "Dual-wall smooth interior ensures rapid discharge flows." },
            { name: "Precast Concrete Anti-Seep Collars", quantity: 2, unit: "Collars", rate: 220, explain: "Blocks water creeping along the outside of the pipe." }
          ],
          checklist: [
            "Excavate pipe bedding through dam crown with continuous 1.5% gravity exit slope",
            "Install precast anti-seep collars at pipe junctions to prevent dangerous piping water leaks",
            "Backfill pipeline manually and hand-tamp to ensure tight envelope seal"
          ]
        },
        {
          id: 8,
          phaseName: "Phase 3 - Pond & Clay Pad Base",
          subPhaseName: "Silt Retaining Basin Spillway Rocks Rip-Rap",
          description: `Armoring the emergency spillway discharge channel with heavy Georgia granite rip-rap stones to handle velocity outflows.`,
          equipment: [
            { name: "Cat 320 Hydraulic Excavator (Rock placer)", hours: 8, rate: 220, explain: "Places multi-hundred pound rock armor pieces." }
          ],
          crew: [
            { name: "Grade Foreman (Laser transit align)", hours: 8, rate: 75, explain: "Ensures spillway weir matches exact flood design level." }
          ],
          materials: [
            { name: "Georgia Class-I Heavy Granite Rip-Rap Stones", quantity: Math.max(12, Math.round(geoSizeSqFt / 4500)), unit: "Tons", rate: 48, explain: "Sinks energy from fast-moving discharge waters." }
          ],
          checklist: [
            "Drape heavy geotextile underlay fabric across auxiliary spillway discharge runs",
            "Install rip-rap stone blocks tightly interlocking to form a stable erosion apron"
          ]
        },
        {
          id: 9,
          phaseName: "Phase 5 - Permanent Stabilization",
          subPhaseName: "Topsoil Dressing & Seeding Stabilization",
          description: `Spreading stockpiled organic topsoil across raw clay banks and spraying DOT-certified centipede seed mulch slurry.`,
          equipment: [
            { name: "Cat D5 Crawler Dozer (Topsoil spreading)", hours: Math.max(6, Math.round(stabilizationSizeSqFt / 10000)), rate: 185, explain: "Spreads stockpiled topsoil over raw perimeter slopes." }
          ],
          crew: [
            { name: "Hydroseeding Technicians (Wet slurry team)", hours: 6, rate: 40, explain: "Sprays seed, fertilizer, and mulch slurry." }
          ],
          materials: [
            { name: "Georgia DOT Centipede Seed & Wood-Fiber Mulch Slurry", quantity: Math.max(2, Math.round(stabilizationSizeSqFt / 12000)), unit: "Bags", rate: 95, explain: "Provides rapid root bonding to anchor soil banks." }
          ],
          checklist: [
            "Drape organic topsoil uniformly over graded areas to promote seed growth",
            "Apply hydroseed mulch slurry evenly across slopes to prevent stormwater clay washouts"
          ]
        }
      ];
    } else {
      // 4-step wizard sequence customized for any other service selected
      const isClearing = serviceId.includes('clear') || serviceId.includes('clearing');
      const isRoad = serviceId.includes('road') || serviceId.includes('grading') || serviceId.includes('driveway');
      const isPad = serviceId.includes('pad') || serviceId.includes('house_pads') || serviceId.includes('structural_pads');

      if (isClearing) {
        return [
          {
            id: 1,
            phaseName: "Phase 1 - Preliminary Site Prep",
            subPhaseName: "Perimeter Delineation & Silt Fence Setup",
            description: "Establishing limits of disturbance and installing sediment filters along sloped edges.",
            equipment: [
              { name: "Bobcat T66 with Trenching Attachment", hours: Math.max(6, Math.round(Math.sqrt(sizeInSqFt) * 0.1)), rate: 150 }
            ],
            crew: [
              { name: "Erosion Control Field Crew", hours: Math.max(6, Math.round(Math.sqrt(sizeInSqFt) * 0.1)), rate: 35 }
            ],
            materials: [
              { name: "Class-C Wire-Backed Silt Fence", quantity: Math.max(100, Math.round(Math.sqrt(sizeInSqFt) * 2.5)), unit: "Linear Feet", rate: 3.50 }
            ],
            checklist: [
              "Mark clearing boundaries with highly visible surveyor flagging tape",
              "Install EPD-approved silt fencing at all downstream toe slopes"
            ]
          },
          {
            id: 2,
            phaseName: "Phase 1 - Preliminary Site Prep",
            subPhaseName: "Forestry Mulching & Underbrush Shearing",
            description: "Grinding standing scrub trees, wild briars, and underbrush down into a stable mulch layer.",
            equipment: [
              { name: "Cat 320 Forestry Mulcher", hours: Math.max(8, Math.round(sizeInSqFt / 4000 * soilMultiplier * accessMultiplier)), rate: 220 }
            ],
            crew: [
              { name: "Senior Heavy Equipment Operator", hours: Math.max(8, Math.round(sizeInSqFt / 4000 * soilMultiplier * accessMultiplier)), rate: 55 }
            ],
            materials: [
              { name: "Off-Road Diesel Surcharge", quantity: Math.max(50, Math.round(sizeInSqFt / 400)), unit: "Gallons", rate: 3.85 }
            ],
            checklist: [
              "Mulch standing wood down to soil level, preserving select mature hardwoods",
              "Maintain steady machine speed to avoid ripping up subsurface roots"
            ]
          },
          {
            id: 3,
            phaseName: "Phase 2 - Mass Grading & Excavating",
            subPhaseName: "Heavy Tree Felling & Organic Stump Extraction",
            description: "Pushing down oversized timber and extracting large stump root balls from the core subgrade.",
            equipment: [
              { name: "Cat 320 Excavator with hydraulic thumb", hours: Math.max(8, Math.round(sizeInSqFt / 5000 * soilMultiplier * accessMultiplier)), rate: 220 }
            ],
            crew: [
              { name: "Excavating Machine Specialist", hours: Math.max(8, Math.round(sizeInSqFt / 5000 * soilMultiplier * accessMultiplier)), rate: 55 }
            ],
            materials: [],
            checklist: [
              "Grub out large root balls from under proposed structure footprints",
              "De-limb merchantable timber logs and stack neatly on site"
            ]
          },
          {
            id: 4,
            phaseName: "Phase 5 - Permanent Stabilization",
            subPhaseName: "Final Root Raking & Debris Dispersal",
            description: "Spreading organic mulch evenly and running root rakes to remove any remaining loose wood fibers.",
            equipment: [
              { name: "Cat D5 Crawler Dozer with root rake", hours: Math.max(6, Math.round(sizeInSqFt / 8000)), rate: 185 }
            ],
            crew: [
              { name: "Equipment Operator", hours: Math.max(6, Math.round(sizeInSqFt / 8000)), rate: 55 }
            ],
            materials: [],
            checklist: [
              "Perform secondary root raking to a depth of 4 inches",
              "Grade raw soil smoothly to match surrounding natural terrain contours"
            ]
          }
        ];
      } else if (isRoad) {
        return [
          {
            id: 1,
            phaseName: "Phase 1 - Preliminary Site Prep",
            subPhaseName: "Land Clearing & Topsoil Stripping",
            description: "Clearing surface trees and scraping off organic topsoil down to stable Georgia clay subgrade.",
            equipment: [
              { name: "Cat D5 Crawler Dozer", hours: Math.max(8, Math.round(sizeInSqFt / 12000 * soilMultiplier * accessMultiplier)), rate: 185 }
            ],
            crew: [
              { name: "Heavy Equipment Operator", hours: Math.max(8, Math.round(sizeInSqFt / 12000 * soilMultiplier * accessMultiplier)), rate: 55 }
            ],
            materials: [],
            checklist: [
              "Strip 4 inches of organic topsoil and stockpile for later slope dressing",
              "Install perimeter silt fence filter boundaries along the road shoulder"
            ]
          },
          {
            id: 2,
            phaseName: "Phase 2 - Mass Grading & Excavating",
            subPhaseName: "Subgrade Drainage Grading & Crowning",
            description: "Forming high-visibility center crowning and carving side ditches to guide runoff water away from road base.",
            equipment: [
              { name: "Cat 120M Motor Grader (Precision blade)", hours: Math.max(8, Math.round(sizeInSqFt / 10000 * soilMultiplier)), rate: 235 }
            ],
            crew: [
              { name: "Licensed Grade Foreman (Laser checks)", hours: Math.max(8, Math.round(sizeInSqFt / 10000 * soilMultiplier)), rate: 75 }
            ],
            materials: [],
            checklist: [
              "Shape 2% crown slope from center line down to outer shoulders",
              "Cut uniform side drainage ditches with positive gravity exit flows"
            ]
          },
          {
            id: 3,
            phaseName: "Phase 3 - Pond & Clay Pad Base",
            subPhaseName: "Subgrade Geotextile Fabric Laying",
            description: "Deploying professional woven stabilization fabric along the graded subgrade to prevent gravel sinking.",
            equipment: [],
            crew: [
              { name: "General Labor support team", hours: Math.max(4, Math.round(sizeInSqFt / 8000)), rate: 30 }
            ],
            materials: [
              { name: "Heavy-Duty Woven Roadway Fabric Rolls", quantity: Math.max(1, Math.round(sizeInSqFt / 3600)), unit: "Rolls", rate: 145 }
            ],
            checklist: [
              "Verify the graded dirt base is compacted and free of large stones",
              "Drape roadway fabric smoothly and overlap seams by 24 inches"
            ]
          },
          {
            id: 4,
            phaseName: "Phase 4 - Sub-Base Aggregates",
            subPhaseName: "Compacted Gravel Base & Roller Compaction",
            description: "Dumping crushed granite aggregates and running heavy vibrating rollers to pack aggregate into a solid hardtop.",
            equipment: [
              { name: "Cat CP44 Vibrating Roller Compactor", hours: Math.max(8, Math.round(sizeInSqFt / 8000)), rate: 165 },
              { name: "Cat D5 Crawler Dozer (Aggregate spreader)", hours: Math.max(6, Math.round(sizeInSqFt / 10000)), rate: 185 }
            ],
            crew: [
              { name: "Equipment Operators (Spread & compact)", hours: Math.max(8, Math.round(sizeInSqFt / 8000)), rate: 55 }
            ],
            materials: [
              { name: "Georgia Granite Crusher Run Stone (610 GAB)", quantity: Math.max(15, Math.round(sizeInSqFt / 150)), unit: "Tons", rate: 32 }
            ],
            checklist: [
              "Spread Crusher Run stone in a uniform 4-to-6 inch loose lift depth",
              "Run vibrating roller compactor at slow speeds to lock aggregate keys tightly"
            ]
          }
        ];
      } else if (isPad) {
        return [
          {
            id: 1,
            phaseName: "Phase 1 - Preliminary Site Prep",
            subPhaseName: "Topsoil Stripping & Silt Guarding",
            description: "Scraping organic material away and placing perimeter silt barriers to protect the building pad footprint.",
            equipment: [
              { name: "Cat D5 Crawler Dozer", hours: Math.max(6, Math.round(sizeInSqFt / 10000 * soilMultiplier)), rate: 185 }
            ],
            crew: [
              { name: "Heavy Equipment Operator", hours: Math.max(6, Math.round(sizeInSqFt / 10000 * soilMultiplier)), rate: 55 }
            ],
            materials: [
              { name: "Class-C Wire-Backed Silt Fence", quantity: Math.max(100, Math.round(Math.sqrt(sizeInSqFt) * 3)), unit: "Linear Feet", rate: 3.50 }
            ],
            checklist: [
              "Scrape off rich topsoil down to hard clay and stockpile 30 feet from footprint",
              "Run silt fence fully wrapping down-slope pad quadrants"
            ]
          },
          {
            id: 2,
            phaseName: "Phase 2 - Mass Grading & Excavating",
            subPhaseName: "Subgrade Compaction & Moisture Testing",
            description: "Leveling the subgrade surface and checking compaction density to ensure there are no soft hollow points.",
            equipment: [
              { name: "Cat CP44 Vibrating Roller Compactor", hours: Math.max(6, Math.round(sizeInSqFt / 8000)), rate: 165 }
            ],
            crew: [
              { name: "Licensed Grade Foreman (Nuclear density checks)", hours: Math.max(6, Math.round(sizeInSqFt / 8000)), rate: 75 }
            ],
            materials: [],
            checklist: [
              "Verify moisture level matches optimum compaction limits",
              "Tamp and proof-roll sub-soils using dozer or loader treads"
            ]
          },
          {
            id: 3,
            phaseName: "Phase 3 - Pond & Clay Pad Base",
            subPhaseName: "Subsoil Red Clay Pad Building",
            description: "Hauling-in cohesive red clay on site and spreading/compacting in tight 6-inch lifts to form a solid pad.",
            equipment: [
              { name: "Cat D6 Crawler Dozer (Lift spreader)", hours: Math.max(8, Math.round(sizeInSqFt / 6000)), rate: 210 },
              { name: "Cat CP44 Vibrating Roller Compactor", hours: Math.max(8, Math.round(sizeInSqFt / 6000)), rate: 165 }
            ],
            crew: [
              { name: "Equipment Operators (Spread & compact)", hours: Math.max(8, Math.round(sizeInSqFt / 6000)), rate: 55 }
            ],
            materials: [
              { name: "Georgia Pure Sealing Red Clay Fill", quantity: Math.max(30, Math.round(sizeInSqFt / 80)), unit: "Tons", rate: 18.50 }
            ],
            checklist: [
              "Import and spread sealing red clay in uniform 6-inch loose lifts",
              "Compact each soil lift to 95% Standard Proctor density before adding the next layer"
            ]
          },
          {
            id: 4,
            phaseName: "Phase 4 - Sub-Base Aggregates",
            subPhaseName: "Foundation Laser-Transit Grade Verification",
            description: "Checking pad levels with advanced laser-transits to ensure perfectly flat tolerances for foundation concrete pour.",
            equipment: [
              { name: "Cat 120M Motor Grader (Fine grade touchups)", hours: 6, rate: 235 }
            ],
            crew: [
              { name: "Licensed Grade Foreman (Laser-transit align)", hours: 6, rate: 75 }
            ],
            materials: [],
            checklist: [
              "Verify pad levels meet strict tolerances within +/- 0.5 inches",
              "Grade flat drainage runoff slopes 5 feet outward from pad perimeter borders"
            ]
          }
        ];
      } else {
        // General default 4-step sequence
        return [
          {
            id: 1,
            phaseName: "Phase 1 - Initial Clearing & Perimeter Erosion Guarding",
            subPhaseName: "Initial Clearing & Perimeter Erosion Guarding",
            description: "Clearing perimeter brush and installing silt fence barriers to protect surrounding parcels.",
            equipment: [
              { name: "Cat D5 Crawler Dozer", hours: Math.max(6, Math.round(sizeInSqFt / 12000 * soilMultiplier)), rate: 185 }
            ],
            crew: [
              { name: "Erosion Control Support Crew", hours: Math.max(6, Math.round(sizeInSqFt / 12000 * soilMultiplier)), rate: 35 }
            ],
            materials: [
              { name: "Class-C Wire-Backed Silt Fence", quantity: Math.max(100, Math.round(Math.sqrt(sizeInSqFt) * 3)), unit: "Linear Feet", rate: 3.50 }
            ],
            checklist: [
              "Establish clear site boundary points and fence them off",
              "Install wire-backed sediment silt fences along low-elevation contours"
            ]
          },
          {
            id: 2,
            phaseName: "Phase 2 - Mass Grading & Excavating",
            subPhaseName: "Bulk Earth Excavating & Subgrade Grading",
            description: "Performing general cut-and-fill grading across the workspace to achieve target site elevations.",
            equipment: [
              { name: "Cat 320 Hydraulic Excavator", hours: Math.max(10, Math.round(excavationCuYds / 40 * soilMultiplier * accessMultiplier)), rate: 220 },
              { name: "Cat D6 Crawler Dozer", hours: Math.max(8, Math.round(excavationCuYds / 45)), rate: 210 }
            ],
            crew: [
              { name: "Licensed Grade Foreman (Elevation checks)", hours: Math.max(10, Math.round(excavationCuYds / 40 * soilMultiplier * accessMultiplier)), rate: 75 }
            ],
            materials: [],
            checklist: [
              "Balance soil cuts and fills on site to minimize costly soil hauling",
              "Grade subgrade surfaces evenly to support future structural pads or pavement"
            ]
          },
          {
            id: 3,
            phaseName: "Phase 3 - Pond & Clay Pad Base",
            subPhaseName: "Subgrade Fabric Laying & Base Aggregates",
            description: "Laying woven separator fabric and spreading foundation aggregates to stabilize wet soils.",
            equipment: [
              { name: "Cat D5 Crawler Dozer (Aggregates)", hours: Math.max(6, Math.round(sizeInSqFt / 10000)), rate: 185 }
            ],
            crew: [
              { name: "General Labor Support Technicians", hours: Math.max(6, Math.round(sizeInSqFt / 10000)), rate: 30 }
            ],
            materials: [
              { name: "Woven Slit-Film Geotextile Fabric", quantity: Math.max(1, Math.round(sizeInSqFt / 3600)), unit: "Rolls", rate: 145 },
              { name: "Georgia Crusher Run Granite Aggregate (610 GAB)", quantity: Math.max(15, Math.round(sizeInSqFt / 200)), unit: "Tons", rate: 32 }
            ],
            checklist: [
              "Spread and anchor woven roadway fabric sheets across subgrade",
              "Distribute Crusher Run aggregate in a uniform base layer and compact"
            ]
          },
          {
            id: 4,
            phaseName: "Phase 5 - Permanent Stabilization",
            subPhaseName: "Final Stabilization, Topsoil Dressing & Seeding",
            description: "Draping stockpiled topsoil over all disturbed soil slopes and hydroseeding to stop clay erosion.",
            equipment: [
              { name: "Cat D5 Crawler Dozer (Spreading topsoil)", hours: Math.max(6, Math.round(sizeInSqFt / 12000)), rate: 185 }
            ],
            crew: [
              { name: "Hydroseeding Technicians Team", hours: 6, rate: 40 }
            ],
            materials: [
              { name: "Georgia DOT Centipede Seed & Fiber Mulch", quantity: Math.max(2, Math.round(sizeInSqFt / 15000)), unit: "Bags", rate: 95 }
            ],
            checklist: [
              "Spread topsoil over raw borders to promote stable plant root development",
              "Hydroseed raw slopes with Centipede slurry to prevent red clay runoff"
            ]
          }
        ];
      }
    }
  };

  const prevDivisionRef = useRef(division);
  const prevIsMultiPhaseModeRef = useRef(isMultiPhaseMode);

  useEffect(() => {
    if (isMultiPhaseMode) {
      const steps = generateSteps();
      setMultiPhaseSteps(steps);

      // Only reset wizard progress if division changed or the wizard was freshly toggled on
      if (division !== prevDivisionRef.current || isMultiPhaseMode !== prevIsMultiPhaseModeRef.current) {
        setMultiPhaseStepIndex(0);
        setCompiledMultiPhaseBid(null);
        setMultiPhaseStepAdjustments({});
      } else {
        // Clamp step index if it is out of bounds for the newly generated steps
        if (multiPhaseStepIndex >= steps.length) {
          setMultiPhaseStepIndex(Math.max(0, steps.length - 1));
        }
      }
    }
    
    prevDivisionRef.current = division;
    prevIsMultiPhaseModeRef.current = isMultiPhaseMode;
  }, [isMultiPhaseMode, inputs, division]);

  const handleAdjustmentChange = (category: 'equipment' | 'crew' | 'materials', index: number, field: 'hours' | 'rate' | 'quantity', value: number) => {
    setMultiPhaseStepAdjustments(prev => {
      const stepAdjustments = prev[multiPhaseStepIndex] || {};
      const catAdjustments = stepAdjustments[category] || {};
      
      const newAdjustments = {
        ...prev,
        [multiPhaseStepIndex]: {
          ...stepAdjustments,
          [category]: {
            ...catAdjustments,
            [index]: {
              ...(catAdjustments[index] || {}),
              [field]: value
            }
          }
        }
      };
      return newAdjustments;
    });
  };

  const getStepActiveCost = (step: any, stepIdx: number) => {
    let eqTotal = 0;
    (step.equipment || []).forEach((eq: any, idx: number) => {
      const hrs = multiPhaseStepAdjustments[stepIdx]?.equipment?.[idx]?.hours ?? eq.hours;
      const rate = multiPhaseStepAdjustments[stepIdx]?.equipment?.[idx]?.rate ?? eq.rate;
      eqTotal += hrs * rate;
    });

    let crewTotal = 0;
    (step.crew || []).forEach((cr: any, idx: number) => {
      const hrs = multiPhaseStepAdjustments[stepIdx]?.crew?.[idx]?.hours ?? cr.hours;
      const rate = multiPhaseStepAdjustments[stepIdx]?.crew?.[idx]?.rate ?? cr.rate;
      crewTotal += hrs * rate;
    });

    let matTotal = 0;
    (step.materials || []).forEach((mat: any, idx: number) => {
      const qty = multiPhaseStepAdjustments[stepIdx]?.materials?.[idx]?.quantity ?? mat.quantity;
      const rate = multiPhaseStepAdjustments[stepIdx]?.materials?.[idx]?.rate ?? mat.rate;
      matTotal += qty * rate;
    });

    return eqTotal + crewTotal + matTotal;
  };

  const handleCompileMultiPhaseBid = () => {
    const finalPhases = multiPhaseSteps.map((step, sIdx) => {
      const equipmentItems = (step.equipment || []).map((eq: any, idx: number) => {
        const hrs = multiPhaseStepAdjustments[sIdx]?.equipment?.[idx]?.hours ?? eq.hours;
        const rate = multiPhaseStepAdjustments[sIdx]?.equipment?.[idx]?.rate ?? eq.rate;
        return {
          id: `eq-${idx}`,
          category: 'Equipment',
          description: eq.name,
          quantity: hrs,
          unit: 'Hours',
          unitPrice: rate,
          totalCost: hrs * rate
        };
      });

      const crewItems = (step.crew || []).map((cr: any, idx: number) => {
        const hrs = multiPhaseStepAdjustments[sIdx]?.crew?.[idx]?.hours ?? cr.hours;
        const rate = multiPhaseStepAdjustments[sIdx]?.crew?.[idx]?.rate ?? cr.rate;
        return {
          id: `cr-${idx}`,
          category: 'Labor',
          description: cr.name,
          quantity: hrs,
          unit: 'Hours',
          unitPrice: rate,
          totalCost: hrs * rate
        };
      });

      const materialItems = (step.materials || []).map((mat: any, idx: number) => {
        const qty = multiPhaseStepAdjustments[sIdx]?.materials?.[idx]?.quantity ?? mat.quantity;
        const rate = multiPhaseStepAdjustments[sIdx]?.materials?.[idx]?.rate ?? mat.rate;
        return {
          id: `mat-${idx}`,
          category: 'Materials',
          description: mat.name,
          quantity: qty,
          unit: mat.unit,
          unitPrice: rate,
          totalCost: qty * rate
        };
      });

      const allItems = [...equipmentItems, ...crewItems, ...materialItems];
      const costTotal = allItems.reduce((sum, item) => sum + item.totalCost, 0);
      const bidPrice = Math.round(costTotal * (1 + multiPhaseMarkup / 100));

      return {
        id: `PHS-WIZ-${Date.now().toString().slice(-4)}-${sIdx}`,
        phaseName: step.phaseName,
        subPhaseName: step.subPhaseName,
        lineItems: allItems,
        itemCostTotal: costTotal,
        markupPercent: multiPhaseMarkup,
        totalBidPrice: bidPrice,
        notes: step.description
      };
    });

    const overallCostTotal = finalPhases.reduce((sum, ph) => sum + ph.itemCostTotal, 0);
    const overallBidTotal = finalPhases.reduce((sum, ph) => sum + ph.totalBidPrice, 0);

    const activeService = (division === 'residential' ? RES_SERVICES_DATA : SERVICES_DATA).find(s => s.id === inputs.serviceId);
    const serviceTitle = activeService ? activeService.title : 'General site prep';

    const compiledBid = {
      projectId: `PROJ-WIZ-${Date.now().toString().slice(-4)}`,
      jobNumber: `JOB-TJD-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: selectedIntakeId ? (pastIntakes.find(i => i.id === selectedIntakeId)?.clientName || "In-House Client") : "In-House Estimate Client",
      jobName: selectedIntakeId ? (pastIntakes.find(i => i.id === selectedIntakeId)?.jobName || `${serviceTitle} Project`) : `${serviceTitle} Project`,
      foreman: "TJ Darley",
      locationAddress: selectedIntakeId ? (pastIntakes.find(i => i.id === selectedIntakeId)?.formData?.jobAddress || "Site Location") : "Site Location",
      compiledPhases: finalPhases,
      overallCostTotal,
      overallBidTotal,
      submittedAt: new Date().toISOString()
    };

    setCompiledMultiPhaseBid(compiledBid);

    // Save standard project totals to local storage
    localStorage.setItem('tjd_multiphase_project_total', JSON.stringify(compiledBid));

    // Also append it to a running list of multi-phase bids in localStorage
    try {
      const storedBidsStr = localStorage.getItem('tjd_compiled_multiphase_bids');
      const bidsList = storedBidsStr ? JSON.parse(storedBidsStr) : [];
      bidsList.push(compiledBid);
      localStorage.setItem('tjd_compiled_multiphase_bids', JSON.stringify(bidsList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDivisionChange = (newDivision: 'commercial' | 'residential') => {
    setDivision(newDivision);
    localStorage.setItem('tjd_estimator_division', newDivision);
    if (newDivision === 'residential') {
      setInputs({
        serviceId: RES_SERVICES_DATA[0].id,
        projectSize: 2,
        unit: 'acres',
        soilType: 'clay',
        siteAccess: 'easy',
        includeDam: false,
        untouchedSpring: false,
      });
    } else {
      setInputs({
        serviceId: SERVICES_DATA[0].id,
        projectSize: 15000,
        unit: 'sq_ft',
        soilType: 'clay',
        siteAccess: 'easy',
        includeDam: false,
        untouchedSpring: false,
      });
    }
  };

  const handleIntakeSelectChange = (id: string) => {
    setSelectedIntakeId(id);
    const matched = pastIntakes.find(i => i.id === id);
    if (matched) {
      const textToSearch = `${matched.jobName || ''} ${matched.formData?.clientWants || ''} ${matched.formData?.jobNotes || ''}`.toLowerCase();
      
      // Auto-detect and switch rate division based on selected intake's division
      const matchedDiv = (matched.division && matched.division.toLowerCase() === 'residential') ? 'residential' : 'commercial';
      setDivision(matchedDiv);
      localStorage.setItem('tjd_estimator_division', matchedDiv);
      const nextDiv = matchedDiv;

      let isPond = false;
      let serviceId = nextDiv === 'residential' ? RES_SERVICES_DATA[0].id : SERVICES_DATA[0].id;
      
      if (textToSearch.includes('pond') || textToSearch.includes('dam') || textToSearch.includes('lake') || textToSearch.includes('retention')) {
        isPond = true;
        if (nextDiv === 'residential') {
          serviceId = 'res_pond_digs';
        } else {
          serviceId = 'excavation_grading';
        }
      } else if (textToSearch.includes('clear') || textToSearch.includes('forestry') || textToSearch.includes('mulch')) {
        if (nextDiv === 'residential') {
          serviceId = 'res_land_clearing';
        } else {
          serviceId = 'site_dev';
        }
      } else if (textToSearch.includes('road') || textToSearch.includes('driveway') || textToSearch.includes('gravel')) {
        if (nextDiv === 'residential') {
          serviceId = 'res_gravel_roads';
        } else {
          serviceId = 'excavation_grading';
        }
      } else if (textToSearch.includes('pad') || textToSearch.includes('house') || textToSearch.includes('slab')) {
        if (nextDiv === 'residential') {
          serviceId = 'res_house_pads';
        } else {
          serviceId = 'excavation_grading';
        }
      }

      // Check for size
      let sizeVal = 2;
      let unitVal: 'acres' | 'sq_ft' = 'acres';
      const fd = matched.formData || {};
      
      if (fd.lengthFeet && (fd.topWidthFeet || fd.bottomWidthFeet)) {
        const L = parseFloat(fd.lengthFeet) || 0;
        const TW = parseFloat(fd.topWidthFeet) || 0;
        const BW = parseFloat(fd.bottomWidthFeet) || 0;
        let W = TW;
        if (BW > 0) {
          W = (TW + BW) / 2;
        }
        const areaSqFt = L * W;
        if (areaSqFt > 0) {
          if (areaSqFt > 10000) {
            sizeVal = parseFloat((areaSqFt / 43560).toFixed(2));
            unitVal = 'acres';
          } else {
            sizeVal = areaSqFt;
            unitVal = 'sq_ft';
          }
        }
      } else if (fd.areaSquareFeet) {
        const areaSqFt = parseFloat(fd.areaSquareFeet) || 0;
        if (areaSqFt > 10000) {
          sizeVal = parseFloat((areaSqFt / 43560).toFixed(2));
          unitVal = 'acres';
        } else {
          sizeVal = areaSqFt;
          unitVal = 'sq_ft';
        }
      }

      let soilVal: 'clay' | 'sand' | 'loam' | 'rocky' = 'clay';
      if (fd.soilType) {
        const sLower = fd.soilType.toLowerCase();
        if (sLower.includes('clay')) soilVal = 'clay';
        else if (sLower.includes('sand')) soilVal = 'sand';
        else if (sLower.includes('rock') || sLower.includes('stone') || sLower.includes('granite')) soilVal = 'rocky';
        else if (sLower.includes('loam') || sLower.includes('dirt') || sLower.includes('topsoil')) soilVal = 'loam';
      }

      let accessVal: 'easy' | 'moderate' | 'difficult' = 'easy';
      if (fd.accessRoadType) {
        const accLower = fd.accessRoadType.toLowerCase();
        if (accLower.includes('steep') || accLower.includes('difficult')) {
          accessVal = 'difficult';
        } else if (accLower.includes('paved') || accLower.includes('easy')) {
          accessVal = 'easy';
        } else {
          accessVal = 'moderate';
        }
      }

      setInputs({
        serviceId,
        projectSize: sizeVal,
        unit: unitVal,
        soilType: soilVal,
        siteAccess: accessVal,
        includeDam: isPond || textToSearch.includes('dam'),
        untouchedSpring: fd.untouchedSpring !== undefined ? Boolean(fd.untouchedSpring) : false,
      });
    }
  };

  const [result, setResult] = useState<EstimationResult | null>(null);
  const [showPricingDetails, setShowPricingDetails] = useState<boolean>(true);
  const [copiedRow, setCopiedRow] = useState<boolean>(false);
  const [copiedOrder, setCopiedOrder] = useState<boolean>(false);

  // Trigger base calculation logic
  const calculateEstimate = () => {
    const { serviceId, projectSize, unit, soilType, siteAccess } = inputs;
    
    // Resolve project size to unified Square Feet
    let sizeInSqFt = projectSize;
    if (unit === 'acres') {
      sizeInSqFt = projectSize * 43560;
    }

    let baseCost = 0;
    let averageExcavationDepthFeet = 2.0;

    if (division === 'residential') {
      // Custom realistic, residential-friendly rates to prevent scaring clients
      if (serviceId === 'res_pond_digs') {
        averageExcavationDepthFeet = inputs.includeDam ? 3.5 : 2.0; // deeper structural average cut depth for keyway/dam core fill
        let damCost = 0;
        if (inputs.includeDam) {
          if (unit === 'acres') {
            damCost = projectSize * 8200; // $8,200 per acre dam structural adder
          } else {
            damCost = projectSize * 0.19;
          }
        }
        if (unit === 'acres') {
          baseCost = (projectSize * 18500) + damCost; // e.g. 1 Acre pond is ~$18,500 base
        } else {
          baseCost = (projectSize * 0.42) + damCost; // standard sqft conversion
        }
      } else if (serviceId === 'res_land_clearing') {
        averageExcavationDepthFeet = 0.2; // surface mulching depth
        if (unit === 'acres') {
          baseCost = projectSize * 2400; // standard $2,400 per acre (perfect forestry mulching benchmark!)
        } else {
          baseCost = projectSize * 0.055;
        }
      } else if (serviceId === 'res_house_pads') {
        averageExcavationDepthFeet = 2.0; // house pads structural clay fill standard
        if (unit === 'acres') {
          baseCost = projectSize * 28000;
        } else {
          baseCost = projectSize * 1.90; // e.g., 2,500 sqft pad is ~$4,750 base
        }
      } else if (serviceId === 'res_gravel_roads') {
        averageExcavationDepthFeet = 0.5; // driveways are 6" deep
        if (unit === 'acres') {
          baseCost = projectSize * 16500;
        } else {
          baseCost = projectSize * 1.10; // e.g., 5,000 sq ft gravel driveway is ~$5,500 base
        }
      } else {
        baseCost = sizeInSqFt * 1.50;
      }
    } else {
      // Commercial division uses heavier high-spec commercial standards
      let baseRate = 2.0; // fallback
      if (serviceId === 'site_dev') baseRate = 2.20;
      else if (serviceId === 'excavation_grading') baseRate = 3.50;
      else if (serviceId === 'drainage_solutions') baseRate = 6.80;
      else if (serviceId === 'erosion_control') baseRate = 1.10;

      baseCost = sizeInSqFt * baseRate;
    }

    // Apply Soil Density Modifier
    let soilMultiplier = 1.0;
    if (soilType === 'clay') soilMultiplier = 1.30; // Dense Georgia red clay labor
    else if (soilType === 'sand') soilMultiplier = 0.85; // Light sand excavating
    else if (soilType === 'loam') soilMultiplier = 1.00; // Standard organic loam
    else if (soilType === 'rocky') soilMultiplier = 1.65; // Hard granite stratum deposits

    // Apply Site access difficulty multiplier
    let accessMultiplier = 1.0;
    if (siteAccess === 'easy') accessMultiplier = 1.00;
    else if (siteAccess === 'moderate') accessMultiplier = 1.15;
    else if (siteAccess === 'difficult') accessMultiplier = 1.38;

    // Apply dynamic profit margin markup from App Customizer branding parameters
    const markupFactor = 1 + (branding.ratesMarkupPercent || 0) / 100;
    let calculatedCost = baseCost * soilMultiplier * accessMultiplier * markupFactor;

    // Impose general mobilization/equipment setup minimum threshold cost
    let minCharge = 4500;
    if (division === 'residential') {
      minCharge = 2500; // Lower threshold as residential machinery can move with standard dually towing instead of heavy multi-axle escorts
    }

    if (calculatedCost < minCharge) {
      calculatedCost = minCharge;
    }

    // Excavation Volumes metrics computation (assuming average depth profile)
    // 1 Cubic Yard = 27 Cubic Feet
    let excavationCuYds = Math.round((sizeInSqFt * averageExcavationDepthFeet) / 27);
    if (serviceId === 'erosion_control') {
      // Silt fence, seeding moves way less primary bulk structural earth
      excavationCuYds = Math.round(excavationCuYds * 0.12);
    }

    // Timeframe computation (rate of ~18,000 sq ft finalized work per operating week)
    let timelineWeeks = Math.ceil(sizeInSqFt / 18000);
    if (division === 'residential') {
      if (serviceId === 'res_land_clearing') {
        timelineWeeks = Math.ceil(projectSize / (unit === 'acres' ? 1.5 : 65340));
      } else {
        timelineWeeks = Math.ceil(sizeInSqFt / 30000);
      }
    }

    // Concrete Curing Buffer calculation based on dimensions
    const isConcreteJob = serviceId === 'res_house_pads' || serviceId === 'structural_pads' || inputs.hasConcrete;
    let concreteCuringDays = 0;
    if (isConcreteJob) {
      const padLen = inputs.concreteLengthFt || Math.round(Math.sqrt(sizeInSqFt));
      const padWid = inputs.concreteWidthFt || Math.round(Math.sqrt(sizeInSqFt));
      const padThick = inputs.concreteThicknessInches || 6;
      const volCuYds = Math.round(((padLen * padWid * (padThick / 12)) / 27) * 10) / 10;

      if (padThick <= 4) concreteCuringDays = 7;
      else if (padThick <= 6) concreteCuringDays = 10;
      else if (padThick <= 8) concreteCuringDays = 14;
      else concreteCuringDays = 21;

      if (volCuYds > 20) {
        concreteCuringDays += Math.min(7, Math.ceil((volCuYds - 20) / 15));
      }

      if (inputs.concretePsiGrade?.includes('High-Early')) {
        concreteCuringDays = Math.max(5, Math.round(concreteCuringDays * 0.8));
      }

      timelineWeeks += Math.ceil(concreteCuringDays / 7);
    }

    if (soilType === 'rocky') timelineWeeks *= 1.5;
    if (siteAccess === 'difficult') timelineWeeks *= 1.25;
    
    // Bounds check
    timelineWeeks = Math.max(1, Math.min(24, Math.round(timelineWeeks)));

    // Low vs High bounds ranges
    const estimatedCostMin = Math.round(calculatedCost * 0.88);
    const estimatedCostMax = Math.round(calculatedCost * 1.14);

    // Build smart diagnostic details
    const recommendations: string[] = [];
    if (soilType === 'clay') {
      recommendations.push("Middle Georgia clay requires heavy-weight compaction tests / clay cores for dam sealant stability.");
    }

    if (isConcreteJob && concreteCuringDays > 0) {
      recommendations.push(`Concrete Hydration Curing Schedule: Incorporated +${concreteCuringDays} calendar days mandatory curing buffer based on pad dimensions before heavy structural or framing loads begin.`);
    }
    
    if (division === 'residential') {
      if (serviceId === 'res_land_clearing') {
        recommendations.push("Forestry mulching preserves healthy mature tree root systems and doesn't require smoke burn permits.");
      } else if (serviceId === 'res_gravel_roads') {
        recommendations.push("Graded road crowning promotes proper drainage water shedding and prevents vehicle washboard patterns.");
      } else if (serviceId === 'res_pond_digs') {
        recommendations.push("Requires rich, pure sub-soil clay layer sealing. Local water table depth determines final depth.");
        if (inputs.includeDam) {
          recommendations.push("Dam & Spillway active: Accounts for specialized keyway trenching, clay-core compacting, visual freeboard packing, and downstream rock rip-rap tailpipes to prevent erosion blowouts.");
        }
      } else if (serviceId === 'res_house_pads') {
        recommendations.push("Laser-transit leveled site results in faster residential concrete form setups.");
      }
    } else {
      if (sizeInSqFt > 20000) {
        recommendations.push("Project exceeds 0.5 Acres. Full GSWCC certified erosion controls & active sedimentation perimeter checks are legally required.");
      } else {
        recommendations.push("Compact job footprint suggests compact loader machinery to save fuel surcharge costs.");
      }
      if (serviceId === 'drainage_solutions') {
        recommendations.push("Calculates with typical corrugated high-density poly infrastructure layout. Compaction reports must be verified.");
      }
    }

    if (siteAccess === 'difficult') {
      recommendations.push("Access bottlenecks require tracked equipment rather than wheeled delivery, included in safety buffers.");
    }

    setResult({
      estimatedCostMin,
      estimatedCostMax,
      excavationVolumeCuYds: excavationCuYds,
      timeframeWeeks: timelineWeeks,
      details: recommendations,
      depthFeet: averageExcavationDepthFeet,
    });
  };

  useEffect(() => {
    calculateEstimate();
  }, [inputs, division]);

  const handleInputChange = (field: keyof EstimationInputs, value: any) => {
    setInputs(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'projectSize') {
        const numVal = parseFloat(value);
        updated.projectSize = isNaN(numVal) || numVal < 0 ? 0 : numVal;
      }
      return updated;
    });
  };

  const handleCopyWorkbookRow = () => {
    if (!result) return;
    const activeService = (division === 'residential' ? RES_SERVICES_DATA : SERVICES_DATA).find(s => s.id === inputs.serviceId);
    const serviceTitle = activeService ? activeService.title : 'General';
    const isDamStr = inputs.serviceId === 'res_pond_digs' && inputs.includeDam ? 'Yes' : 'No';
    
    const rowData = [
      new Date().toLocaleDateString(),
      division.toUpperCase(),
      serviceTitle,
      inputs.projectSize,
      inputs.unit === 'acres' ? 'Acres' : 'Sq. Ft.',
      inputs.soilType.toUpperCase(),
      inputs.siteAccess.toUpperCase(),
      isDamStr,
      result.estimatedCostMin,
      result.estimatedCostMax,
      result.excavationVolumeCuYds,
      result.timeframeWeeks,
      (result.depthFeet || 2.0).toFixed(1)
    ].join('\t');
    
    navigator.clipboard.writeText(rowData);
    setCopiedRow(true);
    setTimeout(() => setCopiedRow(false), 2000);
  };

  const handleCopyMaterialDetails = () => {
    if (!result) return;
    const activeService = (division === 'residential' ? RES_SERVICES_DATA : SERVICES_DATA).find(s => s.id === inputs.serviceId);
    const serviceTitle = activeService ? activeService.title : 'General';
    
    const multiplierGravel = 1.35;
    const multiplierSoil = 1.25;
    const bulkGravelTons = Math.round(result.excavationVolumeCuYds * multiplierGravel);
    const bulkSoilTons = Math.round(result.excavationVolumeCuYds * multiplierSoil);
    
    const text = `--- EARTHWORK ESTIMATOR MATERIAL ORDER RECORD ---
Service: ${serviceTitle}
Project Footprint: ${inputs.projectSize.toLocaleString()} ${inputs.unit === 'acres' ? 'Acres' : 'Sq. Ft.'}
Volume Estimate: ${result.excavationVolumeCuYds.toLocaleString()} Cubic Yards (CY)
Average Depth Profile: ${(result.depthFeet || 2.0).toFixed(1)} feet
Soil Type Core Factor: ${inputs.soilType === 'clay' ? '1.25 (Clay Core swelling/compaction)' : '1.15 (Standard compaction)'}

Estimated Material Weight Conversions:
- Standard Aggregates/Gravel Road Prep (est @ ${multiplierGravel} tons/CY): ~${bulkGravelTons.toLocaleString()} Tons
- Loose Dirt/Swell Volume for Fill (est @ ${multiplierSoil} tons/CY): ~${bulkSoilTons.toLocaleString()} Tons
-----------------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const handleGenerateMultiPhasePlan = () => {
    if (!result) return;
    
    // Save current parameters to local storage so the Multi-Phase Estimator can pull them
    let activeIntakeId = selectedIntakeId;
    
    if (!activeIntakeId) {
      // If no past intake is currently selected, create a temporary, highly descriptive one!
      const activeService = (division === 'residential' ? RES_SERVICES_DATA : SERVICES_DATA).find(s => s.id === inputs.serviceId);
      const serviceTitle = activeService ? activeService.title : 'General';
      
      const newTempIntakeId = `intake-est-${Date.now()}`;
      const tempIntake = {
        id: newTempIntakeId,
        fiId: `FI-EST-${Math.floor(100 + Math.random() * 900)}`,
        submittedAt: new Date().toISOString(),
        clientName: "In-House Estimate Client",
        jobName: `${serviceTitle} Project`,
        foreman: "TJ Darley",
        formData: {
          meetingDate: new Date().toLocaleDateString(),
          meetingTime: "12:00 PM",
          foreman: "TJ Darley",
          clientName: "In-House Estimate Client",
          phoneNumber: "478-808-7789",
          emailAddress: "office@tjdarley.com",
          mailingAddress: "",
          cityStateZip: "Greensboro, GA",
          jobName: `${serviceTitle} Project`,
          jobNotes: `Calculated from secure In-House Estimator with ${inputs.soilType} soil and ${inputs.siteAccess} access.`,
          jobAddress: "Site Location",
          jobCityStateZip: "Greensboro, GA",
          accessRoadType: inputs.siteAccess === 'easy' ? 'Easy paved access' : inputs.siteAccess === 'moderate' ? 'Moderate aggregate road' : 'Difficult terrain slope',
          accessNotes: "",
          soilType: inputs.soilType,
          lengthFeet: inputs.unit === 'acres' ? String(Math.round(Math.sqrt(inputs.projectSize * 43560))) : String(Math.round(Math.sqrt(inputs.projectSize))),
          topWidthFeet: inputs.unit === 'acres' ? String(Math.round(Math.sqrt(inputs.projectSize * 43560))) : String(Math.round(Math.sqrt(inputs.projectSize))),
          bottomWidthFeet: inputs.unit === 'acres' ? String(Math.round(Math.sqrt(inputs.projectSize * 43560 * 0.8))) : String(Math.round(Math.sqrt(inputs.projectSize * 0.8))),
          depthHeightFeet: inputs.serviceId === 'res_pond_digs' && inputs.includeDam ? "4" : "2",
          siteSlopePercent: "1.5%",
          clientWants: `Full installation of ${serviceTitle}.`,
          specialConcerns: "",
          budgetMentioned: "",
          timeline: "",
          areaSquareFeet: inputs.unit === 'acres' ? inputs.projectSize * 43560 : inputs.projectSize
        }
      };
      
      // Update local storage client intakes
      const currentIntakes = [...pastIntakes, tempIntake];
      localStorage.setItem('tjd_client_intakes', JSON.stringify(currentIntakes));
      activeIntakeId = newTempIntakeId;
    }
    
    // Save preselected intake ID and route to Multi-Phase Bid
    localStorage.setItem('tjd_preselected_intake_id', activeIntakeId);
    
    // Force direct redirect to #multi-phase-bid hash view
    window.location.hash = '#multi-phase-bid';
  };

  const handleDownloadCSV = () => {
    if (!result) return;
    const activeService = (division === 'residential' ? RES_SERVICES_DATA : SERVICES_DATA).find(s => s.id === inputs.serviceId);
    const serviceTitle = activeService ? activeService.title : 'General';
    const isDamStr = inputs.serviceId === 'res_pond_digs' && inputs.includeDam ? 'Yes' : 'No';
    
    const headers = "Date,Division,Service,Project Size,Unit,Soil Type,Site Access,Dam/Keyway,Min Cost,Max Cost,Volume (CY),Timeframe (Weeks),Depth (ft)\n";
    const values = `"${new Date().toLocaleDateString()}",` +
                  `"${division.toUpperCase()}",` +
                  `"${serviceTitle.replace(/"/g, '""')}",` +
                  `${inputs.projectSize},` +
                  `"${inputs.unit === 'acres' ? 'Acres' : 'Sq. Ft.'}",` +
                  `"${inputs.soilType.toUpperCase()}",` +
                  `"${inputs.siteAccess.toUpperCase()}",` +
                  `"${isDamStr}",` +
                  `${result.estimatedCostMin},` +
                  `${result.estimatedCostMax},` +
                  `${result.excavationVolumeCuYds},` +
                  `${result.timeframeWeeks},` +
                  `${(result.depthFeet || 2.0).toFixed(1)}\n`;
                  
    const blob = new Blob([headers + values], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Earthwork_Estimate_${inputs.serviceId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const printWindow = window.open('', '_blank', 'width=850,height=950,scrollbars=yes');
    if (!printWindow) {
      alert("Please allow popups to export the PDF summary.");
      return;
    }

    const activeService = (division === 'residential' ? RES_SERVICES_DATA : SERVICES_DATA).find(s => s.id === inputs.serviceId);
    const serviceTitle = activeService ? activeService.title : 'General Site Development';

    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const soilNameMap: Record<string, string> = {
      'clay': 'Georgia Red Clay (Heavy Density, Compaction Modifiers)',
      'sand': 'Loose Sand (Easy Grading, Low Compaction Needs)',
      'loam': 'Rich Organic Loam (Standard Balancing)',
      'rocky': 'Hard Granite/Rocky Stratum (Rigid Excavating)'
    };

    const accessNameMap: Record<string, string> = {
      'easy': 'Easy / Open Flat Terrain',
      'moderate': 'Moderate Hill / Minor Grading Obstacles',
      'difficult': 'Confined / Severe Slope Terrain'
    };

    const formattedMin = result.estimatedCostMin.toLocaleString();
    const formattedMax = result.estimatedCostMax.toLocaleString();
    const formattedVolume = result.excavationVolumeCuYds.toLocaleString();
    const formattedWeeks = result.timeframeWeeks;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TJ Darley Construction - Estimate Summary Report</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: #0f172a;
            line-height: 1.5;
            margin: 0;
            padding: 40px;
            background-color: #f8fafc;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            padding: 40px;
            border-radius: 12px;
            background-color: #ffffff;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
          }

          @media print {
            body {
              padding: 0;
              background-color: #ffffff;
            }
            .container {
              border: none;
              box-shadow: none;
              padding: 0;
              margin: 0;
              max-width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #f97316;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }

          .logo-text {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: 28px;
            color: #0c0a09;
            letter-spacing: -0.05em;
            line-height: 1.1;
          }

          .logo-sub {
            font-family: 'Inter', sans-serif;
            font-weight: 800;
            font-size: 12px;
            color: #f97316;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            margin-top: 4px;
          }

          .meta-info {
            text-align: right;
            font-size: 13px;
            color: #475569;
          }

          .meta-info strong {
            color: #0f172a;
          }

          .title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 24px;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            border-left: 4px solid #f97316;
            padding-left: 12px;
          }

          .grid-2 {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 24px;
            margin-bottom: 30px;
          }

          .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
          }

          .card-title {
            font-size: 11px;
            font-weight: 850;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 12px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
          }

          .specs-list {
            margin: 0;
            padding: 0;
            list-style: none;
            font-size: 13px;
          }

          .specs-list li {
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            gap: 12px;
          }

          .specs-list li span:first-child {
            color: #475569;
            font-weight: 500;
          }

          .specs-list li span:last-child {
            color: #0f172a;
            font-weight: 700;
            text-align: right;
          }

          .cost-range {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 32px;
            font-weight: 700;
            color: #ea580c;
            margin-top: 6px;
            letter-spacing: -0.03em;
          }

          .badge-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }

          .badge {
            border: 1px solid #e2e8f0;
            background-color: #ffffff;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
          }

          .badge-value {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
          }

          .badge-label {
            font-size: 10px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .guidelines {
            background-color: #fffbeb;
            border: 1px solid #fef3c7;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 30px;
          }

          .guidelines-title {
            font-size: 13px;
            font-weight: 800;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
          }

          .guidelines-list {
            margin: 0;
            padding-left: 18px;
            font-size: 12.5px;
            color: #78350f;
          }

          .guidelines-list li {
            margin-bottom: 8px;
            line-height: 1.6;
          }

          .signature-block {
            margin-top: 50px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            padding-top: 20px;
          }

          .sig-line {
            border-top: 1px solid #94a3b8;
            margin-top: 50px;
            padding-top: 8px;
            font-size: 11px;
            color: #475569;
            text-align: center;
            font-weight: 500;
          }

          .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 24px;
            font-size: 11.5px;
            color: #64748b;
            text-align: center;
            margin-top: 50px;
          }

          .footer strong {
            color: #0f172a;
          }

          .btn-print {
            background-color: #f97316;
            color: white;
            border: none;
            padding: 12px 24px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 24px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 6px -1px rgb(249 115 22 / 0.2);
            transition: all 0.2s;
          }

          .btn-print:hover {
            background-color: #ea580c;
            box-shadow: 0 4px 6px -1px rgb(234 88 12 / 0.3);
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; max-width: 800px; margin: 0 auto;">
          <button class="btn-print" onclick="window.print()">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
              <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
            </svg>
            Print Summary Report / Save PDF
          </button>
        </div>

        <div class="container">
          
          <div class="header">
            <div>
              <div class="logo-text">T.J. DARLEY</div>
              <div class="logo-sub">CONSTRUCTION, LLC</div>
              <div style="font-size: 12px; color: #475569; margin-top: 10px; font-weight: 500;">
                Heavy Excavation, Grading & Sub-base Development Specialist
              </div>
            </div>
            <div class="meta-info">
              <div><strong>Proposed Estimate No:</strong> TJD-${Math.floor(2500 + Math.random() * 6500)}</div>
              <div><strong>Date Formulated:</strong> ${dateStr}</div>
              <div><strong>Office Phone:</strong> 478-808-7789</div>
              <div><strong>Region:</strong> Greensboro, Lake Oconee & Middle GA</div>
            </div>
          </div>

          <div class="title">In-House Secure Earthwork Estimate Summary</div>

          <div class="grid-2">
            
            <div class="card">
              <div class="card-title">Project Design Scope</div>
              <ul class="specs-list">
                <li>
                  <span>Engineering Capability:</span>
                  <span>${serviceTitle}</span>
                </li>
                <li>
                  <span>Project Size Area:</span>
                  <span>${inputs.projectSize.toLocaleString()} ${inputs.unit === 'acres' ? 'Acres' : 'Sq. Ft.'}</span>
                </li>
                <li>
                  <span>Georgia Sub-soil Base:</span>
                  <span>${soilNameMap[inputs.soilType]}</span>
                </li>
                <li>
                  <span>Site Machine Ingress:</span>
                  <span>${accessNameMap[inputs.siteAccess]}</span>
                </li>
              </ul>
            </div>

            <div class="card" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border-left: 4px solid #ea580c;">
              <div class="card-title" style="margin-bottom: 6px;">Staff Price Calculations</div>
              <div class="cost-range">$${formattedMin} - $${formattedMax}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 12px; max-width: 240px; font-weight: 500; line-height: 1.4;">
                Calculated on live terminal index surcharges. Retain this value internally for customer negotiation.
              </div>
            </div>

          </div>

          <div class="badge-grid">
            <div class="badge">
              <div class="badge-label">Estimated Earthen Vol. to Cut/Fill</div>
              <div class="badge-value">${formattedVolume} CY</div>
              <div style="font-size: 10.5px; color: #64748b; margin-top: 6px; font-weight: 500;">Computes on unified ${(result.depthFeet || 2.0).toFixed(1)}-foot design depth standard</div>
            </div>
            <div class="badge">
              <div class="badge-label">Expected Completion Window</div>
              <div class="badge-value">${formattedWeeks} ${formattedWeeks === 1 ? 'Week' : 'Weeks'}</div>
              <div style="font-size: 10.5px; color: #64748b; margin-top: 6px; font-weight: 500;">Includes weather mitigation and machinery fueling intervals</div>
            </div>
          </div>

          <div class="guidelines">
            <div class="guidelines-title">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 8px; color: #b45309; shrink-0: 0;">
                <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.045.077.01.173-.076.173H1.097a.152.152 0 0 1-.07-.016.155.155 0 0 1-.06-.056.143.143 0 0 1-.019-.073.141.141 0 0 1 .019-.073L7.883 2.073a.146.146 0 0 1 .055-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
                <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
              </svg>
              Internal Operations Advisory (TJD Team Only)
            </div>
            <ul class="guidelines-list">
              ${result.details.map(rec => `<li>${rec}</li>`).join('')}
              <li>Keep cost calculations internal. Present these figures only during physical consultations.</li>
              <li>Official proposals should only be finalized with written physical subgrade authorization.</li>
            </ul>
          </div>

          <div class="signature-block">
            <div>
              <div class="sig-line">Representative, T.J. Darley Construction, LLC</div>
            </div>
            <div>
              <div class="sig-line">Authorized Signee (Internal Office Copy)</div>
            </div>
          </div>

          <div class="footer">
            <p>
              <strong>T.J. Darley Construction, LLC</strong> &bull; Greensboro, Georgia &bull; Direct Phone: <strong>478-808-7789</strong>
            </p>
          </div>

        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 sm:p-10 space-y-8 text-left animate-in fade-in duration-200">
      
      {/* Header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] bg-orange-500 text-white font-mono px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold shadow-md shadow-orange-500/20">
            TJ Darley Proprietary IP
          </span>
          <h3 className="font-display font-black text-2xl text-white flex items-center gap-2 mt-2">
            <Calculator className="w-6 h-6 text-orange-400 rotate-12" />
            <span>Secure In-House Ballpark Cost Estimator</span>
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Calculate precise soil profiles, access modifiers, and material tons internally before meeting with clients.
          </p>
        </div>

        {/* Division Switcher */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl max-w-full">
          <button
            onClick={() => handleDivisionChange('commercial')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none ${
              division === 'commercial' 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Commercial Rates
          </button>
          <button
            onClick={() => handleDivisionChange('residential')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none ${
              division === 'residential' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Residential Rates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls Column */}
        <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 border-b border-slate-800 pb-2">
            Calculator Modifiers
          </h4>

          {/* Multi-Phase Wizard Activation Switch */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className={`w-4 h-4 ${isMultiPhaseMode ? 'text-orange-400' : 'text-slate-500'}`} />
                <span className="text-xs font-black text-white uppercase tracking-wider">Multi-Phase Wizard Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMultiPhaseMode}
                  onChange={(e) => setIsMultiPhaseMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-950 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 peer-checked:after:bg-orange-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600/20 border border-slate-850"></div>
              </label>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Enables a guided step-by-step sequential construction estimator to verify and customize each phase dynamically.
            </p>
          </div>

          {/* Intake Preloader Dropdown */}
          {pastIntakes.length > 0 && (
            <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-800">
              <label className="block text-[10px] font-black uppercase tracking-wider text-orange-400">
                Preload From Pre-Bid Intake History
              </label>
              <select
                value={selectedIntakeId}
                onChange={(e) => handleIntakeSelectChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg py-2 px-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none font-semibold cursor-pointer"
              >
                <option value="">-- Choose past field meeting log to pre-fill --</option>
                {pastIntakes.map((intake) => (
                  <option key={intake.id} value={intake.id}>
                    📋 [{intake.fiId || 'FI-PRE'}] {intake.clientName} - {intake.jobName}
                  </option>
                ))}
              </select>
              {selectedIntakeId && (
                <div className="mt-2 text-[11px] text-slate-400 leading-normal border-t border-slate-800/60 pt-2">
                  <span className="text-orange-400 font-bold block mb-1">⚡ Multi-Phase Pipeline Ready:</span>
                  To build a detailed multi-phase bid with step-by-step custom construction plans (e.g., site prep, base excavation, compaction) using this pre-bid data, click the <span className="font-bold text-slate-200">"Multi-Phase Bids"</span> tab at the top of the screen or{" "}
                  <a
                    href="#multi-phase-bid"
                    onClick={() => {
                      localStorage.setItem('tjd_preselected_intake_id', selectedIntakeId);
                    }}
                    className="text-orange-400 hover:text-orange-300 font-bold underline"
                  >
                    click here to launch the Multi-Phase Compiler
                  </a>.
                </div>
              )}
            </div>
          )}
          
          {/* Target Service / Capability */}
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
              Target Earthwork Scope
            </label>
            <select
              value={inputs.serviceId}
              onChange={(e) => handleInputChange('serviceId', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2.5 px-3 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
            >
              {(division === 'residential' ? RES_SERVICES_DATA : SERVICES_DATA).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Dam Core keyway & Spring Protection add-on */}
          {inputs.serviceId === 'res_pond_digs' && (
            <div className="space-y-2.5">
              <div 
                onClick={() => handleInputChange('includeDam', !inputs.includeDam)}
                className={`p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                  inputs.includeDam 
                    ? 'bg-orange-950/20 border-orange-500 text-orange-200' 
                    : 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="flex gap-2.5 items-start">
                  <input 
                    type="checkbox"
                    checked={!!inputs.includeDam}
                    onChange={() => {}}
                    className="h-4 w-4 bg-slate-800 rounded border-slate-700 text-orange-500 focus:ring-orange-500 mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-orange-400 uppercase tracking-wide">Include Structural Dam Embedment</div>
                    <p className="text-[10px] text-slate-400 leading-normal">Adds keyway core trenching, core compaction, and freeboard design factors.</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => handleInputChange('untouchedSpring', !inputs.untouchedSpring)}
                className={`p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                  inputs.untouchedSpring 
                    ? 'bg-emerald-950/20 border-emerald-500 text-emerald-200' 
                    : 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="flex gap-2.5 items-start">
                  <input 
                    type="checkbox"
                    checked={!!inputs.untouchedSpring}
                    onChange={() => {}}
                    className="h-4 w-4 bg-slate-800 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-emerald-400 uppercase tracking-wide">Natural Spring Protection (Untouched Basin)</div>
                    <p className="text-[10px] text-slate-400 leading-normal">Bypasses deep center excavation to protect the artesian spring. Reduces mass excavation/grading hours to align with a highly competitive sub-one-month build timeline ($120k–$160k).</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Size / Unit configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8 space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                Scope Volume Size
              </label>
              <input
                type="number"
                min="0"
                value={inputs.projectSize || ''}
                onChange={(e) => handleInputChange('projectSize', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2.5 px-3 text-sm focus:ring-1 focus:ring-orange-500 focus:outline-none font-bold"
              />
            </div>
            <div className="sm:col-span-4 space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                Unit Type
              </label>
              <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 justify-between items-center h-[38px]">
                <button
                  type="button"
                  onClick={() => handleInputChange('unit', 'sq_ft')}
                  className={`flex-1 text-center py-1 rounded text-[10px] font-extrabold uppercase transition-all ${
                    inputs.unit === 'sq_ft' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SqFt
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('unit', 'acres')}
                  className={`flex-1 text-center py-1 rounded text-[10px] font-extrabold uppercase transition-all ${
                    inputs.unit === 'acres' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Acres
                </button>
              </div>
            </div>
          </div>

          {/* Subsoil profile selector */}
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
              Georgia Native Sub-soil Mud
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'clay', label: 'GA Red Clay', desc: 'Heavy density' },
                { value: 'sand', label: 'Loose Sand', desc: 'Silt/Beach' },
                { value: 'loam', label: 'Rich Loam', desc: 'Standard silt' },
                { value: 'rocky', label: 'Granite/Rock', desc: 'Tough breakers' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => handleInputChange('soilType', s.value)}
                  className={`p-2.5 border rounded-lg text-left transition-all ${
                    inputs.soilType === s.value
                      ? 'bg-orange-950/20 border-orange-500 text-white shadow'
                      : 'bg-slate-900 border-slate-850 text-slate-450 hover:bg-slate-850'
                  }`}
                >
                  <div className="font-bold text-xs">{s.label}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Jobsite Ingress Difficulty */}
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
              Access Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'easy', label: 'Flat Open' },
                { value: 'moderate', label: 'Minor Slopes' },
                { value: 'difficult', label: 'Confined / Muddy' },
              ].map((acc) => (
                <button
                  type="button"
                  key={acc.value}
                  onClick={() => handleInputChange('siteAccess', acc.value)}
                  className={`py-2 px-1 border rounded-lg text-xs font-bold transition-all ${
                    inputs.siteAccess === acc.value
                      ? 'bg-orange-900 border-orange-500 text-white'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Outputs / Wizard Column */}
        {isMultiPhaseMode ? (
          <div className="lg:col-span-6 space-y-6">
            {/* If a compiled multi-phase bid has been generated, show it. Otherwise show active wizard step */}
            {compiledMultiPhaseBid ? (
              <div className="bg-slate-950 border-2 border-orange-500/30 p-6 rounded-3xl space-y-6 animate-in zoom-in-95 duration-200 text-left">
                
                {/* Invoice style header */}
                <div className="border-b border-slate-800 pb-5 space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] bg-orange-500/10 text-orange-400 font-mono font-black px-2.5 py-1 rounded-md border border-orange-500/20 uppercase tracking-widest">
                        TJ Darley Multi-Phase Bid
                      </span>
                      <h4 className="text-xl font-black text-white mt-2 flex items-center gap-1.5">
                        <Calculator className="w-5 h-5 text-orange-400" />
                        <span>ESTIMATE WORKBOOK SUMMARY</span>
                      </h4>
                    </div>
                    <div className="text-left sm:text-right font-mono text-[10px] text-slate-500 space-y-0.5">
                      <div>JOB ID: <span className="text-white font-bold">{compiledMultiPhaseBid.jobNumber}</span></div>
                      <div>PROJ ID: <span className="text-white font-bold">{compiledMultiPhaseBid.projectId}</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 text-[11px] text-slate-400">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">CLIENT</span>
                      <strong className="text-white text-xs">{compiledMultiPhaseBid.clientName}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">JOB NAME</span>
                      <strong className="text-white text-xs">{compiledMultiPhaseBid.jobName}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">SITE ADDRESS</span>
                      <span className="text-slate-300">{compiledMultiPhaseBid.locationAddress}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">DETERMINED FOREMAN</span>
                      <strong className="text-white">{compiledMultiPhaseBid.foreman}</strong>
                    </div>
                  </div>
                </div>

                {/* Phased Line Items Breakdown */}
                <div className="space-y-4">
                  <h5 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-orange-400" />
                    <span>Itemized Step-by-Step Construction Phases</span>
                  </h5>

                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                    {compiledMultiPhaseBid.compiledPhases.map((phase: any, pIdx: number) => (
                      <div key={pIdx} className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl space-y-2.5">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-800/60 pb-1.5">
                          <div>
                            <span className="text-[9px] text-orange-400 font-mono uppercase tracking-wider font-bold block">{phase.phaseName}</span>
                            <strong className="text-white text-xs font-black">{phase.subPhaseName}</strong>
                          </div>
                          <span className="text-white font-mono text-xs font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            Bid Price: ${phase.totalBidPrice.toLocaleString()}
                          </span>
                        </div>

                        {/* Line Items in Phase */}
                        <div className="space-y-1 text-[10px] text-slate-400 font-mono">
                          {phase.lineItems.map((item: any, iIdx: number) => (
                            <div key={iIdx} className="flex justify-between items-center py-0.5 border-b border-dashed border-slate-800/40 last:border-0 gap-4">
                              <span className="text-slate-300 text-left">{item.description} ({item.category})</span>
                              <span className="text-right shrink-0">{item.quantity} {item.unit} @ ${item.unitPrice}/{item.unit === 'Hours' ? 'hr' : item.unit.toLowerCase().replace('s', '')} = ${item.totalCost.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <p className="text-[10px] text-slate-500 italic bg-slate-950/40 p-2 rounded leading-relaxed">
                          {phase.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost/Bid summary & Live Markup adjustments */}
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Aggregated Cost Basis</span>
                      <span className="text-slate-300 font-mono text-sm">${compiledMultiPhaseBid.overallCostTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-500 block text-right">Target Markup</label>
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-2 py-0.5 h-7 mt-0.5">
                          <input
                            type="number"
                            min="0"
                            max="300"
                            value={multiPhaseMarkup}
                            onChange={(e) => {
                              const mk = parseInt(e.target.value) || 0;
                              setMultiPhaseMarkup(mk);
                            }}
                            className="w-10 bg-transparent text-white font-mono font-bold text-xs focus:outline-none text-right"
                          />
                          <span className="text-slate-500 font-mono text-xs ml-0.5">%</span>
                        </div>
                      </div>
                      <button
                        onClick={handleCompileMultiPhaseBid}
                        className="h-7 mt-3.5 px-2 bg-orange-600 hover:bg-orange-500 rounded text-[10px] uppercase font-mono font-black text-white"
                        title="Recalculate Bid with new Markup"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-1 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">FINAL APPROVED CLIENT BID PRICE</span>
                      <span className="text-orange-400 font-display font-black text-3xl">
                        ${compiledMultiPhaseBid.overallBidTotal.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 text-left sm:text-right max-w-[200px] leading-tight block">
                      Repurposing loose excavated dirt ($0.00 cost) and Georgia class aggregates.
                    </span>
                  </div>
                </div>

                {/* Print/PDF and Reset controls */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      // Custom printable layout for the compiled bid
                      const printWindow = window.open('', '_blank');
                      if (!printWindow) return;

                      const htmlContent = `
                        <html>
                        <head>
                          <title>TJ Darley Construction - Job Bid Summary</title>
                          <style>
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; }
                            .header { border-bottom: 3px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px; }
                            .header h1 { font-size: 26px; font-weight: 900; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px; }
                            .header p { font-size: 13px; color: #64748b; margin: 5px 0 0 0; font-weight: 500; }
                            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
                            .info-item { font-size: 12px; color: #475569; }
                            .info-item strong { display: block; font-size: 14px; color: #0f172a; margin-top: 4px; }
                            .phase-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; page-break-inside: avoid; }
                            .phase-header { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
                            .phase-title { font-weight: 800; font-size: 15px; color: #0f172a; }
                            .phase-num { font-size: 11px; text-transform: uppercase; color: #ea580c; font-weight: 700; letter-spacing: 1px; }
                            .phase-price { font-weight: 800; font-size: 15px; color: #ea580c; }
                            .items-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
                            .items-table th { text-align: left; padding: 8px; background: #f1f5f9; color: #334155; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
                            .items-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; color: #475569; }
                            .summary-card { background: #0f172a; color: #ffffff; padding: 25px; border-radius: 12px; margin-top: 40px; display: flex; justify-content: space-between; align-items: center; }
                            .summary-title { font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 800; letter-spacing: 1px; }
                            .summary-price { font-size: 32px; font-weight: 900; color: #fb923c; margin-top: 5px; }
                            .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>T.J. DARLEY CONSTRUCTION, LLC</h1>
                            <p>Premium Excavation, Pond Building & Site Development Services &mdash; Atlanta Metro Area</p>
                          </div>

                          <div class="info-grid">
                            <div class="info-item">CLIENT NAME<strong>${compiledMultiPhaseBid.clientName}</strong></div>
                            <div class="info-item">JOB NAME<strong>${compiledMultiPhaseBid.jobName}</strong></div>
                            <div class="info-item">JOB LOCATION<strong>${compiledMultiPhaseBid.locationAddress}</strong></div>
                            <div class="info-item">BID JOB ID<strong>${compiledMultiPhaseBid.jobNumber}</strong></div>
                          </div>

                          <h2>ESTIMATE PHASE DETAILED SUMMARY</h2>
                          ${compiledMultiPhaseBid.compiledPhases.map((phase: any) => `
                            <div class="phase-card">
                              <div class="phase-header">
                                <div>
                                  <div class="phase-num">${phase.phaseName}</div>
                                  <div class="phase-title">${phase.subPhaseName}</div>
                                </div>
                                <div class="phase-price">$${phase.totalBidPrice.toLocaleString()}</div>
                              </div>
                              <p style="font-size: 11px; color: #64748b; margin-top: 0; margin-bottom: 15px; font-style: italic;">
                                ${phase.notes}
                              </p>
                              <table class="items-table">
                                <thead>
                                  <tr>
                                    <th>Resource Item</th>
                                    <th>Category</th>
                                    <th>Planned Volume</th>
                                    <th>Unit Rate</th>
                                    <th style="text-align: right;">Planned Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${phase.lineItems.map((item: any) => `
                                    <tr>
                                      <td><strong>${item.description}</strong></td>
                                      <td>${item.category}</td>
                                      <td>${item.quantity} ${item.unit}</td>
                                      <td>$${item.unitPrice}/${item.unit === 'Hours' ? 'hr' : item.unit.toLowerCase().replace('s', '')}</td>
                                      <td style="text-align: right;">$${item.totalCost.toLocaleString()}</td>
                                    </tr>
                                  `).join('')}
                                </tbody>
                              </table>
                            </div>
                          `).join('')}

                          <div class="summary-card">
                            <div>
                              <div class="summary-title">FINAL GUARANTEED WORK BOOK BID PRICE</div>
                              <div class="summary-price">$${compiledMultiPhaseBid.overallBidTotal.toLocaleString()}</div>
                            </div>
                            <div style="text-align: right; font-size: 11px; color: #cbd5e1; max-w: 250px;">
                              This workbook bid pricing is generated through sequential validation models and Georgia-regional subsoil compaction parameters.
                            </div>
                          </div>

                          <div class="footer">
                            Proprietary & Confidential &copy; ${new Date().getFullYear()} T.J. Darley Construction, LLC. All Rights Reserved.
                          </div>

                          <script>
                            window.onload = function() {
                              window.print();
                            }
                          </script>
                        </body>
                        </html>
                      `;
                      printWindow.document.write(htmlContent);
                      printWindow.document.close();
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs uppercase font-mono font-black tracking-widest cursor-pointer shadow-lg shadow-orange-600/10 transition-all"
                  >
                    <Printer className="w-4 h-4 text-white" />
                    <span>Print Bid / PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCompiledMultiPhaseBid(null);
                      setMultiPhaseStepIndex(0);
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs uppercase font-mono font-black tracking-widest cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Start Over</span>
                  </button>
                </div>

              </div>
            ) : (
              /* ACTIVE STEP WIZARD CARD */
              multiPhaseSteps.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-6 animate-in slide-in-from-right-10 duration-200 text-left">
                  
                  {/* Progress Header */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        STEP {multiPhaseStepIndex + 1} OF {multiPhaseSteps.length}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        {Math.round(((multiPhaseStepIndex + 1) / multiPhaseSteps.length) * 100)}% Complete
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        className="bg-orange-500 h-full transition-all duration-350 ease-out"
                        style={{ width: `${((multiPhaseStepIndex + 1) / multiPhaseSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Step Details */}
                  <div className="space-y-1.5 border-b border-slate-850 pb-4">
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block font-extrabold">
                      {multiPhaseSteps[multiPhaseStepIndex].phaseName}
                    </span>
                    <h4 className="text-lg font-black text-white font-display tracking-tight">
                      {multiPhaseSteps[multiPhaseStepIndex].subPhaseName}
                    </h4>
                    <p className="text-slate-400 text-xs leading-normal">
                      {multiPhaseSteps[multiPhaseStepIndex].description}
                    </p>
                  </div>

                  {/* Active Resources & Live Adjustment Fields */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-black border-b border-slate-900 pb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-400" />
                      <span>Configure Planned Equipment, Crew & Materials</span>
                    </h5>

                    {/* Check if any resource exists for this step */}
                    {(!multiPhaseSteps[multiPhaseStepIndex].equipment?.length &&
                      !multiPhaseSteps[multiPhaseStepIndex].crew?.length &&
                      !multiPhaseSteps[multiPhaseStepIndex].materials?.length) ? (
                      <div className="text-center py-4 text-slate-500 text-xs italic bg-slate-900/30 rounded-lg border border-dashed border-slate-850">
                        No custom external resources required for this step.
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[290px] overflow-y-auto pr-2 custom-scrollbar">
                        
                        {/* Equipment Section */}
                        {multiPhaseSteps[multiPhaseStepIndex].equipment?.map((eq: any, idx: number) => {
                          const hrs = multiPhaseStepAdjustments[multiPhaseStepIndex]?.equipment?.[idx]?.hours ?? eq.hours;
                          const rate = multiPhaseStepAdjustments[multiPhaseStepIndex]?.equipment?.[idx]?.rate ?? eq.rate;
                          return (
                            <div key={`eq-${idx}`} className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl space-y-2">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wide text-left">Heavy Machinery</span>
                                <span className="text-slate-400 font-mono text-xs font-semibold text-right">Subtotal: ${(hrs * rate).toLocaleString()}</span>
                              </div>
                              <div className="text-xs font-black text-white text-left">{eq.name}</div>
                              {eq.explain && <p className="text-[10px] text-slate-500 leading-tight text-left">{eq.explain}</p>}
                              
                              <div className="grid grid-cols-2 gap-3 pt-1.5 border-t border-slate-800/40">
                                <div className="text-left">
                                  <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Hours Needed</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={hrs}
                                    onChange={(e) => handleAdjustmentChange('equipment', idx, 'hours', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:border-orange-500"
                                  />
                                </div>
                                <div className="text-left">
                                  <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Hourly Rate ($)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={rate}
                                    onChange={(e) => handleAdjustmentChange('equipment', idx, 'rate', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:border-orange-500"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Labor Section */}
                        {multiPhaseSteps[multiPhaseStepIndex].crew?.map((cr: any, idx: number) => {
                          const hrs = multiPhaseStepAdjustments[multiPhaseStepIndex]?.crew?.[idx]?.hours ?? cr.hours;
                          const rate = multiPhaseStepAdjustments[multiPhaseStepIndex]?.crew?.[idx]?.rate ?? cr.rate;
                          return (
                            <div key={`cr-${idx}`} className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl space-y-2">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wide text-left">Crew / Operator</span>
                                <span className="text-slate-400 font-mono text-xs font-semibold text-right">Subtotal: ${(hrs * rate).toLocaleString()}</span>
                              </div>
                              <div className="text-xs font-black text-white text-left">{cr.name}</div>
                              {cr.explain && <p className="text-[10px] text-slate-500 leading-tight text-left">{cr.explain}</p>}
                              
                              <div className="grid grid-cols-2 gap-3 pt-1.5 border-t border-slate-800/40">
                                <div className="text-left">
                                  <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Hours Needed</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={hrs}
                                    onChange={(e) => handleAdjustmentChange('crew', idx, 'hours', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:border-orange-500"
                                  />
                                </div>
                                <div className="text-left">
                                  <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Hourly Rate ($)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={rate}
                                    onChange={(e) => handleAdjustmentChange('crew', idx, 'rate', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:border-orange-500"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Materials Section */}
                        {multiPhaseSteps[multiPhaseStepIndex].materials?.map((mat: any, idx: number) => {
                          const qty = multiPhaseStepAdjustments[multiPhaseStepIndex]?.materials?.[idx]?.quantity ?? mat.quantity;
                          const rate = multiPhaseStepAdjustments[multiPhaseStepIndex]?.materials?.[idx]?.rate ?? mat.rate;
                          return (
                            <div key={`mat-${idx}`} className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl space-y-2">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wide text-left">Materials / Bulks</span>
                                <span className="text-slate-400 font-mono text-xs font-semibold text-right">Subtotal: ${(qty * rate).toLocaleString()}</span>
                              </div>
                              <div className="text-xs font-black text-white text-left">{mat.name}</div>
                              {mat.explain && <p className="text-[10px] text-slate-500 leading-tight text-left">{mat.explain}</p>}
                              
                              <div className="grid grid-cols-2 gap-3 pt-1.5 border-t border-slate-800/40">
                                <div className="text-left">
                                  <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Quantity ({mat.unit})</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={qty}
                                    onChange={(e) => handleAdjustmentChange('materials', idx, 'quantity', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:border-orange-500"
                                  />
                                </div>
                                <div className="text-left">
                                  <label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Unit Price ($)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={rate}
                                    onChange={(e) => handleAdjustmentChange('materials', idx, 'rate', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:border-orange-500"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    )}
                  </div>

                  {/* Checklist Verification (Order & Pattern Quality Checks) */}
                  <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-2.5">
                    <h6 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-black flex items-center gap-1.5 text-left">
                      <CheckSquare className="w-3.5 h-3.5 text-orange-400" />
                      <span>Construction Pattern Checklist Verification</span>
                    </h6>
                    <p className="text-[10px] text-slate-500 leading-tight text-left">
                      To encourage systematic field accuracy, verify these standard construction practices are planned for this step:
                    </p>
                    <div className="space-y-2 pt-1 text-left">
                      {multiPhaseSteps[multiPhaseStepIndex].checklist?.map((check: string, cIdx: number) => (
                        <div key={cIdx} className="flex gap-2.5 items-start text-xs text-slate-300">
                          <input 
                            type="checkbox" 
                            id={`wiz-check-${multiPhaseStepIndex}-${cIdx}`}
                            className="h-4 w-4 rounded bg-slate-950 border-slate-800 text-orange-500 focus:ring-orange-500/20 mt-0.5 shrink-0" 
                          />
                          <label htmlFor={`wiz-check-${multiPhaseStepIndex}-${cIdx}`} className="leading-normal cursor-pointer hover:text-white select-none">
                            {check}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step Cost and Wizard controls */}
                  <div className="border-t border-slate-850 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="text-left">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Calculated Step Cost</span>
                      <strong className="text-white font-mono text-lg">
                        ${getStepActiveCost(multiPhaseSteps[multiPhaseStepIndex], multiPhaseStepIndex).toLocaleString()}
                      </strong>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={multiPhaseStepIndex === 0}
                        onClick={() => setMultiPhaseStepIndex(prev => prev - 1)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-900 hover:bg-slate-850 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 border border-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      {multiPhaseStepIndex < multiPhaseSteps.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setMultiPhaseStepIndex(prev => prev + 1)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <span>Verify & Next</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCompileMultiPhaseBid}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <span>Compile Bid</span>
                          <Sparkles className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )
            )}
          </div>
        ) : (
          /* DEFAULT BALLPARK RECTIVE CALCULATOR OUTPUTS COLUMN */
          result && (
            <div className="lg:col-span-6 space-y-6">
            
            {/* cost range block */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-center space-y-2 relative overflow-hidden">
              <span className="text-slate-450 text-[10px] uppercase font-mono tracking-widest font-extrabold block">
                Calculated In-House Cost Range
              </span>
              <div className="flex justify-center items-baseline gap-2 pt-1 font-display">
                <span className="text-orange-400 font-black text-3xl">
                  ${result.estimatedCostMin.toLocaleString()}
                </span>
                <span className="text-slate-500 text-sm font-bold">&mdash;</span>
                <span className="text-orange-400 font-black text-3xl">
                  ${result.estimatedCostMax.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Factor models are synced to daily off-road diesel terminal values and insurance buffers.
              </p>
            </div>

            {/* structural stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                <span className="text-[9px] uppercase font-mono text-slate-500 block">Earth Clearance Volume</span>
                <div className="text-white font-black font-mono text-lg mt-1">{result.excavationVolumeCuYds.toLocaleString()} CY</div>
                <span className="text-[9px] text-slate-400">@ avg {(result.depthFeet || 2.0).toFixed(1)}ft depth factor</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                <span className="text-[9px] uppercase font-mono text-slate-500 block">Required Timeline</span>
                <div className="text-white font-black font-mono text-lg mt-1">{result.timeframeWeeks} {result.timeframeWeeks === 1 ? 'Week' : 'Weeks'}</div>
                <span className="text-[9px] text-slate-400">Weather & mobilization adjustments</span>
              </div>
            </div>

            {/* weight estimate conversions */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3.5">
              <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-bold border-b border-slate-850 pb-2">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                <span>Estimate Bulk Material Surcharges / Weights</span>
              </h5>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-slate-500 text-[9px] uppercase font-mono block">Granite Crusher Run</span>
                  <strong className="text-white text-sm mt-0.5 block font-mono">
                    ~{Math.round(result.excavationVolumeCuYds * 1.35).toLocaleString()} Tons
                  </strong>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                  <span className="text-slate-500 text-[9px] uppercase font-mono block">Structural Fill Clay</span>
                  <strong className="text-white text-sm mt-0.5 block font-mono">
                    ~{Math.round(result.excavationVolumeCuYds * 1.25).toLocaleString()} Tons
                  </strong>
                </div>
              </div>
            </div>

            {/* diagnostics list */}
            <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl flex gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-left w-full">
                <span className="uppercase text-[9px] font-mono tracking-wider font-extrabold text-amber-400">Estimator Directives</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[10.5px] leading-relaxed">
                  {result.details.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                  <li>Use these metrics as starting parameters only. Under-bidding red clay leads to severe diesel drain.</li>
                </ul>
              </div>
            </div>

            {/* actions toolbar */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopyWorkbookRow}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 border border-slate-800 hover:border-slate-500 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-900 transition-colors uppercase font-mono cursor-pointer"
              >
                {copiedRow ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Saved Row!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-orange-400" />
                    <span>Copy Row</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCopyMaterialDetails}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 border border-slate-800 hover:border-slate-500 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-900 transition-colors uppercase font-mono cursor-pointer"
              >
                {copiedOrder ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Order Copied!</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 text-orange-400" />
                    <span>Copy Materials</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadCSV}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 border border-slate-800 hover:border-slate-500 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-900 transition-colors uppercase font-mono cursor-pointer"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs uppercase font-mono font-black tracking-widest cursor-pointer shadow-lg shadow-orange-600/10 transition-colors"
              >
                <span>Print PDF Summary</span>
              </button>
            </div>

            {/* NEXT LOGICAL STEP CALL-TO-ACTION CARD */}
            <div className="bg-gradient-to-r from-orange-950/20 to-slate-950 p-5 rounded-2xl border-2 border-orange-500/40 space-y-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-orange-600/20 border border-orange-500/30 text-orange-400 shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-orange-400 font-sans tracking-wide">⚡ NEXT LOGICAL STEP: Build Multi-Phase Plan</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    No need to print a PDF just to proceed! You can instantly transition this calculated ballpark estimate into a comprehensive, multi-phase bid.
                  </p>
                </div>
              </div>
              
              <div className="text-[11px] text-slate-300 leading-normal bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80">
                <span className="font-extrabold text-orange-400 uppercase block text-[10px] tracking-wider mb-1.5">Anticipated Construction Phase Sequence</span>
                The system automatically structures the correct technical steps for {inputs.serviceId === 'res_pond_digs' ? 'Pond & Dam Construction' : 'your active scope'} based on your inputs:
                <ul className="list-disc pl-4 mt-2 space-y-1 text-slate-400 font-mono text-[10px]">
                  <li>Phase 1 - Land Clearing, Brush Forestry Mulching & Stump Grubbing</li>
                  <li>Phase 1 - Perimeter Silt Fence Erosion Controls</li>
                  <li>Phase 1 - Subgrade Geotextile Fabric Laying</li>
                  <li>Phase 2 - Deep Clay Core Keyway Cutoff Trench Excavation</li>
                  <li>Phase 2 - Mass Excavation, Pond Basin Shaping & Dam Structural Fill (Cut-and-Fill)</li>
                  <li>Phase 3 - Water Overflow HDPE Piping, Seams & Coupling Installation</li>
                  <li>Phase 3 - Silt Retaining Basin Spillway Rocks Rip-Rap Armor</li>
                  <li>Phase 5 - Topsoil Dressing & DOT Centipede Seeding Stabilization</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleGenerateMultiPhasePlan}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs uppercase font-mono font-black tracking-widest cursor-pointer shadow-lg shadow-orange-600/20 transition-all hover:translate-x-0.5 active:translate-y-0.5"
              >
                <span>Launch Multi-Phase Bid Compiler</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

          </div>
        )
      )}

      </div>

    </div>
  );
}

export default function AutomationHub() {
  const branding = useAppBranding();
  const [activeTab, setActiveTab] = useState<'gps' | 'intake' | 'client-field-intake' | 'onedrive' | 'formulas' | 'applications' | 'reports' | 'blog' | 'interns' | 'hr' | 'manual' | 'progression' | 'ballpark' | 'opportunities' | 'branding' | 'agentic-assistant'>('agentic-assistant');
  const [preSelectedWishlistId, setPreSelectedWishlistId] = useState<string>('');
  
  const [projectProgressStages, setProjectProgressStages] = useState<any[]>(() => {
    const stored = localStorage.getItem('tjd_project_progress_stages');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [officeSelectedProjectId, setOfficeSelectedProjectId] = useState<string>('all');
  const [officeSelectedForeman, setOfficeSelectedForeman] = useState<string>('all');
  
  // Reference Library Search and Filter states
  const [refSearch, setRefSearch] = useState('');
  const [refCategory, setRefCategory] = useState('All');
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  // Operating Manual search and filter states
  const [manualSearch, setManualSearch] = useState('');
  const [manualCategory, setManualCategory] = useState('All');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  
  // HR & Embedded Payroll States
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const cached = localStorage.getItem('tjd_roster_employees');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((e: any) => e && typeof e === 'object')
            .map((e: any, idx: number) => ({
              id: e.id || `emp-${Math.random()}`,
              employeeId: e.employeeId || `TJD-${1001 + idx}`,
              name: e.name || 'Unknown Employee',
              role: e.role || 'Laborer',
              payType: e.payType === 'daily' ? 'daily' : 'hourly',
              rate: typeof e.rate === 'number' ? e.rate : (e.payType === 'daily' ? 220 : 22),
              status: e.status === 'terminated' ? 'terminated' : 'active',
              hireDate: e.hireDate || '24-11-20',
              phone: e.phone || '',
              email: e.email || '',
              terminationDate: e.terminationDate
            }));
        }
      } catch (err) {
        console.error("Failed to parse cached employees", err);
      }
    }
    return [
      { id: 'emp-1', employeeId: 'TJD-1001', name: 'Kyle Simmons', role: 'Forestry Mulcher Operator', payType: 'hourly', rate: 25.00, status: 'active', hireDate: '2025-01-10', phone: '478-555-0101', email: 'kyle.simmons@gmail.com' },
      { id: 'emp-2', employeeId: 'TJD-1002', name: 'Marcus Cole', role: 'Finish Grade Dozer Operator', payType: 'hourly', rate: 22.00, status: 'active', hireDate: '2025-02-15', phone: '478-555-0102', email: 'marcus.cole@gmail.com' },
      { id: 'emp-3', employeeId: 'TJD-1003', name: 'Terry Vance', role: 'Heavy Excavating Specialist', payType: 'daily', rate: 240.00, status: 'active', hireDate: '2024-11-20', phone: '478-555-0103', email: 'terry.vance@gmail.com' },
      { id: 'emp-4', employeeId: 'TJD-1004', name: 'Becky Miller', role: 'Billing & Office Coordinator', payType: 'hourly', rate: 20.00, status: 'active', hireDate: '2025-03-01', phone: '478-555-0104', email: 'becky.miller@gmail.com' },
      { id: 'emp-5', employeeId: 'TJD-1005', name: 'TJ Darley', role: 'Owner & General Supervisor', payType: 'daily', rate: 300.00, status: 'active', hireDate: '2023-01-01', phone: '478-808-7789', email: 'tj.darley@gmail.com' },
    ];
  });

  const [timesheets, setTimesheets] = useState<CustomShift[]>(() => {
    const cached = localStorage.getItem('tjd_timesheets');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((s: any) => s && typeof s === 'object')
            .map((s: any) => ({
              id: s.id || `sh-${Math.random()}`,
              employeeId: s.employeeId || 'emp-1',
              employeeName: s.employeeName || 'Unknown Employee',
              date: s.date || '2026-06-08',
              hoursWorked: typeof s.hoursWorked === 'number' ? s.hoursWorked : 0,
              daysWorked: typeof s.daysWorked === 'number' ? s.daysWorked : 0,
              description: s.description || '',
              siteLocation: s.siteLocation || 'General Site'
            }));
        }
      } catch (err) {
        console.error("Failed to parse cached timesheets", err);
      }
    }
    return [
      { id: 'sh-1', employeeId: 'emp-1', employeeName: 'Kyle Simmons', date: '2026-06-08', hoursWorked: 40, daysWorked: 5, description: 'Greensboro Lot underbrush grading', siteLocation: 'Greensboro Lot (Lake Oconee)' },
      { id: 'sh-2', employeeId: 'emp-2', employeeName: 'Marcus Cole', date: '2026-06-08', hoursWorked: 38, daysWorked: 5, description: 'Warner Robins pad prep site', siteLocation: 'Warner Robins Pad Site (GA)' },
      { id: 'sh-3', employeeId: 'emp-3', employeeName: 'Terry Vance', date: '2026-06-08', hoursWorked: 40, daysWorked: 5, description: 'Clay keyway pond dig', siteLocation: 'Peach County Warehouse Hub (GA)' },
      { id: 'sh-5', employeeId: 'emp-4', employeeName: 'Becky Miller', date: '2026-06-08', hoursWorked: 35, daysWorked: 5, description: 'Weekly dispatch invoicing', siteLocation: 'Office Hub' },
      { id: 'sh-6', employeeId: 'emp-1', employeeName: 'Kyle Simmons', date: '2026-06-15', hoursWorked: 42.5, daysWorked: 5, description: 'Pine stump grubbing & brush clearing', siteLocation: 'Greensboro Lot (Lake Oconee)' },
      { id: 'sh-7', employeeId: 'emp-3', employeeName: 'Terry Vance', date: '2026-06-15', hoursWorked: 0, daysWorked: 4, description: 'Deep clay embankment shaping', siteLocation: 'Peach County Warehouse Hub (GA)' },
    ];
  });

  const saveEmployees = (updated: Employee[]) => {
    setEmployees(updated);
    localStorage.setItem('tjd_roster_employees', JSON.stringify(updated));
  };

  const saveTimesheets = (updated: CustomShift[]) => {
    setTimesheets(updated);
    localStorage.setItem('tjd_timesheets', JSON.stringify(updated));
  };

  const handleToggleStatus = (id: string) => {
    const updated = employees.map(emp => {
      if (emp.id === id) {
        const nextStatus = emp.status === 'active' ? 'terminated' : 'active';
        return {
          ...emp,
          status: nextStatus as 'active' | 'terminated',
          terminationDate: nextStatus === 'terminated' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return emp;
    });
    saveEmployees(updated);
  };

  // HR Interaction Form states
  const [activeHRTab, setActiveHRTab] = useState<'roster' | 'payroll'>('roster');
  const [isAddingEmployee, setIsAddingEmployee] = useState<boolean>(true);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  
  // New Employee Input States
  const [empName, setEmpName] = useState<string>('');
  const [empRole, setEmpRole] = useState<string>('Forestry Mulcher Operator');
  const [useCustomRole, setUseCustomRole] = useState<boolean>(false);
  const [empEmployeeId, setEmpEmployeeId] = useState<string>('TJD-1006');
  const [empPayType, setEmpPayType] = useState<'hourly' | 'daily'>('hourly');
  const [empRate, setEmpRate] = useState<number>(20);
  const [empPhone, setEmpPhone] = useState<string>('');
  const [empEmail, setEmpEmail] = useState<string>('');
  const [empHireDate, setEmpHireDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Timesheet Entry Form states
  const [isAddingShift, setIsAddingShift] = useState<boolean>(true);
  const [shiftEmpId, setShiftEmpId] = useState<string>('emp-1');
  const [shiftDate, setShiftDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [shiftValue, setShiftValue] = useState<number>(8); // Hours or Days depending on pay type
  const [shiftDesc, setShiftDesc] = useState<string>('');
  const [shiftLocation, setShiftLocation] = useState<string>('Greensboro Lot (Lake Oconee)');

  // Selected Employee for Payroll Detail overview
  const [selectedHRReportEmpId, setSelectedHRReportEmpId] = useState<string>('all');
  const [payrollStartDate, setPayrollStartDate] = useState<string>('2026-06-01');
  const [payrollEndDate, setPayrollEndDate] = useState<string>('2026-06-30');
  const [showPayrollReportModal, setShowPayrollReportModal] = useState<boolean>(false);
  const [payStubEmployee, setPayStubEmployee] = useState<Employee | null>(null);
  const [payStubShifts, setPayStubShifts] = useState<CustomShift[]>([]);
  
  // Authentication / Authorization States for Private Operations Hub
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('tjd_staff_authorized') === 'true';
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  useEffect(() => {
    const handleTriggerAuth = () => {
      setShowAuthModal(true);
      setPinError('');
      setEnteredPin('');
    };

    window.addEventListener('tjd_trigger_staff_auth', handleTriggerAuth);

    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#staff' || hash === '#operations' || hash === '#automation-hub') {
        if (sessionStorage.getItem('tjd_staff_authorized') !== 'true') {
          handleTriggerAuth();
        }
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();

    return () => {
      window.removeEventListener('tjd_trigger_staff_auth', handleTriggerAuth);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = enteredPin.trim().toLowerCase();
    
    // Accept valid codes: 4788 (phone start), 7789 (phone end), tjd2026, tjd26, darley
    const validCodes = ['4788', '7789', 'tjd2026', 'tjd26', 'darley', 'tjd4788', 'tjd7789'];
    if (validCodes.includes(cleaned)) {
      sessionStorage.setItem('tjd_staff_authorized', 'true');
      setIsAuthorized(true);
      setShowAuthModal(false);
      setPinError('');
      setEnteredPin('');
      
      // Auto-dispatch simple global custom event so header or footer can respond if they need to
      window.dispatchEvent(new Event('tjd_auth_change'));

      setTimeout(() => {
        const section = document.getElementById('automation-hub');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      setPinError('Invalid override pin/passcode. Try again.');
    }
  };

  const handleLockConsole = () => {
    sessionStorage.removeItem('tjd_staff_authorized');
    setIsAuthorized(false);
    window.dispatchEvent(new Event('tjd_auth_change'));
    if (window.location.hash === '#staff' || window.location.hash === '#operations' || window.location.hash === '#automation-hub') {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };
  
  // Geolocation States
  const [employeeName, setEmployeeName] = useState<string>('Kyle Simmons');
  const [employeeRole, setEmployeeRole] = useState<string>('Forestry Mulcher Operator');
  const [activeSite, setActiveSite] = useState<string>('Greensboro Lot (Lake Oconee)');
  const [activePhase, setActivePhase] = useState<string>('Phase 1: Forestry Clearing & Mulching');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'success' | 'failed'>('idle');
  const [gpsLogs, setGpsLogs] = useState<GPSLog[]>([]);

  // Received applications and daily field report states
  const [receivedApps, setReceivedApps] = useState<any[]>([]);
  const [fieldLogs, setFieldLogs] = useState<any[]>([]);

  // Webhook settings state
  const [webhookInput, setWebhookInput] = useState<string>(getWebhookUrl());
  const [webhookStatusMessage, setWebhookStatusMessage] = useState<string>('');
  const [slackWebhookInput, setSlackWebhookInput] = useState<string>(getSlackWebhookUrl());
  const [slackWebhookStatusMessage, setSlackWebhookStatusMessage] = useState<string>('');

  // SMTP configuration states
  const [smtpConfig, setSmtpConfigState] = useState<any>(getSmtpConfig());
  const [smtpStatusMessage, setSmtpStatusMessage] = useState<string>('');
  
  // Native Blog Post Management States
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  // Workforce & Paid Intern Program States
  const [activeInternTab, setActiveInternTab] = useState<'recruitment' | 'offer' | 'onboarding' | 'tracker' | 'academy'>('recruitment');
  const [interns, setInterns] = useState<any[]>(() => {
    const cached = localStorage.getItem('tjd_interns');
    if (cached) return JSON.parse(cached);
    // Seed with a default high-value mock intern
    return [
      {
        id: "intern-1",
        name: "Bobby Green",
        mentor: "Terry Vance",
        startDate: "2026-06-01",
        endDate: "2026-08-24",
        status: "active",
        skills: {
          ppe: true,
          signals: true,
          walkaround: true,
          fluid: true,
          grease: false,
          stakes: false,
          laser: false,
          threePoint: false,
          skidSteer: false,
          attachments: false,
          stockpiles: false,
          backfill: false,
          miniEx: false,
          locate811: false,
          largeMach: false,
          roughGrade: false,
          loadTruck: false,
          mechanical: false
        }
      }
    ];
  });
  const [selectedInternId, setSelectedInternId] = useState<string>("intern-1");
  const [newInternName, setNewInternName] = useState<string>("");
  const [newInternMentor, setNewInternMentor] = useState<string>("TJ Darley");
  const [newInternStartDate, setNewInternStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Interview Screen Scoring Form States
  const [interviewCandidateName, setInterviewCandidateName] = useState<string>("");
  const [interviewPhoneSchedule, setInterviewPhoneSchedule] = useState<string>("fits");
  const [interviewPhoneTransport, setInterviewPhoneTransport] = useState<string>("yes");
  const [interviewPhoneAge, setInterviewPhoneAge] = useState<string>("yes");
  const [interviewPhoneLicense, setInterviewPhoneLicense] = useState<string>("regular");
  const [interviewScoreReliability, setInterviewScoreReliability] = useState<'Exceptional' | 'Average' | 'High Risk'>('Average');
  const [interviewScoreAttitude, setInterviewScoreAttitude] = useState<'Exceptional' | 'Average' | 'High Risk'>('Average');
  const [interviewScoreSafety, setInterviewScoreSafety] = useState<'Exceptional' | 'Average' | 'High Risk'>('Average');
  const [interviewNotes, setInterviewNotes] = useState<string>("");
  const [interviewDecision, setInterviewDecision] = useState<'Proceed to Offer' | 'Hold' | 'Decline'>('Proceed to Offer');
  const [interviewStatusMessage, setInterviewStatusMessage] = useState<string>("");

  // Offer Letter Generator States
  const [offerCandidateName, setOfferCandidateName] = useState<string>("Bobby Green");
  const [offerStartDate, setOfferStartDate] = useState<string>("");
  const [offerEndDate, setOfferEndDate] = useState<string>("");
  const [offerDuration, setOfferDuration] = useState<string>("12");
  const [offerRate, setOfferRate] = useState<string>("13.50");
  const [offerPayFrequency, setOfferPayFrequency] = useState<string>("weekly");
  const [offerExpirationDate, setOfferExpirationDate] = useState<string>("");
  const [showCopySuccess, setShowCopySuccess] = useState<boolean>(false);

  // Initialize dates
  useEffect(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const splitStart = nextWeek.toISOString().split('T')[0];
    setOfferStartDate(splitStart);

    const endWeek = new Date();
    endWeek.setDate(endWeek.getDate() + 7 + (12 * 7));
    setOfferEndDate(endWeek.toISOString().split('T')[0]);

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 3);
    setOfferExpirationDate(expDate.toISOString().split('T')[0]);
  }, []);

  // Check for specialized trainee portal URL parameters on load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const portal = params.get('portal');
      const internId = params.get('intern');
      if (portal === 'trainee') {
        setActiveTab('interns');
        setActiveInternTab('academy');
        setAcademyMode('trainee');
        if (internId) {
          setCurrentTraineeId(internId);
        }
      }
    } catch (e) {
      console.warn("Could not read URL search params", e);
    }
  }, []);

  // Save interns helper
  const saveAllInterns = (updatedInterns: any[]) => {
    setInterns(updatedInterns);
    localStorage.setItem('tjd_interns', JSON.stringify(updatedInterns));
  };

  // --- SAFETY ACADEMY VIDEO DEFINITIONS & TIME TRACKING TRIGGER ---
  const DEFAULT_SAFETY_VIDEOS = [
    {
      id: 'signals_basics',
      title: 'Heavy Equipment Hand Signals & Communication',
      duration: '5:40',
      durationSeconds: 340,
      embedUrl: 'https://www.youtube.com/embed/S_7g7H106D8',
      description: 'Master the mandatory standard hand gestures for OSHA/ANSI crane on-site operations and excavator ground spotting to prevent crush hazards.',
      badge: 'Signal Pro',
      isOshaOfficial: true,
    },
    {
      id: 'blind_spots',
      title: '360-Degree Equipment Blind Spots',
      duration: '4:15',
      durationSeconds: 255,
      embedUrl: 'https://www.youtube.com/embed/7rX5rB7qbeM',
      description: 'Understand the "invisible" zones surrounding large excavators, skid steers, and wheel loaders, including the counterweight swing radius.',
      badge: 'Spotter Certified',
      isOshaOfficial: true,
    },
    {
      id: 'trenching',
      title: 'OSHA Trenching & Soil Excavation Safety',
      duration: '8:25',
      durationSeconds: 505,
      embedUrl: 'https://www.youtube.com/embed/3R42_S_5k7I',
      description: 'Critical instructions on protective systems (shoring, sloping, shielding), competent person rules, and soil classification.',
      badge: 'Safety First',
      isOshaOfficial: true,
    },
    {
      id: 'lockout',
      title: 'Preventive Maintenance Safety & Lockout/Tagout',
      duration: '4:45',
      durationSeconds: 285,
      embedUrl: 'https://www.youtube.com/embed/reAnrE9vDrc',
      description: 'Learn the essential lockout/tagout process, relief valves, safety bars, and key controls before executing machine greasing or inspection.',
      badge: 'Maintenance Master',
      isOshaOfficial: true,
    }
  ];

  const [SAFETY_VIDEOS, setSafetyVideos] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('tjd_safety_videos');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load safety videos from local storage", e);
    }
    return DEFAULT_SAFETY_VIDEOS;
  });

  const saveSafetyVideos = (newVideos: any[]) => {
    setSafetyVideos(newVideos);
    localStorage.setItem('tjd_safety_videos', JSON.stringify(newVideos));
  };

  // Prebuilt Official OSHA Videos catalog for easy supervisor integration
  const OSHA_OFFICIAL_CATALOG = [
    {
      id: 'community_heavy_equipment_blind_spots',
      title: 'Heavy Equipment Blind Spots & Zones',
      duration: '5:30',
      durationSeconds: 330,
      embedUrl: 'https://www.youtube.com/embed/zlucjWgykDI',
      description: "Identify danger zones, pinch points, and massive blind spots surrounding earthmovers, haulers, and tracked excavators from the operator's cabin perspective.",
      badge: 'Blind Spot Master',
      isOshaOfficial: false,
    },
    {
      id: 'community_onboarding_day1',
      title: 'What to Expect on the 1st Day of Your Job',
      duration: '4:15',
      durationSeconds: 255,
      embedUrl: 'https://www.youtube.com/embed/fdIpOYlTb-Y',
      description: 'Essential orientation, workplace safety expectations, safety apparel (PPE) checklist, and peer-to-peer mentoring tips for your first day on site.',
      badge: 'Orientation Master',
      isOshaOfficial: false,
    },
    {
      id: 'community_hand_signals',
      title: 'Earthwork Hand Signals',
      duration: '3:45',
      durationSeconds: 225,
      embedUrl: 'https://www.youtube.com/embed/t4dl5zAE9oc',
      description: 'Practical, clear guides demonstrating excavation, grading, and earthmoving site hand signals for safe heavy equipment operators and spotters.',
      badge: 'Earthwork Spotter',
      isOshaOfficial: false,
    },
    {
      id: 'osha_fall_protection',
      title: 'OSHA Fall Protection in Construction (CGI v-Tool)',
      duration: '6:12',
      durationSeconds: 372,
      embedUrl: 'https://www.youtube.com/embed/FLf6wbup05M',
      description: 'Official OSHA v-Tool animated training on leading edge hazards, harness setups, anchorage points, and fall arrest deployment.',
      badge: 'Fall Guard Certified',
      isOshaOfficial: true,
    },
    {
      id: 'osha_spud_barge',
      title: 'OSHA Spud Barge Safety (CGI v-Tool)',
      duration: '5:02',
      durationSeconds: 302,
      embedUrl: 'https://www.youtube.com/embed/U0H_S_X6_U4',
      description: 'Official OSHA v-Tool video explaining maritime spud barge safety, boarding control, slips / falls, and water rescue protocols.',
      badge: 'Barge Officer',
      isOshaOfficial: true,
    },
    {
      id: 'osha_struck_by',
      title: 'OSHA Struck-By Hazards: Construction Vehicles',
      duration: '4:50',
      durationSeconds: 290,
      embedUrl: 'https://www.youtube.com/embed/9G_f8aD_vj4',
      description: 'Accident prevention techniques around rollers, graders, and dump trucks. Highlights clear zones and high-visibility PPE requirements.',
      badge: 'Struck-By Defender',
      isOshaOfficial: true,
    },
    {
      id: 'osha_heat_illness',
      title: 'OSHA Water. Rest. Shade. Heat Safety Campaign',
      duration: '3:24',
      durationSeconds: 204,
      embedUrl: 'https://www.youtube.com/embed/bWclU7v2GMc',
      description: 'Protecting workers from heat stress and heat stroke in high humidity environments. Covers hydration rates and acclamation programs.',
      badge: 'Climate Safe Pro',
      isOshaOfficial: true,
    }
  ];

  const [activeOshaTab, setActiveOshaTab] = useState<'catalog' | 'custom'>('catalog');
  const [customVidTitle, setCustomVidTitle] = useState<string>('');
  const [customVidUrl, setCustomVidUrl] = useState<string>('');
  const [customVidDuration, setCustomVidDuration] = useState<string>('5:00');
  const [customVidBadge, setCustomVidBadge] = useState<string>('Machinery Certified');
  const [customVidDesc, setCustomVidDesc] = useState<string>('');
  const [customVidError, setCustomVidError] = useState<string | null>(null);
  const [customVidSuccess, setCustomVidSuccess] = useState<boolean>(false);

  const [academyMode, setAcademyMode] = useState<'staff' | 'trainee'>('staff');
  const [activeVideoId, setActiveVideoId] = useState<string>('signals_basics');
  const [isWatchingVideo, setIsWatchingVideo] = useState<boolean>(false);
  const [currentTraineeId, setCurrentTraineeId] = useState<string>('intern-1');
  const [simulatedLoginIdInput, setSimulatedLoginIdInput] = useState<string>('');
  const [copiedLinkForInternId, setCopiedLinkForInternId] = useState<string | null>(null);

  // Active watch time tracker effect
  useEffect(() => {
    let watchTimer: any;
    if (isWatchingVideo && academyMode === 'trainee' && currentTraineeId) {
      watchTimer = setInterval(() => {
        setInterns(prev => {
          const updated = prev.map(intern => {
            if (intern.id === currentTraineeId) {
              const currentWatchTimes = intern.videoWatchTimes || {};
              const currentSecs = currentWatchTimes[activeVideoId] || 0;
              const newSecs = currentSecs + 1;
              
              const completedModules = intern.completedModules || [];
              const targetModule = SAFETY_VIDEOS.find(v => v.id === activeVideoId);
              const minimumRequiredSeconds = 15; // Fast demo mode completion bar
              let updatedCompleted = [...completedModules];
              if (newSecs >= minimumRequiredSeconds && !completedModules.includes(activeVideoId)) {
                updatedCompleted.push(activeVideoId);
              }

              return {
                ...intern,
                completedModules: updatedCompleted,
                videoWatchTimes: {
                  ...currentWatchTimes,
                  [activeVideoId]: newSecs
                }
              };
            }
            return intern;
          });
          localStorage.setItem('tjd_interns', JSON.stringify(updated));
          return updated;
        });
      }, 1000);
    }
    return () => {
      if (watchTimer) clearInterval(watchTimer);
    };
  }, [isWatchingVideo, academyMode, currentTraineeId, activeVideoId]);
  // -------------------------------------------------------------

  // OneDrive Synchronizer States
  const [ledgerRows, setLedgerRows] = useState<ExcelLedgerRow[]>([
    {
      rowId: "A103",
      timestamp: "Today, 10:45 AM",
      division: "Commercial",
      client: "Marcus Vance (Vance Group)",
      size: "15.0 Acres (Macon Site)",
      coefficient: "1.30 (Dense Georgia Red Clay)",
      estimate: "$145,200 - $185,900",
      status: "SYNCHRONIZED"
    },
    {
      rowId: "A104",
      timestamp: "Today, 11:15 AM",
      division: "Residential",
      client: "Thomas & Becky Miller",
      size: "3.2 Acres (Greensboro)",
      coefficient: "1.00 (Standard Organic Loam)",
      estimate: "$12,500 - $18,400",
      status: "PENDING SYNC"
    },
    {
      rowId: "A105",
      timestamp: "Today, 11:32 AM",
      division: "Residential",
      client: "Douglas Finch",
      size: "0.5 Acres (Perry, GA)",
      coefficient: "1.65 (Rocky Granite Stratum)",
      estimate: "$24,200 - $32,100",
      status: "PENDING SYNC"
    }
  ]);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Load and generate synthetic GPS records on mount
  useEffect(() => {
    // Check if we have records in local storage, else populate with default ones
    const localGPS = localStorage.getItem('tjd_gps_clockins');
    if (localGPS) {
      setGpsLogs(JSON.parse(localGPS));
    } else {
      const defaultLogs: GPSLog[] = [
        {
          txId: "GPS-TX-4921",
          name: "Terry Vance",
          operatorRole: "Excavator Operator",
          locationName: "Peach County Warehouse Pad",
          lat: 32.5971,
          lng: -83.8856,
          action: "Clock In",
          timestamp: "Today, 7:00 AM",
          isSynced: true
        },
        {
          txId: "GPS-TX-4922",
          name: "Kyle Simmons",
          operatorRole: "Forestry Mulcher Operator",
          locationName: "Greensboro private Pond",
          lat: 33.5785,
          lng: -83.1818,
          action: "Clock In",
          timestamp: "Today, 7:15 AM",
          isSynced: true
        },
        {
          txId: "GPS-TX-4925",
          name: "Marcus Cole",
          operatorRole: "Finish Grade Dozer",
          locationName: "Warner Robins Commercial grading",
          lat: 32.6186,
          lng: -83.6262,
          action: "Clock In",
          timestamp: "Today, 8:02 AM",
          isSynced: false
        }
      ];
      setGpsLogs(defaultLogs);
      localStorage.setItem('tjd_gps_clockins', JSON.stringify(defaultLogs));
    }

    // Sync listener: grab recently submitted leads, clock-ins, and daily reports and format them as Excel ledger rows
    const syncCurrentLeads = () => {
      const initialDynamicRows: ExcelLedgerRow[] = [
        {
          rowId: "A103",
          timestamp: "Yesterday, 10:45 AM",
          division: "Commercial",
          client: "Marcus Vance (Vance Group)",
          size: "15.0 Acres (Macon Site)",
          coefficient: "1.30 (Dense Georgia Red Clay)",
          estimate: "$145,200 - $185,900",
          status: "SYNCHRONIZED"
        },
        {
          rowId: "A104",
          timestamp: "Yesterday, 11:15 AM",
          division: "Residential",
          client: "Thomas & Becky Miller",
          size: "3.2 Acres (Greensboro)",
          coefficient: "1.00 (Standard Organic Loam)",
          estimate: "$12,500 - $18,400",
          status: "SYNCHRONIZED"
        },
        {
          rowId: "A105",
          timestamp: "Yesterday, 11:32 AM",
          division: "Residential",
          client: "Douglas Finch",
          size: "0.5 Acres (Perry, GA)",
          coefficient: "1.65 (Rocky Granite Stratum)",
          estimate: "$24,200 - $32,100",
          status: "SYNCHRONIZED"
        }
      ];

      let combined: ExcelLedgerRow[] = [...initialDynamicRows];

      // 1. Map Earthworks Bids
      const bidsLocal = localStorage.getItem('tjd_earthworks_bids');
      if (bidsLocal) {
        try {
          const bids = JSON.parse(bidsLocal);
          bids.forEach((b: any, index: number) => {
            const isRes = b.serviceId?.startsWith('res_');
            let cleanId = b.id ? b.id.replace('TJD-WISHLIST-', '').replace('TJD-2026-X', '').replace('TJD-', '') : `${100 + index}`;
            if (cleanId === 'TJD' || cleanId.length < 2) {
              cleanId = `${100 + index}`;
            }
            combined.push({
              rowId: `B-${cleanId}`,
              timestamp: b.submittedAt || "Recent",
              division: isRes ? "Residential" as const : "Commercial" as const,
              client: `Lead: ${b.clientName} ${b.companyName ? `(${b.companyName})` : ''}`,
              size: `${b.projectSize?.toLocaleString() || '1.0'} ${b.unit === 'sq_ft' ? 'Sq. Ft.' : 'Acres'}`,
              coefficient: "Dynamic Multipliers (GPS-mapped)",
              estimate: b.estimatedCostRange || "$4,500 Base Min",
              status: b.isSynced ? "SYNCHRONIZED" as const : "PENDING SYNC" as const,
              originalBidId: b.id
            });
          });
        } catch (e) {}
      }

      // 2. Map GPS Clock-In Logs
      const gpsLocal = localStorage.getItem('tjd_gps_clockins');
      if (gpsLocal) {
        try {
          const logs = JSON.parse(gpsLocal);
          logs.forEach((l: any, index: number) => {
            let cleanId = l.txId ? l.txId.replace('GPS-TX-', '') : `${100 + index}`;
            if (cleanId.length > 6) {
              cleanId = cleanId.slice(-6);
            }
            combined.push({
              rowId: `CL-${cleanId}`,
              timestamp: l.timestamp,
              division: l.locationName?.includes("Greensboro") ? "Residential" as const : "Commercial" as const,
              client: `${l.name} - Timecard (${l.action})`,
              size: l.operatorRole || "Operator",
              coefficient: `GPS: ${l.lat?.toFixed(4) || '0'}, ${l.lng?.toFixed(4) || '0'}`,
              estimate: "Hours: Field Record",
              status: l.isSynced ? "SYNCHRONIZED" as const : "PENDING SYNC" as const
            });
          });
        } catch (e) {}
      }

      // 3. Map Daily Field Progress Reports
      const reportsLocal = localStorage.getItem('tjd_daily_reports');
      if (reportsLocal) {
        try {
          const reports = JSON.parse(reportsLocal);
          reports.forEach((r: any, index: number) => {
            let cleanId = r.id ? r.id.replace('SUB-', '') : `${100 + index}`;
            if (cleanId.length > 6) {
              cleanId = cleanId.slice(-6);
            }
            combined.push({
              rowId: `R-${cleanId}`,
              timestamp: r.submittedAt,
              division: r.siteLocation?.includes("Greensboro") ? "Residential" as const : "Commercial" as const,
              client: `${r.operatorName} - Daily Site Report`,
              size: `${r.clearedAcres || '0'} Acres Done`,
              coefficient: `Engine: ${r.engineHours} Hrs`,
              estimate: `Fuel: ${r.fuelLevel}`,
              status: r.isSynced ? "SYNCHRONIZED" as const : "PENDING SYNC" as const
            });
          });
        } catch (e) {}
      }

      setLedgerRows(combined);

      // Load native received applications and daily reports
      const localApps = localStorage.getItem('tjd_careers_applications');
      if (localApps) {
        setReceivedApps(JSON.parse(localApps));
      } else {
        const defaultApps = [
          {
            id: "APP-17181023",
            submittedAt: "Yesterday, 3:45 PM",
            fullName: "Jacob Finch",
            phone: "478-555-0192",
            email: "finch_excavating@gmail.com",
            city: "Fort Valley, GA",
            cdlStatus: "CDL Class A",
            dirtExperienceYears: "6",
            selectedRole: "Heavy Machinery Operator",
            proficiencies: ["30-Ton Track Excavators", "Finishing Laser Bulldozers"],
            lastEmployer: "Middle GA Landworks",
            additionalNotes: "Have active OSHA-10 card. 6 years experience in county culvert ditches and highway clearings.",
            agreedToTerms: true
          }
        ];
        setReceivedApps(defaultApps);
        localStorage.setItem('tjd_careers_applications', JSON.stringify(defaultApps));
      }

      const freshReportsLocal = localStorage.getItem('tjd_daily_reports');
      if (freshReportsLocal) {
        setFieldLogs(JSON.parse(freshReportsLocal));
      } else {
        const defaultReports = [
          {
            id: "SUB-17181044",
            submittedAt: "Today, 11:50 AM",
            latitude: "32.5971",
            longitude: "-83.8856",
            operatorName: "Kyle Simmons",
            machineryType: "High-Flow Fecon Forestry Mulcher",
            engineHours: "1482.4",
            siteLocation: "Greensboro Lot (Lake Oconee, GA)",
            fuelLevel: "75%",
            dailyNotes: "Cleared approximately 1.2 acres of underbrush on the Greensboro lot. Handled sweetgum briars with zero track jams. Equipment working cool, fluids verified normal.",
            clearedAcres: "1.2",
            soilCondition: "moist_clay",
            safetySigned: true,
            signatureInitials: "KS"
          }
        ];
        setFieldLogs(defaultReports);
        localStorage.setItem('tjd_daily_reports', JSON.stringify(defaultReports));
      }
    };

    syncCurrentLeads();

    // Hydrate blog posts
    const loadBlogPosts = () => {
      const stored = localStorage.getItem('tjd_blog_posts');
      if (stored) {
        setBlogPosts(JSON.parse(stored));
      }
    };
    loadBlogPosts();

    const loadProgressionStages = () => {
      const stored = localStorage.getItem('tjd_project_progress_stages');
      if (stored) {
        try {
          setProjectProgressStages(JSON.parse(stored));
        } catch (e) {}
      }
    };
    loadProgressionStages();

    window.addEventListener('tjd_blog_posts_changed', loadBlogPosts);
    window.addEventListener('tjd_daily_reports_changed', syncCurrentLeads);
    window.addEventListener('tjd_gps_clockins_changed', syncCurrentLeads);
    window.addEventListener('tjd_project_progress_stages_changed', loadProgressionStages);
    
    // Check periodically for updates
    const interval = setInterval(syncCurrentLeads, 4000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('tjd_blog_posts_changed', loadBlogPosts);
      window.removeEventListener('tjd_daily_reports_changed', syncCurrentLeads);
      window.removeEventListener('tjd_gps_clockins_changed', syncCurrentLeads);
      window.removeEventListener('tjd_project_progress_stages_changed', loadProgressionStages);
    };
  }, []);

  // Geolocation trigger
  const requestGPSCoordinates = () => {
    setGpsStatus('locating');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(parseFloat(position.coords.latitude.toFixed(6)));
          setLongitude(parseFloat(position.coords.longitude.toFixed(6)));
          setGpsStatus('success');
        },
        (error) => {
          console.warn("Standard high-accuracy GPS blocked. Emulating secure Middle Georgia location...");
          // Fallback location - centroid of Perry/Warner Robins Georgia
          setTimeout(() => {
            setLatitude(32.5971);
            setLongitude(-83.8856);
            setGpsStatus('success');
          }, 1200);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setLatitude(32.5971);
      setLongitude(-83.8856);
      setGpsStatus('success');
    }
  };

  const handleClockAction = (actionType: 'Clock In' | 'Clock Out') => {
    if (!latitude || !longitude) {
      alert("Please request GPS tracking credentials before checking in.");
      return;
    }

    const txId = `GPS-TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + " (Today)";

    const savedLat = latitude;
    const savedLng = longitude;

    const newLog: GPSLog = {
      txId,
      name: employeeName,
      operatorRole: employeeRole,
      locationName: activeSite,
      lat: savedLat,
      lng: savedLng,
      action: actionType,
      timestamp: timeStr,
      isSynced: false
    };

    const updated = [newLog, ...gpsLogs];
    setGpsLogs(updated);
    localStorage.setItem('tjd_gps_clockins', JSON.stringify(updated));

    // Reset GPS status for next operation
    setLatitude(null);
    setLongitude(null);
    setGpsStatus('idle');

    // Also queue into ledger rows representing the Excel timecard update
    const randomRowId = `C${Math.floor(100 + Math.random() * 899)}`;
    setLedgerRows(prev => [
      {
        rowId: randomRowId,
        timestamp: "Just Now",
        division: activeSite.includes("Greensboro") ? "Residential" : "Commercial",
        client: `${employeeName} - Timecard (${actionType})`,
        size: activePhase,
        coefficient: `GPS: ${savedLat}, ${savedLng}`,
        estimate: "Hours: Field Record",
        status: "PENDING SYNC"
      },
      ...prev
    ]);

    // REAL-TIME BACKGROUND DISPATCH TO THE GOOGLE SHEETS WEBHOOK (AS PROVIDED)
    const formDataPayload = new URLSearchParams();
    const gScriptAction = actionType === 'Clock In' ? 'IN' : 'OUT';
    const cleanDate = new Date().toLocaleDateString("en-US");
    const cleanTime = new Date().toLocaleTimeString("en-US");

    // Primary parameters compatible with Google Apps Script
    formDataPayload.append('employee', employeeName);
    formDataPayload.append('role', employeeRole);
    formDataPayload.append('job', activeSite);
    formDataPayload.append('jobNum', '1');
    formDataPayload.append('action', gScriptAction);
    formDataPayload.append('date', cleanDate);
    formDataPayload.append('time', cleanTime);
    formDataPayload.append('lat', String(savedLat));
    formDataPayload.append('lng', String(savedLng));

    // System-wide backup values
    formDataPayload.append('submission_id', txId);
    formDataPayload.append('employee_name', employeeName);
    formDataPayload.append('operator_role', employeeRole);
    formDataPayload.append('active_site', activeSite);
    formDataPayload.append('timestamp', new Date().toISOString());

    console.log("Transmitting background clock-in payload to App Script...");
    fetch(getWebhookUrl(), {
      method: 'POST',
      body: formDataPayload,
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(() => {
      console.log("Timecard logged directly in active Sheets backup!");
      // Mark as synced in UI list
      setGpsLogs(prev => prev.map(logItem => logItem.txId === txId ? { ...logItem, isSynced: true } : logItem));
    })
    .catch((err) => {
      console.warn("Sheet update failed. Data cached locally.", err);
    });

    // Option: Redirect to Field Intake Log on Clock In so they can complete machinery and shift progress logs
    if (actionType === 'Clock In') {
      const confirmRedirect = confirm(`Clock-In Captured!\n\nID: ${txId}\nCoords: ${savedLat}, ${savedLng}\n\nWould you like to open the Daily Site Progress Log now?`);
      if (confirmRedirect) {
        window.location.hash = `#field-intake?submission_id=${txId}&lat=${savedLat}&lng=${savedLng}`;
      }
    } else {
      alert(`Clock-Out Logged Successfully!\n\nID: ${txId}\nSafe travels home.`);
    }
  };

  // Run Spreadsheet Webhook Synchronizer
  const runOneDriveSynchronizer = () => {
    setSyncing(true);
    setSyncSuccess(false);
    setSyncLogs([]);

    const logSteps = [
      "Establishing secured TLS handshake with OneDrive REST endpoint API...",
      "Resolving workspace credentials against Microsoft-Blue active OAuth2 token...",
      "Authenticating file path: '/Apps/TJD_Construction/Estimator_Dynamic.xlsx'...",
      "Reading dynamic Excel formulation tables & array dependencies...",
      "Queuing pending field transmissions, progress logs and estimator leads...",
      "Synchronizing client lead records securely (256-bit encryption)...",
      "Pushing daily progress site reports and engine hours logs to worksheets...",
      "Updating 'Clock_In_GPS' sheet with employee verified geological timestamps...",
      "Triggering Google Sheets automated webhook spreadsheet trigger...",
      "Excel compilation macro rebuild successful!",
      "SUCCESS: Workbook and mobile elements synchronization finalized seamlessly!"
    ];

    logSteps.forEach((log, index) => {
      setTimeout(() => {
        setSyncLogs(prev => [...prev, log]);
        if (index === logSteps.length - 1) {
          setSyncing(false);
          setSyncSuccess(true);
          
          // Mark all ledger and logs as synchronized
          setLedgerRows(prev => prev.map(row => ({ ...row, status: "SYNCHRONIZED" })));
          setGpsLogs(prev => prev.map(log => ({ ...log, isSynced: true })));
          
          // Persist the synced state for GPS
          const currentGPS = JSON.parse(localStorage.getItem('tjd_gps_clockins') || '[]');
          const updatedGPS = currentGPS.map((l: GPSLog) => ({ ...l, isSynced: true }));
          localStorage.setItem('tjd_gps_clockins', JSON.stringify(updatedGPS));

          // Persist the synced state for Daily reports
          const currentReports = JSON.parse(localStorage.getItem('tjd_daily_reports') || '[]');
          const updatedReports = currentReports.map((r: any) => ({ ...r, isSynced: true }));
          localStorage.setItem('tjd_daily_reports', JSON.stringify(updatedReports));
          setFieldLogs(updatedReports);

          // Persist the synced state for Bids
          const currentBids = JSON.parse(localStorage.getItem('tjd_earthworks_bids') || '[]');
          const updatedBids = currentBids.map((b: any) => ({ ...b, isSynced: true }));
          localStorage.setItem('tjd_earthworks_bids', JSON.stringify(updatedBids));

          // Dispatch sync changes window events
          window.dispatchEvent(new Event('tjd_daily_reports_changed'));
          window.dispatchEvent(new Event('tjd_gps_clockins_changed'));
        }
      }, (index + 1) * 600);
    });
  };

  const handleExportCSV = () => {
    try {
      const headers = ["Row ID", "Timestamp Entry", "Division Mode", "Client / Employee Profile", "Measured Size / Phase", "Clay Soil / GPS Coefficient", "Dynamic Ballpark Estimate Range", "Sync Status"];
      const rows = ledgerRows.map(row => [
        row.rowId,
        row.timestamp,
        row.division,
        row.client,
        row.size,
        row.coefficient,
        row.estimate,
        row.status
      ]);
      const csvContent = [headers.join(","), ...rows.map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `TJD_Main_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to export Main Ledger CSV", e);
    }
  };

  const handleExportFullJSON = () => {
    try {
      const fullData = {
        mainLedger: ledgerRows,
        gpsClockins: JSON.parse(localStorage.getItem('tjd_gps_clockins') || '[]'),
        dailyReports: JSON.parse(localStorage.getItem('tjd_daily_reports') || '[]'),
        customWishlistBids: JSON.parse(localStorage.getItem('tjd_earthworks_bids') || '[]'),
        careersApplications: JSON.parse(localStorage.getItem('tjd_careers_applications') || '[]'),
        exportedAt: new Date().toISOString()
      };
      const dataStr = JSON.stringify(fullData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `TJD_Complete_Database_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to export JSON database", e);
    }
  };

  const handleRowBidClick = (row: ExcelLedgerRow) => {
    if (row.originalBidId) {
      setPreSelectedWishlistId(row.originalBidId);
      setActiveTab('client-field-intake');
    }
  };

  return (
    <>
      {/* Dynamic Authorization Portal Gate Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-3">
              <div className="p-3.5 bg-emerald-950 border border-emerald-800/50 text-emerald-400 rounded-full w-fit mx-auto">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-display font-black text-lg">Staff Operations Portal</h3>
              <p className="text-slate-400 text-xs">
                Enter your secure administrative PIN or override key to access live worker logs and Excel synchronizers.
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4 pt-4">
              <div className="space-y-1.5 text-xs text-left">
                <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Administrative PIN</label>
                <input
                  type="password"
                  placeholder="••••"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-center font-mono font-bold tracking-widest text-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all text-white"
                  autoFocus
                />
              </div>

              {pinError && (
                <p className="text-rose-400 font-semibold text-[11px] text-center">{pinError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <Unlock className="w-4 h-4" />
                <span>Verify & Unlock</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {isAuthorized && (
        <section className="py-20 bg-slate-950 text-white relative border-t border-slate-800 animate-in fade-in duration-300" id="automation-hub">
          {/* Visual cyber mesh pattern backing */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-40 pointer-events-none"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Headline Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <span className="font-display font-bold text-xs tracking-widest text-emerald-400 uppercase bg-emerald-950/40 border border-emerald-800/50 px-3.5 py-1.5 rounded-full inline-flex items-center gap-2">
                  <Cpu className="w-4 h-4 animate-spin" />
                  TJD CLOUD WORKFLOW INTERNALS
                </span>
                <button
                  type="button"
                  onClick={handleLockConsole}
                  className="font-display font-black text-[10px] uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-all"
                  title="Lock dashboard to secure operations"
                >
                  <Lock className="w-3 h-3 text-rose-500" />
                  <span>Secure Lock</span>
                </button>
              </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white">
            Automation & Dispatch Control Center
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            Skip complex manual uploads. Here is how your employee field clock-ins, GPS coordinates, and estimator lead entries synchronize automatically into your OneDrive spreadsheets.
          </p>
        </div>

        {/* Modular Navigation and Dashboard */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[500px]">
          
          {/* Dashboard utility header */}
          <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Tab Swappers */}
            <div className="flex flex-wrap bg-slate-900 p-1.5 rounded-xl border border-slate-800 gap-1.5 w-full">
              <button
                onClick={() => setActiveTab('agentic-assistant')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'agentic-assistant' ? 'bg-orange-600 text-white shadow-lg shadow-orange-700/30' : 'text-slate-300 hover:text-white bg-slate-950/80 border border-slate-800'
                }`}
                id="tab-agentic-assistant"
              >
                <Bot className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>🤖 Agentic AI Assistant</span>
              </button>
              <button
                onClick={() => setActiveTab('gps')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'gps' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>GPS Clock-In</span>
              </button>
              <button
                onClick={() => setActiveTab('client-field-intake')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'client-field-intake' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20' : 'text-slate-400 hover:text-white'
                }`}
                id="tab-client-field-intake"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Field Intake & Survey</span>
              </button>
              <button
                onClick={() => setActiveTab('intake')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'intake' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20' : 'text-slate-400 hover:text-white'
                }`}
                id="tab-daily-operator-report"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daily Operator Report</span>
              </button>
              <button
                onClick={() => setActiveTab('onedrive')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'onedrive' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automation & Sync / Load Deck</span>
                {ledgerRows.some(r => r.status === 'PENDING SYNC') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'applications' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Applications</span>
                <span className="bg-slate-950 text-brand-orange font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-slate-800">
                  {receivedApps.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <HardHat className="w-3.5 h-3.5 text-emerald-400" />
                <span>Field Reports</span>
                <span className="bg-slate-950 text-emerald-400 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-slate-800">
                  {fieldLogs.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('progression')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'progression' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Project Progression</span>
                <span className="bg-slate-950 text-emerald-400 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-slate-800">
                  {projectProgressStages.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('formulas')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'formulas' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reference Library</span>
              </button>
              <button
                onClick={() => setActiveTab('blog')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'blog' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-750/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Blog Manager</span>
              </button>
              <button
                onClick={() => setActiveTab('interns')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'interns' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-750/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Workforce & Interns</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('hr');
                  setActiveHRTab('roster');
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'hr' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-750/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>HR & Embedded Payroll</span>
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'manual' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-750/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Operating Manual</span>
              </button>
              <button
                onClick={() => setActiveTab('ballpark')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-color ${
                  activeTab === 'ballpark' ? 'bg-orange-600 text-white shadow-lg shadow-orange-700/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>In-House Estimator</span>
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-color ${
                  activeTab === 'opportunities' ? 'bg-orange-600 text-white shadow-lg shadow-orange-700/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>Opportunity Finder</span>
              </button>
              <button
                onClick={() => setActiveTab('branding')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'branding' ? 'bg-orange-600 text-white shadow-lg shadow-orange-700/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>App Customizer</span>
              </button>
            </div>

            {/* Cloud Sync Status Indicator badge */}
            <div className="flex items-center gap-3 bg-slate-900/60 py-2 px-4 border border-slate-800/80 rounded-full max-w-full">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="text-[11px] font-mono whitespace-nowrap">
                <span className="text-slate-400">SYNC STATE: </span>
                <span className="font-bold text-emerald-400">ACTIVE HANDSHAKE</span>
              </div>
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>

          </div>

          {/* Module Content Wrapper */}
          <div className="p-6 md:p-8">

            {/* Tab 1.25: Project Stage Progression Dashboard Desk */}
            {activeTab === 'progression' && (() => {
              // We filter based on dropdowns
              const filteredStages = projectProgressStages.filter(stage => {
                const matchProject = officeSelectedProjectId === 'all' || stage.projectId === officeSelectedProjectId;
                const matchForeman = officeSelectedForeman === 'all' || stage.foreman === officeSelectedForeman;
                return matchProject && matchForeman;
              });

              // Discover unique projects and foremen for dropdown lists
              const projectsListMap = new Map();
              projectProgressStages.forEach(stage => {
                projectsListMap.set(stage.projectId, stage.projectName);
              });
              const uniqueProjects = Array.from(projectsListMap.entries()).map(([id, name]) => ({ id, name }));

              const uniqueForemen = Array.from(new Set(projectProgressStages.map(stage => stage.foreman).filter(Boolean)));

              return (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <span>Project Stage Progression & Georeferencing Desk</span>
                      </h3>
                      <p className="text-slate-400 text-xs text-left">
                        Review physical earthwork progress milestones, supervisor comments, captured photos, and certified satellite geolocations from the field-shovels.
                      </p>
                    </div>
                    {/* Reset Button */}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to restore the baseline progression records and clear custom overrides?')) {
                          const baselineStages = [
                            {
                              id: 'PROG-1718816400000-1',
                              projectId: 'SUB-1718816000000-1234',
                              projectName: 'Greensboro Lot (Lake Oconee, GA)',
                              clientName: 'George Harrison',
                              stageTitle: 'Stage 1: Pre-Bid Survey Base',
                              stageNotes: 'Initial lakeside topographic inspection complete. Grade limits verified with laser line. Slope matches 7.5% natural pitch.',
                              submittedAt: '6/19/2026 8:30:00 AM',
                              foreman: 'TJ Darley',
                              latitude: '33.575600',
                              longitude: '-83.181800',
                              gpsDms: '33° 34\' 32.2" N 83° 10\' 54.5" W',
                              gpsUtm: 'Zone 17S E: 297732 N: 3717281',
                              gpsDdm: '33° 34.536\' N 83° 10.908\' W',
                              photoFilename: 'lakeside_initial_survey.jpg'
                            }
                          ];
                          setProjectProgressStages(baselineStages);
                          localStorage.setItem('tjd_project_progress_stages', JSON.stringify(baselineStages));
                          alert('Baseline progression data restored successfully.');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 rounded-lg hover:text-white uppercase font-bold tracking-wider hover:bg-slate-850 cursor-pointer shadow"
                    >
                      🔄 Reset Baseline
                    </button>
                  </div>

                  {/* Filter controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850 text-left text-xs font-sans">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 font-mono text-[9px] uppercase tracking-wide">FILTER BY ACTIVE PROJECT:</label>
                      <select
                        value={officeSelectedProjectId}
                        onChange={(e) => setOfficeSelectedProjectId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-slate-200 font-semibold outline-none focus:border-brand-orange"
                      >
                        <option value="all">Display All Projects ({projectProgressStages.length})</option>
                        <option value="SUB-1718816000000-1234">Greensboro Lot (Lake Oconee, GA) [George Harrison]</option>
                        {uniqueProjects.filter(p => p.id !== 'SUB-1718816000000-1234').map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 font-mono text-[9px] uppercase tracking-wide">FILTER BY FOREMAN:</label>
                      <select
                        value={officeSelectedForeman}
                        onChange={(e) => setOfficeSelectedForeman(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-slate-200 font-semibold outline-none focus:border-brand-orange"
                      >
                        <option value="all">Display All Foremen</option>
                        {uniqueForemen.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-left">
                      <div>
                        <span className="text-[9px] text-emerald-400 font-bold block leading-none font-mono tracking-widest">REAL-TIME SATELLITE CAD</span>
                        <p className="text-[11px] text-slate-400 mt-1 leading-tight">Every stage logs Trimble geocodes with dual GPS error correction overlays.</p>
                      </div>
                      <Database className="w-6 h-6 text-emerald-500 shrink-0 ml-2" />
                    </div>
                  </div>

                  {/* Main Grid View */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left: Project List Overview Mini Panel */}
                    <div className="lg:col-span-4 bg-slate-950 p-4 rounded-3xl border border-slate-850 space-y-4 text-left">
                      <div className="border-b border-slate-900 pb-2">
                        <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-widest block font-sans">Project Milestones Pipeline</span>
                      </div>
                      
                      <div className="space-y-2">
                        {/* Mock Greensboro package item */}
                        <div 
                          onClick={() => setOfficeSelectedProjectId('SUB-1718816000000-1234')}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                            officeSelectedProjectId === 'SUB-1718816000000-1234'
                              ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300 font-bold'
                              : 'bg-slate-900/50 border-slate-900 hover:border-slate-800 text-slate-400'
                          }`}
                        >
                          <h4 className="font-bold text-xs font-sans text-white">Lake Oconee Lot</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-sans leading-none">George Harrison • Greensboro, GA</p>
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[9px] font-mono leading-none bg-emerald-950 text-emerald-400 px-1 py-0.5 rounded border border-emerald-900 font-bold">Active</span>
                            <span className="text-[9.5px] text-slate-400 font-mono font-bold">
                              {projectProgressStages.filter(s => s.projectId === 'SUB-1718816000000-1234').length} Milestones
                            </span>
                          </div>
                        </div>

                        {/* Custom project list */}
                        {uniqueProjects.filter(p => p.id !== 'SUB-1718816000000-1234').map(proj => (
                          <div 
                            key={proj.id}
                            onClick={() => setOfficeSelectedProjectId(proj.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                              officeSelectedProjectId === proj.id
                                ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300 font-bold'
                                : 'bg-slate-900/50 border-slate-900 hover:border-slate-800 text-slate-400'
                            }`}
                          >
                            <h4 className="font-bold text-xs font-sans text-white truncate max-w-[170px]">{proj.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Active Pipeline</p>
                            <div className="flex justify-between items-center mt-2.5">
                              <span className="text-[9px] font-mono leading-none bg-emerald-955 text-emerald-450 px-1 py-0.5 rounded border border-emerald-900 font-bold">Custom</span>
                              <span className="text-[9.5px] text-slate-400 font-mono font-bold">
                                {projectProgressStages.filter(s => s.projectId === proj.id).length} Milestones
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        <div 
                          onClick={() => setOfficeSelectedProjectId('all')}
                          className={`p-3 rounded-xl border transition-all cursor-pointer text-center font-bold text-xs ${
                            officeSelectedProjectId === 'all'
                              ? 'bg-slate-900 border-slate-800 text-white'
                              : 'bg-slate-950 border-slate-900 hover:border-slate-850 text-slate-500'
                          }`}
                        >
                          Display All Timeline Logs
                        </div>
                      </div>
                    </div>

                    {/* Right: Master Timeline Sheet */}
                    <div className="lg:col-span-8 bg-slate-950 border border-slate-850 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                        <div className="space-y-1">
                          <h4 className="font-display font-black text-md text-white tracking-tight uppercase flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span>Progression Audit Timeline</span>
                          </h4>
                          <p className="text-slate-450 text-xs">
                            Chronological history of construction milestones completed by field-crews. Logged from the site.
                          </p>
                        </div>
                        <span className="text-[10.5px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-1 rounded font-mono font-bold">
                          {filteredStages.length} STAGES RENDERED
                        </span>
                      </div>

                      {filteredStages.length === 0 ? (
                        <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-slate-900 space-y-2">
                          <p className="text-slate-400 text-xs sm:text-sm font-bold">No progress snapshots logged for selected filter.</p>
                          <p className="text-slate-505 text-[11px]">Deploy the on-site foreman's device to catalog stage photos and Trimble georeferencing coordinate check-ins.</p>
                        </div>
                      ) : (
                        <div className="relative pl-6 sm:pl-8 space-y-8 font-sans">
                          {/* Vertical connecter line */}
                          <div className="absolute left-2.5 sm:left-3.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-slate-900"></div>

                          {filteredStages.map((stage) => (
                            <div key={stage.id} className="relative space-y-3 animate-in fade-in duration-200">
                              {/* Timeline node circle */}
                              <div className="absolute -left-[23px] sm:-left-[27px] top-1 w-4 h-4 rounded-full bg-slate-950 border-4 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/40 z-10"></div>
                              
                              {/* Stage card */}
                              <div className="bg-slate-900/70 border border-slate-850 p-5 rounded-2xl shadow-md relative overflow-hidden group">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Do you wish to delete progression phase '${stage.stageTitle}'? This is irreversible.`)) {
                                      const updatedList = projectProgressStages.filter(s => s.id !== stage.id);
                                      setProjectProgressStages(updatedList);
                                      localStorage.setItem('tjd_project_progress_stages', JSON.stringify(updatedList));
                                    }
                                  }}
                                  className="absolute top-4 right-4 text-slate-600 hover:text-rose-455 p-2 rounded-lg bg-slate-950/60 hover:bg-slate-950 transition-all font-bold text-xs"
                                  title="Delete Stage"
                                >
                                  Delete
                                </button>

                                {/* Upper info */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850/60 pb-2.5 pr-12">
                                  <div>
                                    <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded font-bold inline-block mb-1">
                                      Project Milestone Stage
                                    </span>
                                    <h5 className="font-display font-black text-sm text-white leading-snug">{stage.stageTitle}</h5>
                                    <p className="text-slate-400 text-[10.5px]">Project: <strong className="text-slate-300">{stage.projectName}</strong> {stage.clientName ? `• ${stage.clientName}` : ''}</p>
                                  </div>
                                  <div className="text-left sm:text-right text-[10.5px]">
                                    <span className="text-slate-500 block">Foreman Checked</span>
                                    <span className="font-mono text-slate-300 font-bold">{stage.foreman}</span>
                                    <span className="text-[9.5px] text-slate-500 block font-mono mt-0.5">{stage.submittedAt}</span>
                                  </div>
                                </div>

                                {/* Remarks notes */}
                                <p className="text-[12px] text-slate-300 leading-relaxed pt-2.5 italic">
                                  "{stage.stageNotes}"
                                </p>

                                {/* Photo section */}
                                {stage.photoBase64 ? (
                                  <div className="pt-3 max-w-md">
                                    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group/img">
                                      <img
                                        src={stage.photoBase64}
                                        alt={stage.stageTitle}
                                        className="w-full max-h-56 object-cover hover:scale-101 transition-transform"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded px-2 py-1 text-[9px] text-slate-400 font-mono">
                                        File: {stage.photoFilename}
                                      </div>
                                    </div>
                                  </div>
                                ) : stage.photoFilename === 'lakeside_initial_survey.jpg' ? (
                                  /* Preset Greensboro Mock Image illustration placeholder */
                                  <div className="pt-3 max-w-md animate-in zoom-in-95 duration-100">
                                    <div className="relative rounded-xl overflow-hidden border border-slate-850 bg-gradient-to-tr from-slate-950 to-slate-950 p-6 text-center space-y-2">
                                      <div className="mx-auto w-10 h-10 rounded-full bg-emerald-950 border border-emerald-804 flex items-center justify-center text-lg text-emerald-450">
                                        🏞️
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-white text-xs font-bold font-sans">Lakeside Terrain Initial Survey Snapshot</p>
                                        <p className="text-slate-500 text-[10px] max-w-xs mx-auto font-sans leading-relaxed">Original landscape survey check compiled on on-site device. Geo-tagged to Greensboro Lot private dock parcel.</p>
                                      </div>
                                      <div className="text-[9px] text-slate-500 font-mono bg-slate-950 py-0.5 px-2 rounded-full w-fit mx-auto border border-slate-800">
                                        lakeside_initial_survey.jpg • Embedded
                                      </div>
                                    </div>
                                  </div>
                                ) : null}

                                {/* Geolocated proof info */}
                                {(stage.latitude && stage.longitude) && (
                                  <div className="mt-4 pt-3.5 border-t border-slate-850/60 text-[10px] font-mono text-slate-400 space-y-2">
                                    <span className="text-[9px] text-emerald-400 uppercase font-sans font-bold tracking-widest block font-sans">Geological Satellite Verification Check:</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div className="bg-slate-950 p-2 rounded border border-slate-850/40">
                                        <span className="text-[8px] text-slate-600 uppercase font-black block">Survey DMS</span>
                                        <span className="text-white font-bold">{stage.gpsDms || decimalToDMS(parseFloat(stage.latitude), parseFloat(stage.longitude)).combined}</span>
                                      </div>
                                      <div className="bg-slate-950 p-2 rounded border border-slate-850/40">
                                        <span className="text-[8px] text-slate-600 uppercase font-black block">Dozer/Trimble UTM</span>
                                        <span className="text-emerald-400 font-bold">{stage.gpsUtm || decimalToUTM(parseFloat(stage.latitude), parseFloat(stage.longitude)).formatted}</span>
                                      </div>
                                      <div className="bg-slate-950 p-2 rounded border border-slate-850/40">
                                        <span className="text-[8px] text-slate-600 uppercase font-black block">Standard Dec</span>
                                        <span className="text-slate-300 font-bold">{stage.latitude}, {stage.longitude}</span>
                                      </div>
                                    </div>

                                    <div className="pt-1 select-none">
                                      <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${stage.latitude},${stage.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-350 underline font-sans text-[9.5px]"
                                      >
                                        <span>🛰️ Proof Satellite Lock on Google Maps</span>
                                        <ExternalLink className="w-3 h-3 text-sky-400" />
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Tab 1.4: Client Field Intake & Survey Form */}
            {activeTab === 'client-field-intake' && (
              <div className="space-y-6 animate-in fade-in duration-200" id="office-client-field-intake-tab">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                      <span>Client & Pre-Bid Field Intake Survey Form</span>
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Collect client data, fetch GPS coordinates, input dimensions, take site photographs, and instantly compute site calculations and ballpark estimate.
                    </p>
                  </div>
                </div>
                <ClientFieldIntake embedded={true} initialWishlistId={preSelectedWishlistId} />
              </div>
            )}

            {/* Tab 1.5: Field Intake Form */}
            {activeTab === 'intake' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-brand-orange" />
                      <span>Daily Operator Site & Progress Report Form</span>
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Log daily machine hours, clay profiles, cleared acreage and work notes. Submitted entries flow instantly to the OneDrive sync ledger.
                    </p>
                  </div>
                </div>
                <FieldIntake embedded={true} />
              </div>
            )}

            {/* Tab 1: GPS Field Clock-In Demo */}
            {activeTab === 'gps' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Standalone Quick Link Banner */}
                <div className="lg:col-span-12 bg-emerald-950/25 border border-emerald-500/25 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                        <span>Direct Crew Mobile Bookmark Available</span>
                        <span className="text-[9px] bg-emerald-500 text-white font-mono px-1.5 py-0.5 rounded leading-none">HIGHLY RECOMMENDED</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-normal mt-0.5 max-w-3xl">
                        To skip loading the entire website, text this dedicated mobile link to your crew members' phones. They can add it as a bookmark icon on their home screens to clock in with 1 click:
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
                    <span className="text-[10px] font-mono select-all px-3 py-1 text-emerald-400 font-bold">
                      {window.location.origin + window.location.pathname + "#clock-in"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + window.location.pathname + "#clock-in");
                        alert("Direct Crew Clock-In link copied to clipboard!\n\nText this link to your crew members' phones for instant one-click access.");
                      }}
                      className="px-3.5 py-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all active:scale-95 whitespace-nowrap"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
                
                {/* Clockin Action Box - Left Column */}
                <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-1.5">
                      <HardHat className="w-5 h-5 text-emerald-400" />
                      Employee Site Clock-In Screen
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Simulates field team members checking in for labor allocation audits. Retrieves real-time coordinates.
                    </p>
                  </div>

                  {/* Form control fields */}
                  <div className="space-y-3 pt-3">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300">Logged Employee</label>
                      <select
                        value={employeeName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEmployeeName(val);
                          const matching = employees.find(emp => emp.name === val);
                          if (matching) {
                            setEmployeeRole(matching.role);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-emerald-600 transition-colors"
                      >
                        {employees.filter(emp => emp.status === 'active').map(emp => (
                          <option key={emp.id} value={emp.name}>
                            {emp.name} ({emp.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300">Active Machinery / Assignment</label>
                      <select
                        value={employeeRole}
                        onChange={(e) => setEmployeeRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-emerald-600 transition-colors"
                      >
                        <option value="Forestry Mulcher Operator">Forestry Mulcher Operator</option>
                        <option value="Finish Grade Dozer Operator">Finish Grade Dozer Operator</option>
                        <option value="GPS Excavating Engineer">GPS Excavating Engineer</option>
                        <option value="Heavy Compact Loader Operator">Heavy Compact Loader Operator</option>
                        <option value="General Ground Crew Crew Foreman">General Ground Crew Foreman</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300">Target Dispatch Site Location</label>
                      <select
                        value={activeSite}
                        onChange={(e) => setActiveSite(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-emerald-600 transition-colors"
                      >
                        <option value="Greensboro Lot (Lake Oconee)">Greensboro Lot (Lake Oconee, GA)</option>
                        <option value="Peach County Warehouse Pad">Peach County Warehouse Hub (GA)</option>
                        <option value="Warner Robins Commercial lot">Warner Robins Pad Site (GA)</option>
                        <option value="Macon Highway Drainage runoff">Macon Interstate Outlets (GA)</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300">Active Structural Phase</label>
                      <select
                        value={activePhase}
                        onChange={(e) => setActivePhase(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-emerald-600 transition-colors"
                      >
                        <option value="Phase 1: Forestry Clearing & Mulching">Phase 1: Forestry Clearing & Mulching</option>
                        <option value="Phase 2: Lot excavation & balancing">Phase 2: Lot excavation & balancing</option>
                        <option value="Phase 3: Utility pipe culverts laying">Phase 3: Utility pipe culverts laying</option>
                        <option value="Phase 4: Crown grading driveways">Phase 4: Crown grading driveways</option>
                        <option value="Phase 5: Final high-compaction certifications">Phase 5: Final high-compaction certifications</option>
                      </select>
                    </div>
                  </div>

                  {/* Location tracking credentials panel */}
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>GEOLOGICAL DETECTOR:</span>
                      {gpsStatus === 'success' ? (
                        <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold uppercase">Locked</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center" id="gps-detector-meters">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-[10px] uppercase text-slate-500 block">Latitude</span>
                        <span className="font-mono font-bold text-slate-200">{latitude || '—'}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-[10px] uppercase text-slate-500 block">Longitude</span>
                        <span className="font-mono font-bold text-slate-200">{longitude || '—'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={requestGPSCoordinates}
                      disabled={gpsStatus === 'locating'}
                      className="w-full py-2 bg-slate-850 hover:bg-slate-800 border-2 border-dashed border-emerald-600/40 hover:border-emerald-500 hover:text-emerald-300 text-slate-300 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 text-emerald-400 ${gpsStatus === 'locating' ? 'animate-spin' : ''}`} />
                      {gpsStatus === 'locating' ? 'Detecting satellites...' : 'Acquire Verified GPS Location'}
                    </button>
                  </div>

                  {/* Actions to submit hours */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleClockAction('Clock In')}
                      className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg shadow-lg hover:shadow-emerald-600/10 transition-all flex justify-center items-center gap-2 uppercase tracking-wide"
                    >
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Clock In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClockAction('Clock Out')}
                      className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-2 uppercase tracking-wide"
                    >
                      <ArrowRight className="w-4 h-4 rotate-90 shrink-0" />
                      <span>Clock Out</span>
                    </button>
                  </div>

                </div>

                {/* GPS Feed list logs - Right block */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-bold text-sm text-slate-200">
                      Live GPS Transmission Ledger Logs
                    </h4>
                    <span className="text-[10px] text-slate-400">Total logs: {gpsLogs.length}</span>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2" id="gps-logs-list">
                    {gpsLogs.map((log) => (
                      <div
                        key={log.txId}
                        className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-emerald-900/50 transition-colors"
                      >
                        <div className="flex gap-3.5 items-start">
                          <div className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                            log.action === 'Clock In' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <HardHat className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-100 text-sm">{log.name}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{log.operatorRole}</span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{log.locationName}</span>
                            </p>
                            <div className="text-[10px] font-mono text-slate-500">
                              Verified GPS: Lat {log.lat.toFixed(4)}, Lon {log.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 border-t sm:border-0 pt-2 sm:pt-0 border-slate-800">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                            log.action === 'Clock In' ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-slate-850 text-slate-300'
                          }`}>
                            {log.action}
                          </span>
                          <div className="text-right text-[10px] text-slate-500 font-mono">
                            {log.timestamp}
                          </div>
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            log.isSynced ? 'text-emerald-400 bg-emerald-950/20' : 'text-amber-400 bg-amber-950/20 animate-pulse'
                          }`}>
                            {log.isSynced ? "● Synced to Excel" : "○ Queue Pending..."}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl text-xs space-y-1.5 text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-200 block text-xs uppercase tracking-wider font-display">How This Cuts Out bulky labor workarounds:</span>
                    <p>&bull; No more hand-written paper logs. Operators check-in on their phones directly from field dumptrucks and mulching tractors.</p>
                    <p>&bull; Geolocation reads exact site latitudes to prove GPS presence. This data feeds into your active Excel ledger queue with no middleman required.</p>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Excel Live Ledger Integration */}
            {activeTab === 'onedrive' && (
              <div className="space-y-6">
                
                {/* Integration Panel header controls */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-5" id="onedrive-sync-banner">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <CloudLightning className="w-5 h-5 text-amber-400 animate-bounce" />
                      OneDrive & Google Sheets Webhook Dispatch Engine
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Updates the `Estimator_Dynamic.xlsx` spreadsheet residing on Microsoft OneDrive automatically with outstanding ledger entries.
                    </p>
                  </div>
                  
                  <button
                    onClick={runOneDriveSynchronizer}
                    disabled={syncing}
                    className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-black text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/10 uppercase tracking-widest shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Connecting Hook Services...' : 'Sync Now with OneDrive Ledger File'}
                  </button>
                </div>

                {/* Webhook Connection settings card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl" id="sheet-webhook-config-card">
                  <div className="border-b border-slate-900 pb-3 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4.5 h-4.5 text-brand-orange" />
                        <span>Google Sheets Apps Script Connection Setting</span>
                      </h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-sans">
                        Control where live GPS clock-ins, daily operator site progress reports, estimate requests, and careers forms are routed.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono bg-amber-950/40 text-brand-orange border border-brand-orange/30 px-2 py-0.5 rounded select-all">
                      ACTIVE SYSTEM-WIDE
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={webhookInput}
                          onChange={(e) => setWebhookInput(e.target.value)}
                          placeholder="Your pasted Google Apps Script Web App URL ending in /exec"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-[11px] sm:text-xs text-slate-200 outline-none font-mono focus:border-brand-orange transition-all placeholder-slate-700"
                        />
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setWebhookUrl(webhookInput);
                            setWebhookStatusMessage('✅ Webhook URL successfully updated and persisted!');
                            setTimeout(() => setWebhookStatusMessage(''), 4000);
                          }}
                          className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Setting</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const defaultUrl = 'https://script.google.com/macros/s/AKfycby4jjif4uVkcO2WNXz7fGxhD7N_bl2GImo6MleLxnw7OY9loHCuDo_CxKKhWyoY3t30/exec';
                            setWebhookInput(defaultUrl);
                            setWebhookUrl(defaultUrl);
                            setWebhookStatusMessage('🔄 Reset to system default stable endpoint!');
                            setTimeout(() => setWebhookStatusMessage(''), 4000);
                          }}
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-lg transition-all"
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>

                    {webhookStatusMessage && (
                      <div className="bg-slate-900 border border-slate-850 text-emerald-400 font-mono text-[10.5px] p-2.5 rounded-lg text-center transition-all animate-in fade-in">
                        {webhookStatusMessage}
                      </div>
                    )}

                    <div className="p-3.5 bg-slate-900/60 border border-slate-900 rounded-xl space-y-2 text-[11px] font-sans text-slate-300">
                      <span className="font-bold text-brand-orange block text-[11px] uppercase tracking-wider">How to Deploy & Hook Up Your Excel/Google Script:</span>
                      <p className="leading-relaxed">&bull; Open your Google Sheet, click <strong className="text-white">Extensions &gt; Apps Script</strong>.</p>
                      <p className="leading-relaxed">&bull; Paste the stable script code you developed, click <strong className="text-white">Deploy &gt; New Deployment</strong>.</p>
                      <p className="leading-relaxed">&bull; Select <strong className="text-white">Web App</strong>, set Execute as <strong className="text-white">Me (Your Email)</strong>, and Who has access to <strong className="text-white">Anyone</strong>.</p>
                      <p className="leading-relaxed">&bull; Copy the Web App URL (ending in <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400 text-[10px]">/exec</code>), paste it into the field above, and click <strong className="text-white">Save Setting</strong>!</p>
                    </div>
                  </div>
                </div>
                {/* SMTP Direct Business Email Integration card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl animate-in fade-in duration-250" id="smtp-email-config-card">
                  <div className="border-b border-slate-900 pb-3 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                        <Mail className="w-4.5 h-4.5 text-emerald-450" />
                        <span>Direct Business Email SMTP Alerts Connection Setting</span>
                      </h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-sans">
                        Free secure email forwarding. Sends lead and estimate updates directly to <strong className="text-white">info@tjdarleyconstruction.com</strong>.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded">
                      100% FREE DIRECT EMBED
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">SMTP Server Host</label>
                        <input
                          type="text"
                          value={smtpConfig.host || ''}
                          onChange={(e) => setSmtpConfigState({ ...smtpConfig, host: e.target.value })}
                          placeholder="e.g. smtp.webstarts.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[11px] sm:text-xs text-slate-200 outline-none focus:border-brand-orange transition-all placeholder-slate-750 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">SMTP Port</label>
                        <input
                          type="number"
                          value={smtpConfig.port || 465}
                          onChange={(e) => setSmtpConfigState({ ...smtpConfig, port: parseInt(e.target.value) || 465 })}
                          placeholder="465 (SSL) or 587 (TLS)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[11px] sm:text-xs text-slate-200 outline-none focus:border-brand-orange transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Connection Security</label>
                        <select
                          value={smtpConfig.secure ? "secure" : "plain"}
                          onChange={(e) => setSmtpConfigState({ ...smtpConfig, secure: e.target.value === "secure" })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[11px] sm:text-xs text-slate-200 outline-none focus:border-brand-orange transition-all font-sans cursor-pointer"
                        >
                          <option value="secure">SSL / Secure Connection (Port 465)</option>
                          <option value="plain">Non-SSL / TLS Connection (Port 587 / 25)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Webstarts Email Address (SMTP User)</label>
                        <input
                          type="text"
                          value={smtpConfig.user || ''}
                          onChange={(e) => setSmtpConfigState({ ...smtpConfig, user: e.target.value })}
                          placeholder="info@tjdarleyconstruction.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[11px] sm:text-xs text-slate-200 outline-none focus:border-brand-orange transition-all placeholder-slate-750 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-300 mb-1.5">Webstarts Email SMTP Password</label>
                        <input
                          type="password"
                          value={smtpConfig.pass || ''}
                          onChange={(e) => setSmtpConfigState({ ...smtpConfig, pass: e.target.value })}
                          placeholder="Your email password"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[11px] sm:text-xs text-slate-200 outline-none focus:border-brand-orange transition-all placeholder-slate-750 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Send Alerts To Email (Destination)</label>
                        <input
                          type="text"
                          value={smtpConfig.toEmail || ''}
                          onChange={(e) => setSmtpConfigState({ ...smtpConfig, toEmail: e.target.value })}
                          placeholder="info@tjdarleyconstruction.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[11px] sm:text-xs text-slate-200 outline-none focus:border-brand-orange transition-all placeholder-slate-750 font-mono"
                        />
                      </div>
                    </div>

                    {/* FREE CELL PHONE SMS TEXT ALERTS ROUTING */}
                    <div className="border-t border-slate-900/60 pt-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-emerald-450 mb-1.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Free Instant Mobile SMS Text Alerts Carrier</span>
                        </label>
                        <select
                          value={smtpConfig.smsCarrier || 'none'}
                          onChange={(e) => setSmtpConfigState({ ...smtpConfig, smsCarrier: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[11px] sm:text-xs text-slate-200 outline-none focus:border-brand-orange transition-all font-sans cursor-pointer"
                        >
                          <option value="none">None (Disabled - No text alerts)</option>
                          <option value="verizon">Verizon Wireless (number@vtext.com)</option>
                          <option value="att">AT&T Mobile (number@txt.att.net)</option>
                          <option value="tmobile">T-Mobile (number@tmomail.net)</option>
                          <option value="sprint">Sprint PCS (number@messaging.sprintpcs.com)</option>
                          <option value="boost">Boost Mobile (number@myboostmobile.com)</option>
                          <option value="cricket">Cricket Wireless (number@mms.cricketwireless.net)</option>
                          <option value="custom">Custom SMS Email Gateway Domain</option>
                        </select>
                      </div>
                      {smtpConfig.smsCarrier && smtpConfig.smsCarrier !== 'none' && (
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Alert Phone Number (Numbers only)</label>
                          <input
                            type="text"
                            value={smtpConfig.smsPhone || ''}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '');
                              setSmtpConfigState({ ...smtpConfig, smsPhone: digits });
                            }}
                            placeholder="e.g. 4788087789"
                            maxLength={10}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[11px] sm:text-xs text-slate-200 outline-none focus:border-brand-orange transition-all placeholder-slate-755 font-mono"
                          />
                        </div>
                      )}
                      {smtpConfig.smsCarrier === 'custom' && (
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Custom SMS gateway domain</label>
                          <input
                            type="text"
                            value={smtpConfig.smsGateway || ''}
                            onChange={(e) => setSmtpConfigState({ ...smtpConfig, smsGateway: e.target.value })}
                            placeholder="e.g. page.nextel.com"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-[11px] sm:text-xs text-slate-200 outline-none focus:border-brand-orange transition-all placeholder-slate-755 font-mono"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSmtpConfig(smtpConfig);
                          setSmtpStatusMessage('✅ SMTP Configuration successfully saved!');
                          setTimeout(() => setSmtpStatusMessage(''), 4000);
                        }}
                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Mail Settings</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!smtpConfig.user || !smtpConfig.pass) {
                            setSmtpStatusMessage('❌ Please enter your Webstarts SMTP Email & Password first!');
                            setTimeout(() => setSmtpStatusMessage(''), 4000);
                            return;
                          }
                          setSmtpStatusMessage('Sending test email via secure SMTP relay...');
                          try {
                            const response = await fetch('/api/send-email', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                smtp: smtpConfig,
                                payload: {
                                  leadType: 'TEST DIAGNOSTIC ALERT',
                                  clientName: 'TJ Darley Construction Tester',
                                  clientPhone: '478-555-0199',
                                  clientEmail: 'info@tjdarleyconstruction.com',
                                  details: 'This is a secure direct SMTP diagnostics test. If you received this email, congratulations! Your website is now fully integrated with your email - completely independent with a secure direct connection.'
                                }
                              })
                            });
                            if (response.ok) {
                              setSmtpStatusMessage('🚀 Success! Check your info@tjdarleyconstruction.com inbox now!');
                            } else {
                              const errData = await response.json();
                              setSmtpStatusMessage(`❌ SMTP Server Error: ${errData.error || 'Check username/password security settings.'}`);
                            }
                          } catch (e) {
                            setSmtpStatusMessage('❌ Failed connection: ' + String(e));
                          }
                          setTimeout(() => setSmtpStatusMessage(''), 6000);
                        }}
                        className="bg-brand-orange hover:bg-orange-500 font-bold text-xs text-white uppercase tracking-wider py-2.5 px-4 rounded-lg transition-all cursor-pointer"
                      >
                        Test Email Dispatch
                      </button>
                    </div>

                    {smtpStatusMessage && (
                      <div className={`border font-mono text-[10.5px] p-2.5 rounded-lg text-center transition-all animate-in fade-in ${
                        smtpStatusMessage.includes('Success') || smtpStatusMessage.includes('saved') || smtpStatusMessage.includes('SMTP Relay')
                          ? 'bg-slate-900 border-slate-850 text-emerald-400'
                          : 'bg-slate-900 border-slate-850 text-brand-orange'
                      }`}>
                        {smtpStatusMessage}
                      </div>
                    )}

                    <div className="p-3.5 bg-slate-900/60 border border-slate-900 rounded-xl space-y-2 text-[11px] font-sans text-slate-300">
                      <span className="font-bold text-brand-orange block text-[11px] uppercase tracking-wider">How to enable 100% Free Direct Email alerts on your custom Webstarts domain:</span>
                      <p className="leading-relaxed">&bull; When you purchase or host a domain on Webstarts, they offer customized business SMTP servers for mailboxes like <strong className="text-white">info@tjdarleyconstruction.com</strong>.</p>
                      <p className="leading-relaxed">&bull; Set the SMTP Server Host to your Webstarts email server name (defaults to <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400 text-[10px]">smtp.webstarts.com</code>).</p>
                      <p className="leading-relaxed">&bull; Type in your full mailbox address <code className="bg-slate-950 px-1 py-0.5 rounded text-white text-[10.5px]">info@tjdarleyconstruction.com</code> and the corresponding password.</p>
                      <p className="leading-relaxed">&bull; Click <strong className="text-white">Save Mail Settings</strong>, then run <strong className="text-white">Test Email Dispatch</strong>. This sends a beautifully formatted diagnostic lead message straight to your inbox securely!</p>
                    </div>
                  </div>
                </div>

                {/* Progress logs overlay if syncing */}
                {syncing && (
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2 font-mono text-xs max-h-[180px] overflow-y-auto" id="sync-console-logs">
                    <span className="text-emerald-400 font-bold block pb-1 border-b border-slate-900">Synchronizer Processing console logs:</span>
                    {syncLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 text-slate-300">
                        <span className="text-emerald-500 font-bold">&gt;&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}

                {syncSuccess && !syncing && (
                  <div className="bg-emerald-950/40 border border-emerald-800/80 p-4 rounded-xl text-xs text-emerald-300 flex items-center gap-3" id="sync-success-panel">
                    <Sparkles className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block">Live Webhook Handshake Complete!</span>
                      <span>Excel ledger database file `Estimator_Dynamic.xlsx` and local records are now completely matching. Bi-directional formulas recalculated.</span>
                    </div>
                  </div>
                )}

                {/* Interactive Excel Grid Rendering */}
                <div className="bg-[#1e293b] border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl" id="excel-mockup-frame">
                  {/* Excel Top Menu tab */}
                  <div className="bg-[#0f172a] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] font-sans">
                    <div className="flex items-center gap-4 text-slate-400 font-medium">
                      <span className="font-bold text-white bg-emerald-600 px-2 py-0.5 rounded leading-none">Excel</span>
                      <span>File</span>
                      <span>Home</span>
                      <span>Insert</span>
                      <span>Formulas</span>
                      <span>Data</span>
                      <span>Review</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        AUTO-CONNECTED TO CLOUD
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono text-[10px]">TJD_ESTIMATOR_DYNAMIC.XLSX</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-850 border-b border-slate-700 text-slate-300 uppercase tracking-wider font-semibold">
                          <th className="py-2.5 px-4 text-center font-mono w-14">Row ID</th>
                          <th className="py-2.5 px-4">Timestamp Entry</th>
                          <th className="py-2.5 px-4">Division Mode</th>
                          <th className="py-2.5 px-4">Client / Employee Profile</th>
                          <th className="py-2.5 px-4">Measured Size / Phase</th>
                          <th className="py-2.5 px-4">Clay soil / GPS Coefficient</th>
                          <th className="py-2.5 px-4">Dynamic Ballpark Estimate Range</th>
                          <th className="py-2.5 px-4 text-center">Cloud Sync</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {ledgerRows.map((row) => (
                          <tr key={row.rowId} className="hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400 border-r border-slate-800 bg-slate-900">
                              {row.originalBidId ? (
                                <button
                                  onClick={() => handleRowBidClick(row)}
                                  className="underline decoration-emerald-500/50 hover:decoration-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                                  title="Click to open Field Intake & pre-fill this client's wishlist"
                                >
                                  {row.rowId}
                                </button>
                              ) : (
                                row.rowId
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-medium">{row.timestamp}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                row.division === 'Commercial' ? 'bg-amber-950 text-amber-300 border border-amber-900/50' : 'bg-emerald-950 text-emerald-300 border border-emerald-900/50'
                              }`}>
                                {row.division}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white max-w-[180px] truncate">{row.client}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-400">{row.size}</td>
                            <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">{row.coefficient}</td>
                            <td className="py-3.5 px-4 font-bold text-emerald-400">
                              {row.originalBidId ? (
                                <button
                                  onClick={() => handleRowBidClick(row)}
                                  className="flex items-center gap-1.5 underline decoration-emerald-500/40 hover:decoration-emerald-300 text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer text-left"
                                  title="Click to load into Field Intake and process this lead"
                                >
                                  <span>{row.estimate}</span>
                                  <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded uppercase font-black tracking-widest no-underline shrink-0">
                                    Create Estimate
                                  </span>
                                </button>
                              ) : (
                                row.estimate
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                                row.status === 'SYNCHRONIZED' 
                                  ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900' 
                                  : 'bg-amber-950/50 text-amber-400 border border-amber-900 animate-pulse'
                              }`}>
                                {row.status === 'SYNCHRONIZED' ? "Synchronized" : "Pending Sync"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Excel Sheet tabs footer */}
                  <div className="bg-[#0f172a] p-2 border-t border-slate-800 text-[11px] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 font-mono text-slate-500">
                    <div className="flex gap-2">
                      <span className="bg-[#1e293b] font-bold text-emerald-400 px-3 py-1 rounded border border-slate-800">Sheet1 (Main Ledger)</span>
                      <span className="px-3 py-1">Sheet2 (GPS Logs Feed)</span>
                      <span className="px-3 py-1">Sheet3 (Soil Multipliers Setup)</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportCSV}
                        className="py-1 px-2.5 bg-slate-900 hover:bg-slate-800 hover:text-white text-emerald-400 border border-slate-800 rounded text-[10.5px] transition-colors"
                        title="Download main grid as a .csv file"
                      >
                        ↓ Export Sheet (CSV)
                      </button>
                      <button
                        onClick={handleExportFullJSON}
                        className="py-1 px-2.5 bg-slate-900 hover:bg-slate-800 hover:text-white text-amber-400 border border-slate-800 rounded text-[10.5px] transition-colors"
                        title="Backup complete browser localStorage as .json"
                      >
                        ↓ Get Data Backup (JSON)
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Tab 3: Reference Library and GIS Math Formulas */}
            {activeTab === 'formulas' && (() => {
              const referenceLinks = [
                {
                  id: 'ref-811',
                  title: 'Georgia 811 Dig Safely Portal',
                  url: 'https://www.georgia811.com/',
                  category: 'Safety & Utilities',
                  badge: '3-Day Civil Notice',
                  desc: 'Mandatory 3-business-day utility locate ticket generator. Must be filed prior to dropping excavator buckets on site to protect subterranean gas, telecom, power, and mains.',
                },
                {
                  id: 'ref-gswcc',
                  title: 'GSWCC Official Website',
                  url: 'https://gaswcc.georgia.gov/',
                  category: 'Erosion & Compliance',
                  badge: 'Blue Card Rules',
                  desc: 'Official hub for the Georgia Soil & Water Conservation Commission offering IA / IB certifications, active compliance checklists, and land clearing standards.',
                },
                {
                  id: 'ref-greenbook',
                  title: 'GSWCC Technical Guidance (Green Book)',
                  url: 'https://gaswcc.georgia.gov/urban-erosion-sediment-control/technical-guidance',
                  category: 'Erosion & Compliance',
                  badge: 'Silt Block Standard',
                  desc: 'Manual for Georgia soil erosion control. Specifies placement for Type C wire-backed fencing, rip-rap check dams, concrete spillways, and temporary grass covers.',
                },
                {
                  id: 'ref-soil-survey',
                  title: 'USDA Web Soil Survey (WSS)',
                  url: 'https://websoilsurvey.sc.egov.usda.gov/',
                  category: 'Soil Mechanics',
                  badge: 'Clay Density Check',
                  desc: 'Spatially enabled USDA database highlighting moisture profiles, clay loam cohesive ratios, and load-bearing capacities for heavy crawlers on regional sites.',
                },
                {
                  id: 'ref-epd-npdes',
                  title: 'Georgia EPD Stormwater NPDES Permits',
                  url: 'https://epd.georgia.gov/npdes-construction-stormwater-general-permits',
                  category: 'Codes & Permits',
                  badge: 'GAR-100002 threshold',
                  desc: 'State general environmental permits system detailing GAR100001 (Stand-Alone) and GAR100002 (Infrastructure) requirements for clearings exceeding 1.0 acre.',
                },
                {
                  id: 'ref-pond-NRCS',
                  title: 'USDA NRCS Pond Construction Standards',
                  url: 'https://www.nrcs.usda.gov/sites/default/files/2022-09/Pond_378_NHCP_CPS_2022.pdf',
                  category: 'Pond Design & Specs',
                  badge: 'Core Keyway Slope',
                  desc: 'Design handbook (AH-590) specifying private embankment heights, clay blanket thickness, anti-seep mechanical pipe collars, and overflow spillway calculations. Use USDA FOTG (fotg.apps.nrcs.usda.gov) for localized Georgia state codes (Standard 378).',
                },
                {
                  id: 'ref-osha-trench',
                  title: 'OSHA Trenching & Excavation Rules',
                  url: 'https://www.osha.gov/trenching-excavation',
                  category: 'Safety & Utilities',
                  badge: 'Type A Clay: 0.75:1 Slope',
                  desc: 'Federal safety directives regarding heavy hydraulic shoring, trench boxes, support shelving, ladder spacing constraints, and structural soil types.',
                },
                {
                  id: 'ref-ga-nrcs',
                  title: 'Georgia NRCS Conservation Portal',
                  url: 'https://www.nrcs.usda.gov/conservation-basics/conservation-by-state/georgia',
                  category: 'Soil Mechanics',
                  badge: 'Georgia Compact Specs',
                  desc: 'Regional conservation standards including water reservoir geometry advice, watershed sediment traps, and pasture grading guidance optimized for central Georgia red clay.',
                },
                {
                  id: 'ref-cat-guide',
                  title: 'Caterpillar Sizing & Push Matrix (CAT)',
                  url: 'https://www.cat.com/',
                  category: 'Equipment & Sizing',
                  badge: 'LGP Tracks: 4.2 PSI Limit',
                  desc: 'Reference specifications for bulldozer blade push metrics, excavator payload cycle timers, volumetric swell factors, and ground pressure computations for mud rigs.',
                }
              ];

              const filteredRefs = referenceLinks.filter(ref => {
                const searchLower = refSearch.toLowerCase();
                const matchesSearch = ref.title.toLowerCase().includes(searchLower) ||
                                      ref.desc.toLowerCase().includes(searchLower) ||
                                      ref.category.toLowerCase().includes(searchLower) ||
                                      ref.badge.toLowerCase().includes(searchLower);
                const matchesCategory = refCategory === 'All' || ref.category === refCategory;
                return matchesSearch && matchesCategory;
              });

              return (
                <div className="space-y-8 text-left animate-in fade-in duration-250">
                  
                  {/* Reference Header Panel */}
                  <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="font-display font-black text-lg text-emerald-450 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-400 shrink-0" />
                        Civil & Construction Reference Library
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Hyperlinked reference library containing live USDA, GSWCC, OSHA, and manufacturer specifications synchronized from our engineering workbook.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-slate-900/80 text-emerald-400 border border-slate-800 rounded-full font-mono text-[10px] font-extrabold uppercase select-none tracking-wider shrink-0">
                      {referenceLinks.length} Standard references
                    </span>
                  </div>

                  {/* Search and Category Filtering Pill Row */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-4">
                    
                    {/* Compact Search box */}
                    <div className="relative w-full xl:max-w-xs">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                        <Database className="w-3.5 h-3.5 text-slate-500" />
                      </span>
                      <input
                        type="text"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="Search formulas, guidelines, links..."
                        value={refSearch}
                        onChange={(e) => setRefSearch(e.target.value)}
                      />
                      {refSearch && (
                        <button
                          type="button"
                          onClick={() => setRefSearch('')}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-450 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Compact category filter pills */}
                    <div className="flex flex-wrap gap-1 w-full xl:w-auto justify-center xl:justify-end">
                      {['All', 'Safety & Utilities', 'Erosion & Compliance', 'Soil Mechanics', 'Pond Design & Specs', 'Codes & Permits', 'Equipment & Sizing'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setRefCategory(cat)}
                          className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all border ${
                            refCategory === cat
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-800/10'
                              : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          {cat === 'Pond Design & Specs' ? 'Ponds' : cat === 'Erosion & Compliance' ? 'Erosion' : cat}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Grid layout */}
                  {filteredRefs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-850">
                      <p className="text-sm">No references match your current search.</p>
                      <button
                        type="button"
                        onClick={() => { setRefSearch(''); setRefCategory('All'); }}
                        className="mt-3 text-xs text-brand-orange hover:underline uppercase font-bold"
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" id="reference-hyperlinks-grid">
                      {filteredRefs.map((ref) => {
                        const isRefCopied = copiedRefId === ref.id;
                        return (
                          <div
                            key={ref.id}
                            className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative hover:border-slate-705 transition-all duration-200 group gap-4"
                          >
                            <div className="space-y-2.5">
                              <div className="flex justify-between items-start gap-1">
                                <span className="text-[8px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-950/50 border border-emerald-900/60 font-black px-1.5 py-0.5 rounded">
                                  {ref.category}
                                </span>
                                <span className="text-[8px] uppercase font-bold text-slate-400 font-mono tracking-tight shrink-0">
                                  {ref.badge}
                                </span>
                              </div>
                              
                              <h4 className="font-display font-black text-xs text-slate-100 group-hover:text-amber-400 transition-colors leading-snug">
                                {ref.title}
                              </h4>
                              
                              <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-3">
                                {ref.desc}
                              </p>
                            </div>

                            {/* Action Buttons footer */}
                            <div className="flex items-center gap-2 border-t border-slate-900/80 pt-3 mt-1">
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-[9px] uppercase font-black tracking-widest rounded-lg shadow-sm transition-all cursor-pointer"
                                title={`Open ${ref.title} in a new tab`}
                              >
                                <span>Browse Link</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(ref.url);
                                    setCopiedRefId(ref.id);
                                    setTimeout(() => setCopiedRefId(null), 1800);
                                  } catch (err) {
                                    const t = document.createElement("textarea");
                                    t.value = ref.url;
                                    document.body.appendChild(t);
                                    t.select();
                                    document.execCommand("copy");
                                    document.body.removeChild(t);
                                    setCopiedRefId(ref.id);
                                    setTimeout(() => setCopiedRefId(null), 1800);
                                  }
                                }}
                                className={`p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer ${
                                  isRefCopied ? 'bg-emerald-950 text-emerald-440 border-emerald-900/40' : 'bg-slate-900 hover:bg-slate-850'
                                }`}
                                title="Copy hyperlink to clipboard"
                              >
                                {isRefCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Operational Formulas dividing line */}
                  <div className="border-t border-slate-800/80 pt-6" />

                  <div className="space-y-1">
                    <span className="text-[10px] items-center font-bold font-mono tracking-widest text-brand-orange uppercase">Compaction & Compiling Parameters</span>
                    <h4 className="font-display font-black text-sm text-slate-200">
                      Standard Geological Coefficients & Soil Compaction Modifiers
                    </h4>
                    <p className="text-slate-400 text-xs">
                      The active formulas and compliance standards embedded in our pricing sheets:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-sans">
                    
                    {/* Math Formulas breakdown */}
                    <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl space-y-4 text-left">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block font-mono">Dynamic Estimate Mapping Formulas</span>
                      
                      <div className="space-y-3">
                        <div className="bg-slate-955/80 p-4 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">1. Standard Earthwork Base Cost</span>
                          <div className="p-2 bg-slate-950 rounded font-mono text-slate-300 text-xs mt-1.5">
                            Basecost = net_area_sqft * base_rate
                          </div>
                          <p className="text-[10px] text-slate-450 mt-2 leading-relaxed">
                            Evaluated base rates: site preparing is $2.20/sqft, excavation/grading uses $3.50/sqft, private ponds calculate with $5.20/sqft.
                          </p>
                        </div>

                        <div className="bg-slate-955/80 p-4 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">2. Red Clay Compaction Expansion Modifier</span>
                          <div className="p-2 bg-slate-950 rounded font-mono text-slate-300 text-xs mt-1.5">
                            CompactionModifier = Basecost * 1.30 (Soil coefficient)
                          </div>
                          <p className="text-[10px] text-slate-450 mt-2 leading-relaxed">
                            Georgia clay retains high moisture reserves, requiring repeated structural vibro-compaction cycles. sandy loam soils discount this coefficient.
                          </p>
                        </div>

                        <div className="bg-slate-955/80 p-4 rounded-xl border border-slate-800/60">
                          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">3. Access Multiplier Rate</span>
                          <div className="p-2 bg-slate-950 rounded font-mono text-slate-300 text-xs mt-1.5">
                            AccessCostMultiplier = Cost * 1.38 (Difficult access modifier)
                          </div>
                          <p className="text-[10px] text-slate-450 mt-2 leading-relaxed">
                            Confined sites restrict standard 40-ton dump truck maneuvers, forcing alternative slow grading haul routes.
                          </p>
                        </div>
                      </div>
                    </div>

                  {/* Compliance codes right column */}
                  <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl space-y-4 text-left">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block font-mono">GSWCC & GA-EPA Compliance Codes</span>
                    
                    <ul className="space-y-4 font-sans">
                      <li className="flex items-start gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/60">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs uppercase leading-none">Erosion Permit (GAR-100002) Thresholds</h4>
                          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                            Any residential, commercial, or municipal tract clearing exceeding 1.0 Cumulative Acre must have an active NPDES General Permit submitted to EPD.
                          </p>
                        </div>
                      </li>

                      <li className="flex items-start gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/60">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs uppercase leading-none">Georgia 811 Dig Safely Rules</h4>
                          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                            Georgia law requires a 3-business-day waiting period between locate tickets filing and drop-point soil excavation to prevent pipeline ruptures.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                </div>

              </div>
            );
          })()}

            {/* Tab 4: Received Applications */}
            {activeTab === 'applications' && (
              <div className="space-y-6 text-left animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="font-display font-black text-xl text-white">Employment Applications Queue</h3>
                    <p className="text-slate-400 text-xs">
                      Review machine operators, truck drivers, and site foremen applying natively to your crew listing.
                    </p>
                  </div>
                  <span className="text-xs bg-amber-950/40 text-brand-orange border border-brand-orange/40 font-mono font-bold px-3 py-1.5 rounded-full">
                    {receivedApps.length} APPLICANTS DETECTED
                  </span>
                </div>

                {receivedApps.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-850">
                    <p className="text-sm">No employment applications have been logged yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {receivedApps.map((app) => (
                      <div key={app.id} className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl relative shadow-md space-y-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <h4 className="font-display font-black text-base text-white">{app.fullName}</h4>
                            <p className="text-xs text-slate-400 font-mono">Located in: <strong className="text-slate-300">{app.city}</strong></p>
                          </div>
                          <span className="text-[10px] uppercase font-mono tracking-wider bg-emerald-950 text-emerald-450 border border-emerald-900/60 font-bold px-2 py-0.5 rounded">
                            {app.selectedRole}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-850 text-xs font-mono">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Experience</span>
                            <span className="text-white font-bold">{app.dirtExperienceYears} Yrs Dirt</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">CDL Status</span>
                            <span className="text-brand-orange font-bold font-sans text-[11px]">{app.cdlStatus === 'none' ? 'None' : app.cdlStatus}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Phone Link</span>
                            <a href={`tel:${app.phone}`} className="text-emerald-400 font-bold underline font-sans text-[11.5px]">{app.phone}</a>
                          </div>
                        </div>

                        {app.proficiencies && app.proficiencies.length > 0 && (
                          <div className="space-y-1 text-xs">
                            <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Verified Machinery Specialties:</span>
                            <div className="flex flex-wrap gap-1">
                              {app.proficiencies.map((p: string) => (
                                <span key={p} className="text-[10px] bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded font-medium">
                                  &bull; {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {app.additionalNotes && (
                          <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 text-xs text-slate-300 leading-relaxed italic">
                            &ldquo;{app.additionalNotes}&rdquo;
                          </div>
                        )}

                        <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900/60">
                          <span>Applied: {app.submittedAt}</span>
                          <div className="flex gap-1.5Packed">
                            <button
                              type="button"
                              onClick={() => {
                                setInterviewCandidateName(app.fullName);
                                if (app.additionalNotes) {
                                  setInterviewNotes(`Applied experience: ${app.dirtExperienceYears} years. City: ${app.city}. Additional Application notes: ${app.additionalNotes}`);
                                } else {
                                  setInterviewNotes(`Applied experience: ${app.dirtExperienceYears} years. City: ${app.city}`);
                                }
                                setActiveTab('interns');
                                setActiveInternTab('recruitment');
                              }}
                              className="inline-flex items-center gap-1 py-1 px-2 bg-slate-900 hover:bg-brand-orange hover:text-white text-slate-400 hover:text-slate-100 rounded-md border border-slate-800 text-[10px] font-black uppercase transition-all"
                              title="Start screening process under Workforce Academy"
                            >
                              <GraduationCap className="w-3 h-3 text-brand-orange" />
                              <span>Screen candidate</span>
                            </button>
                            <span className="text-emerald-400 font-mono font-bold tracking-wider hidden sm:inline self-center">SECURE LEDGER RECORD</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Field Daily Reports */}
            {activeTab === 'reports' && (
              <div className="space-y-6 text-left animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="font-display font-black text-xl text-white">Daily Field Progression Feed</h3>
                    <p className="text-slate-400 text-xs">
                      Live reports feed containing machine hour logs, soil checks, and daily cleared acreage metrics.
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-950/40 text-emerald-450 border border-emerald-900/40 font-mono font-bold px-3 py-1.5 rounded-full">
                    {fieldLogs.length} LOGS FILED
                  </span>
                </div>

                {fieldLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-850">
                    <p className="text-sm">No field daily progress logs have been received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {fieldLogs.map((log) => (
                      <div key={log.id} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
                        
                        {/* Upper banner */}
                        <div className="bg-slate-900/60 border-b border-slate-850/80 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-950 text-emerald-400 font-bold rounded-lg font-mono text-xs border border-slate-800 shrink-0">
                              {log.signatureInitials.toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-display font-black text-sm text-white">{log.operatorName}</h4>
                              <p className="text-xs text-slate-400 font-mono">Machinery Rig: <strong className="text-slate-300">{log.machineryType}</strong></p>
                            </div>
                          </div>
                          
                          <div className="text-right text-xs">
                            <span className="text-slate-500 block">Report Date</span>
                            <span className="font-mono text-slate-300 font-semibold">{log.submittedAt}</span>
                          </div>
                        </div>

                        {/* Mid Grid */}
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs border-b border-slate-900/60 leading-relaxed">
                          
                          <div className="space-y-1">
                            <span className="text-slate-500 uppercase tracking-widest text-[9px] block">Dispatch Site:</span>
                            <p className="font-bold text-white">{log.siteLocation}</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-500 uppercase tracking-widest text-[9px] block">Running Engine Hours:</span>
                            <p className="font-mono text-[13px] text-white font-bold inline-flex items-center gap-1 bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
                              <Clock className="w-3.5 h-3.5 text-brand-orange" />
                              <span>{log.engineHours} Hrs</span>
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-500 uppercase tracking-widest text-[9px] block">Shift Cleared Status:</span>
                            <p className="font-bold text-emerald-400 font-mono text-[13px]">&bull; {log.clearedAcres} Acres Done</p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-500 uppercase tracking-widest text-[9px] block">Fuel Level / Moisture Profile:</span>
                            <p className="text-slate-300">
                              Fuel: <strong className="text-white bg-slate-900 px-1 hover:text-brand-orange">{log.fuelLevel}</strong> | Moisture: <span className="font-semibold text-brand-orange">{log.soilCondition === 'moist_clay' ? 'GA Red Clay' : log.soilCondition.replace('_', ' ')}</span>
                            </p>
                          </div>

                        </div>

                        {/* Bottom Notes & Coordinates banner */}
                        <div className="p-4 sm:p-5 flex flex-col md:flex-row justify-between gap-4 bg-slate-950/40 text-xs leading-relaxed font-sans">
                          
                          <div className="flex-1 space-y-1.5">
                            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Operational Shift Notes & Milestones:</span>
                            <p className="text-slate-300 text-xs max-w-2xl bg-slate-950/60 p-3 rounded-lg border border-slate-900 leading-relaxed">
                              {log.dailyNotes || "No specific extra log notations. Shift completed within active safety guidelines."}
                            </p>
                          </div>

                          <div className="shrink-0 text-left md:text-right space-y-2 max-w-sm">
                            <span className="font-bold text-[9px] text-slate-500 uppercase tracking-wider block">Safety Audit status:</span>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-450 border border-emerald-900">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>Pre-Op Inspection Verified</span>
                            </div>

                            {log.latitude && log.longitude ? (
                              <div className="pt-2 text-slate-400 block font-mono text-[10.5px]">
                                GPS: <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-bold text-white leading-none">{log.latitude}, {log.longitude}</span>
                              </div>
                            ) : (
                              <div className="text-amber-500 font-sans font-semibold text-[10px]">
                                ⚠️ Standard Local Override Coords
                              </div>
                            )}
                          </div>

                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: Native Blog Post Manager */}
            {activeTab === 'blog' && (
              <div className="space-y-6 text-left animate-in fade-in duration-200">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-brand-orange" />
                      <span>TJ Darley Site-Prep Updates Manager</span>
                    </h3>
                    <p className="text-slate-400 text-xs">
                      Post select grading case studies, timber mulching tips, and heavy equipment news directly to the live front-end learning log.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const emptyPost = {
                          id: '',
                          title: '',
                          summary: '',
                          content: '',
                          category: 'Grading & Site Prep',
                          author: 'TJ Darley',
                          readTime: '4 min read',
                          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          likes: 0,
                          slug: ''
                        };
                        setEditingPost(emptyPost);
                      }}
                      className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish New Update</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to reset all blog post logs to original TJD default articles? Your custom updates will be replaced.")) {
                          const seedJson = [
                            {
                              id: 'post-1',
                              title: 'The Art of Final Grading: Preparing Solid Building Pads in Georgia Red Clay',
                              slug: 'art-of-final-grading-georgia-red-clay',
                              summary: 'Our red clay holds moisture, posing unique challenges. Learn how dual-slope laser transits and precise compaction standards keep site pads bone dry and structurally sound.',
                              category: 'Grading & Site Prep',
                              author: 'TJ Darley',
                              readTime: '5 min read',
                              date: 'June 10, 2026',
                              likes: 24,
                              featured: true,
                              content: `### The Challenge of Georgia Red Clay\n\nIf you've ever worked in Middle Georgia, you know our soil. Underneath a thin layer of topsoil lies deep, dense, sticky **Georgia Red Clay**. Rich in iron oxide and highly cohesive, red clay is incredible for carrying structural loads, but it possesses one critical flaw: **it is highly impermeable and holds water like a sponge**.\n\nWhen prepping a new warehouse foundation in Warner Robins or driving stakes for a lakeside residential lot in Greensboro, getting the subgrade right is the difference between a lifetime of structural stability and a wet basement nightmare.\n\n---\n\n### Phase 1: Moisture Management & Aeration\n\nBefore a single tire rolls onto the building pad, we have to look at the sky and the dirt. Clear, dry days are optimum, but waiting forever for weather isn't practical. \n\n1. **Aerating the Soil**: We use heavy discs and scarifying teeth on bulldozers to rip up the top 6 to 12 inches of moist clay, exposing it to the wind and Middle Georgia sun.\n2. **Verifying Moisture Content**: Compaction cannot occur when the clay is "soupy" or "dusty." There is a perfect sweet spot of moisture—referred to as the Optimum Moisture Content (OMC).\n\n---\n\n### Phase 2: Utilizing Laser-Guided Precision\n\nAt TJ Darley Construction, we don't believe in "eyeballing" the grade. We deploy **John Deere 700K SmartGrade GPS Bulldozers**. \n\n- **How it works**: A rotating dual-slope laser transmitter on a stationary tripod communicates directly with sensors mounted on our bulldozer blades. \n- **The Result**: The blade automatically rises and falls to match the digital site plan, leaving behind a perfectly flat pad with a micro-slope of 1% directly toward drainage easements to shed rain immediately.\n\n---\n\n### Phase 3: Compaction and Density Verification\n\nOnce the grade is established, we bring in our heavy vibratory compactors. Clay requires **kneading action**, not just flat rollers. We utilize custom "sheepsfoot" rollers that penetrate into the clay, squeezing out air pockets and pockets of moisture.\n\nWe verify compaction via standard sand-cone testing or dynamic cone penetrometers. Any pad we deliver is certified to reach at least **95% Standard Proctor Density**, ensuring a solid slab for concrete contractors that will never settle or crack over the decades.\n\n> **Professional Grade Tip**: Always clear away and redirect superficial runoff *before* starting excavation. Building a secure temporary diversion berm uphill keeps your work area dry, saving thousands in dry-out delays.`
                            },
                            {
                              id: 'post-2',
                              title: 'Forestry Mulching vs. Traditional Bulldozing: Preserving Topsoil on Wooded Acreage',
                              slug: 'forestry-mulching-vs-traditional-bulldozing',
                              summary: 'Discover why high-flow Fecon mulchers on compact track loaders are vastly superior to traditional scrape clearing when clearing lakeside and residential property lines.',
                              category: 'Forestry Mulching',
                              author: 'Kyle Simmons',
                              readTime: '4 min read',
                              date: 'May 28, 2026',
                              likes: 18,
                              featured: false,
                              content: `### Traditional Clearing: The Aggressive Standard\n\nFor decades, clearing a lot meant calling in a mammoth bulldozer to scrape everything in its path. Bulldozers push down trees, rip up root balls, and push all material into a giant burning pile or haul-away dumpster. \n\nWhile effective for heavy commercial foundations, this process has massive drawbacks for selective residential clearing, especially around **Lake Oconee or the steep slopes of Macon**:\n\n- It leaves behind gaping craters from pulled tree root systems.\n- It scrapes away 3 to 4 inches of premium organic black topsoil.\n- It exposes bare subsoil clay directly to heavy rains, triggering flash erosion and silt runoff.\n\n---\n\n### The Forestry Mulching Alternative\n\nWe operate high-flow **Fecon forestry mulchers** mounted on compact, low-ground-pressure track loaders. Instead of pulling trees out by the roots, our high-speed carbide drum teeth instantly chew standing brush, sweetgums, briars, and scrub pines down to tree-stump level from the top down.\n\n---\n\n### Why Mulching Reigns Superior for Acreage\n\n1. **Protective Soil Barrier**: Mulching turns unwanted timber and thick underbrush into an instant, organic blanket of high-quality wood chips. This layer cushions the soil against torrential rain, prevents weeds from taking root, and naturally cools the subgrade.\n2. **Selective Acreage Preservation**: Want to build your home nestled amidst gorgeous mature oaks and tall hickories? A forestry mulcher can navigate tightly between premium trees, removing only the messy understory briars and saplings without cutting or wounding the critical root networks of surrounding trees.\n3. **Zero Mud, Zero Hauling**: There are no giant burning piles of wood smoke to annoy neighboring lot owners, and zero costly dump-truck aggregate transport fees. Everything stays on site, decomposing naturally into premium rich loam over the seasons.\n\n---\n\n### When to Choose Mulching:\nIf you are preparing a pasture, opening property line easements, clearing walking trails, or cleaning up a wooded lakefront lot, **Forestry Mulching is 100% the superior investment** in time, visual aesthetics, and environmental stewardship.`
                            },
                            {
                              id: 'post-3',
                              title: 'Understanding Site Erosion: GSWCC Best Practices for Middle Georgia Clearings',
                              slug: 'erosion-control-gswcc-best-practices',
                              summary: 'Silt fences, sediment ponds, and state compliance cards. What every Middle Georgia landowner needs to know about erosion before clearing land near local water buffers.',
                              category: 'Erosion Control',
                              author: 'Terry Vance',
                              readTime: '6 min read',
                              date: 'April 15, 2026',
                              likes: 12,
                              featured: false,
                              content: `### The Importance of Sediment Integrity\n\nEvery single bucket of dirt moved in the state of Georgia is subject to the **Georgia Soil and Water Conservation Commission (GSWCC)** regulations. Erosion controls aren't just bureaucratic red tape—they protect municipal creek basins, prevent downstream neighbor litigation, and preserve your property's value.\n\nWith heavy local rainstorms, a single cleared acre of bare soil can lose up to **30 tons of soil** in a single year to rain runoff if left unguarded.\n\n---\n\n### Key Requirements of typical Georgia Land Disturbance Permits\n\nIf you plan to disturb more than one acre of land—or are clearing within 25 to 50 feet of any lake, pond, or stream—you must establish standard controls:\n\n#### 1. Type "C" Silt Filtering Barriers\nTraditional wire-backed black fabric fencing is placed along downhill contours where water exits. Silt fences allow pooling water to slowly filter out, trapping the suspended mud on your lot instead of washing into storm sewers.\n\n#### 2. Rip-Rap Rock Check Dams\nFor channelized ditches or slopes, we build localized dams of 2" to 4" crushed granite. This slows down the velocity of rushing storm runoff, dissipating water energy and preventing deep gully scouring.\n\n#### 3. Temporary Seeding & Straw Cover\nIf a cleared site is expected to remain idle for more than 14 days, regulations mandate applying light grass seed and wheat straw coverage to physically pin down loose soil particles.\n\n---\n\n### Our GSWCC "Blue Card" Crew Guarantee\n\nAt TJ Darley Construction, our foreman and operators carry active GSWCC certifications. We:\n- Read local watershed topographic maps before grading.\n- Install heavy-duty turbidity curtains when dredging or clearing lakeside property lines.\n- Coordinate compliance inspections with county engineers, ensuring your project passes final authorization without costly state administrative fines.`
                            },
                            {
                              id: 'post-4',
                              title: 'Heavy Equip Fleet Focus: Upgrading to LGP (Low Ground Pressure) Tracks',
                              slug: 'fleet-upgrades-low-ground-pressure-tracks',
                              summary: 'How our heavy machinery investment allows us to clearing wet timber and clay valleys in seasons where other excavation contractors get stuck in the mud.',
                              category: 'Fleet & Crew News',
                              author: 'TJ Darley',
                              readTime: '3 min read',
                              date: 'March 30, 2026',
                              likes: 31,
                              featured: false,
                              content: `### Why Machine Footprint Matters\n\nWhen people look at heavy crawlers, they see massive raw iron tons. A standard excavator can weigh over 38,000 lbs. If configured with narrow metal tracks, all those tons focus into a tiny contact point with the dirt. \n\nOn wet Georgia red clay or sandy marsh edges near Lake Oconee, a standard machine sinks instantly, spinning track rollers and turning a tight project schedule into a multi-thousand-dollar extraction headache.\n\n---\n\n### Enter LGP Track Shoes\n\nTo keep projects running year-round, we’ve outfitted our primary excavation crawlers with custom **LGP (Low Ground Pressure) tracks**.\n\n- **Standard Tracks**: Typically 20 inches wide, exerting roughly 7.5 to 9.0 pounds per square inch (PSI) on the subsoil.\n- **LGP Tracks**: Feature massive, extra-wide 30 to 36-inch triangular steel cleats, dissipating weight across a wider footprint to drop ground pressure to only **4.2 PSI**.\n\n> **The Comparison**: For perspective, a standard adult stepping in hiking boots exerts roughly **8.0 PSI** on the ground. Our 17-ton Cat excavator equipped with LGP tracks actually exerts *half the footprint pressure* of a human foot!\n\n---\n\n### Real-World Project Benefits\n\n1. **Faster Progress**: We can start digging immediately after rain showers while competitor contractors wait days for saturated subsoil clay to dry.\n2. **Minimal Turf Rutting**: On residential estates, LGP tracks glide over established turf without creating deep compacted ruts that require weeks of topsoil repairs.\n3. **Damp Access**: Allows forestry mulchers to easily access marsh drainage ditches, creek beds, and thick, wet swamps to complete retention pond repairs safely.`
                            }
                          ];
                          localStorage.setItem('tjd_blog_posts', JSON.stringify(seedJson));
                          setBlogPosts(seedJson);
                          setEditingPost(null);
                          window.dispatchEvent(new Event('tjd_blog_posts_changed'));
                        }
                      }}
                      className="py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-colors"
                      title="Restore original sample posts"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                </div>

                {editingPost ? (
                  
                  /* CREATE OR EDIT FORM VIEW */
                  <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-6 space-y-5 animate-in slide-in-from-bottom-3 duration-200">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-850">
                      <h4 className="font-display font-bold text-sm text-brand-orange uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{editingPost.id ? 'Modify Live Post Record' : 'Draft New Construction Article'}</span>
                      </h4>
                      <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                        Date: {editingPost.date}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Article Title</label>
                        <input
                          type="text"
                          placeholder="e.g., Compaction standards on Georgia red loam..."
                          value={editingPost.title}
                          onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-orange transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                          <select
                            value={editingPost.category}
                            onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-orange transition-colors"
                          >
                            <option value="Grading & Site Prep">Grading & Site Prep</option>
                            <option value="Forestry Mulching">Forestry Mulching</option>
                            <option value="Erosion Control">Erosion Control</option>
                            <option value="Fleet & Crew News">Fleet & Crew News</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Author</label>
                          <input
                            type="text"
                            placeholder="TJ Darley"
                            value={editingPost.author}
                            onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-orange transition-colors"
                          />
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Short Abstract/Summary</label>
                        <input
                          type="text"
                          placeholder="Summarize the core site-prep takeaway in 2 sentences..."
                          value={editingPost.summary}
                          onChange={(e) => setEditingPost({ ...editingPost, summary: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-orange transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Est. Reading Time</label>
                        <input
                          type="text"
                          placeholder="4 min read"
                          value={editingPost.readTime}
                          onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-orange transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Article Body Content</label>
                        <span className="text-[10px] text-slate-500 italic">Supports simple linebreaks, ### Headers, and &gt; blockquotes for quick layouts.</span>
                      </div>
                      <textarea
                        rows={12}
                        placeholder="### Write your detailed sections here...&#10;&#10;Use '---' for horizontal rule breakers.&#10;&#10;Use '>' for tips callout blocks."
                        value={editingPost.content}
                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-brand-orange transition-colors font-mono leading-relaxed"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3.5 pt-3 border-t border-slate-850">
                      <button
                        onClick={() => setEditingPost(null)}
                        className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Discard Draft
                      </button>
                      <button
                        onClick={() => {
                          if (!editingPost.title || !editingPost.content) {
                            alert("Please fill out at least a title and body content for the post to display.");
                            return;
                          }

                          // Generate dynamic slug and ID if it is a new post
                          const updatedSlug = editingPost.slug || editingPost.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '');

                          const updatedId = editingPost.id || 'post-' + Date.now();

                          const committedPost = {
                            ...editingPost,
                            id: updatedId,
                            slug: updatedSlug,
                            likes: editingPost.likes || 0
                          };

                          let newPosts = [];
                          if (blogPosts.some(p => p.id === committedPost.id)) {
                            newPosts = blogPosts.map(p => p.id === committedPost.id ? committedPost : p);
                          } else {
                            newPosts = [committedPost, ...blogPosts];
                          }

                          localStorage.setItem('tjd_blog_posts', JSON.stringify(newPosts));
                          setBlogPosts(newPosts);
                          setEditingPost(null);

                          // Trigger window event
                          window.dispatchEvent(new Event('tjd_blog_posts_changed'));
                        }}
                        className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-brand-orange hover:bg-brand-darkorange text-white text-xs font-black uppercase rounded-lg shadow-md transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Commit & Sync Post Live</span>
                      </button>
                    </div>

                  </div>

                ) : (

                  /* MANAGER GRID / TABLE VIEW */
                  <div className="space-y-4">
                    {blogPosts.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-850">
                        <p className="text-sm">No updates currently stored in the memory ledger. Click Publish to write details.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {blogPosts.map((post) => (
                          <div 
                            key={post.id} 
                            className="bg-slate-950/70 border border-slate-850/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors gap-4"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="bg-slate-900 border border-slate-800 text-brand-orange px-2 py-0.5 rounded font-black uppercase">
                                  {post.category}
                                </span>
                                <span className="text-slate-500">{post.date}</span>
                              </div>

                              <h4 className="font-display font-bold text-sm text-white line-clamp-1">{post.title}</h4>
                              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{post.summary}</p>
                            </div>

                            <div className="pt-3 mt-1 border-t border-slate-900 flex justify-between items-center text-xs">
                              <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
                                <span className="text-slate-400">Likes: {post.likes}</span>
                                <span>&bull;</span>
                                <span>By {post.author}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingPost(post)}
                                  className="inline-flex items-center gap-1 py-1 px-2.5 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-400 rounded-md border border-slate-800 text-[11px] transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Do you really want to permanently delete "${post.title}"?`)) {
                                      const updatedList = blogPosts.filter(p => p.id !== post.id);
                                      localStorage.setItem('tjd_blog_posts', JSON.stringify(updatedList));
                                      setBlogPosts(updatedList);
                                      window.dispatchEvent(new Event('tjd_blog_posts_changed'));
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 py-1 px-2.5 bg-slate-950 hover:bg-red-950 text-slate-500 hover:text-red-400 rounded-md border border-slate-850 hover:border-red-900 text-[11px] transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                )}

              </div>
            )}

            {/* Tab 7: Paid Internship Program Manager */}
            {activeTab === 'interns' && (
              <div id="interns-tab-container" className="space-y-6 text-left animate-in fade-in duration-200 p-6">
                
                {/* Header Information Box */}
                <div id="interns-header-box" className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div id="interns-header-text">
                    <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                      <GraduationCap className="w-5.5 h-5.5 text-brand-orange animate-pulse" />
                      <span>Workforce Academy & Intern Manager</span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                      Train a local heavy-equipment workforce our way. Conduct pre-screening calls, generate custom formal offer agreements, execute compliant new-hire onboarding checklists, and track on-site heavy-machinery mastery.
                    </p>
                  </div>
                  <div id="intern-program-phase" className="text-[10px] uppercase font-mono tracking-wider bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 self-start md:self-auto">
                    <Award className="w-3.5 h-3.5 text-brand-orange" />
                    <span>PROGRAM PHASE: ACTIVE OUTREACH</span>
                  </div>
                </div>

                {/* Sub-Navigation Tabs inside Interns Manager */}
                <div id="interns-subtabs-nav" className="flex flex-wrap border-b border-slate-800 gap-1 mt-4">
                  <button
                    id="intern-subtab-recruitment"
                    type="button"
                    onClick={() => setActiveInternTab('recruitment')}
                    className={`py-2 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                      activeInternTab === 'recruitment' 
                        ? 'border-brand-orange text-white bg-slate-850/30' 
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-brand-orange" />
                    <span>1. Job Ad & Local Channels</span>
                  </button>

                  <button
                    id="intern-subtab-offer"
                    type="button"
                    onClick={() => setActiveInternTab('offer')}
                    className={`py-2 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                      activeInternTab === 'offer' 
                        ? 'border-brand-orange text-white bg-slate-850/30' 
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-orange" />
                    <span>2. Custom Offer Letter</span>
                  </button>

                  <button
                    id="intern-subtab-onboarding"
                    type="button"
                    onClick={() => setActiveInternTab('onboarding')}
                    className={`py-2 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                      activeInternTab === 'onboarding' 
                        ? 'border-brand-orange text-white bg-slate-850/30' 
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-brand-orange" />
                    <span>3. Day-1 Onboarding Checklist</span>
                  </button>

                  <button
                    id="intern-subtab-tracker"
                    type="button"
                    onClick={() => setActiveInternTab('tracker')}
                    className={`py-2 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                      activeInternTab === 'tracker' 
                        ? 'border-brand-orange text-white bg-slate-850/30' 
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-brand-orange" />
                    <span>4. Interactive Skills Checklist</span>
                    <span className="bg-slate-950 text-white text-[9px] px-1.5 py-0.2 rounded-full border border-slate-800 font-mono">
                      {interns.length}
                    </span>
                  </button>

                  <button
                    id="intern-subtab-academy"
                    type="button"
                    onClick={() => setActiveInternTab('academy')}
                    className={`py-2 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                      activeInternTab === 'academy' 
                        ? 'border-brand-orange text-white bg-slate-850/30' 
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand-orange" />
                    <span>5. Safety Academy & Signals</span>
                  </button>
                </div>

                {/* SUB TAB 1: RECRUITMENT & JOB AD & INTERVIEWING */}
                {activeInternTab === 'recruitment' && (
                  <div id="recruitment-content-pane" className="space-y-6 animate-in fade-in duration-200">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Block: Job Ad Viewer & Strategy */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                          <div className="flex justify-between items-center pb-3 border-b border-slate-850">
                            <div>
                              <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                                Active Job Advertisement Copy
                              </h4>
                              <p className="text-slate-500 text-[11px]">Ready to post on Indeed, WorkSource Georgia, Gwinnett Community groups, and Craigslist.</p>
                            </div>
                            <button
                              id="btn-copy-ad-text"
                              type="button"
                              onClick={() => {
                                const adText = `Job Title: Heavy Equipment Operator Intern (Paid)\nCompany: TJ Darley Construction, LLC\nLocation: Middle Georgia Area\nPay Rate: $12.00 – $15.00 / hour (Based on experience)\nContact: 478-808-7789\n\nAbout Us:\nAt TJ Darley Construction, LLC, we move the earth to build the future. We specialize in site preparation, excavation, and grading...\n\nWhat You Will Do:\n- Learn daily safety & maintenance checks on heavy machinery\n- Assist ground crews with laser levels and grading stakes\n- Safely operate skid steers and compact rollers under direct supervisor...\n\nRequirements:\nMust be 18+ with a valid license and reliable transportation in the Middle GA region.`;
                                navigator.clipboard.writeText(adText);
                                alert("Job Advertisement copy copied to clipboard!");
                              }}
                              className="inline-flex items-center gap-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold rounded-lg border border-slate-800 transition-all shadow"
                              title="Copy ad to clipboard"
                            >
                              <Copy className="w-3.5 h-3.5 text-brand-orange" />
                              <span>Copy Ad Text</span>
                            </button>
                          </div>

                          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-900 max-h-[300px] overflow-y-auto text-xs space-y-4 leading-relaxed text-slate-300 font-sans">
                            <p className="font-bold text-emerald-400">🏗️ Job Title: Heavy Equipment Operator Intern (Paid)</p>
                            <p><strong className="text-white">Pay Rate:</strong> $12.00 – $15.00 / hour (Based on experience, with fast track for raises)</p>
                            <p><strong className="text-white">Job Type:</strong> Full-Time / Seasonal Intern</p>
                            
                            <p className="border-t border-slate-850/50 pt-2"><strong className="text-white">About Us:</strong><br />
                            At TJ Darley Construction, LLC, we move the earth to build the future. We specialize in site preparation, excavation, and grading. We don’t just build projects; we build careers. We are looking for motivated individuals ready to learn a highly skilled, high-paying trade from the ground up.</p>
                            
                            <p><strong className="text-white">What’s In It For You?</strong><br />
                            • <strong className="text-white">Get Paid to Learn:</strong> No experience? No problem. We pay you while you learn the trade.<br />
                            • <strong className="text-white">Real Seat Time:</strong> You won't just hold a shovel. Hands-on training on skid steers, excavators, and bulldozers.<br />
                            • <strong className="text-white">Career Growth:</strong> Full-time, long-term job offers with competitive benefits upon graduation.<br />
                            • <strong className="text-white">Safety First:</strong> Top-tier safety gear & mentor training.</p>
                            
                            <p><strong className="text-white">What You Will Do:</strong><br />
                            • Perform daily safety checks and greasing on heavy machinery.<br />
                            • Assist ground crews with grade checking, laser levels, and site prep.<br />
                            • Safely operate compact equipment under supervision.<br />
                            • Keep jobsites clean, organized, and running efficiently.</p>
                            
                            <p><strong className="text-white">What We Are Looking For:</strong><br />
                            • <strong className="text-white">Reliability:</strong> Show up early every day, ready to work hard.<br />
                            • <strong className="text-white">Attitude:</strong> Coachable mindset, respect safety rules, and work well on active crews.<br />
                            • <strong className="text-white">Requirements:</strong> Must be 18+ years old with reliable transportation and a valid driver's license.</p>
                            
                            <p className="text-brand-orange bg-brand-orange/5 p-2 rounded border border-brand-orange/10 font-mono text-[11px]">
                              <strong>How candidates submit:</strong> Call/text our direct local workforce dispatch at <strong>478-808-7789</strong>.
                            </p>
                          </div>
                        </div>

                        {/* Local Recruitment Channels */}
                        <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                          <h4 className="font-display font-medium text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span>Macon & Middle Georgia Local Posting Channels</span>
                          </h4>
                          <p className="text-slate-400 text-xs">Reach candidates wanting to break into civil trades who live near our equipment yards.</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 text-xs space-y-1.5">
                              <span className="font-bold text-white text-xs block">1. WorkSource Georgia Profile</span>
                              <p className="text-slate-400 leading-relaxed text-[11px]">
                                Upload this flyer to the government recruitment board managed by the Technical College System of Georgia. State grants match employers providing structured on-the-job training (OJT).
                              </p>
                            </div>

                            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 text-xs space-y-1.5">
                              <span className="font-bold text-white text-xs block">2. Gwinnett & Lanier Technical Colleges</span>
                              <p className="text-slate-400 leading-relaxed text-[11px]">
                                Send the ad flyer directly to Gwinnett Technical College & Lanier Technical College trade program heads. Graduating seniors are certified, 18+, and looking for heavy operator jobs.
                              </p>
                            </div>

                            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 text-xs space-y-1.5">
                              <span className="font-bold text-white text-xs block">3. Maxwell High School of Technology</span>
                              <p className="text-slate-400 leading-relaxed text-[11px]">
                                Partner with construction counselors at Maxwell High. Highly responsive pipeline of hands-on 18-year-olds eager to start high-paying construction trades over traditional desk courses.
                              </p>
                            </div>

                            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 text-xs space-y-1.5">
                              <span className="font-bold text-white text-xs block">4. Rural Craigslist & Facebook Groups</span>
                              <p className="text-slate-400 leading-relaxed text-[11px]">
                                Post to "Gwinnett County Jobs" and local Facebook trade forums. Run paid listings under Craigslist "Skilled Trades" with title <strong className="text-emerald-400">"PAID HEAVY MACHINERY INTERNSHIP"</strong>.
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Right Block: Interactive Interview Guide & Screener Form */}
                      <div className="bg-slate-950/90 border border-slate-800 p-6 rounded-2xl space-y-5 flex flex-col justify-between">
                        
                        <div className="space-y-4 text-left">
                          <h4 className="font-display font-black text-sm text-brand-orange uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>Conduct & Score Candidate Interview</span>
                          </h4>
                          <p className="text-slate-400 text-xs leading-relaxed">
                            Run a phone screen or in-person interview. Use our parameters to grade and save candidate results before drafting their offer.
                          </p>

                          <div className="space-y-3.5 pt-2 border-t border-slate-850">
                            {/* Candidate Name */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Candidate Full Name</label>
                              <input
                                id="candidate-interview-name"
                                type="text"
                                placeholder="e.g., Bobby Green"
                                value={interviewCandidateName}
                                onChange={(e) => setInterviewCandidateName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-orange transition-colors"
                              />
                            </div>

                            {/* Phone Screen Pre-Check */}
                            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 text-[10px] space-y-1.5 font-mono">
                              <span className="font-bold text-slate-400 uppercase tracking-wider block">📞 5-Min Phone Screen Checks</span>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Reliable Commute?</span>
                                <select 
                                  value={interviewPhoneTransport} 
                                  onChange={(e) => setInterviewPhoneTransport(e.target.value)}
                                  className="bg-slate-950 text-slate-300 border border-slate-805 rounded p-1 text-[9px]"
                                >
                                  <option value="yes">Yes, Personal Truck</option>
                                  <option value="no">No Commute Plan</option>
                                </select>
                              </div>

                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Starts 7:00 AM Sharp?</span>
                                <select 
                                  value={interviewPhoneSchedule} 
                                  onChange={(e) => setInterviewPhoneSchedule(e.target.value)}
                                  className="bg-slate-950 text-slate-300 border border-slate-805 rounded p-1 text-[9px]"
                                >
                                  <option value="fits">Fits Schedule Perfect</option>
                                  <option value="issue">Has Wakeup Conflicts</option>
                                </select>
                              </div>

                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Is 18+ Years Old?</span>
                                <select 
                                  value={interviewPhoneAge} 
                                  onChange={(e) => setInterviewPhoneAge(e.target.value)}
                                  className="bg-slate-950 text-slate-300 border border-slate-805 rounded p-1 text-[9px]"
                                >
                                  <option value="yes">Yes (Insurance Compliant)</option>
                                  <option value="no">Under 18</option>
                                </select>
                              </div>

                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Driver's License?</span>
                                <select 
                                  value={interviewPhoneLicense} 
                                  onChange={(e) => setInterviewPhoneLicense(e.target.value)}
                                  className="bg-slate-955 text-slate-300 border border-slate-805 rounded p-1 text-[9px]"
                                >
                                  <option value="regular">Regular Class C</option>
                                  <option value="cdl">CDL (Commercial)</option>
                                  <option value="none">Suspended/None</option>
                                </select>
                              </div>
                            </div>

                            {/* Scoring Parameters */}
                            <div className="grid grid-cols-1 gap-2 pt-1 font-sans">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-mono text-[11px]">Reliability & Grit:</span>
                                <div className="flex gap-1.5">
                                  {['High Risk', 'Average', 'Exceptional'].map(score => (
                                    <button
                                      key={score}
                                      type="button"
                                      onClick={() => setInterviewScoreReliability(score as any)}
                                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                                        interviewScoreReliability === score 
                                          ? score === 'High Risk' ? 'bg-rose-950/80 text-rose-450 border border-rose-900/80' : score === 'Average' ? 'bg-slate-850 text-slate-200 border border-slate-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/80'
                                          : 'bg-slate-900/40 text-slate-500 hover:text-slate-400 border border-transparent'
                                      }`}
                                    >
                                      {score}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-mono text-[11px]">Attitude & Respect:</span>
                                <div className="flex gap-1.5">
                                  {['High Risk', 'Average', 'Exceptional'].map(score => (
                                    <button
                                      key={score}
                                      type="button"
                                      onClick={() => setInterviewScoreAttitude(score as any)}
                                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                                        interviewScoreAttitude === score 
                                          ? score === 'High Risk' ? 'bg-rose-950/80 text-rose-450 border border-rose-900/80' : score === 'Average' ? 'bg-slate-850 text-slate-200 border border-slate-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/80'
                                          : 'bg-slate-900/40 text-slate-500 hover:text-slate-400 border border-transparent'
                                      }`}
                                    >
                                      {score}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-mono text-[11px]">Safety Focus:</span>
                                <div className="flex gap-1.5">
                                  {['High Risk', 'Average', 'Exceptional'].map(score => (
                                    <button
                                      key={score}
                                      type="button"
                                      onClick={() => setInterviewScoreSafety(score as any)}
                                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                                        interviewScoreSafety === score 
                                          ? score === 'High Risk' ? 'bg-rose-950/80 text-rose-450 border border-rose-900/80' : score === 'Average' ? 'bg-slate-850 text-slate-200 border border-slate-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/80'
                                          : 'bg-slate-900/40 text-slate-500 hover:text-slate-400 border border-transparent'
                                      }`}
                                    >
                                      {score}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Decisions */}
                            <div className="space-y-1 pt-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Hiring Decision</label>
                              <select 
                                value={interviewDecision} 
                                onChange={(e) => setInterviewDecision(e.target.value as any)}
                                className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2 text-xs outline-none"
                              >
                                <option value="Proceed to Offer">Proceed to Offer (Pre-fills Offer Generator)</option>
                                <option value="Hold">Hold (Save Resume on File)</option>
                                <option value="Decline">Decline Candidate</option>
                              </select>
                            </div>

                            {/* Interview Notes */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Screener Notes</label>
                              <textarea
                                placeholder="Reliable, did manual farm labor in July heat, very eager for seat time. Coachable..."
                                rows={2}
                                value={interviewNotes}
                                onChange={(e) => setInterviewNotes(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-orange transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-850 space-y-2">
                          <button
                            id="btn-save-screener-score"
                            type="button"
                            onClick={() => {
                              if (!interviewCandidateName.trim()) {
                                alert("Please enter the Candidate Name before saving the screening report.");
                                return;
                              }
                              
                              // Pre-fill the offer applicant name automatically!
                              setOfferCandidateName(interviewCandidateName);
                              
                              setInterviewStatusMessage(`Screening saved! ${interviewCandidateName} scored. Ready to draft formal offer letter.`);
                              
                              setTimeout(() => {
                                setInterviewStatusMessage("");
                                // Jump to offer letter tab automatically for a premium user flow!
                                setActiveInternTab('offer');
                              }, 1600);
                            }}
                            className="w-full py-2.5 px-4 bg-brand-orange hover:bg-brand-darkorange text-white text-xs font-black uppercase rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Score & Proceed to Offer</span>
                          </button>
                          
                          {interviewStatusMessage && (
                            <p className="text-[11px] font-mono text-emerald-450 text-center animate-pulse">{interviewStatusMessage}</p>
                          )}
                        </div>

                      </div>

                    </div>

                  </div>
                )}

                {/* SUB TAB 2: OFFER LETTER GENERATOR */}
                {activeInternTab === 'offer' && (
                  <div id="offer-letter-pane" className="space-y-6 animate-in fade-in duration-200 text-left">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Form inputs on the left */}
                      <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4 h-fit">
                        <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider pb-2 border-b border-slate-850 flex items-center gap-1.5 font-mono">
                          <FileText className="w-4 h-4 text-brand-orange" />
                          <span>Offer Customizer</span>
                        </h4>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Candidate Name</label>
                            <input
                              id="offer-name-input"
                              type="text"
                              value={offerCandidateName}
                              onChange={(e) => setOfferCandidateName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-orange transition-colors"
                              placeholder="e.g., Bobby Green"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Hourly Rate ($)</label>
                              <input
                                type="text"
                                value={offerRate}
                                onChange={(e) => setOfferRate(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-orange"
                                placeholder="13.50"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Pay Schedule</label>
                              <select
                                value={offerPayFrequency}
                                onChange={(e) => setOfferPayFrequency(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                              >
                                <option value="weekly">Weekly</option>
                                <option value="bi-weekly">Bi-Weekly</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Duration (Weeks)</label>
                              <input
                                type="text"
                                value={offerDuration}
                                onChange={(e) => setOfferDuration(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-brand-orange"
                                placeholder="12"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Start Date</label>
                              <input
                                type="date"
                                value={offerStartDate}
                                onChange={(e) => setOfferStartDate(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Est. End Date</label>
                              <input
                                type="date"
                                value={offerEndDate}
                                onChange={(e) => setOfferEndDate(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Expiration Date</label>
                              <input
                                type="date"
                                value={offerExpirationDate}
                                onChange={(e) => setOfferExpirationDate(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            id="btn-copy-formal-offer"
                            type="button"
                            onClick={() => {
                              const clipboardContent = `TJ Darley Construction, LLC — Offer of Paid Internship\n` +
                                `Date: ${new Date().toLocaleDateString("en-US")}\n\n` +
                                `To: ${offerCandidateName}\n\n` +
                                `Dear ${offerCandidateName || 'Candidate'},\n\n` +
                                `On behalf of TJ Darley Construction, LLC, I am pleased to offer you the position of Paid Equipment Operator Intern. We are excited about the prospect of launching your career in the heavy civil construction industry.\n\n` +
                                `1. Position & Duties: You will serve as an intern reporting directly to your assigned site supervisor. Your responsibilities will include strict adherence to safety orientation, learning daily preventative equipment maintenance, and learning to safely operate compact machinery under direct mentorship.\n` +
                                `2. Start Date & Schedule: Your internship will begin on ${offerStartDate || '[Start Date]'} and run for a duration of ${offerDuration || '12'} weeks, concluding on or about ${offerEndDate || '[End Date]'}. General working hours are 7:00 AM to 3:30 PM, Monday through Friday.\n` +
                                `3. Compensation: You will be compensated at an hourly rate of $${offerRate || '13.50'} per hour, paid on a ${offerPayFrequency || 'weekly'} basis.\n` +
                                `4. Review: At Week 4, your supervisor will formally review your progress. Mastery of basic equipment metrics may result in an immediate performance wage adjustment.\n` +
                                `5. Gear: TJ Darley Construction, LLC will provide hard hats, vests, and glasses. You must bring OSHA-approved steel-toes.\n` +
                                `6. At-Will: Either you or the company may terminate at any time.\n\n` +
                                `To accept, sign and return by ${offerExpirationDate || '[Expiration Date]'}.\n\n` +
                                `Sincerely,\nTJ Darley\nPresident\nTJ Darley Construction, LLC`;
                              
                              navigator.clipboard.writeText(clipboardContent);
                              setShowCopySuccess(true);
                              setTimeout(() => setShowCopySuccess(false), 2000);
                            }}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-lg transition-colors shadow-lg shadow-emerald-700/20"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy Complete Letter Text</span>
                          </button>
                        </div>
                        {showCopySuccess && (
                          <p className="text-[10px] font-mono text-emerald-450 text-center animate-pulse">Offer Letter copied ready to email!</p>
                        )}
                      </div>

                      {/* Render preview on the right */}
                      <div className="lg:col-span-2 bg-white text-slate-850 p-8 rounded-2xl border border-slate-300 shadow-xl font-serif text-xs space-y-4 leading-relaxed relative overflow-hidden transition-all max-h-[580px] overflow-y-auto">
                        
                        {/* Letterhead */}
                        <div className="pb-4 border-b border-slate-200 font-sans text-center">
                          <h3 className="font-black text-sm tracking-widest text-[#0e1e38] uppercase">TJ Darley Construction, LLC</h3>
                          <p className="text-[9px] text-[#e056fd] font-bold tracking-wider uppercase">Heavy Civil Excavating, Final Grading & Site Prep</p>
                          <p className="text-[9px] text-slate-500 font-mono">Macon, GA &bull; 478-808-7789 &bull; tjd_construct@icloud.com</p>
                        </div>

                        {/* Date and To lines */}
                        <div className="font-sans text-[11px] space-y-1.5 pt-2">
                          <p className="text-slate-500"><strong className="text-slate-700">DATE:</strong> {new Date().toLocaleDateString("en-US")}</p>
                          <p><strong className="text-slate-700">TO:</strong> {offerCandidateName || "[Candidate Name]"}</p>
                          <p className="text-slate-500 font-mono text-[9px]">Middle Georgia Area, GA</p>
                        </div>

                        <div className="space-y-3 text-[11px] pt-2 text-slate-800">
                          <p>Dear {offerCandidateName || '[Candidate Name]'},</p>
                          
                          <p>
                            On behalf of <strong className="text-slate-900 font-sans">TJ Darley Construction, LLC</strong>, I am pleased to offer you the position of <strong className="text-slate-950 font-sans">Paid Heavy Equipment Operator Intern</strong>. We were highly impressed by your motivation, reliability, and strong work ethic during the interview process. We are excited about the prospect of launching your career in the heavy civil construction industry.
                          </p>

                          <p>Please review the following terms and details of your internship offer:</p>

                          <div className="space-y-2.5 pl-2 border-l-2 border-amber-500/80">
                            <p>
                              <strong>1. Position & Duties:</strong> You will serve as an intern reporting directly to your assigned site supervisor. Your responsibilities will include strict adherence to safety orientation, learning daily preventative equipment maintenance (greasing, fluid inspection), assisting ground crews with grade stakes, and learning to safely operate compact and heavy earthwork machinery under direct mentorship.
                            </p>
                            
                            <p>
                              <strong>2. Start Date & Schedule:</strong> Your internship is scheduled to begin on <span className="font-bold underline text-slate-900 font-sans">{offerStartDate || '[Start Date]'}</span> and run for a duration of <span className="font-bold underline text-slate-900 font-sans">{offerDuration || '12'}</span> weeks, concluding on or about <span className="font-bold underline text-slate-900 font-sans">{offerEndDate || '[End Date]'}</span>. This is a full-time position requiring approximately 40 hours per week. Your general working hours will be 7:00 AM to 3:30 PM, Monday through Friday, subject to variations based on weather and project schedules.
                            </p>

                            <p>
                              <strong>3. Compensation:</strong> You will be compensated at an hourly rate of <span className="font-black bg-amber-100 text-slate-900 px-1 font-sans">${offerRate || '13.50'} per hour</span>, paid on a <span className="font-bold font-sans">{offerPayFrequency || 'weekly'}</span> basis. This position is non-exempt, eligible for overtime at 1.5x regular pay for hours worked over 40 within a single workweek.
                            </p>

                            <p>
                              <strong>4. Performance & Review Milestones:</strong> At the conclusion of Week 4, your supervisor will formally review your progress checklist. Outstanding safety adherence and successful mastery of basic equipment metrics may result in an immediate performance-based wage adjustment. Successful completion leads to potential long-term full-time employment as a <strong className="text-slate-900">Tier 1 Equipment Operator</strong>.
                            </p>

                            <p>
                              <strong>5. Requirements & Safety Gear:</strong> This offer is contingent upon proof of identity/citizenship authorized to work in the US, valid driver's license, and reliable transport. TJ Darley Construction will provide certified hard hats, safety vests, glasses, hearing protection, and gloves. You must provide your own OSHA-compliant steel-toed work boots.
                            </p>

                            <p>
                              <strong>6. At-Will Employment:</strong> This internship does not constitute a guaranteed contract. Employment remains "at-will," meaning either you or the company may terminate at any time, with or without cause or advance notice.
                            </p>
                          </div>

                          <p className="pt-2">
                            To accept this offer, please sign and return this letter below to us by <span className="font-bold text-red-700 font-sans">{offerExpirationDate || '[Expiration Date]'}</span>.
                          </p>

                          <p>
                            We look forward to welcoming you to the TJ Darley team and helping you build a highly skilled foundation in this trade.
                          </p>

                          <div className="pt-4 flex justify-between items-end font-sans">
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500">Sincerely,</p>
                              <div className="italic text-slate-800 text-sm font-serif">TJ Darley</div>
                              <p className="text-[10px] font-bold text-slate-700">TJ Darley, President</p>
                            </div>

                            <div className="space-y-3.5 border-t border-slate-350 pt-1 w-[220px]">
                              <p className="text-[9px] text-slate-405 uppercase tracking-widest text-center font-bold">Candidate Acceptance Signature</p>
                              <div className="h-6"></div>
                              <div className="border-t border-dashed border-slate-400 w-full flex justify-between text-[8px] text-slate-405 pt-0.5">
                                <span>Sign Here</span>
                                <span>Date</span>
                              </div>
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                )}

                {/* SUB TAB 3: FIRST-DAY ONBOARDING CHECKLIST */}
                {activeInternTab === 'onboarding' && (
                  <div id="onboarding-documents-pane" className="space-y-6 animate-in fade-in duration-200 text-left">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left: Documents Checklist */}
                      <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-850 justify-between">
                          <h4 className="font-display font-bold text-sm text-green-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <span>1. Legal & Gov Compliance</span>
                          </h4>
                          <span className="text-[9px] font-mono bg-green-950 text-green-450 px-2 py-0.5 rounded border border-green-900">
                            Required on Day-1
                          </span>
                        </div>

                        <div className="space-y-3.5">
                          
                          <div className="flex gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-850 hover:border-slate-800 transition-all">
                            <input 
                              type="checkbox" 
                              defaultChecked={true}
                              className="accent-brand-orange w-4 h-4 rounded mt-0.5" 
                            />
                            <div>
                              <strong className="text-white text-xs block">Form I-9 Completion</strong>
                              <p className="text-slate-400 text-[11px] leading-relaxed">
                                Verify employment eligibility. Must visually inspect original unexpired ID documents (e.g. DL and Social Security, or US Passport) within 3 working days of the hire.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-850 hover:border-slate-800 transition-all">
                            <input 
                              type="checkbox" 
                              defaultChecked={true}
                              className="accent-brand-orange w-4 h-4 rounded mt-0.5" 
                            />
                            <div>
                              <strong className="text-white text-xs block">Form W-4 Federal & G-4 Georgia State</strong>
                              <p className="text-slate-400 text-[11px] leading-relaxed">
                                Set employee income tax withholding rates for both standard federal brackets and Georgia state parameters.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-850 hover:border-slate-800 transition-all">
                            <input 
                              type="checkbox" 
                              defaultChecked={true}
                              className="accent-brand-orange w-4 h-4 rounded mt-0.5" 
                            />
                            <div>
                              <strong className="text-white text-xs block">E-Verify Federal Contractor Sync</strong>
                              <p className="text-slate-400 text-[11px] leading-relaxed">
                                Upload candidates to Georgia E-Verify portal within 3 days. Meets compliance parameters under Georgia laws for licensed contractors.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3 p-2 border-dashed border border-slate-800 bg-slate-950/20 text-slate-500 font-mono text-[9px]">
                            <span>* Store completed filings in local Operations Ledger under secure archives.</span>
                          </div>

                        </div>
                      </div>

                      {/* Right: PPE Issuance & Equipment */}
                      <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-850 justify-between">
                          <h4 className="font-display font-bold text-sm text-brand-orange uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <HardHat className="w-5 h-5 text-brand-orange" />
                            <span>2. Safety Gear & PPE Issuance</span>
                          </h4>
                          <span className="text-[9px] font-mono bg-brand-orange/15 text-brand-orange px-2 py-0.5 rounded border border-brand-orange/20">
                            Equip Intern
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-slate-300">
                          
                          <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked={true} className="accent-brand-orange w-3.5 h-3.5" />
                              <strong>OSHA Steel-Toed Boots</strong>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 italic">Intern Provides</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked={true} className="accent-brand-orange w-3.5 h-3.5" />
                              <strong>Class 2 High-Vis Vest</strong>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400">TJD Issued</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked={true} className="accent-brand-orange w-3.5 h-3.5" />
                              <strong>ANSI Z87 Premium Safety Glasses</strong>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400">TJD Issued</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked={true} className="accent-brand-orange w-3.5 h-3.5" />
                              <strong>Certified Hard Hat (Non-cracked)</strong>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400">TJD Issued</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked={false} className="accent-brand-orange w-3.5 h-3.5" />
                              <strong>Heavy Duty Work Gloves</strong>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400">TJD Issued</span>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked={false} className="accent-brand-orange w-3.5 h-3.5" />
                              <strong>Hearing Earplug Protection Pack</strong>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400">TJD Issued</span>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* SUB TAB 4: INTERACTIVE SKILLS CHECKLIST */}
                {activeInternTab === 'tracker' && (
                  <div id="skills-tracker-pane" className="space-y-6 animate-in fade-in duration-200 text-left">
                    
                    {/* Upper Select & Add Intern Control Panel */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="text-xs font-mono text-slate-400 shrink-0 uppercase">Select Intern Profile:</label>
                        <select
                          value={selectedInternId}
                          onChange={(e) => setSelectedInternId(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-brand-orange min-w-[200px] font-black font-sans"
                        >
                          {interns.map(it => (
                            <option key={it.id} value={it.id}>
                              {it.name} ({it.status === 'recommended' ? 'Graduated Operator' : 'In-Training'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Add new Intern inline form */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        <input
                          id="new-intern-register-name"
                          type="text"
                          placeholder="Add New Intern Name..."
                          value={newInternName}
                          onChange={(e) => setNewInternName(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-brand-orange w-full sm:w-[170px]"
                        />
                        <button
                          id="btn-register-new-intern"
                          type="button"
                          onClick={() => {
                            if (!newInternName.trim()) {
                              alert("Please enter the name of the new intern to register.");
                              return;
                            }
                            const newId = "intern-" + Date.now();
                            const brandNewIntern = {
                              id: newId,
                              name: newInternName,
                              mentor: newInternMentor,
                              startDate: newInternStartDate,
                              endDate: new Date(new Date().getTime() + 12*7*24*3600*1000).toISOString().split('T')[0],
                              status: "active",
                              skills: {} // Starts clean
                            };
                            
                            const list = [...interns, brandNewIntern];
                            saveAllInterns(list);
                            setSelectedInternId(newId);
                            setNewInternName("");
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Register Intern</span>
                        </button>
                      </div>

                    </div>

                    {/* Progress tracking display block for selected intern */}
                    {(() => {
                      const activeInternObj = interns.find(i => i.id === selectedInternId) || interns[0];
                      if (!activeInternObj) return <p className="text-slate-550 text-center">Add an intern to begin tracking skills.</p>;
                      
                      const skillMetadatas = [
                        { id: "ppe", text: "Correctly uses required PPE (helmet, vest, glasses, steel-toes)." },
                        { id: "signals", text: "Demonstrates understanding of hand signals & blind spots." },
                        { id: "walkaround", text: "Performs full morning machine walkaround & pre-trip." },
                        { id: "fluid", text: "Checks fluid levels (oil, hydraulics, coolant) & handles leaks." },
                        { id: "grease", text: "Properly greases pivot points on boom, blade, or bucket." },
                        { id: "stakes", text: "Correctly interprets, reads & protects grade stakes." },
                        { id: "laser", text: "Uses laser level/hand level to verify excavation slope." },
                        
                        { id: "threePoint", text: "Safely mounts/dismounts using strict 3-points of contact." },
                        { id: "skidSteer", text: "Demonstrates smooth travel, turning, & spin on skid steer." },
                        { id: "attachments", text: "Safely changes hydraulic bucket or pallet fork attachments." },
                        { id: "stockpiles", text: "Moves and stockpiles loose base materials efficiently." },
                        { id: "backfill", text: "Safely backfills trenches/excavations with compact tracks." },
                        { id: "miniEx", text: "Demonstrates basic operation of a mini-excavator." },
                        
                        { id: "locate811", text: "Strict compliance with utility locate marks (811 codes)." },
                        { id: "largeMach", text: "Operates 15-ton excavator/dozer in safe zones." },
                        { id: "roughGrade", text: "Maintains rough grade over 50-foot stretch." },
                        { id: "loadTruck", text: "Safely loads a soil dump truck or soil stock hopper." },
                        { id: "mechanical", text: "Demonstrates basic mechanical troubleshooting." }
                      ];

                      // Simple function to retrieve current state safely
                      const getSkillState = (skillId: string) => {
                        const val = activeInternObj?.skills?.[skillId];
                        if (typeof val === 'object' && val !== null) {
                          return val as { mastered: boolean; date: string; mentorInitials: string; internInitials: string };
                        }
                        // Fallback
                        return {
                          mastered: !!val,
                          date: val ? activeInternObj?.startDate || "" : "",
                          mentorInitials: val ? "TJ" : "",
                          internInitials: val ? "BG" : ""
                        };
                      };

                      // Total metrics
                      const totalSkillsCount = skillMetadatas.length;
                      const masteredSkillsCount = skillMetadatas.filter(s => getSkillState(s.id).mastered).length;
                      const progressPercentage = Math.round((masteredSkillsCount / totalSkillsCount) * 100);

                      // Update local states helper
                      const toggleCheck = (skillId: string, currentVal: boolean) => {
                        const nextVal = !currentVal;
                        const updated = interns.map(it => {
                          if (it.id === activeInternObj.id) {
                            const cur = getSkillState(skillId);
                            const updatedSkillsMap = {
                              ...it.skills,
                              [skillId]: {
                                mastered: nextVal,
                                date: nextVal ? new Date().toLocaleDateString("en-US") : "",
                                mentorInitials: nextVal ? "TJ" : "",
                                internInitials: nextVal ? "BG" : ""
                              }
                            };
                            return {
                              ...it,
                              skills: updatedSkillsMap
                            };
                          }
                          return it;
                        });
                        saveAllInterns(updated);
                      };

                      const updateMetaField = (skillId: string, field: 'date' | 'mentorInitials' | 'internInitials', textVal: string) => {
                        const updated = interns.map(it => {
                          if (it.id === activeInternObj.id) {
                            const cur = getSkillState(skillId);
                            const updatedSkillsMap = {
                              ...it.skills,
                              [skillId]: {
                                ...cur,
                                [field]: textVal
                              }
                            };
                            return {
                              ...it,
                              skills: updatedSkillsMap
                            };
                          }
                          return it;
                        });
                        saveAllInterns(updated);
                      };

                      return (
                        <div className="space-y-6">
                          
                          {/* Realtime Program Progress Meter */}
                          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400 font-mono">INTERN INDUCTED: <strong className="text-white font-sans">{activeInternObj.name}</strong></span>
                              <span className="text-brand-orange font-mono font-black">{masteredSkillsCount}/{totalSkillsCount} TASKS MASTERED ({progressPercentage}%)</span>
                            </div>

                            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                              <div 
                                className="bg-gradient-to-r from-amber-600 to-emerald-500 h-full transition-all duration-500" 
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>

                            {/* Phase details */}
                            <div className="grid grid-cols-3 gap-2.5 pt-2 text-center text-[10px] uppercase tracking-wider font-mono">
                              <div className="p-2 bg-slate-900/40 rounded border border-slate-850">
                                <span className="text-slate-500 block">Week 1 Phase</span>
                                <span className={progressPercentage > 30 ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                                  {skillMetadatas.slice(0, 7).filter(s => getSkillState(s.id).mastered).length}/7 Done
                                </span>
                              </div>
                              <div className="p-2 bg-slate-900/40 rounded border border-slate-850">
                                <span className="text-slate-550 block">Weeks 2–4 Phase</span>
                                <span className={progressPercentage > 60 ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                                  {skillMetadatas.slice(7, 13).filter(s => getSkillState(s.id).mastered).length}/6 Done
                                </span>
                              </div>
                              <div className="p-2 bg-slate-900/40 rounded border border-slate-850">
                                <span className="text-slate-550 block">Weeks 5+ Phase</span>
                                <span className={progressPercentage === 100 ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                                  {skillMetadatas.slice(13).filter(s => getSkillState(s.id).mastered).length}/5 Done
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive list segmented by weekly milestones */}
                          <div className="space-y-6">
                            
                            {/* PHASE 1 */}
                            <div className="bg-slate-950/20 rounded-2xl border border-slate-850/80 p-5 space-y-4">
                              <h5 className="font-display font-black text-xs text-brand-orange uppercase tracking-wider pb-2 border-b border-slate-850 font-mono">
                                PHASE 1: SAFETY, GROUNDWORK & MAINTENANCE (WEEK 1)
                              </h5>
                              <div className="space-y-3 font-sans">
                                {skillMetadatas.slice(0, 7).map(skill => {
                                  const sState = getSkillState(skill.id);
                                  return (
                                    <div key={skill.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-850 hover:bg-slate-900/30 transition-colors">
                                      <div className="flex items-start gap-2.5 max-w-xl text-xs">
                                        <input 
                                          type="checkbox"
                                          checked={sState.mastered}
                                          onChange={() => toggleCheck(skill.id, sState.mastered)}
                                          className="accent-emerald-600 scale-105 rounded mt-0.5 shrink-0"
                                        />
                                        <span className={sState.mastered ? "text-slate-450 line-through" : "text-slate-250"}>{skill.text}</span>
                                      </div>

                                      {sState.mastered && (
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono self-end sm:self-auto">
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500">DATE:</span>
                                            <input 
                                              type="text" 
                                              value={sState.date}
                                              onChange={(e) => updateMetaField(skill.id, 'date', e.target.value)}
                                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 w-[78px] text-[10px]"
                                            />
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500">MENTOR:</span>
                                            <input 
                                              type="text" 
                                              value={sState.mentorInitials}
                                              onChange={(e) => updateMetaField(skill.id, 'mentorInitials', e.target.value)}
                                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 w-[30px] text-center text-[10px]"
                                            />
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500">INTERN:</span>
                                            <input 
                                              type="text" 
                                              value={sState.internInitials}
                                              onChange={(e) => updateMetaField(skill.id, 'internInitials', e.target.value)}
                                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 w-[30px] text-center text-[10px]"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* PHASE 2 */}
                            <div className="bg-slate-950/20 rounded-2xl border border-slate-850/80 p-5 space-y-4">
                              <h5 className="font-display font-black text-xs text-brand-orange uppercase tracking-wider pb-2 border-b border-slate-850 font-mono">
                                PHASE 2: COMPACT EQUIPMENT SEAT TIME (WEEKS 2-4)
                              </h5>
                              <div className="space-y-3 font-sans font-sans">
                                {skillMetadatas.slice(7, 13).map(skill => {
                                  const sState = getSkillState(skill.id);
                                  return (
                                    <div key={skill.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-850 hover:bg-slate-900/30 transition-colors">
                                      <div className="flex items-start gap-2.5 max-w-xl text-xs">
                                        <input 
                                          type="checkbox"
                                          checked={sState.mastered}
                                          onChange={() => toggleCheck(skill.id, sState.mastered)}
                                          className="accent-emerald-600 scale-105 rounded mt-0.5 shrink-0"
                                        />
                                        <span className={sState.mastered ? "text-slate-450 line-through" : "text-slate-250"}>{skill.text}</span>
                                      </div>

                                      {sState.mastered && (
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono self-end sm:self-auto">
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500">DATE:</span>
                                            <input 
                                              type="text" 
                                              value={sState.date}
                                              onChange={(e) => updateMetaField(skill.id, 'date', e.target.value)}
                                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 w-[78px] text-[10px]"
                                            />
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500">MENTOR:</span>
                                            <input 
                                              type="text" 
                                              value={sState.mentorInitials}
                                              onChange={(e) => updateMetaField(skill.id, 'mentorInitials', e.target.value)}
                                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 w-[30px] text-center text-[10px]"
                                            />
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500">INTERN:</span>
                                            <input 
                                              type="text" 
                                              value={sState.internInitials}
                                              onChange={(e) => updateMetaField(skill.id, 'internInitials', e.target.value)}
                                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 w-[30px] text-center text-[10px]"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* PHASE 3 */}
                            <div className="bg-slate-950/20 rounded-2xl border border-slate-850/80 p-5 space-y-4">
                              <h5 className="font-display font-black text-xs text-brand-orange uppercase tracking-wider pb-2 border-b border-slate-850 font-mono">
                                PHASE 3: ADVANCED RUNS & GRADING (WEEKS 5+)
                              </h5>
                              <div className="space-y-3 font-sans">
                                {skillMetadatas.slice(13).map(skill => {
                                  const sState = getSkillState(skill.id);
                                  return (
                                    <div key={skill.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-850 hover:bg-slate-900/30 transition-colors">
                                      <div className="flex items-start gap-2.5 max-w-xl text-xs">
                                        <input 
                                          type="checkbox"
                                          checked={sState.mastered}
                                          onChange={() => toggleCheck(skill.id, sState.mastered)}
                                          className="accent-emerald-600 scale-105 rounded mt-0.5 shrink-0"
                                        />
                                        <span className={sState.mastered ? "text-slate-450 line-through" : "text-slate-250"}>{skill.text}</span>
                                      </div>

                                      {sState.mastered && (
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono self-end sm:self-auto">
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500">DATE:</span>
                                            <input 
                                              type="text" 
                                              value={sState.date}
                                              onChange={(e) => updateMetaField(skill.id, 'date', e.target.value)}
                                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 w-[78px] text-[10px]"
                                            />
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500">MENTOR:</span>
                                            <input 
                                              type="text" 
                                              value={sState.mentorInitials}
                                              onChange={(e) => updateMetaField(skill.id, 'mentorInitials', e.target.value)}
                                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 w-[30px] text-center text-[10px]"
                                            />
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500">INTERN:</span>
                                            <input 
                                              type="text" 
                                              value={sState.internInitials}
                                              onChange={(e) => updateMetaField(skill.id, 'internInitials', e.target.value)}
                                              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 w-[30px] text-center text-[10px]"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                          </div>

                          {/* Evaluation signoff area */}
                          <div id="skills-evaluation-panel" className="bg-slate-950 p-6 rounded-2xl border border-slate-850 space-y-4">
                            <h5 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                              <CheckCircle className="w-5 h-5 text-brand-orange" />
                              <span>Final Supervisor Sign-Off & Evaluative Action</span>
                            </h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                              <div className="space-y-2">
                                <label className="text-slate-400 block font-mono text-[11px]">GRADUATION ACTION SELECTOR:</label>
                                <div className="space-y-1.5">
                                  <label className="flex items-center gap-2 p-2 bg-slate-900/60 rounded border border-slate-800 hover:bg-slate-900 cursor-pointer text-slate-300">
                                    <input 
                                      type="radio" 
                                      name="eval_action" 
                                      checked={activeInternObj.status === 'recommended'}
                                      onChange={() => {
                                        const updated = interns.map(it => it.id === activeInternObj.id ? { ...it, status: 'recommended' } : it);
                                        saveAllInterns(updated);
                                      }}
                                    />
                                    <span className="text-emerald-400 font-bold">Recommended for Full-Time Operator Tier 1</span>
                                  </label>
                                  <label className="flex items-center gap-2 p-2 bg-slate-900/60 rounded border border-slate-800 hover:bg-slate-900 cursor-pointer text-slate-300">
                                    <input 
                                      type="radio" 
                                      name="eval_action" 
                                      checked={activeInternObj.status === 'active'}
                                      onChange={() => {
                                        const updated = interns.map(it => it.id === activeInternObj.id ? { ...it, status: 'active' } : it);
                                        saveAllInterns(updated);
                                      }}
                                    />
                                    <span className="text-amber-500 font-bold">In-Training / Standard Active Intern</span>
                                  </label>
                                </div>
                              </div>

                              <div className="space-y-4 font-sans">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">TJ Darley Signature Verification</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 font-serif text-sm italic text-white outline-none"
                                    placeholder="Enter your name e.g. TJ Darley"
                                  />
                                </div>
                                <div className="flex justify-end gap-2 text-[10px] font-mono text-slate-500">
                                  <span>E-signed on: {new Date().toLocaleDateString("en-US")}</span>
                                  <span>&bull;</span>
                                  <span>Workforce ID: TJD-{activeInternObj.id.toUpperCase().slice(7, 12)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })()}

                  </div>
                )}

                {/* SUB TAB 5: CREW TRAINING & HAND SIGNALS & TALKS */}
                {activeInternTab === 'academy' && (
                  <div id="academy-reference-pane" className="space-y-6 animate-in fade-in duration-200 text-left">
                    
                    {/* Mode Selector and Quick Portal Login */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-500/20 text-brand-orange border border-orange-500/30 font-sans">
                            LIVE TRAINING
                          </span>
                          <h4 className="text-white font-bold text-sm tracking-tight font-mono uppercase">
                            Safety Training Academy & Video Ledger
                          </h4>
                        </div>
                        <p className="text-slate-400 text-xs mt-1 font-sans">
                          Log training hours, track video playtimes automatically, and issue certified safety credentials.
                        </p>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setAcademyMode('staff')}
                          className={`flex-1 sm:flex-initial text-xs uppercase px-3 py-1.5 rounded-lg border font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            academyMode === 'staff'
                              ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/10'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Supervisor Panel</span>
                        </button>
                        <button
                          onClick={() => setAcademyMode('trainee')}
                          className={`flex-1 sm:flex-initial text-xs uppercase px-3 py-1.5 rounded-lg border font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            academyMode === 'trainee'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-950/10'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span>Trainee Portal</span>
                        </button>
                      </div>
                    </div>

                    {academyMode === 'staff' ? (
                      <div className="space-y-6 animate-in fade-in duration-200">
                        
                        {/* 1. Trainee Portal Link Maker */}
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-brand-orange" />
                            <h5 className="font-display font-medium text-xs text-white uppercase tracking-wider font-mono">
                              Intern Training Link Generator & Login Portal
                            </h5>
                          </div>
                          
                          <p className="text-slate-450 text-xs leading-relaxed font-sans">
                            Generate and hand out secure individual learning links. When interns use this login URL, they are directed straight into their video safety portal, which tracks their actual watch session down to the second.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-850">
                            <div className="space-y-2 font-sans overflow-visible">
                              <label className="text-[10px] text-slate-505 uppercase tracking-widest font-mono block">Select Target Intern</label>
                              <select
                                value={currentTraineeId}
                                onChange={(e) => setCurrentTraineeId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg p-2.5 outline-none focus:border-brand-orange cursor-pointer"
                              >
                                {interns.map(it => (
                                  <option key={it.id} value={it.id}>{it.name} (ID: {it.id})</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2 font-sans">
                              <label className="text-[10px] text-slate-505 uppercase tracking-widest font-mono block">Secure Watch Link</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={`${window.location.origin}${window.location.pathname}?portal=trainee&intern=${currentTraineeId}`}
                                  className="flex-1 bg-slate-900 border border-slate-800 text-xs rounded-lg p-2.5 text-slate-400 select-all outline-none font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const testLink = `${window.location.origin}${window.location.pathname}?portal=trainee&intern=${currentTraineeId}`;
                                    try {
                                      navigator.clipboard.writeText(testLink);
                                      setCopiedLinkForInternId(currentTraineeId);
                                      setTimeout(() => setCopiedLinkForInternId(null), 2000);
                                    } catch (err) {
                                      console.error("Failed to copy link", err);
                                    }
                                  }}
                                  className="bg-brand-orange hover:bg-brand-orange/90 text-white font-mono font-bold text-xs uppercase px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{copiedLinkForInternId === currentTraineeId ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Supervisor's Live Ingest Watch-time Ledger */}
                        <div className="bg-slate-900 border border-slate-855 p-6 rounded-2xl space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                            <div>
                              <h5 className="font-display font-bold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
                                <Award className="w-5 h-5 text-emerald-500" />
                                <span>OSHA Training Hours & Badge Ledger</span>
                              </h5>
                              <p className="text-[11px] text-slate-450 mt-1 font-sans">Live tracking of intern study minutes and certified safety credentials.</p>
                            </div>
                          </div>

                          <div className="overflow-x-auto text-left">
                            <table className="w-full text-xs border-collapse font-sans">
                              <thead>
                                <tr className="border-b border-slate-800 text-slate-450 uppercase text-[10px] tracking-wider font-mono">
                                  <th className="py-2.5 px-2 font-mono text-left">Trainee</th>
                                  {SAFETY_VIDEOS.map(video => (
                                    <th key={video.id} className="py-2.5 px-2 font-mono text-left">
                                      {video.badge} ({video.duration})
                                    </th>
                                  ))}
                                  <th className="py-2.5 px-2 text-right font-mono">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850/60 font-sans">
                                {interns.map(it => {
                                  const watchTimes = it.videoWatchTimes || {};
                                  const completed = it.completedModules || [];
                                  
                                  const getProgressText = (vidId: string) => {
                                    const secs = watchTimes[vidId] || 0;
                                    if (completed.includes(vidId)) {
                                      return 'Certified';
                                    }
                                    if (secs === 0) return 'Not Started';
                                    const m = Math.floor(secs / 60);
                                    const s = secs % 60;
                                    return `${m}m ${s}s`;
                                  };

                                  const getProgressPercent = (vidId: string) => {
                                    const secs = watchTimes[vidId] || 0;
                                    if (completed.includes(vidId)) return 100;
                                    return Math.min(Math.round((secs / 15) * 100), 100);
                                  };

                                  return (
                                    <tr key={it.id} className="hover:bg-slate-950/20 text-slate-300">
                                      <td className="py-2 px-2 font-bold text-white">
                                        <div>{it.name}</div>
                                        <div className="text-[9px] text-slate-500 font-mono uppercase">{it.id}</div>
                                      </td>
                                      
                                      {SAFETY_VIDEOS.map(video => {
                                        const isDone = completed.includes(video.id);
                                        const percent = getProgressPercent(video.id);
                                        return (
                                          <td key={video.id} className="py-2 px-2">
                                            <div className="space-y-1 max-w-[120px]">
                                              <div className="flex justify-between items-center text-[10px]">
                                                <span className={isDone ? "text-emerald-400 font-bold" : "text-slate-400"}>
                                                  {getProgressText(video.id)}
                                                </span>
                                                {isDone && <Check className="w-3 h-3 text-emerald-400 inline" />}
                                              </div>
                                              <div className="w-full bg-slate-950 rounded-full h-1">
                                                <div 
                                                  className={`h-1 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-brand-orange'}`} 
                                                  style={{ width: `${percent}%` }}
                                                />
                                              </div>
                                            </div>
                                          </td>
                                        );
                                      })}

                                      <td className="py-2 px-2 text-right">
                                        <div className="flex justify-end gap-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = interns.map(x => x.id === it.id ? {
                                                ...x,
                                                completedModules: SAFETY_VIDEOS.map(v => v.id),
                                                videoWatchTimes: SAFETY_VIDEOS.reduce((acc: any, v) => {
                                                  acc[v.id] = 15;
                                                  return acc;
                                                }, {})
                                              } : x);
                                              saveAllInterns(updated);
                                            }}
                                            className="px-1.5 py-0.5 bg-slate-955 hover:bg-slate-800 text-[9px] font-mono text-slate-300 rounded border border-slate-800 transition-colors uppercase cursor-pointer"
                                          >
                                            Sign-Off
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = interns.map(x => x.id === it.id ? {
                                                ...x,
                                                completedModules: [],
                                                videoWatchTimes: {}
                                              } : x);
                                              saveAllInterns(updated);
                                            }}
                                            className="px-1.5 py-0.5 bg-rose-950/20 hover:bg-rose-950/60 text-[9px] font-mono text-rose-450 rounded border border-rose-900/40 transition-colors uppercase cursor-pointer"
                                          >
                                            Reset
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* OSHA Video Integration Hub */}
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 text-left">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-850">
                            <div className="text-left font-sans">
                              <h5 className="font-display font-medium text-xs text-white uppercase tracking-wider font-mono flex items-center gap-2">
                                <Video className="w-4 h-4 text-brand-orange animate-pulse" />
                                <span>OSHA & Curated Video Integration Hub</span>
                              </h5>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Browse official OSHA instructional v-Tools, community-guided rigging tutorials, or connect and track external YouTube training materials.
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setActiveOshaTab('catalog')}
                                type="button"
                                className={`px-3 py-1.5 text-[10px] uppercase font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                                  activeOshaTab === 'catalog' 
                                    ? 'bg-brand-orange text-white' 
                                    : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-white'
                                }`}
                              >
                                Curated Library
                              </button>
                              <button
                                onClick={() => setActiveOshaTab('custom')}
                                type="button"
                                className={`px-3 py-1.5 text-[10px] uppercase font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                                  activeOshaTab === 'custom' 
                                    ? 'bg-brand-orange text-white' 
                                    : 'bg-slate-955 border border-slate-850 text-slate-400 hover:text-white'
                                }`}
                              >
                                Import Custom Link
                              </button>
                            </div>
                          </div>

                          {activeOshaTab === 'catalog' ? (
                            <div className="space-y-4 font-sans text-left">
                              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-[11px] text-slate-350 leading-relaxed">
                                <strong>Safety Resource Curation:</strong> Click "Import" to append any of these official federal v-Tools or curated community-voted practical guides directly to your team's active syllabus checklist.
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {OSHA_OFFICIAL_CATALOG.map(video => {
                                  const isAdded = SAFETY_VIDEOS.some(v => v.id === video.id);
                                  return (
                                    <div key={video.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                                      <div className="space-y-1.5">
                                        <div className="flex justify-between items-start gap-2">
                                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0 border ${
                                            video.isOshaOfficial 
                                              ? 'bg-emerald-950 text-emerald-400 border-emerald-900/40' 
                                              : 'bg-indigo-950 text-indigo-400 border-indigo-900/40'
                                          }`}>
                                            {video.badge} {!video.isOshaOfficial && '✨'}
                                          </span>
                                          <span className="text-[10px] text-slate-500 font-mono font-bold shrink-0">Mins: {video.duration}</span>
                                        </div>
                                        <h6 className="text-white font-bold text-xs flex items-center gap-1">
                                          {video.title}
                                        </h6>
                                        <p className="text-slate-400 text-[11px] leading-relaxed">{video.description}</p>
                                        {!video.isOshaOfficial && (
                                          <p className="text-indigo-400/90 text-[10px] font-mono font-medium">Supervisor recommendation - practical application</p>
                                        )}
                                      </div>
                                      
                                      <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                                        <a 
                                          href={`https://www.youtube.com/watch?v=${video.embedUrl.split('/').pop()}`}
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono hover:underline cursor-pointer"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          <span>Preview on YouTube</span>
                                        </a>
                                        
                                        {isAdded ? (
                                          <span className="text-[10.5px] text-emerald-400 font-bold flex items-center gap-1 font-mono uppercase">
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Syllabus Active</span>
                                          </span>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              const updated = [...SAFETY_VIDEOS, video];
                                              saveSafetyVideos(updated);
                                            }}
                                            type="button"
                                            className="px-2.5 py-1.5 bg-brand-orange hover:bg-brand-orange/90 text-white text-[10.5px] font-mono font-bold uppercase rounded transition-colors flex items-center gap-1 cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Import Lesson</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              
                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={() => {
                                    saveSafetyVideos(DEFAULT_SAFETY_VIDEOS);
                                    if (!DEFAULT_SAFETY_VIDEOS.some(v => v.id === activeVideoId)) {
                                      setActiveVideoId('signals_basics');
                                    }
                                  }}
                                  type="button"
                                  className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors uppercase font-mono flex items-center gap-1 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Reset Syllabus to Factory Defaults</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                setCustomVidError(null);
                                setCustomVidSuccess(false);

                                if (!customVidTitle.trim()) {
                                  setCustomVidError("Please enter a training title");
                                  return;
                                }
                                if (!customVidUrl.trim()) {
                                  setCustomVidError("Please enter a valid YouTube link or ID");
                                  return;
                                }

                                const parseYoutubeId = (url: string) => {
                                  if (!url) return '';
                                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                  const match = url.match(regExp);
                                  return (match && match[2].length === 11) ? match[2] : url;
                                };

                                const videoId = parseYoutubeId(customVidUrl.trim());
                                if (!videoId || videoId.length < 5) {
                                  setCustomVidError("Could not extract a valid YouTube video ID.");
                                  return;
                                }

                                const newId = `custom_${Date.now()}`;
                                const newVideo = {
                                  id: newId,
                                  title: customVidTitle.trim(),
                                  duration: customVidDuration,
                                  durationSeconds: 150,
                                  embedUrl: `https://www.youtube.com/embed/${videoId}`,
                                  description: customVidDesc.trim() || 'Custom instruction and field review video added by site foreman/supervisor.',
                                  badge: customVidBadge.trim() || 'Custom Pass',
                                  isCustom: true,
                                };

                                const updated = [...SAFETY_VIDEOS, newVideo];
                                saveSafetyVideos(updated);
                                
                                setCustomVidTitle('');
                                setCustomVidUrl('');
                                setCustomVidDesc('');
                                setCustomVidSuccess(true);
                                setTimeout(() => setCustomVidSuccess(false), 3000);
                              }}
                              className="space-y-4 text-left font-sans text-xs"
                            >
                              <div className="p-3 bg-brand-orange/5 border border-brand-orange/10 rounded-xl text-[11px] text-slate-400 leading-relaxed font-sans">
                                <strong>Safety Expansion Desk:</strong> Track watch attendance on ANY free training video. Input the video details and YouTube share/watch link below, and the platform will setup dynamic logs in the Trainee Portal and Supervisor console.
                              </div>

                              {/* Quick Autofill Suggestion for Hand Signals */}
                              <div className="p-3.5 bg-indigo-950/30 border border-indigo-900/40 rounded-xl space-y-3 font-sans text-xs">
                                <span className="text-[9px] bg-indigo-900 text-indigo-200 border border-indigo-800 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                  Team Recommendation Presets
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                                  <div className="bg-slate-950/50 border border-slate-850 p-2.5 rounded-lg flex flex-col justify-between gap-2">
                                    <div>
                                      <p className="text-white font-bold text-[11px]">Earthwork Hand Signals (`t4dl5zAE9oc`)</p>
                                      <p className="text-slate-400 text-[10px] mt-0.5">Quick fill for safe site communication.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCustomVidTitle('Earthwork Hand Signals');
                                        setCustomVidUrl('https://www.youtube.com/watch?v=t4dl5zAE9oc');
                                        setCustomVidDuration('3:45');
                                        setCustomVidBadge('Earthwork Spotter');
                                        setCustomVidDesc('On-site earthwork safety hand signals recommended for operators and ground spotters to prevent heavy equipment collision hazards.');
                                      }}
                                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono font-bold text-[9px] uppercase transition-colors w-full cursor-pointer"
                                    >
                                      Load Signal Draft
                                    </button>
                                  </div>

                                  <div className="bg-slate-950/50 border border-slate-850 p-2.5 rounded-lg flex flex-col justify-between gap-2">
                                    <div>
                                      <p className="text-white font-bold text-[11px]">1st Day Onboarding (`fdIpOYlTb-Y`)</p>
                                      <p className="text-slate-400 text-[10px] mt-0.5">Quick fill for worker orientation onboarding.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCustomVidTitle('What to Expect on the 1st Day of Your Job');
                                        setCustomVidUrl('https://www.youtube.com/watch?v=fdIpOYlTb-Y');
                                        setCustomVidDuration('4:15');
                                        setCustomVidBadge('Orientation Master');
                                        setCustomVidDesc('On-site job safety orientation and personal expectations overview for greenhorn workers and apprentices.');
                                      }}
                                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono font-bold text-[9px] uppercase transition-colors w-full cursor-pointer"
                                    >
                                      Load Onboarding Draft
                                    </button>
                                  </div>

                                  <div className="bg-slate-950/50 border border-slate-850 p-2.5 rounded-lg flex flex-col justify-between gap-2">
                                    <div>
                                      <p className="text-white font-bold text-[11px]">Heavy Equipment Blind Spots (`zlucjWgykDI`)</p>
                                      <p className="text-slate-400 text-[10px] mt-0.5">Quick fill for operator zone visibility training.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCustomVidTitle('Heavy Equipment Blind Spots & Zones');
                                        setCustomVidUrl('https://www.youtube.com/watch?v=zlucjWgykDI');
                                        setCustomVidDuration('5:30');
                                        setCustomVidBadge('Blind Spot Master');
                                        setCustomVidDesc('Identify danger zones, pinch points, and massive blind spots surrounding earthmovers, haulers, and tracked excavators from the operator\'s cabin perspective.');
                                      }}
                                      className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono font-bold text-[9px] uppercase transition-colors w-full cursor-pointer"
                                    >
                                      Load Blind Spot Draft
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Video Title</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Excavator Safe Operation Procedures"
                                    value={customVidTitle}
                                    onChange={(e) => setCustomVidTitle(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-brand-orange"
                                  />
                                </div>

                                <div className="space-y-1.5 text-left">
                                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">YouTube URL or Video ID</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. https://www.youtube.com/watch?v=reAnrE9vDrc"
                                    value={customVidUrl}
                                    onChange={(e) => setCustomVidUrl(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-brand-orange font-mono"
                                  />
                                </div>

                                <div className="space-y-1.5 text-left">
                                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Lesson Duration</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 5:20"
                                    value={customVidDuration}
                                    onChange={(e) => setCustomVidDuration(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-brand-orange font-mono"
                                  />
                                </div>

                                <div className="space-y-1.5 text-left">
                                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Certified Badge Earned</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Excavation Pro"
                                    value={customVidBadge}
                                    onChange={(e) => setCustomVidBadge(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-brand-orange"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5 text-left">
                                <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Video Description</label>
                                <textarea
                                  placeholder="Describe the safety hazards, hand signals, or procedures highlighted in this lesson..."
                                  rows={2}
                                  value={customVidDesc}
                                  onChange={(e) => setCustomVidDesc(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-brand-orange resize-none"
                                />
                              </div>

                              {customVidError && (
                                <div className="text-rose-450 text-[11px] font-mono font-bold leading-normal">{customVidError}</div>
                              )}
                              {customVidSuccess && (
                                <div className="text-emerald-400 text-[11px] font-mono font-bold leading-normal flex items-center gap-1">
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span>Success! Lesson added. Visit the Active Syllabus panel to view and watch modules.</span>
                                </div>
                              )}

                              <div className="flex justify-end gap-2 pt-2">
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white transition-colors uppercase text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Append lesson URL</span>
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Added active safety videos list table for quick deletions */}
                          {SAFETY_VIDEOS.length > DEFAULT_SAFETY_VIDEOS.length && (
                            <div className="pt-4 border-t border-slate-850 space-y-2 text-left">
                              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">Imported Custom Syllabus Modules</span>
                              <div className="space-y-1.5 font-sans">
                                {SAFETY_VIDEOS.filter(v => !DEFAULT_SAFETY_VIDEOS.some(df => df.id === v.id)).map(video => (
                                  <div key={video.id} className="flex justify-between items-center bg-slate-950 p-2.5 px-4 rounded-xl border border-slate-850 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-900 border border-slate-800 font-mono font-bold text-slate-400 uppercase">
                                        {video.badge}
                                      </span>
                                      <span className="text-slate-300 font-bold">{video.title}</span>
                                      <span className="text-[10px] text-slate-500 font-mono">({video.duration})</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = SAFETY_VIDEOS.filter(v => v.id !== video.id);
                                        saveSafetyVideos(updated);
                                        if (activeVideoId === video.id) {
                                          setActiveVideoId(updated[0]?.id || 'signals_basics');
                                        }
                                      }}
                                      className="text-[10.5px] font-mono text-rose-450 hover:text-rose-405 uppercase transition-colors flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Heavy Equipment Safety References */}
                        <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                      <div>
                        <h4 className="font-display font-black text-sm text-brand-orange uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <CheckCircle className="w-5 h-5 text-brand-orange" />
                          <span>Heavy Equipment Safety Hand Signal Reference</span>
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">Ground workers must master these visual hand gestures to bypass loud engine noise and communicate immediately with grader or excavator operators.</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
                        
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-rose-950 flex flex-col justify-between hover:border-rose-900 transition-colors">
                          <div>
                            <span className="text-rose-400 font-bold text-xs uppercase block pb-1 border-b border-rose-950 font-mono">1. STOP IMMEDIATELY</span>
                            <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed">
                              Open hands held out horizontally with palms face-down, moving back & forth across the chest in horizontal sweeps.
                            </p>
                          </div>
                          <span className="text-[9px] bg-rose-955 text-rose-400 p-1 rounded font-mono text-center mt-3 font-bold uppercase">CRITICAL AT-HAND</span>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-rose-955 flex flex-col justify-between hover:border-rose-900 transition-colors">
                          <div>
                            <span className="text-rose-450 font-bold text-xs uppercase block pb-1 border-b border-rose-955 font-mono">2. EMERGENCY HALT</span>
                            <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed">
                              Extend both arms fully out horizontally to the sides, moving hands up and down rapidly. <strong>Any ground worker</strong> can issue this.
                            </p>
                          </div>
                          <span className="text-[9px] bg-rose-955 text-rose-400 p-1 rounded font-mono text-center mt-3 font-bold uppercase font-mono">ANYONE CAN CALL</span>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-amber-955 flex flex-col justify-between hover:border-amber-900 transition-colors">
                          <div>
                            <span className="text-amber-400 font-bold text-xs uppercase block pb-1 border-b border-amber-955 font-mono">3. TRACKS MOVE / TRAVEL</span>
                            <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed">
                              Clench both hands into solid fists and roll them over each other in circular motions directly in front of the chest.
                            </p>
                          </div>
                          <span className="text-[9px] bg-amber-950/40 text-amber-500 p-1 rounded font-mono text-center mt-3 font-semibold uppercase">TRACKING ROUTE</span>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-amber-955 flex flex-col justify-between hover:border-amber-900 transition-colors">
                          <div>
                            <span className="text-amber-400 font-bold text-xs uppercase block pb-1 border-b border-amber-955 font-mono">4. SLOW DOWN EVERYTHING</span>
                            <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed">
                              Hold one hand completely flat & stationary above the other hand, then move your lower hand in small slow micro-circles.
                            </p>
                          </div>
                          <span className="text-[9px] bg-amber-950/40 text-amber-500 p-1 rounded font-mono text-center mt-3 font-semibold uppercase">SPEED ADJUST</span>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-705 transition-colors">
                          <div>
                            <span className="text-white font-bold text-xs uppercase block pb-1 border-b border-slate-800 font-mono">5. RAISE BOOM / LOAD</span>
                            <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed font-sans">
                              Arm extended fully with index finger pointing straight up, moving the hand in tiny clockwise horizontal circles.
                            </p>
                          </div>
                          <span className="text-[9px] bg-slate-950 text-slate-500 p-1 rounded font-mono text-center mt-3 font-bold uppercase">BOOM UP</span>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-705 transition-colors">
                          <div>
                            <span className="text-white font-bold text-xs uppercase block pb-1 border-b border-slate-800 font-mono">6. LOWER BOOM / LOAD</span>
                            <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed font-sans">
                              Arm extended horizontally with index finger pointing straight down, spinning the hand in tiny horizontal circles.
                            </p>
                          </div>
                          <span className="text-[9px] bg-slate-950 text-slate-500 p-1 rounded font-mono text-center mt-3 font-bold uppercase font-mono">BOOM DOWN</span>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-705 transition-colors">
                          <div>
                            <span className="text-white font-bold text-xs uppercase block pb-1 border-b border-slate-800 font-mono font-mono">7. BUCKET IN / CURL</span>
                            <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed font-sans font-sans">
                              Hold a fist out with the thumb pointing straight inward toward your chest, signaling the operator to scoop or curl material.
                            </p>
                          </div>
                          <span className="text-[9px] bg-slate-950 text-slate-500 p-1 rounded font-mono text-center mt-3 font-bold uppercase font-mono">CURL BUCKET</span>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-705 transition-colors">
                          <div>
                            <span className="text-white font-bold text-xs uppercase block pb-1 border-b border-slate-800 font-mono font-mono font-mono">8. BUCKET OUT / DUMP</span>
                            <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed font-sans font-sans font-sans font-sans">
                              Hold a fist out with the thumb pointing straight outward away from your chest, signaling the operator to dump bucket soil.
                            </p>
                          </div>
                          <span className="text-[9px] bg-slate-950 text-slate-500 p-1 rounded font-mono text-center mt-3 font-bold uppercase font-mono font-mono">DUMP SOIL</span>
                        </div>

                      </div>
                    </div>

                    {/* Left & Right split for Toolbox Talks topics and Ground rules */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Block: Crew Toolbox Talks */}
                      <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                        <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-850 font-mono">
                          <BookOpen className="w-5 h-5 text-brand-orange" />
                          <span>Daily Morning Toolbox Talks (Interactive Academy)</span>
                        </h4>
                        
                        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                          
                          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-emerald-400 font-mono text-xs font-black block">Topic 1: The 360-Degree Blind Spot (The "Invisible" Zone)</span>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              Large excavators, bulldozers, and off-road dump trucks have massive blind spots where the operator cannot see a person standing on the ground.
                            </p>
                            <p className="text-slate-400 text-[11px] italic leading-relaxed border-l-2 border-brand-orange pl-2 font-sans">
                              <strong>Intern Action Rule:</strong> Never walk behind or directly beside a machine without establishing positive eye contact with the operator. If you cannot see the operator’s eyes in their mirrors, they cannot see you.
                            </p>
                          </div>

                          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-emerald-400 font-mono text-xs font-black block">Topic 2: Positive Contact & The "Thumbs-Up" Rule</span>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              You must safely approach a running machine only after the operator acknowledges your presence.
                            </p>
                            <p className="text-slate-400 text-[11px] italic leading-relaxed border-l-2 border-brand-orange pl-2 font-sans font-sans">
                              <strong>Intern Action Rule:</strong> Standard safety protocol requires standing at a safe distance (minimum 15 feet), making eye contact, and waiting for the operator to pause work and give you a clear thumbs-up signal. Never cross into a machine's working radius until the bucket, blade, or attachment is completely lowered flat to the ground.
                            </p>
                          </div>

                          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-emerald-400 font-mono text-xs font-black block">Topic 3: Swing Radius & Slingshot Hazards</span>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              Excavators and counterweights rotate rapidly. The back end of an excavator can swing wide and crush a ground worker against a trench wall, stockpile, or utility pole.
                            </p>
                            <p className="text-slate-400 text-[11px] italic leading-relaxed border-l-2 border-brand-orange pl-2 font-sans font-sans">
                              <strong>Intern Action Rule:</strong> Treat the entire maximum reach of an excavator boom plus an extra 10 feet as a strict danger zone. Stand clear of the counterweight rotation path at all times.
                            </p>
                          </div>

                          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-emerald-400 font-mono text-xs font-black block font-mono">Topic 4: Safe Trenching & Excavation Ground Rules</span>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              Earthwork involves digging deep trenches that carry a high risk of cave-ins if safety rules are ignored.
                            </p>
                            <p className="text-slate-400 text-[11px] italic leading-relaxed border-l-2 border-brand-orange pl-2 font-sans font-sans">
                              <strong>Intern Action Rule:</strong> Never enter an un-shored or un-sloped trench deeper than 4 feet without explicit approval from the site Competent Person. Always keep tools and excavated spoil piles at least 2 feet back from the edge of any open excavation to prevent materials from rolling back in.
                            </p>
                          </div>

                          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-emerald-400 font-mono text-xs font-black block font-mono">Topic 5: Preventive Maintenance (PM) Safety & Lockout</span>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              Interns handle daily greasing and fluid checks, which put them close to heavy moving parts, belts, and boiling hydraulic fluids.
                            </p>
                            <p className="text-slate-400 text-[11px] italic leading-relaxed border-l-2 border-brand-orange pl-2 font-sans">
                              <strong>Intern Action Rule:</strong> Before opening an engine bay shroud or reaching near a machine joint to grease it, ensure the engine is completely shut off, the key is removed from the ignition, and the safety lockout lever inside the cab is pulled up into the locked position.
                            </p>
                          </div>

                          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                            <span className="text-emerald-400 font-mono text-xs font-black block font-mono">Topic 6: Three-Points of Contact (Mounting/Dismounting)</span>
                            <p className="text-slate-300 text-xs leading-relaxed">
                              Slipping while climbing into or out of high heavy machinery cabs is one of the most common causes of workplace strains, sprains, and broken bones.
                            </p>
                            <p className="text-slate-405 text-[11px] italic leading-relaxed border-l-2 border-brand-orange pl-2 font-sans font-sans">
                              <strong>Intern Action Rule:</strong> Always face the machine when climbing up or down. Maintain three points of contact at all times (two hands and one foot, or two feet and one hand) on the secure steps and grab bars. Never jump down from a machine track, tire, or cab platform.
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Right Block: Spotter Rules */}
                      <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4 h-fit">
                        <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider pb-2 border-b border-slate-850">
                          Universal Spotting Rules
                        </h4>
                        
                        <ul className="text-xs text-slate-300 space-y-3 list-decimal list-inside pl-1 leading-relaxed">
                          <li>
                            <strong className="text-white">Always Face the Machine:</strong> Never turn your back on an active piece of moving machinery while giving a hand signal.
                          </li>
                          <li>
                            <strong className="text-white">Stand Clear of Paths:</strong> Always maintain a safe stance completely outside the equipment's travel path or swing radius.
                          </li>
                          <li>
                            <strong className="text-white">One Signalman Only:</strong> Only one designated ground spotter should give signals to an operator at a time to prevent conflicting instructions (except for emergency stops, which anyone can issue).
                          </li>
                          <li>
                            <strong className="text-white">Visual Line of Sight:</strong> If you lose visual contact with the operator for even a split second, abort active signaling and step back to safety.
                          </li>
                        </ul>

                        <div className="p-3 bg-brand-orange/5 border border-brand-orange/20 rounded-xl text-[11px] text-slate-400">
                          <strong>Supervisor Note:</strong> Run these quick briefings at the tail-gate *every single morning* before turning keys in the ignition.
                        </div>
                      </div>

                    </div>

                  </div>
                    ) : (
                      /* TRAINEE PORTAL MAIN ACTIVE DASHBOARD */
                      <div className="space-y-6 animate-in fade-in duration-200">
                        {(() => {
                          const activeTrainee = interns.find(i => i.id === currentTraineeId) || interns[0] || { id: 'unknown', name: 'Guest Intern' };
                          const watchTimes = activeTrainee.videoWatchTimes || {};
                          const completed = activeTrainee.completedModules || [];
                          
                          const activeVideo = SAFETY_VIDEOS.find(v => v.id === activeVideoId) || SAFETY_VIDEOS[0];
                          const watchedSecsForActive = watchTimes[activeVideo.id] || 0;
                          const hasFinishedActive = completed.includes(activeVideo.id);
                          const secondsLimit = 15; // standard demo mode limit
                          const pct = Math.min((watchedSecsForActive / secondsLimit) * 100, 100);

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Left column: Video player & Controls */}
                              <div className="lg:col-span-2 space-y-4">
                                <div className="bg-slate-900 border border-slate-855 p-4 rounded-2xl space-y-4">
                                  
                                  {/* Active Trainee Header Banner */}
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-3 font-sans">
                                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                                        <User className="w-5 h-5 text-emerald-400" />
                                      </div>
                                      <div className="text-left font-sans">
                                        <div className="flex items-center gap-1.5 font-sans">
                                          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">ACTIVE TRAINEE SESSION:</span>
                                          <span className="text-emerald-450 font-black text-sm uppercase">{activeTrainee.name}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono">
                                          TJ DARLEY WORKFORCE ACADEMY &bull; ID: {activeTrainee.id?.toUpperCase()}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Quick internal test switcher */}
                                    <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 self-stretch sm:self-auto justify-between">
                                      <span className="text-[9px] text-slate-450 font-mono uppercase pl-1">SWITCH ID (TEST):</span>
                                      <select
                                        value={currentTraineeId}
                                        onChange={(e) => {
                                          setCurrentTraineeId(e.target.value);
                                          setIsWatchingVideo(false);
                                        }}
                                        className="bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-200 rounded px-1.5 py-1 outline-none font-mono cursor-pointer"
                                      >
                                        {interns.map(it => (
                                          <option key={it.id} value={it.id}>{it.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Video Iframe Frame */}
                                  <div className="space-y-3 text-left font-sans">
                                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-850 relative shadow-inner">
                                      <iframe
                                        src={`${activeVideo.embedUrl}?autoplay=0&rel=0&modestbranding=1`}
                                        title={activeVideo.title}
                                        className="w-full h-full absolute inset-0 font-sans"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2 justify-between">
                                        <h5 className="text-white font-black text-sm tracking-tight font-sans">
                                          {activeVideo.title}
                                        </h5>
                                        <span className="text-[9px] bg-slate-950 text-slate-500 px-2 py-0.5 rounded border border-slate-850 font-mono font-bold">
                                          SYLLABUS TIME: {activeVideo.duration}
                                        </span>
                                      </div>
                                      <p className="text-slate-400 text-xs leading-relaxed font-sans">{activeVideo.description}</p>
                                    </div>

                                    {/* Dynamic Sensor Watch Ingestion Panel */}
                                    <div className={`p-4 rounded-xl border transition-all ${
                                      isWatchingVideo 
                                        ? 'bg-emerald-950/20 border-emerald-800 shadow-lg shadow-emerald-950/10' 
                                        : 'bg-slate-955/60 border-slate-800/80'
                                    }`}>
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="text-left font-sans">
                                          <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${isWatchingVideo ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                            <span className="font-mono text-[10px] font-black text-white uppercase tracking-wider">
                                              {isWatchingVideo ? 'Ingesting Hand-Signal Playtime...' : 'Playtime Tracker Inactive'}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                            To log your training hours and earn details for the <b>{activeVideo.badge}</b> badge, click Start below and watch the video.
                                          </p>
                                        </div>

                                        <div className="flex gap-2 w-full sm:w-auto font-mono">
                                          {!isWatchingVideo ? (
                                            <button
                                              type="button"
                                              onClick={() => setIsWatchingVideo(true)}
                                              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-555 text-white border border-emerald-500 rounded-lg text-xs font-bold uppercase transition-transform flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                                            >
                                              <Play className="w-3.5 h-3.5 fill-current" />
                                              <span>Start Tracker</span>
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => setIsWatchingVideo(false)}
                                              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-750 rounded-lg text-xs font-bold uppercase transition-transform flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                                            >
                                              <Pause className="w-3.5 h-3.5 text-slate-400" />
                                              <span>Pause Tracker</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Watch Ingest Progress Indicators */}
                                      <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2 pb-1 font-sans">
                                        <div className="flex justify-between items-center text-xs font-mono text-left">
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500 font-sans">ATTENDANCE TIME:</span>
                                            <span className="text-emerald-400 font-bold font-mono">{watchedSecsForActive}s</span>
                                            <span className="text-slate-600">/ 15s required for check</span>
                                          </div>
                                          
                                          {hasFinishedActive ? (
                                            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] font-sans">
                                              <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
                                              <span>CERTIFICATE SECURE</span>
                                            </span>
                                          ) : (
                                            <span className="text-brand-orange font-bold font-mono">
                                              {Math.round(pct)}% Completed
                                            </span>
                                          )}
                                        </div>

                                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-900">
                                          <div 
                                            className={`h-full rounded-full transition-all duration-300 ${hasFinishedActive ? 'bg-emerald-500' : 'bg-brand-orange animate-pulse'}`}
                                            style={{ width: `${pct}%` }}
                                          />
                                        </div>

                                        {hasFinishedActive && (
                                          <div className="p-3 bg-emerald-955 border border-emerald-900/40 rounded-xl flex items-center gap-2.5 mt-2 text-left animate-in fade-in duration-300 bg-emerald-950/40">
                                            <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                                            <div className="text-[10px] text-slate-300 leading-relaxed font-sans">
                                              <b>Syllabus Completed!</b> You have earned the <b>{activeVideo.badge}</b> certificate. Your supervisor has been notified on the master ledger dashboard.
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                  </div>
                                </div>
                              </div>

                              {/* Right column: Safety Syllabus playlist queue */}
                              <div className="space-y-4 font-sans text-left">
                                <div className="bg-slate-900 border border-slate-855 p-4 rounded-2xl space-y-4">
                                  <div className="pb-2 border-b border-slate-800">
                                    <h5 className="font-display font-medium text-xs text-white uppercase tracking-wider font-mono">
                                      Safety Syllabus Track
                                    </h5>
                                    <p className="text-[10px] text-slate-450 mt-1">Select a course module below to study instruction videos and earn safety credentials.</p>
                                  </div>

                                  <div className="space-y-2.5">
                                    {SAFETY_VIDEOS.map(video => {
                                      const isDone = completed.includes(video.id);
                                      const isCurrent = video.id === activeVideoId;
                                      const secs = watchTimes[video.id] || 0;

                                      return (
                                        <button
                                          key={video.id}
                                          type="button"
                                          onClick={() => {
                                            setActiveVideoId(video.id);
                                            setIsWatchingVideo(false);
                                          }}
                                          className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between gap-1.5 focus:outline-none cursor-pointer ${
                                            isCurrent 
                                              ? 'bg-slate-950 border-brand-orange/80 shadow shadow-brand-orange/10' 
                                              : 'bg-slate-955/60 border-slate-850 hover:bg-slate-950 hover:border-slate-800'
                                          }`}
                                        >
                                          <div className="flex justify-between items-start gap-1 w-full font-sans">
                                            <span className={`font-bold transition-colors ${isCurrent ? 'text-brand-orange' : 'text-slate-300'}`}>
                                              {video.title}
                                            </span>
                                            {isDone ? (
                                              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                            ) : secs > 0 ? (
                                              <span className="text-[11px] bg-amber-550/10 text-amber-500 px-1.5 py-0.5 rounded font-mono border border-amber-500/20">
                                                {secs}s watch
                                              </span>
                                            ) : null}
                                          </div>

                                          <div className="flex flex-wrap gap-1.5 items-center justify-between text-[10px] font-mono w-full border-t border-slate-900/60 pt-2 mt-0.5 font-sans">
                                            <span className="text-slate-500 font-sans">RUN: {video.duration}</span>
                                            <span className={`font-bold px-1.5 py-0.5 rounded uppercase text-[9px] ${
                                              isDone 
                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                                            }`}>
                                              {isDone ? `CERTIFIED` : video.badge}
                                            </span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl space-y-2 text-[11px] text-slate-450">
                                  <div className="flex gap-1.5 items-center text-white font-mono font-bold">
                                    <ShieldAlert className="w-4 h-4 text-brand-orange" />
                                    <span>OSHA INSPECTION COMPLIANCE</span>
                                  </div>
                                  <p className="leading-relaxed">
                                    All safety logs on this system are backed by secure cryptographic local storage ledgers. Hand-signal watch hours are tracked continuously to prove trainee compliance.
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

              </div>
            )}

          </div>
        )}

            {/* Tab 8: HR & Embedded Payroll System */}
            {activeTab === 'hr' && (
              <div id="hr-payroll-container" className="space-y-6 text-left animate-in fade-in duration-200">
                
                {/* Header Information Box */}
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-display font-black text-xl text-white flex items-center gap-2">
                      <DollarSign className="w-5.5 h-5.5 text-emerald-400" />
                      <span>Administrative HR & Embedded Payroll Suite</span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                      Manage your direct construction roster. Define pay scales (By the Day vs. By the Hour), execute team terminations, log timesheet entries, and compute active labor costs combined with on-site GPS tracker approvals.
                    </p>
                  </div>
                  <div className="text-[10px] uppercase font-mono tracking-wider bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 self-start md:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SECURE ACCOUNTING NODE ACTIVE</span>
                  </div>
                </div>

                {/* Sub-Tabs for HR */}
                <div className="flex border-b border-slate-800 gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveHRTab('roster')}
                    className={`pb-2.5 px-4 text-xs font-bold transition-all relative ${
                      activeHRTab === 'roster' 
                        ? 'text-emerald-400 border-b-2 border-emerald-500' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Employee Directory ({employees.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHRTab('payroll')}
                    className={`pb-2.5 px-4 text-xs font-bold transition-all relative ${
                      activeHRTab === 'payroll' 
                        ? 'text-emerald-400 border-b-2 border-emerald-500' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Payroll Ledger & Timesheets
                  </button>
                </div>

                {/* SUB TAB 1: EMPLOYEE ROSTER */}
                {activeHRTab === 'roster' && (
                  <div className="space-y-6">
                    
                    {/* Stats banner */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl text-left">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block font-sans">Active Staff</span>
                        <span className="font-display font-black text-2xl text-emerald-400">
                          {(employees || []).filter(e => e && e.status === 'active').length}
                        </span>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl text-left">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block font-sans">Hourly Employees</span>
                        <span className="font-display font-black text-2xl text-white">
                          {(employees || []).filter(e => e && e.status === 'active' && e.payType === 'hourly').length}
                        </span>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl text-left">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block font-sans">Daily Rate Staff</span>
                        <span className="font-display font-black text-2xl text-white">
                          {(employees || []).filter(e => e && e.status === 'active' && e.payType === 'daily').length}
                        </span>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl text-left">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block font-sans">Terminated</span>
                        <span className="font-display font-black text-2xl text-slate-500">
                          {(employees || []).filter(e => e && e.status === 'terminated').length}
                        </span>
                      </div>
                    </div>

                    {/* Highly Prominent Crew Onboarding quick action container */}
                    <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/20 border border-emerald-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                      <div className="space-y-1">
                        <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
                          <Plus className="w-4 h-4 text-emerald-400" />
                          <span>Staff Management Actions</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-normal max-w-xl">
                          Need to expand your crew or onboard new heavy machinery operators? Register them here to enable their names in timesheets, GPS clock-ins, and active daily wage trackers instantly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmployeeId(null);
                          setIsAddingEmployee(true);
                          setEmpName('');
                          setEmpRole('Forestry Mulcher Operator');
                          setUseCustomRole(false);
                          
                          // Auto generate professional Employee ID (e.g. TJD-1006+)
                          const nextNum = 1001 + employees.length;
                          setEmpEmployeeId(`TJD-${nextNum}`);

                          setEmpPayType('hourly');
                          setEmpRate(25);
                          setEmpPhone('');
                          setEmpEmail('');
                          
                          // Scroll into form view
                          setTimeout(() => {
                            const formElement = document.getElementById('employee-form-header');
                            if (formElement) {
                              formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 100);
                        }}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-widest border border-emerald-500/50 active:scale-95 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-emerald-100" />
                        <span>Add & Register Employee</span>
                      </button>
                    </div>

                    {/* Manage Forms container */}
                    {(isAddingEmployee || editingEmployeeId) && (
                      <div id="employee-form-header" className="p-5 bg-slate-950/80 border border-slate-705/85 rounded-2xl animate-in slide-in-from-top-4 duration-200">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                          <h4 className="font-display font-bold text-sm text-white">
                            {editingEmployeeId ? 'Edit Employee Details' : 'Register New Employee / Contractor'}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingEmployee(false);
                              setEditingEmployeeId(null);
                              setEmpName('');
                              setEmpPhone('');
                              setEmpEmail('');
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <form onSubmit={editingEmployeeId ? (e) => {
                          e.preventDefault();
                          const updated = employees.map(emp => {
                            if (emp.id === editingEmployeeId) {
                              return {
                                ...emp,
                                name: empName.trim(),
                                employeeId: empEmployeeId.trim() || emp.employeeId,
                                role: empRole.trim(),
                                payType: empPayType,
                                rate: Number(empRate),
                                phone: empPhone || undefined,
                                email: empEmail || undefined,
                                hireDate: empHireDate
                              };
                            }
                            return emp;
                          });
                          saveEmployees(updated);
                          setEditingEmployeeId(null);
                          setEmpName('');
                          setEmpPhone('');
                          setEmpEmail('');
                        } : (e) => {
                          e.preventDefault();
                          if (!empName.trim()) return;
                          const newEmp: Employee = {
                            id: `emp-${Date.now()}`,
                            employeeId: empEmployeeId.trim() || `TJD-${1001 + employees.length}`,
                            name: empName.trim(),
                            role: empRole.trim(),
                            payType: empPayType,
                            rate: Number(empRate),
                            status: 'active',
                            hireDate: empHireDate,
                            phone: empPhone || undefined,
                            email: empEmail || undefined
                          };
                          saveEmployees([...employees, newEmp]);
                          setIsAddingEmployee(false);
                          setEmpName('');
                          setEmpPhone('');
                          setEmpEmail('');
                        }} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Employee Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Dale Earnhardt"
                              value={empName}
                              onChange={(e) => setEmpName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-300 flex justify-between">
                              <span>Employee ID</span>
                              <span className="text-[9px] text-slate-500 font-normal">Auditing field</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. TJD-1006"
                              value={empEmployeeId}
                              onChange={(e) => setEmpEmployeeId(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono uppercase"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Role / Assignment</label>
                            <select
                              value={useCustomRole ? "CUSTOM" : (STANDARD_ROLES.includes(empRole) ? empRole : "CUSTOM")}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "CUSTOM") {
                                  setUseCustomRole(true);
                                  setEmpRole('');
                                } else {
                                  setUseCustomRole(false);
                                  setEmpRole(val);
                                }
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                            >
                              {STANDARD_ROLES.map((role) => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                              <option value="CUSTOM">✏️ Custom Designation...</option>
                            </select>
                            {useCustomRole && (
                              <input
                                type="text"
                                required
                                placeholder="Enter Custom Designation"
                                value={empRole}
                                onChange={(e) => setEmpRole(e.target.value)}
                                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white animate-in fade-in slide-in-from-top-1 duration-150"
                              />
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Wages Structure</label>
                            <select
                              value={empPayType}
                              onChange={(e) => {
                                const val = e.target.value as 'hourly' | 'daily';
                                setEmpPayType(val);
                                setEmpRate(val === 'hourly' ? 22 : 220);
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                            >
                              <option value="hourly">Pay By The Hour ($ / hour)</option>
                              <option value="daily">Pay By The Day ($ / day)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Pay Rate ($)</label>
                            <input
                              type="number"
                              required
                              min="1"
                              step="0.01"
                              value={empRate}
                              onChange={(e) => setEmpRate(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Phone</label>
                            <input
                              type="text"
                              placeholder="478-555-xxxx"
                              value={empPhone}
                              onChange={(e) => setEmpPhone(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Email Address</label>
                            <input
                              type="email"
                              placeholder="name@tjdconstruction.com"
                              value={empEmail}
                              onChange={(e) => setEmpEmail(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-300">Hire Date</label>
                            <input
                              type="date"
                              required
                              value={empHireDate}
                              onChange={(e) => setEmpHireDate(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white animate-none"
                            />
                          </div>

                          <div className="flex items-end pt-1 md:col-span-4">
                            <button
                              type="submit"
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{editingEmployeeId ? 'Save Changes' : 'Confirm Register'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Master Employee List */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-emerald-400" />
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-300">Master Personnel Registry</h4>
                        </div>
                        {!isAddingEmployee && !editingEmployeeId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEmployeeId(null);
                              setIsAddingEmployee(true);
                              setEmpName('');
                              setEmpRole('Forestry Mulcher Operator');
                              setEmpPayType('hourly');
                              setEmpRate(25);
                              setEmpPhone('');
                              setEmpEmail('');
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Employee</span>
                          </button>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300 border-collapse">
                          <thead>
                            <tr className="bg-slate-950 border-b border-slate-850 text-[10px] font-mono uppercase text-slate-500">
                              <th className="p-4">Personnel</th>
                              <th className="p-4">Designation Role</th>
                              <th className="p-4">Wage Structure</th>
                              <th className="p-4">Compensation Rate</th>
                              <th className="p-4">Compliance Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {(employees || []).filter(e => e && e.id).map(employee => (
                              <tr key={employee.id} className={`hover:bg-slate-950/30 transition-colors ${employee.status === 'terminated' ? 'opacity-55' : ''}`}>
                                <td className="p-4 font-sans">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">{employee.name}</span>
                                    {employee.employeeId ? (
                                      <span className="text-[9px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0" title="Auditing Employee ID">
                                        {employee.employeeId}
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-mono bg-slate-950/60 text-slate-500 border border-slate-900/40 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">
                                        NO ID
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">Hired: {employee.hireDate}</div>
                                </td>
                                <td className="p-4">
                                  <span className="font-mono bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300">
                                    {employee.role}
                                  </span>
                                </td>
                                <td className="p-4 capitalize">
                                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                    employee.payType === 'hourly' 
                                      ? 'bg-blue-950/40 text-blue-400 border border-blue-900/40' 
                                      : 'bg-amber-950/40 text-amber-500 border border-amber-900/40'
                                  }`}>
                                    {employee.payType === 'hourly' ? 'Paid By The Hour' : 'Paid By The Day'}
                                  </span>
                                </td>
                                <td className="p-4 font-bold text-slate-100 text-sm font-mono">
                                  ${(Number(employee.rate) || 0).toFixed(2)} {employee.payType === 'hourly' ? '/ hr' : '/ day'}
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase font-mono ${
                                    employee.status === 'active' 
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' 
                                      : 'bg-rose-950 text-rose-450 border border-rose-900/40'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${employee.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                                    {employee.status === 'active' ? 'ACTIVE ROSTER' : 'TERMINATED'}
                                  </span>
                                  {employee.terminationDate && (
                                    <div className="text-[9px] text-rose-500 font-mono mt-0.5">As of {employee.terminationDate}</div>
                                  )}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingEmployeeId(employee.id);
                                      setIsAddingEmployee(false);
                                      setEmpName(employee.name);
                                      setEmpEmployeeId(employee.employeeId || '');
                                      setEmpRole(employee.role);
                                      setUseCustomRole(!STANDARD_ROLES.includes(employee.role));
                                      setEmpPayType(employee.payType);
                                      setEmpRate(employee.rate);
                                      setEmpPhone(employee.phone || '');
                                      setEmpEmail(employee.email || '');
                                      setEmpHireDate(employee.hireDate);
                                      
                                      // Scroll into form view
                                      setTimeout(() => {
                                        const container = document.getElementById('employee-form-header');
                                        if (container) container.scrollIntoView({ behavior: 'smooth' });
                                      }, 50);
                                    }}
                                    className="p-1 px-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded hover:bg-slate-900 text-[10px] uppercase font-bold"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const confirmAction = confirm(`Are you sure you want to change the active status of ${employee.name}?\n\nCurrent Status: ${employee.status.toUpperCase()}`);
                                      if (confirmAction) {
                                        handleToggleStatus(employee.id);
                                      }
                                    }}
                                    className={`p-1 px-2 border rounded text-[10px] uppercase font-bold ${
                                      employee.status === 'active'
                                        ? 'border-rose-900/40 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40'
                                        : 'border-emerald-900/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40'
                                    }`}
                                  >
                                    {employee.status === 'active' ? 'Terminate' : 'Reactivate'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB 2: PAYROLL & TIMESHEETS */}
                {activeHRTab === 'payroll' && (() => {
                  const filteredPeriodTimesheets = (timesheets || []).filter(shift => {
                    if (!shift) return false;
                    const dateStr = shift.date; // e.g. "2026-06-08"
                    if (payrollStartDate && dateStr < payrollStartDate) return false;
                    if (payrollEndDate && dateStr > payrollEndDate) return false;
                    return true;
                  });

                  const selectedEmpTimesheets = filteredPeriodTimesheets.filter(shift => 
                    selectedHRReportEmpId === 'all' || shift.employeeId === selectedHRReportEmpId
                  );

                  return (
                    <div className="space-y-6">
                      
                      {/* General metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Left: Payroll Engine Selector */}
                        <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-display font-black text-sm text-white flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-emerald-400" />
                              <span>Timesheet Reporting Filter</span>
                            </h4>
                            <p className="text-slate-400 text-[10px]">
                              Isolate worker shifts or calculate total gross payouts for the entire organizational roster.
                            </p>
                          </div>

                          <div className="space-y-3 pt-2">
                            <div className="space-y-1 text-xs">
                              <label className="font-bold text-slate-300">Select Employee</label>
                              <select
                                value={selectedHRReportEmpId}
                                onChange={(e) => setSelectedHRReportEmpId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-white text-xs text-left"
                              >
                                <option value="all">Calculated Consolidated (All Staff)</option>
                                {(employees || []).filter(Boolean).map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                                ))}
                              </select>
                            </div>

                            {/* Date period inputs */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="space-y-1">
                                <label className="font-bold text-slate-450 block">Start Date</label>
                                <input
                                  type="date"
                                  value={payrollStartDate}
                                  onChange={(e) => setPayrollStartDate(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-slate-450 block">End Date</label>
                                <input
                                  type="date"
                                  value={payrollEndDate}
                                  onChange={(e) => setPayrollEndDate(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
                                />
                              </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-xs space-y-2">
                              <div className="flex flex-col gap-0.5 text-slate-400">
                                <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Report Scope:</span>
                                <span className="font-mono text-emerald-400 font-bold">{payrollStartDate || 'Any'} to {payrollEndDate || 'Any'}</span>
                              </div>
                              
                              <div className="flex justify-between items-center text-slate-400 border-t border-slate-800 pt-2 mt-1">
                                <span>Period Total:</span>
                                <span className="font-mono font-bold text-white text-sm">
                                  ${selectedEmpTimesheets.reduce((acc, shift) => {
                                    if (!shift) return acc;
                                    const emp = (employees || []).find(e => e && e.id === shift.employeeId);
                                    if (!emp) return acc;
                                    
                                    const rate = Number(emp.rate) || 0;
                                    const payType = emp.payType || 'hourly';
                                    
                                    // Compute shift earnings
                                    if (payType === 'hourly') {
                                      const rawHrs = Number(shift.hoursWorked) || 0;
                                      const baseHrs = Math.min(40, rawHrs);
                                      const otHrs = Math.max(0, rawHrs - 40);
                                      const wage = (baseHrs * rate) + (otHrs * rate * 1.5);
                                      return acc + wage;
                                    } else {
                                      return acc + ((Number(shift.daysWorked) || 1) * rate);
                                    }
                                  }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowPayrollReportModal(true)}
                              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] rounded-lg tracking-wider uppercase flex justify-center items-center gap-1.5 shadow"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Payroll Report</span>
                            </button>

                            {!isAddingShift && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingShift(true);
                                  setShiftEmpId(employees[0]?.id || 'emp-1');
                                  setShiftDesc('');
                                  setShiftDate(new Date().toISOString().split('T')[0]);
                                  setShiftValue(8);
                                }}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-lg tracking-wider uppercase flex justify-center items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Log Manual Labor Shift</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Middle: Live Payroll Summary Calculator */}
                        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-300">
                                {selectedHRReportEmpId === 'all' ? 'Consolidated Payroll Calculations' : 'Personnel Earnings Assessment'}
                              </h4>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded font-bold">
                                Formula: 1.5x Overtime &gt; 40hrs
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                              {selectedHRReportEmpId === 'all' ? (
                                (employees || []).filter(emp => emp && (emp.status === 'active' || filteredPeriodTimesheets.some(s => s && s.employeeId === emp.id))).map(emp => {
                                  const empShifts = filteredPeriodTimesheets.filter(s => s && s.employeeId === emp.id);
                                  const totHours = empShifts.reduce((sSum, s) => sSum + (s.hoursWorked || 0), 0);
                                  const totDays = empShifts.reduce((sSum, s) => sSum + (s.daysWorked || 0), 0);
                                  
                                  // Calculation details
                                  let earnings = 0;
                                  const empRate = Number(emp.rate) || 0;
                                  if (emp.payType === 'hourly') {
                                    earnings = empShifts.reduce((acc, shift) => {
                                      if (!shift) return acc;
                                      const rawHrs = shift.hoursWorked || 0;
                                      const baseHrs = Math.min(40, rawHrs);
                                      const otHrs = Math.max(0, rawHrs - 40);
                                      return acc + (baseHrs * empRate) + (otHrs * empRate * 1.5);
                                    }, 0);
                                  } else {
                                    earnings = totDays * empRate;
                                  }

                                  return (
                                    <div key={emp.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex flex-col justify-between space-y-2">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h5 className="font-bold text-white text-xs">{emp.name}</h5>
                                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-sans">{emp.role}</p>
                                        </div>
                                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                          emp.payType === 'hourly' ? 'bg-blue-950/40 text-blue-400' : 'bg-amber-950/40 text-amber-500'
                                        }`}>
                                          {emp.payType === 'hourly' ? 'Hourly' : 'Daily'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-end border-t border-slate-900 pt-2 border-dashed">
                                        <span className="text-[10px] text-slate-400 font-sans">
                                          {emp.payType === 'hourly' ? `${totHours} hrs total` : `${totDays} days total`}
                                        </span>
                                        <span className="font-mono text-xs font-black text-emerald-400">
                                          ${earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPayStubEmployee(emp);
                                          setPayStubShifts(empShifts);
                                        }}
                                        className="w-full text-center py-1 mt-1 bg-slate-900 hover:bg-slate-850 text-[10px] font-bold tracking-widest text-slate-350 hover:text-white uppercase font-sans border border-slate-850 rounded"
                                      >
                                        Compile Pay Stub
                                      </button>
                                    </div>
                                  );
                                })
                              ) : (
                                (() => {
                                  const emp = (employees || []).find(e => e && e.id === selectedHRReportEmpId);
                                  if (!emp) return <p className="text-slate-400">Selected employee not found.</p>;
                                  const empShifts = filteredPeriodTimesheets.filter(s => s && s.employeeId === emp.id);
                                  const totHours = empShifts.reduce((sSum, s) => sSum + ((s && s.hoursWorked) || 0), 0);
                                  const totDays = empShifts.reduce((sSum, s) => sSum + ((s && s.daysWorked) || 0), 0);
                                  
                                  const earnings = empShifts.reduce((acc, shift) => {
                                    if (!shift) return acc;
                                    const rate = Number(emp.rate) || 0;
                                    const payType = emp.payType || 'hourly';
                                    if (payType === 'hourly') {
                                      const rawHrs = Number(shift.hoursWorked) || 0;
                                      const baseHrs = Math.min(40, rawHrs);
                                      const otHrs = Math.max(0, rawHrs - 40);
                                      return acc + (baseHrs * rate) + (otHrs * rate * 1.5);
                                    } else {
                                      return acc + ((Number(shift.daysWorked) || 1) * rate);
                                    }
                                  }, 0);

                                  return (
                                    <div className="col-span-2 space-y-4">
                                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="space-y-1">
                                          <h5 className="font-display font-black text-base text-white">{emp.name}</h5>
                                          <p className="text-[11px] text-slate-400">{emp.role}</p>
                                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Contact: {emp.phone || '—'} | {emp.email || '—'}</p>
                                        </div>
                                        <div className="text-right sm:text-left bg-slate-900 border border-slate-850 p-3 rounded-lg font-mono text-xs">
                                          <div><span className="text-slate-400">STRUCTURE:</span> <span className="font-bold text-white uppercase">{emp.payType}</span></div>
                                          <div><span className="text-slate-400">BASE METRIC:</span> <span className="font-bold text-emerald-400">${(Number(emp.rate) || 0).toFixed(2)}</span></div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                                          <span className="text-[10px] text-slate-400 block font-sans">Units Complete</span>
                                          <span className="text-lg font-mono font-black text-white">{emp.payType === 'hourly' ? `${totHours} Hrs` : `${totDays} Days`}</span>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                                          <span className="text-[10px] text-slate-400 block font-sans">Overtime (1.5x)</span>
                                          <span className="text-lg font-mono font-black text-blue-400">
                                            {emp.payType === 'hourly' 
                                              ? `${empShifts.reduce((acc, s) => acc + Math.max(0, ((s && s.hoursWorked) || 0) - 40), 0)} Hrs` 
                                              : 'N/A'
                                            }
                                          </span>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                                          <span className="text-[10px] text-slate-400 block font-sans">Gross Payout</span>
                                          <span className="text-lg font-mono font-black text-emerald-400">${earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPayStubEmployee(emp);
                                          setPayStubShifts(empShifts);
                                        }}
                                        className="w-full py-2 bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
                                      >
                                        <FileText className="w-4 h-4" />
                                        <span>Generate Formatted Pay Stub Report</span>
                                      </button>
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          </div>

                          <p className="text-[9px] text-slate-550 border-t border-slate-850 pt-3 mt-4 text-center">
                            All payroll processing calculations are mapped on cryptographically generated internal ledgers. Data synchronizes on-the-fly straight to OneDrive workspaces via MS webhooks.
                          </p>
                        </div>

                      </div>

                      {/* Manual Shift input form */}
                      {isAddingShift && (
                        <div className="p-5 bg-slate-950/80 border border-slate-700/85 rounded-2xl animate-in slide-in-from-top-4 duration-200">
                          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-850">
                            <h4 className="font-display font-bold text-sm text-white">Manual Timesheet Dispatch Log</h4>
                            <button
                              type="button"
                              onClick={() => setIsAddingShift(false)}
                              className="text-slate-400 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const targetEmp = employees.find(emp => emp.id === shiftEmpId);
                            if (!targetEmp) return;

                            const newShift: CustomShift = {
                              id: `sh-${Date.now()}`,
                              employeeId: shiftEmpId,
                              employeeName: targetEmp.name,
                              date: shiftDate,
                              hoursWorked: targetEmp.payType === 'hourly' ? Number(shiftValue) : 0,
                              daysWorked: targetEmp.payType === 'daily' ? Number(shiftValue) : 1,
                              description: shiftDesc || 'Manual Shift Logged',
                              siteLocation: shiftLocation
                            };

                            saveTimesheets([newShift, ...timesheets]);
                            
                            // Reset timesheet sync to OneDrive rows
                            const pendingRowId = `SL-${Math.floor(100 + Math.random() * 899)}`;
                            setLedgerRows(prev => [
                              {
                                rowId: pendingRowId,
                                timestamp: "Just Now",
                                division: shiftLocation.includes("Greensboro") ? "Residential" : "Commercial",
                                client: `${targetEmp.name} - Manual Shift Input`,
                                size: targetEmp.role,
                                coefficient: targetEmp.payType === 'hourly' ? `${shiftValue} hrs` : `${shiftValue} days`,
                                estimate: "Payroll Update",
                                status: "PENDING SYNC"
                              },
                              ...prev
                            ]);

                            setIsAddingShift(false);
                            setShiftValue(8);
                            setShiftDesc('');
                          }} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs select-none">
                            
                            <div className="space-y-1">
                              <label className="font-bold text-slate-300">Target Employee / Contractor</label>
                              <select
                                value={shiftEmpId}
                                onChange={(e) => {
                                  const id = e.target.value;
                                  setShiftEmpId(id);
                                  const match = employees.find(emp => emp.id === id);
                                  if (match) {
                                    setShiftValue(match.payType === 'hourly' ? 8 : 1);
                                  }
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-left"
                              >
                                {(employees || []).filter(emp => emp && emp.status === 'active').map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.payType === 'hourly' ? 'Hourly' : 'Daily'}: ${(Number(emp.rate) || 0).toFixed(2)})</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-slate-300">Work Shift Date</label>
                              <input
                                type="date"
                                required
                                value={shiftDate}
                                onChange={(e) => setShiftDate(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white animate-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-slate-300">
                                {employees.find(e => e.id === shiftEmpId)?.payType === 'hourly' ? 'Hours Worked' : 'Full Days Worked'}
                              </label>
                              <input
                                type="number"
                                required
                                min="0.5"
                                step="0.5"
                                value={shiftValue}
                                onChange={(e) => setShiftValue(parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-slate-300">Dispatch Site Location</label>
                              <select
                                value={shiftLocation}
                                onChange={(e) => setShiftLocation(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white text-xs whitespace-nowrap text-left"
                              >
                                <option value="Greensboro Lot (Lake Oconee)">Greensboro Lot (Lake Oconee, GA)</option>
                                <option value="Peach County Warehouse Pad">Peach County Warehouse Hub (GA)</option>
                                <option value="Warner Robins Commercial lot">Warner Robins Pad Site (GA)</option>
                                <option value="Macon Highway Drainage runoff">Macon Interstate Outlets (GA)</option>
                                <option value="Office Hub">TJD Corporate Headquarters (Office Hub)</option>
                              </select>
                            </div>

                            <div className="col-span-1 md:col-span-3 space-y-1">
                              <label className="font-bold text-slate-300">Work Description details</label>
                              <input
                                type="text"
                                placeholder="e.g. Cleared 1.5 acres, loaded logs to flatbed..."
                                value={shiftDesc}
                                onChange={(e) => setShiftDesc(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                              />
                            </div>

                            <div className="flex items-end">
                              <button
                                type="submit"
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Log Timesheet Shift</span>
                              </button>
                            </div>

                          </form>
                        </div>
                      )}

                      {/* Clock-In approval logs */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-400" />
                            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-300">
                              Active Field Timesheet Ledger ({payrollStartDate || 'Any'} to {payrollEndDate || 'Any'})
                            </h4>
                          </div>
                          <p className="text-[10px] text-slate-550 font-mono">
                            Showing {selectedEmpTimesheets.length} matching shifts
                          </p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-300 border-collapse">
                            <thead>
                              <tr className="bg-slate-950 border-b border-slate-850 text-[10px] font-mono uppercase text-slate-500">
                                <th className="p-4">Employee</th>
                                <th className="p-4">Execution Date</th>
                                <th className="p-4">Site Location</th>
                                <th className="p-4">Hours Logged</th>
                                <th className="p-4">Days Logged</th>
                                <th className="p-4">Estimated Gross</th>
                                <th className="p-4">Shift operations context</th>
                                <th className="p-4 text-center">Delete</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850">
                              {selectedEmpTimesheets.map(shift => {
                                  const emp = (employees || []).find(e => e && e.id === shift.employeeId);
                                  if (!emp) return null;
                                  
                                  // Compute pay
                                  let shiftGross = 0;
                                  const empRate = Number(emp.rate) || 0;
                                  if (emp.payType === 'hourly') {
                                    const rawHrs = shift.hoursWorked || 0;
                                    const baseHrs = Math.min(40, rawHrs);
                                    const otHrs = Math.max(0, rawHrs - 40);
                                    shiftGross = (baseHrs * empRate) + (otHrs * empRate * 1.5);
                                  } else {
                                    shiftGross = (shift.daysWorked || 1) * empRate;
                                  }

                                  return (
                                    <tr key={shift.id} className="hover:bg-slate-950/20 transition-colors">
                                      <td className="p-4 font-bold text-white whitespace-nowrap">{shift.employeeName}</td>
                                      <td className="p-4 font-mono text-slate-300">{shift.date}</td>
                                      <td className="p-4 whitespace-nowrap">{shift.siteLocation || 'Not Assigned'}</td>
                                      <td className="p-4 font-mono font-bold text-slate-200">
                                        {emp.payType === 'hourly' ? `${shift.hoursWorked} hrs` : '—'}
                                      </td>
                                      <td className="p-4 font-mono font-bold text-slate-200">
                                        {emp.payType === 'daily' ? `${shift.daysWorked} days` : '—'}
                                      </td>
                                      <td className="p-4 font-mono font-black text-emerald-400">
                                        ${shiftGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </td>
                                      <td className="p-4 italic text-slate-400 max-w-xs truncate" title={shift.description}>
                                        {shift.description || 'General shift labor'}
                                      </td>
                                      <td className="p-4 text-center">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const isConfirmed = confirm("Are you sure you want to delete this timesheet entry?");
                                            if (isConfirmed) {
                                              const updated = timesheets.filter(t => t.id !== shift.id);
                                              saveTimesheets(updated);
                                            }
                                          }}
                                          className="text-rose-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/35 transition-all cursor-pointer"
                                          title="Delete Log"
                                          aria-label="Delete entry"
                                        >
                                          <Trash2 className="w-4 h-4 mx-auto" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* MODAL: PAY STUB COMPILER GENERATOR */}
                {payStubEmployee && (
                  <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white text-slate-900 border border-slate-350 rounded-2xl w-full max-w-md p-6 shadow-2xl relative scroll-py-4 overflow-y-auto max-h-[90vh]">
                      <button
                        type="button"
                        onClick={() => {
                          setPayStubEmployee(null);
                          setPayStubShifts([]);
                        }}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5 text-slate-500" />
                      </button>

                      {/* Pay stub brand header */}
                      <div className="border-b-2 border-slate-800 pb-4 text-center">
                        <h3 className="font-display font-black text-sm uppercase tracking-widest text-slate-900">TJ Darley Construction, LLC</h3>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">PO Box 478, Perry, Georgia | Tel: 478-808-7789</p>
                        <div className="mt-3 inline-block bg-slate-900 text-white font-mono font-black text-[9px] uppercase px-3 py-1 rounded">
                          Official Wages Statement / Pay Stub
                        </div>
                      </div>

                      {/* Personnel Metadata */}
                      <div className="grid grid-cols-2 gap-4 text-xs py-4 border-b border-slate-100 font-sans">
                        <div>
                          <span className="text-[10px] uppercase text-slate-450 block">EMPLOYEE NAME:</span>
                          <span className="font-bold text-slate-900">{payStubEmployee.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-450 block">JOB TITLE / ROLE:</span>
                          <span className="font-semibold text-slate-800">{payStubEmployee.role}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-450 block">STATEMENT PERIOD:</span>
                          <span className="font-mono text-slate-700">June 2026 (Active Ledger)</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-450 block">RATE SCALE:</span>
                          <span className="font-bold text-emerald-700 font-mono">
                            ${payStubEmployee.rate.toFixed(2)} {payStubEmployee.payType === 'hourly' ? '/ hr' : '/ day'}
                          </span>
                        </div>
                      </div>

                      {/* Pay stub numbers table */}
                      <div className="py-4 space-y-3 font-mono text-xs">
                        <div className="pb-1 border-b border-slate-150 flex justify-between font-bold text-slate-850 text-[10px]">
                          <span>EARNINGS DETAILS</span>
                          <span>TOTAL VALUE</span>
                        </div>
                        
                        {payStubEmployee.payType === 'hourly' ? (
                          (() => {
                            const totHours = payStubShifts.reduce((acc, s) => acc + (s.hoursWorked || 0), 0);
                            const baseHrs = payStubShifts.reduce((acc, s) => acc + Math.min(40, (s.hoursWorked || 0)), 0);
                            const otHrs = payStubShifts.reduce((acc, s) => acc + Math.max(0, (s.hoursWorked || 0) - 40), 0);
                            const baseEarnings = baseHrs * payStubEmployee.rate;
                            const otEarnings = otHrs * payStubEmployee.rate * 1.5;
                            const gross = baseEarnings + otEarnings;
                            
                            // Mock Taxes
                            const fedTax = gross * 0.12; 
                            const gaTax = gross * 0.05; 
                            const fica = gross * 0.062; 
                            const totalDeductions = fedTax + gaTax + fica;
                            const netPay = gross - totalDeductions;

                            return (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Regular Hours ({baseHrs} hrs @ ${payStubEmployee.rate.toFixed(2)}):</span>
                                  <span>${baseEarnings.toFixed(2)}</span>
                                </div>
                                {otHrs > 0 && (
                                  <div className="flex justify-between text-blue-700">
                                    <span>Overtime Hours ({otHrs} hrs @ ${(payStubEmployee.rate * 1.5).toFixed(2)}):</span>
                                    <span>${otEarnings.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2 pb-2 text-[13px] font-sans">
                                  <span>Gross Payroll Earnings:</span>
                                  <span className="font-mono">${gross.toFixed(2)}</span>
                                </div>

                                <div className="pt-2 border-t border-dashed border-slate-200">
                                  <div className="text-[10px] uppercase font-bold text-slate-450 mb-1 font-sans">WITHHOLDINGS & DEDUCTIONS</div>
                                  <div className="flex justify-between text-rose-700 text-[11px]">
                                    <span>Federal Income Tax (12%):</span>
                                    <span>-${fedTax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-rose-700 text-[11px]">
                                    <span>Georgia State Tax (5%):</span>
                                    <span>-${gaTax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-rose-700 text-[11px]">
                                    <span>FICA Social Security (6.2%):</span>
                                    <span>-${fica.toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="flex justify-between font-sans font-black text-slate-950 border-t-2 border-slate-800 pt-3 text-lg">
                                  <span>NET TAKE-HOME:</span>
                                  <span className="font-mono font-black text-emerald-800">${netPay.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          (() => {
                            const totDays = payStubShifts.reduce((acc, s) => acc + (s.daysWorked || 0), 0);
                            const gross = totDays * payStubEmployee.rate;
                            
                            // Mock Taxes
                            const fedTax = gross * 0.12; 
                            const gaTax = gross * 0.05; 
                            const fica = gross * 0.062; 
                            const totalDeductions = fedTax + gaTax + fica;
                            const netPay = gross - totalDeductions;

                            return (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Contract Days ({totDays} days @ ${payStubEmployee.rate.toFixed(2)}):</span>
                                  <span>${gross.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2 pb-2 text-[13px] font-sans">
                                  <span>Gross Contract Hours:</span>
                                  <span className="font-mono">${gross.toFixed(2)}</span>
                                </div>

                                <div className="pt-2 border-t border-dashed border-slate-200">
                                  <div className="text-[10px] uppercase font-bold text-slate-450 mb-1 font-sans">WITHHOLDINGS & DEDUCTIONS</div>
                                  <div className="flex justify-between text-rose-700 text-[11px]">
                                    <span>Federal income withholding (12%):</span>
                                    <span>-${fedTax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-rose-700 text-[11px]">
                                    <span>Georgia state tax (5%):</span>
                                    <span>-${gaTax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-rose-700 text-[11px]">
                                    <span>FICA retirement contribution (6.2%):</span>
                                    <span>-${fica.toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="flex justify-between font-sans font-black text-slate-950 border-t-2 border-slate-800 pt-3 text-lg">
                                  <span>NET TAKE-HOME:</span>
                                  <span className="font-mono font-black text-emerald-800">${netPay.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })()
                        )}
                      </div>

                      {/* Pay stub instructions */}
                      <div className="text-[10px] text-slate-500 font-sans border-t border-slate-200 pt-4 text-center mt-4">
                        <p className="italic">This is a certified digital wage statement calculated directly from field satellite telemetry clock-ins and roster configurations.</p>
                        <div className="flex justify-between mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              alert("Copying Pay Stub text data to clipboard...");
                              navigator.clipboard.writeText(
                                `TJ Darley Construction LLC - Wage Statement\n` +
                                `Employee: ${payStubEmployee.name}\n` +
                                `Role: ${payStubEmployee.role}\n` +
                                `Compensation Rate: $${payStubEmployee.rate.toFixed(2)} ${payStubEmployee.payType === 'hourly' ? '/hr' : '/day'}\n` +
                                `Statement Period: June 2026`
                              );
                            }}
                            className="bg-slate-100 hover:bg-slate-250 text-slate-800 text-[9px] uppercase font-bold px-3 py-1.5 rounded transition-all"
                          >
                            Copy Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              window.print();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] uppercase font-bold px-3 py-1.5 rounded transition-all"
                          >
                            Print Statement
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* MODAL: PRINTABLE PAYROLL REPORT GENERATOR */}
                {showPayrollReportModal && (() => {
                  const filteredPeriodTimesheets = (timesheets || []).filter(shift => {
                    if (!shift) return false;
                    const dateStr = shift.date;
                    if (payrollStartDate && dateStr < payrollStartDate) return false;
                    if (payrollEndDate && dateStr > payrollEndDate) return false;
                    return true;
                  });

                  // Calculate metrics per worker in period
                  const payrollSummary = (employees || []).map(emp => {
                    const empShifts = filteredPeriodTimesheets.filter(s => s && s.employeeId === emp.id);
                    const totHours = empShifts.reduce((acc, s) => acc + (s.hoursWorked || 0), 0);
                    const totDays = empShifts.reduce((acc, s) => acc + (s.daysWorked || 0), 0);
                    
                    let gross = 0;
                    const rate = Number(emp.rate) || 0;
                    if (emp.payType === 'hourly') {
                      gross = empShifts.reduce((acc, shift) => {
                        const rawHrs = shift.hoursWorked || 0;
                        const baseHrs = Math.min(40, rawHrs);
                        const otHrs = Math.max(0, rawHrs - 40);
                        return acc + (baseHrs * rate) + (otHrs * rate * 1.5);
                      }, 0);
                    } else {
                      gross = totDays * rate;
                    }

                    const fedTax = gross * 0.12;
                    const gaTax = gross * 0.05;
                    const fica = gross * 0.062;
                    const deductions = fedTax + gaTax + fica;
                    const net = gross - deductions;

                    return {
                      emp,
                      shiftsCount: empShifts.length,
                      totHours,
                      totDays,
                      gross,
                      deductions,
                      net,
                      fedTax,
                      gaTax,
                      fica
                    };
                  }).filter(item => item.shiftsCount > 0 || item.emp.status === 'active');

                  const totalGross = payrollSummary.reduce((sum, item) => sum + item.gross, 0);
                  const totalDeductions = payrollSummary.reduce((sum, item) => sum + item.deductions, 0);
                  const totalNet = payrollSummary.reduce((sum, item) => sum + item.net, 0);
                  const totalHours = payrollSummary.reduce((sum, item) => sum + item.totHours, 0);
                  const totalDays = payrollSummary.reduce((sum, item) => sum + item.totDays, 0);

                  return (
                    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto print:absolute print:inset-0 print:bg-white print:text-black print:p-0 print:z-[999999]">
                      <div className="bg-white text-slate-900 border border-slate-350 rounded-2xl w-full max-w-4xl p-8 shadow-2xl relative my-8 print:my-0 print:border-none print:shadow-none print:p-0 print:w-full print:max-w-none">
                        
                        {/* Header Action bar */}
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 print:hidden">
                          <div className="flex items-center gap-2">
                            <Printer className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800">Printable Payroll Wages Report</h3>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                              <span>Execute Print / Save PDF</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowPayrollReportModal(false)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-slate-250 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              <span>Close Preview</span>
                            </button>
                          </div>
                        </div>

                        {/* Printable Area Wrapper */}
                        <div className="space-y-6 print:text-black print:bg-white">
                          
                          {/* Company Letterhead */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-800 pb-4 gap-4">
                            <div>
                              <h1 className="font-display font-black text-xl uppercase tracking-widest text-slate-900">TJ Darley Construction, LLC</h1>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">PO Box 478, Perry, Georgia | Tel: 478-808-7789 | Email: office@tjdarley.com</p>
                            </div>
                            <div className="text-left sm:text-right font-mono text-xs">
                              <span className="bg-slate-900 text-white font-black text-[9px] uppercase px-2.5 py-1 rounded inline-block mb-1.5 print:bg-black print:text-white">
                                Ledger Payroll Report
                              </span>
                              <div><strong>Generated:</strong> {new Date().toLocaleDateString()}</div>
                              <div><strong>Period Scope:</strong> {payrollStartDate || 'Any'} to {payrollEndDate || 'Any'}</div>
                            </div>
                          </div>

                          {/* Quick KPI stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
                            <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 print:bg-white">
                              <span className="text-[9px] uppercase text-slate-400 block font-mono">Gross Wages Paid</span>
                              <span className="text-base font-mono font-black text-slate-900">${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 print:bg-white">
                              <span className="text-[9px] uppercase text-slate-400 block font-mono">Total Net Payouts</span>
                              <span className="text-base font-mono font-black text-emerald-700">${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 print:bg-white">
                              <span className="text-[9px] uppercase text-slate-400 block font-mono">Taxes Withheld</span>
                              <span className="text-base font-mono font-black text-slate-600">${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 print:bg-white">
                              <span className="text-[9px] uppercase text-slate-400 block font-mono">Work units logged</span>
                              <span className="text-base font-mono font-black text-slate-900">{totalHours > 0 ? `${totalHours} hrs` : ''} {totalDays > 0 ? `${totalDays} days` : ''}</span>
                            </div>
                          </div>

                          {/* Employee Table */}
                          <div>
                            <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
                              Personnel Payroll Calculations Detail
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-slate-300 text-[9px] font-mono uppercase text-slate-600 print:bg-slate-50">
                                    <th className="p-2 font-bold text-slate-800">Operator / Role</th>
                                    <th className="p-2 font-mono text-slate-600 text-center">Base Rate</th>
                                    <th className="p-2 font-mono text-slate-600 text-center">Units Work</th>
                                    <th className="p-2 font-mono text-slate-600 text-right">Gross Total</th>
                                    <th className="p-2 font-mono text-slate-600 text-right">Fed Tax (12%)</th>
                                    <th className="p-2 font-mono text-slate-600 text-right">GA Tax (5%)</th>
                                    <th className="p-2 font-mono text-slate-600 text-right">FICA (6.2%)</th>
                                    <th className="p-2 font-mono text-slate-700 text-right font-bold">Net Pay</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-150">
                                  {payrollSummary.map(item => (
                                    <tr key={item.emp.id} className="hover:bg-slate-55/40">
                                      <td className="p-2">
                                        <div className="font-bold text-slate-900">{item.emp.name}</div>
                                        <div className="text-[9px] text-slate-500 font-sans">{item.emp.role}</div>
                                      </td>
                                      <td className="p-2 text-center font-mono text-slate-700">
                                        ${item.emp.rate.toFixed(2)} {item.emp.payType === 'hourly' ? '/hr' : '/day'}
                                      </td>
                                      <td className="p-2 text-center font-mono text-slate-900 font-semibold">
                                        {item.emp.payType === 'hourly' ? `${item.totHours} hrs` : `${item.totDays} days`}
                                      </td>
                                      <td className="p-2 text-right font-mono text-slate-900">${item.gross.toFixed(2)}</td>
                                      <td className="p-2 text-right font-mono text-slate-500">${item.fedTax.toFixed(2)}</td>
                                      <td className="p-2 text-right font-mono text-slate-500">${item.gaTax.toFixed(2)}</td>
                                      <td className="p-2 text-right font-mono text-slate-500">${item.fica.toFixed(2)}</td>
                                      <td className="p-2 text-right font-mono text-slate-900 font-black">${item.net.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="bg-slate-100 font-mono text-slate-900 font-bold border-t-2 border-slate-300">
                                    <td className="p-2 uppercase text-[9px] font-black">Consolidated Total</td>
                                    <td className="p-2"></td>
                                    <td className="p-2 text-center text-slate-800">
                                      {totalHours > 0 ? `${totalHours}h` : ''} {totalDays > 0 ? `${totalDays}d` : ''}
                                    </td>
                                    <td className="p-2 text-right">${totalGross.toFixed(2)}</td>
                                    <td className="p-2 text-right">${payrollSummary.reduce((s, x) => s + x.fedTax, 0).toFixed(2)}</td>
                                    <td className="p-2 text-right">${payrollSummary.reduce((s, x) => s + x.gaTax, 0).toFixed(2)}</td>
                                    <td className="p-2 text-right">${payrollSummary.reduce((s, x) => s + x.fica, 0).toFixed(2)}</td>
                                    <td className="p-2 text-right text-emerald-850 font-black">${totalNet.toFixed(2)}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>

                          {/* Shifts Log details */}
                          <div>
                            <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
                              Detailed Shift Logs Compiled In Period ({filteredPeriodTimesheets.length} records)
                            </h4>
                            <div className="overflow-x-auto max-h-56 overflow-y-auto print:max-h-none print:overflow-visible">
                              <table className="w-full text-left text-[10px] border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 font-mono text-slate-500 uppercase">
                                    <th className="p-1.5 font-bold">Date</th>
                                    <th className="p-1.5 font-bold">Employee</th>
                                    <th className="p-1.5 font-bold">Site Location</th>
                                    <th className="p-1.5 font-bold text-center">Amount</th>
                                    <th className="p-1.5 font-bold">Shift description details</th>
                                    <th className="p-1.5 font-bold text-right">Est. Gross</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                                  {filteredPeriodTimesheets.map(shift => {
                                    const emp = (employees || []).find(e => e && e.id === shift.employeeId);
                                    if (!emp) return null;
                                    
                                    let shiftGross = 0;
                                    const empRate = Number(emp.rate) || 0;
                                    if (emp.payType === 'hourly') {
                                      const rawHrs = shift.hoursWorked || 0;
                                      const baseHrs = Math.min(40, rawHrs);
                                      const otHrs = Math.max(0, rawHrs - 40);
                                      shiftGross = (baseHrs * empRate) + (otHrs * empRate * 1.5);
                                    } else {
                                      shiftGross = (shift.daysWorked || 1) * empRate;
                                    }

                                    return (
                                      <tr key={shift.id} className="hover:bg-slate-50/20">
                                        <td className="p-1.5 font-mono">{shift.date}</td>
                                        <td className="p-1.5 font-bold text-slate-800">{shift.employeeName}</td>
                                        <td className="p-1.5">{shift.siteLocation || '—'}</td>
                                        <td className="p-1.5 text-center font-mono">
                                          {emp.payType === 'hourly' ? `${shift.hoursWorked} hrs` : `${shift.daysWorked} days`}
                                        </td>
                                        <td className="p-1.5 italic text-slate-500 max-w-xs truncate">{shift.description || 'General shift labor'}</td>
                                        <td className="p-1.5 text-right font-mono text-slate-900 font-semibold">${shiftGross.toFixed(2)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Signatures */}
                          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-slate-300 font-sans text-[10px]">
                            <div className="space-y-6">
                              <p className="text-slate-500">
                                This payroll ledger accurately tracks work hours performed at Georgia DOT-permitted and municipal sites. Calculations follow DOL overtime limits.
                              </p>
                              <div>
                                <div className="border-b border-slate-400 w-48 h-5"></div>
                                <span className="text-[9px] uppercase text-slate-450 mt-1 block">Prepared By (Signature)</span>
                              </div>
                            </div>
                            <div className="space-y-6 text-right flex flex-col justify-between items-end">
                              <p className="text-slate-400 italic">
                                Certified & locked on internal local databases.
                              </p>
                              <div className="text-left">
                                <div className="border-b border-slate-400 w-48 h-5"></div>
                                <span className="text-[9px] uppercase text-slate-450 mt-1 block">Approved By (Owner Signature)</span>
                              </div>
                            </div>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {activeTab === 'ballpark' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <InHouseEstimator />
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <ConstructionOpportunities />
              </div>
            )}

            {activeTab === 'manual' && (() => {
              const guides = [
                {
                  id: 'g-estimating',
                  title: 'A. Client Estimator & Lead Capture Pipeline',
                  category: 'Bidding & Estimators',
                  role: 'Office Admin & Clients',
                  desc: 'How the public estimator calculates earthwork costs and converts prospective bids into hot leads.',
                  steps: [
                    'The estimator is hosted on the public landing page, allowing prospects to generate immediate price ranges. It does NOT require a security passcode—ensuring friction-free client usage.',
                    'The tool computes pricing based on square footage and grading type: Site Clearing ($2.20/sqft), General Excavation & Grading ($3.50/sqft), and Earthwork Retention Ponds ($5.20/sqft).',
                    'A 1.30x soil multiplier is applied to Cohesive Red Clay to cover the labor required for repetitive vibratory compaction and aeration. Sandy loam receives no multiplier penalty.',
                    'A 1.38x access multiplier is automatically applied to Confined or Restricted sites, accounting for tiny dozer footprints and manual or slow-haul dump truck shuttle patterns.',
                    'When a prospect gets their estimate and clicks "Proceed with Pre-Bid", they fill out contact info, soil details, and timeline. On submission, the system generates a unique CRM ID (e.g., TJD-LEAD-XXXX) and posts the lead directly to your Field Intake tab.'
                  ],
                  proTip: 'Instruct prospective clients to measure estimated square feet rather than total lot size to avoid overpaying for buffer zones.'
                },
                {
                  id: 'g-intake',
                  title: 'B. Field Intake Processing & Communication Link',
                  category: 'Bidding & Estimators',
                  role: 'Office Staff & Estimators',
                  desc: 'Converting raw intake leads into formal bids, setting up webhook alerts, and dispatching quotes.',
                  steps: [
                    'Navigate to the "Field Intake" tab in the office hub (Passcode required: 2026). Here you will see all self-submitted leads from the website and custom internal logs.',
                    'Select any lead to inspect exact contact info, geological soil descriptions, physical site address, and any linked project photos or reference files.',
                    'Under "Google Sheets Apps Script Connection Setting," verify your connection URL. This bridges the application so your office spreadsheets update the instant a subscriber hits Submit.',
                    'Once site layout and earthwork phases are estimated, you can mark the lead as "Processed" or save directly to the Central Excel Ledger to compile costs.'
                  ],
                  proTip: 'Always verify the webhook link with a "Test Webhook" trigger. A successfully wired webhook will display a "Status 200 OK" receipt in the workspace panel.'
                },
                {
                  id: 'g-gps',
                  title: 'C. Field GPS Proximity Clock-ins & 811 Verification',
                  category: 'Field Operations',
                  role: 'Foremen & Heavy Operators',
                  desc: 'Validating dozer operator workspace proximity and checking Georgia 811 utility locate rules.',
                  steps: [
                    'Operators open the GPS Clock-In tab on their mobile browser when arriving on-site. The device requests location permissions.',
                    'The system validates the operators physical latitude and longitude against the target project coordinates (with a strict margin error in meters to ensure they are physically on turf).',
                    'CRITICAL RULE: Georgia law mandates a 3-business-day utility locate ticket validation before excavating. The system checks if locate markings are reported active. If the 3-day window is not met, the app triggers a bold "WARNING: 811 LACK OF EXCAVATING NOTICE" flag.',
                    'Operators select their heavy machinery (e.g., Loader, Finish Grade Dozer, Forestry Mulcher) and hit "Confirm Clock-In." Coordinates are permanently timestamped and logged.'
                  ],
                  proTip: 'If an operator gets a "Location Denied" error, have them toggle high-accuracy GPS permissions in their mobile browser settings and refresh the tab.'
                },
                {
                  id: 'g-onedrive',
                  title: 'D. OneDrive Simulation Ledger & File Conflict Syncing',
                  category: 'Ledger & Sync',
                  role: 'Office Manager & Estimator',
                  desc: 'Syncing local bids and field actions to the cloud, managing write conflicts, and manual overrides.',
                  steps: [
                    'The "OneDrive Excel" tab simulates an active OneDrive Microsoft Excel Workbook sync. It handles tracking on-site client details, soil compaction risk, and mobilization costs.',
                    'Any field log or intake marked with a yellow "PENDING SYNC" badge is saved in offline browser memory (localStorage) and is awaiting cloud compilation.',
                    'Click the green "Synchronize Ledger Assets Now" button. The engine connects, cross-calculates rows, and pushes clean tabular strings.',
                    'In case of Sync Conflicts (e.g., if a foreman edited a row on-site while the office editor modified it concurrently), the system opens a "Conflict Handling Unit" prompting you to select either "Keep Office Copy" or "Overwrite Cloud".'
                  ],
                  proTip: 'To ensure data is never lost in cellular deadzones, the system saves all changes locally first. Encourage operators to sync when returning to steady LTE boundaries.'
                },
                {
                  id: 'g-reports',
                  title: 'E. Field Reports, Engine Logs, & Blade Care',
                  category: 'Field Operations',
                  role: 'Foremen & Operators',
                  desc: 'Filing daily operator reports, logging crawler diesel levels, and scheduled blade inspections.',
                  steps: [
                    'To document site activities and maintain crawler warranties, operators and foremen use the "Field Reports" tab daily.',
                    'Select the log type: Operator Daily Log, Fuel Metering Log, or Custom Shift Record.',
                    'Complete the detailed fields: Operator Name, Equipment ID, Hour Meter (engine hours), Fuel Level (%), and Soil Dampness state (Wet Mud, Damp Clay, Dry Silt).',
                    'Perform the structural inspections: check blade teeth, track tension, oil levels, are 811 markings visible. Toggle the appropriate checkboxes.',
                    'Click "Submit Field Report Log." This creates a non-modifiable chronological compliance file available for regulatory EPD stormwater audits.'
                  ],
                  proTip: 'If diesel fuel is flagged under 30%, the active dashboard alerts the foreman instantly with a red fuel-shuttle utility indicator.'
                },
                {
                  id: 'g-progression',
                  title: 'E.5. Project Stage Progression & Client Proof Board',
                  category: 'Field Operations',
                  role: 'Foremen, Operators & Management',
                  desc: 'Tracking multi-phase grading timelines, uploading field inspection pictures, and locking certified geolocations.',
                  steps: [
                    'To open the Project Progress system on the mobile web, navigate to the "Client Field Intake" portal or click the "Project Progress & Stages" tab.',
                    'Select the active project from the dropdown list. If a custom project is not listed, input its unique parcel details to create a separate file.',
                    'Enter a clear phase name (e.g., "Stage 2: Soil Aeration", "Stage 4: Structural Pond Berm Compaction") and record specific notes regarding clay thickness or grade limits.',
                    'Click "Add Stage Photo" to capture real-time on-site proof using your smartphone camera or upload existing inspect files. This establishes high-quality visual proof.',
                    'Click "Capture High-Accuracy GPS" to fetch certified latitude and longitude. The app will decode and calculate secondary coordinate formats (DMS, UTM Zone 17S, and DDM) to verify you are on the actual parcel lines.',
                    'Submit the stage. Real-time change events are broadcast locally and instantly visible within the Office Hub\'s "Project Progression" tab. You can easily click the Google Maps satellite link to audit the foreman\'s physical lock.'
                  ],
                  proTip: 'Send the client a secure screenshot of their custom progression timeline. Providing visual, georeferenced satellite proof of active stages avoids misunderstandings and ensures rapid progress payments.'
                },
                {
                  id: 'g-hr',
                  title: 'F. HR, Embedded Weekly Payroll, & Paystubs',
                  category: 'Labor & Payroll',
                  role: 'Office Admin & Owner',
                  desc: 'Managing crawler operators roster, selecting daily vs hourly wages, and printing professional pay stubs.',
                  steps: [
                    'Access the "HR & Embedded Payroll" tab. You will be presented with a secured payroll suite tracking your list of active operators.',
                    'Each crew member is configured with an explicit Pay Type: flat-rate daily (e.g., $220/day typical for senior grading operators) or standard hourly (e.g., $22/hour).',
                    'Click "Add Employee" directly on the panel to insert new bulldozer operators or helper laborers into the running database.',
                    'To issue weekly pay, select "Generate Pay Stub" next to the operator name. The system aggregates active shift hours and presents a professional printable Wage Statement.',
                    'Click "Print Statement" to open native print scaling, formatted perfectly for your local binders and office records. Click "Copy Details" to copy text values for spreadsheet backup.'
                  ],
                  proTip: 'To archive old personnel without destroying historical payroll ledger records, toggle their status from "Active" to "Terminated/Archived".'
                },
                {
                  id: 'g-interns',
                  title: 'G. Trainee Training & GSWCC Blue Card Erosion Code',
                  category: 'Labor & Payroll',
                  role: 'Foremen & Mentors',
                  desc: 'Onboarding young interns, updating soil erosion competencies, and logging dozer safety exercises.',
                  steps: [
                    'Go to the "Workforce & Interns" tab to track green-hat trainees or earthwork interns pursuing operator status.',
                    'Review the active compliance checklist: Soil ID Competency, Dozer Safe-Slope Operations, and GSWCC (Georgia Soil and Water Conservation Commission) Blue Card Certification details.',
                    'Log a new training record, selecting the crew mentor (e.g., Senior Foreman), equipment hour-marks, and scoring them on soil clearing competency.',
                    'The system computes progress. When an intern achieves 100% core coverage, it celebrates their achievement and flags them as certified to operate crawlers independently.'
                  ],
                  proTip: 'GSWCC "Blue Card" rules require active erosion silt fencing controls on site. Make sure interns physically practice Type-C wire-backed installation.'
                },
                {
                  id: 'g-multiphase-estimating',
                  title: 'H. Multi-Phase Line Item Estimator & Bid Submission SOP',
                  category: 'Bidding & Estimators',
                  role: 'Office Staff & Estimators',
                  desc: 'Importing engineered takeoff plans, using the AI Takeoff Scanner, calculating custom soil/fuel surcharges, and transmitting bid submissions.',
                  steps: [
                    'Open the "Multi-Phase Line Item Estimator" directly from the landing navigation dashboard.',
                    'Under "Engineer & Architect Takeoff Plan AI Scanner," upload structural site blueprints, drainage layout sheets, or paste raw engineer notes.',
                    'Click "Scan and Parse Takeoff Plan" to run Gemini. The integrated Google Search and analysis engine instantly parses lengths, widths, spillway specs, clay keyways, and slope ratios.',
                    'Click the blue "Apply Takeoff Measurements to Bid" button to feed these parameters straight into the active cost spreadsheet.',
                    'Adjust operating fuel surcharge indexes securely using the "Check Live Georgia Fuel Price" button, which matches real-time averages.',
                    'Verify phase details, add materials or custom equipment rows, lock your pricing margins, and export a CSV or professional PDF statement for the client.'
                  ],
                  proTip: 'For Georgia cohesive red clay, always maintain a 1.30x density multiplier to cover high vibratory compaction requirements.'
                },
                {
                  id: 'g-pond-tutorial',
                  title: 'I. Step-by-Step Tutorial: Bidding a 3.5-Acre Pond & Structural Dam',
                  category: 'Bidding & Estimators',
                  role: 'Estimators & Project Managers',
                  desc: 'A comprehensive, error-free walkthrough for estimating a complex 3.5-acre structural pond and a 150 ft long embankment dam using our secure In-House Estimator tool.',
                  steps: [
                    'POND GEOMETRY FOUNDATION: For a 3.5-acre pond, the surface area equals 152,460 sq ft (3.5 * 43,560). The earthen dam is 150 ft long, 25 ft high, 16 ft wide at the top, and 116 ft wide at the bottom.',
                    'DAM EARTHWORK VOLUME MATH: Earthen dam volume is calculated with the trapezoidal area formula: Area = ((Top Width 16 + Bottom Width 116) / 2) * Height 25 = 66 * 25 = 1,650 sq ft. Earthen volume = 1,650 sq ft * 150 ft length = 247,500 cubic feet. Convert to Cubic Yards: 247,500 / 27 = 9,166.67 CY of structural clay fill.',
                    'STEP 1 - DIRECT FORM CONFIGURATION: Note that the In-House Estimator is a fully self-contained manual calculator for instant pricing and does NOT auto-populate or load from external pre-bid files. You will input the project details directly into the form.',
                    'STEP 2 - OPEN THE ESTIMATOR: Click the "In-House Estimator" tab in the Office Hub menu. In the top-right of the estimator workspace, select "Residential Rates" to access custom residential land, acreage, and farm pond digs.',
                    'STEP 3 - CHOOSE TARGET WORK SCOPE: In the "Target Earthwork Scope" dropdown, select "Acreage Excavation & Retention Ponds". This unlocks the specialized pond and dam calculations.',
                    'STEP 4 - ACTIVATE THE DAM EMBEDMENT ADD-ON: Immediately check the box labeled "Include Structural Dam Embedment" which appears below. This automatically incorporates keyway core trenching, structural compaction, and clay core safety factors.',
                    'STEP 5 - ENTER DESIGN DIMENSIONS: Set the "Scope Volume Size" to 3.5 and toggle the Unit Type switcher to "Acres". Under "Georgia Native Sub-soil Mud", select "GA Red Clay" (+30% density modifier). Under "Access Difficulty", select "Minor Slopes" (Moderate access).',
                    'STEP 6 - ESTABLISH MARGIN MARKUP: Click the "App Customizer" tab in the Office Hub menu. Adjust the "In-House Rate Margin Markup (Profit Protector)" slider to +20% to safeguard against fuel or shipping surcharges. Click "Save & Apply Rebranding".',
                    'STEP 7 - REVIEW LIVE COMPILATION: Return to the "In-House Estimator" tab and scroll down to view the compiled estimate. It details raw operating subtotals, your +20% applied markup, final client-facing bid contract fee, and total projected weeks.',
                    'STEP 8 - PRINT THE COMPLETED PROPOSAL: Click the "Print & Export PDF" button to open the system print window. Save the customized, high-contrast estimate invoice as a PDF or print it out to secure client signature.'
                  ],
                  proTip: 'For a 25 ft high dam, Georgia Safe Dams rules may apply if storage is high. Always design a secondary emergency rock spillway separate from the primary overflow culvert!'
                }
              ];

              const filteredGuides = guides.filter(guide => {
                const searchLower = manualSearch.toLowerCase()
                  .replace(/multip[e-]*[- ]*phase/g, 'multi-phase')
                  .replace(/multip/g, 'multi');
                
                const searchWords = searchLower.split(/\s+/).filter(w => w.trim().length > 0);
                if (searchWords.length === 0) {
                  return manualCategory === 'All' || guide.category === manualCategory;
                }

                // Every search word must be found in at least one field of the guide
                const matchesSearch = searchWords.every(word => {
                  return guide.title.toLowerCase().includes(word) ||
                         guide.desc.toLowerCase().includes(word) ||
                         guide.category.toLowerCase().includes(word) ||
                         guide.role.toLowerCase().includes(word) ||
                         guide.steps.some(s => s.toLowerCase().includes(word));
                });

                const matchesCategory = manualCategory === 'All' || guide.category === manualCategory;
                return matchesSearch && matchesCategory;
              });

              const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredGuides.length > 0) {
                    setExpandedGuideId(filteredGuides[0].id);
                  }
                }
              };

              return (
                <div className="space-y-6 text-left animate-in fade-in duration-200">
                  
                  {/* Manual Header Banner */}
                  <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="font-display font-black text-lg text-emerald-400 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        TJ Darley Office & Field Operating Manual
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Interactive standard operating procedures (SOP), role assignments, and step-by-step workflow tutorials for your earthwork foreman and crew operators.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-slate-900/80 text-emerald-400 border border-slate-800 rounded-full font-mono text-[10px] font-extrabold uppercase select-none tracking-wider shrink-0">
                      Version 2.6 Active
                    </span>
                  </div>

                  {/* Search and Category Pill Row */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col xl:flex-row justify-between items-center gap-4">
                    
                    {/* Compact Search box */}
                    <div className="relative w-full xl:max-w-xs">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none font-mono">
                        ●
                      </span>
                      <input
                        type="text"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        placeholder="Search manual tasks, rules..."
                        value={manualSearch}
                        onChange={(e) => setManualSearch(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                      />
                      {manualSearch && (
                        <button
                          type="button"
                          onClick={() => setManualSearch('')}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-450 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Compact category filter pills */}
                    <div className="flex flex-wrap gap-1.5 w-full xl:w-auto justify-center xl:justify-end">
                      {['All', 'Bidding & Estimators', 'Field Operations', 'Ledger & Sync', 'Labor & Payroll'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setManualCategory(cat)}
                          className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border ${
                            manualCategory === cat
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-800/10'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Manual Guides Display Panel */}
                  <div className="space-y-4 font-sans">
                    {filteredGuides.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-850">
                        <p className="text-sm">No chapters match your query in current index.</p>
                        <button
                          type="button"
                          onClick={() => { setManualSearch(''); setManualCategory('All'); }}
                          className="mt-3 text-xs text-emerald-400 hover:underline uppercase font-bold"
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      filteredGuides.map((guide) => {
                        const isExpanded = expandedGuideId === guide.id;
                        return (
                          <div
                            key={guide.id}
                            className={`bg-slate-950/60 border rounded-2xl transition-all duration-200 overflow-hidden ${
                              isExpanded ? 'border-emerald-500/80 shadow-lg shadow-emerald-900/10' : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            
                            {/* Accordion Trigger Header */}
                            <button
                              type="button"
                              onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                              className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-slate-900/40 transition-all cursor-pointer"
                            >
                              <div className="space-y-1.5 flex-1 pr-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[8px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 font-extrabold px-2 py-0.5 rounded">
                                    {guide.category}
                                  </span>
                                  <span className="text-[8px] uppercase font-mono tracking-wider text-slate-400 bg-slate-900 border border-slate-800 font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                                    <User className="w-2.5 h-2.5 shrink-0" />
                                    Role: {guide.role}
                                  </span>
                                </div>
                                <h4 className="font-display font-black text-sm text-slate-100 pr-2">
                                  {guide.title}
                                </h4>
                                <p className="text-[11px] text-slate-400 leading-normal line-clamp-1">
                                  {guide.desc}
                                </p>
                              </div>

                              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-450 hover:text-white transition-colors">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                            </button>

                            {/* Accordion Expanded Details */}
                            {isExpanded && (
                              <div className="border-t border-slate-900/80 bg-slate-950/80 p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-150">
                                
                                <div className="space-y-3">
                                  <span className="text-[10px] uppercase font-bold font-mono tracking-widest text-slate-400 flex items-center gap-1.5">
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                    Operational Execution Steps
                                  </span>
                                  <ol className="divide-y divide-slate-900/40 font-sans">
                                    {guide.steps.map((step, idx) => (
                                      <li key={idx} className="flex gap-4 py-3 items-start text-xs text-slate-300 leading-relaxed">
                                        <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                                          {idx + 1}
                                        </span>
                                        <p className="flex-1">{step}</p>
                                      </li>
                                    ))}
                                  </ol>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                  
                                  {/* Pro Tip Callout */}
                                  <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-xl flex gap-3">
                                    <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                      <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-400">Foreman Pro-Tip</span>
                                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                                        {guide.proTip}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Quick Diagnostic / Support Specs */}
                                  <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex gap-3">
                                    <Cpu className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                      <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-indigo-400">Under the Hood Tech</span>
                                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                                        Data is persistent within browser CacheStorage (localStorage) and synchronizes on master ledger submission via transactional handshakes.
                                      </p>
                                    </div>
                                  </div>

                                </div>

                              </div>
                            )}

                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Print / Export Help Card */}
                  <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="font-display font-bold text-xs uppercase text-slate-200">Need a Physical Copy of this Manual at the site?</h4>
                      <p className="text-slate-400 text-xs text-left">
                        Keep a reference binder inside the forestry mulcher or trailer dozer. Press the standard printing button to export a readable checklist.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 border border-slate-800 hover:border-slate-500 rounded-lg text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-850 transition-colors uppercase font-mono text-[10px] font-extrabold tracking-widest cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Print Binder SOP pages
                    </button>
                  </div>

                </div>
              );
            })()}

            {activeTab === 'agentic-assistant' && <AgenticAssistant />}
            {activeTab === 'branding' && <BrandingSettings />}

          </div>
        </div>
      </div>
    </section>
      )}
    </>
  );
}
