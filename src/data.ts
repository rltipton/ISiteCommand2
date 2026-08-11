/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceDetail, Testimonial } from './types';
import siteDevImg from './assets/images/hero_excavation_1780832382386.png';
import siteGradingImg from './assets/images/site_grading_1780832397276.png';
import drainageSolutionsImg from './assets/images/drainage_solutions_1780832412382.png';

// Import newly generated high-fidelity residential assets
import tjdResClearing from './assets/images/tjd_res_clearing_1781114588192.png';
import tjdResPond from './assets/images/tjd_res_pond_1781114602276.png';

export const SERVICES_DATA: ServiceDetail[] = [
  {
    id: 'site_dev',
    title: 'Professional Site Development',
    description: 'Complete commercial, industrial, and municipal site prep from clearing to final padding.',
    longDescription: 'Since 2008, we have set the standard for Middle Georgia site development. We deploy high-precision machinery to turn raw acreage into engineered pad sites. Our crew coordinates clearing, stripping, and sub-base stabilizer layers to ensure a firm foundation for structural builders.',
    iconName: 'Building2',
    benefits: [
      'Comprehensive land clearing & grubbing',
      'Engineered building pad structural fill',
      'Precision sub-grade stabilization',
      'Close collaboration with design engineers & general contractors'
    ],
    image: siteDevImg,
    averageRatePerUnit: '$1.80 - $4.50'
  },
  {
    id: 'excavation_grading',
    title: 'Expert Excavation & Grading',
    description: 'Precision cut-and-fill services, foundation dig-outs, and heavy earthmoving.',
    longDescription: 'Equipped with GPS-guided grading kits on our heavy excavators and dozers, we move massive volumes of soil with surgical accuracy. We balance cut-and-fill needs on-site to minimize haul-away costs and deliver Grade-A results every time.',
    iconName: 'HardHat',
    benefits: [
      'GPS-guided heavy grading & leveling',
      'Cut & fill balance analysis to reduce hauling costs',
      'Foundation, basement, & utility trench digs',
      'Compaction testing preparation'
    ],
    image: siteGradingImg,
    averageRatePerUnit: '$2.50 - $6.00'
  },
  {
    id: 'drainage_solutions',
    title: 'Effective Drainage Solutions',
    description: 'Engineered stormwater infrastructure, French drains, and culverts.',
    longDescription: 'Georgia storms bring severe run-off pressures. We design and install durable drainage networks including storm sewer piping, catch basins, drop inlets, and french drains to redirect water safely away from valuable structures.',
    iconName: 'Droplets',
    benefits: [
      'Retention & detention pond construction',
      'Culvert & stormwater pipe install (HDPE/RCP)',
      'Sub-surface French drains & redirect routing',
      'Foundation moisture mitigation grading'
    ],
    image: drainageSolutionsImg,
    averageRatePerUnit: '$12.00 - $35.00'
  },
  {
    id: 'erosion_control',
    title: 'Erosion Control Specialists',
    description: 'Full GSWCC certified silt fencing, slope stabilization, and hydroseeding.',
    longDescription: 'We are certified erosion control specialists. We shield your jobsite from EPA fines and sediment run-off using premium silt fencing, check dams, rip-rap rock buffers, and heavy-duty turf reinforcement matting.',
    iconName: 'ShieldAlert',
    benefits: [
      'GSWCC certified erosion inspections & installations',
      'Commercial grade silt fencing & compost filter socks',
      'Slope stabilization rip-rap placement',
      'Hydroseeding & temporary straw cover seeding'
    ],
    image: 'https://picsum.photos/seed/erosion/800/600',
    averageRatePerUnit: '$0.80 - $2.20'
  }
];

export const RES_SERVICES_DATA: ServiceDetail[] = [
  {
    id: 'res_pond_digs',
    title: 'Private Pond & Dam Construction',
    description: 'Custom-dug private farm ponds, lakes, spillway engineering, and dam reinforcement.',
    longDescription: 'We shape your private acreage with recreational waterways that stand the test of time. Whether you need a brand-new wildlife fishing pond in Greensboro or a heavy-duty dam repair in Fort Valley, our certified operators utilize precise clay core compacting to guarantee stable, leakage-free holding banks.',
    iconName: 'Droplets',
    benefits: [
      'Engineered spillway & overflow pipe install',
      'Compacted clay core barrier sealing',
      'Regular pond muck cleanout & deepening',
      'Georgia Soil erosion compliance guarantee'
    ],
    image: tjdResPond,
    averageRatePerUnit: '$2.50 - $7.50'
  },
  {
    id: 'res_land_clearing',
    title: 'Forestry Mulching & Custom Clearing',
    description: 'Underbrush clear-outs, private hiking paths, surveyors trails, and wildlife food plots.',
    longDescription: 'Reclaim overgrown Southern terrain. We deploy high-torque forestry mulchers to grind thick sweetgum briars, small pine saplings, and invasive shrubs into a rich, organic woodchip bedding. This feeds your topsoil, eliminates costly burn piles, and prepares perfect tracts for wildlife hunting areas.',
    iconName: 'Building2',
    benefits: [
      'No messy debris piles or topsoil loss',
      'Perfect for fall game food plots & hunting paths',
      'Property line boundary clear-out',
      'Immediate, massive visual improvement'
    ],
    image: tjdResClearing,
    averageRatePerUnit: '$1.50 - $3.00'
  },
  {
    id: 'res_house_pads',
    title: 'Acreage House Pads & Lot Grading',
    description: 'Laser-leveled residential structural home pads, basement digs, and yard leveling.',
    longDescription: 'Prepare to frame your dream home on a rock-solid foundation. We excavate and level building pads with heavy-duty vibratory rollers so they meet rigid structural concrete limits. Our slope designs route rain runoff smoothly away from crawlspaces and siding.',
    iconName: 'HardHat',
    benefits: [
      'Compacted structural clay fill pads',
      'Laser-transit leveled for concrete crews',
      'Basement dig-outs & utility entry trenches',
      'Sloped lot rain diversion systems'
    ],
    image: siteGradingImg,
    averageRatePerUnit: '$2.00 - $5.50'
  },
  {
    id: 'res_gravel_roads',
    title: 'Gravel Driveways & Farm Roads',
    description: 'Durable granite aggregate driveway builds, crowning, drainage grading, and ditch culverts.',
    longDescription: 'Stop getting your trucks stuck in mud when the Georgia red clay gets wet. We build beautiful, high-compaction driveways and farm roads using local Georgia gravel, crusher run, or surge stone. We shape a high center crown so puddles drain into ditches instantly, stabilized with custom HDPE pipe culverts.',
    iconName: 'Truck',
    benefits: [
      'Heavy crusher run stone bases',
      'Elevated road crown profile to shed rainwater',
      'Heavy-duty highway grade culvert installs',
      'Erosion weed barrier fabrics overlay options'
    ],
    image: siteDevImg,
    averageRatePerUnit: '$15.00 - $38.00'
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't1',
    name: 'Marcus Vance',
    role: 'Vice President of Operations',
    company: 'Vance Development Group',
    location: 'Macon, GA',
    text: "TJ Darley Construction prepared over 15 acres of clay hillside for our new warehouse hub. Their precision, promptness, and mastery over grading kept the structural crews ahead of schedule. Truly Middle Georgia's best.",
    stars: 5,
    date: 'April 2026'
  },
  {
    id: 't2',
    name: 'Sarah Beverly',
    role: 'Assistant Engineering Director',
    company: 'Peach County Public Works',
    location: 'Fort Valley, GA',
    text: "For municipal drainage emergencies, we call TJ Darley. They resolved a multi-site erosion and runoff bottleneck on Peach Tree Rd that had plagued the county for years. Responsive and highly safety-minded.",
    stars: 5,
    date: 'January 2026'
  },
  {
    id: 't3',
    name: 'Jeremy Cole',
    role: 'General Contractor',
    company: 'Southern Builders LLC',
    location: 'Warner Robins, GA',
    text: "Reliable sub-contractors are rare. But TJ Darley brings unmatched safety compliance and top-tier earthmoving equipment to every one of our commercial pads. Competitive bids, neat paperwork, and honest people.",
    stars: 5,
    date: 'May 2026'
  }
];

export const RES_TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'rt1',
    name: 'Thomas & Becky Miller',
    role: 'Acreage Owners',
    location: 'Greensboro, GA',
    text: "TJ Darley cleared our 3-acre wooded slope at Lake Oconee and dug a stunning 1-acre private pond. They even built and compacted our cedar cabin house pad. Incredibly professional operator who took real pride in the dirt!",
    stars: 5,
    date: 'May 22, 2026'
  },
  {
    id: 'rt2',
    name: 'Cindy Albright',
    role: 'Landowner',
    location: 'Milledgeville, GA',
    text: "The forestry mulching TJ did in our back woods is magnificent. It completely eradicated thick sweetgum vines and briers without destroying our beautiful oaks and pines. Clean, fast, and no smoky burn piles!",
    stars: 5,
    date: 'March 11, 2026'
  },
  {
    id: 'rt3',
    name: 'Douglas Finch',
    role: 'Multi-Generation Farmer',
    location: 'Perry, GA',
    text: "Heavy torrential rains washed our access path away every winter. TJ dug deep storm drainage ditches, installed a sturdy culvert pipe, and crowned a gravel driveway. It's solid as a interstate highway now.",
    stars: 5,
    date: 'November 2025'
  }
];

export const FAQS = [
  {
    q: "Is TJ Darley Construction fully licensed and certified?",
    a: "Yes. We are fully licensed, general-liability insured, and GSWCC (Georgia Soil and Water Conservation Commission) certified for erosion control. Our entire operator staff is fully drug-screened and OSHA-compliant."
  },
  {
    q: "In what areas of Georgia do you operate?",
    a: "Based in Middle Georgia, we regularly complete site prep, excavation, and grading projects across Macon, Warner Robins, Perry, Fort Valley, Dublin, Milledgeville, Lake Oconee, Greensboro, and surrounding counties. We also evaluate larger commercial contracts state-wide."
  },
  {
    q: "What types of heavy equipment do you utilize?",
    a: "Our modern fleet includes low-ground-pressure GPS-guided excavators, finish-grading dozers, massive off-road dump trucks, sub-grade compactors, skid steers, and hydro-seeders. All equipment is strictly maintained for maximum jobsite reliability and zero down-time."
  },
  {
    q: "How do you handle competitive bids for commercial or municipal contracts?",
    a: "We welcome RFPs, bid packages, and digital engineered blueprints. Simply select 'Request Competitive Bid' on our estimator or call our office at 478-808-7789. We deliver detailed line-item bids conforming directly to spec."
  }
];

export const RES_FAQS = [
  {
    q: "Do you offer free property inspections in Middle Georgia?",
    a: "Absolutely. For residential clearing, ponds, driveways, or house pads, TJ will meet you directly at your property at Peach County, Lake Oconee, or Warner Robins to discuss site access, clay compacting, and provide an accurate cost-basis appraisal."
  },
  {
    q: "What gravel standard do you recommend for driveways?",
    a: "We highly recommend a solid 4-to-6-inch base of crusher run (crushed granite mixed with stone dust), which compacts into a hard cement-like surface over time. For heavy trucks, we can lay a heavy geotextile underlay first."
  },
  {
    q: "Is a permit required to construct custom private ponds?",
    a: "Normally, minor farm ponds under 1-acre that do not obstruct critical navigable streams require minimal regional notification or fall under agricultural exemptions. We coordinate buffer rules and erosion offsets so you stay completely compliant."
  }
];

export const TRUST_PARTNERS = [
  { name: "Warner Robins Commercial", role: "Developer" },
  { name: "Peach County Utilities", role: "Municipal Partner" },
  { name: "Macon Historic Renovation", role: "Contract Partner" },
  { name: "Southern Commercial Real Estate", role: "Land Planner" }
];
