/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  iconName: string;
  benefits: string[];
  image: string;
  averageRatePerUnit: string;
}

export interface EstimationInputs {
  serviceId: string;
  projectSize: number; // in square feet or acres
  unit: 'sq_ft' | 'acres';
  soilType: 'clay' | 'sand' | 'loam' | 'rocky';
  siteAccess: 'easy' | 'moderate' | 'difficult';
  includeDam?: boolean;
  untouchedSpring?: boolean;
}

export interface EstimationResult {
  estimatedCostMin: number;
  estimatedCostMax: number;
  excavationVolumeCuYds: number;
  timeframeWeeks: number;
  details: string[];
  depthFeet?: number;
}

export interface BidRequest {
  id: string;
  clientName: string;
  companyName?: string;
  email: string;
  phone: string;
  location: string;
  serviceId: string;
  projectSize: number;
  unit: 'sq_ft' | 'acres';
  projectDetails: string;
  status: 'Received' | 'Reviewing' | 'Scheduled';
  submittedAt: string;
  estimatedCostRange?: string;
  bestTimeToCall?: string;
  utilityDamageWaiver?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  location: string;
  text: string;
  stars: number;
  date: string;
}
