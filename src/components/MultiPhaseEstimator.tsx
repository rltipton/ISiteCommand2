/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  ChevronRight, 
  Calculator, 
  HelpCircle, 
  Layers, 
  Compass, 
  TrendingUp, 
  ArrowLeft, 
  Printer, 
  Briefcase, 
  Scale, 
  Settings, 
  Sliders, 
  CheckCircle, 
  DollarSign, 
  Truck, 
  FolderPlus,
  Send,
  UserCheck,
  Building,
  HardHat,
  Award,
  Database,
  ArrowRight,
  ClipboardList,
  Users,
  Edit,
  Sparkles,
  Upload,
  FileText,
  Check,
  Loader2,
  Save,
  Download,
  AlertCircle,
  FolderSync,
  Fuel,
  Clock,
  Timer,
  Ruler,
  Boxes
} from 'lucide-react';
import { getWebhookUrl } from '../utils';

export function calculateConcreteCuringStats(
  lengthFt: number,
  widthFt: number,
  thicknessInches: number,
  elementType: string = 'House Pad / Commercial Slab (6")',
  psiGrade: string = '3,500 PSI High-Early'
) {
  const len = Math.max(1, Number(lengthFt) || 0);
  const wid = Math.max(1, Number(widthFt) || 0);
  const thick = Math.max(1, Number(thicknessInches) || 0);

  // Volume in Cubic Yards = (Length * Width * (Thickness / 12)) / 27
  const volumeCuYds = Math.round(((len * wid * (thick / 12)) / 27) * 10) / 10;

  // Base curing days based on thickness
  let baseCureDays = 7;
  if (thick <= 4) baseCureDays = 7;
  else if (thick <= 6) baseCureDays = 10;
  else if (thick <= 8) baseCureDays = 14;
  else if (thick <= 12) baseCureDays = 21;
  else baseCureDays = 28;

  // High volume mass concrete adjustment
  if (volumeCuYds > 20) {
    baseCureDays += Math.min(7, Math.ceil((volumeCuYds - 20) / 15));
  }

  // High-early mix factor (accelerated hydration)
  if (psiGrade.includes('High-Early') || psiGrade.includes('4,000')) {
    baseCureDays = Math.max(5, Math.round(baseCureDays * 0.8));
  }

  const footTrafficDays = Math.max(2, Math.round(baseCureDays * 0.4));
  const fullStrengthDays = 28;

  return {
    volumeCuYds,
    cureDays: baseCureDays,
    footTrafficDays,
    fullStrengthDays,
    summaryText: `${thick}" thick concrete pour (${len}' x ${wid}', ~${volumeCuYds} Cu Yds) requires ${baseCureDays} calendar days curing buffer.`
  };
}

export const subPhaseToTemplateMap: Record<string, 'A' | 'B' | 'C' | 'D'> = {
  "Heavy Equipment Fleet Mobilization & Site Transport (UTV)": 'B',
  "Jobsite General Conditions (Sanitary Facilities, Insurance & Permits)": 'D',
  "Forestry Mulching & Brush Clearing": 'B',
  "Perimeter Silt Fence Erosion Controls": 'B',
  "Construction Entrance Rock Setup": 'D',
  "Organic Topsoil Stripping & Stockpiling": 'B',
  "Rock Stratum Obstruction Jackhammering": 'A',
  "Organic Stump Grubbing & Removal": 'B',
  "Deep Clay Core Keyway Trench Excavation": 'A',
  "Water Overflow HDPE Piping Installation": 'D',
  "Mass Excavation, Pond Basin Shaping & Dam Structural Fill": 'A',
  "Structured Compacted House Clay Pad Build": 'C',
  "Structural Foundation Trench excavation": 'C',
  "Crowned Gravel Driveway Construction": 'D',
  "Subgrade Geotextile Fabric Laying": 'D',
  "Surge Stone Stabilizing Base Layer": 'D',
  "Transit Motor Grader Leveling & Crown Profile": 'D',
  "Silt Retaining Basin Spillway Rocks Rip-Rap": 'A',
  "Topsoil Dressing & Seeding Stabilization": 'B',
};

export interface PlmInfoSpec {
  phase: string;
  name: string;
  template: string;
  equipment: { name: string; formula: string; rateKey: string; defaultRate: number; explain: string }[];
  crew: { name: string; formula: string; rateKey: string; defaultRate: number; explain: string }[];
  materials: { name: string; formula: string; rateKey: string; defaultRate: number; unit: string; explain: string }[];
  checklist: string[];
}

export const plmSubPhaseSpecs: Record<string, PlmInfoSpec> = {
  "Heavy Equipment Fleet Mobilization & Site Transport (UTV)": {
    phase: "Phase 1 - Preliminary Site Prep",
    name: "Heavy Equipment Fleet Mobilization & Site Transport (UTV)",
    template: "Template B (Heavy Equipment Run)",
    equipment: [
      { name: "Heavy Commercial Equipment Lowboy Fleet Transport", formula: "1 (Flat Fee Lowboy Transit)", rateKey: "lowboy_mobilization_rate", defaultRate: 650, explain: "Heavy lowboy haulers transporting excavators, dozers, and compactors." },
      { name: "Site Mobilization 4x4 UTV (Rapid Tool Trailer & Supply Transport)", formula: "Max(8, Days * 8)", rateKey: "utv_support_rate", defaultRate: 25, explain: "4x4 Utility Transport Vehicle dedicated for rapid field runs to mobile tool trailer, parts, fuel cans, and site hardware." }
    ],
    crew: [
      { name: "Mobilization & Tool Trailer Field Logistics Specialist", formula: "Max(8, Days * 8)", rateKey: "foreman_rate", defaultRate: 65, explain: "Coordinates lowboy unloading, mobile tool trailer staging, and UTV field support." }
    ],
    materials: [
      { name: "Mobilization Fuel & Tool Trailer Consumables Package", formula: "1 (Flat Package)", rateKey: "mob_consumables_flat", defaultRate: 250, unit: "Package", explain: "UTV gasoline, chain lube, tie-downs, tool trailer spares, and safety gear." }
    ],
    checklist: [
      "Verify site entrance gates and lowboy haul route clearance",
      "Stage mobile tool trailer in central, elevated, well-drained location",
      "Deploy 4x4 UTV for site logistics, operator field runs, and rapid tool acquisition",
      "Conduct safety walkaround and machine pre-operation inspection"
    ]
  },
  "Jobsite General Conditions (Sanitary Facilities, Insurance & Permits)": {
    phase: "Phase 1 - Preliminary Site Prep",
    name: "Jobsite General Conditions (Sanitary Facilities, Insurance & Permits)",
    template: "Template D (Materials & Infrastructure)",
    equipment: [],
    crew: [
      { name: "Site Safety & Quality Compliance Officer / Inspector", formula: "Max(8, Days * 2)", rateKey: "foreman_rate", defaultRate: 65, explain: "Conducts weekly safety toolbox talks, OSHA compliance, and site security oversight." }
    ],
    materials: [
      { name: "Sanitary Facilities (Portable Restroom & Weekly Pump-out Service)", formula: "Math.ceil(Days / 30) * 1", rateKey: "sanitary_facility_monthly_rate", defaultRate: 220, unit: "Months", explain: "OSHA-mandated portable restroom rental, hand sanitizing station, and weekly service." },
      { name: "Commercial General Liability & Equipment Inland Marine Insurance Allowance", formula: "1 (Flat Fee / Job)", rateKey: "insurance_allowance_flat", defaultRate: 450, unit: "Project Fee", explain: "Project-allocated commercial insurance premium, inland marine heavy equipment rider, and certificate of insurance issuance." },
      { name: "Municipal Land Disturbance Permit & Erosion Inspection Fees", formula: "1 (Flat Permit Fee)", rateKey: "permit_fees_flat", defaultRate: 350, unit: "Permit Fee", explain: "Local county land disturbance permit, NPDES Notice of Intent (NOI) filing, and engineering inspection fees." },
      { name: "Temporary Jobsite Utilities (Portable Generator Power & Water Connections)", formula: "Math.ceil(Days / 30) * 1", rateKey: "temp_utilities_monthly_rate", defaultRate: 280, unit: "Months", explain: "Quiet diesel generator power, site fuel tank secondary containment, and jobsite water supply connections." }
    ],
    checklist: [
      "Deliver and anchor portable restroom unit in safe, accessible, non-traffic area",
      "Issue Certificate of Insurance (COI) naming Project Owner / General Contractor as additional insured",
      "Post Municipal Land Disturbance Permit and NPDES Erosion Control placards at site entrance",
      "Verify 811 Georgia Utility Location Ticket is active and all marked utilities are daylighted"
    ]
  },
  "Forestry Mulching & Brush Clearing": {
    phase: "Phase 1 - Preliminary Site Prep",
    name: "Forestry Mulching & Brush Clearing",
    template: "Template B (Heavy Equipment Run)",
    equipment: [
      { name: "Cat 299D3 Forestry Mulcher", formula: "Max(6, Acres * 7.5 * Soil * Access)", rateKey: "mulcher_rate", defaultRate: 245, explain: "Calculates the necessary mulching runtime needed to grind hard wood debris." },
      { name: "Cat D5 tracked Dozer with root rake", formula: "Max(4, Acres * 4)", rateKey: "dozer_rate", defaultRate: 195, explain: "Required to push brush piles and consolidate pine slash piles." }
    ],
    crew: [
      { name: "Heavy Tree chainsaw operator", formula: "Max(8, Acres * 6)", rateKey: "chainsaw_rate", defaultRate: 48, explain: "Required for manually clearing boundary lines and overhanging branches." }
    ],
    materials: [
      { name: "Hauling & Stump Processing Debris disposal", formula: "Acres * 1.5 Loads", rateKey: "hauling_flat_rate", defaultRate: 320, unit: "Truck Loads", explain: "For high-volume waste container hauling out to local processing." }
    ],
    checklist: [
      "Walk the jobsite boundary line to identify neighbor buffers",
      "Check the mulcher cutting teeth for dullness or chips",
      "Confirm off-road diesel tanker mobilization window"
    ]
  },
  "Perimeter Silt Fence Erosion Controls": {
    phase: "Phase 1 - Preliminary Site Prep",
    name: "Perimeter Silt Fence Erosion Controls",
    template: "Template B (Heavy Equipment Run)",
    equipment: [
      { name: "Mini Excavator / Skid Steer with offset trencher", formula: "Max(4, Fence Length * 0.015)", rateKey: "excavator_5t_rate", defaultRate: 125, explain: "Excavates the required retention toe-in ditch." }
    ],
    crew: [
      { name: "Erosion control installer team", formula: "Max(8, Fence Length * 0.04)", rateKey: "ground_support_rate", defaultRate: 48, explain: "Maintains manual post driving and silt fabric pinning." }
    ],
    materials: [
      { name: "Silt Fence Rolls with oak stakes", formula: "Fence Length / 100", rateKey: "silt_fence_roll_cost", defaultRate: 185, unit: "Rolls", explain: "Commercial grade robust geotextile with stakes." }
    ],
    checklist: [
      "Walk low elevation runoff paths and map ditch line",
      "Ensure silt fence is buried standard 6 inches deep in the trench",
      "Place safety markers on corners for grading dozer operators"
    ]
  },
  "Construction Entrance Rock Setup": {
    phase: "Phase 1 - Preliminary Site Prep",
    name: "Construction Entrance Rock Setup",
    template: "Template D (Materials & Infrastructure)",
    equipment: [
      { name: "Cat Compact Track Loader", formula: "6 Hours (Flat)", rateKey: "excavator_5t_rate", defaultRate: 145, explain: "Spreads and compacts high-surge stones." }
    ],
    crew: [
      { name: "Ground support installer", formula: "6 Hours (Flat)", rateKey: "ground_support_rate", defaultRate: 42, explain: "Secures filtration geotextile and aligns stone edges." }
    ],
    materials: [
      { name: "Georgia High-Surge Granite Ballast/Aggregates", formula: "Length * 0.15 (Min 18 Tons)", rateKey: "granite_ballast_per_ton", defaultRate: 42, unit: "Tons", explain: "High-surge ballast aggregate prevents road mud tracking." },
      { name: "Woven Geotextile filtration fabric (12.5ft x 100ft)", formula: "Area SqFt / 3000 (Min 1 Roll)", rateKey: "geotextile_fabric_roll_cost", defaultRate: 420, unit: "Rolls", explain: "Provides essential load distribution over mud." }
    ],
    checklist: [
      "Clear topsoil off standard 30x50ft entrance area",
      "Pin geotextile with metal staples every 4 feet",
      "Instruct dump truck drivers to back load stone onto fabric directly"
    ]
  },
  "Organic Topsoil Stripping & Stockpiling": {
    phase: "Phase 1 - Preliminary Site Prep",
    name: "Organic Topsoil Stripping & Stockpiling",
    template: "Template B (Heavy Equipment Run)",
    equipment: [
      { name: "Cat D6 tracked dozer", formula: "Max(8, Area SqFt / 3200 * Soil * Access)", rateKey: "dozer_heavy_rate", defaultRate: 210, explain: "Blades and strips organic loam matrix off-site." },
      { name: "Cat 320 excavator", formula: "Max(4, Dozer Hours * 0.5)", rateKey: "excavator_20t_rate", defaultRate: 220, explain: "Loads buffer stockpiles at margins." }
    ],
    crew: [
      { name: "Grade operator / Scanning surveyor", formula: "Dozer Hours", rateKey: "operator_rate", defaultRate: 55, explain: "Reviews laser grade depths continuously." }
    ],
    materials: [],
    checklist: [
      "Confirm topsoil strip depth with the site drawings (usually 4-6 inches)",
      "Locate the stockpile location so it doesn't block future pond or pad",
      "Setup storm erosion fabric buffers around stockpiles instantly"
    ]
  },
  "Rock Stratum Obstruction Jackhammering": {
    phase: "Phase 2 - Mass Grading & Excavating",
    name: "Rock Stratum Obstruction Jackhammering",
    template: "Template A (Mass Excavator Focus)",
    equipment: [
      { name: "Heavy Cat 320 with 5000 ft-lb hydraulic hammer", formula: "Max(8, Excavation CY / 14 * Soil * Access)", rateKey: "excavator_heavy_hammer_rate", defaultRate: 325, explain: "Required to shatter shallow granite stratum." }
    ],
    crew: [
      { name: "Rotary rig operator", formula: "Hammer Hours * 0.8", rateKey: "operator_rate", defaultRate: 65, explain: "Maintains pneumatic drill-hole preparation." },
      { name: "Ground watch safety flagger", formula: "Hammer Hours", rateKey: "ground_support_rate", defaultRate: 42, explain: "Enforces safe visual perimeter clearance." }
    ],
    materials: [],
    checklist: [
      "Confirm local municipality utility tickets (811) are cleared for rock hammer impact",
      "Equip all personnel with double-ear protection systems",
      "Monitor excavating tooth wear on hydraulic tip hourly"
    ]
  },
  "Organic Stump Grubbing & Removal": {
    phase: "Phase 2 - Mass Grading & Excavating",
    name: "Organic Stump Grubbing & Removal",
    template: "Template B (Heavy Equipment Run)",
    equipment: [
      { name: "Cat 320 Excavator with dual root-shear", formula: "Max(8, Area SqFt / 3600 * Soil * Access)", rateKey: "excavator_grubbing_rate", defaultRate: 235, explain: "Lifts and cuts embedded root claws." },
      { name: "Cat D6 Dozer consolidating piles", formula: "Max(6, Excavator Hours * 0.75)", rateKey: "dozer_heavy_rate", defaultRate: 210, explain: "Consolidates and piles timber root systems." }
    ],
    crew: [],
    materials: [
      { name: "Hauling & root debris waste containers", formula: "Area SqFt / 14000 (Min 1)", rateKey: "hauling_flat_rate", defaultRate: 380, unit: "Truck Loads", explain: "For transport of heavy root ballasts." }
    ],
    checklist: [
      "Identify utility wire height buffers before loader pickup",
      "Double-check that stump pits are backfilled in 1-ft lifts to avoid void settling",
      "Clear out remaining loose stringer roots larger than 2 inches"
    ]
  },
  "Mass Excavation, Pond Basin Shaping & Dam Structural Fill": {
    phase: "Phase 2 - Mass Grading & Excavating",
    name: "Mass Excavation, Pond Basin Shaping & Dam Structural Fill",
    template: "Template A (Mass Excavator Focus)",
    equipment: [
      { name: "Cat 320 Excavator (Basin shaping & bulk digging)", formula: "Max(12, Excavation CY / 38 * Soil * Access)", rateKey: "excavator_20t_rate", defaultRate: 220, explain: "Excavates the pond basin and sculpts custom side slopes." },
      { name: "Cat D6 Track Bulldozer (On-site cut & fill leveling)", formula: "Max(10, Excavator Hours * 0.85)", rateKey: "dozer_heavy_rate", defaultRate: 210, explain: "Spreads loose material excavated on-site to build the dam structure." },
      { name: "Cat CP44 vibrating padfoot roller compactor", formula: "Max(8, Excavator Hours * 0.5)", rateKey: "compactor_roller_rate", defaultRate: 165, explain: "Compacts on-site fill material in lifts for the structural dam embankment." }
    ],
    crew: [
      { name: "Licensed Grade Foreman (Cut-fill controls & laser-transit checking)", formula: "Excavator Hours", rateKey: "foreman_rate", defaultRate: 75, explain: "Monitors precise cut-and-fill balance and bank slope gradients." },
      { name: "Equipment Operators (Dam leveling & compacting)", formula: "Max(8, Excavator Hours * 1.2)", rateKey: "operator_rate", defaultRate: 55, explain: "Operates dozer and vibratory compactor." }
    ],
    materials: [
      { name: "On-Site Loose Excavated Dirt (Repurposed for Dam Fill)", formula: "Excavation CY", rateKey: "clay_delivered_per_ton", defaultRate: 0, unit: "CY", explain: "Utilizes existing loose material excavated from the pond basin to build the dam embankment ($0.00 to keep construction cost down!)." }
    ],
    checklist: [
      "Balance cut-and-fill on-site to build the core dam embankment and minimize haul-out cost",
      "Spread loose material in maximum 6-to-8 inch lifts along the dam width",
      "Verify compaction meets stability requirements to handle standard water pressure",
      "Sculpt final 3:1 side slopes along the pond perimeter walls for structural integrity"
    ]
  },
  "Deep Clay Core Keyway Trench Excavation": {
    phase: "Phase 2 - Mass Grading & Excavating",
    name: "Deep Clay Core Keyway Trench Excavation",
    template: "Template A (Mass Excavator Focus)",
    equipment: [
      { name: "Cat 320 Excavator (Keyway Cut)", formula: "Max(8, Keyway Length * 0.05)", rateKey: "excavator_20t_rate", defaultRate: 220, explain: "Cuts the core cutoff trench down to tight impermeable clay stratum." },
      { name: "Cat D5 Dozer (Backfilling Clay)", formula: "Max(6, Excavator Hours * 0.8)", rateKey: "dozer_rate", defaultRate: 195, explain: "Pushes loose clay lifts into the keyway trench." }
    ],
    crew: [
      { name: "Grade Foreman (Depth checking)", formula: "Excavator Hours", rateKey: "foreman_rate", defaultRate: 75, explain: "Monitors keyway depth to verify impermeable seal." }
    ],
    materials: [
      { name: "Imported Impermeable Core Clay", formula: "Keyway Length * 1.5", rateKey: "clay_delivered_per_ton", defaultRate: 32, unit: "Tons", explain: "Select structural red clay for water-tight core seal." }
    ],
    checklist: [
      "Excavate core trench minimum 4 feet deep or down to solid rock/clay base",
      "Verify width is at least 8 feet at the bottom to allow loader compacting access",
      "Pack core clay in thin 6-inch lifts using heavy machinery treads"
    ]
  },
  "Water Overflow HDPE Piping Installation": {
    phase: "Phase 3 - Pond & Clay Pad Base",
    name: "Water Overflow HDPE Piping Installation",
    template: "Template D (Materials & Infrastructure)",
    equipment: [
      { name: "Cat 305 Compact Mini Excavator", formula: "Max(4, Pipe Sections * 2)", rateKey: "excavator_5t_rate", defaultRate: 145, explain: "Excavates precise pipe run alignment trenches." }
    ],
    crew: [
      { name: "Pipe installation technician", formula: "Excavator Hours * 1.5", rateKey: "ground_support_rate", defaultRate: 42, explain: "Joins, aligns, and anchors drainage pipe sections." }
    ],
    materials: [
      { name: "Water Overflow HDPE Intake Pipe (18\" x 40Ft)", formula: "2 (Flat)", rateKey: "hdpe_pipe_cost", defaultRate: 650, unit: "Sections", explain: "Emergency discharge safety overflow conduit." },
      { name: "HDPE Pipe Coupling bands", formula: "2 (Flat)", rateKey: "silt_fence_roll_cost", defaultRate: 45, unit: "Bands", explain: "Heavy-duty locking bands to prevent water bypass leakage." }
    ],
    checklist: [
      "Anchor pipe with concrete anti-seep collars to prevent water piping alongside pipe",
      "Verify pipe slope has at least 1% down grade to ensure positive runoff drainage",
      "Compact backfill around the pipe manually to avoid crushing or displacing it"
    ]
  },
  "Structured Compacted House Clay Pad Build": {
    phase: "Phase 3 - Pond & Clay Pad Base",
    name: "Structured Compacted House Clay Pad Build",
    template: "Template C (Moisture Compaction Base)",
    equipment: [
      { name: "Cat CP44 vibrating padfoot roller", formula: "Compaction Days * 8", rateKey: "compactor_roller_rate", defaultRate: 165, explain: "Moisture-tunes red clay molecules." },
      { name: "Heavy Excavator shaping pad grade", formula: "Max(8, Compaction Days * 6)", rateKey: "excavator_20t_rate", defaultRate: 185, explain: "Carves perfect square corners and profiles." }
    ],
    crew: [
      { name: "Dual-Transit laser certifying crew", formula: "1 (Flat Setup)", rateKey: "foreman_rate", defaultRate: 1250, explain: "Provides certified engineer elevation signs." }
    ],
    materials: [
      { name: "Middle GA Selection Red Compaction Clay (Haul-in)", formula: "Excavation CY * 1.30 * 1.35 (Min 40 Tons)", rateKey: "clay_delivered_per_ton", defaultRate: 32, unit: "Tons", explain: "Selected high-plasticity fill clay." }
    ],
    checklist: [
      "Ensure red clay is spread in maximum 6-to-8 inch loose lifts",
      "Perform nuclear gauge moisture tamping tests every Lift profile",
      "Do NOT allow subgrade concrete placement until compaction reaches 98% Standard Proctor"
    ]
  },
  "Structural Foundation Trench excavation": {
    phase: "Phase 3 - Pond & Clay Pad Base",
    name: "Structural Foundation Trench excavation",
    template: "Template C (Moisture Compaction Base)",
    equipment: [
      { name: "Cat 305 Compact Mini Excavator", formula: "Max(4, Length / 35)", rateKey: "excavator_5t_rate", defaultRate: 145, explain: "For high-precision footer trench profiling." }
    ],
    crew: [
      { name: "Precision trench layout spotter", formula: "Trench Hours", rateKey: "ground_support_rate", defaultRate: 42, explain: "Guides excavator operator manually." },
      { name: "Shoring stake installer / coordinator", formula: "Max(6, Trench Hours * 1.5)", rateKey: "chainsaw_rate", defaultRate: 48, explain: "Secures wood/plastic protective concrete trench shields." }
    ],
    materials: [],
    checklist: [
      "Lay out precise chalk lines and double check diagonals using 3-4-5 rule",
      "Monitor trench depth to hit stable virgin stratum base and avoid voids",
      "Immediately set up OSHA visual markers around open trench perimeters"
    ]
  },
  "Crowned Gravel Driveway Construction": {
    phase: "Phase 4 - Roadway & Gravel Base",
    name: "Crowned Gravel Driveway Construction",
    template: "Template D (Materials & Infrastructure)",
    equipment: [
      { name: "Heavy Motor Grader crowning & ditching", formula: "Max(6, Area SqFt / 4500)", rateKey: "dozer_heavy_rate", defaultRate: 220, explain: "Shapes the critical water crowning slope profile." },
      { name: "Cat vibrating smooth steel compactor", formula: "Max(4, Area SqFt / 6000)", rateKey: "smooth_roller_rate", defaultRate: 155, explain: "Performs final coarse run aggregate locking." }
    ],
    crew: [],
    materials: [
      { name: "Crusher Run aggregate base dressing", formula: "(Area * 0.5 / 27) * 1.45 (Min 20 Tons)", rateKey: "crusher_run_per_ton", defaultRate: 38, unit: "Tons", explain: "Class A aggregate with fines for locking." },
      { name: "Woven roadway geotextile roadway fabric", formula: "Area SqFt / 3600 (Min 1 Roll)", rateKey: "geotextile_fabric_roll_cost", defaultRate: 420, unit: "Rolls", explain: "Filters soil and prevents road sinking." },
      { name: "Atlanta Granite wash-out ballast aggregates", formula: "18 (Flat)", rateKey: "granite_ballast_per_ton", defaultRate: 42, unit: "Tons", explain: "Provides thick base locking aggregates." }
    ],
    checklist: [
      "Ensure center crown is standard 4% high to shed ditch water correctly",
      "Check that edge runoff ditches are graded to active outfall portals",
      "Roll crusher run aggregate while moisture is high for cement-like setting"
    ]
  },
  "Subgrade Geotextile Fabric Laying": {
    phase: "Phase 4 - Roadway & Gravel Base",
    name: "Subgrade Geotextile Fabric Laying",
    template: "Template D (Materials & Infrastructure)",
    equipment: [
      { name: "Mini loader unspooling composite rolls", formula: "Max(2, Rolls Needed)", rateKey: "excavator_5t_rate", defaultRate: 115, explain: "Lifts and maneuvers heavy filtration fabric rods." }
    ],
    crew: [
      { name: "Fabric ground deployment crew", formula: "Max(4, Rolls Needed * 3)", rateKey: "ground_support_rate", defaultRate: 35, explain: "Maintains high stretching and pinning profiles." }
    ],
    materials: [
      { name: "Heavy Duty separation geotextile road fabric", formula: "Area SqFt / 3600 (Min 1)", rateKey: "geotextile_fabric_roll_cost", defaultRate: 420, unit: "Rolls", explain: "Extends pavement life by limiting clay migration." }
    ],
    checklist: [
      "Overlap fabric roll edges by a minimum of 18-to-24 inches",
      "Do NOT allow any heavy machinery to tread directly on fabric prior to stone coverage",
      "Drive steel fabric pins every 5 feet along overlapping seams"
    ]
  },
  "Surge Stone Stabilizing Base Layer": {
    phase: "Phase 4 - Roadway & Gravel Base",
    name: "Surge Stone Stabilizing Base Layer",
    template: "Template D (Materials & Infrastructure)",
    equipment: [
      { name: "Cat D6 Tracked Bulldozer spreading ballast", formula: "Max(6, Tons Needed / 45)", rateKey: "dozer_heavy_rate", defaultRate: 210, explain: "Spreads large coarse rock over filter layers." },
      { name: "Cat vibrating smooth steel compactor", formula: "Max(6, Tons Needed / 45)", rateKey: "smooth_roller_rate", defaultRate: 155, explain: "Vibrates surge stones into structural lock." }
    ],
    crew: [],
    materials: [
      { name: "Georgia Granite Large 4\"-8\" Surge Stone", formula: "(Area * 0.33 / 27) * 1.45 (Min 30 Tons)", rateKey: "granite_ballast_per_ton", defaultRate: 42, unit: "Tons", explain: "Extra thick stabilizing ballast stones." }
    ],
    checklist: [
      "Check subgrade compaction before granite ballast drop",
      "Verify that stone is locked into place using massive steel drum vibrations",
      "Instruct truck drivers to maintain uniform spacing during dumps"
    ]
  },
  "Transit Motor Grader Leveling & Crown Profile": {
    phase: "Phase 5 - Permanent Stabilization",
    name: "Transit Motor Grader Leveling & Crown Profile",
    template: "Template D (Materials & Infrastructure)",
    equipment: [
      { name: "Heavy Motor Grader slope grading", formula: "Max(6, Area SqFt / 4500)", rateKey: "dozer_heavy_rate", defaultRate: 220, explain: "Ensures precise drainage contours of margins." },
      { name: "Steel drum vibratory finishing compactor", formula: "Grader Hours", rateKey: "smooth_roller_rate", defaultRate: 155, explain: "Locks fine top crusher run aggregates." }
    ],
    crew: [
      { name: "Dual-Transit elevation inspector", formula: "Grader Hours", rateKey: "foreman_rate", defaultRate: 75, explain: "Validates active slope with grade rods." }
    ],
    materials: [],
    checklist: [
      "Ensure grader blade angle matches civil site profile plans",
      "Verify that ditch outfalls are clear of dirt blockages",
      "Avoid grading under heavy downpours to maintain elevation shape"
    ]
  },
  "Silt Retaining Basin Spillway Rocks Rip-Rap": {
    phase: "Phase 3 - Pond & Clay Pad Base",
    name: "Silt Retaining Basin Spillway Rocks Rip-Rap",
    template: "Template A (Mass Excavator Focus)",
    equipment: [
      { name: "Cat 320 Excavator (Rip-rap placement)", formula: "Max(4, Rip-rap Tons / 7)", rateKey: "excavator_20t_rate", defaultRate: 220, explain: "Lays and hand-locks massive structural rip-rap stones." }
    ],
    crew: [
      { name: "Erosion control laborers (Seam aligning)", formula: "Excavator Hours * 2", rateKey: "ground_support_rate", defaultRate: 38, explain: "Pins and anchors backing fabrics along the basin seams." }
    ],
    materials: [
      { name: "Georgia Granite Class II Spillway Rip-Rap stone", formula: "Excavation CY * 0.25 (Min 10 Tons)", rateKey: "spillway_riprap_per_ton", defaultRate: 48, unit: "Tons", explain: "High-grade heavy stones to prevent severe washout." },
      { name: "Roadway grade non-woven geotextile soil filter", formula: "1 Roll (Flat)", rateKey: "geotextile_fabric_roll_cost", defaultRate: 390, unit: "Rolls", explain: "Standard backing material filters soil under rock." }
    ],
    checklist: [
      "Ensure rip-rap slope doesn't obstruct spillway flow capacity",
      "Align backing geotextile securely beneath riprap stones to prevent washouts",
      "Lock smaller stone into voids to build a monolithic defense system"
    ]
  },
  "Topsoil Dressing & Seeding Stabilization": {
    phase: "Phase 5 - Permanent Stabilization",
    name: "Topsoil Dressing & Seeding Stabilization",
    template: "Template B (Heavy Equipment Run)",
    equipment: [
      { name: "Cat Compact track soil loader", formula: "Max(4, Topsoil Tons / 35)", rateKey: "excavator_5t_rate", defaultRate: 135, explain: "Spreads organic loam matrix without packing it down hard." }
    ],
    crew: [
      { name: "Landscaping tech raking & anchoring straw", formula: "Loader Hours * 2", rateKey: "ground_support_rate", defaultRate: 42, explain: "Anchors dot spec straw mats and pins." }
    ],
    materials: [
      { name: "Screened High-Nutrient Organic Topsoil", formula: "(Area * 0.15 / 27) * 1.25 (Min 12 Tons)", rateKey: "clay_delivered_per_ton", defaultRate: 28, unit: "Tons", explain: "Provides excellent mineral base for hybrid seed growth." },
      { name: "GA DOT Centipede hybrid seed & straw mulch blanket rolls", formula: "Area SqFt / 2000 (Min 1 Roll)", rateKey: "straw_mulch_blanket_roll_cost", defaultRate: 245, unit: "Rolls", explain: "Straw mulch blankets secure growth on erosion-prone banks." }
    ],
    checklist: [
      "Lightly Scarify sub-base clay so new topsoil integrates instead of sliding",
      "Sow grass seeds evenly using automated calibrated hand spreaders",
      "Anchor straw blankets with bio-degradable pins every 3 feet on slopes"
    ]
  }
};

interface MultiPhaseEstimatorProps {
  onBackToHome?: () => void;
}

interface ClientIntakeLog {
  id: string;
  fiId?: string;
  submittedAt: string;
  clientName: string;
  jobName: string;
  foreman: string;
  latitude?: string;
  longitude?: string;
  formData?: {
    meetingDate: string;
    meetingTime: string;
    foreman: string;
    clientName: string;
    phoneNumber: string;
    emailAddress: string;
    mailingAddress: string;
    cityStateZip: string;
    jobName: string;
    jobNotes: string;
    jobAddress: string;
    jobCityStateZip: string;
    accessRoadType: string;
    accessNotes: string;
    soilType: string;
    lengthFeet: string;
    topWidthFeet: string;
    bottomWidthFeet: string;
    depthHeightFeet: string;
    siteSlopePercent: string;
    clientWants: string;
    specialConcerns: string;
    budgetMentioned: string;
    timeline: string;
    areaSquareFeet?: number | string;
  };
}

interface LineItem {
  id: string;
  category: 'Labor' | 'Equipment' | 'Materials' | 'Subcontract' | 'Permits';
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
}

interface EstimateSubPhase {
  id: string;
  phaseName: string;
  subPhaseName: string;
  templateId: 'A' | 'B' | 'C' | 'D';
  templateName: string;
  lineItems: LineItem[];
  itemCostTotal: number;
  markupPercent: number;
  totalBidPrice: number;
  geometryUsed: {
    lengthFeet: number;
    topWidthFeet: number;
    bottomWidthFeet: number;
    depthFeet: number;
    areaSqFt: number;
    excavationCuYds: number;
    soilType: string;
    accessType: string;
  };
  notes: string;
  isSubcontracted?: boolean;
  subcontractorName?: string;
  subcontractorCost?: number;
  subcontractorMarkupPercent?: number;
}

export interface BidCredential {
  id: string;
  title: string;
  docType: 'license' | 'insurance' | 'bonding' | 'certification' | 'custom';
  issuer: string;
  referenceNumber: string;
  expiryDate: string;
  status: 'active' | 'pending' | 'expired';
  isAttached: boolean;
  notes: string;
  fileName?: string;
  fileData?: string;
}

export default function MultiPhaseEstimator({ onBackToHome }: MultiPhaseEstimatorProps) {
  // Master project state
  const [projectId, setProjectId] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('478-986-0251');
  const [clientEmail, setClientEmail] = useState('newhomes@damesferryproperties.com');
  const [jobName, setJobName] = useState('');
  const [foreman, setForeman] = useState('TJ Darley');
  const [locationAddress, setLocationAddress] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'success' | 'error' | null>(null);

  // AI Plan Takeoff Scanner States
  const [takeoffFile, setTakeoffFile] = useState<File | null>(null);
  const [takeoffFileBase64, setTakeoffFileBase64] = useState<string | null>(null);
  const [takeoffFileMimeType, setTakeoffFileMimeType] = useState<string | null>(null);
  const [takeoffText, setTakeoffText] = useState<string>('');
  const [isParsingTakeoff, setIsParsingTakeoff] = useState(false);
  const [parsedTakeoffData, setParsedTakeoffData] = useState<any | null>(null);
  const [takeoffError, setTakeoffError] = useState<string | null>(null);
  const [takeoffSuccess, setTakeoffSuccess] = useState(false);

  const handleTakeoffFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTakeoffFile(file);
    setTakeoffFileMimeType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setTakeoffFileBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRunTakeoffAI = async (overrideText?: string, isWindsongDemo: boolean = false) => {
    const textString = typeof overrideText === 'string' ? overrideText : takeoffText;
    let textToScan = textString;
    if (!textToScan && !takeoffFileBase64 && !isWindsongDemo) {
      textToScan = "WINDSONG AT NATURE'S WALK TOWN HOMES, Gray, GA - Civil Site Development Plan Set (1.76 Acres, 16 townhomes, 155 LF 18 inch RCP storm sewer)";
      setTakeoffText(textToScan);
    }

    setIsParsingTakeoff(true);
    setTakeoffError(null);
    setTakeoffSuccess(false);

    try {
      if (isWindsongDemo) {
        const windsongPreset = {
          clientName: "Avery Communities, LLC (Brett Jackson)",
          clientPhone: "478-986-0251",
          clientEmail: "newhomes@damesferryproperties.com",
          jobName: "Windsong at Nature's Walk Townhome Community",
          locationAddress: "Nature's Walk (60' R/W), Gray, GA 31032 (Jones County)",
          takeoffSummary: "Civil Site Development Plan Set for Windsong at Nature's Walk (1.76 Acres, 16 townhomes in 3 building blocks, 155 LF 18\" RCP storm sewer, 1,280 LF 24\" vertical concrete curb & gutter, 2,850 SY 3\" asphalt paving).",
          dimensions: {
            lengthFeet: 420,
            topWidthFeet: 185,
            bottomWidthFeet: 185,
            depthFeet: 6,
            siteSlope: "2.5%",
            soilType: "Cecil Sandy Clay Loam (CZB2 & CyC2, 2-6% slopes)",
            accessType: "Moderate Aggregate Access"
          },
          keyway: {
            keywayLengthFeet: 120,
            keywayBottomWidthFeet: 12,
            keywayDepthFeet: 3,
            keywaySideSlope: "2:1"
          },
          suggestedPhases: [
            "Phase 1: Heavy Site Clearing & Grubbing (1.76 Acres)",
            "Phase 2: Erosion Control BMPs (1,450 LF Silt Fence & Rock Exit)",
            "Phase 3: Mass Grading, Cut/Fill Soil Balancing & Building Pad Prep",
            "Phase 4: Underground Storm Drainage (155 LF 18\" RCP, Structures & Headwalls)",
            "Phase 5: Subgrade Base Course (8\" GABC Graded Aggregate Base)",
            "Phase 6: Concrete Hardscape (1,280 LF 24\" Curb/Gutter & 2,400 SF Sidewalks)",
            "Phase 7: Building Slab Foundations (Building A, B & C Pads)",
            "Phase 8: Roadway & Parking Lot Asphalt Paving (45 Parking Bays)"
          ]
        };
        setParsedTakeoffData(windsongPreset);
        setTakeoffSuccess(true);
        setIsParsingTakeoff(false);
        return;
      }

      const response = await fetch('/api/parse-takeoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToScan,
          fileData: takeoffFileBase64,
          mimeType: takeoffFileMimeType,
          filename: takeoffFile?.name || "takeoff_plan_image"
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}: Failed to read takeoff plan.`);
      }

      const result = await response.json();
      setParsedTakeoffData(result);
      setTakeoffSuccess(true);
    } catch (err: any) {
      console.error("Takeoff analysis error:", err);
      setTakeoffError(err.message || "An unexpected error occurred during takeoff plan scan. Please check your internet or configured API keys.");
    } finally {
      setIsParsingTakeoff(false);
    }
  };

  const applyTakeoffFields = () => {
    if (!parsedTakeoffData) return;

    if (parsedTakeoffData.clientName) setClientName(parsedTakeoffData.clientName);
    if (parsedTakeoffData.clientPhone) setClientPhone(parsedTakeoffData.clientPhone);
    if (parsedTakeoffData.clientEmail) setClientEmail(parsedTakeoffData.clientEmail);
    if (parsedTakeoffData.jobName) setJobName(parsedTakeoffData.jobName);
    if (parsedTakeoffData.locationAddress) setLocationAddress(parsedTakeoffData.locationAddress);

    const dims = parsedTakeoffData.dimensions;
    if (dims) {
      if (dims.lengthFeet) setLengthFeet(String(dims.lengthFeet));
      if (dims.topWidthFeet) setTopWidthFeet(String(dims.topWidthFeet));
      if (dims.bottomWidthFeet) setBottomWidthFeet(String(dims.bottomWidthFeet));
      if (dims.depthFeet) setDepthFeet(String(dims.depthFeet));
      if (dims.siteSlope) setSiteSlope(String(dims.siteSlope));
      if (dims.soilType) setSoilType(String(dims.soilType));
      if (dims.accessType) setAccessType(String(dims.accessType));
    }

    const kw = parsedTakeoffData.keyway;
    if (kw) {
      if (kw.keywayLengthFeet) setKeywayLengthFeet(String(kw.keywayLengthFeet));
      if (kw.keywayBottomWidthFeet) setKeywayBottomWidthFeet(String(kw.keywayBottomWidthFeet));
      if (kw.keywayDepthFeet) setKeywayDepthFeet(String(kw.keywayDepthFeet));
      if (kw.keywaySideSlope) setKeywaySideSlope(String(kw.keywaySideSlope));
    }

    const sw = parsedTakeoffData.spillway;
    if (sw) {
      if (sw.spillwayLengthFeet) setSpillwayLengthFeet(String(sw.spillwayLengthFeet));
      if (sw.spillwayWidthFeet) setSpillwayWidthFeet(String(sw.spillwayWidthFeet));
      if (sw.spillwayRiprapThicknessInches) setSpillwayRiprapThicknessInches(String(sw.spillwayRiprapThicknessInches));
      if (sw.spillwayOnBothSides !== undefined) setSpillwayOnBothSides(Boolean(sw.spillwayOnBothSides));
    }

    // Auto-populate all 8 multi-phase civil line items if civilData exists
    const cd = parsedTakeoffData.civilData || {};
    const totalAcres = 1.76;
    const siltLF = cd.siltFenceLF || 1450;
    const stormLF = cd.stormPipeLengthLF || 155;
    const curbLF = cd.curbAndGutterLF || 1280;
    const townhomes = cd.townhomesCount || 16;
    const bldgs = cd.buildingsCount || 3;

    const generatedPhases: EstimateSubPhase[] = [
      {
        id: "phase_1_clearing",
        phaseName: `Phase 1: Heavy Site Clearing & Grubbing (${totalAcres} Acres)`,
        subPhaseName: "Heavy Machinery Land Clearing & Forestry Mulching",
        templateId: "B",
        templateName: "Heavy Machinery Land Clearing & Forestry Mulching",
        itemCostTotal: Math.round(totalAcres * 9000),
        markupPercent: 15,
        totalBidPrice: Math.round(totalAcres * 10500),
        lineItems: [
          { id: "p1_1", category: "Equipment", description: "CAT 299D3 Forestry Mulcher", quantity: Math.round(totalAcres * 8), unit: "Hrs", unitPrice: 245, totalCost: Math.round(totalAcres * 8 * 245) },
          { id: "p1_2", category: "Labor", description: "Tree chainsaw & ground operator team", quantity: Math.round(totalAcres * 12), unit: "Hrs", unitPrice: 48, totalCost: Math.round(totalAcres * 12 * 48) }
        ],
        geometryUsed: {
          lengthFeet: 350,
          topWidthFeet: 220,
          bottomWidthFeet: 220,
          depthFeet: 0,
          areaSqFt: Math.round(totalAcres * 43560),
          excavationCuYds: 0,
          soilType: "Wooded Topsoil",
          accessType: "Moderate"
        },
        notes: `Clear and grub ${totalAcres} acres of wooded site, remove organic topsoil debris.`
      },
      {
        id: "phase_2_erosion",
        phaseName: `Phase 2: Erosion Control BMPs (${siltLF} LF Silt Fence & Rock Exit)`,
        subPhaseName: "GSWCC Type NS Silt Fence & Stone Construction Entry",
        templateId: "A",
        templateName: "GSWCC Type NS Silt Fence & Stone Construction Entry",
        itemCostTotal: Math.round(siltLF * 7.20 + 2000),
        markupPercent: 15,
        totalBidPrice: Math.round(siltLF * 8.50 + 2500),
        lineItems: [
          { id: "p2_1", category: "Materials", description: "GSWCC Type NS Silt Fence Rolls", quantity: Math.ceil(siltLF / 100), unit: "Rolls", unitPrice: 185, totalCost: Math.ceil(siltLF / 100) * 185 },
          { id: "p2_2", category: "Materials", description: "Heavy Construction Entrance #3 Surge Stone", quantity: 60, unit: "Tons", unitPrice: 35, totalCost: 2100 }
        ],
        geometryUsed: {
          lengthFeet: siltLF,
          topWidthFeet: 15,
          bottomWidthFeet: 15,
          depthFeet: 0.5,
          areaSqFt: siltLF * 15,
          excavationCuYds: 45,
          soilType: "Red Clay",
          accessType: "Easy"
        },
        notes: "Install Type NS sediment barriers along perimeter and stone construction entry pad."
      },
      {
        id: "phase_3_grading",
        phaseName: `Phase 3: Mass Earthwork, Cut/Fill Balancing & Pad Prep (${townhomes} Units / ${bldgs} Bldgs)`,
        subPhaseName: "CAT D6 Laser GPS Grading & Subgrade Compaction",
        templateId: "D",
        templateName: "CAT D6 Laser GPS Grading & Subgrade Compaction",
        itemCostTotal: 36000,
        markupPercent: 16,
        totalBidPrice: 41800,
        lineItems: [
          { id: "p3_1", category: "Equipment", description: "CAT D6 LGP Dozer with GPS 3D Grade Control", quantity: 80, unit: "Hrs", unitPrice: 220, totalCost: 17600 },
          { id: "p3_2", category: "Equipment", description: "CAT 815F Vibratory Tamping Foot Compactor", quantity: 60, unit: "Hrs", unitPrice: 185, totalCost: 11100 }
        ],
        geometryUsed: {
          lengthFeet: 300,
          topWidthFeet: 200,
          bottomWidthFeet: 200,
          depthFeet: 1.7,
          areaSqFt: 60000,
          excavationCuYds: 3800,
          soilType: "Georgia Red Clay",
          accessType: "Easy"
        },
        notes: "Mass site grading, balance cut/fill red clay, compact building pads to 98% Proctor."
      },
      {
        id: "phase_4_storm",
        phaseName: `Phase 4: Underground Storm Drainage (${stormLF} LF 18" RCP, Structures & Headwalls)`,
        subPhaseName: "Underground Storm Sewer Pipe & Concrete Structures",
        templateId: "A",
        templateName: "Underground Storm Sewer Pipe & Concrete Structures",
        itemCostTotal: Math.round(stormLF * 140.00 + 10000),
        markupPercent: 15,
        totalBidPrice: Math.round(stormLF * 165.00 + 12000),
        lineItems: [
          { id: "p4_1", category: "Materials", description: "18 Inch Reinforced Concrete Pipe (RCP Class III)", quantity: stormLF, unit: "LF", unitPrice: 65, totalCost: stormLF * 65 },
          { id: "p4_2", category: "Materials", description: "Precast Concrete Catch Basins & Wingwall Headwalls", quantity: 4, unit: "EA", unitPrice: 2800, totalCost: 11200 }
        ],
        geometryUsed: {
          lengthFeet: stormLF,
          topWidthFeet: 6,
          bottomWidthFeet: 4,
          depthFeet: 6,
          areaSqFt: stormLF * 6,
          excavationCuYds: Math.round((stormLF * 5 * 6) / 27),
          soilType: "Moist Clay",
          accessType: "Moderate"
        },
        notes: `Install ${stormLF} LF of 18" RCP storm pipe @ 1.00% & 0.87% slope with structures A1/B3 and headwalls A2/B2.`
      },
      {
        id: "phase_5_gabc",
        phaseName: "Phase 5: Subgrade Aggregates (680 Tons 8\" GABC Crushed Base)",
        subPhaseName: "Graded Aggregate Base Course Spreading & Roller Compaction",
        templateId: "C",
        templateName: "Graded Aggregate Base Course Spreading & Roller Compaction",
        itemCostTotal: Math.round(680 * 35.50),
        markupPercent: 18,
        totalBidPrice: Math.round(680 * 42.00),
        lineItems: [
          { id: "p5_1", category: "Materials", description: "Graded Aggregate Base Course (GABC Crushed Granite)", quantity: 680, unit: "Tons", unitPrice: 28, totalCost: 680 * 28 },
          { id: "p5_2", category: "Equipment", description: "Dual-Drum Vibratory Asphalt/Base Roller", quantity: 24, unit: "Hrs", unitPrice: 145, totalCost: 3480 }
        ],
        geometryUsed: {
          lengthFeet: 400,
          topWidthFeet: 45,
          bottomWidthFeet: 45,
          depthFeet: 0.67,
          areaSqFt: 18000,
          excavationCuYds: 445,
          soilType: "Compacted Clay Subgrade",
          accessType: "Easy"
        },
        notes: "Spread and vibratory compact 8 inches GABC stone base under asphalt roadways."
      },
      {
        id: "phase_6_curb",
        phaseName: `Phase 6: Concrete Hardscape (${curbLF} LF 24" Vertical Curb & Gutter + Sidewalks)`,
        subPhaseName: "Extruded Concrete Curbing & 4\" Concrete Sidewalks",
        templateId: "A",
        templateName: "Extruded Concrete Curbing & 4\" Concrete Sidewalks",
        itemCostTotal: Math.round(curbLF * 23.50 + 10000),
        markupPercent: 16,
        totalBidPrice: Math.round(curbLF * 28.00 + 12000),
        lineItems: [
          { id: "p6_1", category: "Subcontract", description: "Slipform Concrete Curbing Crew & Concrete Materials", quantity: curbLF, unit: "LF", unitPrice: 22, totalCost: curbLF * 22 },
          { id: "p6_2", category: "Materials", description: "4 Inch Poured Concrete Sidewalks (3000 PSI)", quantity: 3200, unit: "SQFT", unitPrice: 3.50, totalCost: 11200 }
        ],
        geometryUsed: {
          lengthFeet: curbLF,
          topWidthFeet: 2,
          bottomWidthFeet: 2,
          depthFeet: 0.5,
          areaSqFt: curbLF * 2,
          excavationCuYds: 48,
          soilType: "GABC Base",
          accessType: "Easy"
        },
        notes: `Slipform ${curbLF} LF of 24" vertical curb and poured 4" concrete pedestrian sidewalks.`
      },
      {
        id: "phase_7_pads",
        phaseName: `Phase 7: Building Slab Foundations (${bldgs} Building Blocks / ${townhomes} Townhome Slabs)`,
        subPhaseName: "Mono Slab Pour, Rebar Reinforcement & Fiber Mesh",
        templateId: "D",
        templateName: "Mono Slab Pour, Rebar Reinforcement & Fiber Mesh",
        itemCostTotal: Math.round(14400 * 3.60),
        markupPercent: 18,
        totalBidPrice: Math.round(14400 * 4.25),
        lineItems: [
          { id: "p7_1", category: "Materials", description: "3500 PSI High-Early Concrete Ready Mix", quantity: 270, unit: "CY", unitPrice: 155, totalCost: 41850 },
          { id: "p7_2", category: "Labor", description: "Concrete Finishing Crew & Form Setup", quantity: 120, unit: "Hrs", unitPrice: 55, totalCost: 6600 }
        ],
        geometryUsed: {
          lengthFeet: 240,
          topWidthFeet: 60,
          bottomWidthFeet: 60,
          depthFeet: 0.5,
          areaSqFt: 14400,
          excavationCuYds: 267,
          soilType: "Compacted Red Clay Pad",
          accessType: "Easy"
        },
        notes: "Form, grade, vapor barrier, and pour 6\" 3,500 PSI monolithic concrete building slabs."
      },
      {
        id: "phase_8_asphalt",
        phaseName: "Phase 8: Asphalt Roadway & Parking Lot Paving (2,850 SY / 45 Bays)",
        subPhaseName: "Hot Mix Asphalt Binder & Topping Course",
        templateId: "C",
        templateName: "Hot Mix Asphalt Binder & Topping Course",
        itemCostTotal: Math.round(2850 * 18.50),
        markupPercent: 18,
        totalBidPrice: Math.round(2850 * 22.00),
        lineItems: [
          { id: "p8_1", category: "Subcontract", description: "9.5mm Superpave Hot Mix Asphalt Paving & Tack Coat", quantity: 2850, unit: "SY", unitPrice: 18.50, totalCost: Math.round(2850 * 18.50) }
        ],
        geometryUsed: {
          lengthFeet: 570,
          topWidthFeet: 45,
          bottomWidthFeet: 45,
          depthFeet: 0.25,
          areaSqFt: 25650,
          excavationCuYds: 237,
          soilType: "Compacted GABC Base",
          accessType: "Easy"
        },
        notes: "Tack coat subgrade and lay 3 inches 9.5mm Superpave asphalt surface for 45 parking spaces."
      }
    ];

    setCompiledPhases(generatedPhases as any);
    setTakeoffSuccess(true);
  };

  // Geometry dimensions
  const [lengthFeet, setLengthFeet] = useState<string>('300');
  const [topWidthFeet, setTopWidthFeet] = useState<string>('80');
  const [bottomWidthFeet, setBottomWidthFeet] = useState<string>('60');
  const [depthFeet, setDepthFeet] = useState<string>('4');
  const [siteSlope, setSiteSlope] = useState<string>('1.5%');
  const [soilType, setSoilType] = useState<string>('clay');
  const [accessType, setAccessType] = useState<string>('easy');

  // Cutoff / Keyway Trench dimensions (Bulletproofing earthen dam core)
  const [keywayLengthFeet, setKeywayLengthFeet] = useState<string>('300');
  const [keywayBottomWidthFeet, setKeywayBottomWidthFeet] = useState<string>('8');
  const [keywayDepthFeet, setKeywayDepthFeet] = useState<string>('4');
  const [keywaySideSlope, setKeywaySideSlope] = useState<string>('1.0'); // 1:1 slopes typical

  // Spillway rip-rap dimensions (Prevents emergency spillway washouts)
  const [spillwayLengthFeet, setSpillwayLengthFeet] = useState<string>('50');
  const [spillwayWidthFeet, setSpillwayWidthFeet] = useState<string>('12');
  const [spillwayRiprapThicknessInches, setSpillwayRiprapThicknessInches] = useState<string>('18');
  const [spillwayOnBothSides, setSpillwayOnBothSides] = useState<boolean>(false); // Upstream wave action band toggle
  const [untouchedSpring, setUntouchedSpring] = useState<boolean>(false); // Active spring preservation mode

  // Pond Basin Site Dimensions & Custom Clearing Area
  const [pondSiteLength, setPondSiteLength] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('tjd_multiphase_project_total');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pondSiteLength) return String(parsed.pondSiteLength);
      }
    } catch (e) {}
    return '500';
  });
  const [pondSiteWidth, setPondSiteWidth] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('tjd_multiphase_project_total');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pondSiteWidth) return String(parsed.pondSiteWidth);
      }
    } catch (e) {}
    return '305';
  });
  const [clearingSides, setClearingSides] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('tjd_multiphase_project_total');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clearingSides) return String(parsed.clearingSides);
      }
    } catch (e) {}
    return '3'; // Default to 3 sides based on user's project feedback
  });
  const [useCustomSiteDimensions, setUseCustomSiteDimensions] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tjd_multiphase_project_total');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.useCustomSiteDimensions !== undefined) return Boolean(parsed.useCustomSiteDimensions);
      }
    } catch (e) {}
    return true; // Default to true so custom site dimensions are used
  });

  // Synchronize keyway length to dam length by default when dam length is modified
  useEffect(() => {
    setKeywayLengthFeet(lengthFeet);
  }, [lengthFeet]);

  // Computed geometry helpers
  const [areaSqFt, setAreaSqFt] = useState<number>(0);
  const [excavationCuYds, setExcavationCuYds] = useState<number>(0);

  // Template/Wizard state
  const [activeStep, setActiveStep] = useState<'inputs' | 'plm' | 'templates' | 'totals'>('inputs');
  const [selectedPlmSubPhase, setSelectedPlmSubPhase] = useState<string>('Forestry Mulching & Brush Clearing');

  const [plmOverrides, setPlmOverrides] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('tjd_unified_plm_overrides');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse PLM overrides:', e);
    }
    return {
      mulcher_rate: 245,
      dozer_rate: 195,
      dozer_heavy_rate: 210,
      excavator_20t_rate: 220,
      excavator_heavy_hammer_rate: 325,
      excavator_grubbing_rate: 235,
      excavator_5t_rate: 145,
      operator_rate: 55,
      chainsaw_rate: 48,
      ground_support_rate: 42,
      foreman_rate: 75,
      silt_fence_roll_cost: 185,
      geotextile_fabric_roll_cost: 420,
      granite_ballast_per_ton: 42,
      crusher_run_per_ton: 38,
      hdpe_pipe_cost: 650,
      compactor_roller_rate: 165,
      smooth_roller_rate: 155,
      spillway_riprap_per_ton: 48,
      clay_delivered_per_ton: 32,
      seeding_stabilization_per_lb: 18,
      straw_mulch_blanket_roll_cost: 245,
    };
  });

  // ⛽ Diesel Fuel Competitive Bidding Intel States & Surcharge Engine
  const [enableFuelAdjustment, setEnableFuelAdjustment] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tjd_enable_fuel_adjustment');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [dieselBasePrice] = useState<number>(3.50); // Macon baseline fuel index $3.50/gal

  const [dieselCurrentPrice, setDieselCurrentPrice] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tjd_diesel_current_price');
      return saved !== null ? JSON.parse(saved) : 3.85; // Default competitive price
    } catch {
      return 3.85;
    }
  });

  const [dieselCheckResult, setDieselCheckResult] = useState<{
    retailDieselPrice?: number;
    offRoadDieselPrice?: number;
    sourceName?: string;
    asOfDate?: string;
    explanation?: string;
    sources?: { title: string; url: string }[];
  } | null>(() => {
    try {
      const saved = localStorage.getItem('tjd_diesel_check_result');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCheckingDiesel, setIsCheckingDiesel] = useState<boolean>(false);
  const [dieselCheckError, setDieselCheckError] = useState<string | null>(null);
  const [lastDieselCheckTime, setLastDieselCheckTime] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('tjd_diesel_last_check_time');
      return saved || '';
    } catch {
      return '';
    }
  });

  // Keep state sync'd
  useEffect(() => {
    localStorage.setItem('tjd_enable_fuel_adjustment', JSON.stringify(enableFuelAdjustment));
    localStorage.setItem('tjd_diesel_current_price', JSON.stringify(dieselCurrentPrice));
    if (dieselCheckResult) {
      localStorage.setItem('tjd_diesel_check_result', JSON.stringify(dieselCheckResult));
    } else {
      localStorage.removeItem('tjd_diesel_check_result');
    }
    if (lastDieselCheckTime) {
      localStorage.setItem('tjd_diesel_last_check_time', lastDieselCheckTime);
    } else {
      localStorage.removeItem('tjd_diesel_last_check_time');
    }
  }, [enableFuelAdjustment, dieselCurrentPrice, dieselCheckResult, lastDieselCheckTime]);

  // Equipment Fuel burn factor (gal/hr) mapping according to Macon specs
  const EQUIPMENT_BURN_RATES: Record<string, number> = {
    mulcher_rate: 4.5,
    dozer_heavy_rate: 4.5,
    excavator_20t_rate: 4.5,
    excavator_heavy_hammer_rate: 4.5,
    excavator_grubbing_rate: 4.5,
    dozer_rate: 3.0,
    excavator_5t_rate: 2.0,
    compactor_roller_rate: 2.0,
    smooth_roller_rate: 2.0,
    utv_support_rate: 0.8,
    lowboy_mobilization_rate: 0.0,
  };

  const getRate = (defaultRate: number, key: string) => {
    const baseRate = plmOverrides[key] !== undefined ? plmOverrides[key] : defaultRate;
    
    if (enableFuelAdjustment && EQUIPMENT_BURN_RATES[key] !== undefined) {
      // Fuel price change delta per gallon
      const delta = dieselCurrentPrice - dieselBasePrice;
      const burnRate = EQUIPMENT_BURN_RATES[key];
      const surcharge = Math.round(delta * burnRate * 100) / 100;
      return Math.max(0, baseRate + surcharge);
    }
    
    return baseRate;
  };

  const handleCheckLiveDieselPrice = async () => {
    setIsCheckingDiesel(true);
    setDieselCheckError(null);
    try {
      const resp = await fetch('/api/check-diesel-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status}`);
      }
      const data = await resp.json();
      if (data) {
        setDieselCheckResult(data);
        if (data.offRoadDieselPrice) {
          setDieselCurrentPrice(Number(data.offRoadDieselPrice));
        } else if (data.retailDieselPrice) {
          // If no offroad price is specified, estimate it as standard retail minus 25 cents GA taxes
          setDieselCurrentPrice(Number((data.retailDieselPrice - 0.25).toFixed(2)));
        }
        const nowStr = new Date().toLocaleDateString() + ' at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastDieselCheckTime(nowStr);
      }
    } catch (err: any) {
      console.error(err);
      setDieselCheckError("Could not retrieve live diesel fuel indices dynamically. Please specify manual rate overrides below.");
    } finally {
      setIsCheckingDiesel(false);
    }
  };

  const [selectedPhase, setSelectedPhase] = useState<string>('Phase 1 - Preliminary Site Prep');
  const [selectedSubPhase, setSelectedSubPhase] = useState<string>('Forestry Mulching & Brush Clearing');
  const [selectedTemplate, setSelectedTemplate] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [markupPercent, setMarkupPercent] = useState<number>(20); // standard 20% spreadsheet margin
  const [customPhaseNotes, setCustomPhaseNotes] = useState<string>('');

  // Subcontract / 1099 Vendor States
  const [isSubcontracted, setIsSubcontracted] = useState<boolean>(false);
  const [subcontractorName, setSubcontractorName] = useState<string>('');
  const [subcontractorCost, setSubcontractorCost] = useState<string>('');
  const [subcontractorMarkup, setSubcontractorMarkup] = useState<number>(15); // Standard TJD 15% override for subbed work

  // Active compiled builder items (simulating "Estimator_Dynamic" workspace)
  const [currentLineItems, setCurrentLineItems] = useState<LineItem[]>([]);
  const [currentLineItemsCostTotal, setCurrentLineItemsCostTotal] = useState(0);

  // Saved multi-phase estimates array (simulating "Project_Total")
  const [compiledPhases, setCompiledPhases] = useState<EstimateSubPhase[]>([]);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);

  // Local intakes listing for preloading
  const [pastIntakes, setPastIntakes] = useState<ClientIntakeLog[]>([]);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string>('');

  // Enhancements for premium Excel/OneDrive workflow:
  const [globalMarkupAdjustment, setGlobalMarkupAdjustment] = useState<number>(0);
  const [financeChargePercent, setFinanceChargePercent] = useState<number>(0);
  const [estimatedDurationDays, setEstimatedDurationDays] = useState<number>(14);
  const [concreteCuringActive, setConcreteCuringActive] = useState<boolean>(false);
  const [concreteLengthFt, setConcreteLengthFt] = useState<number>(50);
  const [concreteWidthFt, setConcreteWidthFt] = useState<number>(30);
  const [concreteThicknessInches, setConcreteThicknessInches] = useState<number>(6);
  const [concreteElementType, setConcreteElementType] = useState<string>('House Pad / Commercial Slab (6")');
  const [concretePsiGrade, setConcretePsiGrade] = useState<string>('3,500 PSI High-Early');
  const [projectStatus, setProjectStatus] = useState<string>('Draft');
  const [oneDriveHelpOpen, setOneDriveHelpOpen] = useState<boolean>(false);
  const [pdfPrintMode, setPdfPrintMode] = useState<'client' | 'office'>('client');

  // Credentials vault state for contractor licensing, insurance, and bonding
  const [credentials, setCredentials] = useState<BidCredential[]>(() => {
    try {
      const saved = localStorage.getItem('tjd_bid_credential_vault');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse credentials from localStorage', e);
    }
    return [
      {
        id: 'cred-1',
        title: 'Georgia State Residential & General Contractor License',
        docType: 'license',
        issuer: 'Georgia State Licensing Board',
        referenceNumber: 'RLQA-008273-GC',
        expiryDate: '2028-06-30',
        status: 'active',
        isAttached: true,
        notes: 'TJ Darley Construction, LLC certified General Contractor status.'
      },
      {
        id: 'cred-2',
        title: 'Commercial General Liability & Workers Comp Insurance Certificate',
        docType: 'insurance',
        issuer: 'Builders Mutual Insurance Group',
        referenceNumber: 'GLWC-9902384-09',
        expiryDate: '2027-04-15',
        status: 'active',
        isAttached: true,
        notes: 'Commercial general liability ($2M limit) + workers compensation policy coverage.'
      },
      {
        id: 'cred-3',
        title: 'Surety Performance & Payment Bonding Capacity Certificate',
        docType: 'bonding',
        issuer: 'Fidelity and Deposit Company of Maryland',
        referenceNumber: 'BOND-7729384-A',
        expiryDate: '2027-12-31',
        status: 'active',
        isAttached: true,
        notes: 'Bonded capacity up to $3,500,000 for public/commercial land development projects.'
      },
      {
        id: 'cred-4',
        title: 'GSWCC Level IA Blue-Card Erosion Control Certification',
        docType: 'certification',
        issuer: 'Georgia Soil and Water Conservation Commission',
        referenceNumber: 'GSWCC-1A-559281',
        expiryDate: '2028-09-18',
        status: 'active',
        isAttached: true,
        notes: 'Certified Person in Soil Erosion and Sedimentation Control.'
      }
    ];
  });

  // Save credentials when updated
  useEffect(() => {
    localStorage.setItem('tjd_bid_credential_vault', JSON.stringify(credentials));
  }, [credentials]);

  const [isAddingCredential, setIsAddingCredential] = useState(false);
  const [editingCredentialId, setEditingCredentialId] = useState<string | null>(null);
  
  // New credential form state
  const [newCredTitle, setNewCredTitle] = useState('');
  const [newCredType, setNewCredType] = useState<'license' | 'insurance' | 'bonding' | 'certification' | 'custom'>('license');
  const [newCredIssuer, setNewCredIssuer] = useState('');
  const [newCredRef, setNewCredRef] = useState('');
  const [newCredExpiry, setNewCredExpiry] = useState('');
  const [newCredNotes, setNewCredNotes] = useState('');
  const [newCredFileName, setNewCredFileName] = useState('');
  const [newCredFileData, setNewCredFileData] = useState('');

  const handleCredentialFileChange = (e: React.ChangeEvent<HTMLInputElement>, id?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (id) {
        setCredentials(prev => prev.map(c => c.id === id ? { ...c, fileName: file.name, fileData: dataUrl } : c));
      } else {
        setNewCredFileName(file.name);
        setNewCredFileData(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredTitle || !newCredIssuer) {
      alert('Please fill out the title and issuer of the credential.');
      return;
    }

    const payload: Omit<BidCredential, 'id'> = {
      title: newCredTitle,
      docType: newCredType,
      issuer: newCredIssuer,
      referenceNumber: newCredRef || 'N/A',
      expiryDate: newCredExpiry || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      status: 'active',
      isAttached: true,
      notes: newCredNotes,
      fileName: newCredFileName,
      fileData: newCredFileData
    };

    handleAddCredential(payload);

    setNewCredTitle('');
    setNewCredType('license');
    setNewCredIssuer('');
    setNewCredRef('');
    setNewCredExpiry('');
    setNewCredNotes('');
    setNewCredFileName('');
    setNewCredFileData('');
    setIsAddingCredential(false);
  };

  // Initialize submission identification
  useEffect(() => {
    setProjectId(`PROJ-BID-${Date.now().toString().slice(-6)}`);
    
    // Load local client pre-bids history logs
    const loadPastIntakes = () => {
      try {
        let mergedIntakes: any[] = [];
        
        // 1. Get standard client intakes
        const savedIntakes = localStorage.getItem('tjd_client_intakes');
        if (savedIntakes) {
          try {
            mergedIntakes = JSON.parse(savedIntakes);
          } catch (err) {
            console.error('Failed parsing client intakes:', err);
          }
        }

        // Always ensure Annie Knox is pre-seeded as a professional option
        const hasAnnie = mergedIntakes.some((intake: any) => 
          intake.clientName?.toLowerCase().includes('annie') || 
          intake.clientName?.toLowerCase().includes('knox')
        );
        if (!hasAnnie) {
          const annieKnoxDefault = {
            id: 'WISHLIST-ANNIE-KNOX',
            fiId: 'WL-ANNIE',
            submittedAt: new Date().toLocaleDateString(),
            clientName: "Annie Knox",
            jobName: "Annie Knox - 2.4-Mile Roadway Development & Bridge Abutments",
            foreman: "TJ Darley",
            formData: {
              meetingDate: new Date().toLocaleDateString(),
              meetingTime: "09:00 AM",
              foreman: "TJ Darley",
              clientName: "Annie Knox",
              phoneNumber: "706-555-0199",
              emailAddress: "annie.knox@georgiaforest.org",
              mailingAddress: "Greensboro Corridor Roadway Sector B",
              cityStateZip: "Greensboro, GA",
              jobName: "Annie Knox - 2.4-Mile Roadway Development & Bridge Abutments",
              jobNotes: "A new gravel road should be 8 to 12 inches thick in total. Constructed using a three-layer system—the Subgrade, Base Layer, and Surface Course—plus specialized concrete bridge abutments.",
              jobAddress: "Greensboro Corridor Roadway Sector B",
              jobCityStateZip: "Greensboro, GA",
              accessRoadType: "Moderate aggregate road",
              accessNotes: "",
              soilType: "clay",
              lengthFeet: "12672",
              topWidthFeet: "12",
              bottomWidthFeet: "12",
              depthHeightFeet: "1",
              siteSlopePercent: "1.5%",
              clientWants: "2.4-mile high-durability gravel road designed to withstand logging vehicle weight with three-layer construction and heavy dual bridge abutments.",
              specialConcerns: "Hard ceiling budget is $750,000 for entire scope.",
              budgetMentioned: "Under $750,000",
              timeline: "6-8 Weeks",
              areaSquareFeet: 152064
            }
          };
          mergedIntakes.push(annieKnoxDefault);
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
                  // Map BidRequest to ClientIntakeLog structure
                  const mapped: ClientIntakeLog = {
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
            console.error('Failed parsing earthworks bids:', err);
          }
        }
        
        setPastIntakes(mergedIntakes);
      } catch (e) {
        console.warn('Unable to load past client field intakes.', e);
      }
    };

    loadPastIntakes();
    window.addEventListener('tjd_intakes_updated', loadPastIntakes);
    window.addEventListener('tjd_bids_updated', loadPastIntakes);

    const restoreSavedProject = () => {
      try {
        const savedProject = localStorage.getItem('tjd_multiphase_project_total');
        if (savedProject) {
          const parsed = JSON.parse(savedProject);
          if (parsed.compiledPhases) setCompiledPhases(parsed.compiledPhases);
          if (parsed.clientName) setClientName(parsed.clientName);
          if (parsed.clientPhone) setClientPhone(parsed.clientPhone);
          if (parsed.clientEmail) setClientEmail(parsed.clientEmail);
          if (parsed.jobName) setJobName(parsed.jobName);
          if (parsed.foreman) setForeman(parsed.foreman);
          if (parsed.projectId) setProjectId(parsed.projectId);
          if (parsed.jobNumber) setJobNumber(parsed.jobNumber);
          if (parsed.locationAddress) setLocationAddress(parsed.locationAddress);
          if (parsed.projectStatus) setProjectStatus(parsed.projectStatus);
          if (parsed.globalMarkupAdjustment !== undefined) setGlobalMarkupAdjustment(parsed.globalMarkupAdjustment);
          if (parsed.financeChargePercent !== undefined) setFinanceChargePercent(parsed.financeChargePercent);
          if (parsed.estimatedDurationDays !== undefined) setEstimatedDurationDays(parsed.estimatedDurationDays);
          if (parsed.selectedIntakeId) setSelectedIntakeId(parsed.selectedIntakeId);
          if (parsed.pondSiteLength) setPondSiteLength(parsed.pondSiteLength);
          if (parsed.pondSiteWidth) setPondSiteWidth(parsed.pondSiteWidth);
          if (parsed.clearingSides) setClearingSides(parsed.clearingSides);
          if (parsed.useCustomSiteDimensions !== undefined) setUseCustomSiteDimensions(parsed.useCustomSiteDimensions);
          if (parsed.concreteCuringActive !== undefined) setConcreteCuringActive(parsed.concreteCuringActive);
          if (parsed.concreteLengthFt !== undefined) setConcreteLengthFt(parsed.concreteLengthFt);
          if (parsed.concreteWidthFt !== undefined) setConcreteWidthFt(parsed.concreteWidthFt);
          if (parsed.concreteThicknessInches !== undefined) setConcreteThicknessInches(parsed.concreteThicknessInches);
          if (parsed.concreteElementType) setConcreteElementType(parsed.concreteElementType);
          if (parsed.concretePsiGrade) setConcretePsiGrade(parsed.concretePsiGrade);
        }
      } catch (e) {
        console.warn('Unable to restore compiled phases project.', e);
      }
    };

    restoreSavedProject();
    window.addEventListener('tjd_reload_multiphase_project', restoreSavedProject);

    return () => {
      window.removeEventListener('tjd_intakes_updated', loadPastIntakes);
      window.removeEventListener('tjd_reload_multiphase_project', restoreSavedProject);
    };
  }, []);

  // Pre-load preselected intake if routed from Wishlist or Intake Form
  useEffect(() => {
    if (pastIntakes.length > 0) {
      const preselectedId = localStorage.getItem('tjd_preselected_intake_id');
      if (preselectedId) {
        handleIntakeSelectChange(preselectedId);
        localStorage.removeItem('tjd_preselected_intake_id');
      }
    }
  }, [pastIntakes]);

  // Automatic Daily Fuel Price Update on startup / load
  useEffect(() => {
    if (!enableFuelAdjustment) return;
    const todayString = new Date().toLocaleDateString();
    const lastCheckDate = localStorage.getItem('tjd_last_diesel_check_date');
    if (lastCheckDate !== todayString) {
      handleCheckLiveDieselPrice();
      localStorage.setItem('tjd_last_diesel_check_date', todayString);
    }
  }, [enableFuelAdjustment]);

  // Compute live geometry values based on dimensions changing
  useEffect(() => {
    const L = parseFloat(lengthFeet) || 0;
    const TW = parseFloat(topWidthFeet) || 0;
    const BW = parseFloat(bottomWidthFeet) || 0;
    const D = parseFloat(depthFeet) || 0;

    const avgW = BW > 0 ? (TW + BW) / 2 : TW;
    const computedArea = L * avgW;
    const computedVolume = (computedArea * D) / 27;

    setAreaSqFt(Math.round(computedArea));
    setExcavationCuYds(Math.round(computedVolume));
  }, [lengthFeet, topWidthFeet, bottomWidthFeet, depthFeet]);

  // Sync current calculations with selected subphase and parameters
  useEffect(() => {
    generateItemsFromSubPhase(selectedSubPhase);
  }, [
    selectedSubPhase, areaSqFt, excavationCuYds, soilType, accessType,
    keywayLengthFeet, keywayBottomWidthFeet, keywayDepthFeet, keywaySideSlope,
    spillwayLengthFeet, spillwayWidthFeet, spillwayRiprapThicknessInches, spillwayOnBothSides, lengthFeet,
    pondSiteLength, pondSiteWidth, clearingSides, useCustomSiteDimensions
  ]);

  // Recalculate line item sum whenever items change
  useEffect(() => {
    const sum = currentLineItems.reduce((acc, item) => acc + item.totalCost, 0);
    setCurrentLineItemsCostTotal(sum);
    // Autofill subcontractor cost with standard sum for easy reference
    setSubcontractorCost(sum.toString());
  }, [currentLineItems]);

  // Automatically pre-populate 6 standard pond construction phases using selected parameters
  const autoPopulateAllPhases = (params?: {
    L?: number;
    TW?: number;
    BW?: number;
    D?: number;
    soil?: string;
    access?: string;
    cName?: string;
    jName?: string;
    fMan?: string;
    loc?: string;
    intakeId?: string;
    untouchedSpring?: boolean;
    pondSiteLength?: number;
    pondSiteWidth?: number;
    clearingSides?: string;
  }) => {
    const finalL = params?.L !== undefined ? params.L : (parseFloat(lengthFeet) || 0);
    const finalTW = params?.TW !== undefined ? params.TW : (parseFloat(topWidthFeet) || 0);
    const finalBW = params?.BW !== undefined ? params.BW : (parseFloat(bottomWidthFeet) || 0);
    const finalD = params?.D !== undefined ? params.D : (parseFloat(depthFeet) || 0);
    const finalSoil = params?.soil !== undefined ? params.soil : soilType;
    const finalAccess = params?.access !== undefined ? params.access : accessType;
    const finalSpring = params?.untouchedSpring !== undefined ? params.untouchedSpring : untouchedSpring;

    const finalPondSiteLength = params?.pondSiteLength !== undefined ? params.pondSiteLength : (parseFloat(pondSiteLength) || 500);
    const finalPondSiteWidth = params?.pondSiteWidth !== undefined ? params.pondSiteWidth : (parseFloat(pondSiteWidth) || 305);
    const finalClearingSides = params?.clearingSides !== undefined ? params.clearingSides : clearingSides;

    const finalClient = params?.cName !== undefined ? params.cName : clientName;
    const finalJob = params?.jName !== undefined ? params.jName : jobName;
    const finalForeman = params?.fMan !== undefined ? params.fMan : foreman;
    const finalLocation = params?.loc !== undefined ? params.loc : locationAddress;

    const avgW = finalBW > 0 ? (finalTW + finalBW) / 2 : finalTW;
    const calculatedArea = Math.round(finalL * avgW);
    const calculatedVolume = Math.round((calculatedArea * finalD) / 27);

    // Dynamic keyway defaults of this intake geometry
    const kLen = finalL;
    const kBot = 8;
    const kDep = 4;
    const kSlope = 1.0;

    // Spillway defaults of this intake geometry
    const sLen = 50;
    const sWid = 12;
    const sThick = 18;
    const sBoth = false;

    const isRoadProject = finalJob.toLowerCase().includes('road') || 
                          finalJob.toLowerCase().includes('driveway') || 
                          finalJob.toLowerCase().includes('wishlist') || 
                          (params?.intakeId && params.intakeId.includes('WISHLIST')) ||
                          (selectedIntakeId && selectedIntakeId.includes('WISHLIST')) ||
                          (params?.jName && params.jName.toLowerCase().includes('road')) ||
                          finalClient.toLowerCase().includes('annie') ||
                          finalClient.toLowerCase().includes('knox');

    const stepsToUse = isRoadProject ? [
      {
        phaseName: "Phase 1 - Land Clearing & Corridor Prep",
        subPhaseName: "Forestry Mulching & Brush Clearing",
        templateId: "B" as const,
        notes: "Clear and mulch standard 12-ft wide 2.4-mile corridor (152,064 sq ft net area) to prepare virgin Georgia red clay for heavy equipment traffic."
      },
      {
        phaseName: "Phase 2 - Foundation Geotextile Underlayment",
        subPhaseName: "Subgrade Geotextile Fabric Laying",
        templateId: "D" as const,
        notes: "Deploy high-strength non-woven separation and stabilization fabric directly over cleared subgrade. Prevents ballast aggregates from sinking into subgrade clay under heavy logging trucks."
      },
      {
        phaseName: "Phase 3 - Heavy Aggregate Base Layer",
        subPhaseName: "Surge Stone Stabilizing Base Layer",
        templateId: "D" as const,
        notes: "Lay and compact heavy 4-inch to 8-inch surge granite ballast stone base to form a rigid structural bridge spanning clay pockets."
      },
      {
        phaseName: "Phase 4 - Roadway Surface Course & Crown Grading",
        subPhaseName: "Transit Motor Grader Leveling & Crown Profile",
        templateId: "D" as const,
        notes: "Form dual crowned side drainage ditches and grade crusher-run finish layer. Stabilizes finish grade for high-durability usage."
      }
    ] : [
      {
        phaseName: "Phase 1 - Preliminary Site Prep",
        subPhaseName: "Heavy Equipment Fleet Mobilization & Site Transport (UTV)",
        templateId: "B" as const,
        notes: "Mobilizes heavy machinery fleet lowboys and stages 4x4 UTV for rapid runs to mobile tool trailer & parts acquisition."
      },
      {
        phaseName: "Phase 1 - Preliminary Site Prep",
        subPhaseName: "Forestry Mulching & Brush Clearing",
        templateId: "B" as const,
        notes: "Automated pre-bid blueprint component to ensure full-site compliance."
      },
      {
        phaseName: "Phase 1 - Preliminary Site Prep",
        subPhaseName: "Organic Stump Grubbing & Removal",
        templateId: "B" as const,
        notes: "Automated pre-bid blueprint component to ensure full-site compliance."
      },
      {
        phaseName: "Phase 1 - Preliminary Site Prep",
        subPhaseName: "Perimeter Silt Fence Erosion Controls",
        templateId: "B" as const,
        notes: "Automated pre-bid blueprint component to ensure full-site compliance."
      },
      {
        phaseName: "Phase 1 - Preliminary Site Prep",
        subPhaseName: "Subgrade Geotextile Fabric Laying",
        templateId: "D" as const,
        notes: "Automated pre-bid blueprint component to ensure full-site compliance."
      },
      {
        phaseName: "Phase 2 - Mass Grading & Excavating",
        subPhaseName: "Deep Clay Core Keyway Trench Excavation",
        templateId: "A" as const,
        notes: "Automated pre-bid blueprint component to ensure full-site compliance."
      },
      {
        phaseName: "Phase 2 - Mass Grading & Excavating",
        subPhaseName: "Mass Excavation, Pond Basin Shaping & Dam Structural Fill",
        templateId: "A" as const,
        notes: "Automated pre-bid blueprint component to ensure full-site compliance."
      },
      {
        phaseName: "Phase 3 - Pond & Clay Pad Base",
        subPhaseName: "Water Overflow HDPE Piping Installation",
        templateId: "D" as const,
        notes: "Automated pre-bid blueprint component to ensure full-site compliance."
      },
      {
        phaseName: "Phase 3 - Pond & Clay Pad Base",
        subPhaseName: "Silt Retaining Basin Spillway Rocks Rip-Rap",
        templateId: "A" as const,
        notes: "Automated pre-bid blueprint component to ensure full-site compliance."
      },
      {
        phaseName: "Phase 5 - Permanent Stabilization",
        subPhaseName: "Topsoil Dressing & Seeding Stabilization",
        templateId: "B" as const,
        notes: "Automated pre-bid blueprint component to ensure full-site compliance."
      }
    ];

    const templateNames = {
      'A': 'Pond/Dam Excavation & Heavy Cut/Fill',
      'B': 'Forestry Mulching & Land Clearing',
      'C': 'Structured Clay Pad Development',
      'D': 'Roadway, Sub-Base & Aggregates'
    };

    let newPhases: EstimateSubPhase[] = stepsToUse.map((step, idx) => {
      // Run the dynamic subsurface workbook generator in pure mode (shouldSetState = false)
      const items = generateItemsFromSubPhase(
        step.subPhaseName,
        {
          L: finalL,
          TW: finalTW,
          BW: finalBW,
          D: finalD,
          areaSqFt: calculatedArea,
          excavationCuYds: calculatedVolume,
          soilType: finalSoil,
          accessType: finalAccess,
          kLength: kLen,
          kBottomW: kBot,
          kDepth: kDep,
          kSlope: kSlope,
          sLength: sLen,
          sWidth: sWid,
          sThickness: sThick,
          sBoth: sBoth,
          untouchedSpring: finalSpring,
          pondSiteLength: finalPondSiteLength,
          pondSiteWidth: finalPondSiteWidth,
          clearingSides: finalClearingSides
        },
        false
      );

      const computedValue = items.reduce((acc, it) => acc + it.totalCost, 0);
      const bidPrice = Math.round(computedValue * (1 + markupPercent / 100));

      return {
        id: `PHS-${Date.now().toString().slice(-4)}-${idx}`,
        phaseName: step.phaseName,
        subPhaseName: step.subPhaseName,
        templateId: step.templateId,
        templateName: templateNames[step.templateId],
        lineItems: items,
        itemCostTotal: computedValue,
        markupPercent: markupPercent,
        totalBidPrice: bidPrice,
        geometryUsed: {
          lengthFeet: finalL,
          topWidthFeet: finalTW,
          bottomWidthFeet: finalBW,
          depthFeet: finalD,
          areaSqFt: calculatedArea,
          excavationCuYds: calculatedVolume,
          soilType: finalSoil.toUpperCase(),
          accessType: finalAccess.toUpperCase()
        },
        notes: step.notes
      };
    });

    if (isRoadProject) {
      newPhases.push({
        id: `PHS-${Date.now().toString().slice(-4)}-sub`,
        phaseName: "Phase 5 - Structural Bridge Abutments",
        subPhaseName: "Specialized Concrete Abutments",
        templateId: 'C',
        templateName: templateNames['C'],
        lineItems: [],
        itemCostTotal: 290000,
        markupPercent: 10,
        totalBidPrice: 319000,
        geometryUsed: {
          lengthFeet: 35,
          topWidthFeet: 12,
          bottomWidthFeet: 12,
          depthFeet: 4,
          areaSqFt: 420,
          excavationCuYds: 62,
          soilType: finalSoil.toUpperCase(),
          accessType: finalAccess.toUpperCase()
        },
        notes: "Heavy dual concrete bridge abutments with wing walls, deep foundational anchors, and structural rebar grid reinforcement to support future timber bridge crossing.",
        isSubcontracted: true,
        subcontractorName: "Georgia Bridge & Structural Concrete LLC (1099)",
        subcontractorCost: 290000,
        subcontractorMarkupPercent: 10
      });
    }

    setCompiledPhases(newPhases);

    // Save standard project totals to local storage
    const projectSaveObj = {
      projectId,
      jobNumber: jobNumber || `JOB-TJD-${Date.now().toString().slice(-4)}`,
      clientName: finalClient || 'Unassigned Client',
      jobName: finalJob || 'New Pond Construction Bid',
      foreman: finalForeman || 'Supervisor On Duty',
      locationAddress: finalLocation || 'Site Coordinates Pending',
      selectedIntakeId: params?.intakeId !== undefined ? params.intakeId : selectedIntakeId,
      compiledPhases: newPhases,
      pondSiteLength: params?.pondSiteLength !== undefined ? params.pondSiteLength.toString() : pondSiteLength,
      pondSiteWidth: params?.pondSiteWidth !== undefined ? params.pondSiteWidth.toString() : pondSiteWidth,
      clearingSides: params?.clearingSides !== undefined ? params.clearingSides : clearingSides,
      useCustomSiteDimensions: true
    };
    localStorage.setItem('tjd_multiphase_project_total', JSON.stringify(projectSaveObj));
  };

  // Pre-fill fields from local client field intakes dropdown selection
  const handleIntakeSelectChange = (id: string) => {
    setSelectedIntakeId(id);
    const matched = pastIntakes.find(i => i.id === id);
    if (matched) {
      const cName = matched.clientName || '';
      const jName = matched.jobName || '';
      const fMan = matched.foreman || '';
      
      if (cName) setClientName(cName);
      if (jName) setJobName(jName);
      if (fMan) setForeman(fMan);
      
      let lengthVal = '300';
      let topWidthVal = '80';
      let bottomWidthVal = '60';
      let depthVal = '4';
      let slopeVal = '1.5%';
      let soilVal = 'clay';
      let accessVal = 'easy';
      let fullAddr = '';

      // Attempt preloading complete geometry & demographic specifications if included!
      if (matched.formData) {
        const fd = matched.formData;
        if (fd.lengthFeet) {
          lengthVal = fd.lengthFeet;
          setLengthFeet(fd.lengthFeet);
        }
        if (fd.topWidthFeet) {
          topWidthVal = fd.topWidthFeet;
          setTopWidthFeet(fd.topWidthFeet);
        }
        if (fd.bottomWidthFeet) {
          bottomWidthVal = fd.bottomWidthFeet;
          setBottomWidthFeet(fd.bottomWidthFeet);
        }
        if (fd.depthHeightFeet) {
          depthVal = fd.depthHeightFeet;
          setDepthFeet(fd.depthHeightFeet);
        }
        if (fd.siteSlopePercent) {
          slopeVal = fd.siteSlopePercent;
          setSiteSlope(fd.siteSlopePercent);
        }
        if (fd.soilType) {
          soilVal = fd.soilType;
          setSoilType(fd.soilType);
        }
        if (fd.accessRoadType) {
          const accLower = fd.accessRoadType.toLowerCase();
          if (accLower.includes('steep') || accLower.includes('difficult')) {
            accessVal = 'difficult';
            setAccessType('difficult');
          } else if (accLower.includes('paved')) {
            accessVal = 'easy';
            setAccessType('easy');
          } else {
            accessVal = 'moderate';
            setAccessType('moderate');
          }
        }
        if (fd.jobAddress) {
          fullAddr = `${fd.jobAddress} ${fd.jobCityStateZip || ''}`.trim();
          setLocationAddress(fullAddr);
        }
        if (fd.lengthFeet) {
          setPondSiteLength(fd.lengthFeet);
        }
        if (fd.bottomWidthFeet) {
          setPondSiteWidth(fd.bottomWidthFeet);
        }
        setUseCustomSiteDimensions(true);
      }

      // Automatically pre-populate all 6 essential construction phases for the foreman!
      autoPopulateAllPhases({
        L: parseFloat(lengthVal) || 0,
        TW: parseFloat(topWidthVal) || 0,
        BW: parseFloat(bottomWidthVal) || 0,
        D: parseFloat(depthVal) || 0,
        soil: soilVal,
        access: accessVal,
        cName,
        jName,
        fMan,
        loc: fullAddr,
        intakeId: id,
        untouchedSpring: matched.formData?.untouchedSpring !== undefined ? Boolean(matched.formData.untouchedSpring) : untouchedSpring,
        pondSiteLength: matched.formData?.lengthFeet ? parseFloat(matched.formData.lengthFeet) : 500,
        pondSiteWidth: matched.formData?.bottomWidthFeet ? parseFloat(matched.formData.bottomWidthFeet) : 305,
        clearingSides: '3'
      });

      alert(`⚡ Intelli-Pond System Loaded! Auto-populated and compiled all 6 required phases/subphases from pre-bid intake "${jName}". Total materials and equipment lists have been compiled.`);
    }
  };

  const handlePhaseSelectChange = (phase: string) => {
    setSelectedPhase(phase);
    let defaultSub = '';
    if (phase.includes('Phase 1')) {
      defaultSub = "Forestry Mulching & Brush Clearing";
    } else if (phase.includes('Phase 2')) {
      defaultSub = "Organic Topsoil Stripping & Stockpiling";
    } else if (phase.includes('Phase 3')) {
      defaultSub = "Deep Clay Core Keyway Fishing Pond Digging";
    } else if (phase.includes('Phase 4')) {
      defaultSub = "Crowned Gravel Driveway Construction";
    } else if (phase.includes('Phase 5')) {
      defaultSub = "Transit Motor Grader Leveling & Crown Profile";
    }
    
    if (defaultSub) {
      setSelectedSubPhase(defaultSub);
      const mappedTemplateForSub = subPhaseToTemplateMap[defaultSub] || 'B';
      setSelectedTemplate(mappedTemplateForSub);
    }
  };

  const handleSubPhaseSelectChange = (sub: string) => {
    setSelectedSubPhase(sub);
    const mappedTemplateForSub = subPhaseToTemplateMap[sub] || 'B';
    setSelectedTemplate(mappedTemplateForSub);
  };

  // Live Formula Dynamic Sub-Phase Mapping Generator ("Workbook Subsurface Engine")
  const generateItemsFromSubPhase = (
    subPhaseName: string,
    customInputs?: {
      L?: number;
      TW?: number;
      BW?: number;
      D?: number;
      areaSqFt?: number;
      excavationCuYds?: number;
      soilType?: string;
      accessType?: string;
      kLength?: number;
      kBottomW?: number;
      kDepth?: number;
      kSlope?: number;
      sLength?: number;
      sWidth?: number;
      sThickness?: number;
      sBoth?: boolean;
      untouchedSpring?: boolean;
      pondSiteLength?: number;
      pondSiteWidth?: number;
      clearingSides?: string;
      useCustomSiteDimensions?: boolean;
    },
    shouldSetState: boolean = true
  ): LineItem[] => {
    const L = customInputs?.L !== undefined ? customInputs.L : (parseFloat(lengthFeet) || 0);
    const TW = customInputs?.TW !== undefined ? customInputs.TW : (parseFloat(topWidthFeet) || 0);
    const BW = customInputs?.BW !== undefined ? customInputs.BW : (parseFloat(bottomWidthFeet) || 0);
    const D = customInputs?.D !== undefined ? customInputs.D : (parseFloat(depthFeet) || 0);

    const kLength = customInputs?.kLength !== undefined ? customInputs.kLength : (parseFloat(keywayLengthFeet) || L);
    const kBottomW = customInputs?.kBottomW !== undefined ? customInputs.kBottomW : (parseFloat(keywayBottomWidthFeet) || 8);
    const kDepth = customInputs?.kDepth !== undefined ? customInputs.kDepth : (parseFloat(keywayDepthFeet) || 4);
    const kSlope = customInputs?.kSlope !== undefined ? customInputs.kSlope : (parseFloat(keywaySideSlope) || 1.0);

    const sLength = customInputs?.sLength !== undefined ? customInputs.sLength : (parseFloat(spillwayLengthFeet) || 50);
    const sWidth = customInputs?.sWidth !== undefined ? customInputs.sWidth : (parseFloat(spillwayWidthFeet) || 12);
    const sThickness = customInputs?.sThickness !== undefined ? customInputs.sThickness : (parseFloat(spillwayRiprapThicknessInches) || 18);
    const sBoth = customInputs?.sBoth !== undefined ? customInputs.sBoth : spillwayOnBothSides;

    const activeSoilType = customInputs?.soilType !== undefined ? customInputs.soilType : soilType;
    const activeAccessType = customInputs?.accessType !== undefined ? customInputs.accessType : accessType;
    const activeUntouchedSpring = customInputs?.untouchedSpring !== undefined ? customInputs.untouchedSpring : untouchedSpring;

    const siteL = customInputs?.pondSiteLength !== undefined ? customInputs.pondSiteLength : (parseFloat(pondSiteLength) || 500);
    const siteW = customInputs?.pondSiteWidth !== undefined ? customInputs.pondSiteWidth : (parseFloat(pondSiteWidth) || 305);
    const sidesClear = customInputs?.clearingSides !== undefined ? customInputs.clearingSides : clearingSides;
    const activeUseCustomSite = customInputs?.useCustomSiteDimensions !== undefined ? customInputs.useCustomSiteDimensions : useCustomSiteDimensions;

    let items: LineItem[] = [];

    // Base difficulty adjustment multipliers
    let soilMultiplier = 1.0;
    if (activeSoilType === 'clay') soilMultiplier = 1.25; // Compacted weight scaling
    else if (activeSoilType === 'rocky') soilMultiplier = 1.50; // Granite excavating stress
    else if (activeSoilType === 'sand') soilMultiplier = 0.85; // Faster machine cycling

    let accessMultiplier = 1.0;
    if (activeAccessType === 'difficult') accessMultiplier = 1.25;
    else if (activeAccessType === 'moderate') accessMultiplier = 1.10;

    const activeAreaSqFtVal = customInputs?.areaSqFt !== undefined ? customInputs.areaSqFt : areaSqFt;
    const activeExcavationCuYds = customInputs?.excavationCuYds !== undefined ? customInputs.excavationCuYds : excavationCuYds;

    const activeSiteAreaSqFt = activeUseCustomSite ? siteL * siteW : activeAreaSqFtVal;
    
    // Clear factor: All = 1.0, 3 sides = 0.75, 2 sides = 0.50, 1 side = 0.25
    let clearingFactor = 1.0;
    if (sidesClear === '3') clearingFactor = 0.75;
    else if (sidesClear === '2') clearingFactor = 0.50;
    else if (sidesClear === '1') clearingFactor = 0.25;

    const activeClearingAreaSqFt = activeSiteAreaSqFt * clearingFactor;
    const activeClearingAcres = Math.max(0.1, Math.round((activeClearingAreaSqFt / 43560) * 100) / 100);

    const calcAcres = activeClearingAcres;
    const calcAreaSqFt = activeClearingAreaSqFt;
    const calcActiveAreaSqFt = activeClearingAreaSqFt;

    {
      const acres = calcAcres;
      const areaSqFt = calcAreaSqFt;
      const activeAreaSqFt = calcActiveAreaSqFt;

      switch (subPhaseName) {
      case "Heavy Equipment Fleet Mobilization & Site Transport (UTV)": {
        const mobDays = Math.max(1, Math.ceil(areaSqFt / 40000));
        const utvHours = mobDays * 8;
        items = [
          {
            id: '1',
            category: 'Subcontract',
            description: 'Heavy Commercial Equipment Fleet Lowboy Mobilization & Transit',
            quantity: 1,
            unit: 'Flat Fee',
            unitPrice: 650,
            totalCost: 650
          },
          {
            id: '2',
            category: 'Equipment',
            description: 'Site Mobilization 4x4 UTV (Rapid tool trailer, parts & supply acquisition transport)',
            quantity: utvHours,
            unit: 'Hours',
            unitPrice: 25,
            totalCost: utvHours * 25
          },
          {
            id: '3',
            category: 'Labor',
            description: 'Site mobilization foreman & tool trailer inventory coordinator',
            quantity: utvHours,
            unit: 'Hours',
            unitPrice: 65,
            totalCost: utvHours * 65
          },
          {
            id: '4',
            category: 'Materials',
            description: 'Tool Trailer Supplies & UTV Field Logistics Package (Hardware, Chains, Safety Gear)',
            quantity: 1,
            unit: 'Package',
            unitPrice: 250,
            totalCost: 250
          }
        ];
        break;
      }

      case "Jobsite General Conditions (Sanitary Facilities, Insurance & Permits)": {
        const estMonths = Math.max(1, Math.ceil(areaSqFt / 43560));
        items = [
          {
            id: '1',
            category: 'Materials',
            description: 'Sanitary Facilities (Portable Restroom & Weekly Service Pump-out)',
            quantity: estMonths,
            unit: 'Months',
            unitPrice: 220,
            totalCost: estMonths * 220
          },
          {
            id: '2',
            category: 'Materials',
            description: 'Commercial General Liability & Inland Marine Equipment Insurance Premium Rider',
            quantity: 1,
            unit: 'Flat Fee',
            unitPrice: 450,
            totalCost: 450
          },
          {
            id: '3',
            category: 'Materials',
            description: 'Municipal Land Disturbance Permit & NPDES Erosion Inspection Fees',
            quantity: 1,
            unit: 'Permit Fee',
            unitPrice: 350,
            totalCost: 350
          },
          {
            id: '4',
            category: 'Materials',
            description: 'Temporary Jobsite Utilities (Generator Power & Water Hookups)',
            quantity: estMonths,
            unit: 'Months',
            unitPrice: 280,
            totalCost: estMonths * 280
          },
          {
            id: '5',
            category: 'Labor',
            description: 'Site Safety, OSHA Compliance & Quality Assurance Inspector',
            quantity: estMonths * 8,
            unit: 'Hours',
            unitPrice: 65,
            totalCost: estMonths * 8 * 65
          }
        ];
        break;
      }

      case "Forestry Mulching & Brush Clearing": {
        const adjustedAcres = activeUntouchedSpring ? Math.max(0.3, acres * 0.35) : acres;
        const mulcherHours = Math.max(6, Math.round(adjustedAcres * 7.5 * soilMultiplier * accessMultiplier));
        const rootRakeHours = Math.max(4, Math.round(adjustedAcres * 4));
        const haulingLoads = Math.ceil(adjustedAcres * 1.5);
        const utvHours = Math.max(8, Math.round(adjustedAcres * 4));
        items = [
          {
            id: '1',
            category: 'Equipment',
            description: 'Cat 299D3 Land Management tracked compact forestry mulcher (Rapid wood shredding)',
            quantity: mulcherHours,
            unit: 'Hours',
            unitPrice: 245,
            totalCost: mulcherHours * 245
          },
          {
            id: '2',
            category: 'Equipment',
            description: 'Cat D5 tracked Dozer with root rake (Stripping slash piles, pine clearing)',
            quantity: rootRakeHours,
            unit: 'Hours',
            unitPrice: 195,
            totalCost: rootRakeHours * 195
          },
          {
            id: '3',
            category: 'Equipment',
            description: 'Site Mobilization 4x4 UTV (Rapid tool trailer & supply retrieval transport)',
            quantity: utvHours,
            unit: 'Hours',
            unitPrice: 25,
            totalCost: utvHours * 25
          },
          {
            id: '4',
            category: 'Labor',
            description: 'Heavy Tree chainsaw operator (Slicing overhang boundary branches)',
            quantity: Math.max(8, Math.round(acres * 6)),
            unit: 'Hours',
            unitPrice: 48,
            totalCost: Math.max(8, Math.round(acres * 6)) * 48
          },
          {
            id: '5',
            category: 'Subcontract',
            description: 'Hauling stump & organic brush debris to local site processing',
            quantity: haulingLoads,
            unit: 'Truck Loads',
            unitPrice: 320,
            totalCost: haulingLoads * 320
          }
        ];
        break;
      }

      case "Perimeter Silt Fence Erosion Controls": {
        let fenceLinearFt = Math.round(L * 1.20) || 100;
        if (activeUseCustomSite) {
          if (sidesClear === '3') {
            fenceLinearFt = Math.round(2 * siteL + siteW);
          } else if (sidesClear === '2') {
            fenceLinearFt = Math.round(siteL + siteW);
          } else if (sidesClear === '1') {
            fenceLinearFt = Math.round(siteL);
          } else {
            fenceLinearFt = Math.round(2 * (siteL + siteW));
          }
        }
        const fenceRolls = Math.ceil(fenceLinearFt / 100);
        const labHrs = Math.max(8, Math.round(fenceLinearFt * 0.04));
        const skHrs = Math.max(4, Math.round(fenceLinearFt * 0.015));
        items = [
          {
            id: '1',
            category: 'Materials',
            description: 'Commercial Grade Silt Fence roll with pre-attached oak stakes (100Ft sections)',
            quantity: fenceRolls,
            unit: 'Rolls',
            unitPrice: 185,
            totalCost: fenceRolls * 185
          },
          {
            id: '2',
            category: 'Labor',
            description: 'Erosion control installer team driving stakes and trench pinning',
            quantity: labHrs,
            unit: 'Hours',
            unitPrice: 48,
            totalCost: labHrs * 48
          },
          {
            id: '3',
            category: 'Equipment',
            description: 'Mini Excavator / Skid Steer with static offset trencher attachment',
            quantity: skHrs,
            unit: 'Hours',
            unitPrice: 125,
            totalCost: skHrs * 125
          }
        ];
        break;
      }

      case "Construction Entrance Rock Setup": {
        const rockTonsNeeded = Math.round(L * 0.15) || 18;
        const rollsNeeded = Math.ceil(areaSqFt / 3000) || 1;
        items = [
          {
            id: '1',
            category: 'Materials',
            description: '2"-3" Georgia High-Surge Granite Ballast/Entrance Aggregates',
            quantity: rockTonsNeeded,
            unit: 'Tons',
            unitPrice: 42,
            totalCost: rockTonsNeeded * 42
          },
          {
            id: '2',
            category: 'Materials',
            description: 'Woven Soil-Separation and Mud Filter Geotextile stabilization fabric (12.5ft x 100ft rolls)',
            quantity: rollsNeeded,
            unit: 'Rolls',
            unitPrice: 420,
            totalCost: rollsNeeded * 420
          },
          {
            id: '3',
            category: 'Equipment',
            description: 'Cat Compact Track Loader spreading entrance aggregates',
            quantity: 6,
            unit: 'Hours',
            unitPrice: 145,
            totalCost: 6 * 145
          },
          {
            id: '4',
            category: 'Labor',
            description: 'Ground support installer leveling corners and pinning geotextile',
            quantity: 6,
            unit: 'Hours',
            unitPrice: 42,
            totalCost: 6 * 42
          }
        ];
        break;
      }

      case "Organic Topsoil Stripping & Stockpiling": {
        const dozerHours = Math.max(8, Math.round((areaSqFt / 3200) * soilMultiplier * accessMultiplier));
        const excavatorHours = Math.max(4, Math.round(dozerHours * 0.5));
        items = [
          {
            id: '1',
            category: 'Equipment',
            description: 'Cat D6 tracked bulldozer strip organic loam & blade stockpile on-site',
            quantity: dozerHours,
            unit: 'Hours',
            unitPrice: 210,
            totalCost: dozerHours * 210
          },
          {
            id: '2',
            category: 'Equipment',
            description: 'Cat 320 excavator loading/contouring buffer stockpiles',
            quantity: excavatorHours,
            unit: 'Hours',
            unitPrice: 220,
            totalCost: excavatorHours * 220
          },
          {
            id: '3',
            category: 'Labor',
            description: 'Grade operator scanning sub-grade loam boundaries (Laser levels)',
            quantity: dozerHours,
            unit: 'Hours',
            unitPrice: 55,
            totalCost: dozerHours * 55
          }
        ];
        break;
      }

      case "Rock Stratum Obstruction Jackhammering": {
        let rockDivisor = 14;
        if (excavationCuYds > 1000) {
          rockDivisor = 55;
        } else if (excavationCuYds > 100) {
          rockDivisor = 28;
        }
        const hammerHours = Math.max(8, Math.round((excavationCuYds / rockDivisor) * soilMultiplier * accessMultiplier));
        const drillHours = Math.max(6, Math.round(hammerHours * 0.8));
        items = [
          {
            id: '1',
            category: 'Equipment',
            description: 'Heavy Cat 320 Excavator with 5000 ft-lb hydraulic hammer tip attachment',
            quantity: hammerHours,
            unit: 'Hours',
            unitPrice: 325,
            totalCost: hammerHours * 325
          },
          {
            id: '2',
            category: 'Labor',
            description: 'Rotary pneumatic rig operator / pneumatic line drilling safety crew',
            quantity: drillHours,
            unit: 'Hours',
            unitPrice: 65,
            totalCost: drillHours * 65
          },
          {
            id: '3',
            category: 'Labor',
            description: 'Ground watch safety flagger spotting rock fragment trajectories',
            quantity: hammerHours,
            unit: 'Hours',
            unitPrice: 42,
            totalCost: hammerHours * 42
          },
          {
            id: '4',
            category: 'Subcontract',
            description: 'Heavy commercial excavator lowboy mobilization / travel permit surcharge',
            quantity: 1,
            unit: 'Flat Fee',
            unitPrice: 450,
            totalCost: 450
          }
        ];
        break;
      }

      case "Organic Stump Grubbing & Removal": {
        const adjustedAreaSqFt = activeUntouchedSpring ? areaSqFt * 0.35 : areaSqFt;
        const grubHours = Math.max(8, Math.round((adjustedAreaSqFt / 3600) * soilMultiplier * accessMultiplier));
        const pileLoads = Math.ceil(adjustedAreaSqFt / 14000) || 1;
        items = [
          {
            id: '1',
            category: 'Equipment',
            description: 'Cat 320 Excavator fitted with dual root-shear & stump ripper teeth',
            quantity: grubHours,
            unit: 'Hours',
            unitPrice: 235,
            totalCost: grubHours * 235
          },
          {
            id: '2',
            category: 'Equipment',
            description: 'Cat D6 Dozer consolidating slash piles for controlled disposal',
            quantity: Math.round(grubHours * 0.75) || 6,
            unit: 'Hours',
            unitPrice: 210,
            totalCost: (Math.round(grubHours * 0.75) || 6) * 210
          },
          {
            id: '3',
            category: 'Subcontract',
            description: 'Hauling stump & root ballast debris via high-volume waste transport tubs',
            quantity: pileLoads,
            unit: 'Truck Loads',
            unitPrice: 380,
            totalCost: pileLoads * 380
          }
        ];
        break;
      }

      case "Deep Clay Core Keyway Trench Excavation": {
        const kAvgWidth = kBottomW + (kSlope * kDepth);
        const kArea = kAvgWidth * kDepth;
        const kVolCY = (kLength * kArea) / 27;
        const kTonsClay = Math.round(kVolCY * 1.45);
        const kExcHrs = Math.max(8, Math.round(kVolCY / 30));
        items = [
          {
            id: '1',
            category: 'Equipment',
            description: `Cat 315 Keyway Cutoff Trencher (Excavating ${Math.round(kVolCY)} CY Core Trench Centerline)`,
            quantity: kExcHrs,
            unit: 'Hours',
            unitPrice: getRate(185, "excavator_grubbing_rate"),
            totalCost: kExcHrs * getRate(185, "excavator_grubbing_rate")
          },
          {
            id: '2',
            category: 'Equipment',
            description: 'Cat D6 Track Bulldozer (Clay leveling & keyway packing)',
            quantity: Math.round(kExcHrs * 0.8) || 8,
            unit: 'Hours',
            unitPrice: getRate(210, "dozer_heavy_rate"),
            totalCost: (Math.round(kExcHrs * 0.8) || 8) * getRate(210, "dozer_heavy_rate")
          },
          {
            id: '3',
            category: 'Labor',
            description: 'Licensed Grade Foreman on-site (Laser-transit depth checking)',
            quantity: kExcHrs,
            unit: 'Hours',
            unitPrice: getRate(75, "foreman_rate"),
            totalCost: kExcHrs * getRate(75, "foreman_rate")
          },
          {
            id: '4',
            category: 'Materials',
            description: `Compacted Red Sealing Clay Core Fill (${kTonsClay} Tons delivered @ 1.45T/CY)`,
            quantity: kTonsClay,
            unit: 'Tons',
            unitPrice: getRate(32, "clay_delivered_per_ton"),
            totalCost: kTonsClay * getRate(32, "clay_delivered_per_ton")
          }
        ];
        break;
      }

      case "Water Overflow HDPE Piping Installation": {
        const pipeSections = 2; // Default for normal pond geometries
        const pipeExcHours = Math.max(8, pipeSections * 4);
        items = [
          {
            id: '1',
            category: 'Equipment',
            description: 'Cat 305 Compact Mini Excavator (Precision trench grading)',
            quantity: pipeExcHours,
            unit: 'Hours',
            unitPrice: getRate(145, "excavator_5t_rate"),
            totalCost: pipeExcHours * getRate(145, "excavator_5t_rate")
          },
          {
            id: '2',
            category: 'Labor',
            description: 'Pipe placement & coupling tech (Joint sealing & alignment)',
            quantity: Math.round(pipeExcHours * 1.5),
            unit: 'Hours',
            unitPrice: getRate(42, "ground_support_rate"),
            totalCost: Math.round(pipeExcHours * 1.5) * getRate(42, "ground_support_rate")
          },
          {
            id: '3',
            category: 'Materials',
            description: 'Water Overflow HDPE Intake Pipe (18" x 40Ft sections)',
            quantity: pipeSections,
            unit: 'Sections',
            unitPrice: getRate(650, "hdpe_pipe_cost"),
            totalCost: pipeSections * getRate(650, "hdpe_pipe_cost")
          },
          {
            id: '4',
            category: 'Materials',
            description: 'Anti-seep concrete collars (Prevents trench water piping bypass)',
            quantity: 2,
            unit: 'Collars',
            unitPrice: 185,
            totalCost: 2 * 185
          }
        ];
        break;
      }

      case "Mass Excavation, Pond Basin Shaping & Dam Structural Fill": {
        const volumeReductionFactor = activeUntouchedSpring ? 0.22 : 1.0;
        const adjustedExcavationCuYds = Math.round(excavationCuYds * volumeReductionFactor);
        let pondDivisor = 38;
        if (adjustedExcavationCuYds > 5000) {
          pondDivisor = 110;
        } else if (adjustedExcavationCuYds > 1000) {
          pondDivisor = 65;
        }
        const baseHours = Math.max(12, Math.round((adjustedExcavationCuYds / pondDivisor) * soilMultiplier * accessMultiplier));
        const dozerHrs = Math.max(10, Math.round(baseHours * 0.85));
        const compactorHrs = Math.max(8, Math.round(baseHours * 0.5));
        const opHrs = Math.max(8, Math.round(baseHours * 1.2));
        
        items = [
          {
            id: '1',
            category: 'Equipment',
            description: 'Cat 320 Medium Hydraulic Excavator (Bulk basin excavation & shaping side slopes)',
            quantity: baseHours,
            unit: 'Hours',
            unitPrice: getRate(220, "excavator_20t_rate"),
            totalCost: baseHours * getRate(220, "excavator_20t_rate")
          },
          {
            id: '2',
            category: 'Equipment',
            description: 'Cat D6 Track Bulldozer (Cut-and-fill grading & shaping dam embankment)',
            quantity: dozerHrs,
            unit: 'Hours',
            unitPrice: getRate(210, "dozer_heavy_rate"),
            totalCost: dozerHrs * getRate(210, "dozer_heavy_rate")
          },
          {
            id: '3',
            category: 'Equipment',
            description: 'Cat CP44 Vibrating Padfoot Roller (Compacting loose on-site material in 6" lifts)',
            quantity: compactorHrs,
            unit: 'Hours',
            unitPrice: getRate(165, "compactor_roller_rate"),
            totalCost: compactorHrs * getRate(165, "compactor_roller_rate")
          },
          {
            id: '4',
            category: 'Labor',
            description: 'Licensed Grade Foreman on-site (Laser-transit alignment, cut-fill balances & slope checks)',
            quantity: baseHours,
            unit: 'Hours',
            unitPrice: getRate(75, "foreman_rate"),
            totalCost: baseHours * getRate(75, "foreman_rate")
          },
          {
            id: '5',
            category: 'Labor',
            description: 'Heavy Equipment Operator crew (Leveling & Compaction team)',
            quantity: opHrs,
            unit: 'Hours',
            unitPrice: getRate(55, "operator_rate"),
            totalCost: opHrs * getRate(55, "operator_rate")
          },
          {
            id: '6',
            category: 'Materials',
            description: 'Existing On-Site Excavated Dirt (Repurposed for Dam Embankment - Keeps cost down!)',
            quantity: Math.round(adjustedExcavationCuYds),
            unit: 'CY',
            unitPrice: 0,
            totalCost: 0
          }
        ];
        break;
      }

      case "Structured Compacted House Clay Pad Build": {
        const fillCYNeeded = Math.round(excavationCuYds * 1.30); // 30% fluff and compaction compaction shrinkage standard
        const fillTonsNeeded = Math.round(fillCYNeeded * 1.35) || 40;
        let compactionDays = Math.max(1, Math.ceil(excavationCuYds / 150));
        if (excavationCuYds > 1000) {
          compactionDays = Math.max(1, Math.ceil(1000 / 150 + (excavationCuYds - 1000) / 450));
        }
        items = [
          {
            id: '1',
            category: 'Materials',
            description: 'Middle GA Selected Surcharge Structural Red Compaction Clay (Haul-in)',
            quantity: fillTonsNeeded,
            unit: 'Tons',
            unitPrice: 32,
            totalCost: fillTonsNeeded * 32
          },
          {
            id: '2',
            category: 'Equipment',
            description: 'Cat CP44 tracked vibrating padfoot soil compactor Roller (Moisture-tuning)',
            quantity: compactionDays * 8,
            unit: 'Hours',
            unitPrice: 165,
            totalCost: compactionDays * 8 * 165
          },
          {
            id: '3',
            category: 'Equipment',
            description: 'Heavy Excavator subgrade shaping and fine-pad grade profiling',
            quantity: Math.max(8, Math.round(compactionDays * 6)),
            unit: 'Hours',
            unitPrice: 185,
            totalCost: Math.max(8, Math.round(compactionDays * 6)) * 185
          },
          {
            id: '4',
            category: 'Labor',
            description: 'Dual-Transit laser grade verification crew (Pre-concrete level certifying)',
            quantity: 1,
            unit: 'Flat Setup',
            unitPrice: 1250,
            totalCost: 1250
          }
        ];
        break;
      }

      case "Structural Foundation Trench excavation": {
        const excavationHrs = Math.max(4, Math.round(L / 35));
        items = [
          {
            id: '1',
            category: 'Equipment',
            description: 'Cat 305 Compact Mini Excavator for high-precision footing trenches',
            quantity: excavationHrs,
            unit: 'Hours',
            unitPrice: 145,
            totalCost: excavationHrs * 145
          },
          {
            id: '2',
            category: 'Labor',
            description: 'Precision trench layout spotter & manual soil bucket clear crew',
            quantity: excavationHrs,
            unit: 'Hours',
            unitPrice: 42,
            totalCost: excavationHrs * 42
          },
          {
            id: '3',
            category: 'Labor',
            description: 'Shoring stake installer / structural form rebar safety coordinator',
            quantity: Math.round(excavationHrs * 1.5) || 6,
            unit: 'Hours',
            unitPrice: 48,
            totalCost: (Math.round(excavationHrs * 1.5) || 6) * 48
          }
        ];
        break;
      }

      case "Crowned Gravel Driveway Construction": {
        const baseCY = Math.round((areaSqFt * 0.5) / 27);
        const aggregateTonsNeeded = Math.round(baseCY * 1.45) || 20;
        const rollFabricRolls = Math.ceil(areaSqFt / 3600) || 1;
        const compHrs = Math.max(4, Math.ceil(areaSqFt / 6000));
        items = [
          {
            id: '1',
            category: 'Materials',
            description: 'Crusher Run (Class A stabilized base dressing aggregate topping)',
            quantity: aggregateTonsNeeded,
            unit: 'Tons',
            unitPrice: 38,
            totalCost: aggregateTonsNeeded * 38
          },
          {
            id: '2',
            category: 'Materials',
            description: 'Woven Monofilament Roadway Geotextile stabilization fabric (Filter fabric rolls)',
            quantity: rollFabricRolls,
            unit: 'Rolls',
            unitPrice: 420,
            totalCost: rollFabricRolls * 420
          },
          {
            id: '3',
            category: 'Equipment',
            description: 'Heavy Motor Grader sub-grade road alignment crowning & ditch shaping',
            quantity: Math.max(6, Math.ceil(areaSqFt / 4500)),
            unit: 'Hours',
            unitPrice: 220,
            totalCost: Math.max(6, Math.ceil(areaSqFt / 4500)) * 220
          },
          {
            id: '4',
            category: 'Equipment',
            description: 'Cat vibrating smooth steel-drum sub-base road finishing compactor',
            quantity: compHrs,
            unit: 'Hours',
            unitPrice: 155,
            totalCost: compHrs * 155
          },
          {
            id: '5',
            category: 'Materials',
            description: 'Surge stone granite aggregates for wash-out stabilization construction entrance',
            quantity: 18,
            unit: 'Tons',
            unitPrice: 42,
            totalCost: 18 * 42
          }
        ];
        break;
      }

      case "Subgrade Geotextile Fabric Laying": {
        const adjustedArea = activeUntouchedSpring ? Math.min(areaSqFt, 150 * 116) : areaSqFt;
        const rollsNeeded = Math.ceil(adjustedArea / 3600) || 1;
        const laborHrs = Math.max(4, rollsNeeded * 3);
        items = [
          {
            id: '1',
            category: 'Materials',
            description: 'Heavy Duty non-woven separation geotextile erosion underlayment fabric rolls',
            quantity: rollsNeeded,
            unit: 'Rolls',
            unitPrice: 420,
            totalCost: rollsNeeded * 420
          },
          {
            id: '2',
            category: 'Labor',
            description: 'Fabric deployment ground laborers rolling, cutting & steel pinning panels',
            quantity: laborHrs,
            unit: 'Hours',
            unitPrice: 35,
            totalCost: laborHrs * 35
          },
          {
            id: '3',
            category: 'Equipment',
            description: 'Mini loader transporting and unspooling heavy composite fabric rolls',
            quantity: Math.max(2, rollsNeeded),
            unit: 'Hours',
            unitPrice: 115,
            totalCost: Math.max(2, rollsNeeded) * 115
          }
        ];
        break;
      }

      case "Surge Stone Stabilizing Base Layer": {
        const tonsNeeded = Math.round((areaSqFt * 0.33 / 27) * 1.45) || 30;
        const dozerHrs = Math.max(6, Math.round(tonsNeeded / 45));
        items = [
          {
            id: '1',
            category: 'Materials',
            description: 'Heavy 4"-8" Georgia Granite Surge Stone base ballast aggregates',
            quantity: tonsNeeded,
            unit: 'Tons',
            unitPrice: 42,
            totalCost: tonsNeeded * 42
          },
          {
            id: '2',
            category: 'Equipment',
            description: 'Cat D6 Tracked Bulldozer heavy spreading and coarse grade locking',
            quantity: dozerHrs,
            unit: 'Hours',
            unitPrice: 210,
            totalCost: dozerHrs * 210
          },
          {
            id: '3',
            category: 'Equipment',
            description: 'Cat vibrating smooth steel roller lock-packing aggregate joints',
            quantity: dozerHrs,
            unit: 'Hours',
            unitPrice: 155,
            totalCost: dozerHrs * 155
          }
        ];
        break;
      }

      case "Transit Motor Grader Leveling & Crown Profile": {
        const graderHrs = Math.max(6, Math.ceil(areaSqFt / 4500));
        items = [
          {
            id: '1',
            category: 'Equipment',
            description: 'Heavy Motor Grader grading dual crown ditches & dynamic slope levels',
            quantity: graderHrs,
            unit: 'Hours',
            unitPrice: 220,
            totalCost: graderHrs * 220
          },
          {
            id: '2',
            category: 'Equipment',
            description: 'Steel drum vibratory finishing compactor smoothing aggregate lock surface',
            quantity: graderHrs,
            unit: 'Hours',
            unitPrice: 155,
            totalCost: graderHrs * 155
          },
          {
            id: '3',
            category: 'Labor',
            description: 'Dual-Transit electronic grading rod inspector shooting elevations',
            quantity: graderHrs,
            unit: 'Hours',
            unitPrice: 75,
            totalCost: graderHrs * 75
          }
        ];
        break;
      }

      case "Silt Retaining Basin Spillway Rocks Rip-Rap": {
        // Downstream spillway math:
        const downstreamVolCY = (sLength * sWidth * (sThickness / 12)) / 27;
        const downstreamTons = downstreamVolCY * 1.45; // factoring granite bulk compaction and void spaces

        // Upstream face wave shield math:
        let upstreamTons = 0;
        let upstreamAreaSQFT = 0;
        if (spillwayOnBothSides) {
          // Upstream wave action band runs along entire dam breast (length L) x 5 feet width x 12" thickness
          const upstreamVolCY = (L * 5.0 * 1.0) / 27;
          upstreamTons = upstreamVolCY * 1.45;
          upstreamAreaSQFT = L * 5.0;
        }

        const totalRipRapTons = Math.round(downstreamTons + upstreamTons);
        const totalAreaSQFT = (sLength * sWidth) + upstreamAreaSQFT;
        
        // Geotextile comes in 3600 sq ft rolls (standard 12ft x 300ft GDOT class A construction roll)
        const fabricRolls = Math.max(1, Math.ceil(totalAreaSQFT / 3600));

        const extHrs = Math.max(4, Math.round(totalRipRapTons / 6.5)); // about 6-7 tons of complex rock locks per track hour
        
        items = [
          {
            id: '1',
            category: 'Materials',
            description: `Georgia Granite Class II Spillway Rip-Rap erosion stone (Spillway: ${Math.round(downstreamTons)}T${spillwayOnBothSides ? `, Upstream Pool Wave Shield: ${Math.round(upstreamTons)}T` : ''})`,
            quantity: totalRipRapTons,
            unit: 'Tons',
            unitPrice: getRate(48, "spillway_riprap_per_ton"),
            totalCost: totalRipRapTons * getRate(48, "spillway_riprap_per_ton")
          },
          {
            id: '2',
            category: 'Materials',
            description: `Roadway grade heavy non-woven geotextile soil filter base lining material (${Math.round(totalAreaSQFT)} Sq Ft)`,
            quantity: fabricRolls,
            unit: 'Rolls',
            unitPrice: getRate(390, "geotextile_fabric_roll_cost"),
            totalCost: fabricRolls * getRate(390, "geotextile_fabric_roll_cost")
          },
          {
            id: '3',
            category: 'Equipment',
            description: 'Cat 320 Excavator placement and hand-locking heavy rip-rap boulders',
            quantity: extHrs,
            unit: 'Hours',
            unitPrice: getRate(220, "excavator_20t_rate"),
            totalCost: extHrs * getRate(220, "excavator_20t_rate")
          },
          {
            id: '4',
            category: 'Labor',
            description: 'Erosion control laborers aligning stone joints & staking backing fabric',
            quantity: extHrs * 2,
            unit: 'Hours',
            unitPrice: getRate(38, "ground_support_rate"),
            totalCost: extHrs * 2 * getRate(38, "ground_support_rate")
          }
        ];
        break;
      }

      case "Topsoil Dressing & Seeding Stabilization": {
        const adjustedArea = activeUntouchedSpring ? Math.round(areaSqFt * 0.3) : areaSqFt;
        const topsoilTons = Math.round((adjustedArea * 0.15 / 27) * 1.25) || 12;
        const blanketRolls = Math.ceil(adjustedArea / 2000) || 1;
        const loaderHrs = Math.max(4, Math.ceil(topsoilTons / 35));
        items = [
          {
            id: '1',
            category: 'Materials',
            description: 'Screened High-Nutrient Organic Topsoil topdressing soil matrix',
            quantity: topsoilTons,
            unit: 'Tons',
            unitPrice: 28,
            totalCost: topsoilTons * 28
          },
          {
            id: '2',
            category: 'Materials',
            description: 'GA DOT Highway Spec Centipede/Bermuda hybrid grass seed & straw mulch blankets',
            quantity: blanketRolls,
            unit: 'Rolls',
            unitPrice: 245,
            totalCost: blanketRolls * 245
          },
          {
            id: '3',
            category: 'Equipment',
            description: 'Cat compact track soil loader spreading organic topsoil evenly across grade',
            quantity: loaderHrs,
            unit: 'Hours',
            unitPrice: 135,
            totalCost: loaderHrs * 135
          },
          {
            id: '4',
            category: 'Labor',
            description: 'Landscaping tech raking details & anchoring seeding straw rolls',
            quantity: loaderHrs * 2,
            unit: 'Hours',
            unitPrice: 42,
            totalCost: loaderHrs * 2 * 42
          }
        ];
        break;
      }

      default: {
        const mulcherHours = Math.max(6, Math.round(acres * 7.5 * soilMultiplier * accessMultiplier));
        items = [
          {
            id: '1',
            category: 'Equipment',
            description: 'Standard Site Prep Forestry Mulcher Tracked Fleet',
            quantity: mulcherHours,
            unit: 'Hours',
            unitPrice: 245,
            totalCost: mulcherHours * 245
          }
        ];
        break;
      }
    }
    }

    // Apply PLM Overrides globally to items for exact financial matching!
    const overriddenItems = items.map(item => {
      let overridenPrice = item.unitPrice;
      const desc = item.description.toLowerCase();
      
      if (desc.includes('mulcher')) {
        overridenPrice = getRate(245, 'mulcher_rate');
      } else if (desc.includes('d5tracked dozer') || (desc.includes('dozer') && !desc.includes('d6'))) {
        overridenPrice = getRate(195, 'dozer_rate');
      } else if (desc.includes('d6 tracked') || desc.includes('d6 dozer')) {
        overridenPrice = getRate(210, 'dozer_heavy_rate');
      } else if (desc.includes('320') && desc.includes('hammer')) {
        overridenPrice = getRate(325, 'excavator_heavy_hammer_rate');
      } else if (desc.includes('320') && desc.includes('shear')) {
        overridenPrice = getRate(235, 'excavator_grubbing_rate');
      } else if (desc.includes('320')) {
        overridenPrice = getRate(220, 'excavator_20t_rate');
      } else if (desc.includes('305') || desc.includes('mini excavator') || desc.includes('compact track loader') || desc.includes('mini loader') || desc.includes('soil loader')) {
        overridenPrice = getRate(145, 'excavator_5t_rate');
      } else if (desc.includes('chainsaw')) {
        overridenPrice = getRate(48, 'chainsaw_rate');
      } else if (desc.includes('laser-transit') || desc.includes('grading rod') || desc.includes('foreman')) {
        overridenPrice = getRate(75, 'foreman_rate');
      } else if (desc.includes('silt fence roll') || desc.includes('silt fence')) {
        overridenPrice = getRate(185, 'silt_fence_roll_cost');
      } else if (desc.includes('geotextile') || desc.includes('fabric roll') || desc.includes('fabric template')) {
        overridenPrice = getRate(420, 'geotextile_fabric_roll_cost');
      } else if (desc.includes('granite ballast') || desc.includes('surge stone')) {
        overridenPrice = getRate(42, 'granite_ballast_per_ton');
      } else if (desc.includes('crusher run')) {
        overridenPrice = getRate(38, 'crusher_run_per_ton');
      } else if (desc.includes('hdpe')) {
        overridenPrice = getRate(650, 'hdpe_pipe_cost');
      } else if (desc.includes('roller roller') || desc.includes('padfoot') || desc.includes('cp44')) {
        overridenPrice = getRate(165, 'compactor_roller_rate');
      } else if (desc.includes('smooth steel') || desc.includes('smooth steel-drum') || desc.includes('finishing compactor')) {
        overridenPrice = getRate(155, 'smooth_roller_rate');
      } else if (desc.includes('rip-rap') || desc.includes('boulders')) {
        overridenPrice = getRate(48, 'spillway_riprap_per_ton');
      } else if (desc.includes('clay')) {
        overridenPrice = getRate(32, 'clay_delivered_per_ton');
      } else if (desc.includes('topsoil')) {
        overridenPrice = getRate(28, 'clay_delivered_per_ton') - 4;
      } else if (desc.includes('centipede') || desc.includes('straw mulch')) {
        overridenPrice = getRate(245, 'straw_mulch_blanket_roll_cost');
      } else if (desc.includes('ground support') || desc.includes('erosion control installer') || desc.includes('laborers') || desc.includes('flagger')) {
        overridenPrice = getRate(42, 'ground_support_rate');
      } else if (desc.includes('operator')) {
        overridenPrice = getRate(55, 'operator_rate');
      }
      
      return {
        ...item,
        unitPrice: overridenPrice,
        totalCost: item.quantity * overridenPrice
      };
    });

    if (shouldSetState) {
      setCurrentLineItems(overriddenItems);
    }
    return overriddenItems;
  };

  // Compatibility wrapper to support legacy template select switches and alert clicks
  const generateItemsFromTemplate = (templateId: 'A' | 'B' | 'C' | 'D') => {
    generateItemsFromSubPhase(selectedSubPhase);
  };

  // Inline Line Item editors
  const handleItemValueChange = (itemId: string, field: 'quantity' | 'unitPrice', value: number) => {
    const updated = currentLineItems.map(item => {
      if (item.id === itemId) {
        const qty = field === 'quantity' ? value : item.quantity;
        const price = field === 'unitPrice' ? value : item.unitPrice;
        return {
          ...item,
          quantity: qty,
          unitPrice: price,
          totalCost: Math.round(qty * price)
        };
      }
      return item;
    });
    setCurrentLineItems(updated);
  };

  // Add custom manual line item directly in workbook workspace!
  const handleAddManualLineItem = () => {
    const nextId = (currentLineItems.length + 1).toString();
    const newItem: LineItem = {
      id: nextId,
      category: 'Labor',
      description: 'Custom on-site client request modifier item',
      quantity: 1,
      unit: 'Units',
      unitPrice: 150,
      totalCost: 150
    };
    setCurrentLineItems([...currentLineItems, newItem]);
  };

  // Delete individual line item from workspace
  const handleDeleteLineItem = (id: string) => {
    const filtered = currentLineItems.filter(item => item.id !== id);
    setCurrentLineItems(filtered);
  };

  // Push current configured phase straight to Project Total Array list
  const handleCompileCurrentPhase = () => {
    if (!clientName.trim()) {
      alert('Please fill out the Client Demographic Name (Step 1) before saving the Phase bid.');
      setActiveStep('inputs');
      return;
    }

    const templateNames = {
      'A': 'Pond/Dam Excavation & Heavy Cut/Fill',
      'B': 'Forestry Mulching & Land Clearing',
      'C': 'Structured Clay Pad Development',
      'D': 'Roadway, Sub-Base & Aggregates'
    };

    const finalBidPrice = isSubcontracted
      ? Math.round((parseFloat(subcontractorCost) || 0) * (1 + subcontractorMarkup / 100))
      : Math.round(currentLineItemsCostTotal * (1 + markupPercent / 100));

    const finalId = editingPhaseId || `PHS-${Date.now().toString().slice(-4)}`;

    const newPhaseRecord: EstimateSubPhase = {
      id: finalId,
      phaseName: selectedPhase,
      subPhaseName: selectedSubPhase,
      templateId: selectedTemplate,
      templateName: templateNames[selectedTemplate],
      lineItems: [...currentLineItems],
      itemCostTotal: isSubcontracted ? (parseFloat(subcontractorCost) || 0) : currentLineItemsCostTotal,
      markupPercent: isSubcontracted ? subcontractorMarkup : markupPercent,
      totalBidPrice: finalBidPrice,
      geometryUsed: {
        lengthFeet: parseFloat(lengthFeet) || 0,
        topWidthFeet: parseFloat(topWidthFeet) || 0,
        bottomWidthFeet: parseFloat(bottomWidthFeet) || 0,
        depthFeet: parseFloat(depthFeet) || 0,
        areaSqFt,
        excavationCuYds,
        soilType: soilType.toUpperCase(),
        accessType: accessType.toUpperCase()
      },
      notes: customPhaseNotes,
      isSubcontracted,
      subcontractorName: isSubcontracted ? (subcontractorName.trim() || 'Custom 1099 Vendor') : undefined,
      subcontractorCost: isSubcontracted ? (parseFloat(subcontractorCost) || 0) : undefined,
      subcontractorMarkupPercent: isSubcontracted ? subcontractorMarkup : undefined
    };

    let updatedPhases: EstimateSubPhase[] = [];
    if (editingPhaseId) {
      updatedPhases = compiledPhases.map(p => p.id === editingPhaseId ? newPhaseRecord : p);
      setCompiledPhases(updatedPhases);
      setEditingPhaseId(null);
      alert(`Successfully saved changes to "${selectedSubPhase}" subphase in your Project Total compile sheet!`);
    } else {
      updatedPhases = [...compiledPhases, newPhaseRecord];
      setCompiledPhases(updatedPhases);
      alert(`Successfully added "${selectedSubPhase}" as a distinct subphase into your Project Total compile sheet!`);
    }

    // Persist to local storage project totals
    const projectSaveObj = {
      projectId,
      jobNumber,
      clientName,
      jobName,
      foreman,
      locationAddress,
      selectedIntakeId,
      compiledPhases: updatedPhases,
      pondSiteLength,
      pondSiteWidth,
      clearingSides,
      useCustomSiteDimensions
    };
    localStorage.setItem('tjd_multiphase_project_total', JSON.stringify(projectSaveObj));

    // Reset some phase specific entry fields but keep core geometry/demographics
    setCustomPhaseNotes('');
    setIsSubcontracted(false);
    setSubcontractorName('');
    setSubcontractorCost('');
    setSubcontractorMarkup(15);
    
    // Auto navigate to totals review
    setActiveStep('totals');
  };

  // Edit subphase by loading its exact variables back into the active editor
  const handleEditSubPhase = (phase: EstimateSubPhase) => {
    setEditingPhaseId(phase.id);
    setSelectedPhase(phase.phaseName);
    setSelectedSubPhase(phase.subPhaseName);
    setSelectedTemplate(phase.templateId);
    
    // Geometry dimensions
    setLengthFeet((phase.geometryUsed?.lengthFeet ?? 0).toString());
    setTopWidthFeet((phase.geometryUsed?.topWidthFeet ?? 0).toString());
    setBottomWidthFeet((phase.geometryUsed?.bottomWidthFeet ?? 0).toString());
    if (phase.geometryUsed?.depthFeet) {
      setDepthFeet(phase.geometryUsed.depthFeet.toString());
    }
    setSoilType((phase.geometryUsed?.soilType ?? 'clay').toLowerCase());
    setAccessType((phase.geometryUsed?.accessType ?? 'easy').toLowerCase());
    
    setMarkupPercent(phase.markupPercent);
    setCustomPhaseNotes(phase.notes || '');
    
    setIsSubcontracted(phase.isSubcontracted || false);
    if (phase.isSubcontracted) {
      setSubcontractorName(phase.subcontractorName || '');
      setSubcontractorCost((phase.subcontractorCost || 0).toString());
      setSubcontractorMarkup(phase.subcontractorMarkupPercent || 15);
    }
    
    // Directly pre-set the compiled line items!
    setCurrentLineItems([...phase.lineItems]);

    // Navigate back to computations step
    setActiveStep('templates');
    alert(`Loaded "${phase.subPhaseName}" back to active workspace. You can now tweak the parameters, modify the items, or adjust markups and then save updates.`);
  };

  // Delete subphase from project totals compiling list
  const handleDeleteSubPhase = (id: string) => {
    const filtered = compiledPhases.filter(p => p.id !== id);
    setCompiledPhases(filtered);

    const projectSaveObj = {
      projectId,
      jobNumber,
      clientName,
      jobName,
      foreman,
      locationAddress,
      selectedIntakeId,
      compiledPhases: filtered,
      pondSiteLength,
      pondSiteWidth,
      clearingSides,
      useCustomSiteDimensions
    };
    localStorage.setItem('tjd_multiphase_project_total', JSON.stringify(projectSaveObj));
  };

  // Credentials Vault Handlers
  const handleToggleAttachCredential = (id: string) => {
    setCredentials(prev => prev.map(cred => {
      if (cred.id === id) {
        return { ...cred, isAttached: !cred.isAttached };
      }
      return cred;
    }));
  };

  const handleDeleteCredential = (id: string) => {
    if (confirm('Are you sure you want to remove this bidding credential from your vault?')) {
      setCredentials(prev => prev.filter(cred => cred.id !== id));
    }
  };

  const handleAddCredential = (newCred: Omit<BidCredential, 'id'>) => {
    const item: BidCredential = {
      ...newCred,
      id: `cred-${Date.now()}`
    };
    setCredentials(prev => [...prev, item]);
  };

  const handleUpdateCredential = (updated: BidCredential) => {
    setCredentials(prev => prev.map(cred => cred.id === updated.id ? updated : cred));
  };

  const handleResetCredentialsToDefault = () => {
    if (confirm('Reset credentials vault back to T.J. Darley default license, insurance, and bonding presets?')) {
      localStorage.removeItem('tjd_bid_credential_vault');
      setCredentials([
        {
          id: 'cred-1',
          title: 'Georgia State Residential & General Contractor License',
          docType: 'license',
          issuer: 'Georgia State Licensing Board',
          referenceNumber: 'RLQA-008273-GC',
          expiryDate: '2028-06-30',
          status: 'active',
          isAttached: true,
          notes: 'TJ Darley Construction, LLC certified General Contractor status.'
        },
        {
          id: 'cred-2',
          title: 'Commercial General Liability & Workers Comp Insurance Certificate',
          docType: 'insurance',
          issuer: 'Builders Mutual Insurance Group',
          referenceNumber: 'GLWC-9902384-09',
          expiryDate: '2027-04-15',
          status: 'active',
          isAttached: true,
          notes: 'Commercial general liability ($2M limit) + workers compensation policy coverage.'
        },
        {
          id: 'cred-3',
          title: 'Surety Performance & Payment Bonding Capacity Certificate',
          docType: 'bonding',
          issuer: 'Fidelity and Deposit Company of Maryland',
          referenceNumber: 'BOND-7729384-A',
          expiryDate: '2027-12-31',
          status: 'active',
          isAttached: true,
          notes: 'Bonded capacity up to $3,500,000 for public/commercial land development projects.'
        },
        {
          id: 'cred-4',
          title: 'GSWCC Level IA Blue-Card Erosion Control Certification',
          docType: 'certification',
          issuer: 'Georgia Soil and Water Conservation Commission',
          referenceNumber: 'GSWCC-1A-559281',
          expiryDate: '2028-09-18',
          status: 'active',
          isAttached: true,
          notes: 'Certified Person in Soil Erosion and Sedimentation Control.'
        }
      ]);
    }
  };

  // Clear entire multi phase compiling workspace
  const handleResetEntireProject = () => {
    if (confirm('Are you absolute sure you want to clear the entire Multi-Phase project total compiling sheet and restart?')) {
      setCompiledPhases([]);
      setClientName('');
      setJobName('');
      setLocationAddress('');
      setSelectedIntakeId('');
      setProjectId(`PROJ-BID-${Date.now().toString().slice(-6)}`);
      setJobNumber('');
      localStorage.removeItem('tjd_multiphase_project_total');
    }
  };

  // Save helper for manual changes
  const saveProjectToLocalStorage = (
    phases: EstimateSubPhase[] = compiledPhases, 
    status: string = projectStatus, 
    markupAdj: number = globalMarkupAdjustment,
    finCharge: number = financeChargePercent,
    duration: number = estimatedDurationDays,
    intakeId: string = selectedIntakeId
  ) => {
    const projectSaveObj = {
      projectId,
      jobNumber,
      clientName,
      clientPhone,
      clientEmail,
      jobName,
      foreman,
      locationAddress,
      selectedIntakeId: intakeId,
      compiledPhases: phases,
      projectStatus: status,
      globalMarkupAdjustment: markupAdj,
      financeChargePercent: finCharge,
      estimatedDurationDays: duration,
      concreteCuringActive,
      concreteLengthFt,
      concreteWidthFt,
      concreteThicknessInches,
      concreteElementType,
      concretePsiGrade
    };
    localStorage.setItem('tjd_multiphase_project_total', JSON.stringify(projectSaveObj));
  };

  // Re-sync local storage whenever key states changed dynamically
  useEffect(() => {
    if (compiledPhases.length > 0) {
      saveProjectToLocalStorage(compiledPhases, projectStatus, globalMarkupAdjustment, financeChargePercent, estimatedDurationDays, selectedIntakeId);
    }
  }, [compiledPhases, projectStatus, globalMarkupAdjustment, financeChargePercent, estimatedDurationDays, selectedIntakeId, clientName, clientPhone, clientEmail, jobName, foreman, locationAddress, projectId, jobNumber]);

  const handleExportBackupJSON = () => {
    const backupObj = {
      version: "2.1",
      backupTimestamp: new Date().toISOString(),
      projectId,
      jobNumber,
      clientName,
      jobName,
      foreman,
      locationAddress,
      compiledPhases,
      projectStatus,
      globalMarkupAdjustment
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const sanitizedClient = (clientName || 'unassigned').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadAnchor.setAttribute("download", `TJD_Backup_${sanitizedClient}_${projectId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.projectId || !parsed.compiledPhases) {
          alert("Selected file is not a valid TJD Multi-Phase Estimator backup file.");
          return;
        }

        if (parsed.projectId) setProjectId(parsed.projectId);
        if (parsed.jobNumber) setJobNumber(parsed.jobNumber || '');
        if (parsed.clientName) setClientName(parsed.clientName || '');
        if (parsed.jobName) setJobName(parsed.jobName || '');
        if (parsed.foreman) setForeman(parsed.foreman || '');
        if (parsed.locationAddress) setLocationAddress(parsed.locationAddress || '');
        if (parsed.compiledPhases) setCompiledPhases(parsed.compiledPhases);
        if (parsed.projectStatus) setProjectStatus(parsed.projectStatus);
        if (parsed.globalMarkupAdjustment !== undefined) {
          setGlobalMarkupAdjustment(parsed.globalMarkupAdjustment);
        }

        alert(`Successfully imported and restored project "${parsed.jobName || 'TJD Project'}" containing ${parsed.compiledPhases.length} sub-phases! All worksheets updated.`);
      } catch (err) {
        alert("Failed to parse the backup file. Please verify it is a valid JSON configuration.");
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    let rows: string[][] = [];

    // Header Meta rows block
    rows.push(["TJD CONSTRUCTION - MASTER BID LEDGER SPREADSHEET"]);
    rows.push(["Macon, GA - Lake Oconee Subgrade Estimations Pipeline"]);
    rows.push([]);
    rows.push(["Project ID", projectId || "N/A"]);
    rows.push(["Job Number", jobNumber || "N/A"]);
    rows.push(["Client Name", clientName || "N/A"]);
    rows.push(["Job Site Name", jobName || "N/A"]);
    rows.push(["Foreman", foreman || "N/A"]);
    rows.push(["Site Address / Coordinates", locationAddress || "N/A"]);
    rows.push(["Project Status", projectStatus || "N/A"]);
    rows.push(["Global Markup Tuning Adjuster", `${globalMarkupAdjustment}%`]);
    rows.push([]);

    // Sub-phases general headers
    rows.push(["SECTION 1: CALCULATED BID SUB-PHASES"]);
    rows.push([
      "Subphase component name",
      "Template Type",
      "Original Price ($)",
      "Global Adj (%)",
      "Dynamic Total Bid ($)",
      "Vessel/Area (SqFt)",
      "Cut/Fill (CuYds)",
      "Soil context",
      "Site Accessibility",
      "Subcontracted?",
      "Subcontractor Name",
      "Notes"
    ]);

    compiledPhases.forEach((phase) => {
      const livePrice = Math.round(phase.totalBidPrice * (1 + globalMarkupAdjustment / 100));
      rows.push([
        `${phase.phaseName} - ${phase.subPhaseName}`,
        phase.templateName,
        String(phase.totalBidPrice),
        `${globalMarkupAdjustment}%`,
        String(livePrice),
        String(phase.geometryUsed?.areaSqFt ?? 0),
        String(phase.geometryUsed?.excavationCuYds ?? 0),
        phase.geometryUsed?.soilType ?? "CLAY",
        phase.geometryUsed?.accessType ?? "EASY",
        phase.isSubcontracted ? "YES" : "NO",
        phase.isSubcontracted ? (phase.subcontractorName || "1099 Vendor") : "N/A",
        phase.notes || ""
      ]);
    });

    rows.push([]);
    rows.push(["SECTION 2: CONSOLIDATED MATERIALS ORDER REQUISITIONS SHEET"]);
    rows.push(["Material Item Description", "Unit", "Total Required Quantity", "Estimated Unit Rate ($)", "Total Estimated Cost ($)"]);

    totals.detailedMaterials.forEach((mat: any) => {
      rows.push([
        mat.name,
        mat.unit,
        String(Math.round(mat.quantity)),
        String(mat.rate),
        String(Math.round(mat.totalCost))
      ]);
    });

    rows.push([]);
    rows.push(["SECTION 3: CONSOLIDATED QUANTITIES SUMMARIES"]);
    rows.push(["Granite Aggregates (Tons)", String(totals.totalTonsAggregates)]);
    rows.push(["Compacted Clay Fill (Tons)", String(totals.totalTonsClay)]);
    rows.push(["Fleet Machine Operating Hours", String(totals.totalMachineHours)]);
    rows.push(["Estimated Off-Road Diesel (Gallons)", String(totals.totalDieselGallons)]);
    rows.push([]);

    // Master Financial Summaries
    const rawGrandTotal = totals.grandBidPrice;
    const finalGrandTotal = Math.round(rawGrandTotal * (1 + globalMarkupAdjustment / 100));
    const finalDeposit = Math.round(finalGrandTotal * 0.50);

    rows.push(["SECTION 4: MASTER FINANCIAL ESTIMATION SUMMARY"]);
    rows.push(["Original Cumulative Target Bid Total ($)", String(rawGrandTotal)]);
    rows.push(["Tuned Cumulative Total Bid Price ($)", String(finalGrandTotal)]);
    rows.push(["Required Mobilizations Deposit (50%) ($)", String(finalDeposit)]);

    if (totals.hasSubcontractedPhases) {
      rows.push(["Total 1099 Subcontractor Payouts ($)", String(totals.totalSubcontractorCost)]);
      rows.push(["Total Admin Markups Retained ($)", String(totals.totalSubcontractorMarkupEarned)]);
    }

    // Convert values to CSV strings safely
    const csvContent = rows
      .map(row => row.map(val => {
        const cleanVal = (val || "").replace(/"/g, '""');
        return cleanVal.includes(",") || cleanVal.includes("\n") || cleanVal.includes('"') ? `"${cleanVal}"` : cleanVal;
      }).join(","))
      .join("\n");

    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const sanitizedClient = (clientName || 'unassigned').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    downloadAnchor.setAttribute("download", `TJD_Excel_Workbook_${sanitizedClient}_${projectId}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Calculate cumulative material summaries across all added phases
  const getConsolidatedMaterialsSummary = () => {
    let totalTonsAggregates = 0;
    let totalTonsClay = 0;
    let totalMachineHours = 0;
    let totalLaborHours = 0;
    let grandLineCost = 0;
    let grandBidPrice = 0;
    let totalSubcontractorCost = 0;
    let totalSubcontractorMarkupEarned = 0;
    let hasSubcontractedPhases = false;

    let totalLaborCost = 0;
    let totalEquipmentCost = 0;
    let totalMaterialsCost = 0;
    let totalPermitsCost = 0;

    const materialSummaryMap: Record<string, { name: string; quantity: number; unit: string; totalCost: number; rate: number }> = {};

    compiledPhases.forEach(phs => {
      grandLineCost += phs.itemCostTotal || phs.totalCost || 0;
      grandBidPrice += phs.totalBidPrice || phs.totalCost || 0;

      if (phs.isSubcontracted) {
        hasSubcontractedPhases = true;
        totalSubcontractorCost += phs.subcontractorCost || 0;
        totalSubcontractorMarkupEarned += (phs.totalBidPrice || phs.totalCost || 0) - (phs.subcontractorCost || 0);
      } else {
        (phs.lineItems || []).forEach(item => {
          const desc = item.description.toLowerCase();
          
          if (item.category === 'Materials') {
            totalMaterialsCost += item.totalCost;
            if (desc.includes('ton')) {
              if (desc.includes('clay')) totalTonsClay += item.quantity;
              else totalTonsAggregates += item.quantity;
            }

            const key = item.description;
            if (!materialSummaryMap[key]) {
              materialSummaryMap[key] = {
                name: item.description,
                quantity: 0,
                unit: item.unit,
                totalCost: 0,
                rate: (item as any).rate || item.unitPrice || 0
              };
            }
            materialSummaryMap[key].quantity += item.quantity;
            materialSummaryMap[key].totalCost += item.totalCost || (item as any).cost || 0;
            materialSummaryMap[key].rate = (item as any).rate || item.unitPrice || 0;
          } else if (item.category === 'Equipment') {
            totalEquipmentCost += item.totalCost;
            if (item.unit === 'Hours') totalMachineHours += item.quantity;
          } else if (item.category === 'Labor') {
            totalLaborCost += item.totalCost;
            if (item.unit === 'Hours') totalLaborHours += item.quantity;
          } else if (item.category === 'Permits') {
            totalPermitsCost += item.totalCost;
          }
        });
      }
    });

    // Approximate fuel needed: typically 4.5 gallons off-road diesel per heavy machine hour
    const totalDieselGallons = Math.round(totalMachineHours * 4.5);
    const totalFuelCost = Math.round(totalDieselGallons * dieselCurrentPrice);

    const adjustedGrandBidPrice = Math.round(grandBidPrice * (1 + globalMarkupAdjustment / 100));
    
    // Profit Margin (total markup dollars)
    const finalMarkupEarned = adjustedGrandBidPrice - grandLineCost;

    // Finance charge
    const financeChargeAmount = Math.round(adjustedGrandBidPrice * (financeChargePercent / 100));
    const finalInvoiceTotal = adjustedGrandBidPrice + financeChargeAmount;

    return {
      totalTonsAggregates,
      totalTonsClay,
      totalMachineHours,
      totalLaborHours,
      totalDieselGallons,
      grandLineCost,
      grandBidPrice,
      adjustedGrandBidPrice,
      totalSubcontractorCost,
      totalSubcontractorMarkupEarned,
      hasSubcontractedPhases,
      detailedMaterials: Object.values(materialSummaryMap),
      totalLaborCost,
      totalEquipmentCost,
      totalMaterialsCost,
      totalPermitsCost,
      totalFuelCost,
      finalMarkupEarned,
      financeChargeAmount,
      finalInvoiceTotal,
      depositNeeded: Math.round(finalInvoiceTotal * 0.50), // TJD 50% mobilizations deposit policy based on final invoice total!
    };
  };

  const totals = getConsolidatedMaterialsSummary();

  // Push consolidated compiled project total up to the Google Sheets automation pipeline
  const handleTransmitCumulativeTotals = async () => {
    if (compiledPhases.length === 0) {
      alert('Please add at least one phase to Project Total sheet before syncing.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    const webhookUrl = getWebhookUrl();
    const payload = new URLSearchParams();

    // Compile nice visual markdown summary description of all distinct phases
    const phaseSummaryText = compiledPhases.map((p, idx) => {
      return `Phase ${idx+1}: [${p.phaseName} - ${p.subPhaseName}] Template: ${p.templateName} -> Geometry: (L: ${p.geometryUsed?.lengthFeet ?? 0}ft TW: ${p.geometryUsed?.topWidthFeet ?? 0}ft D: ${p.geometryUsed?.depthFeet ?? 0}ft Area: ${p.geometryUsed?.areaSqFt ?? 0} SQ FT Vol: ${p.geometryUsed?.excavationCuYds ?? 0} CY) -> Fee: $${p.totalBidPrice.toLocaleString()}`;
    }).join('\n\n');

    let activeJobNo = jobNumber;
    if (!activeJobNo) {
      const currentYear = new Date().getFullYear();
      const randomID = Math.floor(101 + Math.random() * 899);
      activeJobNo = `JOB-${currentYear}-${randomID}`;
      setJobNumber(activeJobNo);
    }

    payload.append('action', 'submit_multiphase_project');
    payload.append('project_id', projectId);
    payload.append('job_number', activeJobNo);
    payload.append('client_name', clientName);
    payload.append('job_name', jobName);
    payload.append('foreman', foreman);
    payload.append('location_address', locationAddress);
    payload.append('total_phases_count', String(compiledPhases.length));
    payload.append('gran_total_bid', String(totals.adjustedGrandBidPrice));
    payload.append('raw_undiscounted_bid', String(totals.grandBidPrice));
    payload.append('global_markup_percentage_adjustment', `${globalMarkupAdjustment}%`);
    payload.append('project_status', projectStatus);
    payload.append('mobilization_deposit_50', String(totals.depositNeeded));
    payload.append('total_aggregates_tons', String(totals.totalTonsAggregates));
    payload.append('total_clay_tons', String(totals.totalTonsClay));
    payload.append('total_machine_hours', String(totals.totalMachineHours));
    payload.append('total_diesel_gallons', String(totals.totalDieselGallons));
    payload.append('finance_charge_percent', `${financeChargePercent}%`);
    payload.append('finance_charge_amount', String(totals.financeChargeAmount));
    payload.append('estimated_duration_days', `${estimatedDurationDays} Days`);
    payload.append('final_invoice_total', String(totals.finalInvoiceTotal));
    payload.append('labor_total_cost', String(totals.totalLaborCost));
    payload.append('equipment_total_cost', String(totals.totalEquipmentCost));
    payload.append('materials_total_cost', String(totals.totalMaterialsCost));
    payload.append('fuel_total_cost', String(totals.totalFuelCost));
    payload.append('profit_margin_amount', String(totals.finalMarkupEarned));
    payload.append('compiled_notes_summary', `Status: ${projectStatus} | Markup Adjustment: ${globalMarkupAdjustment}% | Duration: ${estimatedDurationDays} Days | Finance Surcharge: ${financeChargePercent}%\n\n${phaseSummaryText}`);
    payload.append('timestamp', new Date().toISOString());

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        body: payload,
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      setIsSyncing(false);
      setSyncStatus('success');

      // Update local storage with newly saved Job Number representation!
      const savedProject = localStorage.getItem('tjd_multiphase_project_total');
      if (savedProject) {
        const parsed = JSON.parse(savedProject);
        parsed.jobNumber = activeJobNo;
        localStorage.setItem('tjd_multiphase_project_total', JSON.stringify(parsed));
      }

      setTimeout(() => setSyncStatus(null), 8000);
    } catch (err) {
      console.error("Failed syncing multiphase workbook with app script macro.", err);
      setIsSyncing(false);
      setSyncStatus('error');
    }
  };

  // Trigger high fidelity corporate layout print/PDF action
  const handlePrintProposalPDF = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=960,scrollbars=yes');
    if (!printWindow) {
      alert('Please allow popups to compile the contract proposal PDF.');
      return;
    }

    const attachedCreds = credentials.filter(c => c.isAttached);
    let credentialsHTML = '';
    if (attachedCreds.length > 0) {
      credentialsHTML = `
        <div style="page-break-before: always; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; background-color: #ffffff; margin-top: 30px; font-family: sans-serif;">
          <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-top: 0; margin-bottom: 8px; border-bottom: 2px solid #ea580c; padding-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>EXHIBIT A: BIDDING COMPLIANCE & CREDENTIALS</span>
            <span style="font-size: 10px; color: #16a34a; font-weight: bold; background-color: #dcfce7; border: 1px solid #bbf7d0; padding: 3px 8px; border-radius: 12px; text-transform: none;">Verified Active Compliance</span>
          </h2>
          <p style="font-size: 11px; color: #475569; line-height: 1.5; margin-bottom: 16px;">
            The following legal credentials, contractor licenses, insurance details, and professional bonding statements are actively registered, current, and certified for <strong>TJ Darley Construction, LLC</strong> as of <strong>${new Date().toLocaleDateString('en-US')}</strong>. These documents are submitted herewith in satisfaction of bid qualification requirements.
          </p>

          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 8px; color: #475569; font-weight: bold;">Credential / Document Title</th>
                <th style="padding: 8px; color: #475569; font-weight: bold;">Issuing Authority / Underwriter</th>
                <th style="padding: 8px; color: #475569; font-weight: bold;">Reference / Policy #</th>
                <th style="padding: 8px; color: #475569; font-weight: bold; text-align: center;">Expiration</th>
                <th style="padding: 8px; color: #475569; font-weight: bold; text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${attachedCreds.map(c => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px; font-weight: 700; color: #1e293b; max-width: 220px;">
                    ${c.title}
                    ${c.fileName ? `<div style="font-size: 9px; color: #64748b; font-weight: normal; margin-top: 2px;">File link: ${c.fileName}</div>` : ''}
                  </td>
                  <td style="padding: 8px; color: #475569;">${c.issuer}</td>
                  <td style="padding: 8px; font-family: monospace; font-weight: bold; color: #0f172a;">${c.referenceNumber}</td>
                  <td style="padding: 8px; text-align: center; color: #475569; font-weight: 500;">${new Date(c.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td style="padding: 8px; text-align: right;">
                    <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;">
                      ${c.status}
                    </span>
                  </td>
                </tr>
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td colspan="5" style="padding: 6px 8px; font-size: 10px; color: #64748b; font-style: italic;">
                    <strong>Document Notes:</strong> ${c.notes || 'N/A'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 10px; line-height: 1.5; color: #475569;">
            <strong>Bid Deadline Priority Dispatch Statement:</strong> TJ Darley Construction, LLC guarantees immediate digital and physical transmission of certified copies, notarized seals, and direct underwriting verifications upon formal project award notification. Please contact our corporate dispatch desk at <strong>478-808-7789</strong> for bonding power-of-attorney releases or customized ACORD certificate requests.
          </div>
        </div>
      `;
    }

    const matchedIntake = pastIntakes.find(i => i.id === selectedIntakeId);
    let coordsText = matchedIntake && matchedIntake.latitude ? `Lat: ${matchedIntake.latitude}, Lon: ${matchedIntake.longitude}` : "N/A - GPS Site Lock Pending";

    const dateTodayStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const phaseRowHTML = compiledPhases.map((p, idx) => `
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid ${p.isSubcontracted ? '#0284c7' : '#ea580c'}; padding-bottom: 6px; margin-bottom: 12px;">
          <div>
            <span style="font-size: 11px; font-weight: 850; color: ${p.isSubcontracted ? '#0284c7' : '#ea580c'}; text-transform: uppercase;">
              Project Step 0${idx+1} ${p.isSubcontracted ? '&bull; Subcontracted Partner Operation' : ''}
            </span>
            <h4 style="margin: 3px 0; font-size: 16px; font-weight: 700; color: #1e293b;">${p.phaseName}</h4>
            <span style="font-size: 13px; color: #475569; font-weight: 500;">Operation: <strong>${p.subPhaseName}</strong></span>
          </div>
          ${pdfPrintMode === 'office' ? `
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 800; color: #0f172a;">$${p.totalBidPrice.toLocaleString()}</div>
              <span style="font-size: 11px; color: #64748b;">(Includes ${p.markupPercent}% markup margin)</span>
            </div>
          ` : `
            <div style="text-align: right;">
              <span style="font-size: 10px; color: #15803d; font-weight: bold; background-color: #dcfce7; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; font-family: sans-serif; letter-spacing: 0.05em;">Included in Scope</span>
            </div>
          `}
        </div>
        
        ${p.isSubcontracted ? `
        <div style="background-color: #f0f9ff; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 11.5px; color: #0369a1; border-left: 3px solid #0284c7; line-height: 1.4;">
          <strong>Partnership Arrangement Notice:</strong> This phase component is subcontracted out to <strong>${p.subcontractorName || 'Vetted 1099 Trade Partner'}</strong>. TJ Darley Construction oversees scheduling, quality assurance testing, and total site execution, serving as your single point-of-contact and contract warranty provider.
        </div>
        ` : `
        <div style="background-color: #f8fafc; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 11.5px; color: #334155;">
          <strong>Geometry Specs Applied:</strong> 
          L: ${p.geometryUsed?.lengthFeet ?? 0}ft | 
          Top Width: ${p.geometryUsed?.topWidthFeet ?? 0}ft | 
          BTM Width: ${p.geometryUsed?.bottomWidthFeet ?? 0}ft | 
          Average Depth: ${p.geometryUsed?.depthFeet ?? 0}ft |
          Area: ${(p.geometryUsed?.areaSqFt ?? 0).toLocaleString()} SQFT |
          Cut/Fill Volume: ${(p.geometryUsed?.excavationCuYds ?? 0).toLocaleString()} Cubic Yards
        </div>
        ${(p.subPhaseName.toLowerCase().includes('pond') || p.subPhaseName.toLowerCase().includes('dam') || ((p.geometryUsed?.bottomWidthFeet ?? 0) > (p.geometryUsed?.topWidthFeet ?? 0) && (p.geometryUsed?.depthFeet ?? 0) > 0)) ? `
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 11px; color: #b45309; line-height: 1.45;">
          <strong>Georgia Safe Dams Code Validation Compliance:</strong><br />
          Earthen Embankment Side Slope Ratio: <strong>${((((p.geometryUsed?.bottomWidthFeet ?? 0) - (p.geometryUsed?.topWidthFeet ?? 0)) / 2) / ((p.geometryUsed?.depthFeet ?? 0) || 1)).toFixed(2)}:1</strong> slope geometry (Horizontal run of ${(((p.geometryUsed?.bottomWidthFeet ?? 0) - (p.geometryUsed?.topWidthFeet ?? 0)) / 2).toFixed(1)} feet per face). Earthen dams built under Georgia Safe Dams rules require side slopes of 2:1 or flatter to withstand high saturation hydrostatic pressures. Middle Georgia red clay packing and keyway trench cores meet Category II non-hazardous certification stable core sealing criteria.
        </div>
        ` : ''}
        `}

        ${pdfPrintMode === 'office' ? `
        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 6px; color: #475569;">Category</th>
              <th style="padding: 6px; color: #475569;">Description</th>
              <th style="padding: 6px; color: #475569; text-align: center;">Qty</th>
              <th style="padding: 6px; color: #475569; text-align: right;">Unit Price</th>
              <th style="padding: 6px; color: #475569; text-align: right;">Sub Cost</th>
            </tr>
          </thead>
          <tbody>
            ${p.lineItems.map(item => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 6px; font-weight: 700; color: #64748b;">${item.category}</td>
                <td style="padding: 6px; color: #1e293b;">${item.description}</td>
                <td style="padding: 6px; text-align: center; font-weight: 500;">${item.quantity} ${item.unit}</td>
                <td style="padding: 6px; text-align: right;">$${item.unitPrice.toLocaleString()}</td>
                <td style="padding: 6px; text-align: right; font-weight: 600;">$${item.totalCost.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        ${p.notes ? `<div style="margin-top: 10px; font-size: 11.5px; color: #64748b; background-color: #fffbeb; padding: 8px; border-left: 3px solid #f59e0b; border-radius: 4px;"><strong>Foreman Field Notes:</strong> ${p.notes}</div>` : ''}
      </div>
    `).join('');

    const documentHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>T.J. Darley Construction - ${pdfPrintMode === 'client' ? 'Agreement Proposal' : 'Multi-Phase Engineering Proposal'}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            color: #0f172a;
            line-height: 1.45;
            padding: 30px;
            background-color: #ffffff;
          }
          .wrapper {
            max-width: 850px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 4px solid #ea580c;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .logo-text {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: 26px;
            color: #0c0a09;
            letter-spacing: -0.05em;
            line-height: 1.1;
          }
          .logo-sub {
            font-weight: 800;
            font-size: 11px;
            color: #ea580c;
            text-transform: uppercase;
            letter-spacing: 0.15em;
          }
          .meta-info {
            text-align: right;
            font-size: 12px;
            color: #475569;
          }
          .title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 19px;
            font-weight: 700;
            text-transform: uppercase;
            border-left: 4px solid #ea580c;
            padding-left: 10px;
            margin-bottom: 20px;
          }
          .totals-grid {
            display: grid;
            grid-template-columns: repeat(${pdfPrintMode === 'office' ? '4' : '3'}, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .total-box {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
            background-color: #f8fafc;
          }
          .total-box-val {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
          }
          .total-box-lbl {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            margin-top: 2px;
          }
          .contract-summary {
            background-color: #fffbeb;
            border: 1px solid #fef3c7;
            border-radius: 8px;
            padding: 16px;
            font-size: 12px;
            color: #78350f;
            margin-bottom: 24px;
          }
          .sig-block {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px dashed #cbd5e1;
            page-break-inside: avoid;
          }
          .sig-line {
            width: 45%;
            margin-top: 40px;
            border-top: 1px solid #475569;
            padding-top: 4px;
            text-align: center;
            font-size: 10px;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div>
              <div class="logo-text">T.J. DARLEY</div>
              <div class="logo-sub">CONSTRUCTION, LLC</div>
              <div style="font-size: 11px; color: #475569; margin-top: 4px; font-weight: 500;">
                Greensboro & Middle Georgia Commercial/Residential Earthworks
              </div>
              <div style="font-size: 9px; color: #64748b; margin-top: 2px; font-weight: 500; font-family: monospace;">
                Powered by Terra Earthwork Estimating System (TEES)™
              </div>
            </div>
            <div class="meta-info">
              <div><strong>Project ID:</strong> ${projectId}</div>
              <div><strong>Job Number:</strong> ${jobNumber ? `<span style="color:#10b981; font-weight:800;">${jobNumber}</span>` : `<span style="color:#64748b; font-style:italic;">Draft / Pre-Bid Inquiry</span>`}</div>
              <div><strong>Date Formed:</strong> ${dateTodayStr}</div>
              <div><strong>Foreman:</strong> ${foreman}</div>
              <div><strong>GPS Site Reference:</strong> ${coordsText}</div>
            </div>
          </div>

          <div class="title">${pdfPrintMode === 'client' ? 'Earthwork & Infrastructure Agreement Proposal' : 'Consolidated Multi-Phase Earthwork & Infrastructure Proposal'}</div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 12.5px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong>Client Demographic Profile:</strong>
                <div style="color: #475569; margin-top: 4px;">
                  Name: <span style="color: #0f172a; font-weight: 700;">${clientName}</span><br />
                  Phone: <span style="color: #0f172a; font-weight: 600;">${clientPhone || "478-986-0251"}</span><br />
                  Email: <span style="color: #0f172a; font-weight: 600;">${clientEmail || "newhomes@damesferryproperties.com"}</span><br />
                  Project Name: <span style="color: #0f172a; font-weight: 500;">${jobName || "Not Designated"}</span><br />
                  Site Location: <span style="color: #0f172a; font-weight: 500;">${locationAddress || "Lake Oconee Region, GA"}</span>
                </div>
              </div>
              <div style="border-left: 2px solid #e2e8f0; padding-left: 15px; text-align: right;">
                <strong>GRAND TOTAL PROJECT BID:</strong>
                <div style="font-size: 26px; font-weight: 900; color: #ea580c; margin-top: 6px;">
                  $${totals.finalInvoiceTotal.toLocaleString()}
                </div>
                ${financeChargePercent > 0 ? `<div style="font-size: 10px; color: #475569; margin-top: 2px;">Includes financing/carrying parameters</div>` : ''}
                <div style="font-size: 11px; color: #16a34a; font-weight: 700; margin-top: 4px;">
                  50% Mobilization Deposit Required: $${totals.depositNeeded.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div class="totals-grid">
            ${pdfPrintMode === 'office' ? `
              <div class="total-box">
                <div class="total-box-val">${compiledPhases.length} Phases</div>
                <div class="total-box-lbl">Sub-contracts</div>
              </div>
              <div class="total-box">
                <div class="total-box-val">${totals.totalTonsAggregates.toLocaleString()} Tons</div>
                <div class="total-box-lbl">Granite Aggregates</div>
              </div>
              <div class="total-box">
                <div class="total-box-val">${totals.totalMachineHours} Hrs</div>
                <div class="total-box-lbl">Heavy Machine Hours</div>
              </div>
              <div class="total-box">
                <div class="total-box-val">${totals.totalDieselGallons.toLocaleString()} Gal</div>
                <div class="total-box-lbl">Estimated Off-Road Fuel</div>
              </div>
            ` : `
              <div class="total-box">
                <div class="total-box-val">${compiledPhases.length} Sequential Steps</div>
                <div class="total-box-lbl">Project Sequence</div>
              </div>
              <div class="total-box">
                <div class="total-box-val">${estimatedDurationDays} Days</div>
                <div class="total-box-lbl">Estimated Duration</div>
              </div>
              <div class="total-box">
                <div class="total-box-val">Turn-Key</div>
                <div class="total-box-lbl">Lump-Sum Pricing</div>
              </div>
            `}
          </div>

          ${pdfPrintMode === 'client' ? `
          <div style="margin-bottom: 24px; border: 1px solid #ea580c; border-radius: 8px; padding: 18px; background-color: #fffdfa; page-break-inside: avoid;">
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-transform: uppercase; color: #ea580c; margin-top: 0; margin-bottom: 8px; border-bottom: 2px solid #fed7aa; padding-bottom: 4px;">
              Executive Scope of Work Statement
            </h3>
            <p style="font-size: 11.5px; color: #475569; line-height: 1.5; margin: 0 0 10px 0;">
              This comprehensive agreement proposal covers all heavy machinery operations, labor deployment, materials procurement, and administrative logistics required to execute the designated earthwork improvements. Work will be performed sequentially from mobilization to final layout completion in strict accordance with the steps detailed below.
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11px; color: #334155; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #f2f4f7;">
              <div>
                <strong>Included Services:</strong>
                <ul style="margin: 4px 0 0 0; padding-left: 14px;">
                  <li>All heavy excavator, bulldozer & 4x4 UTV site transport mobilization</li>
                  <li>Rapid field transport to mobile tool trailer for tools & supply acquisition</li>
                  <li>Silt-fence & Georgia GSWCC soil erosion controls</li>
                  <li>Compaction testing, clay packaging & core-keyway sealing</li>
                  <li>Laser leveling, basin grading & final embankment handoff</li>
                </ul>
              </div>
              <div>
                <strong>Lump-Sum Investment Billing:</strong>
                <ul style="margin: 4px 0 0 0; padding-left: 14px;">
                  <li>Single Turn-Key Price Guarantee</li>
                  <li>No unexpected hourly overruns or machine fuel surcharges</li>
                  <li>50% mobilization deposit activates schedule booking</li>
                  <li>Final 50% due on certified completion and handoff</li>
                </ul>
              </div>
            </div>
          </div>
          ` : `
          <!-- Commercial Bid breakdown Table -->
          <div style="margin-bottom: 24px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; background-color: #f8fafc; page-break-inside: avoid;">
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-transform: uppercase; color: #1e293b; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; display: flex; justify-content: space-between;">
              <span>Excel-Style Commercial Bid Cost Breakdown</span>
              <span style="color: #64748b; font-size: 11px; text-transform: none; font-weight: normal;">Estimator_Dynamic Workspace</span>
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; line-height: 1.5;">
              <thead>
                <tr style="background-color: #e2e8f0; text-align: left; border-bottom: 2px solid #cbd5e1;">
                  <th style="padding: 6px; color: #334155;">Cost Component Category</th>
                  <th style="padding: 6px; color: #334155; text-align: center;">Metric / Quantity</th>
                  <th style="padding: 6px; color: #334155; text-align: right;">Base Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px; font-weight: 600; color: #1e293b;">Precision Site Labor</td>
                  <td style="padding: 6px; text-align: center; color: #475569;">${totals.totalLaborHours} Hours</td>
                  <td style="padding: 6px; text-align: right; font-weight: 700; color: #0f172a;">$${totals.totalLaborCost.toLocaleString()}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px; font-weight: 600; color: #1e293b;">Heavy Equipment Operations</td>
                  <td style="padding: 6px; text-align: center; color: #475569;">${totals.totalMachineHours} Machine Hours</td>
                  <td style="padding: 6px; text-align: right; font-weight: 700; color: #0f172a;">$${totals.totalEquipmentCost.toLocaleString()}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px; font-weight: 600; color: #1e293b;">Materials & Logistics</td>
                  <td style="padding: 6px; text-align: center; color: #475569;">${(totals.totalTonsAggregates + totals.totalTonsClay).toLocaleString()} Tons Soil/Aggregate</td>
                  <td style="padding: 6px; text-align: right; font-weight: 700; color: #0f172a;">$${totals.totalMaterialsCost.toLocaleString()}</td>
                </tr>
                ${totals.totalPermitsCost > 0 ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px; font-weight: 600; color: #1e293b;">Permits, Fees & Engineering</td>
                  <td style="padding: 6px; text-align: center; color: #475569;">Regulatory Lodgements</td>
                  <td style="padding: 6px; text-align: right; font-weight: 700; color: #0f172a;">$${totals.totalPermitsCost.toLocaleString()}</td>
                </tr>
                ` : ''}
                ${totals.totalSubcontractorCost > 0 ? `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px; font-weight: 600; color: #1e293b;">Subcontractor & 1099 Vendor Tasks</td>
                  <td style="padding: 6px; text-align: center; color: #475569;">Outsourced Specialized Crews</td>
                  <td style="padding: 6px; text-align: right; font-weight: 700; color: #0f172a;">$${totals.totalSubcontractorCost.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr style="border-bottom: 2px solid #cbd5e1; background-color: #f1f5f9;">
                  <td style="padding: 6px; font-weight: 700; color: #334155;">Direct Operational Subtotal (Raw Costs)</td>
                  <td style="padding: 6px; text-align: center; color: #64748b;">—</td>
                  <td style="padding: 6px; text-align: right; font-weight: 800; color: #334155;">$${totals.grandLineCost.toLocaleString()}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px; font-weight: 600; color: #16a34a;">Project Net Profit Margin (Gross Markup)</td>
                  <td style="padding: 6px; text-align: center; color: #16a34a;">Combined Phase markups & modifiers</td>
                  <td style="padding: 6px; text-align: right; font-weight: 700; color: #16a34a;">$${totals.finalMarkupEarned.toLocaleString()}</td>
                </tr>
                <tr style="border-bottom: 1px solid #cbd5e1; font-weight: 700;">
                  <td style="padding: 6px; color: #0f172a;">Base Commercial Bid Subtotal</td>
                  <td style="padding: 6px; text-align: center; color: #0f172a;">Includes ${globalMarkupAdjustment !== 0 ? `global modifier ${globalMarkupAdjustment}%` : 'all sub-phase margins'}</td>
                  <td style="padding: 6px; text-align: right; color: #0f172a; font-size: 11px;">$${totals.adjustedGrandBidPrice.toLocaleString()}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px; font-weight: 600; color: #3b82f6;">Finance & Carrying Surcharge (${financeChargePercent}%)</td>
                  <td style="padding: 6px; text-align: center; color: #475569;">For Net-30/Net-60 Commercial terms</td>
                  <td style="padding: 6px; text-align: right; font-weight: 700; color: #3b82f6;">$${totals.financeChargeAmount.toLocaleString()}</td>
                </tr>
                <tr style="background-color: #fef2f2; font-size: 12px; font-weight: bold; border-top: 2px solid #ef4444; border-bottom: 2px solid #ef4444;">
                  <td style="padding: 8px; color: #991b1b;">GRAND TOTAL COMMERCIAL BID PRICE</td>
                  <td style="padding: 8px; text-align: center; color: #475569;">Project Timeline: ${estimatedDurationDays} Days</td>
                  <td style="padding: 8px; text-align: right; color: #b91c1c; font-size: 13px;">$${totals.finalInvoiceTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <!-- OFFICE ONLY: MARKUP VS MARGIN PROFIT ANALYSIS MATRIX -->
            <div style="margin-top: 14px; padding: 12px; background-color: #0f172a; border-radius: 6px; color: #ffffff; font-size: 10.5px; page-break-inside: avoid;">
              <div style="font-weight: 800; font-size: 11px; color: #f97316; text-transform: uppercase; margin-bottom: 8px; font-family: 'Space Grotesk', sans-serif; display: flex; justify-content: space-between; align-items: center;">
                <span>INTERNAL OFFICE AUDIT: MARKUP vs. MARGIN PROFIT ANALYSIS</span>
                <span style="font-size: 9px; color: #38bdf8; background-color: #1e293b; padding: 2px 6px; border-radius: 4px; font-weight: normal;">Confidential Office Copy Only</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; background-color: #1e293b; padding: 10px; border-radius: 6px; border: 1px solid #334155; margin-bottom: 8px;">
                <div>
                  <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Total Direct Raw Cost</div>
                  <div style="font-size: 13px; font-weight: 800; color: #f8fafc; margin-top: 2px;">$${totals.grandLineCost.toLocaleString()}</div>
                </div>
                <div>
                  <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Gross Profit Dollars</div>
                  <div style="font-size: 13px; font-weight: 800; color: #4ade80; margin-top: 2px;">+$${totals.finalMarkupEarned.toLocaleString()}</div>
                </div>
                <div>
                  <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Applied Markup %</div>
                  <div style="font-size: 13px; font-weight: 800; color: #fbbf24; margin-top: 2px;">
                    ${(totals.finalMarkupEarned / (totals.grandLineCost || 1) * 100).toFixed(1)}%
                  </div>
                  <div style="font-size: 8px; color: #cbd5e1;">(Profit ÷ Direct Cost)</div>
                </div>
                <div>
                  <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Actual Net Margin %</div>
                  <div style="font-size: 13px; font-weight: 800; color: #38bdf8; margin-top: 2px;">
                    ${(totals.finalMarkupEarned / (totals.adjustedGrandBidPrice || 1) * 100).toFixed(1)}%
                  </div>
                  <div style="font-size: 8px; color: #cbd5e1;">(Profit ÷ Selling Price)</div>
                </div>
              </div>
              <div style="font-size: 9.5px; color: #cbd5e1; line-height: 1.4; border-top: 1px solid #334155; padding-top: 6px;">
                <strong>Estimator Sensitivity Rating:</strong> 
                ${((totals.finalMarkupEarned / (totals.adjustedGrandBidPrice || 1)) * 100) < 15 
                  ? '<span style="color: #f87171; font-weight: bold;">⚡ AGGRESSIVE / LOW MARGIN ZONE (&lt; 15% Margin)</span> — Highly competitive bid price; protects against losing job, but leaves narrow cushion for weather or fuel inflation.'
                  : ((totals.finalMarkupEarned / (totals.adjustedGrandBidPrice || 1)) * 100) <= 28
                  ? '<span style="color: #4ade80; font-weight: bold;">✅ OPTIMAL COMPETITIVE ZONE (15% – 28% Margin)</span> — Excellent balance between bid competitiveness and strong company net profitability.'
                  : '<span style="color: #fbbf24; font-weight: bold;">👑 PREMIUM MARGIN ZONE (&gt; 28% Margin)</span> — High profitability yield. Review client price sensitivity to ensure competitive alignment.'}
              </div>
            </div>
          </div>
          `}

          ${(totals.detailedMaterials && totals.detailedMaterials.length > 0 && pdfPrintMode === 'office') ? `
          <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background-color: #fafafa; page-break-inside: avoid;">
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13px; text-transform: uppercase; color: #ea580c; margin-top: 0; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">Middle Georgia Materials Procurement Order Sheet</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #cbd5e1;">
                  <th style="padding: 6px; color: #475569;">Material Species Item</th>
                  <th style="padding: 6px; color: #475569; text-align: center;">Order Qty</th>
                  <th style="padding: 6px; color: #475569; text-align: right;">Unit Rate Active</th>
                  <th style="padding: 6px; color: #475569; text-align: right;">Est. Ledger Cost</th>
                </tr>
              </thead>
              <tbody>
                ${totals.detailedMaterials.map(mat => `
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 6px; font-weight: 600; color: #1e293b;">${mat.name}</td>
                    <td style="padding: 6px; text-align: center; font-weight: 700; color: #0f172a;">${Math.round(mat.quantity).toLocaleString()} ${mat.unit}</td>
                    <td style="padding: 6px; text-align: right; color: #475569;">$${(mat.rate ?? 0).toFixed(2)}</td>
                    <td style="padding: 6px; text-align: right; font-weight: 700; color: #16a34a;">$${Math.round(mat.totalCost).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="font-size: 10px; color: #64748b; margin-top: 8px; font-style: italic;">
              * Note: Gathers verified Greensboro, Eatonton, and Milledgeville competitive supply catalog prices with active Foreman overrides applied dynamically.
            </div>
          </div>
          ` : ''}

          <div style="margin-bottom: 24px;">
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 14px; text-transform: uppercase; color: #334155; margin-bottom: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
              ${pdfPrintMode === 'client' ? 'Authorized Project Milestones & Execution Steps' : 'Itemized Subphase Ledger Sheets'}
            </h3>
            ${phaseRowHTML}
          </div>

          <div style="page-break-before: always; margin-top: 30px; border: 2px solid #ea580c; border-radius: 8px; padding: 24px; background-color: #ffffff;">
            <div style="border-bottom: 3px solid #ea580c; padding-bottom: 12px; margin-bottom: 20px; text-align: center;">
              <div style="font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 20px; color: #0c0a09; text-transform: uppercase; letter-spacing: 0.05em;">
                OFFICIAL EARTHWORK CONTRACT AGREEMENT
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">
                T.J. Darley Construction, LLC &bull; General Contract Terms & Execution Protocol
              </div>
            </div>

            <div style="font-size: 11.5px; color: #334155; line-height: 1.6;">
              
              <!-- 1. PARTIES -->
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  1. PARTIES TO AGREEMENT
                </h4>
                <p style="margin: 0 0 6px 0;">
                  This Earthwork Contract Agreement ("Agreement") is entered into on <strong>${dateTodayStr}</strong>, by and between:
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                  <div>
                    <strong style="color: #ea580c; text-transform: uppercase; font-size: 10px; display: block; tracking-wider;">CONTRACTOR:</strong>
                    <span style="font-weight: 700; color: #0f172a;">T.J. Darley Construction, LLC</span><br />
                    Greensboro & Middle Georgia Commercial Region<br />
                    Direct Dispatch: (478) 808-7789
                  </div>
                  <div>
                    <strong style="color: #ea580c; text-transform: uppercase; font-size: 10px; display: block; tracking-wider;">CLIENT / PROPERTY OWNER:</strong>
                    <span style="font-weight: 700; color: #0f172a;">${clientName || 'Valued Client'}</span><br />
                    Site Address: ${locationAddress || jobName || 'Designated Lake Oconee / Middle Georgia Location'}
                  </div>
                </div>
              </div>

              <!-- 2. PROJECT LOCATION & SCOPE OF WORK -->
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  2. PROJECT LOCATION & SCOPE OF WORK (BID STEPS)
                </h4>
                <p style="margin: 0 0 6px 0;">
                  <strong>Designated Site Location:</strong> ${locationAddress || jobName || 'Lake Oconee Region, Georgia'}<br />
                  <strong>Scope of Work:</strong> Contractor agrees to furnish all necessary labor, equipment fleets, supervisory direction, materials, and transport logistics to execute the site work detailed in Exhibit A attached hereto, incorporating the following authorized project execution steps:
                </p>
                <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 11px; color: #475569;">
                  ${compiledPhases.map((p, i) => `
                    <li style="margin-bottom: 3px;"><strong>Project Step 0${i+1} (${p.phaseName}):</strong> ${p.subPhaseName} ${p.isSubcontracted ? '<em>(Subcontracted 1099 Partner Task)</em>' : ''}</li>
                  `).join('')}
                </ul>
              </div>

              <!-- 3. FINANCIAL TERMS & 50% DOWN PAYMENT -->
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  3. FINANCIAL TERMS, 50% DOWN PAYMENT & ACH BANK TRANSFER INSTRUCTIONS
                </h4>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
                    <div><strong>Total Contract Price:</strong> <span style="font-weight: 800; color: #ea580c; font-size: 14px;">$${totals.finalInvoiceTotal.toLocaleString()}</span></div>
                    <div><strong>50% Initial Mobilization Deposit:</strong> <span style="font-weight: 800; color: #16a34a; font-size: 14px;">$${totals.depositNeeded.toLocaleString()}</span></div>
                  </div>
                </div>

                <!-- ACH DIRECT BANK TRANSFER INSTRUCTIONS BOX -->
                <div style="background-color: #f0fdf4; border: 1.5px solid #16a34a; padding: 10px 12px; border-radius: 6px; margin: 8px 0 10px 0;">
                  <strong style="color: #15803d; font-size: 11.5px; text-transform: uppercase; display: block; margin-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                    💳 APPROVED PAYMENT METHOD: STRICTLY DIRECT ACH BANK TRANSFER / DIRECT WIRE (NO CREDIT CARDS ACCEPTED)
                  </strong>
                  <p style="margin: 0 0 6px 0; font-size: 10.5px; color: #166534; line-height: 1.4;">
                    To protect working capital and eliminate third-party merchant surcharges, <strong>T.J. Darley Construction, LLC accepts payment strictly via Direct ACH Bank Transfer, Online Bill Pay, or Direct Wire Transfer. Credit cards are NOT accepted.</strong>
                  </p>
                  <div style="background-color: #ffffff; border: 1px solid #bbf7d0; padding: 8px 10px; border-radius: 4px; font-size: 10.5px; font-family: monospace; color: #0f172a; line-height: 1.5;">
                    <div><strong>Bank Name:</strong> Synovus Bank / Farmers & Merchants Bank (Middle GA Hub)</div>
                    <div><strong>Account Name:</strong> T.J. Darley Construction, LLC (Incoming Depository Account)</div>
                    <div><strong>Security Protocol:</strong> ACH Debit Block Protected (Incoming Deposits Only)</div>
                    <div><strong>ACH Routing Number:</strong> 061100606</div>
                    <div><strong>Account / Invoice Reference Code:</strong> <span style="background-color: #fef08a; padding: 2px 6px; border-radius: 3px; font-weight: 800; color: #854d0e;">Ref: TJD-ACH-${(clientName || 'CLIENT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}</span></div>
                    <div><strong>ACH Addenda / Memo Requirement:</strong> Client bank MUST specify Client Name (${clientName || 'Client Name'}) and Reference Code in the ACH memo field for instant automated payment accounting.</div>
                    <div><strong>Email Remittance Confirmations:</strong> info@tjdarleyconstruction.com</div>
                  </div>
                </div>

                <p style="margin: 0 0 4px 0;">
                  <strong>Payment Due Date:</strong> The initial 50% mobilization deposit ($${totals.depositNeeded.toLocaleString()}) is payable by Client immediately upon execution of this Agreement via ACH transfer.
                </p>
                <p style="margin: 0 0 4px 0;">
                  <strong>Work Commencement:</strong> Contractor is not obligated to reserve heavy equipment fleets, schedule operators, or commence site mobilization until the ACH deposit has been received and cleared in full.
                </p>
                <p style="margin: 0;">
                  <strong>Progress Milestone Balance:</strong> The remaining 50% balance ($${(totals.finalInvoiceTotal - totals.depositNeeded).toLocaleString()}) is payable via ACH transfer upon complete core structural excavation, final elevation grading, and certified site handoff.
                </p>
              </div>

              <!-- 4. MATERIAL DELIVERY CLAUSE -->
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  4. MATERIAL DELIVERY & SUPPLY LOGISTICS CLAUSE
                </h4>
                <p style="margin: 0 0 4px 0;">
                  <strong>Delivery Timeline Estimates:</strong> All material delivery dates (granite aggregates, GAB stone, riprap, soil fill, culvert piping, geotextiles) are estimates based on regional quarry and supplier schedules.
                </p>
                <p style="margin: 0 0 4px 0;">
                  <strong>Third-Party Protection:</strong> Contractor shall not be held liable for project delays, supply chain bottlenecks, material shortages, or regional price fluctuations caused by third-party quarry suppliers, manufacturing backlogs, or freight logistics.
                </p>
                <p style="margin: 0;">
                  <strong>Site Staging & Risk of Loss:</strong> Client agrees to provide clear, unobstructed, and secure staging areas on the property for delivered machinery and materials. Risk of loss or damage to materials transfers to Client once delivered to the job site.
                </p>
              </div>

              <!-- 5. WEATHER DELAY CLAUSE -->
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  5. WEATHER DELAYS & SOIL MOISTURE CONDITIONS
                </h4>
                <p style="margin: 0 0 4px 0;">
                  <strong>Excusable Day-for-Day Delays:</strong> Heavy earthmoving, clay compaction, and embankment building depend strictly on stable soil conditions. Contractor shall automatically receive a day-for-day extension of time for any delays resulting from adverse weather.
                </p>
                <p style="margin: 0 0 4px 0;">
                  <strong>Adverse Weather Defined:</strong> Rain, freezing temperatures, flooding, excessive soil saturation, or mud conditions that impede machinery traction, compromise soil compaction standards, or risk environmental washouts.
                </p>
                <p style="margin: 0;">
                  <strong>Workability Determination:</strong> Contractor, in its sole professional discretion, shall determine when site soil moisture levels are safe to resume machine operations. Contractor is not liable for costs or damages resulting from weather shutdowns.
                </p>
              </div>

              ${concreteCuringActive ? `
              <!-- CONCRETE HYDRATION & CURING BUFFER CLAUSE -->
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  CONCRETE CURING TIMELINE & DIMENSIONAL HYDRATION SCHEDULE
                </h4>
                <p style="margin: 0 0 4px 0;">
                  <strong>Concrete Specifications & Calculated Volume:</strong> Project incorporates structural concrete pours (${concreteLengthFt}' L x ${concreteWidthFt}' W @ ${concreteThicknessInches}" Thickness, Type: ${concreteElementType}, Mix: ${concretePsiGrade}). Calculated concrete volume is approximately <strong>${calculateConcreteCuringStats(concreteLengthFt, concreteWidthFt, concreteThicknessInches, concreteElementType, concretePsiGrade).volumeCuYds} Cubic Yards</strong>.
                </p>
                <p style="margin: 0 0 4px 0;">
                  <strong>Required Curing Window:</strong> In compliance with American Concrete Institute (ACI) hydration standards, a mandatory <strong>${calculateConcreteCuringStats(concreteLengthFt, concreteWidthFt, concreteThicknessInches, concreteElementType, concretePsiGrade).cureDays} calendar day curing buffer</strong> is explicitly factored into total project duration (${estimatedDurationDays} Days).
                </p>
                <p style="margin: 0;">
                  <strong>Structural Load Restrictions:</strong> Heavy tracked excavator operations, framing material deliveries, or compaction equipment traffic shall not traverse concrete slabs or abutments until the full ${calculateConcreteCuringStats(concreteLengthFt, concreteWidthFt, concreteThicknessInches, concreteElementType, concretePsiGrade).cureDays}-day curing window has elapsed and compressive strength reaches design threshold.
                </p>
              </div>
              ` : ''}

              <!-- 6. UTILITY DAMAGE WAIVER (UNMARKED PRIVATE LINES) -->
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  6. UTILITY DAMAGE WAIVER (UNMARKED PRIVATE LINES)
                </h4>
                <p style="margin: 0 0 4px 0;">
                  <strong>Public Locates & Georgia 811:</strong> Contractor will initiate public utility line locates via Georgia 811 prior to active excavation.
                </p>
                <p style="margin: 0;">
                  <strong>Waiver of Liability for Unmarked Private Utilities:</strong> Client is strictly responsible for identifying and physically marking all private underground utilities, including irrigation piping, invisible pet fencing, secondary electrical feeds, gas lines, water services, and septic tanks/drain fields. Contractor is not liable for damage to unmarked or incorrectly marked private lines. Any repair costs or locator fees resulting from unmarked private lines shall be paid solely by Client.
                </p>
              </div>

              <!-- 7. UNEXPECTED UNDERGROUND ROCK & OBSTRUCTION CLAUSE -->
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  7. UNEXPECTED UNDERGROUND ROCK & SUBSURFACE OBSTRUCTION CLAUSE
                </h4>
                <p style="margin: 0 0 4px 0;">
                  <strong>Subsurface Soil Assumptions:</strong> Contract prices assume standard Middle Georgia red clay/soil suitable for standard excavator and dozer earthmoving without heavy rock hammering or granite blasting.
                </p>
                <p style="margin: 0;">
                  <strong>Subsurface Obstructions:</strong> If underground solid granite outcrops, high water table springs, unmapped buried concrete/structures, or heavy tree stump grubbings are encountered, work in the affected zone will pause. Heavy hydraulic hammering, rock blasting, or specialized dewatering is excluded from base contract pricing and will be performed under a Change Order.
                </p>
              </div>

              <!-- 8. CHANGE ORDER CLAUSE & $1,500 ADMIN FEE -->
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  8. CHANGE ORDERS & $1,500 ADMINISTRATIVE FEE PROTOCOL
                </h4>
                <p style="margin: 0 0 4px 0;">
                  <strong>Written Agreement Requirement:</strong> Any modification to project scope, geometry, dimensions, or site conditions must be agreed upon in writing by both Client and Contractor.
                </p>
                <p style="margin: 0 0 4px 0; background-color: #fffbeb; padding: 8px; border-left: 3px solid #f59e0b; border-radius: 4px;">
                  <strong>Change Order Fee:</strong> All change orders are subject to a mandatory <strong>$1,500 ADMINISTRATIVE FEE</strong> paid by Client immediately upon signing the Change Order.
                </p>
                <p style="margin: 0;">
                  <strong>Additional Costs Assessed:</strong> Additional machine operating hours, site labor, materials procurement, and fuel surcharges will be assessed and added to the final contract balance.
                </p>
              </div>

              <!-- 9. GEORGIA LAW & RIGHT TO REPAIR -->
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  9. GOVERNING LAW & GEORGIA RIGHT TO REPAIR ACT
                </h4>
                <p style="margin: 0 0 4px 0;">
                  <strong>Governing Law:</strong> This Agreement shall be governed by and construed under the laws of the State of Georgia.
                </p>
                <p style="margin: 0;">
                  <strong>Right to Repair Notice:</strong> Pursuant to Georgia law (O.C.G.A. § 8-2-35 et seq.), Contractor has a legal right to receive written notice of any alleged construction defect and an opportunity to inspect and cure such defect prior to the initiation of any legal proceeding.
                </p>
              </div>

              <!-- 10. CONTRACTOR CALCULATION & BID NUMBERS RESPONSIBILITY -->
              <div style="margin-bottom: 16px; background-color: #fffbeb; border: 1px solid #fef3c7; padding: 10px; border-radius: 6px;">
                <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #92400e; text-transform: uppercase; border-bottom: 1px solid #fde68a; padding-bottom: 3px; font-family: 'Space Grotesk', sans-serif;">
                  10. CONTRACTOR CALCULATION RESPONSIBILITY & LIABILITY SHIELD
                </h4>
                <p style="margin: 0 0 4px 0; font-size: 10.5px; color: #78350f; line-height: 1.5;">
                  <strong>Estimating Assistance Notice:</strong> All mathematical modeling, earthwork formulas, soil compaction shrinkage ratios, equipment fuel-burn rates, and unit price calculations provided by this software serve strictly as estimation assistance tools.
                </p>
                <p style="margin: 0; font-size: 10.5px; color: #78350f; line-height: 1.5;">
                  <strong>Verification Mandate:</strong> The Contractor is solely, strictly, and exclusively responsible for independently field-verifying all site dimensions, cut/fill quantities, soil conditions, subcontractor quotes, and proposal totals prior to submitting bids or executing contracts. Select Property Solutions, LLC / iSite Command assumes no financial liability for bidding inaccuracies, underestimations, site variances, or project cost overruns.
                </p>
              </div>

              <!-- 10. AUTHORIZED SIGNATURES -->
              <div style="margin-top: 28px; padding-top: 16px; border-top: 2px solid #ea580c; page-break-inside: avoid;">
                <p style="margin: 0 0 20px 0; font-style: italic; font-size: 11px; text-align: center; color: #64748b;">
                  IN WITNESS WHEREOF, the parties have executed this Earthwork Contract Agreement as of the date first written above.
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                  <div>
                    <div style="border-bottom: 1px solid #0f172a; height: 35px; margin-bottom: 4px;"></div>
                    <strong style="display: block; font-size: 11px; color: #0f172a; font-family: 'Space Grotesk', sans-serif;">CONTRACTOR SIGNATURE</strong>
                    <span style="font-size: 10px; color: #475569;">Authorized Rep, T.J. Darley Construction, LLC</span><br />
                    <span style="font-size: 10px; color: #64748b;">Date: ${dateTodayStr}</span>
                  </div>
                  <div>
                    <div style="border-bottom: 1px solid #0f172a; height: 35px; margin-bottom: 4px;"></div>
                    <strong style="display: block; font-size: 11px; color: #0f172a; font-family: 'Space Grotesk', sans-serif;">CLIENT SIGNATURE</strong>
                    <span style="font-size: 10px; color: #475569;">${clientName || 'Client / Authorized Property Owner'}</span><br />
                    <span style="font-size: 10px; color: #64748b;">Date: ________________________</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div style="margin-top: 35px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; font-weight: 500;">
            T.J. Darley Construction, LLC &bull; Greensboro, Georgia &bull; Direct Office: 478-808-7789
          </div>
        </div>

        ${credentialsHTML}

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(documentHTML);
    printWindow.document.close();
  };

  // Trigger dedicated Subcontractor Work Order & 1099 W-9 Compliance print action
  const handlePrintSubcontractorWorkOrder = (phaseOverride?: EstimateSubPhase) => {
    let subPhaseToPrint = phaseOverride;
    if (!subPhaseToPrint) {
      if (isSubcontracted) {
        subPhaseToPrint = {
          id: editingPhaseId || 'active-subphase',
          phaseName: selectedPhase,
          subPhaseName: selectedSubPhase,
          templateId: selectedTemplate,
          templateName: selectedSubPhase,
          lineItems: currentLineItems,
          itemCostTotal: parseFloat(subcontractorCost) || currentLineItemsCostTotal,
          markupPercent: subcontractorMarkup,
          totalBidPrice: Math.round((parseFloat(subcontractorCost) || currentLineItemsCostTotal) * (1 + subcontractorMarkup / 100)),
          geometryUsed: {
            lengthFeet, topWidthFeet, bottomWidthFeet, depthFeet, areaSqFt, excavationCuYds, soilType, accessType
          },
          notes: customPhaseNotes,
          isSubcontracted: true,
          subcontractorName: subcontractorName || 'Vetted 1099 Subcontractor Trade Partner',
          subcontractorCost: parseFloat(subcontractorCost) || currentLineItemsCostTotal,
          subcontractorMarkupPercent: subcontractorMarkup
        };
      } else {
        subPhaseToPrint = compiledPhases.find(p => p.isSubcontracted);
      }
    }

    if (!subPhaseToPrint) {
      alert('No subcontracted phase component found to generate a Work Order. Please mark a sub-phase as Subcontracted (1099 Entity) first.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=950,height=960,scrollbars=yes');
    if (!printWindow) {
      alert('Please allow popups to open and print the Subcontractor Work Order PDF.');
      return;
    }

    let activeJobNo = jobNumber;
    if (!activeJobNo) {
      const currentYear = new Date().getFullYear();
      const randomID = Math.floor(101 + Math.random() * 899);
      activeJobNo = `JOB-${currentYear}-${randomID}`;
    }

    const subCost = subPhaseToPrint.subcontractorCost || subPhaseToPrint.itemCostTotal || 0;
    const vendorName = subPhaseToPrint.subcontractorName || 'Vetted 1099 Trade Subcontractor';

    const workOrderHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Subcontractor Work Order & 1099 W-9 Compliance - ${activeJobNo}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            margin: 0;
            padding: 24px;
            line-height: 1.45;
            font-size: 11.5px;
          }
          @page {
            size: letter;
            margin: 0.5in;
          }
          .header-box {
            border-bottom: 3px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .company-name {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: -0.02em;
          }
          .tagline {
            font-size: 10px;
            color: #0284c7;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .badge-wo {
            background-color: #f0f9ff;
            border: 1.5px solid #0284c7;
            color: #0369a1;
            padding: 6px 12px;
            border-radius: 8px;
            text-align: right;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }
          .card {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 12px 14px;
            background-color: #f8fafc;
          }
          .card-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 11px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin-bottom: 8px;
          }
          .payout-box {
            background-color: #ecfeff;
            border: 2px solid #06b6d4;
            border-radius: 8px;
            padding: 14px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .payout-amount {
            font-family: monospace;
            font-size: 24px;
            font-weight: 800;
            color: #0891b2;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 8px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 700;
            text-align: left;
            padding: 6px 8px;
            border-bottom: 1px solid #cbd5e1;
          }
          td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .w9-box {
            border: 2px dashed #0284c7;
            background-color: #f0f9ff;
            border-radius: 8px;
            padding: 14px;
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .w9-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 12px;
            font-weight: 800;
            color: #0369a1;
            text-transform: uppercase;
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
          }
          .w9-field {
            border-bottom: 1px solid #94a3b8;
            height: 20px;
            margin-top: 4px;
          }
          .checkbox-grid {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin: 8px 0;
            font-size: 10.5px;
          }
          .sig-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-top: 24px;
            page-break-inside: avoid;
          }
          .sig-line {
            border-top: 1px solid #0f172a;
            margin-top: 40px;
            padding-top: 4px;
            font-weight: 700;
            font-size: 11px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background-color: #0f172a; color: white; padding: 12px 16px; margin-bottom: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; font-size: 12px;">📄 SUBCONTRACTOR WORK ORDER & 1099 COMPLIANCE PACKET PREVIEW</span>
          <button onclick="window.print()" style="background-color: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; text-transform: uppercase; font-size: 11px;">
            🖨️ Print / Save to PDF
          </button>
        </div>

        <!-- HEADER -->
        <div class="header-box">
          <div>
            <div class="company-name">T.J. DARLEY CONSTRUCTION, LLC</div>
            <div class="tagline">Commercial Site Earthwork & Subcontractor Management &bull; Gray, GA</div>
            <div style="font-size: 10px; color: #475569; margin-top: 3px;">
              P.O. Box 1422, Gray, GA 31032 &bull; Phone: (478) 808-7789 &bull; Email: dispatch@tjdarleyconstruction.com
            </div>
          </div>
          <div class="badge-wo">
            <div style="font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 13px;">SUBCONTRACTOR WORK ORDER</div>
            <div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #0284c7; margin-top: 2px;">WO-${activeJobNo}-${subPhaseToPrint.id.substring(0,6).toUpperCase()}</div>
            <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">Issued: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </div>
        </div>

        <!-- METADATA CARDS -->
        <div class="grid-2">
          <div class="card">
            <div class="card-title">GENERAL CONTRACTOR (ISSUER)</div>
            <div><strong>T.J. Darley Construction, LLC</strong></div>
            <div>Authorized Supervisor: T.J. Darley, Managing Principal</div>
            <div>Office Phone: (478) 808-7789</div>
            <div>Licensed Georgia Earthwork & Site Utility Contractor</div>
          </div>

          <div class="card">
            <div class="card-title">SUBCONTRACTOR / 1099 VENDOR</div>
            <div>Trade Partner Entity: <strong style="color: #0284c7;">${vendorName}</strong></div>
            <div>Assigned Operation: <strong>${subPhaseToPrint.subPhaseName}</strong></div>
            <div>IRS Status: <strong>1099 Independent Trade Partner</strong></div>
            <div>W-9 Compliance Requirement: <strong style="color: #dc2626;">Mandatory Prior to Draw 1</strong></div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 16px;">
          <div class="card-title">PROJECT SITE & LOCATION METADATA</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div>Project Name: <strong>${jobName || "Windsong at Nature's Walk Townhomes"}</strong></div>
            <div>Job Reference #: <strong style="font-family: monospace;">${activeJobNo}</strong></div>
            <div>Client / Owner: <strong>${clientName || 'General Contractor'}</strong></div>
            <div style="grid-column: span 3; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              Site Address / GPS Coordinates: <strong>${locationAddress || 'Gray, GA Civil Site Development Area'}</strong>
            </div>
          </div>
        </div>

        <!-- PAYOUT HIGHLIGHT BOX -->
        <div class="payout-box">
          <div>
            <div style="font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase;">AGREED SUBCONTRACT LUMP SUM PAYOUT</div>
            <div style="font-size: 10.5px; color: #334155; margin-top: 2px;">
              Total fixed compensation paid by T.J. Darley Construction, LLC upon 100% satisfactory completion and field inspection.
            </div>
          </div>
          <div style="text-align: right;">
            <div class="payout-amount">$${subCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style="font-size: 9.5px; color: #0891b2; font-weight: bold; text-transform: uppercase;">Fixed Lump Sum Bid</div>
          </div>
        </div>

        <!-- SCOPE OF WORK & LINE ITEMS -->
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-title">SUBCONTRACTED SCOPE OF WORK & TECHNICAL SPECS</div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
            ${subPhaseToPrint.phaseName} &mdash; ${subPhaseToPrint.subPhaseName}
          </div>
          ${subPhaseToPrint.notes ? `<div style="font-style: italic; color: #475569; margin-bottom: 8px; font-size: 10.5px;">"Special Scope Directives: ${subPhaseToPrint.notes}"</div>` : ''}

          ${subPhaseToPrint.lineItems && subPhaseToPrint.lineItems.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Task / Material Specification</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: center;">Unit</th>
                </tr>
              </thead>
              <tbody>
                ${subPhaseToPrint.lineItems.map(item => `
                  <tr>
                    <td style="font-weight: bold; color: #475569;">${item.category}</td>
                    <td>${item.description}</td>
                    <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
                    <td style="text-align: center; color: #64748b;">${item.unit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div style="font-size: 11px; color: #475569; padding: 6px 0;">
              Execute complete turn-key subphase operation per approved civil site development plans, local Georgia DOT standards, and GSWCC erosion control guidelines.
            </div>
          `}
        </div>

        <!-- IRS W-9 & 1099 COMPLIANCE PACKET -->
        <div class="w9-box">
          <div class="w9-title">
            <span>MANDATORY IRS FORM W-9 & 1099 COMPLIANCE MANDATE</span>
            <span style="font-size: 9.5px; background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 2px 6px; border-radius: 4px;">IRS IRC Sec. 6041</span>
          </div>
          <p style="margin: 0 0 10px 0; font-size: 10.5px; color: #334155; line-height: 1.4;">
            <strong>Notice to Independent Trade Partner:</strong> Pursuant to Internal Revenue Service (IRS) regulations, T.J. Darley Construction, LLC must maintain a signed <strong>IRS Form W-9</strong> (Request for Taxpayer Identification Number and Certification) and a valid Certificate of Insurance (General Liability & Workers' Compensation) on file prior to issuing payment. Complete the required tax declaration below or attach a signed IRS Form W-9.
          </p>

          <div style="border-top: 1px solid #bae6fd; pt-2; margin-top: 8px; padding-top: 8px;">
            <div style="font-weight: 800; font-size: 10.5px; color: #0f172a; margin-bottom: 6px;">SUBCONTRACTOR TAXPAYER IDENTIFICATION DECLARATION (W-9 DATA SHEET)</div>
            
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 8px;">
              <div>
                <span style="font-size: 9px; color: #64748b; font-weight: bold;">BUSINESS / LEGAL ENTITY NAME (as shown on IRS tax return)</span>
                <div class="w9-field">${vendorName !== 'Vetted 1099 Subcontractor Trade Partner' ? vendorName : ''}</div>
              </div>
              <div>
                <span style="font-size: 9px; color: #64748b; font-weight: bold;">DBA / TRADE NAME (if different)</span>
                <div class="w9-field"></div>
              </div>
            </div>

            <div style="margin-bottom: 8px;">
              <span style="font-size: 9px; color: #64748b; font-weight: bold;">FEDERAL TAX CLASSIFICATION (Check one box)</span>
              <div class="checkbox-grid">
                <div>[ &nbsp; ] Sole Proprietor / Individual</div>
                <div>[ &nbsp; ] C Corporation</div>
                <div>[ &nbsp; ] S Corporation</div>
                <div>[ &nbsp; ] Partnership</div>
                <div>[ &nbsp; ] LLC (Tax Classification: _____)</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
              <div>
                <span style="font-size: 9px; color: #64748b; font-weight: bold;">FEDERAL EMPLOYER IDENTIFICATION NUMBER (EIN)</span>
                <div class="w9-field" style="font-family: monospace; letter-spacing: 2px;">&nbsp; [ &nbsp; &nbsp; - &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</div>
              </div>
              <div>
                <span style="font-size: 9px; color: #64748b; font-weight: bold;">SOCIAL SECURITY NUMBER (if Sole Proprietor)</span>
                <div class="w9-field" style="font-family: monospace; letter-spacing: 2px;">&nbsp; [ &nbsp; &nbsp; &nbsp; - &nbsp; &nbsp; - &nbsp; &nbsp; &nbsp; &nbsp; ]</div>
              </div>
            </div>

            <div style="font-size: 9.5px; color: #475569; font-style: italic; margin-top: 6px;">
              <strong>Certification:</strong> Under penalties of perjury, I certify that: (1) The number shown on this form is my correct taxpayer identification number, (2) I am not subject to backup withholding, and (3) I am a U.S. citizen or other U.S. person.
            </div>
          </div>
        </div>

        <!-- TERMS & SIGNATURES -->
        <div style="font-size: 10px; color: #475569; line-height: 1.4; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 12px; page-break-inside: avoid;">
          <strong>Work Order Terms:</strong> 
          1. Subcontractor agrees to perform assigned trade work safely and professionally in compliance with Georgia soil erosion laws. 
          2. Payment is disbursed Net 15 upon final work approval and verified Form W-9 on file. 
          3. Subcontractor is an independent 1099 entity responsible for their own taxes and insurance.
        </div>

        <div class="sig-grid">
          <div>
            <div style="font-size: 10px; font-weight: bold; color: #475569;">GENERAL CONTRACTOR ACCEPTANCE</div>
            <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 2px;">T.J. Darley Construction, LLC</div>
            <div class="sig-line">
              Authorized Signature &bull; Date<br />
              <span style="font-size: 10px; font-weight: normal; color: #64748b;">T.J. Darley, Managing Principal</span>
            </div>
          </div>

          <div>
            <div style="font-size: 10px; font-weight: bold; color: #475569;">SUBCONTRACTOR / 1099 TRADE PARTNER ACCEPTANCE</div>
            <div style="font-size: 11px; font-weight: 800; color: #0284c7; margin-top: 2px;">${vendorName}</div>
            <div class="sig-line">
              Authorized Trade Partner Signature &bull; Date<br />
              <span style="font-size: 10px; font-weight: normal; color: #64748b;">Printed Name & Title</span>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(workOrderHTML);
    printWindow.document.close();
  };

  return (
    <div className="bg-slate-900 border-t-4 border-orange-500 text-white min-h-screen font-sans pb-24 text-left">
      
      {/* Upper Ledger Hub Header */}
      <div className="relative py-10 bg-slate-950 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative space-y-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors duration-150 p-2.5 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span>Return to Main Site</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="font-display font-black text-[10px] tracking-widest text-orange-400 uppercase bg-orange-950/45 border border-orange-850 px-3 py-1 rounded-full inline-flex items-center gap-1.5 animate-pulse">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Spreadsheet Template Compiler Mode
              </span>
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white leading-none">
                Interactive Multi-Phase <span className="text-orange-500">Proposal & Bid Builder</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
                Automatically pre-fill dimensions from Pre-Bid field intakes, build structured bills-of-materials across multiple project subphases, and compile professional corporate client agreements on-the-fly.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
              <button
                onClick={() => setActiveStep('inputs')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                  activeStep === 'inputs' 
                    ? 'bg-orange-600 border-orange-500 text-white shadow-lg' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1. Context & Geometry
              </button>
              <button
                onClick={() => setActiveStep('plm')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                  activeStep === 'plm' 
                    ? 'bg-orange-600 border-orange-500 text-white shadow-lg' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                2. Unified PLM Rules
              </button>
              <button
                onClick={() => setActiveStep('templates')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                  activeStep === 'templates' 
                    ? 'bg-orange-600 border-orange-500 text-white shadow-lg' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                3. Phase Estimator Template
              </button>
              <button
                onClick={() => setActiveStep('totals')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all relative cursor-pointer ${
                  activeStep === 'totals' 
                    ? 'bg-orange-600 border-orange-500 text-white shadow-lg' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                4. Project Totals Ledger Review
                {compiledPhases.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {compiledPhases.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Workbook Canvas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {activeStep === 'inputs' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* ⚡ Takeoff Plan AI Scanner */}
            <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden text-left space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="absolute top-0 right-0 bg-orange-950 border-l border-b border-orange-850 text-orange-400 font-mono text-[9px] uppercase tracking-widest px-3.5 py-1.5 font-black flex items-center gap-1.5 rounded-bl-xl shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                <span>Powered by Gemini AI v2.5</span>
              </div>

              <div>
                <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400 font-bold" />
                  <span>Engineer & Architect Takeoff Plan AI Scanner</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Upload PDF scan screenshots, structural site drawings, or copy-paste architectural spec lists (grading limits, core keyways, clay soils, acreage, or custom dimensions). Gemini will digitize the values to instantly configure your workspaces.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left side: Upload or Paste */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Option A: Upload Plan Image or Architectural Drawing</label>
                    <div className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/40 rounded-xl p-5 text-center cursor-pointer transition-all relative">
                      <input
                        type="file"
                        accept=".pdf,application/pdf,image/*"
                        onChange={handleTakeoffFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        <Upload className="w-6 h-6 mx-auto text-slate-500" />
                        <div className="text-xs text-slate-300 font-bold">
                          {takeoffFile ? `Selected: ${takeoffFile.name}` : `Drag & drop PDF or image file here or click to browse`}
                        </div>
                        <p className="text-[10.5px] text-slate-500">Supports PDF civil sets, PNG, JPG, JPEG, and WebP architectural sheets</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Option B: Copy-Paste Engineer's Specifications & Notes</label>
                    <textarea
                      placeholder="e.g. Greensboro Lake Lot Takeoff. Dimensions: dam length 350ft, average width 75ft, depth 5ft, includes core keyway trench. Soil type is heavy Georgia red clay. Moderate access with high slope pitch."
                      value={takeoffText}
                      onChange={(e) => setTakeoffText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-705 rounded-xl py-3 px-4 text-xs font-sans text-slate-200 outline-none focus:border-orange-500 font-medium placeholder-slate-600 h-28 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleRunTakeoffAI()}
                      disabled={isParsingTakeoff}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white border border-orange-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
                    >
                      {isParsingTakeoff ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Gemini Scanning Takeoff Plan...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-white font-bold" />
                          <span>⚡ Scan and Parse Takeoff Plan</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTakeoffText("WINDSONG AT NATURE'S WALK TOWN HOMES, Gray, GA - Civil Site Development Plan Set (1.76 Acres, 16 townhomes, 155 LF 18 inch RCP storm sewer)");
                        handleRunTakeoffAI(undefined, true);
                      }}
                      disabled={isParsingTakeoff}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-orange-400 border border-orange-500/40 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-orange-400" />
                      <span>⚡ Load Windsong at Nature's Walk Site Plan (Gray, GA)</span>
                    </button>

                    {(takeoffFile || takeoffText) && (
                      <button
                        type="button"
                        onClick={() => {
                          setTakeoffFile(null);
                          setTakeoffFileBase64(null);
                          setTakeoffFileMimeType(null);
                          setTakeoffText('');
                          setParsedTakeoffData(null);
                          setTakeoffSuccess(false);
                          setTakeoffError(null);
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {takeoffError && (
                    <div className="p-3 bg-red-950/40 border border-red-905 text-red-500 text-xs rounded-xl font-bold">
                      ⚠️ {takeoffError}
                    </div>
                  )}
                </div>

                {/* Right side: AI Results view */}
                <div className="md:col-span-5 bg-slate-900/50 rounded-2xl border border-slate-850 p-5 space-y-4 relative flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10.5px] uppercase tracking-wider font-black text-orange-400 font-sans border-b border-slate-800 pb-1.5 font-bold">
                      AI Takeoff Digitized Result Preview
                    </h4>

                    {!parsedTakeoffData ? (
                      <div className="py-12 text-center text-slate-500 space-y-2 flex-grow flex flex-col justify-center">
                        <FileText className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                        <p className="text-xs font-bold">Plan Data Draft Pending</p>
                        <p className="text-[10.5px] leading-tight max-w-[200px] mx-auto">Upload a drawing file or paste text above, then run the scan to construct the metadata.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-2 overflow-y-auto max-h-[300px]">
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wide">Takeoff Document Verdict</span>
                          <p className="text-xs text-slate-205 mt-0.5 leading-relaxed font-sans italic p-2.5 bg-slate-950 rounded-lg border border-slate-850">
                            "{parsedTakeoffData.takeoffAnalysisText || 'Takeoff specifications parsed successfully.'}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                            <span className="text-[8px] text-slate-500 block font-bold">CLIENT CONTACT</span>
                            <span className="text-white font-bold">{parsedTakeoffData.clientName || 'N/A'}</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-200">
                            <span className="text-[8px] text-slate-500 block font-bold">JOB / SITE NAME</span>
                            <span className="text-white font-bold">{parsedTakeoffData.jobName || 'N/A'}</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-850 col-span-2">
                            <span className="text-[8px] text-slate-500 block font-bold">PARCEL LOCATION</span>
                            <span className="text-white font-bold truncate block">{parsedTakeoffData.locationAddress || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wide font-sans">Extracted Dimensions</span>
                          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                            <div className="bg-emerald-950/30 p-1.5 rounded text-center border border-emerald-900/40">
                              <span className="text-[7.5px] text-slate-500 block">LENGTH</span>
                              <span className="text-emerald-400 font-bold">{parsedTakeoffData.dimensions?.lengthFeet || '300'} ft</span>
                            </div>
                            <div className="bg-emerald-950/30 p-1.5 rounded text-center border border-emerald-900/40">
                              <span className="text-[7.5px] text-slate-500 block">TOP WIDTH</span>
                              <span className="text-emerald-400 font-bold">{parsedTakeoffData.dimensions?.topWidthFeet || '80'} ft</span>
                            </div>
                            <div className="bg-emerald-950/30 p-1.5 rounded text-center border border-emerald-900/40">
                              <span className="text-[7.5px] text-slate-500 block">DEPTH</span>
                              <span className="text-emerald-400 font-bold">{parsedTakeoffData.dimensions?.depthFeet || '4'} ft</span>
                            </div>
                            <div className="bg-slate-950 p-1.5 rounded text-center border border-slate-850">
                              <span className="text-[7.5px] text-slate-500 block text-slate-300">SOIL TYPE</span>
                              <span className="text-orange-400 font-bold uppercase">{parsedTakeoffData.dimensions?.soilType || 'clay'}</span>
                            </div>
                            <div className="bg-slate-950 p-1.5 rounded text-center border border-slate-850">
                              <span className="text-[7.5px] text-slate-500 block">SLOPE LIMITS</span>
                              <span className="text-slate-300 font-bold">{parsedTakeoffData.dimensions?.siteSlope || '1.5%'}</span>
                            </div>
                            <div className="bg-slate-950 p-1.5 rounded text-center border border-slate-850">
                              <span className="text-[7.5px] text-slate-500 block">SITE ACCESS</span>
                              <span className="text-slate-300 font-bold capitalize">{parsedTakeoffData.dimensions?.accessType || 'easy'}</span>
                            </div>
                          </div>
                        </div>

                        {parsedTakeoffData.suggestedPhasesList?.length > 0 && (
                          <div className="space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-slate-200">
                            <span className="text-[8px] text-slate-405 uppercase font-black font-sans tracking-wider block">Recommended Multi-Phase Schedule:</span>
                            <div className="flex flex-wrap gap-1 text-[9px] font-sans">
                              {parsedTakeoffData.suggestedPhasesList.map((ph: string, i: number) => (
                                <span key={i} className="bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                                  {i + 1}. {ph}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {parsedTakeoffData && (
                    <button
                      type="button"
                      onClick={applyTakeoffFields}
                      className="w-full mt-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 border border-orange-500 rounded-xl text-xs font-black uppercase text-white cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow active:scale-98"
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span>Configure Workspace Estimators</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ⛽ Macon Fuel Surcharge & Competitive Bidding Intel Station */}
            <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl text-left space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-emerald-400" />
                    <span>Macon Off-Road Diesel & Fuel Surcharge Intelligence</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Heavy excavator and grader operating hourly rates automatically load dynamic fuel-burn differentials to keep your bids razor-sharp. Price trends are queried and updated daily to protect target margins effortlessly.
                  </p>
                </div>
                
                {/* Enable logic toggle */}
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-mono">Dynamic Surcharge:</span>
                  <button
                    type="button"
                    onClick={() => setEnableFuelAdjustment(!enableFuelAdjustment)}
                    className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all ${enableFuelAdjustment ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-850 hover:bg-slate-805 text-slate-400'}`}
                  >
                    {enableFuelAdjustment ? '⚡ Enabled' : '⏸️ Paused'}
                  </button>
                </div>
              </div>

              {enableFuelAdjustment && (
                <div className="flex flex-wrap items-center gap-2 p-3 bg-emerald-950/20 border border-emerald-950/40 rounded-2xl text-xs text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="font-bold">Daily Surcharge Engine Active:</span>
                  <span className="text-slate-400">
                    {lastDieselCheckTime 
                      ? `Automatic background index check completed (${lastDieselCheckTime}). No adjustment needed before creating bids.` 
                      : `Checking daily diesel terminals & off-road baseline indices...`}
                  </span>
                  {lastDieselCheckTime && (
                    <button
                      type="button"
                      onClick={handleCheckLiveDieselPrice}
                      disabled={isCheckingDiesel}
                      className="ml-auto text-[10px] uppercase font-black tracking-wider text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isCheckingDiesel ? "Syncing..." : "Re-Sync Now"}
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left side: Rates and sliders */}
                <div className="md:col-span-6 space-y-5">
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold">Middle GA Baseline Index:</span>
                      <span className="font-mono font-black text-slate-300 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                        ${dieselBasePrice.toFixed(2)} / Gal
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white font-bold flex items-center gap-1">
                          Active Fuel Cost (Off-Road/Retail index):
                        </span>
                        <span className="font-mono font-black text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2.5 py-1 rounded">
                          ${dieselCurrentPrice.toFixed(2)} / Gal
                        </span>
                      </div>
                      
                      <div className="pt-2 flex items-center gap-4">
                        <span className="text-[10px] font-mono text-slate-500 font-bold">$2.50</span>
                        <input
                          type="range"
                          min="2.50"
                          max="6.50"
                          step="0.05"
                          value={dieselCurrentPrice}
                          onChange={(e) => setDieselCurrentPrice(Number(e.target.value))}
                          className="flex-1 accent-emerald-500 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-slate-500 font-bold">$6.50</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Rate Differential per Gallon:</span>
                      {dieselCurrentPrice - dieselBasePrice === 0 ? (
                        <span className="text-slate-500 font-bold">Unchanged ($0.00)</span>
                      ) : (
                        <span className={`font-bold uppercase ${dieselCurrentPrice > dieselBasePrice ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {dieselCurrentPrice > dieselBasePrice ? `+ ${(dieselCurrentPrice - dieselBasePrice).toFixed(2)}` : `- ${Math.abs(dieselCurrentPrice - dieselBasePrice).toFixed(2)}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold">
                    <span className="text-slate-500 uppercase self-center mr-1">TJD Standard Indices:</span>
                    <button
                      type="button"
                      onClick={() => setDieselCurrentPrice(3.15)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded transition-all cursor-pointer"
                    >
                      Low ($3.15)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDieselCurrentPrice(3.50)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded transition-all cursor-pointer"
                    >
                      Baseline ($3.50)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDieselCurrentPrice(3.90)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded transition-all cursor-pointer"
                    >
                      Normal ($3.90)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDieselCurrentPrice(4.55)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded transition-all cursor-pointer"
                    >
                      High Spike ($4.55)
                    </button>
                  </div>
                </div>

                {/* Right side: AI verification and analysis results */}
                <div className="md:col-span-6 bg-slate-900/40 border border-slate-850 p-4 sm:p-5 rounded-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider">Option C: Query Live Georgia Diesel Price via Google Search</span>
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-950/50 border border-rose-900 px-1.5 py-0.5 rounded font-mono">Grounding Tool</span>
                    </div>
                    <p className="text-[10.5px] leading-relaxed text-slate-400">
                      Query active indexes & regional fuel terminals in Georgia. Gemini will scrape real-time AAA / EIA price sheets using built-in high fidelity Search Grounding.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleCheckLiveDieselPrice}
                      disabled={isCheckingDiesel}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-500 hover:to-teal-550 border border-emerald-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-98"
                    >
                      {isCheckingDiesel ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Searching GA Fuel Commodity Indices...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                          <span>Check Live Georgia Fuel Price</span>
                        </>
                      )}
                    </button>

                    {dieselCheckError && (
                      <div className="text-[10.5px] text-rose-450 bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-lg">
                        ⚠️ {dieselCheckError}
                      </div>
                    )}

                    {dieselCheckResult && (
                      <div className="space-y-2.5 text-xs text-slate-300 animate-in fade-in duration-300">
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-2">
                          <div className="flex justify-between items-center text-[10.5px] border-b border-slate-900 pb-1.5">
                            <span className="font-bold text-white flex items-center gap-1 truncate font-display">
                              ⛽ {dieselCheckResult.sourceName || 'GA Terminal Feed'}
                            </span>
                            <span className="font-mono text-[9px] text-slate-500 shrink-0">{dieselCheckResult.asOfDate || 'Latest'}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-mono">
                            <div className="bg-slate-900 p-1.5 rounded border border-slate-850">
                              <span className="text-[8px] text-slate-500 block font-bold">GA HIGHWAY AVG</span>
                              <span className="text-white font-black">${dieselCheckResult.retailDieselPrice ? Number(dieselCheckResult.retailDieselPrice).toFixed(2) : '3.80'}/gal</span>
                            </div>
                            <div className="bg-emerald-950/30 p-1.5 rounded border border-emerald-900/40">
                              <span className="text-[8px] text-emerald-555 block font-bold">GA OFF-ROAD PROPOSED</span>
                              <span className="text-emerald-400 font-black">${dieselCheckResult.offRoadDieselPrice ? Number(dieselCheckResult.offRoadDieselPrice).toFixed(2) : '3.50'}/gal</span>
                            </div>
                          </div>

                          {dieselCheckResult.explanation && (
                            <p className="text-[10px] text-slate-400 leading-normal italic font-sans pt-1">
                              "{dieselCheckResult.explanation}"
                            </p>
                          )}

                          {dieselCheckResult.sources && dieselCheckResult.sources.length > 0 && (
                            <div className="pt-1.5 border-t border-slate-900 text-[9px] font-mono">
                              <span className="text-slate-500 uppercase font-black block">Verification Citations:</span>
                              <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-sky-400 mt-1">
                                {dieselCheckResult.sources.slice(0, 2).map((src, idx) => (
                                  <a key={idx} href={src.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5 truncate max-w-[200px]">
                                    🔗 {src.title || "Ref"}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Realtime Impact report list */}
              {enableFuelAdjustment && (
                <div className="p-4 bg-emerald-950/15 border border-emerald-900/40 rounded-2xl space-y-2">
                  <h5 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <TrendingUp className="w-4 h-4" />
                    <span>Active Competitive Cost Advantage Breakdown</span>
                  </h5>
                  <p className="text-[11px] leading-relaxed text-emerald-300">
                    With a fuel delta of <strong>${(dieselCurrentPrice - dieselBasePrice).toFixed(2)}/gallon</strong> relative to baseline, equipment operating hours automatically absorb Macon-spec differential surcharges. Worksheets are adjusted live prior to rendering final contract totals:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-300">
                    <div className="p-2 bg-slate-900/40 border border-slate-850 rounded-lg">
                      <span className="text-slate-500 block text-[8px] font-black">HEAVY GEAR</span>
                      <span className="text-white block font-bold">4.5 gal/hr burn</span>
                      <span className={`block font-bold mt-1 ${dieselCurrentPrice > dieselBasePrice ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {dieselCurrentPrice - dieselBasePrice >= 0 ? '+' : ''}${((dieselCurrentPrice - dieselBasePrice) * 4.5).toFixed(2)}/hr
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900/40 border border-slate-850 rounded-lg">
                      <span className="text-slate-500 block text-[8px] font-black">MEDIUM DOZER</span>
                      <span className="text-white block font-bold">3.0 gal/hr burn</span>
                      <span className={`block font-bold mt-1 ${dieselCurrentPrice > dieselBasePrice ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {dieselCurrentPrice - dieselBasePrice >= 0 ? '+' : ''}${((dieselCurrentPrice - dieselBasePrice) * 3).toFixed(2)}/hr
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900/40 border border-slate-850 rounded-lg">
                      <span className="text-slate-500 block text-[8px] font-black">LIGHT COMMODS</span>
                      <span className="text-white block font-bold">2.0 gal/hr burn</span>
                      <span className={`block font-bold mt-1 ${dieselCurrentPrice > dieselBasePrice ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {dieselCurrentPrice - dieselBasePrice >= 0 ? '+' : ''}${((dieselCurrentPrice - dieselBasePrice) * 2).toFixed(2)}/hr
                      </span>
                    </div>
                    <div className="p-2 bg-emerald-950/40 border border-emerald-900/40 rounded-lg flex flex-col justify-center items-center">
                      <span className="text-[8.5px] uppercase font-black text-emerald-400 tracking-wider">Macon Bids</span>
                      <span className="text-[10px] font-sans text-center text-emerald-300 leading-tight block mt-0.5 font-bold">Delta Advantage</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 1: Context Demographic Registry & Geometry Lock */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Inputs block */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
              
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <div className="p-1.5 rounded bg-orange-950/55 border border-orange-800 text-orange-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-200">1. Client & Site Demographics</h3>
                  <p className="text-[11px] text-slate-400 leading-tight">Fill parameters manually or map coordinates from previous Client pre-bid intakes</p>
                </div>
              </div>

              {pastIntakes.length > 0 && (
                <div className="bg-slate-900/60 p-4 rounded-xl border border-dashed border-slate-800 space-y-2">
                  <label className="text-[10px] font-black uppercase text-orange-400 tracking-wider block">Preload From Previous Pre-Bid Intake History</label>
                  <select
                    value={selectedIntakeId}
                    onChange={(e) => handleIntakeSelectChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 py-2.5 px-3 rounded-lg text-xs font-semibold text-slate-200 outline-none focus:border-orange-500"
                  >
                    <option value="">-- Choose past field meeting log to pre-fill --</option>
                    {pastIntakes.map(intake => (
                      <option key={intake.id} value={intake.id}>
                        📋 [{intake.fiId || 'FI-PRE'}] {intake.clientName} - {intake.jobName} ({intake.submittedAt.slice(0, 10)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ID and Pipeline Reference Header Block */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-3 font-mono">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Estimate ID Reference</span>
                  <span className="text-xs text-slate-300 font-bold">{projectId}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block sm:text-right">Active Job Number</span>
                  {jobNumber ? (
                    <span className="text-xs text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-900/50 px-2 py-0.5 rounded uppercase">
                      {jobNumber}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400/90 font-medium bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded uppercase">
                      Draft Inquiry Phase (Auto-Assigned on Sync)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300 block">Client Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Henderson"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300 block">Identified Job/Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lot Grading & Fishing Pond Construction"
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300 block">Client Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 478-986-0251"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300 block">Client Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. newhomes@damesferryproperties.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 text-xs sm:col-span-2">
                  <label className="font-bold text-slate-300 block">Physical Site Location / Parcel Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Lot 4A Greensboro Hwy, Eatonton GA"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-300 block">Operating Foreman</label>
                  <select
                    value={foreman}
                    onChange={(e) => setForeman(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-orange-500"
                  >
                    <option value="TJ Darley">TJ Darley</option>
                    <option value="Garrett Darley">Garrett Darley</option>
                    <option value="Kyle Simmons">Kyle Simmons</option>
                  </select>
                </div>
              </div>

              {/* Master Geometry Dimensions Inputs */}
              <div className="border-t border-slate-900/60 pt-6 space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <div className="p-1.5 rounded bg-emerald-950/55 border border-emerald-800 text-emerald-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-200">2. Active Site Geometry parameters</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px]">Length (Feet)</label>
                    <input
                      type="number"
                      placeholder="e.g. 300"
                      value={lengthFeet}
                      onChange={(e) => setLengthFeet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px] font-sans">Top Width (FT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={topWidthFeet}
                      onChange={(e) => setTopWidthFeet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-emerald-405 font-bold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px] font-sans">Bottom Width (FT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={bottomWidthFeet}
                      onChange={(e) => setBottomWidthFeet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-emerald-405 font-bold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px] font-sans">Depth/Height (FT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={depthFeet}
                      onChange={(e) => setDepthFeet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-emerald-405 font-bold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Georgia Dam Safety Compliance Checker Helper Widget */}
                {parseFloat(depthFeet) > 0 && parseFloat(bottomWidthFeet) > parseFloat(topWidthFeet) && (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 mt-2">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900">
                        Georgia Dam Safety Standard Check
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Code Compliance Engine
                      </span>
                    </div>
                    {(() => {
                      const L = parseFloat(lengthFeet) || 0;
                      const TW = parseFloat(topWidthFeet) || 0;
                      const BW = parseFloat(bottomWidthFeet) || 0;
                      const H = parseFloat(depthFeet) || 0;
                      
                      const slopeFeet = (BW - TW) / 2;
                      const slopeRatio = H > 0 ? slopeFeet / H : 0;
                      const isHighJurisdictional = H >= 25;

                      return (
                        <div className="space-y-3 font-sans text-xs">
                          <div className="grid grid-cols-2 gap-4 text-slate-300">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-sans">Side Slope Run (Horizontal per face)</span>
                              <strong className="text-emerald-400 font-mono text-sm">{slopeFeet.toFixed(1)} Feet</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-sans">Computed Slope Ratio</span>
                              <strong className="text-emerald-400 font-mono text-sm">{slopeRatio.toFixed(2)} : 1</strong>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-1 border-t border-slate-900">
                            {slopeRatio >= 2.0 ? (
                              <div className="flex items-start gap-2 text-emerald-400">
                                <span className="text-sm font-bold">✓</span>
                                <div>
                                  <span className="font-bold uppercase text-[9px] tracking-wide block font-sans">Embankment Slope Compliant</span>
                                  <span className="text-[11px] text-slate-300 leading-normal font-sans">
                                    Compacts perfectly with a safe <strong>{slopeRatio.toFixed(1)}:1</strong> side slope (Georgia Safe Dams Code requires &ge; 2:1 ratio for stable earthen dams). This is structurally sound.
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2 text-amber-400 font-sans">
                                <span className="text-sm font-bold">⚠️</span>
                                <div>
                                  <span className="font-bold uppercase text-[9px] tracking-wide block font-sans">Slopes Too Steep for Georgia Standards</span>
                                  <span className="text-[11px] text-slate-300 leading-normal font-sans">
                                    Current slope is <strong>{slopeRatio.toFixed(1)}:1</strong>. Standard Georgia earthen dam code requires at least a <strong>2:1 slope</strong> (e.g., at least 2ft of horizontal run per 1ft of vertical rise) on earthen embankments to prevent slope failure when fully saturated. Minimum suggested bottom width for {H}ft height with a {TW}ft crest is <strong>{(TW + 4 * H).toFixed(0)} ft</strong>.
                                  </span>
                                </div>
                              </div>
                            )}

                            {isHighJurisdictional && (
                              <div className="flex items-start gap-2 text-orange-400 pt-1 font-sans">
                                <span className="text-sm font-bold">🔔</span>
                                <div>
                                  <span className="font-bold uppercase text-[9px] tracking-wide block text-orange-500 font-sans">Georgia Safe Dams Act Jurisdiction Notice</span>
                                  <span className="text-[11px] text-slate-300 leading-normal font-sans">
                                    Dams <strong>equal to or greater than 25 feet in height</strong> (or with storage &gt; 100 acre-feet) fall under Georgia State EPD regulatory jurisdiction. Civil engineering approvals and state permitting are required under Georgia Rules Chapter 391-3-8.
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 block">Georgia Sub-Soil Density</label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-orange-500"
                    >
                      <option value="clay">Georgia Red Clay (Heavy Compacting / Core Sealing)</option>
                      <option value="loam">Balanced Organic Loam (Standard excavation)</option>
                      <option value="rocky">Rocky/Granite Strata deposits (Extreme mechanical resistance)</option>
                      <option value="sand">Silty/Sandy Soil (Easy grading)</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 block">Proposed Ingress Path Access</label>
                    <select
                      value={accessType}
                      onChange={(e) => setAccessType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-orange-500"
                    >
                      <option value="easy">Easy / Wide open flat pastureway</option>
                      <option value="moderate">Moderate slope / some residential tight entries</option>
                      <option value="difficult">Difficult narrow access / dense wetlands / steep slope</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 block">Estimated Site Slope Grade</label>
                    <input
                      type="text"
                      placeholder="e.g. 1.5%"
                      value={siteSlope}
                      onChange={(e) => setSiteSlope(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pond Basin Site & Clearing Geometry */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-200 block uppercase tracking-wide text-[10px]">Pond Basin Site vs Dam Footprint (Land Preparation Range)</span>
                    <p className="text-[11px] text-slate-400 max-w-xl">
                      Enable this to specify the larger dimensions of the overall cleared pond basin site (e.g. 500' x 305' cleared area), rather than using only the structural dam embankment's footprint to calculate land prep and mulching phases.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none ml-4 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={useCustomSiteDimensions}
                      onChange={(e) => setUseCustomSiteDimensions(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-350 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {useCustomSiteDimensions && (
                  <div className="space-y-3 pt-2 border-t border-slate-900 animate-in fade-in duration-200">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px]">Pond Site Length (FT)</label>
                        <input
                          type="number"
                          placeholder="e.g. 500"
                          value={pondSiteLength}
                          onChange={(e) => setPondSiteLength(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-orange-400 font-mono font-bold outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px]">Pond Site Width (FT)</label>
                        <input
                          type="number"
                          placeholder="e.g. 305"
                          value={pondSiteWidth}
                          onChange={(e) => setPondSiteWidth(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-orange-400 font-mono font-bold outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px]">Clearing Perimeter</label>
                        <select
                          value={clearingSides}
                          onChange={(e) => setClearingSides(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-200 outline-none focus:border-orange-500"
                        >
                          <option value="4">4 Sides (100% Cleared)</option>
                          <option value="3">3 Sides (75% Cleared)</option>
                          <option value="2">2 Sides (50% Cleared)</option>
                          <option value="1">1 Side (25% Cleared)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] font-mono gap-1">
                      <span className="text-slate-400">Total Basin Area:</span>
                      <span className="text-white font-bold">
                        {((parseFloat(pondSiteLength) || 0) * (parseFloat(pondSiteWidth) || 0)).toLocaleString()} Sq Ft (~{(((parseFloat(pondSiteLength) || 0) * (parseFloat(pondSiteWidth) || 0)) / 43560).toFixed(2)} Acres)
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center p-2.5 bg-orange-950/25 rounded-lg border border-orange-900/40 text-[11px] font-mono gap-1">
                      <span className="text-orange-400">Actual Cleared Area ({clearingSides === '3' ? '3 Sides / 75%' : clearingSides === '2' ? '2 Sides / 50%' : clearingSides === '1' ? '1 Side / 25%' : '4 Sides / 100%'}):</span>
                      <span className="text-orange-400 font-bold font-mono">
                        {Math.round(((parseFloat(pondSiteLength) || 0) * (parseFloat(pondSiteWidth) || 0)) * (clearingSides === '3' ? 0.75 : clearingSides === '2' ? 0.5 : clearingSides === '1' ? 0.25 : 1.0)).toLocaleString()} Sq Ft (~{( (((parseFloat(pondSiteLength) || 0) * (parseFloat(pondSiteWidth) || 0)) * (clearingSides === '3' ? 0.75 : clearingSides === '2' ? 0.5 : clearingSides === '1' ? 0.25 : 1.0)) / 43560 ).toFixed(2)} Acres)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Natural Spring Protection / Untouched Basin Option */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-200 block uppercase tracking-wide text-[10px]">Natural Spring Protection (Spring Conservation Mode)</span>
                    <p className="text-[11px] text-slate-400 max-w-xl">
                      Enable this if the center bottom of the pond remains untouched to protect an active artesian spring. This prevents unnecessary deep excavation, reduces mass grading hours, and scales the final bid price to align with the actual competitive labor of a sub-one-month build ($122k - $160k).
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none ml-4 flex-shrink-0">
                    <input
                      type="checkbox"
                      id="untouchedSpring"
                      checked={untouchedSpring}
                      onChange={(e) => setUntouchedSpring(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-350 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Step Routing CTA */}
              <div className="pt-4 border-t border-slate-900 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!clientName.trim()) {
                      alert('Client Name is required before formatting phase templates.');
                      return;
                    }
                    setActiveStep('templates');
                  }}
                  className="px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase rounded-lg shadow-lg flex items-center gap-2 tracking-wider hover:scale-101 transition-all cursor-pointer"
                >
                  <span>Lock Dimensions & Choose Phase Template</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>

            </div>

            {/* Right Geometry Math Box Dashboard */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-slate-950 border border-emerald-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-950 border-l border-b border-emerald-800 text-emerald-400 font-mono text-[9px] uppercase tracking-widest px-3 py-1 font-black animate-pulse flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-emerald-500 animate-spin" />
                  Automatic Workbook Calculator
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">GA</span>
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-300">Computed Earthwork parameters</h4>
                  </div>

                  <div className="space-y-5">
                    
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-850 text-center relative">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Calculated Surface Footprint</span>
                      <div className="font-mono font-black text-2xl sm:text-3xl text-emerald-400 mt-1">
                        {areaSqFt.toLocaleString()} <span className="text-sm font-sans font-bold text-emerald-600">SQ FT</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        &asymp; {(areaSqFt / 43560).toFixed(3)} Net Acres of development
                      </span>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-850 text-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Proposed Excavation Cut/Fill Vol</span>
                      <div className="font-mono font-black text-2xl sm:text-3xl text-emerald-400 mt-1">
                        {excavationCuYds.toLocaleString()} <span className="text-sm font-sans font-bold text-emerald-600">CY</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Assuming {depthFeet || '0'} feet height/depth standard profile
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2.5 text-xs">
                      <h5 className="font-bold text-slate-300 uppercase tracking-wide text-[10px] border-b border-slate-850 pb-1.5 flex justify-between">
                        <span>Georgia Earth Density Weight Factors</span>
                        <span className="text-emerald-500 font-mono font-black">Excel Factor</span>
                      </h5>
                      <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
                        <span>Standard Aggregates (1.35 Tons/CY):</span>
                        <span className="text-white font-bold">{Math.round(excavationCuYds * 1.35).toLocaleString()} Tons</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
                        <span>Compacted Clay Fill (1.45 Tons/CY):</span>
                        <span className="text-emerald-400 font-bold">{Math.round(excavationCuYds * 1.45).toLocaleString()} Tons</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
                        <span>Weekly Hauling limits (18-ton Dump Trucks):</span>
                        <span className="text-white font-bold">{Math.ceil((excavationCuYds * 1.4) / 18)} Hauls</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {compiledPhases.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-orange-500" />
                      Saved Proposal compilation
                    </span>
                    <span className="bg-orange-950 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-800">
                      {compiledPhases.length} Phases Added
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <p>&bull; Target: <strong className="text-white">{clientName}</strong></p>
                    <p>&bull; Project Budget Sum: <strong className="text-orange-400">${totals.adjustedGrandBidPrice.toLocaleString()}</strong></p>
                    {globalMarkupAdjustment !== 0 && (
                      <p>&bull; Base Budget Sum: <strong className="text-slate-500">${totals.grandBidPrice.toLocaleString()}</strong></p>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveStep('totals')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-black uppercase text-slate-205 cursor-pointer text-center"
                  >
                    Manage compilation Total List &rarr;
                  </button>
                </div>
              )}

            </div>

          </div>
          </div>
        )}

        {activeStep === 'plm' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Unified PLM System Banner */}
            <div className="p-5 rounded-2xl border bg-gradient-to-r from-orange-950/40 to-slate-900 border-orange-900/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-950 px-2.5 py-1 rounded-full border border-orange-800">
                    Proprietary Business Logic Engine
                  </span>
                  <h2 className="text-lg font-black font-display text-white mt-1.5">Unified PLM & Estimator_Dynamic System</h2>
                  <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                    This logic matrix governs exactly which heavy equipment, labor crews, and material types are dynamically required for each phase of work. By combining these hard-coded rules with the active geometry parameters, the estimator automatically computes exact tonnage, equipment hours, and material quantities, removing human error and foreman guesswork.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-center shrink-0">
                  <span className="block text-[10px] text-slate-500 uppercase font-black">ACTIVE OVERRIDES</span>
                  <span className="block text-2xl font-mono font-black text-orange-450">
                    {Object.keys(plmOverrides).length}
                  </span>
                  <span className="block text-[9px] text-slate-400 font-sans mt-0.5">Rates Synchronized</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Subphase selection */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-xl text-left">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Workbook Sub-Phases Map</h3>
                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                    {/* Group by phase */}
                    {["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"].map(phasePrefix => {
                      const matches = Object.keys(plmSubPhaseSpecs).filter(subName => 
                        plmSubPhaseSpecs[subName].phase.startsWith(phasePrefix)
                      );
                      
                      return (
                        <div key={phasePrefix} className="space-y-1.5">
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block px-2 border-b border-slate-800/50 pb-1">
                            {phasePrefix === "Phase 1" && "I. Preliminary Site Prep"}
                            {phasePrefix === "Phase 2" && "II. Mass Grading & Excavating"}
                            {phasePrefix === "Phase 3" && "III. Pond & Clay Pad Base"}
                            {phasePrefix === "Phase 4" && "IV. Roadway & Gravel Base"}
                            {phasePrefix === "Phase 5" && "V. Permanent Stabilization"}
                          </span>
                          <div className="space-y-1">
                            {matches.map(subName => (
                              <button
                                key={subName}
                                onClick={() => setSelectedPlmSubPhase(subName)}
                                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between border cursor-pointer ${
                                  selectedPlmSubPhase === subName
                                    ? 'bg-orange-600 border-orange-500 text-white font-bold shadow-md'
                                    : 'bg-slate-950/50 border-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                <span className="truncate pr-2">{subName}</span>
                                <span className={`text-[8.5px] px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                                  selectedPlmSubPhase === subName
                                    ? 'bg-orange-800 text-white'
                                    : 'bg-slate-900 text-slate-400'
                                }`}>
                                  {plmSubPhaseSpecs[subName].template.slice(9, 10)}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column - Subphase PLM rules / Overrides */}
              <div className="lg:col-span-8 space-y-4">
                {selectedPlmSubPhase && plmSubPhaseSpecs[selectedPlmSubPhase] ? (
                  (() => {
                    const spec = plmSubPhaseSpecs[selectedPlmSubPhase];
                    return (
                      <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-6 text-left">
                        {/* Selected Spec Header */}
                        <div className="border-b border-slate-800 pb-4 flex justify-between items-start flex-wrap gap-2">
                          <div className="space-y-1">
                            <span className="text-[9.5px] font-mono tracking-wider font-bold text-orange-400 uppercase">
                              {spec.phase}
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-white font-display mb-1">{spec.name}</h3>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                              <span>Mapping: <strong className="text-slate-200">{spec.template}</strong></span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                // Sync back & load into template
                                setSelectedPhase(spec.phase);
                                setSelectedSubPhase(spec.name);
                                const mapped = subPhaseToTemplateMap[spec.name] || 'B';
                                setSelectedTemplate(mapped);
                                generateItemsFromSubPhase(spec.name);
                                setActiveStep('templates');
                              }}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-black uppercase transition-colors cursor-pointer shadow-sm"
                            >
                              Load To Active Workspace &rarr;
                            </button>
                          </div>
                        </div>

                        {/* Crew & Foreman Checklist Memory Savior */}
                        <div className="p-4 bg-orange-950/20 border border-orange-900/30 rounded-xl space-y-3">
                          <div className="flex items-center gap-1.5 text-orange-400 font-bold text-xs uppercase tracking-wider">
                            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Foreman Memory Assist Checklist Protocol</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            This automated ledger eliminates manual misses on the job site. Before dispatching or breaking ground, the foreman must check and enforce:
                          </p>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300 pl-1 leading-snug">
                            {spec.checklist.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-orange-550 font-bold shrink-0 font-mono text-xs">{idx + 1}.</span>
                                <span className="leading-tight">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Interactive Equipment Matrix & Formulas */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Dynamic Equipment Allocations</h4>
                          {spec.equipment.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No direct heavy equipment calculated for this subphase.</p>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-850">
                                  <tr>
                                    <th className="p-3">Asset Description</th>
                                    <th className="p-3">Logical Formula (Workbook)</th>
                                    <th className="p-3 w-32">Rate/Unit ($)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850">
                                  {spec.equipment.map((eq, i) => {
                                    const currentVal = plmOverrides[eq.rateKey] !== undefined ? plmOverrides[eq.rateKey] : eq.defaultRate;
                                    return (
                                      <tr key={i} className="hover:bg-slate-900/40">
                                        <td className="p-3 font-bold text-white">
                                          {eq.name}
                                          <span className="block text-[10px] text-slate-500 font-normal mt-0.5">{eq.explain}</span>
                                        </td>
                                        <td className="p-3 font-mono text-orange-400">{eq.formula}</td>
                                        <td className="p-3">
                                          <div className="flex flex-col items-start gap-1">
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-slate-500">$</span>
                                              <input
                                                type="number"
                                                value={currentVal}
                                                onChange={(e) => {
                                                  const newVal = parseFloat(e.target.value) || 0;
                                                  const updated = { ...plmOverrides, [eq.rateKey]: newVal };
                                                  setPlmOverrides(updated);
                                                  localStorage.setItem('tjd_unified_plm_overrides', JSON.stringify(updated));
                                                }}
                                                className="w-20 p-1.5 bg-slate-950 text-white rounded border border-slate-800 font-mono text-center text-xs focus:border-orange-500 outline-none"
                                              />
                                              <span className="text-slate-500">/hr</span>
                                            </div>
                                            {enableFuelAdjustment && EQUIPMENT_BURN_RATES[eq.rateKey] !== undefined && (dieselCurrentPrice !== dieselBasePrice) && (
                                              <span className="text-[9.5px] text-emerald-405 font-bold font-mono">
                                                Active Rate: ${getRate(eq.defaultRate, eq.rateKey).toFixed(2)}/hr
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Interactive Crews Allocations */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Specialized Crew Positions</h4>
                          {spec.crew.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No specialized manual labor computed for this subphase.</p>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-850">
                                  <tr>
                                    <th className="p-3">Crew Classification</th>
                                    <th className="p-3">Logical Formula (Workbook)</th>
                                    <th className="p-3 w-32">Rate/Unit ($)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850">
                                  {spec.crew.map((eq, i) => {
                                    const currentVal = plmOverrides[eq.rateKey] !== undefined ? plmOverrides[eq.rateKey] : eq.defaultRate;
                                    return (
                                      <tr key={i} className="hover:bg-slate-900/40">
                                        <td className="p-3 font-bold text-white">
                                          {eq.name}
                                          <span className="block text-[10px] text-slate-500 font-normal mt-0.5">{eq.explain}</span>
                                        </td>
                                        <td className="p-3 font-mono text-orange-400">{eq.formula}</td>
                                        <td className="p-3">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-slate-500">$</span>
                                            <input
                                              type="number"
                                              value={currentVal}
                                              onChange={(e) => {
                                                const newVal = parseFloat(e.target.value) || 0;
                                                const updated = { ...plmOverrides, [eq.rateKey]: newVal };
                                                setPlmOverrides(updated);
                                                localStorage.setItem('tjd_unified_plm_overrides', JSON.stringify(updated));
                                              }}
                                              className="w-20 p-1.5 bg-slate-950 text-white rounded border border-slate-800 font-mono text-center text-xs focus:border-orange-500 outline-none"
                                            />
                                            <span className="text-slate-500">/hr</span>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Interactive Materials Allocations */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Required Materials & Resource Formula Sheet</h4>
                          {spec.materials.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No bulk material weights calculated for this subphase.</p>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-850">
                                  <tr>
                                    <th className="p-3">Material Description</th>
                                    <th className="p-3">Logical Formula (Workbook)</th>
                                    <th className="p-3 w-32">Rate/Unit ($)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850">
                                  {spec.materials.map((eq, i) => {
                                    const currentVal = plmOverrides[eq.rateKey] !== undefined ? plmOverrides[eq.rateKey] : eq.defaultRate;
                                    return (
                                      <tr key={i} className="hover:bg-slate-900/40">
                                        <td className="p-3 font-bold text-white">
                                          {eq.name}
                                          <span className="block text-[10px] text-slate-500 font-normal mt-0.5">{eq.explain}</span>
                                        </td>
                                        <td className="p-3 font-mono text-orange-400">{eq.formula}</td>
                                        <td className="p-3">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-slate-500">$</span>
                                            <input
                                              type="number"
                                              value={currentVal}
                                              onChange={(e) => {
                                                const newVal = parseFloat(e.target.value) || 0;
                                                const updated = { ...plmOverrides, [eq.rateKey]: newVal };
                                                setPlmOverrides(updated);
                                                localStorage.setItem('tjd_unified_plm_overrides', JSON.stringify(updated));
                                              }}
                                              className="w-20 p-1.5 bg-slate-950 text-white rounded border border-slate-800 font-mono text-center text-xs focus:border-orange-500 outline-none"
                                            />
                                            <span className="text-slate-500">/{eq.unit.toLowerCase().includes('roll') ? 'roll' : eq.unit.toLowerCase().includes('load') ? 'load' : 'ton'}</span>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Reset Rates block */}
                        <div className="flex items-center justify-between border-t border-slate-850 pt-4 flex-wrap gap-2 text-left">
                          <p className="text-[10px] text-slate-500 leading-tight max-w-md">
                            Changes saved in real-time will serve as new standard formulas and cost unit prices. Click Reset to return to original contract estimates.
                          </p>
                          <button
                            onClick={() => {
                              if (window.confirm("Restore original baseline unit rates for the workbook? This will reset all 22 overrides.")) {
                                localStorage.removeItem('tjd_unified_plm_overrides');
                                window.location.reload();
                              }
                            }}
                            className="px-3 py-1.5 hover:bg-slate-800 text-slate-400 font-bold border border-slate-800 rounded-lg text-[10px] uppercase cursor-pointer transition-colors"
                          >
                            Reset Defaults
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-12 text-center text-slate-500 bg-slate-900/40 border border-slate-850 rounded-2xl">
                    Select a subphase from the left map to audit logical PLM routing rules.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeStep === 'templates' && (
          /* STEP 2: Phase Selection & Estimator Templates Workspace */
          <div className="space-y-8">
            
            {editingPhaseId && (
              <div className="bg-amber-950/40 border border-amber-900 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in duration-200 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-900/60 text-amber-300 rounded-lg shrink-0">
                    <Edit className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-100">Subphase Active Edit Mode</h5>
                    <p className="text-[11px] text-slate-400">You are tweaking the parameters/items of subphase ID: <strong className="font-mono text-amber-400">{editingPhaseId}</strong>. Save changes when done to push them back to the compiled total sheets.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPhaseId(null);
                    setCustomPhaseNotes('');
                    setIsSubcontracted(false);
                    setSubcontractorName('');
                    setSubcontractorCost('');
                    setSubcontractorMarkup(15);
                    alert("Exited subphase edit mode.");
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Cancel Edit
                </button>
              </div>
            )}
            
            {/* Phase Selector Controls Bar */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300 block">Select Work Phase</label>
                <select
                  value={selectedPhase}
                  onChange={(e) => handlePhaseSelectChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-orange-500"
                >
                  <option value="Phase 1 - Preliminary Site Prep">Phase 1 - Preliminary Site Prep</option>
                  <option value="Phase 2 - Demolition & Soil Stripping">Phase 2 - Demolition & Soil Stripping</option>
                  <option value="Phase 3 - Major Earth Moving & Excavation">Phase 3 - Major Earth Moving & Excavation</option>
                  <option value="Phase 4 - Sub-base Aggregates & Roads">Phase 4 - Sub-base Aggregates & Roads</option>
                  <option value="Phase 5 - Final Grade & Landscaping">Phase 5 - Final Grade & Landscaping</option>
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300 block">Select Sub-Phase Operation</label>
                <select
                  value={selectedSubPhase}
                  onChange={(e) => handleSubPhaseSelectChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-250 outline-none focus:border-orange-500"
                >
                  {selectedPhase.includes('Phase 1') && (
                    <>
                      <option value="Forestry Mulching & Brush Clearing">Forestry Mulching & Brush Clearing</option>
                      <option value="Perimeter Silt Fence Erosion Controls">Perimeter Silt Fence Erosion Controls</option>
                      <option value="Construction Entrance Rock Setup">Construction Entrance Rock Setup</option>
                    </>
                  )}
                  {selectedPhase.includes('Phase 2') && (
                    <>
                      <option value="Organic Topsoil Stripping & Stockpiling">Organic Topsoil Stripping & Stockpiling</option>
                      <option value="Rock Stratum Obstruction Jackhammering">Rock Stratum Obstruction Jackhammering</option>
                      <option value="Organic Stump Grubbing & Removal">Organic Stump Grubbing & Removal</option>
                    </>
                  )}
                  {selectedPhase.includes('Phase 3') && (
                    <>
                      <option value="Deep Clay Core Keyway Fishing Pond Digging">Deep Clay Core Keyway Fishing Pond Digging</option>
                      <option value="Structured Compacted House Clay Pad Build">Structured Compacted House Clay Pad Build</option>
                      <option value="Structural Foundation Trench excavation">Structural Foundation Trench excavation</option>
                    </>
                  )}
                  {selectedPhase.includes('Phase 4') && (
                    <>
                      <option value="Crowned Gravel Driveway Construction">Crowned Gravel Driveway Construction</option>
                      <option value="Subgrade Geotextile Fabric Laying">Subgrade Geotextile Fabric Laying</option>
                      <option value="Surge Stone Stabilizing Base Layer">Surge Stone Stabilizing Base Layer</option>
                    </>
                  )}
                  {selectedPhase.includes('Phase 5') && (
                    <>
                      <option value="Transit Motor Grader Leveling & Crown Profile">Transit Motor Grader Leveling & Crown Profile</option>
                      <option value="Silt Retaining Basin Spillway Rocks Rip-Rap">Silt Retaining Basin Spillway Rocks Rip-Rap</option>
                      <option value="Topsoil Dressing & Seeding Stabilization">Topsoil Dressing & Seeding Stabilization</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-orange-400 block flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  Excel Estimator Template Link
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as 'A' | 'B' | 'C' | 'D')}
                  className="w-full bg-slate-900 border border-orange-500 text-orange-400 rounded-lg py-2.5 px-3 text-sm outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="B">Template B: Forestry Clearing & Site Prep</option>
                  <option value="A">Template A: Pond/Dam Cut & Heavy Excavation</option>
                  <option value="C">Template C: Compacted Structural Pad Development</option>
                  <option value="D">Template D: Roadway, Sub-Base & Aggregates</option>
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300 block">Spreadsheet Markup Margin</label>
                <div className="flex items-center gap-2.5 bg-slate-900 px-3 py-2 border border-slate-800 rounded-lg">
                  <span className="font-mono font-black text-orange-400">{markupPercent}%</span>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="5"
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    className="w-full accent-orange-500 h-1 rounded-lg outline-none"
                  />
                  <span className="font-mono text-[9px] text-slate-500">Markup</span>
                </div>
              </div>

            </div>

            {/* Auxiliary Engineering Sub-Parameters Panel (Bulletproofing) */}
            {selectedSubPhase === "Deep Clay Core Keyway Fishing Pond Digging" && (
              <div className="bg-slate-950 border border-emerald-800/80 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-305">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 px-2 py-0.5 rounded tracking-wide uppercase">Core Sealing Configurator</span>
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-100">Centerline Clay Cutoff (Keyway) Trench Details</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 sm:ml-auto">Georgia Safe Dams stability compliance helper</p>
                </div>
                
                <p className="text-[11px] text-slate-300 leading-normal max-w-4xl">
                  An earthen dam's clay core must be "keyed" into impermeable native subgrade soil to prevent high-hydrostatic under-seepage. The keyway trench should extend along the active centerline length down to competent virgin clay strata. This calculator estimates extra digging excavator hours and delivered core plug clay tonnage.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-400 block text-[10px] uppercase">Trench Length (Feet)</label>
                    <input
                      type="number"
                      value={keywayLengthFeet}
                      onChange={(e) => setKeywayLengthFeet(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                    />
                    <span className="text-[9px] text-slate-500 block">Defaults to Dam length ({lengthFeet} ft)</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-400 block text-[10px] uppercase">Trench Bottom Width (FT)</label>
                    <input
                      type="number"
                      value={keywayBottomWidthFeet}
                      onChange={(e) => setKeywayBottomWidthFeet(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                    />
                    <span className="text-[9px] text-slate-500 block">Suggested: &ge; 8ft for standard compactors</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-400 block text-[10px] uppercase">Avg Cutoff Depth (FT)</label>
                    <input
                      type="number"
                      value={keywayDepthFeet}
                      onChange={(e) => setKeywayDepthFeet(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                    />
                    <span className="text-[9px] text-slate-500 block">Standard: 3ft to 6ft into virgin clay</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-400 block text-[10px] uppercase">Side Slope (X : 1 Ratio)</label>
                    <select
                      value={keywaySideSlope}
                      onChange={(e) => setKeywaySideSlope(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 outline-none focus:border-emerald-500"
                    >
                      <option value="1.0">1:1 Slope (Recommended for stable soils)</option>
                      <option value="1.5">1.5:1 Slope (Medium moisture sand/loam)</option>
                      <option value="0.5">0.5:1 Slope (Dense dry Georgia red clay)</option>
                    </select>
                    <span className="text-[9px] text-slate-500 block">Angles trench walls safely for operators</span>
                  </div>
                </div>
              </div>
            )}

            {selectedSubPhase === "Silt Retaining Basin Spillway Rocks Rip-Rap" && (
              <div className="bg-slate-950 border border-orange-850 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-305">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-orange-950 text-orange-400 font-bold border border-orange-800 px-2 py-0.5 rounded tracking-wide uppercase">Spillway Rock Sizer</span>
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-100">Emergency Spillway channel & Upstream Wave Guard Parameters</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 sm:ml-auto">Washout velocity protection calculator</p>
                </div>
                
                <p className="text-[11px] text-slate-300 leading-normal max-w-4xl">
                  Discharge channels must be lined with heavy rip-rap over non-woven geotextile fabric to absorb hydraulic shear velocities. For the upstream front face of the earthen dam, waves can erode clay walls; a 12" protective rip-rap ring prevents this. Configure exact dimensions below to ensure enough Granite Class II is priced.
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-400 block text-[10px] uppercase">Spillway Flat Length (FT)</label>
                    <input
                      type="number"
                      value={spillwayLengthFeet}
                      onChange={(e) => setSpillwayLengthFeet(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-orange-400 font-mono font-bold outline-none focus:border-orange-500"
                    />
                    <span className="text-[9px] text-slate-500 block">Slope length down face + apron</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-400 block text-[10px] uppercase">Spillway Width (FT)</label>
                    <input
                      type="number"
                      value={spillwayWidthFeet}
                      onChange={(e) => setSpillwayWidthFeet(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-orange-400 font-mono font-bold outline-none focus:border-orange-500"
                    />
                    <span className="text-[9px] text-slate-500 block">Width of exit channel base</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-400 block text-[10px] uppercase">Rip-Rap Thickness</label>
                    <select
                      value={spillwayRiprapThicknessInches}
                      onChange={(e) => setSpillwayRiprapThicknessInches(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-slate-250 outline-none focus:border-orange-500"
                    >
                      <option value="12">12 Inches (Class I smaller velocities)</option>
                      <option value="18">18 Inches (Class II standard protection)</option>
                      <option value="24">24 Inches (Class III severe high flows)</option>
                    </select>
                    <span className="text-[9px] text-slate-500 block">Suggested: 1.5x - 2x stone d50</span>
                  </div>

                  <div className="space-y-1 text-xs col-span-2 bg-slate-900/45 p-3 rounded-lg border border-slate-850 flex flex-col justify-between">
                    <div className="flex items-center justify-between h-full">
                      <div>
                        <label className="font-bold text-slate-200 block text-[10px] uppercase">Include Upstream Wave Guard?</label>
                        <span className="text-[9.5px] text-slate-400 leading-none block mt-0.5">Places heavy protection across pond water line face ({lengthFeet} ft)</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={spillwayOnBothSides}
                          onChange={(e) => setSpillwayOnBothSides(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-350 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subcontractor Setup Card */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border flex-shrink-0 ${isSubcontracted ? 'bg-orange-950/40 border-orange-800 text-orange-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-white flex items-center flex-wrap gap-2">
                      <span>Sub-contract this phase component?</span>
                      <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded uppercase font-mono tracking-wider">1099 Entity Setup</span>
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-normal max-w-2xl">
                      Mark this sub-phase to be handled by a third-party subcontractor. You remain legally responsible for quality control and client milestones, while paying the vendor as a 1099 subcontractor.
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 self-start sm:self-auto">
                  <input 
                    type="checkbox" 
                    checked={isSubcontracted} 
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsSubcontracted(checked);
                      if (checked && !subcontractorCost) {
                        setSubcontractorCost(currentLineItemsCostTotal.toString());
                      }
                    }} 
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-350 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {isSubcontracted && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-900 text-xs animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 block">Subcontracting Vendor Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Southern Excavation LLC (1099)"
                      value={subcontractorName}
                      onChange={(e) => setSubcontractorName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-white focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 block font-sans">Vendor Quote Cost ($ Baseline)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm leading-none">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={subcontractorCost}
                        onChange={(e) => setSubcontractorCost(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-7 pr-3 text-white focus:border-orange-500 outline-none font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Computed estimate baseline: <strong className="font-mono text-slate-400">${currentLineItemsCostTotal.toLocaleString()}</strong>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 block flex justify-between">
                      <span>Our Administrative Markup</span>
                      <span className="font-mono text-orange-400 font-extrabold">{subcontractorMarkup}%</span>
                    </label>
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 border border-slate-800 rounded-lg h-[38px]">
                      <input
                        type="range"
                        min="5"
                        max="40"
                        step="5"
                        value={subcontractorMarkup}
                        onChange={(e) => setSubcontractorMarkup(Number(e.target.value))}
                        className="w-full accent-orange-500 h-1 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] text-slate-550 block mt-1">
                      Charge Client: <strong className="font-mono text-emerald-400">${Math.round((parseFloat(subcontractorCost) || 0) * (1 + subcontractorMarkup/100)).toLocaleString()}</strong> (You keep <strong className="font-mono text-amber-500">${Math.round((parseFloat(subcontractorCost) || 0) * (subcontractorMarkup/100)).toLocaleString()}</strong> markup)
                    </span>
                  </div>

                  <div className="md:col-span-3 pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900/80">
                    <p className="text-[11px] text-sky-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Subcontractor Work Orders & IRS 1099 Form W-9 Compliance Packets can be generated instantly.</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => handlePrintSubcontractorWorkOrder()}
                      className="px-3.5 py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 hover:text-white rounded-lg text-[10.5px] font-bold uppercase transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-sky-400" />
                      <span>Print Work Order & 1099 W-9 (PDF)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Workbook dynamic workspace template editor */}
            <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg">
                    <Sliders className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase tracking-wider text-slate-100">
                      Worksheet: <span className="text-orange-500">Estimator_Dynamic</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Edit computed machine hours, quantities, materials, or rates dynamically to fine-tune operations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddManualLineItem}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-205 text-xs font-bold uppercase rounded-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-orange-500" />
                    Custom Line Item
                  </button>
                  <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-850 font-mono text-center">
                    <span className="text-[9px] text-slate-500 block font-sans">GEOMETRY USED</span>
                    <span className="text-[11px] font-bold text-emerald-400">{areaSqFt.toLocaleString()} SQFT &bull; {excavationCuYds} CY</span>
                  </div>
                </div>
              </div>

              {/* Ledger Spreadsheet Table representation */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-800 font-bold uppercase text-slate-500 text-[10px] tracking-wider">
                      <th className="py-3 px-4 w-28">Category</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-center w-28">Quantity</th>
                      <th className="py-3 px-4 w-20">Unit</th>
                      <th className="py-3 px-4 text-right w-28">Unit Rate/Price ($)</th>
                      <th className="py-3 px-4 text-right w-28 text-white">Line Total ($)</th>
                      <th className="py-3 px-3 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {currentLineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase ${
                            item.category === 'Equipment' 
                              ? 'bg-orange-950/45 text-orange-400 border border-orange-900' 
                              : item.category === 'Materials'
                                ? 'bg-emerald-950/45 text-emerald-400 border border-emerald-900'
                                : item.category === 'Labor'
                                  ? 'bg-blue-950/45 text-blue-400 border border-blue-900'
                                  : 'bg-slate-900 text-slate-400'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const updated = currentLineItems.map(li => li.id === item.id ? { ...li, description: e.target.value } : li);
                              setCurrentLineItems(updated);
                            }}
                            className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-slate-700 outline-none py-1 w-full text-slate-200 font-semibold"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono text-center">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemValueChange(item.id, 'quantity', Number(e.target.value))}
                            className="w-16 bg-slate-900 border border-slate-800 py-1 rounded text-center text-slate-200 font-bold"
                          />
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-medium">
                          {item.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          <div className="flex items-center justify-end gap-1">
                            <span>$</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleItemValueChange(item.id, 'unitPrice', Number(e.target.value))}
                              className="w-16 bg-slate-900 border border-slate-800 py-1 rounded text-center text-slate-200 font-bold"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-white">
                          ${item.totalCost.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDeleteLineItem(item.id)}
                            className="text-slate-500 hover:text-rose-500 p-1.5 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sub-totaling workspace card */}
              <div className="p-6 bg-slate-900 border border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
                
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Marked Phase Pricing Formula</span>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-300">
                    <span>Baseline Cost: <strong className="text-white">${currentLineItemsCostTotal.toLocaleString()}</strong></span>
                    <span>+</span>
                    <span>Markup: <strong className="text-orange-500">{markupPercent}%</strong></span>
                    <span>&rarr;</span>
                    <span className="bg-orange-950 px-2 py-0.5 border border-orange-900 rounded font-mono font-bold text-orange-400">Computed Contract Bid</span>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">ESTIMATED BID PRICE</span>
                  <div className="font-mono font-black text-3xl sm:text-4xl text-orange-400 mt-1">
                    ${Math.round(currentLineItemsCostTotal * (1 + markupPercent / 100)).toLocaleString()}
                  </div>
                </div>

              </div>

              {/* Custom Phase notes */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-305 block">Foreman Field Notes for this specific phase (E.g. specialized clearing limits, marshy spots)</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared limits strictly inside orange flags. Excluded the wet pond runoff area."
                  value={customPhaseNotes}
                  onChange={(e) => setCustomPhaseNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-300 outline-none focus:border-orange-500"
                />
              </div>

              {/* Action Buttons row */}
              <div className="pt-4 border-t border-slate-900 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStep('inputs')}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold uppercase rounded-lg cursor-pointer transition-colors"
                >
                  &larr; Back to Geometry
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      generateItemsFromTemplate(selectedTemplate);
                      alert('Workbook recalculations triggered perfectly!');
                    }}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white text-xs font-bold uppercase rounded-lg cursor-pointer"
                  >
                    Reset Template Defaults
                  </button>

                  <button
                    type="button"
                    onClick={handleCompileCurrentPhase}
                    className={`px-6 py-3 ${editingPhaseId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-orange-600 hover:bg-orange-500'} text-white text-xs font-black uppercase rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer tracking-wider hover:scale-101`}
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>{editingPhaseId ? '💾 Save Edited Sub-Phase Changes' : 'Sync & Add to Project Total Compiled Sheet'}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {activeStep === 'totals' && (
          /* STEP 3: Compiled "Project_Total" Ledger Sheet Dashboard */
          <div className="space-y-8">
            
            <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-orange-950/60 border border-orange-850 text-orange-400 rounded-lg animate-pulse">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase tracking-wider text-slate-100">
                      Worksheet: <span className="text-orange-500">Project_Total Compilation</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Consolidated ledger details across all added sub-phases. Review summaries to print final proposals.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResetEntireProject}
                    disabled={compiledPhases.length === 0}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-500 hover:text-rose-500 text-xs font-bold uppercase rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Ledger Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep('templates')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase rounded-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Subphase
                  </button>
                </div>
              </div>

              {/* BRAND NEW: OneDrive & Excel Bid Workflow Station */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-850 space-y-5 text-left">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-orange-405 bg-orange-950/50 border border-orange-900 px-2 py-0.5 rounded">
                      Enterprise Suite
                    </span>
                    <h5 className="text-sm font-display font-black text-white flex items-center gap-1.5">
                      <FolderSync className="w-4 h-4 text-emerald-400" />
                      OneDrive & Microsoft Excel Synchronization Center
                    </h5>
                  </div>

                  {/* Status Selection Tag */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black text-slate-500 font-mono">Bid Status:</span>
                    <select
                      value={projectStatus}
                      onChange={(e) => setProjectStatus(e.target.value)}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-bold text-orange-400 py-1.5 px-3 outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="Draft">📝 Draft</option>
                      <option value="Under Review">🔍 Under Review</option>
                      <option value="Submitted to Client">✉️ Submitted to Client</option>
                      <option value="Contract Won">🏆 Contract Won (Active)</option>
                      <option value="Archived / Closed">📁 Closed / Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left box: OneDrive backup & import */}
                  <div className="md:col-span-7 space-y-3 md:border-r md:border-slate-800 md:pr-5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block">Local Backup & OneDrive File Transfer</span>
                    
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        disabled={compiledPhases.length === 0}
                        className="px-4 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-350 disabled:opacity-40 disabled:hover:bg-emerald-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>Export MS Excel (.csv)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportBackupJSON}
                        disabled={compiledPhases.length === 0}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-350 disabled:opacity-40 disabled:hover:bg-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-orange-400" />
                        <span>Save Bid Backup (.json)</span>
                      </button>

                      <div className="relative inline-block">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportBackupJSON}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          id="onedrive-import-subframe-real"
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-sky-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all pointer-events-none"
                        >
                          <Upload className="w-4 h-4 text-sky-400" z-auto="true" />
                          <span>Load Bid Backup</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[10.5px] text-slate-500 leading-normal">
                      💡 <strong>Pro Tip:</strong> Export your <strong>MS Excel Ledger CSV</strong>, or save a <strong>Bid Backup JSON</strong> directly to your local synced OneDrive folder structure to maintain lifetime backups! Let our app replace manual sheets while Microsoft Cloud secures the file storage.
                    </p>

                    <div>
                      <button
                        type="button"
                        onClick={() => setOneDriveHelpOpen(!oneDriveHelpOpen)}
                        className="text-[10.5px] font-black uppercase text-orange-400 tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {oneDriveHelpOpen ? "Hide OneDrive Directory Structure Blueprint ▲" : "View Synced OneDrive Directory Structure Blueprint ▼"}
                      </button>
                    </div>
                  </div>

                  {/* Right box: Real-time Global Margin tuning */}
                  <div className="md:col-span-5 space-y-3.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block">Live Excel-style Margin Tuner</span>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        Adjust profit buffers globally across all added line items instantly. Simulates bid variations.
                      </p>
                    </div>

                    <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-850">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-400 font-bold">Global Margin Modifier:</span>
                        <span className={`font-black p-1 rounded font-bold ${globalMarkupAdjustment === 0 ? 'text-slate-400 bg-slate-900 border border-slate-800' : globalMarkupAdjustment > 0 ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-900' : 'text-rose-400 bg-rose-950/60 border border-rose-900'}`}>
                          {globalMarkupAdjustment > 0 ? `+${globalMarkupAdjustment}%` : `${globalMarkupAdjustment}%`}
                        </span>
                      </div>

                      <div className="pt-1.5 font-bold">
                        <input
                          type="range"
                          min="-20"
                          max="40"
                          step="1"
                          value={globalMarkupAdjustment}
                          onChange={(e) => setGlobalMarkupAdjustment(Number(e.target.value))}
                          className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Presets and clear */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5 text-[9px] font-bold font-mono">
                        <span className="text-slate-500 uppercase self-center mr-1">Presets:</span>
                        <button
                          type="button"
                          onClick={() => setGlobalMarkupAdjustment(-5)}
                          className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 rounded transition-all cursor-pointer"
                        >
                          -5%
                        </button>
                        <button
                          type="button"
                          onClick={() => setGlobalMarkupAdjustment(0)}
                          className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 rounded transition-all cursor-pointer"
                        >
                          Flat
                        </button>
                        <button
                          type="button"
                          onClick={() => setGlobalMarkupAdjustment(5)}
                          className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 rounded transition-all cursor-pointer"
                        >
                          +5%
                        </button>
                        <button
                          type="button"
                          onClick={() => setGlobalMarkupAdjustment(10)}
                          className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 rounded transition-all cursor-pointer"
                        >
                          +10%
                        </button>
                        <button
                          type="button"
                          onClick={() => setGlobalMarkupAdjustment(15)}
                          className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 rounded transition-all cursor-pointer"
                        >
                          +15%
                        </button>
                        <button
                          type="button"
                          onClick={() => setGlobalMarkupAdjustment(25)}
                          className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 rounded transition-all cursor-pointer"
                        >
                          +25%
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {oneDriveHelpOpen && (
                  <div className="p-4 sm:p-5 bg-slate-950 border border-slate-850 rounded-2xl space-y-3.5 text-xs animate-in font-sans leading-relaxed text-slate-300">
                    <h6 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-1 pb-1 border-b border-slate-900 text-emerald-400 font-bold">
                      📁 Recommended Sync Folder Directory: OneDrive System
                    </h6>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      To keep your folders organized, we recommend configuring your local Windows OneDrive folders exactly like this setup. You can drop printed Agreement PDFs, Excel-formatted CSV sheets, and raw .json project configurations into the following subfolders:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono mt-2">
                      <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1">
                        <strong className="text-white">📁 OneDrive/TJD_Bids/01_Active_Drafts/</strong>
                        <p className="text-slate-500 font-sans text-[10.5px]">For raw json files currently under design. Update, reload, and verify calculations.</p>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1">
                        <strong className="text-orange-400 font-bold">📁 OneDrive/TJD_Bids/02_Proposals_Sent/</strong>
                        <p className="text-slate-500 font-sans text-[10.5px]">Store completed Agreement PDFs and Excel spreadsheets shared with clients near Lake Oconee.</p>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1">
                        <strong className="text-emerald-400 font-bold">📁 OneDrive/TJD_Bids/03_Contracts_Won/</strong>
                        <p className="text-slate-500 font-sans text-[10.5px]">Move backups and logs of won contracts here to initiate heavy mobilization field operations.</p>
                      </div>
                    </div>
                    <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 text-[10.5px] rounded-xl text-emerald-300 font-sans">
                      👍 <strong>Folder Migration Instruction:</strong> To backup a bid, configure it, press <strong>"Save Bid Backup (.json)"</strong>, and save it in <em>"Active_Drafts"</em>. Once finalized, press <strong>"Export MS Excel"</strong> and <strong>"Print Agreement PDF"</strong>, saving those final documents directly in <em>"Proposals_Sent"</em>. This gives you 100% cloud compliance without paying for heavy relational SQL databases!
                    </div>
                  </div>
                )}
              </div>

              {compiledPhases.length === 0 ? (
                /* Empty Project Compiled state */
                <div className="text-center py-16 px-4 space-y-4">
                  <ClipboardList className="w-12 h-12 text-slate-700 mx-auto animate-bounce" />
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-slate-350">Ledger Sheet is Empty</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      First configure your client context geometry, then select sub-phases using the dynamic estimator templates to build your project total cumulative bid!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveStep('inputs')}
                    className="mt-2 py-2 px-6 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs font-bold uppercase text-slate-200 cursor-pointer"
                  >
                    Configure Site Geometry Now &rarr;
                  </button>
                </div>
              ) : (
                /* Interactive Compiled Sub-Phase List */
                <div className="space-y-5">
                  
                  <div className="divide-y divide-slate-900 border border-slate-850 rounded-2xl overflow-hidden bg-slate-900/20">
                    {compiledPhases.map((phase, idx) => (
                      <div key={phase.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-900/40 transition-colors">
                        
                        <div className="space-y-1.5 text-left md:max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[9px] bg-orange-950 font-bold border border-orange-900 text-orange-400 px-2 py-0.5 rounded leading-none uppercase tracking-wide">
                              Phase Component 0{idx+1}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {phase.id}</span>
                            {phase.isSubcontracted && (
                              <span className="font-mono text-[9px] bg-sky-950 font-bold border border-sky-900 text-sky-400 px-2 py-0.5 rounded leading-none uppercase tracking-wide">
                                Subcontracted (1099 Entity)
                              </span>
                            )}
                          </div>
                          
                          <h5 className="font-display font-black text-sm text-slate-200">
                            {phase.phaseName} &mdash; <span className="text-orange-500">{phase.subPhaseName}</span>
                          </h5>
                          
                          {phase.isSubcontracted ? (
                            <p className="text-[11px] text-sky-400 leading-normal">
                              1099 Vendor: <strong className="text-white">{phase.subcontractorName || 'Custom 1099 Vendor'}</strong> &bull; Subcontractor Cost Basis: <strong className="text-white">${(phase.subcontractorCost || 0).toLocaleString()}</strong> &bull; Admin Markup: <strong className="text-orange-400">{phase.subcontractorMarkupPercent || 15}%</strong>
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 leading-normal">
                              Template: <strong>{phase.templateName || phase.subPhaseName || 'Standard'}</strong> &bull; Applied Area: <strong>{(phase.geometryUsed?.areaSqFt || phase.squareFeet || 0).toLocaleString()} SQFT</strong> &bull; Calculated Cut/Fill Volume: <strong>{(phase.geometryUsed?.excavationCuYds || phase.cubicYards || 0).toLocaleString()} CY</strong>
                            </p>
                          )}

                          {phase.notes && (
                            <p className="text-[10px] text-slate-500 bg-slate-900 px-2.5 py-1 rounded inline-block italic">
                              Notes: {phase.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 justify-between w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-900">
                          <div className="text-left md:text-right">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-sans">SUB-PHASE TOTAL</span>
                            <span className="font-mono font-black text-base text-white block">
                              ${Math.round((phase.totalBidPrice || phase.totalCost || 0) * (1 + globalMarkupAdjustment / 100)).toLocaleString()}
                            </span>
                            {globalMarkupAdjustment !== 0 && (
                              <span className="text-[9px] text-slate-500 font-mono line-through block">
                                base: ${(phase.totalBidPrice || phase.totalCost || 0).toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {phase.isSubcontracted && (
                              <button
                                type="button"
                                onClick={() => handlePrintSubcontractorWorkOrder(phase)}
                                className="px-2.5 py-1.5 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-300 hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                title="Print Subcontractor Work Order & IRS Form W-9 Compliance Packet"
                              >
                                <FileText className="w-3.5 h-3.5 text-sky-400" />
                                <span className="text-[10px] font-bold uppercase font-mono">Work Order (PDF)</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleEditSubPhase(phase)}
                              className="p-2 border border-slate-800 text-slate-400 hover:text-orange-400 hover:bg-slate-900 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                              title="Edit Subphase Parameters & Items"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="text-[10px] uppercase font-black px-1 hidden sm:inline">Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSubPhase(phase.id)}
                              className="p-2 border border-slate-800 text-slate-500 hover:text-rose-500 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
                              title="Delete Subphase"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Consolidated Project Total Dashboard panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl" id="compiler-dashboard">
                    
                    <div className="lg:col-span-4 space-y-4 text-left border-b lg:border-b-0 lg:border-r border-slate-900 pb-5 lg:pb-0 lg:pr-5">
                      <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider block">Master Commercial Bid Workbook</span>
                      
                      {/* Active Bid Run-down */}
                      <div className="space-y-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-850">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Commercial Bid Itemization</span>
                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="text-slate-400">Precision Site Labor:</span>
                            <span className="text-slate-200 font-bold">${totals.totalLaborCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="text-slate-400">Equipment Operations:</span>
                            <span className="text-slate-200 font-bold">${totals.totalEquipmentCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-1">
                            <span className="text-slate-400">Materials & Logistics:</span>
                            <span className="text-slate-200 font-bold">${totals.totalMaterialsCost.toLocaleString()}</span>
                          </div>
                          {totals.totalPermitsCost > 0 && (
                            <div className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="text-slate-400">Permits & Fees:</span>
                              <span className="text-slate-200 font-bold">${totals.totalPermitsCost.toLocaleString()}</span>
                            </div>
                          )}
                          {totals.totalSubcontractorCost > 0 && (
                            <div className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="text-slate-400">1099 Subcontractors:</span>
                              <span className="text-slate-200 font-bold">${totals.totalSubcontractorCost.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-orange-400 font-bold border-b border-slate-800 pb-1 pt-1">
                            <span>Direct Cost Total:</span>
                            <span>${totals.grandLineCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-emerald-400 font-medium">
                            <span>Markup Profit Earned:</span>
                            <span className="font-mono font-bold">+${totals.finalMarkupEarned.toLocaleString()}</span>
                          </div>
                          
                          {/* Live Markup vs Margin Percentage Comparison Badge */}
                          <div className="my-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-amber-400 font-bold">Applied Markup:</span>
                              <span className="font-mono font-black text-amber-400">
                                {(totals.finalMarkupEarned / (totals.grandLineCost || 1) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-sky-400 font-bold">Actual Net Margin:</span>
                              <span className="font-mono font-black text-sky-400">
                                {(totals.finalMarkupEarned / (totals.adjustedGrandBidPrice || 1) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono text-right pt-0.5 border-t border-slate-900">
                              {((totals.finalMarkupEarned / (totals.adjustedGrandBidPrice || 1)) * 100) < 15 
                                ? '⚡ Aggressive Margin Zone (<15%)'
                                : ((totals.finalMarkupEarned / (totals.adjustedGrandBidPrice || 1)) * 100) <= 28
                                ? '✅ Optimal Profit Zone (15-28%)'
                                : '👑 High Margin Zone (>28%)'}
                            </div>
                          </div>

                          <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1 font-bold">
                            <span>Base Bid Price:</span>
                            <span>${totals.adjustedGrandBidPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Commercial Settings */}
                      <div className="p-3 bg-slate-900 rounded-2xl border border-slate-850 space-y-3">
                        <span className="text-[9px] font-black text-sky-400 uppercase tracking-wider block">Commercial Bid Adjustments</span>
                        
                        {/* Finance Charges Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-medium">Finance Charge Term Surcharge (%)</label>
                          <div className="flex items-center gap-2">
                            <select
                              value={financeChargePercent}
                              onChange={(e) => setFinanceChargePercent(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                            >
                              <option value="0">0% (Standard Cash / Net 10)</option>
                              <option value="2.5">2.5% Carrying Fee</option>
                              <option value="5">5% Carrying Fee (Net 30)</option>
                              <option value="7.5">7.5% Carrying Fee (Net 60)</option>
                              <option value="10">10% Carrying Fee (Net 90+)</option>
                            </select>
                          </div>
                        </div>

                        {/* Project Duration Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-medium">Estimated Project Timeline (Days)</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              value={estimatedDurationDays}
                              onChange={(e) => setEstimatedDurationDays(Math.max(1, Number(e.target.value)))}
                              className="w-20 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-center font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                            />
                            <span className="text-xs text-slate-400">Calendar Days</span>
                          </div>
                        </div>

                        {/* Concrete Curing & Dimension Timeline Calculator */}
                        <div className="p-3.5 bg-slate-900/90 border border-amber-500/30 rounded-2xl space-y-3 mt-3 text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Timer className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider font-display">
                                Concrete Curing & Dimensions
                              </span>
                            </div>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={concreteCuringActive}
                                onChange={(e) => setConcreteCuringActive(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                              />
                              <span className="text-[11px] font-semibold text-slate-300">
                                Active
                              </span>
                            </label>
                          </div>

                          {concreteCuringActive && (
                            <div className="space-y-2.5 pt-1 text-left animate-in fade-in duration-200">
                              <p className="text-[10.5px] text-slate-400 leading-snug">
                                Automatically computes hydration curing time from concrete slab/footing dimensions before heavy equipment or framing loads can resume.
                              </p>

                              {/* Preset / Element Type Selector */}
                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 font-medium block">Concrete Element Type</label>
                                <select
                                  value={concreteElementType}
                                  onChange={(e) => setConcreteElementType(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                >
                                  <option value='House Pad / Commercial Slab (6")'>House Pad / Commercial Slab (6")</option>
                                  <option value='Light Sidewalk / Apron (4")'>Light Sidewalk / Apron (4")</option>
                                  <option value='Heavy Industrial Foundation (8")'>Heavy Industrial Foundation (8")</option>
                                  <option value='Bridge Abutments / Mass Footings (12"+)'>Bridge Abutments / Mass Footings (12"+)</option>
                                  <option value='Concrete Headwall / Spillway Structure'>Concrete Headwall / Spillway Structure</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] text-slate-400 font-medium block">Concrete Mix Grade</label>
                                <select
                                  value={concretePsiGrade}
                                  onChange={(e) => setConcretePsiGrade(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                >
                                  <option value='3,500 PSI High-Early'>3,500 PSI High-Early (Rapid Cure)</option>
                                  <option value='3,000 PSI Standard'>3,000 PSI Standard Residential</option>
                                  <option value='4,000 PSI High-Strength'>4,000 PSI High-Strength Structural</option>
                                  <option value='5,000 PSI Heavy Commercial'>5,000 PSI Heavy Commercial</option>
                                </select>
                              </div>

                              {/* Dimension Inputs */}
                              <div className="grid grid-cols-3 gap-1.5">
                                <div>
                                  <label className="text-[9.5px] text-slate-400 font-medium block mb-0.5">Length (ft)</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={concreteLengthFt}
                                    onChange={(e) => setConcreteLengthFt(Math.max(1, Number(e.target.value)))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9.5px] text-slate-400 font-medium block mb-0.5">Width (ft)</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={concreteWidthFt}
                                    onChange={(e) => setConcreteWidthFt(Math.max(1, Number(e.target.value)))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9.5px] text-slate-400 font-medium block mb-0.5">Thick (in)</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="48"
                                    value={concreteThicknessInches}
                                    onChange={(e) => setConcreteThicknessInches(Math.max(1, Number(e.target.value)))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                                  />
                                </div>
                              </div>

                              {/* Output Stats Card */}
                              {(() => {
                                const stats = calculateConcreteCuringStats(concreteLengthFt, concreteWidthFt, concreteThicknessInches, concreteElementType, concretePsiGrade);
                                return (
                                  <div className="p-2 bg-slate-950/80 border border-amber-900/50 rounded-xl space-y-2">
                                    <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                                      <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                                        <span className="text-[8.5px] text-slate-400 block font-sans">Concrete Volume</span>
                                        <span className="font-bold text-amber-400 text-xs">{stats.volumeCuYds} Cu. Yds.</span>
                                      </div>
                                      <div className="bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                                        <span className="text-[8.5px] text-slate-400 block font-sans font-semibold">Curing Buffer</span>
                                        <span className="font-bold text-emerald-400 text-xs">{stats.cureDays} Days</span>
                                      </div>
                                    </div>

                                    <div className="text-[10px] text-slate-300 space-y-0.5 pt-0.5 border-t border-slate-900">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Foot Traffic:</span>
                                        <span className="font-semibold text-slate-200">Day {stats.footTrafficDays}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Full Design Strength:</span>
                                        <span className="font-semibold text-slate-200">Day {stats.fullStrengthDays}</span>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setEstimatedDurationDays(prev => prev + stats.cureDays)}
                                      className="w-full py-1 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 rounded-lg text-[10.5px] font-semibold flex items-center justify-center gap-1 transition-colors"
                                    >
                                      <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                      <span>+ Add {stats.cureDays} Curing Days to Timeline</span>
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Final Commercial Invoiced Total */}
                      <div className="space-y-1.5 border-t border-slate-900 pt-3">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans">Final Commercial Bid Invoice</span>
                        <div className="font-mono font-black text-3xl sm:text-4xl text-orange-400 leading-none">
                          ${totals.finalInvoiceTotal.toLocaleString()}
                        </div>
                        {totals.financeChargeAmount > 0 && (
                          <div className="text-[9.5px] text-sky-400 font-mono">
                            Includes ${totals.financeChargeAmount.toLocaleString()} ({financeChargePercent}% Surcharge)
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 p-3 bg-emerald-950/40 border border-emerald-900 rounded-xl">
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block font-sans">Mobilization Deposit (50% rule)</span>
                        <div className="font-mono text-base font-extrabold text-white">
                          ${totals.depositNeeded.toLocaleString()}
                        </div>
                        <p className="text-[9.5px] text-slate-400 leading-tight">Must clear accounts prior to heavy equipment dispatching.</p>
                      </div>

                      {totals.hasSubcontractedPhases && (
                        <div className="space-y-3 p-3.5 bg-sky-950/40 border border-sky-900/80 rounded-xl animate-in fade-in duration-200">
                          <div className="flex items-center justify-between border-b border-sky-900/60 pb-2">
                            <div>
                              <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block font-sans">1099 Subcontractor Work Orders & Tax Ledger</span>
                              <p className="text-[9.5px] text-slate-400">IRS Form W-9 & 1099-NEC compliance reporting for trade partners</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePrintSubcontractorWorkOrder()}
                              className="px-2.5 py-1 bg-sky-900 hover:bg-sky-800 text-sky-200 hover:text-white rounded text-[9.5px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border border-sky-750"
                            >
                              <Printer className="w-3 h-3 text-sky-400" />
                              <span>Print Packet</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-sky-950/60 p-2 rounded-lg border border-sky-900/50">
                            <div>
                              <span className="text-[9px] text-slate-400 block font-sans">Total TJD Pays Subcontractors</span>
                              <span className="font-bold text-white text-xs">${totals.totalSubcontractorCost.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-sans">TJD Markup Retained</span>
                              <span className="font-bold text-emerald-400 text-xs">${totals.totalSubcontractorMarkupEarned.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="space-y-2 pt-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block font-sans">Active Subcontracted Phase Orders ({compiledPhases.filter(p => p.isSubcontracted).length})</span>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {compiledPhases.filter(p => p.isSubcontracted).map((phase) => (
                                <div key={phase.id} className="p-2 bg-slate-900/90 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                                  <div className="space-y-0.5">
                                    <div className="font-bold text-white text-[11px]">
                                      {phase.subcontractorName || 'Vetted 1099 Subcontractor'}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {phase.phaseName} &bull; <span className="text-sky-300">{phase.subPhaseName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-0.5">
                                      <span className="font-mono font-extrabold text-emerald-400 text-[10px]">
                                        Payout: ${(phase.subcontractorCost || 0).toLocaleString()}
                                      </span>
                                      <span className="text-[8.5px] bg-sky-950 border border-sky-800 text-sky-300 px-1.5 py-0.2 rounded uppercase font-mono">
                                        W-9 Mandatory
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handlePrintSubcontractorWorkOrder(phase)}
                                    className="px-2 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 hover:text-white rounded text-[9.5px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0"
                                  >
                                    <FileText className="w-3 h-3 text-sky-400" />
                                    <span>Work Order</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <p className="text-[9px] text-sky-300/90 leading-normal font-sans border-t border-sky-900/50 pt-1.5">
                            📌 <strong>IRS Compliance Rule:</strong> Subcontractors must submit a completed, signed IRS Form W-9 prior to check draws. TJD issues Form 1099-NEC at tax year-end.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Consolidated Material Orders Sheets summary */}
                    <div className="lg:col-span-5 space-y-4 text-left text-xs border-b lg:border-b-0 lg:border-r border-slate-900 pb-5 lg:pb-0 lg:px-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Consolidated Materials & Resource Sheet</span>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 p-3 bg-slate-900 rounded-xl border border-slate-855 font-mono">
                          <span className="text-[9px] text-slate-500 font-sans font-bold uppercase block tracking-wider">Granite Aggregates</span>
                          <span className="text-white font-extrabold text-sm">{totals.totalTonsAggregates.toLocaleString()} Tons</span>
                          <span className="text-[9.5px] text-slate-500 block font-sans">Class A / Surge Stone</span>
                        </div>

                        <div className="space-y-1 p-3 bg-slate-900 rounded-xl border border-slate-855 font-mono">
                          <span className="text-[9px] text-slate-500 font-sans font-bold uppercase block tracking-wider">Compacted Clay Fill</span>
                          <span className="text-emerald-400 font-extrabold text-sm">{totals.totalTonsClay.toLocaleString()} Tons</span>
                          <span className="text-[9.5px] text-slate-550 block font-sans">Georgia red clay core</span>
                        </div>

                        <div className="space-y-1 p-3 bg-slate-900 rounded-xl border border-slate-855 font-mono">
                          <span className="text-[9px] text-slate-500 font-sans font-bold uppercase block tracking-wider">Off-Road Diesel</span>
                          <span className="text-white font-extrabold text-sm">&asymp; {totals.totalDieselGallons.toLocaleString()} Gal</span>
                          <span className="text-[9.5px] text-slate-500 block font-sans">For dozer/loader burns</span>
                        </div>

                        <div className="space-y-1 p-3 bg-slate-900 rounded-xl border border-slate-855 font-mono">
                          <span className="text-[9px] text-slate-500 font-sans font-bold uppercase block tracking-wider">Machine Runtime</span>
                          <span className="text-white font-extrabold text-sm">{totals.totalMachineHours} Hours</span>
                          <span className="text-[9.5px] text-slate-500 block font-sans">Total fleet oper.</span>
                        </div>
                      </div>

                      {/* Detailed Procurement Estimates with Georgia competitive pricing & Foreman overrides */}
                      {totals.detailedMaterials && totals.detailedMaterials.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-850 space-y-2">
                          <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block font-sans">
                            Middle Georgia procurement order guide
                          </span>
                          <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                            {totals.detailedMaterials.map((mat, i) => (
                              <div key={i} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-850 flex justify-between items-center gap-3">
                                <div className="text-left max-w-[65%]">
                                  <p className="font-bold text-[11px] text-slate-200 leading-tight">{mat.name}</p>
                                  <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                                    Price Key Rate: ${(mat.rate ?? 0).toFixed(2)} / {mat.unit.toLowerCase().includes('roll') ? 'roll' : mat.unit.toLowerCase().includes('load') ? 'truck' : mat.unit.toLowerCase().includes('section') ? 'sect.' : 'ton'}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="block font-mono font-black text-[11px] text-white">
                                    {Math.round(mat.quantity).toLocaleString()} {mat.unit}
                                  </span>
                                  <span className="block text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                                    ${Math.round(mat.totalCost).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-[9px] text-slate-500 leading-normal font-sans pt-1">
                            * Gathers verified Greensboro, Eatonton, and Milledgeville competitive supply catalog prices with Foreman overrides active.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Proposal Action Center */}
                    <div className="lg:col-span-3 flex flex-col justify-between gap-4 pt-1 lg:pl-5">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Corporate Actions</span>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Generate dynamic corporate proposals ready for Lake Oconee client reviews, maps, and contract signatures.
                        </p>
                      </div>

                      {/* Client / Office PDF copy mode toggle */}
                      <div className="space-y-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">PDF Print Mode Target</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            id="btn-print-mode-client"
                            onClick={() => setPdfPrintMode('client')}
                            className={`py-1.5 px-2 rounded-lg text-[9.5px] font-bold uppercase transition-all cursor-pointer ${
                              pdfPrintMode === 'client'
                                ? 'bg-orange-600/20 text-orange-400 border border-orange-500/50 font-black'
                                : 'bg-slate-900/40 text-slate-500 border border-slate-850 hover:text-slate-300'
                            }`}
                          >
                            🤝 Client Copy
                          </button>
                          <button
                            type="button"
                            id="btn-print-mode-office"
                            onClick={() => setPdfPrintMode('office')}
                            className={`py-1.5 px-2 rounded-lg text-[9.5px] font-bold uppercase transition-all cursor-pointer ${
                              pdfPrintMode === 'office'
                                ? 'bg-orange-600/20 text-orange-400 border border-orange-500/50 font-black'
                                : 'bg-slate-900/40 text-slate-500 border border-slate-850 hover:text-slate-300'
                            }`}
                          >
                            🏢 Office Copy
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-tight">
                          {pdfPrintMode === 'client' 
                            ? "Summarized layout: Shows high-level project steps and one grand total price to prevent client nickel-and-diming."
                            : "Detailed layout: Shows full itemized line-item costs, materials sheets, machinery hours, and markups."
                          }
                        </p>
                      </div>

                      <div className="space-y-2 mt-auto">
                        <button
                          type="button"
                          id="btn-print-proposal-pdf"
                          onClick={handlePrintProposalPDF}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-xs font-black uppercase rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                        >
                          <Printer className="w-4 h-4 text-orange-500" />
                          <span>Print {pdfPrintMode === 'client' ? 'Client Copy' : 'Office Copy'} PDF</span>
                        </button>

                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={handleTransmitCumulativeTotals}
                          className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase rounded-lg shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                        >
                          {isSyncing ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                              <span>Syncing Workbook...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 font-black" />
                              <span>Sync Pipeline Sheet</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Sync status messages */}
                  {syncStatus === 'success' && (
                    <div className="p-3 bg-emerald-950/45 border border-emerald-900 text-emerald-300 rounded-lg text-xs leading-normal font-sans space-y-1">
                      <p>&bull; workbook sync status: <strong>SUCCESSFUL!</strong> Combined multi-phase cost allocations written to Google Sheets & OneDrive estimators database.</p>
                      <p className="font-mono text-[11px] text-emerald-400">&bull; Established Active Job Number: <strong className="underline decoration-double uppercase bg-emerald-950 border border-emerald-800 px-1.5 py-0.5 rounded">{jobNumber}</strong></p>
                    </div>
                  )}
                  {syncStatus === 'error' && (
                    <div className="p-3 bg-rose-950/45 border border-rose-900 text-rose-300 rounded-lg text-xs leading-normal font-sans">
                      &bull; workbook sync status: <strong>Handshake Failure.</strong> Cellular transmission dropped. Please check connection and retry syncing.
                    </div>
                  )}

                  {/* Embedded Earthwork Contract Agreement Preview Card */}
                  <div className="bg-slate-950 border-2 border-orange-500/80 p-6 sm:p-8 rounded-3xl space-y-6 mt-8 shadow-2xl relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 bg-orange-600 text-white font-mono font-black text-[9px] uppercase px-4 py-1 rounded-bl-xl tracking-wider">
                      Embedded System Contract &bull; Auto-Filled
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-950/80 border border-orange-800 text-orange-400 rounded-2xl shrink-0 shadow-inner">
                          <Scale className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-display font-black text-base uppercase tracking-wider text-slate-100 flex items-center gap-2">
                            <span>Earthwork Contract Agreement</span>
                            <span className="text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800 text-[9.5px] font-mono leading-none normal-case font-bold">
                              Live Pre-Filled
                            </span>
                          </h4>
                          <p className="text-slate-400 text-xs mt-0.5">
                            T.J. Darley Construction, LLC legal terms & execution protocol auto-filled with active proposal data.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePrintProposalPDF}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black uppercase rounded-xl shadow-md inline-flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Proposal & Contract (PDF)</span>
                      </button>
                    </div>

                    {/* Dynamic Contract Key Data Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
                      <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-[9px] text-slate-400 font-sans uppercase font-bold tracking-wider block">Contractor</span>
                        <span className="text-xs font-bold text-white block truncate">T.J. Darley Construction, LLC</span>
                        <span className="text-[9.5px] text-orange-400 block font-sans">(478) 808-7789 &bull; Greensboro, GA</span>
                      </div>

                      <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-[9px] text-slate-400 font-sans uppercase font-bold tracking-wider block">Client / Property Owner</span>
                        <span className="text-xs font-bold text-white block truncate">{clientName || 'Valued Client'}</span>
                        <span className="text-[9.5px] text-orange-400 block truncate font-sans">{clientPhone} &bull; {clientEmail}</span>
                        <span className="text-[9.5px] text-slate-400 block truncate font-sans">{locationAddress || jobName || 'Middle Georgia Site'}</span>
                      </div>

                      <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-[9px] text-slate-400 font-sans uppercase font-bold tracking-wider block">Contract Price / 50% Deposit</span>
                        <span className="text-xs font-bold text-orange-400 block">${totals.finalInvoiceTotal.toLocaleString()}</span>
                        <span className="text-[9.5px] text-emerald-400 block font-sans font-bold">50% Down: ${totals.depositNeeded.toLocaleString()}</span>
                      </div>

                      <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                        <span className="text-[9px] text-slate-400 font-sans uppercase font-bold tracking-wider block">Change Order Fee / Law</span>
                        <span className="text-xs font-bold text-amber-400 block">$1,500 Signing Fee</span>
                        <span className="text-[9.5px] text-slate-400 block font-sans">Georgia O.C.G.A. § 8-2-35</span>
                      </div>
                    </div>

                    {/* Embedded Contract Clauses */}
                    <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <span className="font-display font-bold text-xs uppercase tracking-wider text-orange-400 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Contract Clauses & Legal Protections Embedded</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                          <strong className="text-slate-100 uppercase tracking-wider text-[11px] block font-display text-orange-400">1. Parties & Location</strong>
                          <p>Agreement between <strong>T.J. Darley Construction, LLC</strong> (Greensboro, GA) and <strong>{clientName || 'Valued Client'}</strong> for site location <strong>{locationAddress || jobName || 'Designated Middle Georgia Location'}</strong> on <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
                        </div>

                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                          <strong className="text-slate-100 uppercase tracking-wider text-[11px] block font-display text-orange-400">2. Scope of Work & Bid Steps ({compiledPhases.length} Phases)</strong>
                          <p>Covers all heavy excavation, earthmoving, grading, and logistics. Scope includes:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-400 font-mono text-[10.5px] pt-1">
                            {compiledPhases.map((p, i) => (
                              <li key={i}><strong>Step 0{i+1}:</strong> {p.phaseName} ({p.subPhaseName}) {p.isSubcontracted ? '[1099 Subcontracted Operation]' : ''}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-800/80 space-y-2">
                          <strong className="text-emerald-300 uppercase tracking-wider text-[11px] block font-display flex items-center justify-between">
                            <span>3. Financial Terms, 50% Deposit & ACH Direct Transfer</span>
                            <span className="text-[9.5px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">Direct ACH Only</span>
                          </strong>
                          <p>Grand total contract amount: <strong className="text-orange-400 font-mono">${totals.finalInvoiceTotal.toLocaleString()}</strong>. 50% mobilization deposit (<strong className="text-emerald-400 font-mono">${totals.depositNeeded.toLocaleString()}</strong>) is due upon execution prior to fleet mobilization and deploying heavy machinery. Balance of <strong className="font-mono text-slate-200">${(totals.finalInvoiceTotal - totals.depositNeeded).toLocaleString()}</strong> is due upon final core excavation and site handoff.</p>
                          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-emerald-500/30 text-[10.5px] font-mono text-slate-300 space-y-1">
                            <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider mb-1">💳 APPROVED PAYMENT METHOD: DIRECT ACH / WIRE ONLY (NO CREDIT CARDS ACCEPTED)</div>
                            <div>• <strong>Bank Name:</strong> Synovus Bank / Farmers & Merchants Bank (Middle GA)</div>
                            <div>• <strong>Account Name:</strong> T.J. Darley Construction, LLC (Incoming Depository Account)</div>
                            <div>• <strong>Security Protocol:</strong> ACH Debit Block Protected (Incoming Deposits Only)</div>
                            <div>• <strong>ACH Routing Number:</strong> 061100606</div>
                            <div>• <strong>Client ACH Memo Ref:</strong> <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold font-mono text-[10px]">TJD-ACH-{(clientName || 'CLIENT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)}-{Math.floor(1000 + Math.random() * 9000)}</span></div>
                            <div>• <strong>Client Accounting Rule:</strong> Remit ACH specifying Client Name ({clientName || 'Client Name'}) & Memo Ref in bank transfer details. Email confirmation to info@tjdarleyconstruction.com.</div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                          <strong className="text-slate-100 uppercase tracking-wider text-[11px] block font-display text-orange-400">4. Material Delivery & Logistics Protection</strong>
                          <p>Delivery timelines for aggregates, stone, and piping are estimates. Contractor is protected against third-party quarry supply delays and price spikes. Client provides secure staging area on site.</p>
                        </div>

                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                          <strong className="text-slate-100 uppercase tracking-wider text-[11px] block font-display text-orange-400">5. Weather Delays & Soil Moisture Conditions</strong>
                          <p>Automatic day-for-day extension granted for rain, freezing, flooding, or wet mud conditions. Contractor holds sole authority to determine when soil moisture levels are safe for heavy machinery.</p>
                        </div>

                        {concreteCuringActive && (
                          <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-800/60 space-y-1">
                            <strong className="text-amber-300 uppercase tracking-wider text-[11px] block font-display flex items-center gap-1.5">
                              <Timer className="w-3.5 h-3.5 text-amber-400" />
                              <span>Concrete Curing Buffer ({calculateConcreteCuringStats(concreteLengthFt, concreteWidthFt, concreteThicknessInches, concreteElementType, concretePsiGrade).cureDays} Days)</span>
                            </strong>
                            <p className="text-amber-100/90 text-[11px]">Includes {concreteLengthFt}' x {concreteWidthFt}' @ {concreteThicknessInches}" thick concrete pour (~{calculateConcreteCuringStats(concreteLengthFt, concreteWidthFt, concreteThicknessInches, concreteElementType, concretePsiGrade).volumeCuYds} Cu Yds, {concreteElementType}). A mandatory <strong>{calculateConcreteCuringStats(concreteLengthFt, concreteWidthFt, concreteThicknessInches, concreteElementType, concretePsiGrade).cureDays} calendar day curing window</strong> is built into the total project schedule. No heavy equipment or framing loads may traverse concrete until full hydration strength is reached.</p>
                          </div>
                        )}

                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                          <strong className="text-slate-100 uppercase tracking-wider text-[11px] block font-display text-orange-400">6. Utility Damage Waiver (Unmarked Lines)</strong>
                          <p>Georgia 811 covers public utilities. Client is strictly liable for marking private utilities (irrigation, secondary power, gas, septic). Contractor is not liable for unmarked private lines.</p>
                        </div>

                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                          <strong className="text-slate-100 uppercase tracking-wider text-[11px] block font-display text-orange-400">7. Subsurface Obstructions & Unexpected Rock</strong>
                          <p>Base bid assumes standard red clay/dirt earthmoving. Hydraulic rock hammering, granite blasting, or unmapped buried debris are excluded from base bid and performed under Change Order.</p>
                        </div>

                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                          <strong className="text-slate-100 uppercase tracking-wider text-[11px] block font-display text-orange-400">8. Change Orders & $1,500 Administrative Fee</strong>
                          <p>All scope or site changes require written agreement. Change orders carry a mandatory <strong className="text-amber-400 font-mono">$1,500 ADMINISTRATIVE FEE</strong> due upon signing, plus labor/materials/equipment/fuel surcharges.</p>
                        </div>

                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1">
                          <strong className="text-slate-100 uppercase tracking-wider text-[11px] block font-display text-orange-400">9. Georgia Governing Law & Right to Repair</strong>
                          <p>Governed by Georgia law. Pursuant to O.C.G.A. § 8-2-35 et seq., Contractor has legal right to written notice and opportunity to inspect/cure any alleged defect before legal action.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* T.J. Darley Bidding Credentials & Document Vault */}
                  <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="p-2.5 bg-orange-950/60 border border-orange-850 text-orange-400 rounded-lg shrink-0">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-black text-sm uppercase tracking-wider text-slate-100 flex items-center gap-2">
                            <span>TJ Darley</span>
                            <span className="text-orange-500 bg-orange-950/45 px-2.5 py-0.5 rounded border border-orange-900 text-[10px] font-mono leading-none normal-case">Credentials & Attachments Vault</span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Store Contractor Licenses, Proof of Insurance (COI), and Bonding Capacity letters to satisfy GC bid deadlines instantly.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsAddingCredential(!isAddingCredential)}
                          className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 font-bold" />
                          <span>Add Document</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetCredentialsToDefault}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-805 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold uppercase rounded-lg cursor-pointer transition-colors"
                          title="Restore pre-populated T.J. Darley credentials"
                        >
                          Reset Presets
                        </button>
                      </div>
                    </div>

                    {/* Inline Form to Add Credential */}
                    {isAddingCredential && (
                      <form onSubmit={handleSaveNewCredential} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4 animate-in fade-in duration-200">
                        <h5 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-orange-500" />
                          <span>Add New Qualification Document</span>
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5 text-left">
                            <label className="text-slate-400 font-semibold block">Document Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Georgia Commercial General Liability Policy"
                              value={newCredTitle}
                              onChange={(e) => setNewCredTitle(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white outline-none focus:border-slate-700"
                            />
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="text-slate-400 font-semibold block">Document Type</label>
                            <select
                              value={newCredType}
                              onChange={(e: any) => setNewCredType(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white outline-none focus:border-slate-700"
                            >
                              <option value="license">Contractor License</option>
                              <option value="insurance">Insurance Policy / COI</option>
                              <option value="bonding">Surety & Bonding Letter</option>
                              <option value="certification">Professional Certification</option>
                              <option value="custom">Other Compliance Doc</option>
                            </select>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="text-slate-400 font-semibold block">Issuing Authority / Underwriter *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Builders Mutual Insurance Group"
                              value={newCredIssuer}
                              onChange={(e) => setNewCredIssuer(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white outline-none focus:border-slate-700"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5 text-left">
                              <label className="text-slate-400 font-semibold block">License / Policy #</label>
                              <input
                                type="text"
                                placeholder="e.g. GL-992834-26"
                                value={newCredRef}
                                onChange={(e) => setNewCredRef(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white outline-none focus:border-slate-700 font-mono"
                              />
                            </div>
                            <div className="space-y-1.5 text-left">
                              <label className="text-slate-400 font-semibold block">Expiration Date</label>
                              <input
                                type="date"
                                value={newCredExpiry}
                                onChange={(e) => setNewCredExpiry(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 p-2 rounded-lg text-white outline-none focus:border-slate-700"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left text-xs">
                          <label className="text-slate-400 font-semibold block">Document Scope & Bid Notes</label>
                          <textarea
                            rows={2}
                            placeholder="Briefly describe limits, coverage parameters, or specific bonding capacities for the GC review..."
                            value={newCredNotes}
                            onChange={(e) => setNewCredNotes(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-white outline-none focus:border-slate-700"
                          />
                        </div>

                        {/* File upload support */}
                        <div className="space-y-2 text-left text-xs border-t border-slate-850/60 pt-3">
                          <label className="text-slate-400 font-semibold block">Attachment Scan (PDF, JPG, or PNG)</label>
                          <div className="flex items-center gap-3">
                            <label className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5 text-orange-500" />
                              <span>Select File Scan</span>
                              <input
                                type="file"
                                onChange={(e) => handleCredentialFileChange(e)}
                                className="hidden"
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                              />
                            </label>
                            {newCredFileName ? (
                              <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/40 border border-emerald-900 px-2.5 py-1 rounded-lg">
                                ✓ {newCredFileName}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">No file attached (uses pre-configured digital signature state)</span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-850/60 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingCredential(false);
                              setNewCredTitle('');
                              setNewCredIssuer('');
                              setNewCredFileName('');
                            }}
                            className="px-4 py-2 bg-transparent text-slate-400 hover:text-white text-xs font-bold uppercase rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase rounded-lg cursor-pointer transition-colors"
                          >
                            Save to Vault
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Listing of Saved Credentials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {credentials.map((cred) => {
                        const isCloseToExpiry = new Date(cred.expiryDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000;
                        return (
                          <div
                            key={cred.id}
                            className={`p-5 rounded-2xl border transition-all text-left space-y-3 bg-slate-900/30 ${
                              cred.isAttached 
                                ? 'border-orange-500/40 bg-orange-950/5' 
                                : 'border-slate-850 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl shrink-0 ${
                                  cred.docType === 'license' 
                                    ? 'bg-blue-950/50 text-blue-400 border border-blue-900/50' 
                                    : cred.docType === 'insurance'
                                      ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50'
                                      : cred.docType === 'bonding'
                                        ? 'bg-amber-950/50 text-amber-400 border border-amber-900/50'
                                        : 'bg-slate-950 text-slate-400 border border-slate-855'
                                }`}>
                                  {cred.docType === 'license' && <Scale className="w-5 h-5" />}
                                  {cred.docType === 'insurance' && <CheckCircle className="w-5 h-5" />}
                                  {cred.docType === 'bonding' && <Briefcase className="w-5 h-5" />}
                                  {cred.docType === 'certification' && <Award className="w-5 h-5" />}
                                  {cred.docType === 'custom' && <FileText className="w-5 h-5" />}
                                </div>
                                <div className="space-y-1">
                                  <h5 className="font-display font-black text-xs text-slate-100 leading-tight">
                                    {cred.title}
                                  </h5>
                                  <p className="text-[10px] text-slate-400">
                                    Issuer: <strong className="text-slate-350">{cred.issuer}</strong>
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteCredential(cred.id)}
                                className="text-slate-600 hover:text-rose-500 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer shrink-0 animate-in"
                                title="Remove credential"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono bg-slate-950/45 p-2.5 rounded-xl border border-slate-850">
                              <div>
                                <span className="text-[9px] text-slate-500 block font-sans">REFERENCE ID</span>
                                <span className="font-bold text-white uppercase">{cred.referenceNumber}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 block font-sans">EXPIRATION</span>
                                <span className={`font-bold block ${isCloseToExpiry ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
                                  {new Date(cred.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>

                            {cred.notes && (
                              <p className="text-[10px] text-slate-400 italic leading-relaxed">
                                &ldquo;{cred.notes}&rdquo;
                              </p>
                            )}

                            {cred.fileName && (
                              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1 rounded-lg w-max font-mono">
                                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Attached: {cred.fileName}</span>
                              </div>
                            )}

                            {/* Attach Toggle Control */}
                            <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 mt-1">
                              <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1.5">
                                {cred.isAttached ? (
                                  <>
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                    <strong className="text-emerald-400">Attached to Proposal Exhibit</strong>
                                  </>
                                ) : (
                                  <span className="text-slate-500">Excluded from Print Proposal</span>
                                )}
                              </span>

                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={cred.isAttached}
                                  onChange={() => handleToggleAttachCredential(cred.id)}
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white"></div>
                              </label>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3.5 bg-orange-950/20 border border-orange-900/30 rounded-xl text-[10.5px] leading-normal text-slate-350 flex items-start gap-2 text-left font-sans">
                      <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Bid Deadline Security Mode:</strong> Active credentials toggle is linked directly to your <strong>Print Agreement PDF</strong> action. Toggled documents are beautifully formatted and appended as <em>&ldquo;EXHIBIT A&rdquo;</em> at the end of the proposal document so your General Contractor receives a single, complete, fully-compliant bid package instantly.
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
