/**
 * BloodLink AI – Application Context
 * 
 * Central state management using React Context API.
 * Simulates Firebase real-time behavior with local state.
 * All state updates trigger re-renders across components,
 * mimicking Firestore snapshot listeners.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SAMPLE_DONORS, HOSPITAL_LOCATION } from '../data/sampleData';
import { findMatchingDonors } from '../utils/matching';

const AppContext = createContext(null);

/**
 * Custom hook to access the app context
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

/**
 * AppProvider – wraps the entire application with shared state.
 * 
 * Manages:
 * - donors: list of all registered blood donors
 * - requests: list of all blood requests from hospitals
 * - notifications: toast notification queue
 */
export function AppProvider({ children }) {
  // ======= Donors State =======
  const [donors, setDonors] = useState(SAMPLE_DONORS);

  // ======= Blood Requests State =======
  const [requests, setRequests] = useState([]);

  // ======= Notifications State =======
  const [notifications, setNotifications] = useState([]);

  // ======= Counter for unique IDs =======
  const [idCounter, setIdCounter] = useState(1);

  /**
   * Generate a unique ID for new records
   */
  const generateId = useCallback((prefix) => {
    setIdCounter(prev => prev + 1);
    return `${prefix}-${Date.now()}-${idCounter}`;
  }, [idCounter]);

  /**
   * Show a toast notification
   * Auto-dismisses after 5 seconds
   */
  const showNotification = useCallback((title, message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message, type }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  /**
   * Dismiss a specific notification
   */
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // ========================================
  // DONOR OPERATIONS
  // ========================================

  /**
   * Register a new donor
   * Simulates Firestore document creation
   */
  const registerDonor = useCallback((donorData) => {
    const newDonor = {
      id: generateId('donor'),
      ...donorData,
      available: true,
      createdAt: new Date().toISOString(),
    };

    setDonors(prev => [...prev, newDonor]);
    showNotification(
      '🩸 New Donor Registered',
      `${donorData.name} (${donorData.bloodGroup}) is now available`,
      'success'
    );

    return newDonor;
  }, [generateId, showNotification]);

  /**
   * Toggle donor availability
   */
  const toggleDonorAvailability = useCallback((donorId) => {
    setDonors(prev =>
      prev.map(d =>
        d.id === donorId ? { ...d, available: !d.available } : d
      )
    );
  }, []);

  // ========================================
  // REQUEST OPERATIONS
  // ========================================

  /**
   * Create a new blood request from hospital.
   * Automatically finds matching donors.
   * Simulates Firestore document creation + snapshot trigger.
   */
  const createRequest = useCallback((requestData) => {
    const newRequest = {
      id: generateId('req'),
      ...requestData,
      status: 'Pending',
      assignedDonorId: null,
      assignedDonorName: null,
      createdAt: new Date().toISOString(),
      location: requestData.location || HOSPITAL_LOCATION,
    };

    setRequests(prev => [newRequest, ...prev]);

    // Find matching donors immediately (simulates cloud function trigger)
    const matches = findMatchingDonors(newRequest, donors);

    showNotification(
      '🏥 Emergency Request Created',
      `${requestData.bloodGroup} blood needed – ${matches.length} matching donor(s) found within 20km`,
      matches.length > 0 ? 'success' : 'warning'
    );

    return { request: newRequest, matchedDonors: matches };
  }, [generateId, donors, showNotification]);

  /**
   * Donor accepts a blood request.
   * Updates request status to "Donor Assigned".
   * Marks donor as unavailable.
   * Simulates real-time Firestore update.
   */
  const acceptRequest = useCallback((requestId, donorId) => {
    const donor = donors.find(d => d.id === donorId);
    if (!donor) return;

    // Update request status (simulates Firestore update)
    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'Donor Assigned',
              assignedDonorId: donorId,
              assignedDonorName: donor.name,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    // Mark donor as unavailable
    setDonors(prev =>
      prev.map(d =>
        d.id === donorId ? { ...d, available: false } : d
      )
    );

    // Real-time notification (simulates FCM push)
    showNotification(
      '✅ Donor Accepted!',
      `${donor.name} has accepted the blood request. Status updated to "Donor Assigned"`,
      'success'
    );
  }, [donors, showNotification]);

  /**
   * Mark a request as completed
   * Final step in the request lifecycle: Pending → Donor Assigned → Completed
   */
  const completeRequest = useCallback((requestId) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'Completed', completedAt: new Date().toISOString() }
          : r
      )
    );

    showNotification(
      '🎉 Request Completed!',
      'Blood donation successfully completed. Thank you for saving a life!',
      'success'
    );
  }, [showNotification]);

  /**
   * AI Auto-Dispatch
   * Automatically assigns the best matching available donor (closest distance)
   */
  const autoDispatch = useCallback((requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request || request.status !== 'Pending') return false;

    const matches = findMatchingDonors(request, donors);
    if (matches.length === 0) {
      showNotification('⚠️ Auto-Dispatch Failed', 'No compatible nearby donors available.', 'error');
      return false;
    }

    // Best match is the first one since findMatchingDonors sorts by distance
    const bestMatch = matches[0];
    
    acceptRequest(requestId, bestMatch.id);
    
    showNotification(
      '🤖 AI Auto-Dispatch Successful', 
      `${bestMatch.name} (${bestMatch.distance}km away) assigned. ETA: ${bestMatch.eta} mins.`, 
      'success'
    );
    
    return true;
  }, [requests, donors, acceptRequest, showNotification]);

  // ========================================
  // MATCHING OPERATIONS
  // ========================================

  /**
   * Get matching donors for a specific request
   */
  const getMatchedDonors = useCallback((request) => {
    return findMatchingDonors(request, donors);
  }, [donors]);

  // ========================================
  // STATISTICS
  // ========================================

  const stats = {
    totalDonors: donors.length,
    availableDonors: donors.filter(d => d.available).length,
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'Pending').length,
    assignedRequests: requests.filter(r => r.status === 'Donor Assigned').length,
    completedRequests: requests.filter(r => r.status === 'Completed').length,
  };

  // ======= Context Value =======
  const value = {
    // State
    donors,
    requests,
    notifications,
    stats,

    // Donor Operations
    registerDonor,
    toggleDonorAvailability,

    // Request Operations
    createRequest,
    acceptRequest,
    completeRequest,
    autoDispatch,

    // Matching
    getMatchedDonors,

    // Notifications
    showNotification,
    dismissNotification,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
