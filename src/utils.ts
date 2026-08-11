/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export interface AppBranding {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  establishedYear: string;
  serviceAreas: string;
  logoText: string;
  ratesMarkupPercent: number;
}

export function getAppBranding(): AppBranding {
  try {
    const saved = localStorage.getItem('tjd_app_branding');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Failed to parse app branding:", err);
  }
  return {
    companyName: 'TJ Darley Construction',
    phone: '478-808-7789',
    email: 'office@tjdarley.com',
    address: 'Macon, GA',
    website: 'https://tjdarley.com',
    establishedYear: '2008',
    serviceAreas: 'Macon, Warner Robins, Perry, Fort Valley, Greensboro, Dublin, Milledgeville, Lake Oconee',
    logoText: 'TJ DARLEY',
    ratesMarkupPercent: 0
  };
}

export function saveAppBranding(branding: AppBranding): void {
  localStorage.setItem('tjd_app_branding', JSON.stringify(branding));
  window.dispatchEvent(new Event('tjd_branding_change'));
}

export function useAppBranding() {
  const [branding, setBranding] = useState<AppBranding>(getAppBranding);

  useEffect(() => {
    const handleBrandingChange = () => {
      setBranding(getAppBranding());
    };
    window.addEventListener('tjd_branding_change', handleBrandingChange);
    return () => {
      window.removeEventListener('tjd_branding_change', handleBrandingChange);
    };
  }, []);

  return branding;
}

/**
 * Gets the current Google Sheets Apps Script Webhook URL setting.
 * Defaults to the established stable endpoint.
 */
export function getWebhookUrl(): string {
  const saved = localStorage.getItem('tjd_sheets_webhook_url');
  if (!saved) {
    return 'https://script.google.com/macros/s/AKfycbzRXVJ6Em2zYtjW-kXPIKhklk1kJYIT9znfOevY_MoMSslgGIe0yg5V_1RLy35Ofsg/exec';
  }
  return saved;
}

/**
 * Gets the configured Slack Webhook URL.
 */
export function getSlackWebhookUrl(): string {
  return localStorage.getItem('tjd_slack_webhook_url') || '';
}

/**
 * Updates the configured Slack Webhook URL.
 */
export function setSlackWebhookUrl(url: string): void {
  localStorage.setItem('tjd_slack_webhook_url', url.trim());
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  toEmail: string;
  smsPhone?: string;
  smsCarrier?: string;
  smsGateway?: string;
}

/**
 * Gets the configured SMTP mailer configuration.
 */
export function getSmtpConfig(): SmtpConfig {
  try {
    const saved = localStorage.getItem('tjd_smtp_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Failed to parse SMTP config:", err);
  }
  return {
    host: 'mail.tjdarleyconstruction.com',
    port: 587,
    secure: false,
    user: 'info@tjdarleyconstruction.com',
    pass: '',
    toEmail: 'info@tjdarleyconstruction.com',
    smsPhone: '',
    smsCarrier: 'none',
    smsGateway: ''
  };
}

/**
 * Saves SMTP configuration to browser cache.
 */
export function setSmtpConfig(config: SmtpConfig): void {
  localStorage.setItem('tjd_smtp_config', JSON.stringify(config));
}

/**
 * Dispatches a beautifully formatted email alert directly using the server-side SMTP dispatcher (free, secure & no Zapier).
 */
export async function sendEmailAlert(payload: {
  leadType: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  details?: string;
}): Promise<boolean> {
  const smtp = getSmtpConfig();
  if (!smtp.pass) {
    console.log("SMTP password is not configured. Skipping email dispatch.");
    return false;
  }

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        smtp,
        payload
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to make /api/send-email call:", error);
    return false;
  }
}

/**
 * Dispatches a beautifully formatted alert directly to the Slack Incoming Webhook (free & secure proxy).
 */
export async function sendSlackAlert(payload: {
  leadType: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  details?: string;
}): Promise<boolean> {
  const slackUrl = getSlackWebhookUrl();
  if (!slackUrl) {
    console.log("Slack Webhook URL is not configured. Skipping Slack alert.");
    return false;
  }

  try {
    const response = await fetch('/api/slack-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhookUrl: slackUrl,
        payload: {
          text: `🚨 New Lead: ${payload.clientName} (${payload.leadType})`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*🚨 New Earthwork Lead Captured - T.J. Darley Construction 🚨*`
              }
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Lead Type:*\n${payload.leadType}` },
                { type: "mrkdwn", text: `*Client Name:*\n${payload.clientName}` },
                { type: "mrkdwn", text: `*Phone:*\n${payload.clientPhone || 'N/A'}` },
                { type: "mrkdwn", text: `*Email:*\n${payload.clientEmail || 'N/A'}` },
              ]
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Inquiry Details:*\n${payload.details || 'No additional notes provided.'}`
              }
            },
            {
              type: "divider"
            }
          ]
        }
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send Slack alert:", error);
    return false;
  }
}

/**
 * Updates the current Google Sheets Apps Script Webhook URL setting.
 */
export function setWebhookUrl(url: string): void {
  localStorage.setItem('tjd_sheets_webhook_url', url.trim());
}

/**
 * Standard submit helper to post structured data payload to the webhook.
 */
export async function submitToSheetsWebhook(payload: Record<string, any>): Promise<boolean> {
  const webhookUrl = getWebhookUrl();
  
  const formDataPayload = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    formDataPayload.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formDataPayload,
      mode: 'no-cors', // standard Google Apps Script CORS bypass method for simple POSTs
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return true;
  } catch (error) {
    console.error("Sheets Webhook submission error:", error);
    return false;
  }
}

/**
 * Converts decimal degrees latitude and longitude to Degrees Minutes Seconds (DMS) format.
 * This is the ultimate standard for land surveyors and mapping precision.
 */
export function decimalToDMS(lat: number, lng: number): { latDMS: string; lngDMS: string; combined: string } {
  const getDMS = (val: number, isLat: boolean): string => {
    const absVal = Math.abs(val);
    const deg = Math.floor(absVal);
    const min = Math.floor((absVal - deg) * 60);
    const sec = ((absVal - deg - min / 60) * 3600).toFixed(2);
    let dir = '';
    if (isLat) {
      dir = val >= 0 ? 'N' : 'S';
    } else {
      dir = val >= 0 ? 'E' : 'W';
    }
    return `${deg}° ${min}' ${sec}" ${dir}`;
  };

  const latDMS = getDMS(lat, true);
  const lngDMS = getDMS(lng, false);
  return {
    latDMS,
    lngDMS,
    combined: `${latDMS}, ${lngDMS}`
  };
}

/**
 * Converts decimal degrees latitude and longitude to Degrees Decimal Minutes (DDM) format.
 * Frequently used in marine systems, old GPS workbooks, and aerial navigation.
 */
export function decimalToDDM(lat: number, lng: number): { latDDM: string; lngDDM: string; combined: string } {
  const getDDM = (val: number, isLat: boolean): string => {
    const absVal = Math.abs(val);
    const deg = Math.floor(absVal);
    const min = ((absVal - deg) * 60).toFixed(4);
    let dir = '';
    if (isLat) {
      dir = val >= 0 ? 'N' : 'S';
    } else {
      dir = val >= 0 ? 'E' : 'W';
    }
    return `${deg}° ${min}' ${dir}`;
  };

  const latDDM = getDDM(lat, true);
  const lngDDM = getDDM(lng, false);
  return {
    latDDM,
    lngDDM,
    combined: `${latDDM}, ${lngDDM}`
  };
}

/**
 * Converts decimal degrees latitude and longitude to UTM (Universal Transverse Mercator) coordinates.
 * This system is used by John Deere SmartGrade and Trimble heavy equipment receivers
 * to construct continuous flat grid layouts with millimeter compaction precision.
 */
export function decimalToUTM(lat: number, lng: number): { zone: string; easting: number; northing: number; formatted: string } {
  const K0 = 0.9996;
  const a = 6378137.0; // WGS-84 equatorial radius in meters
  const f = 1 / 298.257223563;
  const b = a * (1 - f);
  const esq = (a * a - b * b) / (a * a);
  const e0sq = (a * a - b * b) / (b * b);
  
  const latRad = lat * Math.PI / 180;
  const lngRad = lng * Math.PI / 180;
  
  let zoneNum = Math.floor((lng + 180) / 6) + 1;
  if (lat >= 56.0 && lat < 64.0 && lng >= 3.0 && lng < 12.0) {
    zoneNum = 32;
  }
  
  // Special zones for Svalbard
  if (lat >= 72.0 && lat < 84.0) {
    if (lng >= 0.0 && lng < 9.0) zoneNum = 31;
    else if (lng >= 9.0 && lng < 21.0) zoneNum = 33;
    else if (lng >= 21.0 && lng < 33.0) zoneNum = 35;
    else if (lng >= 33.0 && lng < 42.0) zoneNum = 37;
  }
  
  const zoneMeridian = ((zoneNum - 1) * 6 - 180 + 3) * Math.PI / 180;
  const zoneLetter = lat >= 0 ? 'N' : 'S'; // Hemisphere identifier
  
  const N = a / Math.sqrt(1 - esq * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = e0sq * Math.cos(latRad) * Math.cos(latRad);
  const A = Math.cos(latRad) * (lngRad - zoneMeridian);
  
  const M = a * (
    (1 - esq / 4 - 3 * esq * esq / 64 - 5 * esq * esq * esq / 256) * latRad -
    (3 * esq / 8 + 3 * esq * esq / 32 + 45 * esq * esq * esq / 1024) * Math.sin(2 * latRad) +
    (15 * esq * esq / 256 + 45 * esq * esq * esq / 1024) * Math.sin(4 * latRad) -
    (35 * esq * esq * esq / 3072) * Math.sin(6 * latRad)
  );
  
  const easting = K0 * N * (
    A +
    (1 - T + C) * A * A * A / 6 +
    (5 - 18 * T + T * T + 72 * C - 58 * e0sq) * A * A * A * A * A / 120
  ) + 500000.0;
  
  let northing = K0 * (
    M +
    N * Math.tan(latRad) * (
      A * A / 2 +
      (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24 +
      (61 - 58 * T + T * T + 600 * C - 330 * e0sq) * A * A * A * A * A * A / 720
    )
  );
  
  if (lat < 0) {
    northing += 10000000.0; // 10,000,000 meter offset for southern hemisphere
  }
  
  const formatted = `Zone ${zoneNum}${zoneLetter} | E: ${Math.round(easting)}m, N: ${Math.round(northing)}m`;
  
  return {
    zone: `${zoneNum}${zoneLetter}`,
    easting: Math.round(easting),
    northing: Math.round(northing),
    formatted
  };
}

/**
 * Smart coordinates notation parser. Decodes manual entries from DMS, decimal degrees,
 * or even raw strings into validated decimal latitude and longitude numbers.
 * This allows crews to type "33 15 24 N" or standard integers directly!
 */
export function parseFuzzyCoordinates(latInput: string, lngInput: string): { latitude: number; longitude: number } | null {
  const parseSingle = (input: string, isLatitude: boolean): number | null => {
    const cleaned = input.trim().toUpperCase()
      .replace(/[°'"]/g, ' ') // Strip notation symbols
      .replace(/\s+/g, ' '); // Standardize spaces
    
    if (!cleaned) return null;

    // Check direction suffixes/prefixes
    let modifier = 1;
    let baseText = cleaned;
    
    if (cleaned.endsWith('S') || cleaned.endsWith('W')) {
      modifier = -1;
      baseText = cleaned.slice(0, -1).trim();
    } else if (cleaned.endsWith('N') || cleaned.endsWith('E')) {
      modifier = 1;
      baseText = cleaned.slice(0, -1).trim();
    } else if (cleaned.startsWith('S') || cleaned.startsWith('W')) {
      modifier = -1;
      baseText = cleaned.slice(1).trim();
    } else if (cleaned.startsWith('N') || cleaned.startsWith('E')) {
      modifier = 1;
      baseText = cleaned.slice(1).trim();
    }

    const parts = baseText.split(' ').map(Number).filter(n => !isNaN(n));

    if (parts.length === 0) return null;

    if (parts.length === 1) {
      // Decimal Degrees format: 33.5756
      return parts[0] * modifier;
    } else if (parts.length === 2) {
      // Degrees Decimal Minutes format: 33 34.536
      const deg = parts[0];
      const min = parts[1];
      return (deg + min / 60) * modifier;
    } else if (parts.length >= 3) {
      // Degrees Minutes Seconds format: 33 34 32.16
      const deg = parts[0];
      const min = parts[1];
      const sec = parts[2];
      return (deg + min / 60 + sec / 3600) * modifier;
    }

    return null;
  };

  try {
    const lat = parseSingle(latInput, true);
    const lng = parseSingle(lngInput, false);
    
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { latitude: lat, longitude: lng };
      }
    }
  } catch (err) {
    console.error("Fuzzy coordinates parsing error:", err);
  }
  return null;
}
