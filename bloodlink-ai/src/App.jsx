/**
 * BloodLink AI – Main Application Component
 * 
 * Sets up routing between the three main pages:
 * 1. Hospital Dashboard (/) – Create requests, track status
 * 2. Donor Portal (/donor) – Register, accept requests
 * 3. Network Map (/map) – Visualize hospital & donor locations
 * 
 * Also renders the persistent Navbar and Toast notifications.
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HospitalDashboard from './components/HospitalDashboard';
import DonorPage from './components/DonorPage';
import MapView from './components/MapView';
import ToastNotifications from './components/ToastNotifications';

export default function App() {
  return (
    <div className="app">
      {/* Persistent Navigation */}
      <Navbar />

      {/* Toast Notifications (floating, top-right) */}
      <ToastNotifications />

      {/* Main Content Area */}
      <main className="container">
        <Routes>
          <Route path="/" element={<HospitalDashboard />} />
          <Route path="/donor" element={<DonorPage />} />
          <Route path="/map" element={<MapView />} />
        </Routes>
      </main>
    </div>
  );
}
