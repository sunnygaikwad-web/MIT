/**
 * MapView Component
 * 
 * Displays a Leaflet map showing:
 * - Hospital location (pulsing glowing marker)
 * - All registered donors (custom premium markers)
 * - 20km radius circle around hospital
 * - Popup details on each marker
 */

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { HOSPITAL_LOCATION } from '../data/sampleData';
import { calculateDistance } from '../utils/matching';
import './MapView.css';

// Fix Leaflet default icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Premium SVG for Blood Drop
const bloodDropSvg = `
<svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2C16 2 6 14 6 20C6 25.5228 10.4772 30 16 30C21.5228 30 26 25.5228 26 20C26 14 16 2 16 2Z" fill="white"/>
  <path d="M13 19C13 17.3431 14.3431 16 16 16C17.6569 16 19 17.3431 19 19C19 20.6569 17.6569 22 16 22C14.3431 22 13 20.6569 13 19Z" fill="rgba(0,0,0,0.2)"/>
</svg>`;

// Custom icon for hospital with pulsing radar effect
const hospitalIcon = new L.DivIcon({
  className: 'custom-marker hospital-marker-container',
  html: `
    <div class="hospital-pulse-ring"></div>
    <div class="marker-pin hospital-pin">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" display="none"/>
        <path d="M3 21h18"></path>
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
        <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path>
        <path d="M10 9h4"></path>
        <path d="M12 7v4"></path>
      </svg>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44],
});

// Custom icon for available donor
const donorAvailableIcon = new L.DivIcon({
  className: 'custom-marker donor-marker',
  html: `<div class="marker-pin donor-pin available-pin">${bloodDropSvg}</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

// Custom icon for unavailable donor
const donorUnavailableIcon = new L.DivIcon({
  className: 'custom-marker donor-marker',
  html: `<div class="marker-pin donor-pin unavailable-pin">${bloodDropSvg}</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

export default function MapView() {
  const { donors, stats } = useApp();

  // Calculate donors within radius
  const donorsWithDistance = useMemo(() => {
    return donors.map(d => ({
      ...d,
      distance: calculateDistance(
        HOSPITAL_LOCATION.lat, HOSPITAL_LOCATION.lng,
        d.location.lat, d.location.lng
      ),
    }));
  }, [donors]);

  const withinRadius = donorsWithDistance.filter(d => d.distance <= 20);
  const outsideRadius = donorsWithDistance.filter(d => d.distance > 20);

  return (
    <div className="map-page" id="map-page">
      {/* Page Header */}
      <header className="page-header animate-fadeInUp">
        <h1>Network Map</h1>
        <p className="page-description">
          Real-time visualization of hospital and donor locations within the emergency network
        </p>
      </header>

      {/* Map Stats */}
      <div className="map-stats animate-fadeInUp delay-1">
        <div className="map-stat">
          <span className="map-stat-number" style={{color: 'var(--success-500)'}}>{withinRadius.length}</span>
          <span className="map-stat-label">Donors in Range</span>
        </div>
        <div className="map-stat">
          <span className="map-stat-number" style={{color: 'var(--text-primary)'}}>{outsideRadius.length}</span>
          <span className="map-stat-label">Outside Range</span>
        </div>
        <div className="map-stat glow-red-text">
          <span className="map-stat-number" style={{color: 'var(--primary-500)'}}>{stats.pendingRequests}</span>
          <span className="map-stat-label">Active Requests</span>
        </div>
        <div className="map-stat">
          <span className="map-stat-number" style={{color: 'var(--text-primary)'}}>20 km</span>
          <span className="map-stat-label">Search Radius</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container animate-fadeInUp delay-2">
        <MapContainer
          center={[HOSPITAL_LOCATION.lat, HOSPITAL_LOCATION.lng]}
          zoom={12.5}
          style={{ height: '100%', width: '100%', background: '#f8f9fa' }}
          scrollWheelZoom={true}
          zoomControl={false}
        >
          {/* Real Google Maps TileLayer (Roadmap) */}
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
          />

          {/* 20km radius circle - Premium glowing style */}
          <Circle
            center={[HOSPITAL_LOCATION.lat, HOSPITAL_LOCATION.lng]}
            radius={20000}
            pathOptions={{
              color: 'var(--primary-500)',
              fillColor: 'url(#gradient-radius)',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '4 8',
              lineCap: 'round',
            }}
          />

          {/* Hospital Marker */}
          <Marker
            position={[HOSPITAL_LOCATION.lat, HOSPITAL_LOCATION.lng]}
            icon={hospitalIcon}
            zIndexOffset={1000}
          >
            <Popup className="premium-popup">
              <div className="popup-content">
                <strong>{HOSPITAL_LOCATION.name}</strong>
                <br />
                <span className="badge badge-critical" style={{ marginTop: '4px', marginBottom: '8px', display: 'inline-block' }}>Emergency Center</span>
                <br />
                <small className="coord-text">
                  {HOSPITAL_LOCATION.lat.toFixed(4)}, {HOSPITAL_LOCATION.lng.toFixed(4)}
                </small>
              </div>
            </Popup>
          </Marker>

          {/* Donor Markers */}
          {donorsWithDistance.map(donor => (
            <Marker
              key={donor.id}
              position={[donor.location.lat, donor.location.lng]}
              icon={donor.available ? donorAvailableIcon : donorUnavailableIcon}
              zIndexOffset={donor.distance <= 20 ? 500 : 100}
            >
              <Popup className="premium-popup">
                <div className="popup-content">
                  <div className="popup-header">
                    <strong>{donor.name}</strong>
                    <span className="donor-blood-badge">{donor.bloodGroup}</span>
                  </div>
                  <div className="popup-status">
                    <span className={`availability-dot ${donor.available ? 'available' : 'busy'}`}>●</span>
                    <span>{donor.available ? 'Available' : 'Unavailable'}</span>
                  </div>
                  <div className="popup-distance">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span style={{ color: donor.distance <= 20 ? 'var(--success-400)' : 'var(--text-muted)' }}>
                      {donor.distance.toFixed(1)} km away
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Custom SVG definitions for map gradients */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <radialGradient id="gradient-radius" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="rgba(229, 0, 0, 0.15)" />
              <stop offset="80%" stopColor="rgba(229, 0, 0, 0.05)" />
              <stop offset="100%" stopColor="rgba(229, 0, 0, 0)" />
            </radialGradient>
          </defs>
        </svg>

      </div>

      {/* Legend */}
      <div className="map-legend animate-fadeInUp delay-3">
        <div className="legend-item">
          <span className="legend-dot hospital-dot"></span>
          <span>Central Hospital</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot available-dot"></span>
          <span>Ready Donor</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot unavailable-dot"></span>
          <span>Unavailable</span>
        </div>
        <div className="legend-item">
          <span className="legend-circle"></span>
          <span>Emergency Zone (20km)</span>
        </div>
      </div>
    </div>
  );
}
