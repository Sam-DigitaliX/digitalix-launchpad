import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  VisitorData,
  initializeVisitorTracking,
  incrementPageViews,
  deleteAllTrackingData,
  getVisitorData,
  getTrafficSource,
  calculateProfile,
  formatDate,
} from '@/lib/trackingUtils';

export interface TrackingDisplayData {
  firstVisit: string;
  sourceFirstVisit: string;
  sourceLastVisit: string;
  totalPageViews: number;
  profile: string;
  sessionCount: number;
}

export function useVisitorTracking() {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [displayData, setDisplayData] = useState<TrackingDisplayData | null>(null);
  const location = useLocation();

  // Update display data from visitor data
  const updateDisplayData = useCallback((data: VisitorData | null) => {
    if (!data || data.visits.length === 0) {
      setDisplayData(null);
      return;
    }

    const firstVisit = data.visits[0];
    const lastVisit = data.visits[data.visits.length - 1];

    setDisplayData({
      firstVisit: formatDate(data.first_website_visit),
      sourceFirstVisit: getTrafficSource(firstVisit),
      sourceLastVisit: getTrafficSource(lastVisit),
      totalPageViews: data.pageviews,
      profile: calculateProfile(data.pageviews),
      sessionCount: data.sessions,
    });
  }, []);

  // Initialize tracking on mount
  useEffect(() => {
    const data = initializeVisitorTracking();
    setVisitorData(data);
    updateDisplayData(data);
  }, [updateDisplayData]);

  // Track page views on route change
  useEffect(() => {
    // Skip the first render (already handled in initialization)
    if (!visitorData) return;

    const data = incrementPageViews();
    if (data) {
      setVisitorData(data);
      updateDisplayData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- visitorData intentionally omitted to avoid infinite loop
  }, [location.pathname, updateDisplayData]);

  // Delete all data and reload
  const deleteData = useCallback(() => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes vos données de tracking ?')) {
      deleteAllTrackingData();
      setVisitorData(null);
      setDisplayData(null);
      window.location.reload();
    }
  }, []);

  // Refresh data from localStorage
  const refreshData = useCallback(() => {
    const data = getVisitorData();
    setVisitorData(data);
    updateDisplayData(data);
  }, [updateDisplayData]);

  return {
    visitorData,
    displayData,
    deleteData,
    refreshData,
    isTracking: !!displayData,
  };
}
