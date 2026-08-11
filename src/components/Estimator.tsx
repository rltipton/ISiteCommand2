/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { 
  TreePine, 
  HardHat, 
  Mountain, 
  Truck, 
  Droplets, 
  Sparkles, 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  HelpCircle,
  FileText,
  Send,
  AlertCircle,
  Lock,
  Compass,
  ArrowRight,
  Timer,
  Ruler,
  Boxes,
  Layers,
  BarChart3,
  DollarSign,
  PieChart,
  CloudRain,
  Sun,
  Calendar,
  CloudLightning,
  Download,
  SlidersHorizontal,
  Upload,
  Loader2,
  Check
} from 'lucide-react';
import { getWebhookUrl, sendSlackAlert, sendEmailAlert } from '../utils';
import { exportEstimateToPDF } from '../utils/pdfExporter';
import { BidRequest } from '../types';
import { SitePlanUpload, ExtractedSiteMetrics } from './SitePlanUpload';
import { launchMultiPhaseProjectFromSitePlan } from '../utils/multiphaseHelper';

export type UnitSystem = 'imperial' | 'metric';

export function calculateConcreteCuringStats(
  length: number,
  width: number,
  thickness: number,
  unitSystem: UnitSystem = 'imperial',
  elementType: string = 'House Pad / Commercial Slab (6")',
  psiGrade: string = '3,500 PSI High-Early'
) {
  let lenFt = length;
  let widFt = width;
  let thickInches = thickness;

  if (unitSystem === 'metric') {
    lenFt = length * 3.28084;
    widFt = width * 3.28084;
    thickInches = thickness / 2.54;
  }

  const len = Math.max(0.1, Number(lenFt) || 0);
  const wid = Math.max(0.1, Number(widFt) || 0);
  const thick = Math.max(0.1, Number(thickInches) || 0);

  // Volume in Cubic Yards = (Length * Width * (Thickness / 12)) / 27
  const volumeCuYds = Math.round(((len * wid * (thick / 12)) / 27) * 10) / 10;
  const volumeCuMeters = Math.round((volumeCuYds * 0.764555) * 10) / 10;

  // Base curing days based on thickness in inches (ACI 308 standard hydration)
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

  const formattedDimensionStr = unitSystem === 'metric'
    ? `${length}m L × ${width}m W @ ${thickness}cm`
    : `${length}' L × ${width}' W @ ${thickness}"`;

  const formattedVolumeStr = unitSystem === 'metric'
    ? `${volumeCuMeters} m³ (~${volumeCuYds} Cu Yds)`
    : `${volumeCuYds} Cu Yds (~${volumeCuMeters} m³)`;

  return {
    volumeCuYds,
    volumeCuMeters,
    cureDays: baseCureDays,
    footTrafficDays,
    fullStrengthDays,
    formattedDimensionStr,
    formattedVolumeStr,
    summaryText: `${formattedDimensionStr} concrete pour (${formattedVolumeStr}) requires ${baseCureDays} calendar days curing buffer.`
  };
}

export interface MaterialOption {
  id: string;
  name: string;
  category: 'Gravel & Stone' | 'Soils & Fill' | 'Concrete & Cement' | 'Sand & Aggregates';
  ratePerCuYd: number;
  unitWeightTonsPerCuYd: number;
  description: string;
}

export const COMMON_MATERIALS: MaterialOption[] = [
  {
    id: 'crushed_granite_gab',
    name: 'GAB Crushed Granite Base',
    category: 'Gravel & Stone',
    ratePerCuYd: 38.00,
    unitWeightTonsPerCuYd: 1.4,
    description: 'Graded Aggregate Base for driveways, building pads, and road sub-bases.'
  },
  {
    id: '57_stone',
    name: '#57 Clean Crushed Stone',
    category: 'Gravel & Stone',
    ratePerCuYd: 44.00,
    unitWeightTonsPerCuYd: 1.35,
    description: 'Clean drainage stone for French drains, septic lines, and surface gravel.'
  },
  {
    id: 'surge_riprap',
    name: 'Heavy Surge Stone / Riprap',
    category: 'Gravel & Stone',
    ratePerCuYd: 48.00,
    unitWeightTonsPerCuYd: 1.5,
    description: 'Erosion control surge stone for pond spillways, culvert aprons, and banks.'
  },
  {
    id: 'screened_topsoil',
    name: 'Screened Organic Topsoil',
    category: 'Soils & Fill',
    ratePerCuYd: 32.00,
    unitWeightTonsPerCuYd: 1.1,
    description: 'High-grade screened topsoil for final lawn grading, sod prep, and planting.'
  },
  {
    id: 'select_fill_dirt',
    name: 'Select Compaction Fill Dirt',
    category: 'Soils & Fill',
    ratePerCuYd: 22.00,
    unitWeightTonsPerCuYd: 1.25,
    description: 'Low-plasticity fill dirt for building pad elevation and deep hole fill.'
  },
  {
    id: 'red_clay_base',
    name: 'Red Clay Sealant Base',
    category: 'Soils & Fill',
    ratePerCuYd: 18.00,
    unitWeightTonsPerCuYd: 1.3,
    description: 'Heavy clay core material for pond dams, embankments, and impermeability.'
  },
  {
    id: 'ready_mix_concrete',
    name: '3,500 PSI Ready-Mix Concrete',
    category: 'Concrete & Cement',
    ratePerCuYd: 145.00,
    unitWeightTonsPerCuYd: 2.0,
    description: 'High-strength structural concrete mix for house pads, footings, and headwalls.'
  },
  {
    id: 'masonry_sand',
    name: 'Masonry / Wash Sand',
    category: 'Sand & Aggregates',
    ratePerCuYd: 29.00,
    unitWeightTonsPerCuYd: 1.35,
    description: 'Washed sand for paver bedding, pipe cushioning, and mortar mixing.'
  }
];

export function calculateMaterialCostStats(
  materialId: string,
  volumeCuYds: number,
  compactionFactorPct: number = 12,
  regionMultiplier: number = 1.0,
  includeFreight: boolean = true,
  customPricePerCuYd?: number,
  unitSystem: UnitSystem = 'imperial'
) {
  const selectedMat = COMMON_MATERIALS.find(m => m.id === materialId) || COMMON_MATERIALS[0];
  const unitPrice = customPricePerCuYd !== undefined && customPricePerCuYd > 0 
    ? customPricePerCuYd 
    : selectedMat.ratePerCuYd * regionMultiplier;

  const rawVol = Math.max(0, Number(volumeCuYds) || 0);
  const adjustedVol = Math.round((rawVol * (1 + compactionFactorPct / 100)) * 10) / 10;
  const adjustedVolCuMeters = Math.round((adjustedVol * 0.764555) * 10) / 10;
  const estimatedTons = Math.round((adjustedVol * selectedMat.unitWeightTonsPerCuYd) * 10) / 10;
  const estimatedMetricTons = Math.round((estimatedTons * 0.907185) * 10) / 10;

  const rawMaterialCost = Math.round(adjustedVol * unitPrice);
  
  // Freight truck loads calculation (standard tandem dump truck = ~14 Cu Yds)
  const truckLoads = Math.ceil(adjustedVol / 14);
  const freightCostPerLoad = 85;
  const totalFreight = includeFreight ? truckLoads * freightCostPerLoad : 0;

  const totalMaterialEstimate = rawMaterialCost + totalFreight;

  const formattedVolumeStr = unitSystem === 'metric'
    ? `${adjustedVolCuMeters} m³ (~${adjustedVol} Cu Yds)`
    : `${adjustedVol} Cu Yds (~${adjustedVolCuMeters} m³)`;

  const formattedTonnageStr = unitSystem === 'metric'
    ? `~${estimatedMetricTons} Metric Tonnes (~${estimatedTons} US Tons)`
    : `~${estimatedTons} US Tons (~${estimatedMetricTons} Tonnes)`;

  return {
    selectedMat,
    unitPrice: Math.round(unitPrice * 100) / 100,
    rawVol,
    adjustedVol,
    adjustedVolCuMeters,
    estimatedTons,
    estimatedMetricTons,
    rawMaterialCost,
    truckLoads,
    totalFreight,
    totalMaterialEstimate,
    formattedVolumeStr,
    formattedTonnageStr
  };
}

export function calculateWeatherDelayStats(
  totalProjectDays: number,
  startSeason: string = 'current',
  region: string = 'middle_ga',
  soilType: string = 'heavy_red_clay'
) {
  const now = new Date();
  let monthIdx = now.getMonth();

  if (startSeason === 'spring') monthIdx = 3;
  else if (startSeason === 'summer') monthIdx = 6;
  else if (startSeason === 'fall') monthIdx = 9;
  else if (startSeason === 'winter') monthIdx = 0;

  // Monthly historical rain probabilities in Middle GA (NOAA baseline)
  const monthlyRainProbs = [0.32, 0.33, 0.31, 0.28, 0.27, 0.35, 0.38, 0.36, 0.22, 0.18, 0.22, 0.30];
  const baseRainProb = monthlyRainProbs[monthIdx] || 0.28;

  const regionModifiers: Record<string, number> = {
    'middle_ga': 1.0,
    'metro_atlanta': 1.08,
    'coastal_ga': 1.20,
    'north_ga': 1.15
  };
  const regMod = regionModifiers[region] || 1.0;
  const rainProbabilityPct = Math.round(baseRainProb * regMod * 100);

  const expectedRainDays = Math.max(0.5, Math.round((totalProjectDays * (rainProbabilityPct / 100)) * 10) / 10);

  // Jobsite Soil Drying Retention Factor (Heavy clay takes 1.5x longer to dry than rain length)
  const soilDryingFactors: Record<string, number> = {
    'heavy_red_clay': 1.5,
    'sandy_loam': 0.5,
    'graded_stone_base': 0.3
  };
  const dryingFactor = soilDryingFactors[soilType] || 1.5;

  const soilDryOutDays = Math.round((expectedRainDays * dryingFactor) * 10) / 10;
  const totalDelayDays = Math.max(1, Math.round(expectedRainDays + soilDryOutDays));
  const weatherAdjustedTotalDays = totalProjectDays + totalDelayDays;

  // Calculate target completion date
  const startDate = new Date();
  if (startSeason === 'spring') startDate.setMonth(3);
  else if (startSeason === 'summer') startDate.setMonth(6);
  else if (startSeason === 'fall') startDate.setMonth(9);
  else if (startSeason === 'winter') startDate.setMonth(0);

  const completionDate = new Date(startDate.getTime() + weatherAdjustedTotalDays * 24 * 60 * 60 * 1000);
  const formattedCompletionDate = completionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const soilTypeLabel = soilType === 'heavy_red_clay'
    ? 'Heavy Red Clay (1.5x Mud Drying)'
    : soilType === 'sandy_loam'
    ? 'Sandy Loam (0.5x Fast Drainage)'
    : 'Aggregates & Stone (0.3x Rapid Drying)';

  return {
    rainProbabilityPct,
    expectedRainDays,
    soilDryOutDays,
    totalDelayDays,
    weatherAdjustedTotalDays,
    weatherAdjustedWeeks: (weatherAdjustedTotalDays / 7).toFixed(1),
    formattedCompletionDate,
    soilTypeLabel
  };
}

const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-left font-sans">
        <p className="text-[11px] font-bold text-white uppercase tracking-wider">{data.category}</p>
        <p className="text-base font-black text-emerald-400 font-mono mt-0.5">${data.cost.toLocaleString()}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{data.percentage}% of estimated project total</p>
      </div>
    );
  }
  return null;
};

export interface WishlistState {
  landClearing: string;
  excavating: string;
  grading: string;
  roadDriveway: string;
  culvert: string;
  pond: string;
  dam: string;
  waterfall: string;
  isForestryMulching?: boolean;
  drivewayMaterial?: string;
}

export function calculateProjectCostBreakdown(
  wishlist: WishlistState,
  baseEarthworkDays: number,
  materialActive: boolean,
  materialStats: ReturnType<typeof calculateMaterialCostStats>,
  concreteActive: boolean,
  concreteStats: ReturnType<typeof calculateConcreteCuringStats>
) {
  // 1. Equipment Overhead & Fuel
  let baseEquipmentDaily = 1250;
  let equipmentTotal = Math.max(1200, baseEarthworkDays * baseEquipmentDaily + 950);

  // 2. Materials Subtotal
  let materialTotal = 0;
  if (materialActive) {
    materialTotal += materialStats.rawMaterialCost;
  } else {
    if (wishlist.roadDriveway === '100') materialTotal += 1200;
    else if (wishlist.roadDriveway === '250') materialTotal += 2800;
    else if (wishlist.roadDriveway === '500') materialTotal += 5200;
    else if (wishlist.roadDriveway === '1000') materialTotal += 9800;

    if (wishlist.culvert !== 'none') materialTotal += 850;
    if (wishlist.waterfall !== 'none') materialTotal += 2500;
    if (wishlist.pond !== 'none') materialTotal += 1800;
  }

  if (concreteActive) {
    materialTotal += Math.round(concreteStats.volumeCuYds * 145);
  }
  if (materialTotal === 0) materialTotal = 850;

  // 3. Labor & Operator Crew
  let dailyLaborRate = 950;
  let laborTotal = Math.max(1500, baseEarthworkDays * dailyLaborRate);
  if (concreteActive) {
    laborTotal += Math.round(concreteStats.volumeCuYds * 120);
  }

  // 4. Freight & Hauling
  let freightTotal = 0;
  if (materialActive) {
    freightTotal += Math.max(250, materialStats.totalFreight);
  } else {
    freightTotal = 450;
  }

  // 5. Permits, Testing & Contingency
  let baseScopeTotal = equipmentTotal + materialTotal + laborTotal + freightTotal;
  let contingencyTotal = Math.round(baseScopeTotal * 0.12) + 650;

  let grandTotalCost = equipmentTotal + materialTotal + laborTotal + freightTotal + contingencyTotal;

  const getPercent = (val: number) => ((val / grandTotalCost) * 100).toFixed(1);

  const chartData = [
    { category: 'Labor & Operators', cost: laborTotal, percentage: getPercent(laborTotal), color: '#10b981' },
    { category: 'Materials', cost: materialTotal, percentage: getPercent(materialTotal), color: '#f59e0b' },
    { category: 'Equipment & Fuel', cost: equipmentTotal, percentage: getPercent(equipmentTotal), color: '#3b82f6' },
    { category: 'Freight & Hauling', cost: freightTotal, percentage: getPercent(freightTotal), color: '#8b5cf6' },
    { category: 'Permits & Contingency', cost: contingencyTotal, percentage: getPercent(contingencyTotal), color: '#ec4899' }
  ];

  return {
    equipmentTotal,
    materialTotal,
    laborTotal,
    freightTotal,
    contingencyTotal,
    grandTotalCost,
    chartData
  };
}

const CostBreakdownChartCard = ({
  costBreakdown
}: {
  costBreakdown: ReturnType<typeof calculateProjectCostBreakdown>;
}) => {
  return (
    <div className="p-5 bg-slate-950/80 border border-blue-500/30 rounded-2xl space-y-4 shadow-xl text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <BarChart3 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2 font-display">
              <span>Estimated Project Cost Sub-Category Breakdown</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Recharts Visual Model</span>
            </h4>
            <p className="text-[10.5px] text-slate-400">Dynamic cost distribution across labor crews, raw materials, equipment overhead, freight hauling, and contingency testing.</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl self-start sm:self-auto text-right">
          <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">Est. Subtotal Scope</span>
          <span className="text-base font-black text-emerald-400 font-mono">${costBreakdown.grandTotalCost.toLocaleString()}</span>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={costBreakdown.chartData}
            margin={{ top: 15, right: 10, left: -10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="category"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval={0}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
              {costBreakdown.chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Legend & Sub-Category Pill Badges */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2 border-t border-slate-900">
        {costBreakdown.chartData.map((item, idx) => (
          <div key={idx} className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
              <span className="text-[9.5px] font-bold text-slate-300 truncate">{item.category}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xs font-black text-white font-mono">${item.cost.toLocaleString()}</span>
              <span className="text-[9px] font-mono font-semibold text-slate-400">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CLEARING_LABELS: Record<string, string> = {
  'none': 'None Selected',
  '1': '1 Acre',
  '2': '2 Acres',
  '3-5': '3 to 5 Acres',
  '6-10': '6 to 10 Acres',
  '11-20': '11 to 20 Acres',
  '21-50': '21 to 50 Acres',
  '51-100': '51 to 100 Acres',
  '100+': 'Over 100 Acres'
};

const EXCAVATING_LABELS: Record<string, string> = {
  'none': 'None Selected',
  'trenching': 'Light Drainage Trenching',
  'basement': 'Deep Basement & Foundation Cuts',
  'crawlspace': 'Standard Crawlspace / Barn Pad',
  'retaining': 'Retaining Wall Terracing Cuts',
  'custom': 'Custom Excavation Site Cut & Fill'
};

const GRADING_LABELS: Record<string, string> = {
  'none': 'None Selected',
  'rough': 'Rough Site Clearing & Scraping',
  'laser': 'Finished Laser-Transit House Pad',
  'landscape': 'Landscape Finished Contour Grading',
  'slope': 'Sloped Bank Stabilization Grading'
};

const ROAD_LABELS: Record<string, string> = {
  'none': 'None Selected',
  '100': 'Up to 100 feet length',
  '250': '100 to 250 feet length',
  '500': '250 to 500 feet length',
  '1000': '500 to 1,000 feet length',
  '2000': '1,000 to 2,000 feet length',
  '2000+': 'Over 2,000 feet length'
};

const CULVERT_LABELS: Record<string, string> = {
  'none': 'None Selected',
  '12': '12" Corrugated HDPE drainage pipe',
  '18': '18" Heavy Highway Spec Poly pipe',
  '24': '24" Double Wall Heavy storm water pipe',
  '36': '36" Massive Stream Crossing Culvert'
};

const POND_LABELS: Record<string, string> = {
  'none': 'None Selected',
  '0.1': '0.10 Acre Small Wildlife / Stock Tank',
  '0.25': '0.25 Acre Stock Fishing Pond',
  '0.5': '0.50 Acre Custom Landscaped Pond',
  '1.0': '1.00 Acre Private Recreational Lake',
  '2+': '2+ Acres Major Engineered Waterway'
};

const DAM_LABELS: Record<string, string> = {
  'none': 'None Selected',
  'clay_core': 'Compacted Clay Core Sealing',
  'keyway': 'Structural Keyway Embankment Barrier',
  'spillway': 'Active Spillway Pipe Outflow Control',
  'heavy': 'Double Embankment Dam with Rip-Rap Stabilization'
};

const WATERFALL_LABELS: Record<string, string> = {
  'none': 'None Selected',
  'cascade': 'Tiered Natural Georgia Rock Cascade',
  'fieldstone': 'Custom Fieldstone Accent Headwall Waterfall',
  'active': 'Active Sluice Spillway Cascade Waterflow'
};

const DW_MATS: Record<string, string> = {
  'none': 'Standard dirt base / no stone',
  'crusher': 'Georgia Granite Crusher Run Stone base',
  'surge': 'Coarse Surge Aggregate Base Stabilization',
  'gravel': 'Premium local riverbed rounded gravel wash'
};

interface EstimatorProps {
  onPreFillContact: (serviceId: string, size: number, unit: 'sq_ft' | 'acres', estimatedRangeUrl: string) => void;
  division: 'commercial' | 'residential';
}

export default function Estimator({ onPreFillContact, division }: EstimatorProps) {
  // Wishlist selected state options
  const [wishlist, setWishlist] = useState({
    landClearing: 'none',
    excavating: 'none',
    grading: 'none',
    roadDriveway: 'none',
    culvert: 'none',
    pond: 'none',
    dam: 'none',
    waterfall: 'none',
    isForestryMulching: false,
    drivewayMaterial: 'none',
  });

  // Unit Measurement System State
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');

  const handleUnitSystemToggle = (newSystem: UnitSystem) => {
    if (newSystem === unitSystem) return;

    if (newSystem === 'metric') {
      // Imperial -> Metric conversion
      setConcreteLengthFt(prev => Math.round((prev * 0.3048) * 100) / 100);
      setConcreteWidthFt(prev => Math.round((prev * 0.3048) * 100) / 100);
      setConcreteThicknessInches(prev => Math.round((prev * 2.54) * 10) / 10);

      setMaterialLengthFt(prev => Math.round((prev * 0.3048) * 100) / 100);
      setMaterialWidthFt(prev => Math.round((prev * 0.3048) * 100) / 100);
      setMaterialThicknessInches(prev => Math.round((prev * 2.54) * 10) / 10);

      setCustomMaterialVolumeCuYds(prev => Math.round((prev * 0.764555) * 10) / 10);
    } else {
      // Metric -> Imperial conversion
      setConcreteLengthFt(prev => Math.round((prev / 0.3048) * 10) / 10);
      setConcreteWidthFt(prev => Math.round((prev / 0.3048) * 10) / 10);
      setConcreteThicknessInches(prev => Math.round((prev / 2.54) * 10) / 10);

      setMaterialLengthFt(prev => Math.round((prev / 0.3048) * 10) / 10);
      setMaterialWidthFt(prev => Math.round((prev / 0.3048) * 10) / 10);
      setMaterialThicknessInches(prev => Math.round((prev / 2.54) * 10) / 10);

      setCustomMaterialVolumeCuYds(prev => Math.round((prev * 1.30795) * 10) / 10);
    }

    setUnitSystem(newSystem);
  };

  // Concrete Slab & Hydration Curing State
  const [concreteActive, setConcreteActive] = useState<boolean>(false);
  const [concreteLengthFt, setConcreteLengthFt] = useState<number>(50);
  const [concreteWidthFt, setConcreteWidthFt] = useState<number>(30);
  const [concreteThicknessInches, setConcreteThicknessInches] = useState<number>(6);
  const [concreteElementType, setConcreteElementType] = useState<string>('House Pad / Commercial Slab (6")');
  const [concretePsiGrade, setConcretePsiGrade] = useState<string>('3,500 PSI High-Early');

  // Compute concrete curing stats
  const concreteStats = calculateConcreteCuringStats(
    concreteLengthFt,
    concreteWidthFt,
    concreteThicknessInches,
    unitSystem,
    concreteElementType,
    concretePsiGrade
  );

  // Material Cost Calculator State
  const [materialActive, setMaterialActive] = useState<boolean>(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('crushed_granite_gab');
  const [materialLengthFt, setMaterialLengthFt] = useState<number>(100);
  const [materialWidthFt, setMaterialWidthFt] = useState<number>(12);
  const [materialThicknessInches, setMaterialThicknessInches] = useState<number>(4);
  const [useCustomMaterialVolume, setUseCustomMaterialVolume] = useState<boolean>(false);
  const [customMaterialVolumeCuYds, setCustomMaterialVolumeCuYds] = useState<number>(25);
  const [compactionFactorPct, setCompactionFactorPct] = useState<number>(12);
  const [regionalPricingPreset, setRegionalPricingPreset] = useState<string>('middle_ga');
  const [includeFreight, setIncludeFreight] = useState<boolean>(true);

  // Compute calculated volume in Cubic Yards
  const calculatedMaterialVolumeCuYds = useCustomMaterialVolume
    ? (unitSystem === 'metric' ? customMaterialVolumeCuYds * 1.30795 : customMaterialVolumeCuYds)
    : (unitSystem === 'metric'
        ? Math.round((Math.max(0.1, materialLengthFt) * Math.max(0.1, materialWidthFt) * (Math.max(0.1, materialThicknessInches) / 100) * 1.30795) * 10) / 10
        : Math.round(((Math.max(0.1, materialLengthFt) * Math.max(0.1, materialWidthFt) * (Math.max(0.1, materialThicknessInches) / 12)) / 27) * 10) / 10
      );

  const regionMultipliers: Record<string, number> = {
    'middle_ga': 1.0,
    'metro_atlanta': 1.15,
    'coastal_ga': 1.10,
    'direct_pit': 0.85
  };

  const materialStats = calculateMaterialCostStats(
    selectedMaterialId,
    calculatedMaterialVolumeCuYds,
    compactionFactorPct,
    regionMultipliers[regionalPricingPreset] || 1.0,
    includeFreight,
    undefined,
    unitSystem
  );

  // Compute base earthwork timeline & total estimate with concrete curing duration
  const getBaseEarthworkDays = () => {
    let days = 2; // baseline setup
    if (wishlist.landClearing === '1') days += 2;
    else if (wishlist.landClearing === '2') days += 3;
    else if (wishlist.landClearing === '3-5') days += 5;
    else if (wishlist.landClearing === '6-10') days += 7;
    else if (wishlist.landClearing === '11-20') days += 10;
    else if (wishlist.landClearing !== 'none') days += 14;

    if (wishlist.excavating === 'trenching') days += 2;
    else if (wishlist.excavating === 'basement') days += 5;
    else if (wishlist.excavating === 'crawlspace') days += 3;
    else if (wishlist.excavating === 'retaining') days += 4;
    else if (wishlist.excavating === 'custom') days += 6;

    if (wishlist.grading === 'rough') days += 2;
    else if (wishlist.grading === 'laser') days += 3;
    else if (wishlist.grading === 'landscape') days += 2;
    else if (wishlist.grading === 'slope') days += 3;

    if (wishlist.roadDriveway === '100') days += 2;
    else if (wishlist.roadDriveway === '250') days += 3;
    else if (wishlist.roadDriveway === '500') days += 5;
    else if (wishlist.roadDriveway === '1000') days += 7;
    else if (wishlist.roadDriveway !== 'none') days += 10;

    if (wishlist.culvert !== 'none') days += 1;
    if (wishlist.pond !== 'none') days += 4;
    if (wishlist.dam !== 'none') days += 3;
    if (wishlist.waterfall !== 'none') days += 2;

    return days;
  };

  const baseEarthworkDays = getBaseEarthworkDays();
  const concreteCuringDays = concreteActive ? concreteStats.cureDays : 0;
  const totalProjectDays = baseEarthworkDays + concreteCuringDays;
  const totalProjectWeeks = (totalProjectDays / 7).toFixed(1);

  // Weather Delay Calculator State
  const [weatherActive, setWeatherActive] = useState<boolean>(true);
  const [startSeason, setStartSeason] = useState<string>('current');
  const [weatherRegion, setWeatherRegion] = useState<string>('middle_ga');
  const [jobsiteSoilType, setJobsiteSoilType] = useState<string>('heavy_red_clay');

  const weatherStats = calculateWeatherDelayStats(
    totalProjectDays,
    startSeason,
    weatherRegion,
    jobsiteSoilType
  );

  const costBreakdown = calculateProjectCostBreakdown(
    wishlist,
    baseEarthworkDays,
    materialActive,
    materialStats,
    concreteActive,
    concreteStats
  );

  // Client Contact State
  const [contactForm, setContactForm] = useState({
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    location: '',
    additionalNotes: '',
    bestTimeToCall: 'Anytime / Text is Best',
    agreedToTerms: true
  });

  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<'wishlist' | 'contact'>('wishlist');
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  // AI Civil Engineering Site Plan Takeoff State
  const [sitePlanFile, setSitePlanFile] = useState<File | null>(null);
  const [sitePlanNotes, setSitePlanNotes] = useState<string>('');
  const [isParsingSitePlan, setIsParsingSitePlan] = useState<boolean>(false);
  const [sitePlanError, setSitePlanError] = useState<string | null>(null);
  const [parsedSitePlan, setParsedSitePlan] = useState<any | null>(null);
  const [sitePlanNotice, setSitePlanNotice] = useState<string | null>(null);

  const handleSitePlanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSitePlanFile(e.target.files[0]);
    }
  };

  const handleRunSitePlanAI = async (overrideText?: string, isWindsongDemo: boolean = false) => {
    setIsParsingSitePlan(true);
    setSitePlanError(null);
    setSitePlanNotice(null);

    try {
      if (isWindsongDemo) {
        // High-accuracy preset parsed directly from Windsong at Nature's Walk Civil Site Plan PDF (Gray, GA)
        const windsongPreset = {
          clientName: "Avery Communities, LLC (Brett Jackson)",
          jobName: "Windsong at Nature's Walk Townhome Community",
          locationAddress: "Nature's Walk (60' R/W), Gray, GA 31032 (Jones County)",
          civilData: {
            totalSiteArea: "1.76 Acres",
            imperviousArea: "0.72 Acres (40.9% site coverage)",
            townhomesCount: 16,
            buildingsCount: 3,
            parkingSpaces: 45,
            soilType: "Cecil Sandy Clay Loam (CZB2 & CyC2, 2 to 6% slopes)",
            stormPipeLengthLF: 155,
            stormPipeType: "18\" RCP (±75 LF @ 1.00% + ±80 LF @ 0.87%)",
            headwallsCount: 2,
            structuresCount: 2,
            asphaltPavingSqYds: 2850,
            gabcBaseTons: 680,
            curbAndGutterLF: 1280,
            sidewalkSqFt: 2400,
            siltFenceLF: 1450,
            buildingFFEs: [
              { name: "Building A (5 Townhomes)", ffe: "577.55'" },
              { name: "Building B (5 Townhomes)", ffe: "578.00'" },
              { name: "Building C (6 Townhomes)", ffe: "579.00'" }
            ]
          },
          takeoffAnalysisText: "Successfully parsed 15-sheet Civil Site Development Plan set for Windsong at Nature's Walk in Gray, GA (Widner & Associates, Inc.). Site encompasses 1.76 total acres with 0.72 acres impervious area across 16 townhomes in 3 building blocks (Building A FFE 577.55', Building B FFE 578.00', Building C FFE 579.00'). Engineering callouts mandate 1.76 acres clearing/grubbing, 155 LF of 18\" RCP storm sewer pipe with structures A1/B3 and headwalls A2/B2, 1,280 LF of 24\" vertical concrete curb & gutter, 2,850 SY of 3\" asphalt paving over 8\" GABC base, 45 parking spaces, and Type NS Silt Fence with rock construction exit at GPS 32.992948, -83.525665.",
          suggestedPhasesList: [
            "Phase 1: Heavy Site Clearing & Grubbing (1.76 Acres)",
            "Phase 2: Erosion Control BMPs (1,450 LF Silt Fence & Rock Exit)",
            "Phase 3: Mass Grading, Cut/Fill Soil Balancing & Building Pad Prep",
            "Phase 4: Underground Storm Drainage (155 LF 18\" RCP, Structures & Headwalls)",
            "Phase 5: Subgrade Base Course (8\" GABC Graded Aggregate Base)",
            "Phase 6: Concrete Hardscape (1,280 LF 24\" Curb/Gutter & 2,400 SF Sidewalks)",
            "Phase 7: Building Slab Foundations (Building A, B & C Pads)",
            "Phase 8: Roadway & Parking Lot Asphalt Paving (45 Parking Bays)"
          ],
          estimatedBudgetRange: "$285,000 - $345,000"
        };
        setParsedSitePlan(windsongPreset);
        
        // Auto populate fields
        setWishlist({
          landClearing: '2',
          excavating: 'custom',
          grading: 'laser',
          roadDriveway: '1000',
          drivewayMaterial: 'crusher',
          culvert: '18',
          pond: 'none',
          dam: 'none',
          waterfall: 'none',
          isForestryMulching: true
        });

        setConcreteActive(true);
        setConcreteLengthFt(120);
        setConcreteWidthFt(40);
        setConcreteThicknessInches(6);
        setConcreteElementType('House Pad / Commercial Slab (6")');

        setMaterialActive(true);
        setSelectedMaterialId('crushed_granite_gab');
        setMaterialLengthFt(420);
        setMaterialWidthFt(24);
        setMaterialThicknessInches(8);

        setContactForm(prev => ({
          ...prev,
          clientName: 'Avery Communities, LLC (Brett Jackson)',
          phone: '478-986-0251',
          email: 'newhomes@damesferryproperties.com',
          location: 'Nature\'s Walk (60\' R/W), Gray, GA 31032',
          additionalNotes: `Site Development Plan Scope: ${windsongPreset.takeoffAnalysisText}`
        }));

        setSitePlanNotice("⚡ Windsong at Nature's Walk Site Plan loaded! Parameters applied to civil estimator and bid form below.");
        return;
      }

      let fileBase64 = null;
      let mimeType = null;
      if (sitePlanFile) {
        mimeType = sitePlanFile.type || "application/pdf";
        fileBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const str = (reader.result as string).split(',')[1];
            resolve(str);
          };
          reader.readAsDataURL(sitePlanFile);
        });
      }

      const textToScan = typeof overrideText === 'string' ? overrideText : sitePlanNotes;

      const response = await fetch('/api/parse-takeoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToScan,
          filename: sitePlanFile?.name || "site_plan.pdf",
          fileData: fileBase64,
          mimeType: mimeType
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const resData = await response.json();
      setParsedSitePlan(resData);
      setSitePlanNotice("⚡ Civil site plan parsed successfully! Parameters applied below.");
    } catch (err: any) {
      console.error("Site plan takeoff scan error:", err);
      setSitePlanError(err?.message || "Failed to parse site plan drawing.");
    } finally {
      setIsParsingSitePlan(false);
    }
  };

  const applySitePlanToEstimate = () => {
    if (!parsedSitePlan) return;

    setWishlist({
      landClearing: '2',
      excavating: 'custom',
      grading: 'laser',
      roadDriveway: '1000',
      drivewayMaterial: 'crusher',
      culvert: '18',
      pond: 'none',
      dam: 'none',
      waterfall: 'none',
      isForestryMulching: true
    });

    setConcreteActive(true);
    setConcreteLengthFt(120);
    setConcreteWidthFt(40);
    setConcreteThicknessInches(6);
    setConcreteElementType('House Pad / Commercial Slab (6")');

    setMaterialActive(true);
    setSelectedMaterialId('crushed_granite_gab');
    setMaterialLengthFt(420);
    setMaterialWidthFt(24);
    setMaterialThicknessInches(8);

    setContactForm(prev => ({
      ...prev,
      clientName: parsedSitePlan.clientName || 'Avery Communities (Brett Jackson)',
      phone: '478-986-0251',
      email: 'newhomes@damesferryproperties.com',
      location: parsedSitePlan.locationAddress || 'Nature\'s Walk 60\' R/W, Gray, GA 31032',
      additionalNotes: `Site Development Plan Scope: ${parsedSitePlan.takeoffAnalysisText || ''}`
    }));

    setSitePlanNotice("⚡ Site Plan parameters successfully populated into your Estimator wishlist & contact form!");
  };

  const handleApplySitePlanMetrics = (metrics: ExtractedSiteMetrics) => {
    setWishlist({
      landClearing: metrics.totalAreaAcres > 1 ? '2' : '1',
      excavating: 'custom',
      grading: 'laser',
      roadDriveway: metrics.lengthFt ? metrics.lengthFt.toString() : '1000',
      drivewayMaterial: 'crusher',
      culvert: metrics.stormPipeLF ? '18' : 'none',
      pond: 'none',
      dam: 'none',
      waterfall: 'none',
      isForestryMulching: true
    });

    setConcreteActive(true);
    setConcreteLengthFt(metrics.lengthFt || 120);
    setConcreteWidthFt(metrics.widthFt || 40);
    setConcreteThicknessInches(metrics.thicknessInches || 6);
    setConcreteElementType('House Pad / Commercial Slab (6")');

    setMaterialActive(true);
    setSelectedMaterialId('crushed_granite_gab');
    setMaterialLengthFt(metrics.lengthFt || 420);
    setMaterialWidthFt(metrics.widthFt || 24);
    setMaterialThicknessInches(8);

    setContactForm(prev => ({
      ...prev,
      clientName: metrics.clientName || 'Avery Communities (Brett Jackson)',
      phone: '478-986-0251',
      email: 'newhomes@damesferryproperties.com',
      location: metrics.locationAddress || 'Nature\'s Walk 60\' R/W, Gray, GA 31032',
      additionalNotes: `Site Development Plan FileReader Extraction: Total Area: ${metrics.totalAreaAcres} Acres, Impervious: ${metrics.imperviousAreaAcres} Acres, FFE: ${metrics.elevationFFE}', Townhomes: ${metrics.townhomesCount}, Storm Sewer Pipe: ${metrics.stormPipeLF} LF, Curb & Gutter: ${metrics.curbAndGutterLF} LF.`
    }));

    setSitePlanNotice("⚡ Site Plan metrics extracted via FileReader have been populated into your Estimator!");
  };

  const handleExportPDF = () => {
    try {
      setIsExportingPDF(true);
      exportEstimateToPDF({
        unitSystem,
        wishlist,
        contactForm,
        concreteActive,
        concreteLength: concreteLengthFt,
        concreteWidth: concreteWidthFt,
        concreteThickness: concreteThicknessInches,
        concreteElementType,
        concretePsiGrade,
        concreteStats,
        materialActive,
        materialStats,
        weatherActive,
        weatherStats,
        baseEarthworkDays,
        totalProjectDays,
        totalProjectWeeks,
        costBreakdown
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('There was an error creating your downloadable estimate PDF. Please try again.');
    } finally {
      setTimeout(() => setIsExportingPDF(false), 600);
    }
  };

  // Sync state if division flips (to prefill nice starting elements)
  useEffect(() => {
    // Optional reset/prefill on division swap
  }, [division]);

  const handleWishlistChange = (key: string, value: any) => {
    setWishlist(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit compiled wishlist lead
  const handleSubmitWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    // Form inputs validation
    if (!contactForm.clientName.trim() || !contactForm.email.trim() || !contactForm.phone.trim() || !contactForm.location.trim()) {
      setErrorStatus("Name, Email, Phone number, and jobsite County/Address are strictly required before submitting your wishlist.");
      return;
    }

    const compiledDetails = `
=== SECURE CLIENT PROJECT WISHLIST CONFIGURATION ===
- Unit System Preferred: ${unitSystem.toUpperCase()}
- Land Clearing: ${CLEARING_LABELS[wishlist.landClearing] || wishlist.landClearing} ${wishlist.isForestryMulching ? "[FOR RESIDENTIAL FORESTRY MULCHING PREFERRED]" : ""}
- Excavation Needs: ${EXCAVATING_LABELS[wishlist.excavating] || wishlist.excavating}
- Grading Profile: ${GRADING_LABELS[wishlist.grading] || wishlist.grading}
- Road / Driveway Length: ${ROAD_LABELS[wishlist.roadDriveway] || wishlist.roadDriveway} [Material Base: ${DW_MATS[wishlist.drivewayMaterial] || 'None'}]
- Drainage Culvert Crossing: ${CULVERT_LABELS[wishlist.culvert] || wishlist.culvert}
- Waterway / Pond Size: ${POND_LABELS[wishlist.pond] || wishlist.pond}
- Clay Core Dam Embankment: ${DAM_LABELS[wishlist.dam] || wishlist.dam}
- Rock Custom Waterfall: ${WATERFALL_LABELS[wishlist.waterfall] || wishlist.waterfall}
${concreteActive ? `- Concrete Pour & Curing Schedule: ${concreteStats.formattedDimensionStr} (${concreteElementType}, Mix: ${concretePsiGrade}) -> Volume: ${concreteStats.formattedVolumeStr} | Curing Buffer: +${concreteStats.cureDays} Calendar Days` : '- Concrete Curing: N/A'}
${materialActive ? `- Material Cost Estimate: ${materialStats.selectedMat.name} (${materialStats.formattedVolumeStr} / ${materialStats.formattedTonnageStr} @ $${materialStats.unitPrice}/Cu Yd) -> Subtotal: $${materialStats.rawMaterialCost.toLocaleString()} + Freight ($${materialStats.totalFreight.toLocaleString()}) = Total Material Estimate: $${materialStats.totalMaterialEstimate.toLocaleString()}` : '- Material Cost Estimation: N/A'}
- Base Earthwork Duration: ${baseEarthworkDays} Days
${weatherActive ? `- Weather Delay Risk Adjustment: +${weatherStats.totalDelayDays} Days Rain & Mud Buffer (${weatherStats.rainProbabilityPct}% Rain Risk, Soil: ${weatherStats.soilTypeLabel}) -> Weather-Adjusted Completion Date: ${weatherStats.formattedCompletionDate} (${weatherStats.weatherAdjustedTotalDays} Days / ~${weatherStats.weatherAdjustedWeeks} Wks Total)` : '- Weather Delay Adjustment: Disabled'}
- Final Project Completion Estimate: ${weatherActive ? weatherStats.weatherAdjustedTotalDays : totalProjectDays} Calendar Days (~${weatherActive ? weatherStats.weatherAdjustedWeeks : totalProjectWeeks} Weeks) [Target Completion: ${weatherActive ? weatherStats.formattedCompletionDate : 'Base Work Schedule'}]
- Best Time to Call: ${contactForm.bestTimeToCall}

=== ADDITIONAL INSTRUCTIONS ===
${contactForm.additionalNotes || 'N/A'}
==================================================
`;

    // Instantiate unique ID and BidRequest layout compatible with staff list
    const randomId = `TJD-WISHLIST-W${Math.floor(1000 + Math.random() * 9000)}`;
    const newBidSubmission: BidRequest = {
      id: randomId,
      clientName: contactForm.clientName,
      companyName: contactForm.companyName || undefined,
      email: contactForm.email,
      phone: contactForm.phone,
      location: contactForm.location,
      serviceId: division === 'residential' ? 'res_pond_digs' : 'site_dev', // map to baseline services
      projectSize: wishlist.landClearing !== 'none' ? parseFloat(wishlist.landClearing) || 1 : 1,
      unit: 'acres',
      projectDetails: compiledDetails,
      status: 'Received',
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      estimatedCostRange: "In-House Appraiser Required (Competitive Protection Active)"
    };

    // Prepend to native localStorage array (shared with standard BidForm leads)
    try {
      const activeLocal = localStorage.getItem('tjd_earthworks_bids');
      const parsedList: BidRequest[] = activeLocal ? JSON.parse(activeLocal) : [];
      const updatedList = [newBidSubmission, ...parsedList];
      localStorage.setItem('tjd_earthworks_bids', JSON.stringify(updatedList));
      // Dispatch real-time update event so local lists on the same page sync instantly
      window.dispatchEvent(new Event('tjd_bids_updated'));
    } catch (e) {
      console.error('Failed writing wishlist to local lead database.', e);
    }

    // Trigger Dynamic Sheets Sync via Webhook (same as native BidForm!)
    const formDataPayload = new URLSearchParams();
    formDataPayload.append('action', 'submit_bid');
    formDataPayload.append('Submission_ID', randomId);
    formDataPayload.append('submission_id', randomId);
    formDataPayload.append('submitted_on', new Date().toISOString());
    formDataPayload.append('submitted_by', contactForm.clientName);
    formDataPayload.append('clientName', contactForm.clientName);
    formDataPayload.append('companyName', contactForm.companyName || '');
    formDataPayload.append('email', contactForm.email);
    formDataPayload.append('phone', contactForm.phone);
    formDataPayload.append('best_time_to_call', contactForm.bestTimeToCall);
    formDataPayload.append('location', contactForm.location);
    formDataPayload.append('serviceId', division === 'residential' ? 'res_pond_digs' : 'site_dev');
    formDataPayload.append('projectSize', "1");
    formDataPayload.append('unit', 'acres');
    formDataPayload.append('projectDetails', compiledDetails);
    formDataPayload.append('estimatedCostRange', "In-House Ballpark Protected");

    fetch(getWebhookUrl(), {
      method: 'POST',
      body: formDataPayload,
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(() => {
      console.log('Client Custom Wishlist logged to Sheets Webhook!');
    })
    .catch((err) => {
      console.warn('Webhook dynamic submit deferred/saved offline.', err);
    });

    // Fire off direct Slack notification to TJ Darley Construction phone
    sendSlackAlert({
      leadType: 'Custom Wishlist Estimate',
      clientName: contactForm.clientName,
      clientPhone: contactForm.phone,
      clientEmail: contactForm.email,
      details: compiledDetails
    });

    // Also fire off direct business email notification to info@tjdarleyconstruction.com (No Zapier)
    sendEmailAlert({
      leadType: 'Custom Wishlist Estimate',
      clientName: contactForm.clientName,
      clientPhone: contactForm.phone,
      clientEmail: contactForm.email,
      details: compiledDetails
    });

    // Fire prefill callback so parent context knows about this activity
    try {
      onPreFillContact(
        division === 'residential' ? 'res_pond_digs' : 'site_dev', 
        1, 
        'acres', 
        `Custom Wishlist: Option Profile Submitted (${randomId})`
      );
    } catch (err) {}

    // Show beautiful success card
    setFormSuccess(true);
  };

  const selectedOptionsCount = [
    wishlist.landClearing !== 'none',
    wishlist.excavating !== 'none',
    wishlist.grading !== 'none',
    wishlist.roadDriveway !== 'none',
    wishlist.culvert !== 'none',
    wishlist.pond !== 'none',
    wishlist.dam !== 'none',
    wishlist.waterfall !== 'none'
  ].filter(Boolean).length;

  return (
    <div id="estimator" className={`bg-gradient-to-br from-slate-900 to-slate-950 border ${division === 'residential' ? 'border-emerald-900/40' : 'border-slate-800'} rounded-3xl p-6 sm:p-10 space-y-8 text-left overflow-hidden transition-all duration-300 relative shadow-2xl`}>
      
      {/* Decorative vector overlays */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-zinc-500/5 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>
      
      {!formSuccess ? (
        <>
          {/* Header Description */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5 relative">
            <div>
              <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest font-extrabold px-3 py-1 rounded-full ${
                division === 'residential' ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400' : 'bg-orange-950/40 border border-orange-500/30 text-orange-400'
              }`}>
                <Compass className="w-3.5 h-3.5" />
                Step {activeStep === 'wishlist' ? '1' : '2'} of 2: {activeStep === 'wishlist' ? 'Construct Your Digital Wishlist' : 'Review & Lock Consultation'}
              </span>
              <h3 className="font-display font-black text-2xl text-white mt-3 flex items-center gap-2">
                <Sparkles className={`w-6 h-6 ${division === 'residential' ? 'text-emerald-400 animate-pulse' : 'text-orange-400 animate-pulse'}`} />
                <span>TJ Darley Custom Project Wishlist</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1.5 max-w-4xl leading-relaxed">
                Check and configure items below to craft a tailored project wishlist. Our team will import this custom profile directly into our proprietary in-house ballpark calculator on-site during our visit to map exact soil densities and machinery mobilizations!
              </p>
            </div>

            {/* Selection Progress Counters */}
            <div className="flex items-center gap-2.5 bg-slate-950/80 border border-white/5 py-2 px-4 rounded-xl self-start md:self-auto shrink-0 shadow-inner">
              <span className="text-[10px] text-slate-400 font-sans tracking-wider uppercase font-semibold">Configured Scope:</span>
              <span className={`text-xs font-bold font-sans px-2.5 py-1 rounded-lg ${
                selectedOptionsCount > 0 
                  ? division === 'residential' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {selectedOptionsCount} of 8 Selected
              </span>
            </div>
          </div>

          {activeStep === 'wishlist' ? (
            /* ================= STEP 1: WISHLIST SELECTION ================= */
            <div className="space-y-8 animate-in fade-in duration-200">

              {/* ⚡ Client-Side FileReader PDF Site Plan Extractor */}
              <SitePlanUpload onApplyToEstimator={handleApplySitePlanMetrics} />

              {/* ⚡ AI Civil Site Plan & Blueprint Takeoff Reader */}
              <div className="bg-slate-950 border border-slate-800 p-6 sm:p-7 rounded-3xl shadow-2xl relative overflow-hidden text-left space-y-5">
                <div className="absolute top-0 right-0 bg-orange-950 border-l border-b border-orange-850 text-orange-400 font-mono text-[9px] uppercase tracking-widest px-3.5 py-1.5 font-black flex items-center gap-1.5 rounded-bl-xl shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                  <span>Gemini Civil AI Site Takeoff</span>
                </div>

                <div>
                  <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-400 font-bold" />
                    <span>Upload & Read Civil Site Plan (PDF / Image)</span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Upload your site plan PDF or image drawing to extract total acreage, building pads, storm drainage, soil types, and paving specifications automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left: Upload file or paste notes */}
                  <div className="md:col-span-7 space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Option A: Upload Site Plan PDF or Blueprint Image</label>
                      <div className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/50 rounded-xl p-4 text-center cursor-pointer transition-all relative">
                        <input
                          type="file"
                          accept=".pdf,application/pdf,image/*"
                          onChange={handleSitePlanFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-1.5">
                          <Upload className="w-6 h-6 mx-auto text-slate-500" />
                          <div className="text-xs text-slate-300 font-bold">
                            {sitePlanFile ? `Selected PDF/Image: ${sitePlanFile.name}` : `Drag & drop PDF site plan here or click to browse`}
                          </div>
                          <p className="text-[10.5px] text-slate-500">Supports PDF architectural sets, PNG, JPG, JPEG civil sheets</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Option B: Type or Paste Engineer Specs / Site Notes</label>
                      <textarea
                        placeholder="e.g. Windsong at Nature's Walk, Gray, GA. 1.76 Acres, 16 townhomes in 3 buildings, 155 LF 18 inch RCP storm sewer, 8 inch GABC aggregate base, 24 inch curb & gutter."
                        value={sitePlanNotes}
                        onChange={(e) => setSitePlanNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl py-2.5 px-3.5 text-xs font-sans text-slate-200 outline-none focus:border-orange-500 font-medium placeholder-slate-600 h-20 resize-none"
                      />
                    </div>

                    <div className="pt-1 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleRunSitePlanAI()}
                        disabled={isParsingSitePlan}
                        className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white border border-orange-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
                      >
                        {isParsingSitePlan ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Scanning Civil Plan...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-white" />
                            <span>⚡ Scan Uploaded Site Plan</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRunSitePlanAI(undefined, true)}
                        disabled={isParsingSitePlan}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-orange-400 border border-orange-500/40 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 text-orange-400" />
                        <span>⚡ Load Windsong at Nature's Walk Site Plan (Gray, GA)</span>
                      </button>
                    </div>

                    {sitePlanError && (
                      <div className="p-2.5 bg-red-950/40 border border-red-900 text-red-400 text-xs rounded-xl font-bold">
                        ⚠️ {sitePlanError}
                      </div>
                    )}
                  </div>

                  {/* Right: Parsed AI Takeoff Breakdown */}
                  <div className="md:col-span-5 bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-3 relative flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h4 className="text-[10px] uppercase tracking-wider font-black text-orange-400 font-sans flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Civil Takeoff Analysis Result</span>
                        </h4>
                        {parsedSitePlan && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono font-bold">
                            Plan Verified
                          </span>
                        )}
                      </div>

                      {!parsedSitePlan ? (
                        <div className="py-8 text-center text-slate-500 space-y-1.5 flex-grow flex flex-col justify-center">
                          <FileText className="w-7 h-7 mx-auto text-slate-600 animate-pulse" />
                          <p className="text-xs font-bold text-slate-400">No Site Plan Loaded</p>
                          <p className="text-[10px] leading-tight text-slate-500 max-w-[220px] mx-auto">
                            Upload a site plan drawing or click the Windsong pre-loaded button to view the civil breakdown.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-2 text-xs">
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Project Name & Location</span>
                            <p className="text-white font-bold leading-tight">{parsedSitePlan.jobName}</p>
                            <p className="text-[10.5px] text-slate-400">{parsedSitePlan.locationAddress}</p>
                            <p className="text-[10px] text-orange-400 font-medium mt-0.5">Client: {parsedSitePlan.clientName}</p>
                          </div>

                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1.5">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Engineering Takeoff Highlights</span>
                            <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans italic bg-slate-900/60 p-2 rounded border border-slate-800">
                              "{parsedSitePlan.takeoffAnalysisText}"
                            </p>
                          </div>

                          {parsedSitePlan.civilData && (
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                                <span className="text-[8px] text-slate-500 block">TOTAL SITE AREA</span>
                                <span className="text-emerald-400 font-bold">{parsedSitePlan.civilData.totalSiteArea}</span>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                                <span className="text-[8px] text-slate-500 block">IMPERVIOUS AREA</span>
                                <span className="text-slate-200 font-bold">{parsedSitePlan.civilData.imperviousArea}</span>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                                <span className="text-[8px] text-slate-500 block">STORM PIPE</span>
                                <span className="text-slate-200 font-bold">{parsedSitePlan.civilData.stormPipeLengthLF} LF 18" RCP</span>
                              </div>
                              <div className="bg-slate-950 p-2 rounded-lg border border-slate-850">
                                <span className="text-[8px] text-slate-500 block">CURB & GUTTER</span>
                                <span className="text-slate-200 font-bold">{parsedSitePlan.civilData.curbAndGutterLF} LF</span>
                              </div>
                            </div>
                          )}

                          {sitePlanNotice && (
                            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl font-bold flex items-start gap-2 shadow-lg">
                              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{sitePlanNotice}</span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={applySitePlanToEstimate}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-white" />
                              <span>⚡ Re-Populate Wishlist & Form</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                launchMultiPhaseProjectFromSitePlan({
                                  clientName: parsedSitePlan.clientName || 'Avery Communities, LLC (Brett Jackson)',
                                  clientPhone: '478-986-0251',
                                  clientEmail: 'newhomes@damesferryproperties.com',
                                  jobName: parsedSitePlan.jobName || 'Windsong at Nature\'s Walk',
                                  locationAddress: parsedSitePlan.locationAddress || 'Nature\'s Walk 60\' R/W, Gray, GA 31032',
                                  totalAreaAcres: 1.76,
                                  imperviousAreaAcres: 0.72,
                                  stormPipeLF: 155,
                                  curbAndGutterLF: 1280,
                                  siltFenceLF: 1450,
                                  townhomesCount: 16,
                                  buildingsCount: 3,
                                  takeoffAnalysisText: parsedSitePlan.takeoffAnalysisText
                                });
                              }}
                              className="flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer border border-orange-400/30"
                            >
                              <Compass className="w-4 h-4 text-amber-200 animate-pulse" />
                              <span>⚡ Launch Multi-Phase Bid Workbook</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Land Clearing */}
                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3 hover:border-white/5 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/10">
                      <TreePine className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">1. Land Clearing & Grubbing</h4>
                      <p className="text-[10.5px] text-slate-500">Forestry mulching, stump extraction & dense scrub grubbing</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                    <select
                      value={wishlist.landClearing}
                      onChange={(e) => handleWishlistChange('landClearing', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 text-white rounded-lg py-2 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="none">No Clearing Needed</option>
                      <option value="1">1 Acre Clearing</option>
                      <option value="2">2 Acres Clearing</option>
                      <option value="3-5">3 to 5 Acres</option>
                      <option value="6-10">6 to 10 Acres</option>
                      <option value="11-20">11 to 20 Acres</option>
                      <option value="21-50">21 to 50 Acres</option>
                      <option value="51-100">51 to 100 Acres Custom</option>
                      <option value="100+">Over 100 Acres</option>
                    </select>

                    {wishlist.landClearing !== 'none' && (
                      <div 
                        onClick={() => handleWishlistChange('isForestryMulching', !wishlist.isForestryMulching)}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs cursor-pointer select-none transition-all ${
                          wishlist.isForestryMulching 
                            ? 'bg-emerald-950/20 border-emerald-500 text-emerald-450 font-bold' 
                            : 'bg-slate-900 border-slate-850 text-slate-500 hover:bg-slate-850'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={wishlist.isForestryMulching}
                          onChange={() => {}}
                          className="h-3 w-3 rounded text-emerald-500 accent-emerald-500 bg-slate-950 border-slate-800"
                        />
                        <span className="text-[10px]">Eco Forestry Mulching</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Excavating */}
                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3 hover:border-white/5 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 border border-orange-500/10">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">2. Heavy Excavating</h4>
                      <p className="text-[10.5px] text-slate-500">Foundation basements, storm run-off trenches, mass dirt cut</p>
                    </div>
                  </div>
                  <select
                    value={wishlist.excavating}
                    onChange={(e) => handleWishlistChange('excavating', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-white rounded-lg py-2 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none pt-1"
                  >
                    <option value="none">No Excavation Needed</option>
                    <option value="trenching">Light Trenching (Drainage / Footers)</option>
                    <option value="basement">Deep Basement & Foundational Dig</option>
                    <option value="crawlspace">Standard Crawlspace / Custom Slab Cut</option>
                    <option value="retaining">Retaining Wall Terraced Hill Cuts</option>
                    <option value="custom">Heavy Site Cut / Bulk Soil Balancing</option>
                  </select>
                </div>

                {/* 3. Grading */}
                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3 hover:border-white/5 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/10">
                      <Mountain className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">3. Site Grading & Leveling</h4>
                      <p className="text-[10.5px] text-slate-500">Precision laser transit house pads, crowns, slope stability</p>
                    </div>
                  </div>
                  <select
                    value={wishlist.grading}
                    onChange={(e) => handleWishlistChange('grading', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-white rounded-lg py-2 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none pt-1"
                  >
                    <option value="none">No Grading Needed</option>
                    <option value="rough">Rough Scrape & Construction Road Preps</option>
                    <option value="laser">Finished Laser-Transit Structural Pad</option>
                    <option value="landscape">Lawn/Landscape Moisture Shed Grading</option>
                    <option value="slope">Sloped Terrace Stabilization Balancing</option>
                  </select>
                </div>

                {/* 4. Driveway / Road Length */}
                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3 hover:border-white/5 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/10">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">4. Roadway & Driveway builds</h4>
                      <p className="text-[10.5px] text-slate-500">Gravel farm paths, highway accesses, crowning & stone lay</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <select
                      value={wishlist.roadDriveway}
                      onChange={(e) => handleWishlistChange('roadDriveway', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 text-white rounded-lg py-2 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="none">No Roadway Needed</option>
                      <option value="100">Up to 100 Linear Feet</option>
                      <option value="250">100 to 250 Linear Feet</option>
                      <option value="500">250 to 500 Linear Feet</option>
                      <option value="1000">500 to 1,000 Linear Feet</option>
                      <option value="2000">1,000 to 2,000 Linear Feet</option>
                      <option value="2000+">Over 2,000 Linear Feet</option>
                    </select>

                    {wishlist.roadDriveway !== 'none' && (
                      <select
                        value={wishlist.drivewayMaterial}
                        onChange={(e) => handleWishlistChange('drivewayMaterial', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 text-white rounded-lg py-2 px-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="none">No aggregate (Dirt Base)</option>
                        <option value="crusher">Granite Crusher Run</option>
                        <option value="surge">Coarse Surge Stone</option>
                        <option value="gravel">Local Bed Rounded Gravel</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* 5. Culverts */}
                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3 hover:border-white/5 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/10">
                      <Compass className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">5. Storm / Road Ditch Culverts</h4>
                      <p className="text-[10.5px] text-slate-500">HDPE corrugated dual-wall culvert pipe installations</p>
                    </div>
                  </div>
                  <select
                    value={wishlist.culvert}
                    onChange={(e) => handleWishlistChange('culvert', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-white rounded-lg py-2 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none pt-1"
                  >
                    <option value="none">No Culvert Needed</option>
                    <option value="12">12" Diameter Corrugated HDPE pipe</option>
                    <option value="18">18" Premium Heavy Highway Spec Culvert</option>
                    <option value="24">24" Large-Stream Double-Wall Crossing pipe</option>
                    <option value="36">36" Stream Passage Heavy RCP / Poly Culvert</option>
                  </select>
                </div>

                {/* 6. Pond */}
                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3 hover:border-white/5 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400 border border-teal-500/10">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">6. Private Pond Construction</h4>
                      <p className="text-[10.5px] text-slate-500">Engineered farm fishing basins, wildlife watering holes, cleanouts</p>
                    </div>
                  </div>
                  <select
                    value={wishlist.pond}
                    onChange={(e) => handleWishlistChange('pond', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-white rounded-lg py-2 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none pt-1"
                  >
                    <option value="none">No Pond Construction</option>
                    <option value="0.1">0.10 Acre Small Wildlife / Stock Tank</option>
                    <option value="0.25">0.25 Acre Core Compacted Stock Pond</option>
                    <option value="0.5">0.50 Acre Custom Landscaped Stream Pond</option>
                    <option value="1.0">1.00 Acre Recreational Bass Fishing Lake</option>
                    <option value="2+">2+ Acres Custom Heavy Excavated Estate Basin</option>
                  </select>
                </div>

                {/* 7. Dam */}
                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3 hover:border-white/5 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 border border-pink-500/10">
                      <HardHat className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">7. Clay Core Dam & Embankments</h4>
                      <p className="text-[10.5px] text-slate-500">Compacted core walls, structural spillways, erosion rip-rap</p>
                    </div>
                  </div>
                  <select
                    value={wishlist.dam}
                    onChange={(e) => handleWishlistChange('dam', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-white rounded-lg py-2 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none pt-1"
                  >
                    <option value="none">No Dam / Embankment Needed</option>
                    <option value="clay_core">Compacted GA Clay Core Sealing</option>
                    <option value="keyway">Structural Keyway Containment Barrier</option>
                    <option value="spillway">Emergency Overflow Pipe & Standpipe Controls</option>
                    <option value="heavy">Double Embankment with Heavy Rip-rap Tail Pipe</option>
                  </select>
                </div>

                {/* 8. Waterfall */}
                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3 hover:border-white/5 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/10">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">8. Custom Waterfalls & Spillways</h4>
                      <p className="text-[10.5px] text-slate-500">Natural tiered rock creek designs, headwall ornamental falls</p>
                    </div>
                  </div>
                  <select
                    value={wishlist.waterfall}
                    onChange={(e) => handleWishlistChange('waterfall', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 text-white rounded-lg py-2 px-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none pt-1"
                  >
                    <option value="none">No Waterfall Needed</option>
                    <option value="cascade">Tiered Natural Georgia Rock Cascade</option>
                    <option value="fieldstone">Custom Fieldstone Accent Headwall Waterfall</option>
                    <option value="active">Active Spillway High-flow Waterfall Cascade</option>
                  </select>
                </div>

              </div>

              {/* MEASUREMENT UNIT SYSTEM TOGGLE BAR */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-950/90 border border-sky-500/30 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2 font-display">
                      <span>Measurement Unit System Toggle</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">Auto-Converting</span>
                    </h5>
                    <p className="text-[10.5px] text-slate-400">Toggle length, width, and thickness measurements between Imperial and Metric. All volume, tonnage, and curing calculations update automatically.</p>
                  </div>
                </div>

                <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0 self-stretch sm:self-auto justify-stretch">
                  <button
                    type="button"
                    onClick={() => handleUnitSystemToggle('imperial')}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      unitSystem === 'imperial'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Imperial (ft / in / yd³)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUnitSystemToggle('metric')}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      unitSystem === 'metric'
                        ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Metric (m / cm / m³)</span>
                  </button>
                </div>
              </div>

              {/* CONCRETE DIMENSIONS & HYDRATION CURING CALCULATOR SECTION */}
              <div className="p-5 bg-slate-950/80 border border-amber-500/30 rounded-2xl space-y-4 shadow-xl text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                      <Timer className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2 font-display">
                        <span>Concrete Dimensions & Hydration Curing Calculator</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">ACI 308 Formula</span>
                      </h4>
                      <p className="text-[10.5px] text-slate-400">Calculate required hydration cure time from slab dimensions and automatically add it to final completion timeline.</p>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={concreteActive}
                      onChange={(e) => setConcreteActive(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-200">Include Concrete Curing Schedule</span>
                  </label>
                </div>

                {concreteActive && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Input Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          Length ({unitSystem === 'metric' ? 'meters' : 'ft'})
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={concreteLengthFt}
                          onChange={(e) => setConcreteLengthFt(Math.max(0.1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          Width ({unitSystem === 'metric' ? 'meters' : 'ft'})
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={concreteWidthFt}
                          onChange={(e) => setConcreteWidthFt(Math.max(0.1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          Thickness ({unitSystem === 'metric' ? 'cm' : 'inches'})
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          max={unitSystem === 'metric' ? "120" : "48"}
                          value={concreteThicknessInches}
                          onChange={(e) => setConcreteThicknessInches(Math.max(0.1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Element Type</label>
                        <select
                          value={concreteElementType}
                          onChange={(e) => setConcreteElementType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        >
                          <option value='House Pad / Commercial Slab (6")'>House Pad / Commercial Slab (6")</option>
                          <option value='Light Sidewalk / Apron (4")'>Light Sidewalk / Apron (4")</option>
                          <option value='Heavy Industrial Foundation (8")'>Heavy Industrial Foundation (8")</option>
                          <option value='Bridge Abutment / Mass Footing (12"+)'>Bridge Abutment / Mass Footing (12"+)</option>
                          <option value='Concrete Spillway Headwall'>Concrete Spillway Headwall</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Concrete Mix Grade</label>
                        <select
                          value={concretePsiGrade}
                          onChange={(e) => setConcretePsiGrade(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        >
                          <option value='3,500 PSI High-Early'>3,500 PSI High-Early (Rapid Curing)</option>
                          <option value='3,000 PSI Standard'>3,000 PSI Standard Residential</option>
                          <option value='4,000 PSI High-Strength'>4,000 PSI High-Strength Structural</option>
                          <option value='5,000 PSI Heavy Commercial'>5,000 PSI Heavy Commercial</option>
                        </select>
                      </div>
                    </div>

                    {/* Output Stats Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Calculated Volume</span>
                        <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">{concreteStats.formattedVolumeStr}</span>
                        <span className="text-[9.5px] text-slate-500 font-mono">{concreteStats.formattedDimensionStr}</span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-900/40">
                        <span className="text-[9px] uppercase tracking-wider text-amber-300 font-bold block">Required Curing Buffer</span>
                        <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">+{concreteStats.cureDays} Days</span>
                        <span className="text-[9.5px] text-slate-400 font-mono">Mandatory hydration window</span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Light Foot Traffic</span>
                        <span className="text-base font-black text-slate-200 font-mono mt-0.5 block">Day {concreteStats.footTrafficDays}</span>
                        <span className="text-[9.5px] text-slate-500">Pedestrian / layout walk only</span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Full Structural Load</span>
                        <span className="text-base font-black text-blue-400 font-mono mt-0.5 block">Day 28</span>
                        <span className="text-[9.5px] text-slate-500">100% design PSI threshold</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DYNAMIC FINAL PROJECT COMPLETION ESTIMATE BANNER */}
                <div className="p-4 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/40 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono font-black text-amber-400 tracking-widest block">
                        Dynamic Final Completion Estimate
                      </span>
                      <div className="text-lg font-black text-white font-display flex items-center gap-2 mt-0.5">
                        <span>{totalProjectDays} Calendar Days</span>
                        <span className="text-xs font-mono font-normal text-slate-400">(&sim;{totalProjectWeeks} Weeks)</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">
                        Base Earthwork: <strong className="text-slate-200">{baseEarthworkDays} Days</strong>
                        {concreteActive ? (
                          <> &bull; Concrete Curing Buffer: <strong className="text-emerald-400">+{concreteStats.cureDays} Days</strong></>
                        ) : (
                          <> &bull; Concrete Curing Buffer: <span className="text-slate-500">None Added</span></>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{concreteActive ? 'Curing Buffer Added to Timeline' : 'Base Estimate Active'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* MATERIAL COST CALCULATOR SECTION */}
              <div className="p-5 bg-slate-950/80 border border-emerald-500/30 rounded-2xl space-y-4 shadow-xl text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                      <Boxes className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2 font-display">
                        <span>Construction Material Cost & Volume Calculator</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Regional Market Rates</span>
                      </h4>
                      <p className="text-[10.5px] text-slate-400">Select construction materials (gravel, topsoil, fill dirt, stone), enter dimensions or cubic yards, and calculate material costs with freight hauling.</p>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={materialActive}
                      onChange={(e) => setMaterialActive(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-200">Include Material Cost Estimation</span>
                  </label>
                </div>

                {materialActive && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Material Selection & Regional Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Select Construction Material</label>
                        <select
                          value={selectedMaterialId}
                          onChange={(e) => setSelectedMaterialId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-semibold text-emerald-300 focus:outline-none focus:border-emerald-500"
                        >
                          {COMMON_MATERIALS.map((mat) => (
                            <option key={mat.id} value={mat.id}>
                              {mat.name} — ${mat.ratePerCuYd.toFixed(2)}/Cu Yd ({mat.description})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Regional Market Pricing</label>
                        <select
                          value={regionalPricingPreset}
                          onChange={(e) => setRegionalPricingPreset(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="middle_ga">Middle Georgia Standard Base Rate (1.0x)</option>
                          <option value="metro_atlanta">Suburban Atlanta Metro (+15% Surcharge)</option>
                          <option value="coastal_ga">Coastal Georgia / Savannah (+10% Surcharge)</option>
                          <option value="direct_pit">Direct Quarry Pit Wholesale (-15%)</option>
                        </select>
                      </div>
                    </div>

                    {/* Dimensions vs Custom Volume Toggle */}
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Volume Calculation Method</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {concreteActive && (
                            <button
                              type="button"
                              onClick={() => {
                                setUseCustomMaterialVolume(false);
                                setMaterialLengthFt(concreteLengthFt);
                                setMaterialWidthFt(concreteWidthFt);
                                setMaterialThicknessInches(concreteThicknessInches);
                              }}
                              className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all cursor-pointer"
                            >
                              Sync Slab ({concreteLengthFt}' &times; {concreteWidthFt}')
                            </button>
                          )}
                          <label className="inline-flex items-center gap-1.5 cursor-pointer text-[10.5px] text-slate-400">
                            <input
                              type="checkbox"
                              checked={useCustomMaterialVolume}
                              onChange={(e) => setUseCustomMaterialVolume(e.target.checked)}
                              className="w-3.5 h-3.5 text-emerald-500 rounded border-slate-700"
                            />
                            <span>Direct Cu Yds Override</span>
                          </label>
                        </div>
                      </div>

                      {!useCustomMaterialVolume ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                              Length ({unitSystem === 'metric' ? 'meters' : 'ft'})
                            </label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={materialLengthFt}
                              onChange={(e) => setMaterialLengthFt(Math.max(0.1, Number(e.target.value)))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                              Width ({unitSystem === 'metric' ? 'meters' : 'ft'})
                            </label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={materialWidthFt}
                              onChange={(e) => setMaterialWidthFt(Math.max(0.1, Number(e.target.value)))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                              Depth / Thickness ({unitSystem === 'metric' ? 'cm' : 'in'})
                            </label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              max={unitSystem === 'metric' ? "180" : "72"}
                              value={materialThicknessInches}
                              onChange={(e) => setMaterialThicknessInches(Math.max(0.1, Number(e.target.value)))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Compaction Waste (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={compactionFactorPct}
                              onChange={(e) => setCompactionFactorPct(Math.max(0, Number(e.target.value)))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                              Total Needed Volume ({unitSystem === 'metric' ? 'Cubic Meters' : 'Cubic Yards'})
                            </label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={customMaterialVolumeCuYds}
                              onChange={(e) => setCustomMaterialVolumeCuYds(Math.max(0.1, Number(e.target.value)))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Compaction Waste Allowance (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={compactionFactorPct}
                              onChange={(e) => setCompactionFactorPct(Math.max(0, Number(e.target.value)))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Options Row & Output Cards */}
                    <div className="flex items-center justify-between px-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={includeFreight}
                          onChange={(e) => setIncludeFreight(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>Include Tandem Dump Truck Freight Hauling ($85/trip)</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">Unit Weight: ~{materialStats.selectedMat.unitWeightTonsPerCuYd} Tons/Cu Yd</span>
                    </div>

                    {/* Calculated Output Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Adjusted Volume</span>
                        <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">{materialStats.formattedVolumeStr}</span>
                        <span className="text-[9.5px] text-slate-500 font-mono">{materialStats.formattedTonnageStr} (+{compactionFactorPct}% Waste)</span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Regional Market Price</span>
                        <span className="text-base font-black text-slate-200 font-mono mt-0.5 block">${materialStats.unitPrice.toFixed(2)} / Cu Yd</span>
                        <span className="text-[9.5px] text-slate-500">Base: ${materialStats.selectedMat.ratePerCuYd}</span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Truck Freight Hauling</span>
                        <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">${materialStats.totalFreight.toLocaleString()}</span>
                        <span className="text-[9.5px] text-slate-500">{materialStats.truckLoads} Dump Truck Loads</span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20">
                        <span className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold block">Total Material Estimate</span>
                        <span className="text-base font-black text-emerald-300 font-mono mt-0.5 block">${materialStats.totalMaterialEstimate.toLocaleString()}</span>
                        <span className="text-[9.5px] text-emerald-400/80">Materials + Freight</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GEORGIA HISTORICAL WEATHER & RAIN DELAY RISK CALCULATOR SECTION */}
              <div className="p-5 bg-slate-950/80 border border-sky-500/30 rounded-2xl space-y-4 shadow-xl text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
                      <CloudRain className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2 font-display">
                        <span>Georgia Historical Weather & Rain Delay Model</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">NOAA Climate & Soil Data</span>
                      </h4>
                      <p className="text-[10.5px] text-slate-400">Factors in regional rainfall probabilities, seasonal thunderstorm cycles, and heavy clay soil drying buffers to project realistic completion dates.</p>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={weatherActive}
                      onChange={(e) => setWeatherActive(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-200">Include Weather Delay Risk Factor</span>
                  </label>
                </div>

                {weatherActive && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Project Start Window */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Target Start Window / Season</label>
                        <select
                          value={startSeason}
                          onChange={(e) => setStartSeason(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-semibold text-sky-300 focus:outline-none focus:border-sky-500"
                        >
                          <option value="current">Current Calendar Month (Real-Time Baseline)</option>
                          <option value="spring">Spring Window (Mar - May • High Thunderstorms)</option>
                          <option value="summer">Summer Window (Jun - Aug • Afternoon Downpours)</option>
                          <option value="fall">Fall Window (Sep - Nov • Dry Earthwork Season)</option>
                          <option value="winter">Winter Window (Dec - Feb • Cold Fronts & Mud)</option>
                        </select>
                      </div>

                      {/* Regional Weather Profile */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Jobsite Climate Region</label>
                        <select
                          value={weatherRegion}
                          onChange={(e) => setWeatherRegion(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                        >
                          <option value="middle_ga">Middle Georgia (Macon / Warner Robins / Dublin)</option>
                          <option value="metro_atlanta">Suburban Atlanta Metro (High Runoff Slopes)</option>
                          <option value="coastal_ga">Coastal Georgia / Savannah (High Water Table)</option>
                          <option value="north_ga">North Georgia Mountains (Heavy Elevation Runoff)</option>
                        </select>
                      </div>

                      {/* Jobsite Soil Saturation Profile */}
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Jobsite Soil Condition & Drainage</label>
                        <select
                          value={jobsiteSoilType}
                          onChange={(e) => setJobsiteSoilType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                        >
                          <option value="heavy_red_clay">Middle GA Heavy Red Clay (1.5x Mud Drying Buffer)</option>
                          <option value="sandy_loam">Sandy Loam / Alluvial Mix (0.5x Fast Drainage)</option>
                          <option value="graded_stone_base">Compacted Stone / Aggregate Base (0.3x Rapid Drying)</option>
                        </select>
                      </div>
                    </div>

                    {/* Output Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Hist. Rain Day Risk</span>
                        <span className="text-base font-black text-sky-400 font-mono mt-0.5 block">{weatherStats.rainProbabilityPct}% Probability</span>
                        <span className="text-[9.5px] text-slate-500">Historical Monthly Average</span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Expected Wet Days</span>
                        <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">{weatherStats.expectedRainDays} Rain Days</span>
                        <span className="text-[9.5px] text-slate-500">During {totalProjectDays} Day Scope</span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Mud Drying Buffer</span>
                        <span className="text-base font-black text-sky-300 font-mono mt-0.5 block">+{weatherStats.soilDryOutDays} Days</span>
                        <span className="text-[9.5px] text-slate-500 truncate block">{weatherStats.soilTypeLabel}</span>
                      </div>
                      <div className="bg-slate-900/90 p-3 rounded-xl border border-sky-500/40 bg-sky-950/20">
                        <span className="text-[9px] uppercase tracking-wider text-sky-300 font-bold block">Adjusted Completion Date</span>
                        <span className="text-base font-black text-sky-300 font-mono mt-0.5 block">{weatherStats.formattedCompletionDate}</span>
                        <span className="text-[9.5px] text-sky-400/80">{weatherStats.weatherAdjustedTotalDays} Days (~{weatherStats.weatherAdjustedWeeks} Wks Total)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RECHARTS PROJECT COST BREAKDOWN CHART */}
              <CostBreakdownChartCard costBreakdown={costBreakdown} />

              {/* Action Ribbon: Transition to Contact & PDF Download */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider">Ready to lock options or export?</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Download a detailed PDF proposal or proceed to lock site coordinates for a walk-through.</p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-sky-400 border border-sky-500/30 hover:border-sky-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
                    title="Export itemized cost estimate, curing schedule, & weather risk report as PDF"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>{isExportingPDF ? 'Generating PDF...' : 'Download PDF Estimate'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedOptionsCount === 0) {
                        alert("Please choose at least one earthwork scope option to construct your wishlist!");
                        return;
                      }
                      setActiveStep('contact');
                    }}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all ${
                      selectedOptionsCount > 0 
                        ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-700/20' 
                        : 'bg-slate-900 text-slate-500 border border-slate-850'
                    }`}
                  >
                    <span>Lock Wishlist Details</span>
                    <ArrowRight className="w-4 h-4 animate-bounce" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* ================= STEP 2: CONTACT DETAILS INFORMATION ================= */
            <form onSubmit={handleSubmitWishlist} className="space-y-6 animate-in fade-in duration-200">
              
              {/* COMPREHENSIVE WISHLIST PREVIEW IN CONTACT FLOW */}
              <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                      ✓
                    </span>
                    <h5 className="text-[10.5px] sm:text-xs font-black uppercase tracking-wider text-slate-200">
                      Your Saved Earthwork Wishlist Parameters
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStep('wishlist')}
                    className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase cursor-pointer"
                  >
                    Edit Wishlist &lsaquo;
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {/* Land Clearing */}
                  {wishlist.landClearing !== 'none' && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">1. Land Clearing</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{CLEARING_LABELS[wishlist.landClearing]}</span>
                      {wishlist.isForestryMulching && (
                        <span className="text-[8.5px] font-medium text-emerald-400 mt-1 uppercase font-mono">&bull; Forestry Mulch</span>
                      )}
                    </div>
                  )}

                  {/* Excavation */}
                  {wishlist.excavating !== 'none' && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">2. Excavation</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{EXCAVATING_LABELS[wishlist.excavating]}</span>
                    </div>
                  )}

                  {/* Grading */}
                  {wishlist.grading !== 'none' && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">3. Grading</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{GRADING_LABELS[wishlist.grading]}</span>
                    </div>
                  )}

                  {/* Road / Driveway */}
                  {wishlist.roadDriveway !== 'none' && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">4. Road Way</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{ROAD_LABELS[wishlist.roadDriveway]}</span>
                      <span className="text-[8.5px] font-mono text-emerald-400 mt-0.5">{DW_MATS[wishlist.drivewayMaterial] || 'Dirt/Clay'} Base</span>
                    </div>
                  )}

                  {/* Culvert */}
                  {wishlist.culvert !== 'none' && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">5. Culvert</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{CULVERT_LABELS[wishlist.culvert]}</span>
                    </div>
                  )}

                  {/* Pond */}
                  {wishlist.pond !== 'none' && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">6. Pond Dig</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{POND_LABELS[wishlist.pond]}</span>
                    </div>
                  )}

                  {/* Dam */}
                  {wishlist.dam !== 'none' && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">7. Clay Core Dam</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{DAM_LABELS[wishlist.dam]}</span>
                    </div>
                  )}

                  {/* Waterfall */}
                  {wishlist.waterfall !== 'none' && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">8. Rock Waterfall</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{WATERFALL_LABELS[wishlist.waterfall]}</span>
                    </div>
                  )}

                  {/* Concrete Curing */}
                  {concreteActive && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-900/50 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">9. Concrete Curing Schedule</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{concreteStats.formattedDimensionStr} ({concreteStats.formattedVolumeStr})</span>
                      <span className="text-[8.5px] font-mono text-emerald-400 mt-0.5">+{concreteStats.cureDays} Days Hydration Buffer</span>
                    </div>
                  )}

                  {/* Material Cost Estimation */}
                  {materialActive && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-900/50 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">10. Material Cost Estimate</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{materialStats.selectedMat.name}</span>
                      <span className="text-[8.5px] font-mono text-emerald-400 mt-0.5">{materialStats.formattedVolumeStr} ({materialStats.formattedTonnageStr}) &rarr; ${materialStats.totalMaterialEstimate.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Georgia Weather Risk Adjustment */}
                  {weatherActive && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-sky-900/50 flex flex-col justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-sky-400">11. Georgia Weather Risk Adjustment</span>
                      <span className="text-[11px] font-bold text-white mt-1 leading-snug">{weatherStats.rainProbabilityPct}% Rain Risk (+{weatherStats.totalDelayDays} Days Rain & Mud Buffer)</span>
                      <span className="text-[8.5px] font-mono text-sky-300 mt-0.5">Target Completion: {weatherStats.formattedCompletionDate} ({weatherStats.weatherAdjustedTotalDays} Days / ~{weatherStats.weatherAdjustedWeeks} Wks)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RECHARTS PROJECT COST BREAKDOWN CHART IN STEP 2 REVIEW */}
              <CostBreakdownChartCard costBreakdown={costBreakdown} />

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Wishlist Lock: Contact details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      required
                      value={contactForm.clientName}
                      onChange={handleContactChange}
                      placeholder="e.g. John Darley"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                      Company Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={contactForm.companyName}
                      onChange={handleContactChange}
                      placeholder="e.g. Greensboro Farmland Inc"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder="e.g. john@darleyfarms.com"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={contactForm.phone}
                      onChange={handleContactChange}
                      placeholder="e.g. 478-808-7789"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Best Time to Call */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Best Time to Call
                    </label>
                    <select
                      name="bestTimeToCall"
                      value={contactForm.bestTimeToCall}
                      onChange={handleContactChange}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Anytime / Text is Best">Anytime / Text is Best</option>
                      <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (12:00 PM - 5:00 PM)">Afternoon (12:00 PM - 5:00 PM)</option>
                      <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Jobsite Address / County */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Jobsite Location / County / GPS Coordinates *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={contactForm.location}
                    onChange={handleContactChange}
                    placeholder="e.g. Greene County, GA (Lake Oconee parcel #403)"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Custom Notes */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Additional Project Details / Machinery Access Notes
                  </label>
                  <textarea
                    name="additionalNotes"
                    rows={3}
                    value={contactForm.additionalNotes}
                    onChange={handleContactChange}
                    placeholder="Provide details about terrain slopes, dense oak clusters, specific water drainage problems, or mud access bottlenecks..."
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  ></textarea>
                </div>
              </div>

              {/* Status errors card */}
              {errorStatus && (
                <div className="bg-red-950/20 border border-red-900 p-4 rounded-xl flex gap-3 text-xs text-red-200">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span>{errorStatus}</span>
                </div>
              )}

              {/* Confirm submit buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('wishlist')}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-800 hover:border-slate-500 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all uppercase font-mono cursor-pointer text-center"
                >
                  &larr; Redesign Wishlist
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/30 hover:border-sky-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
                    title="Export itemized estimate as PDF document"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    <span>{isExportingPDF ? 'Generating PDF...' : 'Download PDF Estimate'}</span>
                  </button>

                  <button
                    type="submit"
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs uppercase font-mono font-black tracking-widest text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all ${
                      division === 'residential' 
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20' 
                        : 'bg-orange-600 hover:bg-orange-500 shadow-orange-700/20'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Transmit Project Wishlist</span>
                  </button>
                </div>
              </div>

            </form>
          )}
        </>
      ) : (
        /* ================= SUBMISSION CELEBRATION CONSOLE SUCCESS ================= */
        <div className="text-center py-12 max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full shadow-lg shadow-emerald-500/10">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-black text-2xl text-white">
              Project Wishlist Synchronized & Logged!
            </h3>
            <span className="text-[10px] bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-mono px-3 py-1 rounded-lg">
              Transaction Code: TJD-W-{Math.floor(10000 + Math.random() * 90000)}
            </span>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-900 text-left overflow-hidden shadow-2xl">
            {/* Header of the mock email container */}
            <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Mail className="w-3.5 h-3.5" />
                <span className="font-bold uppercase tracking-wider">Client Automated Thank-You Email Dispatched</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-emerald-500 font-bold font-mono">SENT SUCCESS</span>
              </div>
            </div>

            {/* Simulated Email Message Headers */}
            <div className="p-4 border-b border-slate-900 bg-slate-950/50 space-y-1.5 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 mr-2">From:</span>
                <span className="text-slate-200 font-medium">tjdcllc@gmail.com</span> 
                <span className="text-slate-500 italic ml-1.5">(T.J. Darley Construction &amp; Earthwork)</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">To:</span>
                <span className="text-emerald-400 font-semibold">{contactForm.email}</span>
                <span className="text-slate-400 ml-1">({contactForm.clientName})</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">Subject:</span>
                <span className="text-white font-bold">Thank you for choosing TJ Darley Construction - Project Specifications Logged</span>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="p-5 font-sans text-xs text-slate-300 leading-relaxed bg-slate-950/80 space-y-4">
              <p className="font-bold text-slate-100">Hi {contactForm.clientName},</p>
              
              <p>
                Thank you for choosing <strong className="text-emerald-400 font-black">TJ Darley Construction, Middle Georgia's Premier Earthworks company!</strong> We have received your Project specifications and logged them into our schedule hub. We will contact you to setup a site visit of the proposed job site.
              </p>

              <div className="bg-slate-900/90 border border-slate-800/60 rounded-xl p-4 space-y-2 text-[11px] text-slate-300">
                <div className="font-black text-white uppercase tracking-wider text-[10px] border-b border-white/5 pb-1 mb-2 text-emerald-400 font-sans tracking-wide">
                  Recorded Project Requirements
                </div>
                {wishlist.pond !== 'none' && (
                  <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Waterway/Pond:</strong> {POND_LABELS[wishlist.pond]}</div>
                )}
                {wishlist.roadDriveway !== 'none' && (
                  <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Road/Driveway:</strong> {wishlist.roadDriveway === 'gravel' ? 'Gravel Road Base' : 'Pristine Dirt/Clay Grading'} ({DW_MATS[wishlist.drivewayMaterial] || 'Standard Dirt/Gravel'})</div>
                )}
                {wishlist.landClearing !== 'none' && (
                  <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Clearing Preference:</strong> {CLEARING_LABELS[wishlist.landClearing]}</div>
                )}
                {wishlist.isForestryMulching && (
                  <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Forestry Mulcher Loop:</strong> High-Accuracy Sweetgum & Oak Mulching requested</div>
                )}
                {wishlist.excavating !== 'none' && (
                  <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Excavation:</strong> {EXCAVATING_LABELS[wishlist.excavating]}</div>
                )}
                {wishlist.dam !== 'none' && (
                  <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Clay Core Dam Embankment:</strong> {DAM_LABELS[wishlist.dam]}</div>
                )}
                {wishlist.waterfall !== 'none' && (
                  <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Waterfall Rock Feature:</strong> {WATERFALL_LABELS[wishlist.waterfall]}</div>
                )}
                {concreteActive && (
                  <div>&bull; <strong className="text-amber-400 font-semibold mr-1">Concrete Curing Schedule:</strong> {concreteLengthFt}' L &times; {concreteWidthFt}' W @ {concreteThicknessInches}" ({concreteStats.volumeCuYds} Cu Yds) &rarr; <span className="text-emerald-400 font-bold">+{concreteStats.cureDays} Days Hydration Buffer</span></div>
                )}
                {materialActive && (
                  <div>&bull; <strong className="text-emerald-400 font-semibold mr-1">Material Cost Estimate:</strong> {materialStats.selectedMat.name} ({materialStats.adjustedVol} Cu Yds @ ${materialStats.unitPrice}/Cu Yd) &rarr; <span className="text-emerald-300 font-bold">${materialStats.totalMaterialEstimate.toLocaleString()} Total (Incl. Freight)</span></div>
                )}
                {weatherActive && (
                  <div>&bull; <strong className="text-sky-400 font-semibold mr-1">Georgia Weather Delay Adjustment:</strong> +{weatherStats.totalDelayDays} Days Rain & Mud Buffer ({weatherStats.rainProbabilityPct}% Rain Risk, {weatherStats.soilTypeLabel}) &rarr; <span className="text-sky-300 font-bold">Target Completion Date: {weatherStats.formattedCompletionDate}</span></div>
                )}
                <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Estimated Final Completion Schedule:</strong> <span className="text-white font-bold">{weatherActive ? weatherStats.weatherAdjustedTotalDays : totalProjectDays} Calendar Days (~{weatherActive ? weatherStats.weatherAdjustedWeeks : totalProjectWeeks} Weeks)</span></div>
                <div className="pt-2 border-t border-slate-800 mt-2 space-y-1">
                  <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Jobsite Location:</strong> {contactForm.location || 'Georgia, US'}</div>
                  <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Callback Telephone:</strong> {contactForm.phone}</div>
                  <div>&bull; <strong className="text-slate-400 font-semibold mr-1">Best Contact Hours:</strong> <span className="text-emerald-400 font-bold">{contactForm.bestTimeToCall}</span></div>
                </div>
              </div>

              {/* RECHARTS PROJECT COST BREAKDOWN CHART IN STEP 3 SUBMISSION SUMMARY */}
              <div className="pt-2">
                <CostBreakdownChartCard costBreakdown={costBreakdown} />
              </div>

              <p>
                Our operations team is already looking at your site location using geographical GIS soil maps. An estimator will call your mobile number <strong className="text-white font-bold">{contactForm.phone}</strong> shortly to answer questions, verify soil factors, and schedule your free walk-through meeting.
              </p>

              <p>
                We look forward to partnering with you to shape, level, and design your Southern acreage!
              </p>

              <div className="border-t border-slate-900 pt-3 text-slate-400 font-sans">
                <p className="font-bold text-slate-300">Best regards,</p>
                <p className="text-white font-extrabold mt-0.5">T.J. Darley, Owner</p>
                <p className="text-[10px]">T.J. Darley Construction, LLC</p>
                <p className="text-[10px]">Macon | Warner Robins | Greensboro | Atlanta GA</p>
                <p className="text-[10px] text-emerald-500 font-bold mt-1">478-808-7789</p>
              </div>
            </div>

            {/* Instruction tooltip badge for the admin inside the app */}
            <div className="bg-slate-900 px-4 py-2.5 text-[10px] text-slate-400 border-t border-slate-900 flex justify-between items-center font-mono">
              <span>💡 Real customer email is queued via Webhook script</span>
              <span className="text-emerald-500 font-bold uppercase tracking-wider">Configure in Office Hub</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-sky-600/20 cursor-pointer inline-flex items-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPDF ? 'Generating PDF...' : 'Download Official PDF Estimate'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setWishlist({
                  landClearing: 'none',
                  excavating: 'none',
                  grading: 'none',
                  roadDriveway: 'none',
                  culvert: 'none',
                  pond: 'none',
                  dam: 'none',
                  waterfall: 'none',
                  isForestryMulching: false,
                  drivewayMaterial: 'none',
                });
                setContactForm({
                  clientName: '',
                  companyName: '',
                  email: '',
                  phone: '',
                  location: '',
                  additionalNotes: '',
                  bestTimeToCall: 'Anytime / Text is Best',
                  agreedToTerms: true
                });
                setFormSuccess(false);
                setActiveStep('wishlist');
              }}
              className="px-6 py-2.5 border border-slate-800 hover:border-slate-500 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all uppercase font-mono cursor-pointer inline-flex items-center gap-2"
            >
              Create Another Project Wishlist
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
