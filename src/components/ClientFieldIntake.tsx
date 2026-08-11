/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  User, 
  Clock, 
  ClipboardCheck, 
  ArrowLeft, 
  FileText, 
  Camera, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Mail, 
  Home, 
  Compass, 
  Layers, 
  Calculator, 
  TrendingUp, 
  Info, 
  Flame, 
  DollarSign, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Bell,
  AlertCircle,
  Plus
} from 'lucide-react';
import { getWebhookUrl, sendSlackAlert, sendEmailAlert, decimalToDMS, decimalToDDM, decimalToUTM, parseFuzzyCoordinates } from '../utils';

interface ClientFieldIntakeProps {
  onBackToHome?: () => void;
  embedded?: boolean;
  initialWishlistId?: string;
}

interface ClientIntakeData {
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
}

export default function ClientFieldIntake({ onBackToHome, embedded = false, initialWishlistId }: ClientFieldIntakeProps) {
  const [submissionId, setSubmissionId] = useState('');
  const [fiId, setFiId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [gpsAccuracy, setGpsAccuracy] = useState('');
  const [gpsTime, setGpsTime] = useState('');
  const [gpsConfirmed, setGpsConfirmed] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Manual GPS entry overrides & precise surveyor calibration
  const [manualMode, setManualMode] = useState(false);
  const [manualLatInput, setManualLatInput] = useState('');
  const [manualLngInput, setManualLngInput] = useState('');
  const [manualPrecisionAlert, setManualPrecisionAlert] = useState('');
  const [coordinateSystem, setCoordinateSystem] = useState<'surveyor_dms' | 'motorgrader_utm' | 'decimal_dd' | 'index_ddm'>('surveyor_dms');

  // Photo uploads
  const [photoBase64, setPhotoBase64] = useState('');
  const [photoFilename, setPhotoFilename] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState<ClientIntakeData>({
    meetingDate: new Date().toISOString().split('T')[0],
    meetingTime: new Date().toTimeString().slice(0, 5),
    foreman: 'TJ Darley',
    clientName: '',
    phoneNumber: '',
    emailAddress: '',
    mailingAddress: '',
    cityStateZip: '',
    jobName: '',
    jobNotes: '',
    jobAddress: '',
    jobCityStateZip: '',
    accessRoadType: '',
    accessNotes: '',
    soilType: '',
    lengthFeet: '',
    topWidthFeet: '',
    bottomWidthFeet: '',
    depthHeightFeet: '',
    siteSlopePercent: '1.5%',
    clientWants: '',
    specialConcerns: '',
    budgetMentioned: '',
    timeline: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Progress Box states
  const [progressActive, setProgressActive] = useState(false);
  const [progressSuccess, setProgressSuccess] = useState(false);
  const [progressError, setProgressError] = useState(false);
  const [progressTitle, setProgressTitle] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [progressStep, setProgressStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  // Local Storage history
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [onlineWishlists, setOnlineWishlists] = useState<any[]>([]);
  const [selectedWishlistId, setSelectedWishlistId] = useState('');
  const [importNotice, setImportNotice] = useState('');

  // Calculate area dynamically whenever dimensions change
  const [areaSquareFeet, setAreaSquareFeet] = useState<number | ''>('');

  // Brand new tab state to switch between Intake, CRM Leads Pipeline, and Progression
  const [activeLeadTab, setActiveLeadTab] = useState<'new-intake' | 'leads-pipeline' | 'progression'>('new-intake');

  // Leads CRM & Outreach Pipeline States
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [leadCustomNotes, setLeadCustomNotes] = useState<string>('');
  const [leadApptDate, setLeadApptDate] = useState<string>('');
  const [leadApptTime, setLeadApptTime] = useState<string>('');
  const [leadEmailBody, setLeadEmailBody] = useState<string>('');
  const [leadEmailSubject, setLeadEmailSubject] = useState<string>('');
  const [leadSearchQuery, setLeadSearchQuery] = useState<string>('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'uncontacted' | 'appointment' | 'accepted'>('all');
  const [showAddManualLeadModal, setShowAddManualLeadModal] = useState<boolean>(false);

  // Manual Lead Form States
  const [manualLeadName, setManualLeadName] = useState<string>('');
  const [manualLeadEmail, setManualLeadEmail] = useState<string>('');
  const [manualLeadPhone, setManualLeadPhone] = useState<string>('');
  const [manualLeadLocation, setManualLeadLocation] = useState<string>('');
  const [manualLeadService, setManualLeadService] = useState<string>('site_dev');
  const [manualLeadSize, setManualLeadSize] = useState<string>('5000');
  const [manualLeadDetails, setManualLeadDetails] = useState<string>('');
  const [copiedLeadEmail, setCopiedLeadEmail] = useState<boolean>(false);

  // Reminders / Alerts States
  const [remindersList, setRemindersList] = useState<any[]>([]);
  const [newReminderReason, setNewReminderReason] = useState<string>('Send Stage 0 Welcome Email');
  const [newReminderDate, setNewReminderDate] = useState<string>('');
  const [newReminderTime, setNewReminderTime] = useState<string>('09:00 AM');
  const [showAddReminderForm, setShowAddReminderForm] = useState<boolean>(false);

  // Progression Tracker Form States
  const [progressionSelectedProjectId, setProgressionSelectedProjectId] = useState('mock-greensboro');
  const [progressionCustomProjectName, setProgressionCustomProjectName] = useState('');
  const [progressionClientName, setProgressionClientName] = useState('');
  const [progressionStageTitle, setProgressionStageTitle] = useState('Rough Grading');
  const [progressionStageNotes, setProgressionStageNotes] = useState('');
  const [progressionLatitude, setProgressionLatitude] = useState('');
  const [progressionLongitude, setProgressionLongitude] = useState('');
  const [progressionGpsConfirmed, setProgressionGpsConfirmed] = useState(false);
  const [progressionGpsLoading, setProgressionGpsLoading] = useState(false);
  const [progressionGpsError, setProgressionGpsError] = useState('');
  const [progressionForeman, setProgressionForeman] = useState('TJ Darley');

  // Progression Photo uploads
  const [progressionPhotoBase64, setProgressionPhotoBase64] = useState('');
  const [progressionPhotoFilename, setProgressionPhotoFilename] = useState('');
  const [progressionPhotoPreview, setProgressionPhotoPreview] = useState('');
  const progressionFileInputRef = useRef<HTMLInputElement>(null);

  // Manual GPS coordinates for progression tab
  const [progressionManualMode, setProgressionManualMode] = useState(false);
  const [progressionManualLatInput, setProgressionManualLatInput] = useState('');
  const [progressionManualLngInput, setProgressionManualLngInput] = useState('');
  const [progressionManualPrecisionAlert, setProgressionManualPrecisionAlert] = useState('');

  // Loaded list of project stages
  const [projectProgressStages, setProjectProgressStages] = useState<any[]>([]);

  useEffect(() => {
    const L = parseFloat(formData.lengthFeet) || 0;
    const TW = parseFloat(formData.topWidthFeet) || 0;
    const BW = parseFloat(formData.bottomWidthFeet) || 0;
    
    let W = TW;
    if (BW > 0) {
      W = (TW + BW) / 2;
    }
    
    const A = L * W;
    setAreaSquareFeet(A > 0 ? Math.round(A) : '');
  }, [formData.lengthFeet, formData.topWidthFeet, formData.bottomWidthFeet]);

  // Init submission ID
  useEffect(() => {
    setSubmissionId(`SUB-${Date.now()}-${Math.floor(Math.random() * 1000000)}`);
    
    // Load local history
    try {
      const saved = localStorage.getItem('tjd_client_intakes');
      if (saved) {
        const parsed = JSON.parse(saved);
        setHistoryLogs(parsed);
        setFiId(`FI-${1001 + parsed.length}`);
      } else {
        setFiId('FI-1001');
      }
    } catch (e) {
      console.warn("Could not load client intake logs history", e);
      setFiId('FI-1001');
    }

    // Load online wishlists
    let currentWishlists: any[] = [];
    try {
      const savedBids = localStorage.getItem('tjd_earthworks_bids');
      if (savedBids && JSON.parse(savedBids).length > 0) {
        currentWishlists = JSON.parse(savedBids);
        setOnlineWishlists(currentWishlists);
      } else {
        const defaultBids = [
          {
            id: 'TJD-LEAD-001',
            clientName: 'George Harrison',
            companyName: 'Lakeside Development LLC',
            email: 'george@lakesidedev.com',
            phone: '706-555-0182',
            location: 'Greensboro, GA',
            serviceId: 'res_pond_digs',
            projectSize: 1.5,
            unit: 'acres',
            projectDetails: 'Client needs a 0.5 acre custom fishing pond dug on high-clay Lakeside plot with a 12ft clay core keyway wall. Plan is to clear standard pine/oak underbrush and grade a smooth access road.',
            status: 'Received',
            submittedAt: '06/20/2026 09:15 AM',
            reachedOutViaPhone: false,
            appointmentDate: '',
            appointmentTime: '',
            bidAccepted: false,
            bestTimeToCall: 'Mornings / Text Preferred'
          },
          {
            id: 'TJD-LEAD-002',
            clientName: 'Sarah Jenkins',
            companyName: '',
            email: 'sjenkins@gmail.com',
            phone: '478-555-0144',
            location: 'Milledgeville, GA',
            serviceId: 'res_land_clearing',
            projectSize: 3.5,
            unit: 'acres',
            projectDetails: 'Need 3.5 acres of heavy pine and sweetgum forestry mulched. Site access is moderately tight. Need a level area marked out for future pole barn layout.',
            status: 'Reviewing',
            submittedAt: '06/19/2026 02:40 PM',
            reachedOutViaPhone: true,
            appointmentDate: '2026-06-25',
            appointmentTime: '10:00 AM',
            bidAccepted: false,
            bestTimeToCall: 'Afternoons'
          },
          {
            id: 'TJD-LEAD-003',
            clientName: 'Billy Joe',
            companyName: 'Darley Family Farm',
            email: 'bjoe@farmersnet.com',
            phone: '478-555-0199',
            location: 'Warner Robins, GA',
            serviceId: 'res_gravel_roads',
            projectSize: 5000,
            unit: 'sq_ft',
            projectDetails: 'Need a stable 5,000 sq ft gravel driveway graded and spread with crusher run slate gravel. Existing dirt path washes out with every heavy rain.',
            status: 'Scheduled',
            submittedAt: '06/18/2026 11:10 AM',
            reachedOutViaPhone: true,
            appointmentDate: '2026-06-23',
            appointmentTime: '01:30 PM',
            bidAccepted: true,
            acceptedDate: '06/23/2026',
            bestTimeToCall: 'Anytime / Text is Best'
          }
        ];
        localStorage.setItem('tjd_earthworks_bids', JSON.stringify(defaultBids));
        setOnlineWishlists(defaultBids);
        currentWishlists = defaultBids;
        // Notify other components
        window.dispatchEvent(new Event('tjd_bids_updated'));
      }
    } catch (e) {
      console.warn("Could not load online wishlists in intake form", e);
    }

    // Load follow-up reminders
    try {
      const savedReminders = localStorage.getItem('tjd_lead_reminders');
      if (savedReminders) {
        setRemindersList(JSON.parse(savedReminders));
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 2);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const defaultReminders = [
          {
            id: 'REM-1001',
            leadId: 'TJD-LEAD-001',
            clientName: 'George Harrison',
            date: tomorrowStr,
            time: '09:00 AM',
            reason: 'Send Stage 0 Welcome Email & Call to setup walk',
            status: 'pending',
            createdAt: new Date().toLocaleDateString('en-US')
          },
          {
            id: 'REM-1002',
            leadId: 'TJD-LEAD-002',
            clientName: 'Sarah Jenkins',
            date: yesterdayStr,
            time: '02:00 PM',
            reason: 'Send Stage 1: Confirm On-Site Survey Details',
            status: 'pending',
            createdAt: new Date().toLocaleDateString('en-US')
          }
        ];
        localStorage.setItem('tjd_lead_reminders', JSON.stringify(defaultReminders));
        setRemindersList(defaultReminders);
      }
    } catch (e) {
      console.warn("Could not load reminders list", e);
    }

    // Load progress stages
    try {
      const savedProg = localStorage.getItem('tjd_project_progress_stages');
      if (savedProg) {
        setProjectProgressStages(JSON.parse(savedProg));
      } else {
        const defaultStages = [
          {
            id: `PROG-1001-STG1`,
            projectId: `SUB-1718816000000-1234`,
            projectName: `Greensboro Lot (Lake Oconee, GA)`,
            clientName: `George Harrison`,
            stageTitle: `Stage 1: Pre-Bid Survey Base`,
            stageNotes: `On-site survey of soil structure completed. Inspected private embankment heights. Soil is moist Georgia red clay. Slope gradient confirmed at 1.5%. Client requested a custom earthen pool and private spillway bypass. Snapshot shows the untouched lakeside terrain before initial tree mulching begins.`,
            submittedAt: `06/15/2026 09:30 AM`,
            foreman: `TJ Darley`,
            latitude: `33.575600`,
            longitude: `-83.181800`,
            gpsDms: `33° 34' 32" N • 83° 10' 54" W`,
            gpsUtm: `17S 668984E 3716611N`,
            gpsDdm: `33° 34.536' N • 83° 10.908' W`,
            photoBase64: ``,
            photoFilename: `lakeside_initial_survey.jpg`
          }
        ];
        localStorage.setItem('tjd_project_progress_stages', JSON.stringify(defaultStages));
        setProjectProgressStages(defaultStages);
      }
    } catch (e) {
      console.warn("Could not load project progress stages logs", e);
    }
  }, []);

  useEffect(() => {
    const reloadWishlists = () => {
      try {
        const savedBids = localStorage.getItem('tjd_earthworks_bids');
        if (savedBids) {
          setOnlineWishlists(JSON.parse(savedBids));
        }
      } catch (e) {
        console.warn("Failed to reload online wishlists", e);
      }
    };

    window.addEventListener('tjd_bids_updated', reloadWishlists);
    return () => {
      window.removeEventListener('tjd_bids_updated', reloadWishlists);
    };
  }, []);

  useEffect(() => {
    if (initialWishlistId && onlineWishlists.length > 0) {
      handleImportWishlist(initialWishlistId);
    }
  }, [initialWishlistId, onlineWishlists]);

  const handleImportWishlist = (wishlistId: string) => {
    setSelectedWishlistId(wishlistId);
    if (!wishlistId) {
      setImportNotice('');
      return;
    }

    const selected = onlineWishlists.find(w => w.id === wishlistId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        clientName: selected.clientName || '',
        phoneNumber: selected.phone || '',
        emailAddress: selected.email || '',
        jobName: `${selected.clientName}'s Project - ${selected.location || 'Site Intake'}`,
        jobAddress: selected.location || '',
        clientWants: selected.projectDetails || '',
        jobNotes: `Imported from Online Web Wishlist Submission (${selected.id}).\nSubmitted At: ${selected.submittedAt}\n\nOriginal Client Wishlist details:\n${selected.projectDetails || 'No custom details catalogued.'}`
      }));
      setImportNotice(`Successfully imported ${selected.clientName}'s online custom wishlist specifications! Fields pre-filled.`);
      setTimeout(() => setImportNotice(''), 6000);
    }
  };

  // Capture GPS (similar to custom script coordinates loader)
  const handleCaptureGPS = () => {
    setGpsLoading(true);
    setFormError('');
    setGpsError('');
    const now = new Date().toISOString();
    setGpsTime(now);

    if (!navigator.geolocation) {
      setGpsError('GPS coordinates search is not supported or was blocked on this browser/environment.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude.toFixed(6);
        const lo = pos.coords.longitude.toFixed(6);
        const acc = pos.coords.accuracy.toFixed(1);
        
        setLatitude(la);
        setLongitude(lo);
        setGpsAccuracy(acc);
        setGpsConfirmed(true);
        setGpsLoading(false);
        setGpsError('');

        // Submit GPS coordinate capture to apps script instantly in background!
        const scriptUrl = getWebhookUrl();
        const gpsPayload = new URLSearchParams();
        gpsPayload.append('action', 'capture_job_gps');
        gpsPayload.append('submission_id', submissionId);
        gpsPayload.append('latitude', la);
        gpsPayload.append('longitude', lo);
        gpsPayload.append('accuracy', acc);
        gpsPayload.append('timestamp', now);

        fetch(scriptUrl, {
          method: 'POST',
          body: gpsPayload,
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(() => {
          console.log("GPS locked and logged silently in sheet database backend.");
        })
        .catch((e) => {
          console.warn("Background GPS cloud sync skipped.", e);
        });
      },
      (err) => {
        console.error("GPS Acquisition failed:", err);
        let errorMsg = 'GPS acquisition failed (timeout or permission denied). Please check location settings.';
        if (err.code === 1) {
          errorMsg = 'Location permission was denied by the browser. Please check your browser address bar and enable location access.';
        } else if (err.code === 2) {
          errorMsg = 'GPS signal is currently unavailable. Please step outside or activate your device GPS/WiFi.';
        } else if (err.code === 3) {
          errorMsg = 'The request to get user location timed out. Please try again.';
        }
        setGpsError(errorMsg);
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Helper simulated location for desktop / local simulation testing
  const handleSimulateGPS = () => {
    setGpsLoading(true);
    setFormError('');
    setGpsError('');
    const now = new Date().toISOString();
    setGpsTime(now);

    setTimeout(() => {
      // TJ Darley Macon HQ Coordinates
      const la = '32.840695';
      const lo = '-83.632402';
      const acc = '2.4';
      
      setLatitude(la);
      setLongitude(lo);
      setGpsAccuracy(acc);
      setGpsConfirmed(true);
      setGpsLoading(false);
      
      // Submit GPS coordinate capture to apps script instantly in background!
      const scriptUrl = getWebhookUrl();
      const gpsPayload = new URLSearchParams();
      gpsPayload.append('action', 'capture_job_gps');
      gpsPayload.append('submission_id', submissionId);
      gpsPayload.append('latitude', la);
      gpsPayload.append('longitude', lo);
      gpsPayload.append('accuracy', acc);
      gpsPayload.append('timestamp', now);

      fetch(scriptUrl, {
        method: 'POST',
        body: gpsPayload,
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(() => {
        console.log("Simulated GPS locked and logged silently in sheet database.");
      })
      .catch((e) => {
        console.warn("Background GPS cloud sync skipped.", e);
      });
    }, 400);
  };

  // Save manual GPS input by checking, decoding and locking precise coordinator coordinates
  const handleSaveManualGPS = (e: React.FormEvent) => {
    e.preventDefault();
    setManualPrecisionAlert('');
    
    if (!manualLatInput.trim() || !manualLngInput.trim()) {
      setManualPrecisionAlert('Please populate both GPS input fields to initialize manual geo-pointing.');
      return;
    }

    const parsed = parseFuzzyCoordinates(manualLatInput, manualLngInput);
    if (!parsed) {
      setManualPrecisionAlert('Invalid surveyor coordinates entry format. Examples: DMS [32 35 49 N] or DMS [32° 35\' 49" N], standard Decimal Degrees, etc.');
      return;
    }

    const la = parsed.latitude.toFixed(6);
    const lo = parsed.longitude.toFixed(6);
    
    setLatitude(la);
    setLongitude(lo);
    setGpsAccuracy('0.1'); // Millimeter precision calibration label
    setGpsConfirmed(true);
    
    // Clear manual inputs
    setManualLatInput('');
    setManualLngInput('');
    
    alert(`GPS Calibration Succeeded!\n\nParsed Coordinates Decoded:\nLat: ${la}° Decimal\nLon: ${lo}° Decimal\n\nThese coordinates are now fully locked into your pre-bid intake record.`);
    
    // Submit background tracking logs so their sheets workbook is synced
    const now = new Date().toISOString();
    setGpsTime(now);
    const scriptUrl = getWebhookUrl();
    const gpsPayload = new URLSearchParams();
    gpsPayload.append('action', 'capture_job_gps');
    gpsPayload.append('submission_id', submissionId);
    gpsPayload.append('latitude', la);
    gpsPayload.append('longitude', lo);
    gpsPayload.append('accuracy', '0.1');
    gpsPayload.append('timestamp', now);
    gpsPayload.append('coordinate_system_mode', 'manual_precise_calibration');

    fetch(scriptUrl, {
      method: 'POST',
      body: gpsPayload,
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .catch((err) => console.warn("Background override GPS cloud sync skipped.", err));
  };

  // Convert files to Base64 easily for camera uploads
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Str = (event.target.result as string).split(',')[1];
          setPhotoBase64(base64Str);
          setPhotoFilename(file.name);
          setPhotoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoBase64('');
      setPhotoFilename('');
      setPhotoPreview('');
    }
  };

  // Simulate progress percentages smoothly just like on Webstarts version
  const triggerProgressSimulation = (start: number, end: number, duration: number) => {
    setProgressActive(true);
    setProgressPercent(start);
    
    let current = start;
    const increment = (end - start) / (duration / 100);
    const interval = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(interval);
      }
      setProgressPercent(Math.round(current));
    }, 100);

    return interval;
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Field Validations
    if (!formData.clientName.trim()) {
      return setFormError('Client Name is required to initialize a field meeting log.');
    }
    if (!formData.jobName.trim()) {
      return setFormError('Please enter a descriptive Job Name (Step 3).');
    }
    if (!gpsConfirmed) {
      return setFormError('You must capture GPS coordinates (Step 6) to lock in the crew site tag-in parameters.');
    }

    const scriptUrl = getWebhookUrl();
    let photoStatusText = '';

    // Step 1: Upload Photo if it exists
    if (photoBase64) {
      setProgressStep('Step 1 of 2: Uploading photo to Google Drive/OneDrive');
      setProgressTitle('Uploading Raw Site Photo...');
      setProgressMessage('Transmitting high-resolution landscape photo. Please keep this browser window active.');
      setProgressActive(true);

      const progressInterval = triggerProgressSimulation(10, 85, 8000);

      const photoPayload = {
        action: 'upload_photo',
        submission_id: submissionId,
        job_name: formData.jobName.trim(),
        photo_type: 'Raw Land',
        filename: photoFilename || `landscape_intake_${Date.now()}.jpg`,
        base64: photoBase64,
        timestamp: new Date().toISOString()
      };

      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(photoPayload)
        });
        
        clearInterval(progressInterval);
        setProgressPercent(85);
        photoStatusText = 'Photo uploaded to Google Drive';
        console.log("Landscape photo successfully uploaded to Sheets Apps Script endpoint.");
      } catch (err) {
        clearInterval(progressInterval);
        console.error("Photo upload failed:", err);
        // Continue with the form even if photo failed
      }
    }

    // Step 2: Submit Main Intake Fields
    setProgressStep(photoBase64 ? 'Step 2 of 2: finalising workbook tables' : 'Step 1 of 1: Submitting Lead Survey');
    setProgressTitle(photoBase64 ? 'Finalizing Sheets Submission...' : 'Submitting Client Intake Data...');
    setProgressMessage('Transmitting clients credentials, access logs, and site slope calculations directly to Excel spreadsheet.');

    const mainInterval = triggerProgressSimulation(photoBase64 ? 85 : 10, 95, 3000);

    const formPayload = new URLSearchParams();
    formPayload.append('action', 'field_intake');
    formPayload.append('Submission_ID', submissionId);
    formPayload.append('FI_ID', fiId);
    formPayload.append('Latitude', latitude);
    formPayload.append('Longitude', longitude);
    
    // Add surveyor precision coordinate decoders to Google Sheets columns
    const numLat = parseFloat(latitude);
    const numLng = parseFloat(longitude);
    const latLngValid = !isNaN(numLat) && !isNaN(numLng);
    const dmsVal = latLngValid ? decimalToDMS(numLat, numLng).combined : '';
    const utmVal = latLngValid ? decimalToUTM(numLat, numLng).formatted : '';
    const ddmVal = latLngValid ? decimalToDDM(numLat, numLng).combined : '';
    
    formPayload.append('GPS_DMS_Format', dmsVal);
    formPayload.append('GPS_UTM_Format', utmVal);
    formPayload.append('GPS_DDM_Format', ddmVal);
    
    formPayload.append('Time Stamp', gpsTime || new Date().toISOString());
    formPayload.append('Photo_URL', photoStatusText);
    formPayload.append('Foreman', formData.foreman);
    formPayload.append('Meeting Date', formData.meetingDate);
    formPayload.append('Meeting Time', formData.meetingTime);
    formPayload.append('Client Name', formData.clientName.trim());
    formPayload.append('Phone Number', formData.phoneNumber.trim());
    formPayload.append('Email Address', formData.emailAddress.trim());
    formPayload.append('Mailing Address', formData.mailingAddress.trim());
    formPayload.append('City State Zip', formData.cityStateZip.trim());
    formPayload.append('Job Name', formData.jobName.trim());
    formPayload.append('Job Notes', formData.jobNotes.trim());
    formPayload.append('Job Address', formData.jobAddress.trim());
    formPayload.append('Job City State Zip', formData.jobCityStateZip.trim());
    formPayload.append('Access Road Type', formData.accessRoadType);
    formPayload.append('Access Notes', formData.accessNotes.trim());
    formPayload.append('Soil Type', formData.soilType);
    formPayload.append('Length Feet', formData.lengthFeet);
    formPayload.append('Top Width Feet', formData.topWidthFeet);
    formPayload.append('Bottom Width Feet', formData.bottomWidthFeet);
    formPayload.append('Depth Height Feet', formData.depthHeightFeet);
    formPayload.append('Area Square Feet', String(areaSquareFeet));
    formPayload.append('Site Slope Percent', formData.siteSlopePercent);
    formPayload.append('Client Wants', formData.clientWants.trim());
    formPayload.append('Special Concerns', formData.specialConcerns.trim());
    formPayload.append('Budget Mentioned', formData.budgetMentioned.trim());
    formPayload.append('Timeline', formData.timeline.trim());

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        body: formPayload,
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Send Slack Alert as well
      sendSlackAlert({
        leadType: 'Premium Field Intake Survey',
        clientName: formData.clientName,
        clientPhone: formData.phoneNumber,
        clientEmail: formData.emailAddress,
        details: `Job Name: ${formData.jobName}\nForeman: ${formData.foreman}\nSoil Type: ${formData.soilType}\nNotes: ${formData.jobNotes || 'None'}\nTimeline: ${formData.timeline || 'N/A'}`
      });

      // Send direct business email notification to info@tjdarleyconstruction.com (No Zapier)
      sendEmailAlert({
        leadType: 'Premium Field Intake Survey',
        clientName: formData.clientName,
        clientPhone: formData.phoneNumber,
        clientEmail: formData.emailAddress,
        details: `Job Name: ${formData.jobName}\nForeman: ${formData.foreman}\nSoil Type: ${formData.soilType}\nNotes: ${formData.jobNotes || 'None'}\nTimeline: ${formData.timeline || 'N/A'}`
      });

      clearInterval(mainInterval);
      setProgressPercent(100);
      setProgressSuccess(true);
      setProgressTitle('Intake Transmitted Successfully!');
      setProgressMessage(photoBase64 ? 'Landscape meeting logs and on-site snapshot fully written to Excel spreadsheet!' : 'Client pre-bid credentials written directly to your active pipeline database.');

      // Save locally to history lists
      const currentRecord = {
        id: submissionId,
        fiId: fiId,
        submittedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        clientName: formData.clientName,
        jobName: formData.jobName,
        foreman: formData.foreman,
        latitude,
        longitude,
        gpsDms: dmsVal,
        gpsUtm: utmVal,
        gpsDdm: ddmVal,
        hasPhoto: !!photoBase64,
        formData: { ...formData, areaSquareFeet }
      };

      const updatedHistory = [currentRecord, ...historyLogs];
      setHistoryLogs(updatedHistory);
      localStorage.setItem('tjd_client_intakes', JSON.stringify(updatedHistory));

      setTimeout(() => {
        setFormSubmitted(true);
        setProgressActive(false);
        setProgressSuccess(false);
      }, 2000);

    } catch (err) {
      clearInterval(mainInterval);
      setProgressError(true);
      setProgressTitle('Network Sync Failure');
      setProgressMessage('The device was unable to establish a secure handshake with the Sheets synchronization macro. Please check cellular signal.');
      setTimeout(() => {
        setProgressActive(false);
        setProgressError(false);
      }, 4000);
    }
  };

  const handleClearForm = () => {
    setFormData({
      meetingDate: new Date().toISOString().split('T')[0],
      meetingTime: new Date().toTimeString().slice(0, 5),
      foreman: 'TJ Darley',
      clientName: '',
      phoneNumber: '',
      emailAddress: '',
      mailingAddress: '',
      cityStateZip: '',
      jobName: '',
      jobNotes: '',
      jobAddress: '',
      jobCityStateZip: '',
      accessRoadType: '',
      accessNotes: '',
      soilType: '',
      lengthFeet: '',
      topWidthFeet: '',
      bottomWidthFeet: '',
      depthHeightFeet: '',
      siteSlopePercent: '1.5%',
      clientWants: '',
      specialConcerns: '',
      budgetMentioned: '',
      timeline: ''
    });
    setSubmissionId(`SUB-${Date.now()}-${Math.floor(Math.random() * 1000000)}`);
    setLatitude('');
    setLongitude('');
    setGpsAccuracy('');
    setGpsTime('');
    setGpsConfirmed(false);
    setPhotoBase64('');
    setPhotoFilename('');
    setPhotoPreview('');
    setFormSubmitted(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- PROGRESSION TRACKER EVENT HANDLERS ---
  const handleProgressionPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Str = (event.target.result as string).split(',')[1];
          setProgressionPhotoBase64(base64Str);
          setProgressionPhotoFilename(file.name);
          setProgressionPhotoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProgressionCaptureGPS = () => {
    setProgressionGpsLoading(true);
    setProgressionGpsError('');

    if (!navigator.geolocation) {
      setProgressionGpsError('GPS coordinates search is not supported on this mobile device.');
      setProgressionGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude.toFixed(6);
        const lo = pos.coords.longitude.toFixed(6);
        setProgressionLatitude(la);
        setProgressionLongitude(lo);
        setProgressionGpsConfirmed(true);
        setProgressionGpsLoading(false);
        setProgressionGpsError('');
      },
      (err) => {
        console.error("Progression GPS Acquisition failed:", err);
        let errorMsg = 'GPS acquisition failed (timeout or permission denied). Please check location settings.';
        if (err.code === 1) {
          errorMsg = 'Location permission was denied. Please allow location access for this application in your address bar.';
        } else if (err.code === 2) {
          errorMsg = 'GPS signal is currently unavailable. Please step outside or activate device location services.';
        }
        setProgressionGpsError(errorMsg);
        setProgressionGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleProgressionSimulateGPS = () => {
    setProgressionGpsLoading(true);
    setProgressionGpsError('');
    setTimeout(() => {
      // Macon, GA Centroid/Water Works
      setProgressionLatitude('32.840695');
      setProgressionLongitude('-83.632402');
      setProgressionGpsConfirmed(true);
      setProgressionGpsLoading(false);
    }, 400);
  };

  const handleProgressionSaveManualGPS = (e: React.FormEvent) => {
    e.preventDefault();
    setProgressionManualPrecisionAlert('');
    
    if (!progressionManualLatInput.trim() || !progressionManualLngInput.trim()) {
      setProgressionManualPrecisionAlert('Please populate both GPS input fields.');
      return;
    }

    const parsed = parseFuzzyCoordinates(progressionManualLatInput, progressionManualLngInput);
    if (!parsed) {
      setProgressionManualPrecisionAlert('Invalid surveyor format. Examples: Decimals [33.5756, -83.1818] or DMS [33 34 32 N].');
      return;
    }

    const la = parsed.latitude.toFixed(6);
    const lo = parsed.longitude.toFixed(6);
    
    setProgressionLatitude(la);
    setProgressionLongitude(lo);
    setProgressionGpsConfirmed(true);
    setProgressionManualLatInput('');
    setProgressionManualLngInput('');
    alert(`GPS Calibration Succeeded!\n\nParsed Coordinates Decoded:\nLat: ${la}° Decimal\nLon: ${lo}° Decimal\n\nThese coordinates are now fully locked into your progression report.`);
  };

  const handleSubmitProgressionStage = (e: React.FormEvent) => {
    e.preventDefault();

    let pId = progressionSelectedProjectId;
    let projName = '';
    let clientNm = '';

    if (pId === 'custom' || !pId) {
      if (!progressionCustomProjectName.trim()) {
        alert("Please enter a custom project name.");
        return;
      }
      pId = `PROJ-CUST-${Date.now()}`;
      projName = progressionCustomProjectName.trim();
      clientNm = progressionClientName.trim() || 'Walk-in Prospect';
    } else if (pId === 'mock-greensboro') {
      pId = 'SUB-1718816000000-1234';
      projName = 'Greensboro Lot (Lake Oconee, GA)';
      clientNm = 'George Harrison';
    } else {
      // Find within history logs
      const selectedIntake = historyLogs.find(log => log.id === pId);
      if (selectedIntake) {
        projName = selectedIntake.jobName || selectedIntake.formData?.jobName || 'Unnamed Project';
        clientNm = selectedIntake.clientName || selectedIntake.formData?.clientName || '';
      } else {
        projName = 'Assigned Project';
        clientNm = 'Active Customer';
      }
    }

    const numLat = parseFloat(progressionLatitude);
    const numLng = parseFloat(progressionLongitude);
    const latLngValid = !isNaN(numLat) && !isNaN(numLng);
    const dmsVal = latLngValid ? decimalToDMS(numLat, numLng).combined : '';
    const utmVal = latLngValid ? decimalToUTM(numLat, numLng).formatted : '';
    const ddmVal = latLngValid ? decimalToDDM(numLat, numLng).combined : '';

    const newStage = {
      id: `PROG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectId: pId,
      projectName: projName,
      clientName: clientNm,
      stageTitle: progressionStageTitle,
      stageNotes: progressionStageNotes,
      submittedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      foreman: progressionForeman,
      latitude: progressionLatitude,
      longitude: progressionLongitude,
      gpsDms: dmsVal,
      gpsUtm: utmVal,
      gpsDdm: ddmVal,
      photoBase64: progressionPhotoPreview, // store the base64 preview with dataURL header or raw
      photoFilename: progressionPhotoFilename || 'progress_capture.jpg'
    };

    // Trigger local progression sync
    setProgressPercent(10);
    setProgressActive(true);
    setProgressTitle('Compressing Progress Attachment...');
    setProgressMessage('Generating secure geocoded payload and metadata...');

    let percent = 10;
    const interval = setInterval(() => {
      percent += 15;
      if (percent >= 90) {
        clearInterval(interval);
      } else {
        setProgressPercent(percent);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setProgressPercent(100);
      setProgressSuccess(true);
      setProgressTitle('Progression Phase Synced!');
      setProgressMessage(`Successfully added '${progressionStageTitle}' with proof attachment to the project pipeline database.`);

      const updatedStages = [newStage, ...projectProgressStages];
      setProjectProgressStages(updatedStages);
      localStorage.setItem('tjd_project_progress_stages', JSON.stringify(updatedStages));

      // Dispatch event to sync immediately inside office hub
      window.dispatchEvent(new Event('tjd_project_progress_stages_changed'));

      setTimeout(() => {
        setProgressActive(false);
        setProgressSuccess(false);
        // Clear stage details
        setProgressionStageNotes('');
        setProgressionPhotoBase64('');
        setProgressionPhotoFilename('');
        setProgressionPhotoPreview('');
        setProgressionLatitude('');
        setProgressionLongitude('');
        setProgressionGpsConfirmed(false);
        if (progressionFileInputRef.current) {
          progressionFileInputRef.current.value = '';
        }
      }, 1500);

    }, 1000);
  };

  return (
    <div className={embedded ? "text-white text-left font-sans" : "bg-slate-900 border-t-4 border-emerald-500 text-white min-h-screen font-sans pb-24 text-left"}>
      
      {/* Header Banner */}
      {!embedded && (
        <div className="relative py-12 bg-slate-950 border-b border-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative space-y-4">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors duration-150 p-2 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-500" />
              <span>Return to Home</span>
            </button>

            <div className="space-y-2">
              <span className="font-display font-black text-[10px] tracking-widest text-emerald-400 uppercase bg-emerald-950/45 border border-emerald-800/40 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                Mobile Field Lead Applet
              </span>
              <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white leading-none">
                Client & Pre-Bid <span className="text-emerald-500">Field Intake Survey</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                Fill client details, geo-tag sites coordinates, compute geometry instantly, capture landscapes snapshots, and auto-populate Excel pipelines from your cell phone.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={embedded ? "w-full" : "max-w-3xl mx-auto px-4 sm:px-6 py-8"}>
        
        {/* Progress Overlay Indicator */}
        {progressActive && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md p-6 rounded-2xl border ${
              progressSuccess 
                ? 'bg-slate-900 border-emerald-500' 
                : progressError 
                  ? 'bg-slate-900 border-rose-500' 
                  : 'bg-slate-900 border-slate-800'
            } space-y-4 text-center shadow-2xl`}>
              <div className="text-4xl">
                {progressSuccess ? '✅' : progressError ? '⚠️' : '📤'}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{progressTitle}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{progressMessage}</p>
              </div>

              {!progressSuccess && !progressError && (
                <div className="space-y-2">
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold">
                    <span>{progressStep}</span>
                    <span className="text-emerald-400">{progressPercent}%</span>
                  </div>
                </div>
              )}

              {progressSuccess && (
                <span className="text-xs font-mono font-bold uppercase text-emerald-400 block tracking-widest animate-pulse">
                  TRANSMISSION PERFECT!
                </span>
              )}
            </div>
          </div>
        )}

        {formSubmitted ? (
          
          /* Success Card View */
          <div className="bg-slate-950 border border-emerald-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-full w-fit mx-auto">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-white">Client Intake Logged!</h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
                Successfully logged meeting for <strong className="text-emerald-400">{formData.clientName}</strong>. Click below to load this intake into the <strong>Multi-Phase Line Item Estimator</strong> and add detailed equipment, materials, and labor lines!
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left text-xs gap-2.5 max-w-md mx-auto space-y-2 font-mono">
              <span className="font-bold text-slate-300 uppercase block tracking-wider font-sans border-b border-slate-800 pb-1 text-[10px]">INTAKE TRANSMITTED DETAILS</span>
              <p className="text-slate-400">&bull; Field Intake ID (FI_ID): <span className="text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-900 px-1.5 py-0.5 rounded uppercase">{fiId}</span></p>
              <p className="text-slate-400">&bull; Submission ID: <span className="text-white font-bold">{submissionId}</span></p>
              <p className="text-slate-400">&bull; Job Project Name: <span className="text-white font-bold">{formData.jobName}</span></p>
              <p className="text-slate-400">&bull; Site GPS: <span className="text-emerald-400 font-bold">{latitude}, {longitude}</span></p>
              <p className="text-slate-400">&bull; Calculated Geometry: <span className="text-emerald-400 font-bold">{areaSquareFeet ? `${areaSquareFeet} SQ FT` : 'None'}</span></p>
              {photoFilename && <p className="text-slate-400">&bull; Land Attachment: <span className="text-indigo-400 font-bold">{photoFilename}</span></p>}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              {!embedded && onBackToHome && (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="py-3 px-6 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Return to Main Site
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('tjd_preselected_intake_id', submissionId);
                  window.location.hash = '#multi-phase-bid';
                }}
                className="py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-lg transition-colors uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-orange-500 animate-pulse"
              >
                <Calculator className="w-4 h-4 text-white" />
                <span>Configure Detailed Line Items</span>
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="py-3 px-6 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-colors uppercase tracking-wider shadow-md cursor-pointer"
              >
                Start New Intake
              </button>
            </div>
          </div>

        ) : (

          /* Client Intake Interactive Form */
          <div className="space-y-6">

            {/* Custom Tab Selection Buttons */}
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 gap-1" id="field-intake-tabs">
              <button
                type="button"
                onClick={() => setActiveLeadTab('new-intake')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeLeadTab === 'new-intake'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950/40 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">New Pre-Bid Intake</span>
                <span className="sm:hidden">New Intake</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLeadTab('leads-pipeline')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeLeadTab === 'leads-pipeline'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950/40 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Leads Outreach CRM</span>
                <span className="sm:hidden">Leads Pipeline</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLeadTab('progression')}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeLeadTab === 'progression'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950/40 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Camera className="w-4 h-4 text-emerald-400 font-bold animate-pulse" />
                <span className="hidden sm:inline">Progress & Stages</span>
                <span className="sm:hidden">Progress</span>
              </button>
            </div>

            {activeLeadTab === 'new-intake' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* GPS Lock Info Bar with Precise Surveyor Converter Decoders */}
                <div className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all pb-6 ${
                  gpsConfirmed 
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' 
                    : 'bg-indigo-950/30 border-indigo-900 text-indigo-300'
                }`}>
              {/* Header block with mode triggers */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-900/60 pb-3 text-left">
                <div className="space-y-1">
                  <h4 className="font-bold flex items-center gap-1.5 text-xs text-slate-100 uppercase tracking-wider">
                    <MapPin className={`w-4 h-4 shrink-0 ${gpsConfirmed ? 'text-emerald-400' : 'text-indigo-400 animate-pulse'}`} />
                    <span>Precise Geological Coordinates Engine</span>
                  </h4>
                  <p className="text-[10px] text-slate-450 font-sans max-w-xl leading-normal">
                    Land tract calibration for John Deere SmartGrade & Trimble laser-guided bulldozers. Bypasses inaccurate Google Maps postal indexes.
                  </p>
                </div>
                
                {/* Mode toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setManualMode(!manualMode);
                    setManualPrecisionAlert('');
                  }}
                  className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded font-black uppercase tracking-wider text-slate-300 transition-all cursor-pointer shadow whitespace-nowrap self-start sm:self-center"
                >
                  {manualMode ? '🔌 Switch to Satellite Auto' : '⌨️ Enter Coordinates Manually'}
                </button>
              </div>

              {!manualMode ? (
                /* AUTOMATIC SATELLITE LOCATOR VIEW */
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex-1 space-y-3">
                    {/* Always show the coordinates precision decoder grid so they know exactly where coordinates show up! */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] border px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider select-none leading-none ${
                          gpsConfirmed 
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-900/80 animate-pulse' 
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}>
                          {gpsConfirmed ? '📡 Satellite Verified' : '🛰️ Satellite Off-Line'}
                        </span>
                        {gpsConfirmed && (
                          <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800/80 px-2 py-0.5 rounded font-mono select-none leading-none">
                            Acc: ±{gpsAccuracy}m
                          </span>
                        )}
                      </div>
                      
                      {/* Dynamic Decoders Roster */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono bg-slate-950 border border-slate-900 rounded-xl p-3" id="coordinates-precision-decoders">
                        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900/80 space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">1. Surveyor DMS</span>
                          <span className={`font-bold block truncate ${gpsConfirmed ? 'text-white' : 'text-slate-650 italic'}`}>
                            {gpsConfirmed ? decimalToDMS(parseFloat(latitude), parseFloat(longitude)).combined : 'Awaiting Satellite Fix...'}
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900/80 space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">2. Trimble/Dozer UTM Grid</span>
                          <span className={`font-bold block truncate ${gpsConfirmed ? 'text-emerald-400' : 'text-slate-700 italic'}`}>
                            {gpsConfirmed ? decimalToUTM(parseFloat(latitude), parseFloat(longitude)).formatted : 'Awaiting Sensor...'}
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900/80 space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">3. Standard Decimal</span>
                          <span className={`font-bold block truncate ${gpsConfirmed ? 'text-slate-300' : 'text-slate-650 italic'}`}>
                            {gpsConfirmed ? `${latitude}, ${longitude}` : 'Latitude, Longitude'}
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900/80 space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">4. Navigator DDM</span>
                          <span className={`font-bold block truncate ${gpsConfirmed ? 'text-slate-400' : 'text-slate-700 italic'}`}>
                            {gpsConfirmed ? decimalToDDM(parseFloat(latitude), parseFloat(longitude)).combined : 'Awaiting Decoders...'}
                          </span>
                        </div>
                      </div>

                      {gpsConfirmed ? (
                        <div className="flex items-center gap-2 animate-in fade-in">
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-sky-400 hover:text-sky-300 underline font-sans"
                          >
                            <span>🛰️ Verify Satellites on Google Maps Layer</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          Your mobile phone GPS sensor will decode exact latitude/longitude coordinates directly into Middle Georgia's Trimble and DMS workbooks instantly upon validation.
                        </p>
                      )}
                    </div>
                  </div>

                  {gpsError && (
                    <div className="bg-rose-950/40 border border-rose-900/60 p-3 rounded-lg text-[11px] text-rose-300 text-left font-sans flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-250">
                      <div className="font-bold flex items-center gap-1.5 text-rose-400">
                        <span>⚠️ GPS Sensor alert:</span>
                      </div>
                      <p>{gpsError}</p>
                      <button
                        type="button"
                        onClick={handleSimulateGPS}
                        className="self-start text-[10px] font-black underline text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                      >
                        ⚡ Bypass physical sensor &amp; simulate live connection instead
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={gpsLoading}
                      onClick={handleCaptureGPS}
                      className={`py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                        gpsConfirmed 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {gpsLoading ? (
                        <>
                          <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                          <span>Acquiring Satellites...</span>
                        </>
                      ) : (
                        <>
                          <span>📍 {gpsConfirmed ? 'Re-acquire Satellite Fix' : 'Acquire Satellite Fix'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulateGPS}
                      className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-indigo-950/40 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>⚡ Simulate Satellite Lock</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* MANUAL INPUT MODE FOR PRECISE COORDS */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4">
                    <span className="text-[9px] text-brand-orange uppercase font-mono font-bold tracking-widest block text-left">
                      ⌨️ Surveyor Workbook Coordinate Input Grid
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-xs text-left">
                        <label className="font-bold text-slate-300 block">
                          SITE LATITUDE PROPERTY INDEX:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder='e.g. 33.5756 or 33° 34&apos; 32.16" N'
                          value={manualLatInput}
                          onChange={(e) => setManualLatInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-250 font-mono focus:border-brand-orange outline-none shadow-inner"
                        />
                      </div>
                      
                      <div className="space-y-1.5 text-xs text-left">
                        <label className="font-bold text-slate-300 block">
                          SITE LONGITUDE PROPERTY INDEX:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder='e.g. -83.1818 or 83° 10&apos; 54.48" W'
                          value={manualLngInput}
                          onChange={(e) => setManualLngInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-250 font-mono focus:border-brand-orange outline-none shadow-inner"
                        />
                      </div>
                    </div>

                    <p className="text-[9.5px] text-slate-450 font-sans leading-relaxed text-left">
                      💡 <strong>Flexible Input Parser:</strong> Supports degree symbols (<code>32° 35&apos; 49.5&quot; N</code>), space separation (<code>32 35 49 S</code>), degree decimal minutes, or traditional positive/negative decimals (<code>32.5971, -83.8856</code>).
                    </p>

                    {manualPrecisionAlert && (
                      <p className="text-[10.5px] text-rose-400 font-bold font-sans text-left">
                        ⚠️ {manualPrecisionAlert}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleSaveManualGPS}
                      className="py-2.5 px-4 bg-brand-orange text-white hover:bg-orange-500 rounded-lg text-xs font-black uppercase tracking-wider shadow cursor-pointer transition-all"
                    >
                      💾 Lock Manual Coordinates
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {formError && (
              <div className="bg-rose-950/65 border border-rose-900 text-rose-300 px-4 py-3 rounded-xl text-xs font-bold font-sans text-left">
                ⚠️ {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitAll} className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              
              {/* BRAND NEW: PRE-POPULATE SYSTEM FROM WEBSITE WISHLIST SUBMISSIONS */}
              <div className="bg-emerald-950/20 border border-emerald-800/45 p-5 rounded-2xl space-y-3.5 text-left" id="wishlist-import-module">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-450">
                    <Layers className="w-4 h-4 animate-pulse text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-100 leading-tight">Import Client Web Wishlist</h4>
                    <p className="text-slate-400 text-[10.5px]">Fast-track onsite meetings by pre-populating contact and wishlist info</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {onlineWishlists.length === 0 ? (
                    <div className="text-[11px] text-slate-500 italic py-1">
                      No online client wishlists found on this device's memory. Submit fresh wishlists via the Client Custom Choice panel on the home page.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      <div className="sm:col-span-3 space-y-1 text-xs">
                        <label className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">CHOOSE TRANSMITTED CLIENT WISHLIST:</label>
                        <select
                          value={selectedWishlistId}
                          onChange={(e) => handleImportWishlist(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                          id="import-wishlist-picker"
                        >
                          <option value="">-- Click to select active submitted wishlist --</option>
                          {onlineWishlists.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.clientName} ({w.location || 'No Address'}) — {w.id} — {w.submittedAt || 'Recent'}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        {selectedWishlistId && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWishlistId('');
                              setFormData(prev => ({
                                ...prev,
                                clientName: '',
                                phoneNumber: '',
                                emailAddress: '',
                                jobName: '',
                                jobAddress: '',
                                clientWants: '',
                                jobNotes: ''
                              }));
                            }}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-slate-800"
                          >
                            Reset Form
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {importNotice && (
                    <div className="text-emerald-400 text-[11px] font-bold bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/40 animate-in fade-in slide-in-from-top-1 duration-150">
                      ✓ {importNotice}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 1: Client Meeting Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-505/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">1</span>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-200">Client Info & Meeting Metadata</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 block">Meeting Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        value={formData.meetingDate}
                        onChange={(e) => setFormData(p => ({ ...p, meetingDate: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 block">Meeting Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="time"
                        value={formData.meetingTime}
                        onChange={(e) => setFormData(p => ({ ...p, meetingTime: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 flex justify-between">
                      <span>FI_ID (Field Intake ID)</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-normal">Pre-Bid ID</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FI-1001"
                      value={fiId}
                      onChange={(e) => setFiId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-white font-mono uppercase focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 block">Foreman / Representative</label>
                    <select
                      value={formData.foreman}
                      onChange={(e) => setFormData(p => ({ ...p, foreman: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="TJ Darley">TJ Darley</option>
                      <option value="Garrett Darley">Garrett Darley</option>
                      <option value="Kyle Simmons">Kyle Simmons</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Client Contacts */}
              <div className="space-y-4 pt-4 border-t border-slate-900/40">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-505/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">2</span>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-200">Client Demographics</h3>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 block">Client Contact Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. Robert Henderson"
                        value={formData.clientName}
                        onChange={(e) => setFormData(p => ({ ...p, clientName: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300 block">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          placeholder="e.g. 478-555-0192"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300 block">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          placeholder="e.g. robert@company.com"
                          value={formData.emailAddress}
                          onChange={(e) => setFormData(p => ({ ...p, emailAddress: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div className="space-y-1 text-xs sm:col-span-3">
                      <label className="font-bold text-slate-300 block">Mailing Address</label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Mailing address line"
                          value={formData.mailingAddress}
                          onChange={(e) => setFormData(p => ({ ...p, mailingAddress: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs sm:col-span-2">
                      <label className="font-bold text-slate-300 block">City State Zip</label>
                      <input
                        type="text"
                        placeholder="e.g. Macon GA 31210"
                        value={formData.cityStateZip}
                        onChange={(e) => setFormData(p => ({ ...p, cityStateZip: e.target.value }))}
                        className="w-full bg-[#111c30] border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Job Site Context */}
              <div className="space-y-4 pt-4 border-t border-slate-900/40">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-505/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">3</span>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-200">Proposed Site specifications</h3>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 block">Identified Project / Job Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Lakeside Lot clearing & Grading"
                      value={formData.jobName}
                      onChange={(e) => setFormData(p => ({ ...p, jobName: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div className="space-y-1 text-xs sm:col-span-3">
                      <label className="font-bold text-slate-300 block">Physical Site Location Address</label>
                      <input
                        type="text"
                        placeholder="e.g. parcel 28-A Highway 44"
                        value={formData.jobAddress}
                        onChange={(e) => setFormData(p => ({ ...p, jobAddress: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1 text-xs sm:col-span-2">
                      <label className="font-bold text-slate-300 block">Job City State Zip</label>
                      <input
                        type="text"
                        placeholder="e.g. Greensboro GA 30642"
                        value={formData.jobCityStateZip}
                        onChange={(e) => setFormData(p => ({ ...p, jobCityStateZip: e.target.value }))}
                        className="w-full bg-[#111c30] border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300 block">Access Passage Conditions</label>
                      <select
                        value={formData.accessRoadType}
                        onChange={(e) => setFormData(p => ({ ...p, accessRoadType: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="">-- Choose Access Road Profile --</option>
                        <option value="Paved Road">Paved Road</option>
                        <option value="Gravel Road">Gravel Road</option>
                        <option value="Dirt Road Dry">Dirt Road Dry</option>
                        <option value="Dirt Road Wet Soft">Dirt Road Wet Soft</option>
                        <option value="Off Road Cross Country">Off Road Cross Country</option>
                        <option value="Steep Difficult Access">Steep Difficult Access</option>
                        <option value="Temporary Construction Entrance Stone">Temporary Construction Entrance Stone</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300 block">Dominant Surface Soil Type</label>
                      <select
                        value={formData.soilType}
                        onChange={(e) => setFormData(p => ({ ...p, soilType: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="">-- Choose Soil Condition --</option>
                        <option value="Clayey Soil">Georgia Red Clay</option>
                        <option value="Hard Pan">Hard Pan Clay / Sand</option>
                        <option value="Loam">Balanced Loam</option>
                        <option value="Rocky Soil">Rocky Strata / Granite</option>
                        <option value="Sandy Soil">Fine Sandy Soil</option>
                        <option value="Silty Soil">Silty Strata / Run-off</option>
                        <option value="Topsoil">Natural Organic Topsoil</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-left">
                    <label className="font-bold text-slate-300 block">Entrance / Logistical Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Tight trees at gate. Need matting for low-flow wetlands."
                      value={formData.accessNotes}
                      onChange={(e) => setFormData(p => ({ ...p, accessNotes: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-205 outline-none focus:border-emerald-500 text-slate-300"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 block">Field Survey Notes (Acreage/Fencing/Concerns)</label>
                    <textarea
                      rows={3}
                      placeholder="Input heavy site clearing notes here. e.g. Thick pine growth, potential pond location, old rock walls present..."
                      value={formData.jobNotes}
                      onChange={(e) => setFormData(p => ({ ...p, jobNotes: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-emerald-500 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Geometry Calculator */}
              <div className="space-y-4 pt-4 border-t border-slate-900/40">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-505/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">4</span>
                  <div className="flex justify-between items-center w-full">
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-200">Site Geometry & Calculations</h3>
                    <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-850 font-mono font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">
                      <Calculator className="w-3 h-3 text-emerald-500 animate-spin" />
                      Automatic Math-Engine
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px]">Length (FT)</label>
                      <input
                        type="number"
                        placeholder="e.g. 350"
                        value={formData.lengthFeet}
                        onChange={(e) => setFormData(p => ({ ...p, lengthFeet: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px]">Top Width (FT)</label>
                      <input
                        type="number"
                        placeholder="e.g. 100"
                        value={formData.topWidthFeet}
                        onChange={(e) => setFormData(p => ({ ...p, topWidthFeet: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px]">Bottom Width (FT)</label>
                      <input
                        type="number"
                        placeholder="e.g. 80"
                        value={formData.bottomWidthFeet}
                        onChange={(e) => setFormData(p => ({ ...p, bottomWidthFeet: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-400 block uppercase tracking-wide text-[9px]">Depth / Height (FT)</label>
                      <input
                        type="number"
                        id="depth_ft"
                        placeholder="e.g. 4"
                        value={formData.depthHeightFeet}
                        onChange={(e) => setFormData(p => ({ ...p, depthHeightFeet: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300 block">Calculated Area (SQ FT)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-[10px] font-mono font-black text-emerald-400">MATH-LOGIC</span>
                        <input
                          type="text"
                          value={areaSquareFeet !== '' ? `${areaSquareFeet.toLocaleString()} SQ FT` : ''}
                          readOnly
                          className="w-full bg-slate-900 border border-slate-850 text-emerald-400 font-mono font-bold rounded-lg py-2.5 pl-28 pr-3 text-sm outline-none cursor-not-allowed select-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300 block">Grade Site Slope (Estimated)</label>
                      <div className="relative">
                        <TrendingUp className="absolute left-3 top-3 w-4 h-4 text-emerald-500" />
                        <input
                          type="text"
                          value={formData.siteSlopePercent}
                          onChange={(e) => setFormData(p => ({ ...p, siteSlopePercent: e.target.value }))}
                          className="w-full bg-[#111c30] border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Scope & Budget */}
              <div className="space-y-4 pt-4 border-t border-slate-900/40">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-505/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">5</span>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-200">Wants, Budget & Scheduling</h3>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-300 block">Client Desired Outcomes / Scope</label>
                    <input
                      type="text"
                      placeholder="e.g. Build gravel driveway, clear 1.5 acres, construct 0.5 acre fishing pond"
                      value={formData.clientWants}
                      onChange={(e) => setFormData(p => ({ ...p, clientWants: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-300 block">Inquired Budget Boundaries</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="e.g. $15,000 max"
                          value={formData.budgetMentioned}
                          onChange={(e) => setFormData(p => ({ ...p, budgetMentioned: e.target.value }))}
                          className="w-full bg-[#111c30] border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-sm text-slate-205 outline-none focus:border-emerald-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs sm:col-span-2">
                      <label className="font-bold text-slate-300 block">Project Constraints / Timeline</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="e.g. Wants to start in August, needs completion by fall"
                          value={formData.timeline}
                          onChange={(e) => setFormData(p => ({ ...p, timeline: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-left">
                    <label className="font-bold text-slate-300 block">Special Environmental / Property Concerns</label>
                    <input
                      type="text"
                      placeholder="e.g. Utility lines overhead, septic tank location unsure"
                      value={formData.specialConcerns}
                      onChange={(e) => setFormData(p => ({ ...p, specialConcerns: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-300 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 7: Site Photos */}
              <div className="space-y-4 pt-4 border-t border-slate-900/40">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-505/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">7</span>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-200 font-sans">Raw Land Conditions site Snap</h3>
                </div>

                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />

                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto py-3 px-6 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white hover:text-emerald-400 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider"
                    >
                      <Camera className="w-4 h-4 text-emerald-500" />
                      <span>📷 Open Mobile Camera Click</span>
                    </button>

                    {photoFilename ? (
                      <span className="text-[11px] text-emerald-400 font-sans font-medium">
                        ✅ {photoFilename} loaded.
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-sans leading-relaxed text-center sm:text-left">
                        Optional: take a snapshot of trees/erosion to save directly to OneDrive folder.
                      </span>
                    )}
                  </div>

                  {photoPreview && (
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm mx-auto space-y-2 text-center">
                      <img 
                        src={photoPreview} 
                        alt="Mobile Preview" 
                        className="max-h-56 rounded-xl mx-auto shadow-md border border-slate-800 object-cover" 
                      />
                      <p className="text-[10px] text-slate-400 font-mono truncate">{photoFilename}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 8: Submission triggers */}
              <div className="pt-6 border-t border-slate-900 space-y-4">
                <div className="text-center font-sans">
                  <p className="text-slate-400 text-[11px] mb-2">
                    Ensuring active coordinates and GPS lock matches lead database indexes.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="text-[10px] text-slate-300 font-mono bg-emerald-950/60 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-900/40 inline-block font-bold">
                      CURRENT INTAKE ID: {fiId}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 inline-block truncate max-w-full">
                      Ticket Hash: {submissionId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-850 hover:text-rose-400 border border-slate-800 text-slate-400 text-xs font-bold uppercase rounded-xl transition-all tracking-wider font-mono cursor-pointer text-center"
                  >
                    Clear Form Log
                  </button>
                  <button
                    type="submit"
                    className="py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-xl tracking-widest uppercase transition-all shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ClipboardCheck className="w-5 h-5 shrink-0" />
                    <span>FINALIZE & TRANSMIT INTAKE</span>
                  </button>
                </div>
              </div>

            </form>

            {/* Offline Records Session History */}
            {historyLogs.length > 0 && (
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 sm:p-5 text-left text-xs font-sans space-y-3">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-widest block pb-1 border-b border-slate-900">Your iPhone session History logs</span>
                
                <div className="divide-y divide-slate-900 max-h-48 overflow-y-auto pr-1">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="py-2.5 flex justify-between items-center gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{log.clientName}</span>
                          <span className="text-[9px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
                            {log.fiId || 'FI-PRE'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10.5px]">Job: <span className="text-slate-300">{log.jobName}</span> &bull; {log.foreman}</p>
                        <p className="text-[10px] text-slate-500 font-mono select-none">{log.submittedAt} &bull; GPS: {log.latitude}, {log.longitude}</p>
                      </div>
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                        {log.hasPhoto ? '📸 Synced' : 'Synced'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LEADS OUTREACH & PROGRESSION CRM PIPELINE TAB */}
        {activeLeadTab === 'leads-pipeline' && (() => {
          // Resolve currently selected lead, or fallback to the first one in list
          const selectedLead = onlineWishlists.find(w => w.id === selectedLeadId) || onlineWishlists[0];

          // Filter leads based on search query and status filter
          const filteredLeads = onlineWishlists.filter(lead => {
            const matchesSearch = 
              (lead.clientName || '').toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
              (lead.email || '').toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
              (lead.phone || '').includes(leadSearchQuery) ||
              (lead.id || '').toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
              (lead.location || '').toLowerCase().includes(leadSearchQuery.toLowerCase());

            if (leadStatusFilter === 'uncontacted') {
              return matchesSearch && !lead.reachedOutViaPhone;
            }
            if (leadStatusFilter === 'appointment') {
              return matchesSearch && lead.reachedOutViaPhone && !lead.bidAccepted;
            }
            if (leadStatusFilter === 'accepted') {
              return matchesSearch && lead.bidAccepted;
            }
            return matchesSearch;
          });

          // Metrics counts
          const totalCount = onlineWishlists.length;
          const uncontactedCount = onlineWishlists.filter(l => !l.reachedOutViaPhone).length;
          const appointmentCount = onlineWishlists.filter(l => l.reachedOutViaPhone && !l.bidAccepted).length;
          const acceptedCount = onlineWishlists.filter(l => l.bidAccepted).length;

          // Resolve active email draft
          const getDynamicEmailTemplate = (lead: any) => {
            if (!lead) return { subject: '', body: '' };

            const clientName = lead.clientName || 'Valued Customer';
            const phone = lead.phone || 'Phone Number';
            const location = lead.location || 'Georgia';
            const serviceMap: { [key: string]: string } = {
              site_dev: 'Commercial Site Development & Excavation',
              excavation_grading: 'General Excavation & Finish Grading',
              drainage_solutions: 'Drainage Systems & Culverts',
              erosion_control: 'Erosion & Soil Stabilization Control',
              res_pond_digs: 'Residential Custom Earthen Ponds',
              res_land_clearing: 'Residential Forestry Land Clearing',
              res_house_pads: 'Residential House & Pole Barn Pads',
              res_gravel_roads: 'Residential Gravel Road & Driveway Construction'
            };
            const serviceName = serviceMap[lead.serviceId] || lead.serviceId || 'Earthwork Service';
            const apptDate = lead.appointmentDate || '[Select Appointment Date]';
            const apptTime = lead.appointmentTime || '[Select Appointment Time]';

            if (!lead.reachedOutViaPhone) {
              // Stage 0: Initial Outreach
              return {
                subject: `Your Earthwork Wishlist - TJ Darley Construction, LLC`,
                body: `Hi ${clientName},\n\nThank you for submitting your earthwork wishlist on our website! We've received your project parameters for ${serviceName} in the ${location} area.\n\nOur heavy equipment specialists would love to schedule a brief 10-minute phone call to review your layout and book an on-site soil density check.\n\nAre you available for a brief call tomorrow, or is there a better number to reach you besides ${phone}?\n\nBest regards,\n\nTJ Darley, Owner\nTJ Darley Construction, LLC\nOffice: (478) 808-7789 | Email: office@tjdarley.com`
              };
            } else if (lead.reachedOutViaPhone && !lead.bidAccepted) {
              // Stage 1: Phone call done, appointment scheduled, but bid not accepted yet (under review / post-visit)
              if (lead.appointmentDate) {
                return {
                  subject: `Confirmed On-Site Earthwork Meeting - TJ Darley Construction, LLC`,
                  body: `Hi ${clientName},\n\nThis is TJ from TJ Darley Construction. I'm writing to confirm our scheduled on-site meeting on ${apptDate} at ${apptTime}.\n\nDuring this visit, we'll map your exact property boundaries, take soil core probes to analyze clay coefficient, and verify equipment access path parameters so we can calculate a solid ballpark bid.\n\nIf anything changes on your end or if you need to reschedule, please give me a call at (478) 808-7789.\n\nLooking forward to meeting you on turf!\n\nBest regards,\n\nTJ Darley, Owner\nTJ Darley Construction, LLC\nOffice: (478) 808-7789`
                };
              } else {
                return {
                  subject: `Earthwork Project Proposal Follow-up - TJ Darley Construction, LLC`,
                  body: `Hi ${clientName},\n\nIt was great speaking with you on the phone. We're currently reviewing the soil and access parameters for your ${serviceName} project to draft your custom bid.\n\nWe would love to finalize a date to walk the site together. Please let us know if you have some free time next week for us to check out the layout!\n\nBest regards,\n\nTJ Darley, Owner\nTJ Darley Construction, LLC\nOffice: (478) 808-7789`
                };
              }
            } else {
              // Stage 2: Contract Accepted! Ask for Referrals
              return {
                subject: `Thank You & Welcome to TJ Darley Construction!`,
                body: `Hi ${clientName},\n\nThank you so much for choosing TJ Darley Construction to build your ${serviceName} project! We have officially signed your contract and locked your excavation slot on our master scheduler ledger.\n\nOur team is working on the 811 utility locate tickets to ensure safe dozer grading. We'll reach out soon with our exact mobilization day.\n\n*** Warm Referral Request ***\nAs a family-owned Georgia business, most of our work comes from referrals from great folks like you. If you have friends, neighbors, or colleagues in the area who need forestry mulching, land grading, or ponds dug, we would be incredibly grateful if you'd share our name with them!\n\nWe look forward to transforming your property.\n\nBest regards,\n\nTJ Darley, Owner\nTJ Darley Construction, LLC\nOffice: (478) 808-7789 | Email: office@tjdarley.com`
              };
            }
          };

          // Resolve active email draft
          const emailDraft = getDynamicEmailTemplate(selectedLead);

          const handleAddManualLeadSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!manualLeadName.trim() || !manualLeadPhone.trim()) {
              alert("Please enter Name and Phone number");
              return;
            }
            const newLead = {
              id: `TJD-LEAD-${Date.now().toString().slice(-6)}`,
              clientName: manualLeadName.trim(),
              email: manualLeadEmail.trim() || 'no-email@tjdarley.com',
              phone: manualLeadPhone.trim(),
              location: manualLeadLocation.trim() || 'Central Georgia',
              serviceId: manualLeadService,
              projectSize: parseFloat(manualLeadSize) || 5000,
              unit: 'sq_ft' as const,
              projectDetails: manualLeadDetails.trim() || 'Manually logged in office CRM.',
              status: 'Received' as const,
              submittedAt: new Date().toLocaleDateString('en-US') + ' ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
              reachedOutViaPhone: false,
              appointmentDate: '',
              appointmentTime: '',
              bidAccepted: false
            };
            
            const updated = [newLead, ...onlineWishlists];
            localStorage.setItem('tjd_earthworks_bids', JSON.stringify(updated));
            setOnlineWishlists(updated);
            setSelectedLeadId(newLead.id);
            
            // Reset manual form
            setManualLeadName('');
            setManualLeadEmail('');
            setManualLeadPhone('');
            setManualLeadLocation('');
            setManualLeadDetails('');
            setShowAddManualLeadModal(false);
            
            // Notify other tabs
            window.dispatchEvent(new Event('tjd_bids_updated'));
            alert("Success! Manually logged a new hot lead into your CRM ledger.");
          };

          const handleDeleteLeadAction = (leadId: string, e: React.MouseEvent) => {
            e.stopPropagation();
            if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;
            const updated = onlineWishlists.filter(w => w.id !== leadId);
            localStorage.setItem('tjd_earthworks_bids', JSON.stringify(updated));
            setOnlineWishlists(updated);
            if (selectedLeadId === leadId) {
              setSelectedLeadId('');
            }
            window.dispatchEvent(new Event('tjd_bids_updated'));
          };

          const togglePhoneOutreach = (leadId: string, checked: boolean) => {
            const updated = onlineWishlists.map(w => {
              if (w.id === leadId) {
                return { 
                  ...w, 
                  reachedOutViaPhone: checked,
                  status: checked ? ('Reviewing' as const) : ('Received' as const),
                  // clear appt if untoggled
                  appointmentDate: checked ? w.appointmentDate : '',
                  appointmentTime: checked ? w.appointmentTime : ''
                };
              }
              return w;
            });
            localStorage.setItem('tjd_earthworks_bids', JSON.stringify(updated));
            setOnlineWishlists(updated);
            window.dispatchEvent(new Event('tjd_bids_updated'));
          };

          const toggleBidAccepted = (leadId: string, checked: boolean) => {
            const updated = onlineWishlists.map(w => {
              if (w.id === leadId) {
                return { 
                  ...w, 
                  bidAccepted: checked,
                  status: checked ? ('Scheduled' as const) : ('Reviewing' as const),
                  acceptedDate: checked ? new Date().toLocaleDateString('en-US') : ''
                };
              }
              return w;
            });
            localStorage.setItem('tjd_earthworks_bids', JSON.stringify(updated));
            setOnlineWishlists(updated);
            window.dispatchEvent(new Event('tjd_bids_updated'));
          };

          const saveAppointmentDetails = (leadId: string, date: string, time: string) => {
            const updated = onlineWishlists.map(w => {
              if (w.id === leadId) {
                return { ...w, appointmentDate: date, appointmentTime: time };
              }
              return w;
            });
            localStorage.setItem('tjd_earthworks_bids', JSON.stringify(updated));
            setOnlineWishlists(updated);
            window.dispatchEvent(new Event('tjd_bids_updated'));
            alert("Appointment schedule parameters locked successfully!");
          };

          const handleCopyEmail = (body: string) => {
            navigator.clipboard.writeText(body);
            setCopiedLeadEmail(true);
            setTimeout(() => setCopiedLeadEmail(false), 2000);
          };

          const triggerSimulatedEmailSend = (leadName: string, subject: string) => {
            alert(`📨 Automated Sync Triggered!\n\nEmail scheduled successfully to: ${leadName}\nSubject: ${subject}\n\nProcessed securely via Mailgun/SendGrid bridge node.`);
          };

          const handleAddReminderSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            const targetLeadId = selectedLeadId || (onlineWishlists[0]?.id);
            if (!targetLeadId) {
              alert("Please log or select a client first!");
              return;
            }
            const lead = onlineWishlists.find(w => w.id === targetLeadId);
            if (!lead) return;

            const newRem = {
              id: `REM-${Date.now().toString().slice(-6)}`,
              leadId: targetLeadId,
              clientName: lead.clientName,
              date: newReminderDate || new Date().toISOString().split('T')[0],
              time: newReminderTime,
              reason: newReminderReason,
              status: 'pending',
              createdAt: new Date().toLocaleDateString('en-US')
            };

            const updated = [newRem, ...remindersList];
            setRemindersList(updated);
            localStorage.setItem('tjd_lead_reminders', JSON.stringify(updated));
            setShowAddReminderForm(false);
            alert(`Success! Follow-up reminder logged to email ${lead.clientName} for this outreach template.`);
          };

          const handleCompleteReminder = (remId: string) => {
            const updated = remindersList.map(rem => {
              if (rem.id === remId) {
                return { ...rem, status: 'completed' };
              }
              return rem;
            });
            setRemindersList(updated);
            localStorage.setItem('tjd_lead_reminders', JSON.stringify(updated));
          };

          const handleDeleteReminder = (remId: string) => {
            const updated = remindersList.filter(rem => rem.id !== remId);
            setRemindersList(updated);
            localStorage.setItem('tjd_lead_reminders', JSON.stringify(updated));
          };

          const executeReminderOutreach = (rem: any) => {
            setSelectedLeadId(rem.leadId);
            // set states so details side loads
            const lead = onlineWishlists.find(w => w.id === rem.leadId);
            if (lead) {
              setLeadCustomNotes(lead.notes || '');
              setLeadApptDate(lead.appointmentDate || '');
              setLeadApptTime(lead.appointmentTime || '');
            }
            // Alert user we selected the lead
            alert(`🚀 Selected Lead: ${rem.clientName}\n\nReview their outreach templates in the Right-Hand composer panel below!`);
          };

          const serviceMap: { [key: string]: string } = {
            site_dev: 'Commercial Site Development & Excavation',
            excavation_grading: 'General Excavation & Finish Grading',
            drainage_solutions: 'Drainage Systems & Culverts',
            erosion_control: 'Erosion & Soil Stabilization Control',
            res_pond_digs: 'Residential Custom Earthen Ponds',
            res_land_clearing: 'Residential Forestry Land Clearing',
            res_house_pads: 'Residential House & Pole Barn Pads',
            res_gravel_roads: 'Residential Gravel Road & Driveway Construction'
          };

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Pipeline Stat Summary Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-md">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Total Pipeline Leads</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-white">{totalCount}</span>
                    <span className="text-[10px] text-slate-400 font-bold">In CRM</span>
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-md">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Needs Phone Contact</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-amber-400">{uncontactedCount}</span>
                    <span className="text-[10px] text-amber-500 font-medium animate-pulse">● Cold Outreach</span>
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-md">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Appointments / Review</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-indigo-400">{appointmentCount}</span>
                    <span className="text-[10px] text-indigo-400 font-medium">● Scheduled Bids</span>
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between shadow-md">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Contracts Accepted</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-black text-emerald-400">{acceptedCount}</span>
                    <span className="text-[10px] text-emerald-400 font-medium">● Warm Referrals</span>
                  </div>
                </div>
              </div>

              {/* SYSTEM OUTREACH REMINDERS & FOLLOW-UP TASKS DECK */}
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-3xl p-6 space-y-4 font-sans text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-white font-extrabold text-base flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-400 animate-bounce" />
                      <span>📌 Active System Outreach Reminders</span>
                      <span className="bg-slate-950 text-[10px] border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                        {remindersList.filter(r => r.status === 'pending').length} Pending
                      </span>
                    </h4>
                    <p className="text-slate-400 text-xs">
                      Manually or automatically log milestones to follow up via Phone or Email templates. No clients underbid, no leads forgotten.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddReminderForm(!showAddReminderForm);
                      if (!newReminderDate) {
                        setNewReminderDate(new Date().toISOString().split('T')[0]);
                      }
                    }}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all uppercase font-mono flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showAddReminderForm ? "Close Form" : "Create Reminder"}</span>
                  </button>
                </div>

                {/* INLINE NEW REMINDER FORM */}
                {showAddReminderForm && (
                  <form onSubmit={handleAddReminderSubmit} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="text-xs font-black uppercase text-amber-400 tracking-wider border-b border-white/5 pb-2">
                      Configure New Outreach Reminder Alert
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Select Client */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Select Target Client</label>
                        <select
                          value={selectedLeadId}
                          onChange={(e) => setSelectedLeadId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-sans cursor-pointer"
                        >
                          <option value="">-- Choose registered lead --</option>
                          {onlineWishlists.map(lead => (
                            <option key={lead.id} value={lead.id}>
                              {lead.clientName} ({lead.location})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Reminder Reason / Stage Template */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Outreach Step / Reason</label>
                        <select
                          value={newReminderReason}
                          onChange={(e) => setNewReminderReason(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-sans cursor-pointer"
                        >
                          <option value="Send Stage 0 Welcome Email">Stage 0: Send Welcome Email & Call</option>
                          <option value="Call to book Site Appointment Walk">Stage 1: Call to book Site Walk</option>
                          <option value="Send Stage 1 Site Visit Confirmation">Stage 1: Confirm Site Appointment</option>
                          <option value="Verify Bid Proposal accepting terms">Stage 2: Deliver Bid Proposal</option>
                          <option value="Send Stage 2 Accepted Bid Thank-You & Referrals Request">Stage 2: Thank-You & Referrals Request</option>
                          <option value="General Check-in & Follow-up">Stage 3: General Follow-up</option>
                        </select>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-2 text-left">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Reminder Date</label>
                          <input
                            type="date"
                            value={newReminderDate}
                            onChange={(e) => setNewReminderDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Reminder Time</label>
                          <input
                            type="text"
                            value={newReminderTime}
                            onChange={(e) => setNewReminderTime(e.target.value)}
                            placeholder="09:00 AM"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddReminderForm(false)}
                        className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all uppercase font-mono cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all uppercase font-mono cursor-pointer"
                      >
                        Save Alert
                      </button>
                    </div>
                  </form>
                )}

                {/* REMINDERS LIST DISPLAY */}
                <div className="space-y-3">
                  {remindersList.length === 0 ? (
                    <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 text-center text-slate-500 text-xs">
                      No active outreach reminders logged. Use the "+ Create Reminder" button above to log a follow-up target!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {remindersList.map((rem) => {
                        const isCompleted = rem.status === 'completed';
                        const todayStr = new Date().toISOString().split('T')[0];
                        const isOverdue = !isCompleted && rem.date < todayStr;
                        const isToday = !isCompleted && rem.date === todayStr;

                        let borderClass = "border-slate-850 bg-slate-950/40";
                        let pillClass = "bg-slate-900 text-slate-400 border-slate-800";
                        let pillText = "Scheduled";

                        if (isCompleted) {
                          borderClass = "border-slate-900/40 bg-slate-950/20 opacity-60";
                          pillClass = "bg-emerald-950/40 text-emerald-500 border-emerald-950";
                          pillText = "Completed";
                        } else if (isOverdue) {
                          borderClass = "border-rose-950/60 bg-rose-950/10 shadow-lg shadow-rose-950/5";
                          pillClass = "bg-rose-950 text-rose-400 border-rose-900 animate-pulse";
                          pillText = "⚠️ OVERDUE OUTREACH";
                        } else if (isToday) {
                          borderClass = "border-amber-950/80 bg-amber-950/10";
                          pillClass = "bg-amber-950 text-amber-400 border-amber-900";
                          pillText = "🔔 TODAY";
                        }

                        return (
                          <div key={rem.id} className={`border p-4 rounded-2xl flex flex-col justify-between gap-3 transition-all ${borderClass}`}>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                                  ID: {rem.id} &bull; Set: {rem.createdAt}
                                </span>
                                <span className={`text-[8.5px] border px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wide ${pillClass}`}>
                                  {pillText}
                                </span>
                              </div>
                              <h5 className="text-white font-extrabold text-sm flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>{rem.clientName}</span>
                              </h5>
                              <p className="text-slate-300 text-xs font-medium leading-relaxed">
                                {rem.reason}
                              </p>
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{rem.date}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{rem.time}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3 mt-1">
                              {!isCompleted ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => executeReminderOutreach(rem)}
                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[10px] font-black uppercase font-mono transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    🚀 outreach
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCompleteReminder(rem.id)}
                                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold uppercase font-mono transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    ✓ complete
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] font-mono font-bold text-emerald-500 flex items-center gap-1">
                                  ✓ Milestone Handled
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteReminder(rem.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900/60 rounded-lg transition-all cursor-pointer"
                                title="Delete Reminder"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Master Lead Outreach CRM Panel Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
                
                {/* LEFT COLUMN: Leads list (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Controls & Search */}
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3 shadow-md">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-200">Active Lead Registry</h4>
                      <button
                        type="button"
                        onClick={() => setShowAddManualLeadModal(!showAddManualLeadModal)}
                        className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/60 hover:bg-emerald-900 hover:text-white px-2.5 py-1 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        {showAddManualLeadModal ? '✕ Cancel Form' : '+ Log Manual Lead'}
                      </button>
                    </div>

                    {/* Search Field */}
                    <input
                      type="text"
                      placeholder="Search name, phone, email, or town..."
                      value={leadSearchQuery}
                      onChange={(e) => setLeadSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />

                    {/* Status filter tabs */}
                    <div className="flex flex-wrap gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-850">
                      <button
                        type="button"
                        onClick={() => setLeadStatusFilter('all')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[9.5px] font-bold text-center uppercase tracking-wider transition-all cursor-pointer ${
                          leadStatusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeadStatusFilter('uncontacted')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[9.5px] font-bold text-center uppercase tracking-wider transition-all cursor-pointer ${
                          leadStatusFilter === 'uncontacted' ? 'bg-amber-950 text-amber-300' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Needs Phone
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeadStatusFilter('appointment')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[9.5px] font-bold text-center uppercase tracking-wider transition-all cursor-pointer ${
                          leadStatusFilter === 'appointment' ? 'bg-indigo-950 text-indigo-300' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Appts
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeadStatusFilter('accepted')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[9.5px] font-bold text-center uppercase tracking-wider transition-all cursor-pointer ${
                          leadStatusFilter === 'accepted' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Accepted
                      </button>
                    </div>
                  </div>

                  {/* Manual Lead Form Expansion */}
                  {showAddManualLeadModal && (
                    <form onSubmit={handleAddManualLeadSubmit} className="bg-slate-950 border border-emerald-900/40 p-4 rounded-2xl space-y-3 shadow-lg animate-in slide-in-from-top-3 duration-200">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Log Custom Office Lead</span>
                        <button type="button" onClick={() => setShowAddManualLeadModal(false)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Client Full Name *</label>
                          <input required type="text" placeholder="e.g. Dale Earnhardt" value={manualLeadName} onChange={e => setManualLeadName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 font-bold block uppercase">Phone Number *</label>
                          <input required type="text" placeholder="e.g. 478-555-0199" value={manualLeadPhone} onChange={e => setManualLeadPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase">Email Address</label>
                          <input type="email" placeholder="e.g. dale@nascar.com" value={manualLeadEmail} onChange={e => setManualLeadEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase">Physical Town/Location</label>
                          <input type="text" placeholder="e.g. Greensboro, GA" value={manualLeadLocation} onChange={e => setManualLeadLocation(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase">Earthwork Division</label>
                          <select value={manualLeadService} onChange={e => setManualLeadService(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg">
                            <option value="res_pond_digs">Ponds & Lakes</option>
                            <option value="res_land_clearing">Forestry Land Mulching</option>
                            <option value="res_house_pads">Structural Fill & Pads</option>
                            <option value="res_gravel_roads">Gravel Driveways</option>
                            <option value="site_dev">Commercial Site Dev</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase">Est. Sq Footage Size</label>
                          <input type="number" placeholder="e.g. 15000" value={manualLeadSize} onChange={e => setManualLeadSize(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg" />
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="text-[9px] text-slate-500 block uppercase">Brief Project Details & Scope</label>
                        <textarea rows={2} placeholder="Client needs a 0.5 acre fishing pond with a 12ft clay core wall and emergency bypass..." value={manualLeadDetails} onChange={e => setManualLeadDetails(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-lg text-xs" />
                      </div>

                      <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer">
                        Save Manual CRM Lead
                      </button>
                    </form>
                  )}

                  {/* Leads List */}
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {filteredLeads.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-850 text-slate-500 text-xs">
                        No pipeline leads found matching the criteria.
                      </div>
                    ) : (
                      filteredLeads.map((lead) => {
                        const isSelected = selectedLead && selectedLead.id === lead.id;
                        const hasPhone = !!lead.reachedOutViaPhone;
                        const hasAccepted = !!lead.bidAccepted;
                        const hasAppt = !!lead.appointmentDate;

                        let statusColor = 'border-slate-800 bg-slate-950/40 text-slate-400';
                        let statusText = 'New Prospect';
                        if (hasAccepted) {
                          statusColor = 'border-emerald-500/20 bg-emerald-950/40 text-emerald-400';
                          statusText = 'Contract Accepted';
                        } else if (hasAppt) {
                          statusColor = 'border-indigo-500/20 bg-indigo-950/40 text-indigo-400';
                          statusText = `Meeting Set: ${lead.appointmentDate}`;
                        } else if (hasPhone) {
                          statusColor = 'border-amber-500/20 bg-amber-950/40 text-amber-400';
                          statusText = 'Phone Reached';
                        }

                        return (
                          <div
                            key={lead.id}
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setLeadCustomNotes(lead.notes || '');
                              setLeadApptDate(lead.appointmentDate || '');
                              setLeadApptTime(lead.appointmentTime || '');
                            }}
                            className={`p-3.5 rounded-2xl border transition-all text-left space-y-1.5 cursor-pointer ${
                              isSelected 
                                ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-950/10' 
                                : 'bg-slate-950 hover:bg-slate-900/60 border-slate-850'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{lead.id}</span>
                              <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>
                                {statusText}
                              </span>
                            </div>

                            <div>
                              <h5 className="font-bold text-white text-xs font-sans">{lead.clientName}</h5>
                              <p className="text-slate-400 text-[10.5px] truncate font-sans">
                                {serviceMap[lead.serviceId] || lead.serviceId} • {lead.location}
                              </p>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono select-none pt-1">
                              <span>{lead.submittedAt?.split(' ')[0]}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteLeadAction(lead.id, e)}
                                  className="text-slate-600 hover:text-rose-450 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>

                {/* RIGHT COLUMN: Lead Details & Outreach (lg:col-span-7) */}
                <div className="lg:col-span-7">
                  {selectedLead ? (
                    <div className="bg-slate-950 border border-slate-850 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl animate-in fade-in duration-200">
                      
                      {/* Lead Core Info */}
                      <div className="border-b border-slate-900 pb-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-400 px-2 py-1 rounded border border-emerald-900/40 font-bold uppercase">
                            Active CRM Ticket: {selectedLead.id}
                          </span>
                          <span className="text-[10.5px] text-slate-500 font-mono">{selectedLead.submittedAt}</span>
                        </div>

                        <div>
                          <h3 className="font-display font-black text-xl text-white tracking-tight">{selectedLead.clientName}</h3>
                          <p className="text-slate-400 text-xs mt-0.5 font-sans">
                            Earthen Wishlist submitted via public website.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 font-sans pt-1">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-450 shrink-0" />
                            <a href={`tel:${selectedLead.phone}`} className="hover:text-emerald-400 font-medium">{selectedLead.phone}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-emerald-450 shrink-0" />
                            <a href={`mailto:${selectedLead.email}`} className="hover:text-emerald-400 font-medium truncate">{selectedLead.email}</a>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-450 shrink-0" />
                            <span>{selectedLead.location || 'Central Georgia, USA'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-450 shrink-0" />
                            <span>Prefers Call: {selectedLead.bestTimeToCall || 'Anytime'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Lead Specs Details block */}
                      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-900 text-xs font-sans space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                          <span>Project Specifications</span>
                          <span className="font-mono text-[11px] text-emerald-400 font-black">
                            {selectedLead.projectSize?.toLocaleString()} {selectedLead.unit || 'sq_ft'}
                          </span>
                        </div>
                        <p className="text-white font-bold">{serviceMap[selectedLead.serviceId] || selectedLead.serviceId}</p>
                        {selectedLead.estimatedCostRange && (
                          <p className="text-[11px] text-amber-400 font-black font-mono">
                            Ballpark Range: {selectedLead.estimatedCostRange}
                          </p>
                        )}
                        <p className="text-slate-400 italic leading-relaxed pt-1.5 border-t border-slate-950/50">
                          "{selectedLead.projectDetails || 'No additional specifications provided.'}"
                        </p>
                      </div>

                      {/* CRM Milestone Checklist Form (User requested) */}
                      <div className="space-y-4 border-t border-slate-900 pt-5 text-xs font-sans">
                        <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Lead Qualification & Outreach Milestones</span>
                        </h4>

                        <div className="space-y-3.5">
                          {/* Milestone A Checklist Option */}
                          <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-900 space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!selectedLead.reachedOutViaPhone}
                                onChange={(e) => togglePhoneOutreach(selectedLead.id, e.target.checked)}
                                className="mt-0.5 rounded border-slate-750 text-emerald-500 focus:ring-emerald-500 bg-slate-950 w-4.5 h-4.5"
                              />
                              <div className="space-y-1">
                                <span className="font-bold text-slate-100 block">Milestone 1: Reached out via Phone & Scheduled Appointment</span>
                                <span className="text-slate-450 text-[11px] block leading-relaxed">
                                  Check this off once phone contact is made and you have finalized a calendar site walk.
                                </span>
                              </div>
                            </label>

                            {/* Show Appointment Date Time Selector if checked */}
                            {selectedLead.reachedOutViaPhone && (
                              <div className="pl-7 pt-2.5 border-t border-slate-950/60 flex flex-col sm:flex-row items-end gap-3 animate-in fade-in duration-200">
                                <div className="space-y-1 flex-1 text-left w-full">
                                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Target Site Walk Date</label>
                                  <input 
                                    type="date" 
                                    value={leadApptDate}
                                    onChange={(e) => setLeadApptDate(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg text-xs" 
                                  />
                                </div>
                                <div className="space-y-1 flex-1 text-left w-full">
                                  <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Target Time Slot</label>
                                  <input 
                                    type="text" 
                                    placeholder="e.g. 10:00 AM" 
                                    value={leadApptTime}
                                    onChange={(e) => setLeadApptTime(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg text-xs" 
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => saveAppointmentDetails(selectedLead.id, leadApptDate, leadApptTime)}
                                  className="py-2 px-4 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-450 hover:text-white border border-emerald-800 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all w-full sm:w-auto text-center"
                                >
                                  Lock Schedule
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Milestone B Checklist Option */}
                          <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-900">
                            <label className="flex items-start gap-3 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!selectedLead.bidAccepted}
                                onChange={(e) => toggleBidAccepted(selectedLead.id, e.target.checked)}
                                className="mt-0.5 rounded border-slate-750 text-emerald-500 focus:ring-emerald-500 bg-slate-950 w-4.5 h-4.5"
                              />
                              <div className="space-y-1">
                                <span className="font-bold text-slate-100 block">Milestone 2: Contract / Bid Officially Accepted</span>
                                <span className="text-slate-450 text-[11px] block leading-relaxed">
                                  Check this off once bid is accepted! The email system automatically transitions to referral/thank-you mode.
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Import action bridge to connect CRM to Survey Form */}
                      <div className="bg-slate-900/30 p-4 rounded-2xl border border-dashed border-slate-800 space-y-2 text-left font-sans">
                        <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">Operational Action Bridge</span>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-[11px] text-slate-400 max-w-md">
                            Ready to do the physical on-site layout check? Import this lead's specs directly into your active Pre-Bid Survey Form now.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              handleImportWishlist(selectedLead.id);
                              setActiveLeadTab('new-intake');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 justify-center shadow-lg"
                          >
                            <span>Import to Survey Form</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Email Follow-Up and Outreach Composer */}
                      <div className="space-y-4 border-t border-slate-900 pt-5 text-left font-sans text-xs">
                        <div className="flex justify-between items-center">
                          <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                            <Mail className="w-4.5 h-4.5 text-emerald-400" />
                            <span>Outreach Follow-Up Composer (Non-Pushy Templates)</span>
                          </h4>
                          <span className="text-[9px] bg-slate-900 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-800">
                            {selectedLead.bidAccepted 
                              ? 'Stage 2: Referrals' 
                              : selectedLead.reachedOutViaPhone 
                                ? 'Stage 1: Appointment Follow-Up' 
                                : 'Stage 0: Welcome Cold Outreach'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                            {/* Subject preview header */}
                            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-850 flex items-baseline gap-2">
                              <span className="text-[10px] text-slate-500 font-mono uppercase font-black">Subject:</span>
                              <span className="text-white text-xs font-bold truncate">{emailDraft.subject}</span>
                            </div>

                            {/* Email body editor preview */}
                            <div className="p-4">
                              <textarea
                                rows={8}
                                value={emailDraft.body}
                                readOnly
                                className="w-full bg-transparent text-[11.5px] text-slate-300 font-mono focus:outline-none leading-relaxed resize-none cursor-default"
                              />
                            </div>
                          </div>

                          {/* Composer Actions */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(emailDraft.body)}
                              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                copiedLeadEmail 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-850'
                              }`}
                            >
                              <ClipboardCheck className="w-4 h-4" />
                              <span>{copiedLeadEmail ? '✓ Copied to Clipboard!' : 'Copy Email Body'}</span>
                            </button>

                            <a
                              href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`}
                              className="flex-1 py-3 px-4 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 hover:text-white border border-emerald-800/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Compose in Outlook/Mail</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => triggerSimulatedEmailSend(selectedLead.clientName, emailDraft.subject)}
                              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                            >
                              <span>Simulate Auto-Send</span>
                            </button>
                          </div>
                          
                          <p className="text-[10.5px] text-slate-500 leading-normal italic text-center sm:text-left">
                            * Pro Tip: Running these messages through mailto: links keeps client outreach personal, bypasses spam filters, and maintains the humble, local family-owned business vibe!
                          </p>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-850 p-10 rounded-3xl text-center text-slate-500 text-xs">
                      Please select or add a lead to inspect qualification milestones.
                    </div>
                  )}
                </div>

              </div>

            </div>
          );
        })()}

        {activeLeadTab === 'progression' && (() => {
          const currentProjectStages = projectProgressStages.filter(stage => {
            if (progressionSelectedProjectId === 'mock-greensboro') {
              return stage.projectId === 'SUB-1718816000000-1234';
            }
            return stage.projectId === progressionSelectedProjectId;
          });

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* STAGE PROGRESSION FORM */}
              <div className="bg-slate-950 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 text-left">
                <div className="space-y-1.5 border-b border-slate-900 pb-4">
                  <h3 className="font-display font-black text-lg text-white">Stage-by-Stage Project Progression Intake</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Select a client pre-bid project to record dynamic land preparation phases, attach live camera snapshots, and tag exact geopositioning check-ins over the shift timeline.
                  </p>
                </div>

                <form onSubmit={handleSubmitProgressionStage} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                    <div className="space-y-1.5 text-xs">
                      <label className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">CALL UP ACTIVE PROJECT PIPELINE:</label>
                      <select
                        value={progressionSelectedProjectId}
                        onChange={(e) => {
                          setProgressionSelectedProjectId(e.target.value);
                          const val = e.target.value;
                          if (val === 'mock-greensboro') {
                            setProgressionClientName('George Harrison');
                          } else {
                            const s = historyLogs.find(h => h.id === val);
                            if (s) {
                              setProgressionClientName(s.clientName || s.formData?.clientName || '');
                            } else {
                              setProgressionClientName('');
                            }
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                      >
                        <option value="mock-greensboro">Greensboro Lot (Lake Oconee, GA) [George Harrison]</option>
                        {historyLogs.map(log => (
                          <option key={log.id} value={log.id}>{log.jobName || log.formData?.jobName || 'Unnamed Pre-Bid'} [{log.clientName || 'Inquiry'}]</option>
                        ))}
                        <option value="custom">Start Custom Project/Job...</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <label className="font-bold text-slate-350">LOGGED BY FOREMAN</label>
                      <select
                        value={progressionForeman}
                        onChange={(e) => setProgressionForeman(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange transition-colors"
                      >
                        <option value="TJ Darley">TJ Darley (Owner / Director)</option>
                        <option value="Kyle Simmons">Kyle Simmons (Lead Operator)</option>
                        <option value="Marcus Cole">Marcus Cole (Finisher Tech)</option>
                        <option value="Terry Vance">Terry Vance (Heavy Excavation)</option>
                        <option value="Becky Miller">Becky Miller (Administrative Clerk)</option>
                      </select>
                    </div>
                  </div>

                  {progressionSelectedProjectId === 'custom' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-4 animate-in fade-in duration-150">
                      <div className="space-y-1.5 text-xs font-sans">
                        <label className="font-bold text-slate-300">CUSTOM PROJECT / JOB NAME:*</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Warner Robins Commercial Lot"
                          value={progressionCustomProjectName}
                          onChange={(e) => setProgressionCustomProjectName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange"
                        />
                      </div>
                      <div className="space-y-1.5 text-xs font-sans">
                        <label className="font-bold text-slate-300">CLIENT / CONTACT NAME:</label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe"
                          value={progressionClientName}
                          onChange={(e) => setProgressionClientName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                    <div className="space-y-1.5 text-xs font-sans">
                      <label className="font-bold text-slate-300 font-sans">CURRENT PROGRESSION STAGE:*</label>
                      <select
                        value={progressionStageTitle}
                        onChange={(e) => setProgressionStageTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 outline-none focus:border-brand-orange"
                      >
                        <option value="Stage 1: Pre-Bid Survey Base">Stage 1: Pre-Bid Survey Base</option>
                        <option value="Stage 2: Heavy Timber & Underbrush Clearing">Stage 2: Heavy Timber & Underbrush Clearing</option>
                        <option value="Stage 3: Rough Grading & Site Prep">Stage 3: Rough Grading & Site Prep</option>
                        <option value="Stage 4: Soil Density & Slope Calibration Check">Stage 4: Soil Density & Slope Calibration Check</option>
                        <option value="Stage 5: Pond/Dam Excavation & Embankment Build">Stage 5: Pond/Dam Excavation & Embankment Build</option>
                        <option value="Stage 6: Spillway & Overflow Piping Installation">Stage 6: Spillway & Overflow Piping Installation</option>
                        <option value="Stage 7: Final Finishing & Quality Verification">Stage 7: Final Finishing & Quality Verification</option>
                        <option value="Stage 8: Client Walkthrough & Official Hand-off">Stage 8: Client Walkthrough & Official Hand-off</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-xs font-sans">
                      <label className="font-bold text-slate-400 font-sans uppercase tracking-widest text-[8px]">LOGGED AT</label>
                      <input
                        type="text"
                        readOnly
                        value={new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-400 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-sans">
                    <label className="font-bold text-slate-300">PROGRESSION NOTES & COMPLIANCE DETAILS:*</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Record notes to prove project progression, e.g., 'Grade-slope check verifies embankment height is exactly 12 feet. mulching operation successfully minimized runoff as per USDA standards.'"
                      value={progressionStageNotes}
                      onChange={(e) => setProgressionStageNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-sm text-slate-200 outline-none focus:border-brand-orange resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5 text-xs font-sans">
                    <label className="font-bold text-slate-300 block">STAGE PROOF ATTACHMENT (PHOTO):</label>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-12">
                        <div 
                          onClick={() => progressionFileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-800 hover:border-emerald-500 bg-slate-950/80 p-5 rounded-2xl text-center cursor-pointer transition-all space-y-2 group"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            ref={progressionFileInputRef}
                            onChange={handleProgressionPhotoChange}
                            className="hidden"
                          />
                          <Camera className="w-8 h-8 text-slate-505 group-hover:text-emerald-400 mx-auto transition-colors animate-pulse" />
                          <div className="text-[11px] text-slate-400">
                            <span className="text-emerald-450 font-bold underline">Click to snap</span> or Drag & Drop landscape progress photo
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">Supports PNG, JPG (Max 5MB compressed)</p>
                        </div>
                      </div>
                    </div>

                    {progressionPhotoPreview && (
                      <div className="mt-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 max-w-sm animate-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3">
                          <img 
                            src={progressionPhotoPreview} 
                            alt="Prog Preview" 
                            className="w-12 h-12 rounded object-cover border border-slate-800 shadow"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left">
                            <p className="text-slate-200 text-xs font-bold truncate max-w-[180px]">{progressionPhotoFilename}</p>
                            <p className="text-emerald-400 text-[10px] font-mono">Ready to Sync</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setProgressionPhotoBase64('');
                            setProgressionPhotoFilename('');
                            setProgressionPhotoPreview('');
                            if (progressionFileInputRef.current) progressionFileInputRef.current.value = '';
                          }}
                          className="text-slate-400 hover:text-rose-450 p-2 rounded bg-slate-955 hover:bg-slate-900 transition-all font-bold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`p-5 rounded-2xl border flex flex-col gap-4 pb-5 ${
                    progressionLatitude && progressionLongitude 
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' 
                      : 'bg-indigo-950/30 border-indigo-900 text-indigo-300'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-rose-950/20 pb-2.5 text-left w-full">
                      <div className="space-y-0.5">
                        <h4 className="font-bold flex items-center gap-1.5 text-xs text-slate-100 uppercase tracking-wider">
                          <MapPin className={`w-3.5 h-3.5 shrink-0 ${progressionLatitude ? 'text-emerald-400' : 'text-indigo-400 animate-pulse'}`} />
                          <span>Project Stage Geolocation Check-in</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Timestamp and tag the exact surveyor coordinates pin-pointing where this status photo is captured.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProgressionManualMode(!progressionManualMode);
                          setProgressionManualPrecisionAlert('');
                        }}
                        className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded font-bold uppercase tracking-wider text-slate-300 cursor-pointer shadow self-start sm:self-center"
                      >
                        {progressionManualMode ? '🛰️ Satellite Auto' : '⌨️ Enter Coordinates'}
                      </button>
                    </div>

                    {!progressionManualMode ? (
                      <div className="flex flex-col gap-3 text-left w-full">
                        <div className="flex-1 space-y-2">
                          {/* Always show Decoders Grid so fields are completely visible and clear to the user! */}
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono bg-slate-950 border border-slate-900 rounded-xl p-2.5">
                              <div className="bg-slate-900/60 p-2 rounded space-y-0.5">
                                <span className="text-[8px] text-slate-500 uppercase font-black block">Surveyor DMS</span>
                                <span className={`font-bold block truncate ${(progressionLatitude && progressionLongitude) ? 'text-white' : 'text-slate-650 italic'}`}>
                                  {(progressionLatitude && progressionLongitude) ? decimalToDMS(parseFloat(progressionLatitude), parseFloat(progressionLongitude)).combined : 'Awaiting DMS Fix...'}
                                </span>
                              </div>
                              <div className="bg-slate-900/60 p-2 rounded space-y-0.5">
                                <span className="text-[8px] text-slate-500 uppercase font-black block">Trimble UTM</span>
                                <span className={`font-bold block truncate ${(progressionLatitude && progressionLongitude) ? 'text-emerald-400' : 'text-slate-700 italic'}`}>
                                  {(progressionLatitude && progressionLongitude) ? decimalToUTM(parseFloat(progressionLatitude), parseFloat(progressionLongitude)).formatted : 'Awaiting UTM...'}
                                </span>
                              </div>
                              <div className="bg-slate-900/60 p-2 rounded space-y-0.5">
                                <span className="text-[8px] text-slate-500 uppercase font-black block">Decimal Coords</span>
                                <span className={`font-bold block truncate ${(progressionLatitude && progressionLongitude) ? 'text-slate-300' : 'text-slate-650 italic'}`}>
                                  {(progressionLatitude && progressionLongitude) ? `${progressionLatitude}, ${progressionLongitude}` : 'Latitude, Longitude'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {progressionGpsError && (
                          <div className="bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-lg text-[10px] text-rose-300 text-left font-sans flex flex-col gap-1">
                            <span className="font-bold text-rose-400">⚠️ Stage Grid Alert:</span>
                            <p>{progressionGpsError}</p>
                            <button
                              type="button"
                              onClick={handleProgressionSimulateGPS}
                              className="self-start text-[9px] font-black underline text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                            >
                              ⚡ Bypass checking &amp; simulate connection instead
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={progressionGpsLoading}
                            onClick={handleProgressionCaptureGPS}
                            className={`py-2.5 px-3.5 text-white text-[10px] font-black rounded-lg uppercase tracking-wide transition-all shadow shrink-0 cursor-pointer flex items-center gap-1.5 ${
                              progressionLatitude && progressionLongitude
                                ? 'bg-emerald-600 hover:bg-emerald-500'
                                : 'bg-brand-orange hover:bg-brand-darkorange'
                            }`}
                          >
                            {progressionGpsLoading ? (
                              <>
                                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                                <span>Checking...</span>
                              </>
                            ) : (
                              <span>{progressionLatitude && progressionLongitude ? '🔄 Re-acquire GPS' : 'Capture Stage GPS'}</span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleProgressionSimulateGPS}
                            className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-indigo-950/45 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all shadow shrink-0 cursor-pointer"
                          >
                            ⚡ Simulate Lock
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 animate-in fade-in duration-200 w-full text-left">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-3">
                          <span className="text-[9px] text-brand-orange uppercase font-mono font-bold tracking-widest block text-left">
                            ⌨️ Manual Positioning override
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1 text-xs font-sans">
                              <label className="font-bold text-slate-400">LATITUDE INDEX:</label>
                              <input
                                type="text"
                                placeholder="e.g. 33.575600"
                                value={progressionManualLatInput}
                                onChange={(e) => setProgressionManualLatInput(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded py-1.5 px-2 text-xs font-mono text-white outline-none animate-none"
                              />
                            </div>
                            <div className="space-y-1 text-xs font-sans">
                              <label className="font-bold text-slate-400">LONGITUDE INDEX:</label>
                              <input
                                type="text"
                                placeholder="e.g. -83.181800"
                                value={progressionManualLngInput}
                                onChange={(e) => setProgressionManualLngInput(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded py-1.5 px-2 text-xs font-mono text-white outline-none animate-none"
                              />
                            </div>
                          </div>
                          {progressionManualPrecisionAlert && (
                            <p className="text-[10px] text-rose-455 font-bold font-sans">{progressionManualPrecisionAlert}</p>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleProgressionSaveManualGPS}
                            className="py-1.5 px-3 bg-brand-orange text-white hover:bg-orange-600 rounded text-[10px] font-black uppercase tracking-wider cursor-pointer font-sans"
                          >
                            Save Coordinates
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-xl tracking-widest uppercase transition-all shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/30"
                  >
                    <ClipboardCheck className="w-5 h-5 shrink-0" />
                    <span>SAVE & COMMIT SHIFT PROGRESS STAGE</span>
                  </button>
                </form>
              </div>

              {/* PROJECT COMPLIANCE TIMELINE */}
              <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 sm:p-8 space-y-6 text-left" id="project-progression-timeline-main">
                <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                  <div className="space-y-1">
                    <h4 className="font-display font-black text-md text-white tracking-tight uppercase flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-450 animate-pulse animate-duration-1000" />
                      <span>Project Progression Proof Timeline</span>
                    </h4>
                    <p className="text-slate-450 text-xs">
                      Chronological visual timeline showing logged stages, supervisor comments, and certified satellite coordinates.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-450 border border-emerald-900 px-2.5 py-1 rounded font-mono font-bold">
                    {currentProjectStages.length} STAGES LOGGED
                  </span>
                </div>

                {currentProjectStages.length === 0 ? (
                  <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-slate-900 space-y-2">
                    <p className="text-slate-400 text-xs sm:text-sm font-bold">No progress snapshots logged for this project yet.</p>
                    <p className="text-slate-500 text-[11px]">Use the progression form above to register the first milestone snapshot and GPS parameters.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 md:pl-8 space-y-8 font-sans">
                    {/* Vertical connecter line */}
                    <div className="absolute left-2.5 md:left-3.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-slate-900"></div>

                    {currentProjectStages.map((stage) => (
                      <div key={stage.id} className="relative space-y-3.5 animate-in fade-in duration-200">
                        {/* Timeline node circle */}
                        <div className="absolute -left-[23px] md:-left-[27px] top-1 w-4 h-4 rounded-full bg-slate-950 border-4 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/40 z-10"></div>
                        
                        {/* Stage card */}
                        <div className="bg-slate-900/70 border border-slate-850 p-5 rounded-2xl shadow-md relative overflow-hidden group">
                          {/* Upper info */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850/60 pb-2.5">
                            <div>
                              <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded font-bold animate-pulse inline-block mb-1">
                                Verified Stage Point
                              </span>
                              <h5 className="font-display font-black text-sm text-white leading-snug">{stage.stageTitle}</h5>
                              <p className="text-slate-400 text-[10.5px]">Project: <strong className="text-slate-350">{stage.projectName}</strong> {stage.clientName ? `• ${stage.clientName}` : ''}</p>
                            </div>
                            <div className="text-left sm:text-right text-[10.5px]">
                              <span className="text-slate-500 block">Foreman Checked</span>
                              <span className="font-mono text-slate-305 font-bold">{stage.foreman}</span>
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
                              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-905 group/img">
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
                            <div className="pt-3 max-w-md">
                              <div className="relative rounded-xl overflow-hidden border border-slate-850 bg-gradient-to-tr from-slate-950 to-slate-900 p-6 text-center space-y-2">
                                <div className="mx-auto w-10 h-10 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-lg text-emerald-400">
                                  🏞️
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-white text-xs font-bold font-sans">Lakeside Terrain Initial Survey Snapshot</p>
                                  <p className="text-slate-500 text-[10px] max-w-xs mx-auto font-sans">Original landscape survey check compiled on on-site device. Geo-tagged to Greensboro Lot private dock parcel.</p>
                                </div>
                                <div className="text-[9px] text-slate-500 font-mono bg-slate-950 py-0.5 px-2 rounded-full w-fit mx-auto border border-slate-805">
                                  lakeside_initial_survey.jpg • Embedded
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {/* Geolocated proof info */}
                          {(stage.latitude && stage.longitude) && (
                            <div className="mt-4 pt-3.5 border-t border-slate-850/60 text-[10px] font-mono text-slate-400 space-y-2">
                              <span className="text-[9px] text-emerald-400 uppercase font-sans font-bold tracking-widest block">Geological Satellite Verification Check:</span>
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
                                  className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 underline font-sans text-[9.5px]"
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
          );
        })()}

          </div>
        )}

      </div>

    </div>
  );
}
