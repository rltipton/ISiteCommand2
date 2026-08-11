/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Estimator from './components/Estimator';
import BidForm from './components/BidForm';
import AutomationHub from './components/AutomationHub';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Careers from './components/Careers';
import FieldIntake from './components/FieldIntake';
import ClientFieldIntake from './components/ClientFieldIntake';
import Blog from './components/Blog';
import LatestUpdates from './components/LatestUpdates';
import MultiPhaseEstimator from './components/MultiPhaseEstimator';
import CrewClockIn from './components/CrewClockIn';
import CapabilitiesOverview from './components/CapabilitiesOverview';
import Finance from './components/Finance';
import TjdAiAssistantWidget from './components/TjdAiAssistantWidget';
import { ISiteCommandSplash } from './components/ISiteCommandSplash';
import ContractorRegistration from './components/ContractorRegistration';

export default function App() {
  // Global Division selection state: 'commercial' (Safety Orange) or 'residential' (Acreage Forest Green)
  const [division, setDivision] = useState<'commercial' | 'residential'>('residential');

  // Hash-based routing state to bypass WebStarts completely for Careers & Field Logs
  const [currentView, setCurrentView] = useState<'main' | 'careers' | 'field-intake' | 'client-intake' | 'blog' | 'multi-phase-bid' | 'clock-in' | 'capabilities' | 'finance' | 'isite-command' | 'contractor-signup'>('main');

  useEffect(() => {
    // Seed Oakwood Acreage Developers pre-bid intake if it doesn't exist
    try {
      const existing = localStorage.getItem('tjd_client_intakes');
      let parsed = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(parsed)) parsed = [];
      
      const hasOakwood = parsed.some((item: any) => 
        item.clientName === "Oakwood Acreage Developers" || 
        item.id === "FI-OAKWOOD-2026"
      );
      
      if (!hasOakwood) {
        const oakwoodIntake = {
          id: "FI-OAKWOOD-2026",
          fiId: "FI-1011",
          submittedAt: new Date().toLocaleDateString() + " 08:30 AM",
          clientName: "Oakwood Acreage Developers",
          jobName: "Oakwood Ridge Estate Pond & Dam",
          foreman: "TJ Darley",
          latitude: "33.483120",
          longitude: "-83.184950",
          gpsDms: "33°28'59\"N, 83°11'05\"W",
          gpsUtm: "17S 668720E 3706240N",
          gpsDdm: "33°28.98'N, 83°11.09'W",
          hasPhoto: true,
          formData: {
            meetingDate: new Date().toLocaleDateString(),
            meetingTime: "09:00 AM",
            foreman: "TJ Darley",
            clientName: "Oakwood Acreage Developers",
            phoneNumber: "706-555-0211",
            emailAddress: "bids@oakwooddev.com",
            mailingAddress: "200 Developers Row, Suite B",
            cityStateZip: "Atlanta, GA 30309",
            jobName: "Oakwood Ridge Estate Pond & Dam",
            jobNotes: "Pre-bid site survey for heavy excavation. Requires clearing, stripping, core keyway digging, and subsoil red clay compaction to construct a major 3.5-acre pond and protective embankment dam.",
            jobAddress: "1420 Oakwood Ridge Parkway",
            jobCityStateZip: "Greensboro, GA 30642",
            accessRoadType: "Moderate aggregate road",
            accessNotes: "Site accessed via existing gravel path. Good truck turnarounds, moderate slopes down to the creek bottom.",
            soilType: "clay",
            lengthFeet: "150",
            topWidthFeet: "16",
            bottomWidthFeet: "116",
            depthHeightFeet: "25",
            siteSlopePercent: "2.5%",
            clientWants: "Build a pristine 3.5-acre recreational farm pond and secure clay core earthen dam (150ft long, 25ft deep, with 16ft top and 116ft bottom widths). Keep subsoil clay tightly compacted.",
            specialConcerns: "Water filtration silt fencing must prevent runoffs into the adjacent creek basin.",
            budgetMentioned: "$125,000",
            timeline: "6-8 Weeks",
            areaSquareFeet: 152460
          }
        };
        parsed.unshift(oakwoodIntake);
        localStorage.setItem('tjd_client_intakes', JSON.stringify(parsed));
        // dispatch an event to let other components know the intakes have updated
        window.dispatchEvent(new Event('tjd_intakes_updated'));
      }
    } catch (e) {
      console.warn("Could not seed Oakwood pre-bid data", e);
    }

    const handleHashChange = () => {
      const hash = window.location.hash;
      const isAuth = sessionStorage.getItem('tjd_staff_authorized') === 'true';

      if (hash.startsWith('#careers')) {
        setCurrentView('careers');
      } else if (hash.startsWith('#capabilities')) {
        setCurrentView('capabilities');
      } else if (hash.startsWith('#finance')) {
        if (division === 'commercial') {
          window.location.hash = '';
          setCurrentView('main');
        } else {
          setCurrentView('finance');
        }
      } else if (hash.startsWith('#field-intake')) {
        if (!isAuth) {
          window.location.hash = '';
          setCurrentView('main');
          setTimeout(() => {
            window.dispatchEvent(new Event('tjd_trigger_staff_auth'));
          }, 150);
        } else {
          setCurrentView('field-intake');
        }
      } else if (hash.startsWith('#client-intake')) {
        if (!isAuth) {
          window.location.hash = '';
          setCurrentView('main');
          setTimeout(() => {
            window.dispatchEvent(new Event('tjd_trigger_staff_auth'));
          }, 150);
        } else {
          setCurrentView('client-intake');
        }
      } else if (hash.startsWith('#blog')) {
        if (!isAuth) {
          window.location.hash = '';
          setCurrentView('main');
          setTimeout(() => {
            window.dispatchEvent(new Event('tjd_trigger_staff_auth'));
          }, 150);
        } else {
          setCurrentView('blog');
        }
      } else if (hash.startsWith('#multi-phase-bid')) {
        if (!isAuth) {
          window.location.hash = '';
          setCurrentView('main');
          setTimeout(() => {
            window.dispatchEvent(new Event('tjd_trigger_staff_auth'));
          }, 150);
        } else {
          setCurrentView('multi-phase-bid');
        }
      } else if (hash.startsWith('#clock-in') || hash.startsWith('#clockin') || hash.startsWith('#crew-clockin')) {
        setCurrentView('clock-in');
      } else if (hash.startsWith('#isite') || hash.startsWith('#isite-command') || hash.startsWith('#splash')) {
        setCurrentView('isite-command');
      } else if (
        hash.startsWith('#contractor-signup') || 
        hash.startsWith('#contractor-registration') || 
        hash.startsWith('#signup') || 
        hash.startsWith('#contractor')
      ) {
        setCurrentView('contractor-signup');
      } else if (window.location.hostname.toLowerCase().includes('isite')) {
        // Automatically default to iSite Command Splash Landing Page when visiting isitecommand.com directly
        if (!hash || hash === '#' || hash === '#isite' || hash === '#isite-command') {
          setCurrentView('isite-command');
        } else {
          setCurrentView('main');
        }
      } else {
        setCurrentView('main');
      }
    };

    const handleAuthChange = () => {
      const isAuth = sessionStorage.getItem('tjd_staff_authorized') === 'true';
      if (!isAuth) {
        // Logged out - reset back to main view immediately if on a restricted view
        const hash = window.location.hash;
        if (
          hash.startsWith('#field-intake') || 
          hash.startsWith('#client-intake') || 
          hash.startsWith('#blog') || 
          hash.startsWith('#multi-phase-bid')
        ) {
          window.location.hash = '';
          setCurrentView('main');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('tjd_auth_change', handleAuthChange);
    handleHashChange(); // initial check

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('tjd_auth_change', handleAuthChange);
    };
  }, [division]);

  // Auto-redirect away from Finance view if user toggles to Commercial division
  useEffect(() => {
    if (division === 'commercial' && currentView === 'finance') {
      window.location.hash = '';
      setCurrentView('main');
    }
  }, [division, currentView]);

  const handleBackToHome = () => {
    window.location.hash = '';
    setCurrentView('main');
  };

  // Shared state to allow calculator ballpark computations to preheat the submission form
  const [preFillData, setPreFillData] = useState<{
    serviceId: string;
    projectSize: number;
    unit: 'sq_ft' | 'acres';
    estimatedRangeUrl?: string; // used to proxy raw string value
  } | null>(null);

  const handlePreFillContact = (
    serviceId: string, 
    size: number, 
    unit: 'sq_ft' | 'acres', 
    estimatedRangeUrl: string
  ) => {
    setPreFillData({
      serviceId,
      projectSize: size,
      unit,
      estimatedRangeUrl
    });
  };

  const clearPreFill = () => {
    setPreFillData(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none bg-slate-50 antialiased" id="tjd-construction-app">
      {/* 1. Header Navigation expressing High-Visibility Switcher or Acreage green toggle buttons */}
      <Header division={division} setDivision={setDivision} />

      <main className="flex-grow">
        {currentView === 'careers' ? (
          <Careers onBackToHome={handleBackToHome} />
        ) : currentView === 'capabilities' ? (
          <CapabilitiesOverview onBackToHome={handleBackToHome} />
        ) : currentView === 'finance' ? (
          <Finance onBackToHome={handleBackToHome} />
        ) : currentView === 'field-intake' ? (
          <FieldIntake onBackToHome={handleBackToHome} />
        ) : currentView === 'client-intake' ? (
          <ClientFieldIntake onBackToHome={handleBackToHome} />
        ) : currentView === 'blog' ? (
          <Blog onBackToHome={handleBackToHome} />
        ) : currentView === 'multi-phase-bid' ? (
          <MultiPhaseEstimator onBackToHome={handleBackToHome} />
        ) : currentView === 'clock-in' ? (
          <CrewClockIn onBackToHome={handleBackToHome} />
        ) : currentView === 'isite-command' ? (
          <ISiteCommandSplash onClose={handleBackToHome} />
        ) : currentView === 'contractor-signup' ? (
          <ContractorRegistration onBackToHome={handleBackToHome} />
        ) : (
          <>
            {/* 2. Cinematic Hero Landing presenting customized division backgrounds and core headlines */}
            <Hero division={division} setDivision={setDivision} />

            {/* 3. Operational Capacities / Dynamic Services toggled by Division selection */}
            <Services division={division} />

            {/* 4. Instant Earthwork & Ballpark Cost Estimator customized dynamically */}
            <Estimator onPreFillContact={handlePreFillContact} division={division} />

            {/* 5. Booking Bid Request Center & Interactive Local Submission Tracker */}
            <BidForm preFillData={preFillData} clearPreFill={clearPreFill} division={division} />

            {/* 5.25. Dedicated Cloud Automation Hub: Field GPS Employee Clock-In and live OneDrive Spreadsheet Synchronizer */}
            <AutomationHub />

            {/* 5.75. Live Operational Log & Native Site-Prep Learning Blog */}
            <LatestUpdates />

            {/* 6. Peer Testimonials, Municipal/Acreage Affiliation Badges, & regional FAQ database */}
            <Testimonials division={division} />
          </>
        )}
      </main>

      {/* 7. Footer showing operating schedules, location grids & explicit final CTA */}
      <Footer />

      {/* Floating T.J. Darley AI Assistant Widget */}
      <TjdAiAssistantWidget />
    </div>
  );
}
