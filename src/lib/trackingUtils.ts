// Types for visitor tracking
export interface Visit {
  timestamp: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  landing_page: string;
}

export interface VisitorData {
  first_website_visit: string;
  pageviews: number;
  sessions: number;
  visits: Visit[];
  last_activity: string;
}

const STORAGE_KEY = 'digitalix_visitor';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Capture UTM parameters from URL
export function getUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    gclid: params.get('gclid') || '',
    fbclid: params.get('fbclid') || '',
  };
}

// Determine traffic source with priority
export function getTrafficSource(visit: Visit): string {
  // Priority 1: UTM source
  if (visit.utm_source) {
    if (visit.utm_medium) {
      return `${visit.utm_source} / ${visit.utm_medium}`;
    }
    return visit.utm_source;
  }
  
  // Priority 2: GCLID (Google Ads)
  if (visit.gclid) return 'google / cpc';
  
  // Priority 3: FBCLID (Facebook Ads)
  if (visit.fbclid) return 'facebook / cpc';
  
  // Priority 4: Referrer
  if (!visit.referrer || visit.referrer === '') return 'direct';
  
  try {
    const referrerURL = new URL(visit.referrer);
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
    
    // If referrer = same domain → internal navigation
    if (referrerURL.hostname === currentDomain) return 'direct';
    
    // Return referrer domain
    return referrerURL.hostname.replace('www.', '');
  } catch {
    return 'direct';
  }
}

// Behavioral profile types
export type BehavioralProfile = 'hot' | 'engaged' | 'cold';

export interface BehavioralData {
  profile: BehavioralProfile;
  profileLabel: string;
  pageviews: number;
  sessions: number;
  firstVisitSource: string;
  currentSource: string;
  bonusScore: number;
  isHotProspect: boolean;
}

// Calculate behavioral profile
export function calculateProfile(pageviews: number): string {
  if (pageviews >= 8) return 'Prospect chaud 🔥';
  if (pageviews >= 4) return 'Prospect engagé';
  return 'Prospect';
}

// Get behavioral profile type (for scoring)
export function getBehavioralProfileType(pageviews: number): BehavioralProfile {
  if (pageviews >= 8) return 'hot';
  if (pageviews >= 4) return 'engaged';
  return 'cold';
}

// Calculate bonus score based on behavioral data
export function calculateBehavioralBonus(data: VisitorData | null): number {
  if (!data) return 0;
  
  let bonus = 0;
  
  // Profile bonus
  const profileType = getBehavioralProfileType(data.pageviews);
  if (profileType === 'hot') bonus += 15;
  else if (profileType === 'engaged') bonus += 5;
  
  // Multi-session bonus (shows serious intent)
  if (data.sessions >= 3) bonus += 5;
  
  return bonus;
}

// Get full behavioral data for form integration
export function getBehavioralData(): BehavioralData | null {
  const data = getVisitorData();
  if (!data) return null;
  
  const firstVisit = data.visits[0];
  const lastVisit = data.visits[data.visits.length - 1];
  const profileType = getBehavioralProfileType(data.pageviews);
  
  return {
    profile: profileType,
    profileLabel: calculateProfile(data.pageviews),
    pageviews: data.pageviews,
    sessions: data.sessions,
    firstVisitSource: firstVisit ? getTrafficSource(firstVisit) : 'direct',
    currentSource: lastVisit ? getTrafficSource(lastVisit) : 'direct',
    bonusScore: calculateBehavioralBonus(data),
    isHotProspect: profileType === 'hot',
  };
}

// Format date in French
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

// Get visitor data from localStorage
export function getVisitorData(): VisitorData | null {
  if (typeof window === 'undefined') return null;
  
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) return null;
  
  try {
    return JSON.parse(rawData) as VisitorData;
  } catch {
    return null;
  }
}

// Save visitor data to localStorage
export function saveVisitorData(data: VisitorData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Create a new visit object
function createVisit(): Visit {
  const utmParams = getUTMParams();
  
  return {
    timestamp: new Date().toISOString(),
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    utm_source: utmParams.utm_source || undefined,
    utm_medium: utmParams.utm_medium || undefined,
    utm_campaign: utmParams.utm_campaign || undefined,
    utm_content: utmParams.utm_content || undefined,
    utm_term: utmParams.utm_term || undefined,
    gclid: utmParams.gclid || undefined,
    fbclid: utmParams.fbclid || undefined,
    landing_page: typeof window !== 'undefined' ? window.location.pathname : '/',
  };
}

// Check if this is a new session (> 30 min since last activity)
function isNewSession(lastActivity: string): boolean {
  const lastTime = new Date(lastActivity).getTime();
  const now = Date.now();
  return (now - lastTime) > SESSION_TIMEOUT_MS;
}

// Initialize or update visitor tracking
export function initializeVisitorTracking(): VisitorData {
  const existingData = getVisitorData();
  const now = new Date().toISOString();
  const newVisit = createVisit();
  
  if (!existingData) {
    // First visit ever
    const newData: VisitorData = {
      first_website_visit: now,
      pageviews: 1,
      sessions: 1,
      visits: [newVisit],
      last_activity: now,
    };
    saveVisitorData(newData);
    return newData;
  }
  
  // Returning visitor
  const isNew = isNewSession(existingData.last_activity);
  
  const updatedData: VisitorData = {
    ...existingData,
    pageviews: existingData.pageviews + 1,
    sessions: isNew ? existingData.sessions + 1 : existingData.sessions,
    visits: isNew ? [...existingData.visits, newVisit] : existingData.visits,
    last_activity: now,
  };
  
  saveVisitorData(updatedData);
  return updatedData;
}

// Increment page views (for SPA navigation)
export function incrementPageViews(): VisitorData | null {
  const existingData = getVisitorData();
  if (!existingData) return null;
  
  const updatedData: VisitorData = {
    ...existingData,
    pageviews: existingData.pageviews + 1,
    last_activity: new Date().toISOString(),
  };
  
  saveVisitorData(updatedData);
  return updatedData;
}

// Delete all tracking data
export function deleteAllTrackingData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
