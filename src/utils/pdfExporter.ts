import { jsPDF } from 'jspdf';
import { WishlistState } from '../components/Estimator';

export interface PDFExportData {
  wishlist: WishlistState;
  contactForm: {
    clientName: string;
    companyName: string;
    email: string;
    phone: string;
    location: string;
    additionalNotes: string;
  };
  unitSystem?: 'imperial' | 'metric';
  concreteActive: boolean;
  concreteLength: number;
  concreteWidth: number;
  concreteThickness: number;
  concreteElementType: string;
  concretePsiGrade: string;
  concreteStats: {
    volumeCuYds: number;
    volumeCuMeters: number;
    cureDays: number;
    footTrafficDays: number;
    fullStrengthDays: number;
    formattedDimensionStr: string;
    formattedVolumeStr: string;
  };
  materialActive: boolean;
  materialStats: {
    selectedMat: {
      name: string;
      category: string;
    };
    adjustedVol: number;
    adjustedVolCuMeters: number;
    estimatedTons: number;
    estimatedMetricTons: number;
    unitPrice: number;
    rawMaterialCost: number;
    totalFreight: number;
    totalMaterialEstimate: number;
    formattedVolumeStr: string;
    formattedTonnageStr: string;
  };
  weatherActive: boolean;
  weatherStats: {
    rainProbabilityPct: number;
    expectedRainDays: number;
    soilDryOutDays: number;
    totalDelayDays: number;
    weatherAdjustedTotalDays: number;
    weatherAdjustedWeeks: string;
    formattedCompletionDate: string;
    soilTypeLabel: string;
  };
  baseEarthworkDays: number;
  totalProjectDays: number;
  totalProjectWeeks: string;
  costBreakdown: {
    equipmentTotal: number;
    materialTotal: number;
    laborTotal: number;
    freightTotal: number;
    contingencyTotal: number;
    grandTotalCost: number;
    chartData: {
      category: string;
      cost: number;
      percentage: string;
      color: string;
    }[];
  };
}

const OPTION_LABELS: Record<string, Record<string, string>> = {
  landClearing: {
    'none': 'None',
    'under_1': 'Under 1 Acre Heavy Brush',
    '1_3': '1 - 3 Acres Timber & Stumps',
    '3_5': '3 - 5 Acres Overgrown Timber',
    '5_plus': '5+ Acres Forestry Operations'
  },
  excavating: {
    'none': 'None',
    'trenching': 'Footing & Utility Trenching',
    'basement': 'Basement & Mass Foundation',
    'site_cut': 'Heavy Site Cut & Fill'
  },
  grading: {
    'none': 'None',
    'house_pad': 'House & Building Pad Leveling',
    'finish': 'Laser Finish Fine Grading',
    'drainage': 'Swale & Erosion Drainage Correction'
  },
  roadDriveway: {
    'none': 'None',
    'dirt_subbase': 'Raw Dirt Subbase Prep',
    'gravel_spread': 'GAB Gravel Spread & Roll',
    'asphalt_base': 'Heavy Aggregate Base'
  },
  culvert: {
    'none': 'None',
    '15_inch': '15" HDPE Driveway Pipe',
    '18_inch': '18" Reinforced Concrete Pipe',
    '24_inch': '24" High-Capacity Drainage Culvert'
  },
  pond: {
    'none': 'None',
    'quarter_acre': '1/4 Acre Farm Pond',
    'half_acre': '1/2 Acre Stocked Fishing Pond',
    'one_acre_plus': '1+ Acre Irrigation Reservoir'
  },
  dam: {
    'none': 'None',
    'repair': 'Erosion Dam Repair & Core',
    'new_construction': 'Engineered Clay Core Spillway Dam'
  },
  waterfall: {
    'none': 'None',
    'natural_rock': 'Custom Boulders & Natural Cascades'
  }
};

export function exportEstimateToPDF(data: PDFExportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // Primary palette (Navy slate, Amber accent, Dark charcoal)
  const primaryColor = [15, 23, 42]; // #0f172a slate-900
  const headerBg = [11, 15, 25]; // #0b0f19
  const accentColor = [217, 119, 6]; // amber-600
  const emeraldColor = [16, 185, 129]; // emerald-500
  const lightBg = [248, 250, 252]; // slate-50
  const borderLineColor = [226, 232, 240]; // slate-200

  // 1. HEADER BANNER
  doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent bar top
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('T.J. DARLEY CONSTRUCTION, LLC', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Land Clearing • Heavy Excavation • Grading • Concrete • Aggregate Delivery', margin, 19);

  // Proposal Metadata Right Aligned
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const proposalId = `EST-${Math.floor(100000 + Math.random() * 900000)}`;

  doc.setFontSize(8);
  doc.setTextColor(251, 191, 36); // Amber light
  doc.setFont('helvetica', 'bold');
  doc.text(`PROPOSAL ID: ${proposalId}`, pageWidth - margin, 14, { align: 'right' });

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date Issued: ${dateStr}`, pageWidth - margin, 19, { align: 'right' });
  doc.text(`Region: Middle & Metro Georgia, USA`, pageWidth - margin, 24, { align: 'right' });

  y = 44;

  // 2. CLIENT & JOBSITE CARD
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 26, 2, 2, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('CLIENT & JOBSITE INFORMATION', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const clientName = data.contactForm.clientName.trim() || 'Prospective Customer';
  const company = data.contactForm.companyName.trim() ? ` (${data.contactForm.companyName.trim()})` : '';
  const phone = data.contactForm.phone.trim() || 'Not Provided';
  const email = data.contactForm.email.trim() || 'Not Provided';
  const location = data.contactForm.location.trim() || 'Georgia Site Location';

  doc.text(`Client Name: ${clientName}${company}`, margin + 4, y + 12);
  doc.text(`Phone: ${phone}  |  Email: ${email}`, margin + 4, y + 17);
  doc.text(`Jobsite Coordinates / Location: ${location}`, margin + 4, y + 22);

  y += 32;

  // 3. EARTHWORK SCOPE & WISHLIST TABLE
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, pageWidth - (margin * 2), 6.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SELECTED EARTHWORK SCOPES & SITE PREPARATION', margin + 4, y + 4.5);

  y += 6.5;

  const scopesList: { name: string; detail: string }[] = [];
  if (data.wishlist.landClearing !== 'none') {
    scopesList.push({
      name: 'Land Clearing',
      detail: `${OPTION_LABELS.landClearing[data.wishlist.landClearing] || data.wishlist.landClearing}${data.wishlist.isForestryMulching ? ' [Forestry Mulching Included]' : ''}`
    });
  }
  if (data.wishlist.excavating !== 'none') {
    scopesList.push({
      name: 'Excavation & Earth Cut',
      detail: OPTION_LABELS.excavating[data.wishlist.excavating] || data.wishlist.excavating
    });
  }
  if (data.wishlist.grading !== 'none') {
    scopesList.push({
      name: 'Site Grading & Leveling',
      detail: OPTION_LABELS.grading[data.wishlist.grading] || data.wishlist.grading
    });
  }
  if (data.wishlist.roadDriveway !== 'none') {
    scopesList.push({
      name: 'Road & Driveway Prep',
      detail: `${OPTION_LABELS.roadDriveway[data.wishlist.roadDriveway] || data.wishlist.roadDriveway}${data.wishlist.drivewayMaterial && data.wishlist.drivewayMaterial !== 'none' ? ` (${data.wishlist.drivewayMaterial.toUpperCase()} Surfacing)` : ''}`
    });
  }
  if (data.wishlist.culvert !== 'none') {
    scopesList.push({
      name: 'Culvert & Pipe Install',
      detail: OPTION_LABELS.culvert[data.wishlist.culvert] || data.wishlist.culvert
    });
  }
  if (data.wishlist.pond !== 'none') {
    scopesList.push({
      name: 'Pond Construction',
      detail: OPTION_LABELS.pond[data.wishlist.pond] || data.wishlist.pond
    });
  }
  if (data.wishlist.dam !== 'none') {
    scopesList.push({
      name: 'Dam Construction/Repair',
      detail: OPTION_LABELS.dam[data.wishlist.dam] || data.wishlist.dam
    });
  }
  if (data.wishlist.waterfall !== 'none') {
    scopesList.push({
      name: 'Custom Waterfall Feature',
      detail: OPTION_LABELS.waterfall[data.wishlist.waterfall] || data.wishlist.waterfall
    });
  }

  if (scopesList.length === 0) {
    scopesList.push({ name: 'General Site Consult', detail: 'Custom Earthwork Requirements to be specified upon walking property' });
  }

  // Draw scope items
  scopesList.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, pageWidth - (margin * 2), 6, 'F');

    doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`• ${item.name}`, margin + 4, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(item.detail, margin + 55, y + 4.2);

    y += 6;
  });

  y += 4;

  // 4. CONCRETE POUR & CURING CALCULATIONS (IF ACTIVE)
  if (data.concreteActive) {
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, pageWidth - (margin * 2), 6, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('CONCRETE SLAB POUR & ACI CURING SPECIFICATIONS', margin + 4, y + 4.2);

    y += 6;

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - (margin * 2), 16, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, pageWidth - (margin * 2), 16, 'S');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text(`• Pour Dimensions: ${data.concreteStats.formattedDimensionStr}`, margin + 4, y + 5);
    doc.text(`• Concrete Element Type: ${data.concreteElementType}`, margin + 4, y + 9.5);
    doc.text(`• Mix Specification: ${data.concretePsiGrade}`, margin + 4, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9); // amber dark
    doc.text(`Calculated Volume: ${data.concreteStats.formattedVolumeStr}`, margin + 105, y + 5);
    doc.text(`Hydration Curing Buffer: +${data.concreteStats.cureDays} Calendar Days`, margin + 105, y + 9.5);
    doc.text(`Foot Traffic Safe: ${data.concreteStats.footTrafficDays} Days | Full Strength: ${data.concreteStats.fullStrengthDays} Days`, margin + 105, y + 14);

    y += 20;
  }

  // 5. MATERIAL COST & FREIGHT BREAKDOWN (IF ACTIVE)
  if (data.materialActive) {
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, pageWidth - (margin * 2), 6, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('DELIVERED AGGREGATE & MATERIAL SUPPLY ESTIMATE', margin + 4, y + 4.2);

    y += 6;

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - (margin * 2), 16, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, pageWidth - (margin * 2), 16, 'S');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text(`• Selected Material: ${data.materialStats.selectedMat.name} (${data.materialStats.selectedMat.category})`, margin + 4, y + 5);
    doc.text(`• Calculated Volume: ${data.materialStats.formattedVolumeStr}`, margin + 4, y + 9.5);
    doc.text(`• Estimated Tonnage: ${data.materialStats.formattedTonnageStr}`, margin + 4, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald
    doc.text(`Material Rate: $${data.materialStats.unitPrice.toFixed(2)}/Cu Yd ($${data.materialStats.rawMaterialCost.toLocaleString()})`, margin + 110, y + 5);
    doc.text(`Truck Freight Hauling: $${data.materialStats.totalFreight.toLocaleString()}`, margin + 110, y + 9.5);
    doc.text(`Total Delivered Estimate: $${data.materialStats.totalMaterialEstimate.toLocaleString()}`, margin + 110, y + 14);

    y += 20;
  }

  // 6. GEORGIA WEATHER & RAIN DELAY RISK MODEL (IF ACTIVE)
  if (data.weatherActive) {
    doc.setFillColor(14, 116, 144); // cyan-700
    doc.rect(margin, y, pageWidth - (margin * 2), 6, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('GEORGIA HISTORICAL WEATHER & RAIN DELAY RISK MODEL', margin + 4, y + 4.2);

    y += 6;

    doc.setFillColor(240, 249, 255);
    doc.rect(margin, y, pageWidth - (margin * 2), 14, 'F');
    doc.setDrawColor(186, 230, 253);
    doc.rect(margin, y, pageWidth - (margin * 2), 14, 'S');

    doc.setTextColor(12, 74, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text(`• Historical Rain Probability: ${data.weatherStats.rainProbabilityPct}% Risk`, margin + 4, y + 4.5);
    doc.text(`• Expected Wet Days: ${data.weatherStats.expectedRainDays} Days during scope`, margin + 4, y + 9.5);

    doc.text(`• Mud Drying Buffer: +${data.weatherStats.soilDryOutDays} Days (${data.weatherStats.soilTypeLabel})`, margin + 80, y + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 105, 161);
    doc.text(`• Weather-Adjusted Completion Date: ${data.weatherStats.formattedCompletionDate}`, margin + 80, y + 9.5);

    y += 18;
  }

  // Check if we need a second page for financial breakdown table
  if (y > pageHeight - 65) {
    doc.addPage();
    y = margin;
  }

  // 7. FINANCIAL COST BREAKDOWN TABLE
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PROJECT FINANCIAL COST BREAKDOWN SUMMARY', margin + 4, y + 4.8);

  y += 7;

  // Table Headers
  doc.setFillColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - (margin * 2), 5.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - (margin * 2), 5.5, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Cost Category', margin + 4, y + 3.8);
  doc.text('Project Allocation %', margin + 100, y + 3.8);
  doc.text('Estimated Cost ($)', pageWidth - margin - 4, y + 3.8, { align: 'right' });

  y += 5.5;

  const grandTotal = data.costBreakdown.grandTotalCost;
  data.costBreakdown.chartData.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, pageWidth - (margin * 2), 5.5, 'F');

    doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
    doc.line(margin, y + 5.5, pageWidth - margin, y + 5.5);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(item.category, margin + 4, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.text(`${item.percentage}%`, margin + 100, y + 3.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`$${item.cost.toLocaleString()}`, pageWidth - margin - 4, y + 3.8, { align: 'right' });

    y += 5.5;
  });

  // Grand Total Row
  doc.setFillColor(254, 243, 199); // amber-100
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'S');

  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('ESTIMATED GRAND TOTAL:', margin + 4, y + 4.8);
  doc.text(`$${grandTotal.toLocaleString()}`, pageWidth - margin - 4, y + 4.8, { align: 'right' });

  y += 12;

  // 8. SCHEDULE, PAYMENT METHOD & AUTHORIZATION FOOTER
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
  doc.roundedRect(margin, y, pageWidth - (margin * 2), 28, 2, 2, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('TIMELINE, PAYMENT METHOD & TERMS NOTICE:', margin + 4, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const durationText = data.weatherActive
    ? `${data.weatherStats.weatherAdjustedTotalDays} Calendar Days (~${data.weatherStats.weatherAdjustedWeeks} Weeks Total incl. Rain/Mud Buffer)`
    : `${data.totalProjectDays} Calendar Days (~${data.totalProjectWeeks} Weeks Base Earthwork)`;

  doc.text(`• Base Project Schedule: ${durationText}`, margin + 4, y + 8.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // green-800
  doc.text(`• PAYMENT METHOD: Strictly Direct ACH Bank Transfer / Direct Wire (NO Credit Cards Accepted).`, margin + 4, y + 12.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`  Bank: Synovus / F&M Bank • Routing #: 061100606 • Memo Ref: TJD-ACH-${(data.contactForm.clientName || 'CLIENT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)} • Remittance Email: info@tjdarleyconstruction.com`, margin + 4, y + 16.8);
  doc.text(`• Notice: Initial budget estimate based on GIS topographical modeling. Final contract following site walk.`, margin + 4, y + 20.8);
  doc.text(`• Remittance Email: info@tjdarleyconstruction.com • Office Helpline: (478) 808-7789`, margin + 4, y + 24.8);

  // Footer bar on bottom of page
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('T.J. Darley Construction, LLC • Phone: (478) 808-7789 • Serving Macon, Warner Robins, Greensboro & Atlanta, GA', pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Save the PDF file
  const fileName = `TJ_Darley_Estimate_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${proposalId}.pdf`;
  doc.save(fileName);
}
