/**
 * Navbar Component – Production Design
 * 
 * Premium navigation bar with centered pill-style links,
 * animated branding, and live status indicator.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const { stats } = useApp();

  return (
    <nav className="navbar" id="main-navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <div className="brand-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bloodGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f87171"/>
                <stop offset="1" stopColor="#dc2626"/>
              </linearGradient>
            </defs>
            <path d="M16 2C16 2 6 14 6 20C6 25.5228 10.4772 30 16 30C21.5228 30 26 25.5228 26 20C26 14 16 2 16 2Z" fill="url(#bloodGrad)"/>
            <path d="M13 19C13 17.3431 14.3431 16 16 16C17.6569 16 19 17.3431 19 19C19 20.6569 17.6569 22 16 22C14.3431 22 13 20.6569 13 19Z" fill="rgba(255,255,255,0.3)"/>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">BloodLink<span className="brand-ai">AI</span></span>
          <span className="brand-tagline">Emergency Network</span>
        </div>
      </div>

      {/* Centered Navigation */}
      <div className="navbar-center">
        <div className="nav-pills">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
            id="nav-hospital"
          >
            <svg className="nav-pill-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Hospital</span>
            {stats.pendingRequests > 0 && (
              <span className="pill-badge red">{stats.pendingRequests}</span>
            )}
          </NavLink>

          <NavLink
            to="/donor"
            className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
            id="nav-donor"
          >
            <svg className="nav-pill-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Donors</span>
            <span className="pill-badge green">{stats.availableDonors}</span>
          </NavLink>

          <NavLink
            to="/map"
            className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
            id="nav-map"
          >
            <svg className="nav-pill-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            <span>Map</span>
          </NavLink>
        </div>
      </div>

      {/* Right: Live Indicator */}
      <div className="navbar-right">
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span className="live-text">LIVE</span>
        </div>
      </div>
    </nav>
  );
}
