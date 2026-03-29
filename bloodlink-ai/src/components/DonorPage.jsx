/**
 * Donor Page
 * 
 * Allows blood donors to:
 * 1. Register as a new donor
 * 2. View emergency blood requests
 * 3. Accept requests matching their blood group
 * 4. Toggle availability status
 * 
 * Features donor registration form, request feed, and quick action buttons.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BLOOD_GROUPS, HOSPITAL_LOCATION } from '../data/sampleData';
import { getUrgencyDetails, getStatusDetails, calculateDistance } from '../utils/matching';
import './DonorPage.css';

export default function DonorPage() {
  const {
    donors,
    requests,
    stats,
    registerDonor,
    acceptRequest,
    toggleDonorAvailability,
  } = useApp();

  // ======= Registration Form State =======
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'O+',
    phone: '',
    lat: '',
    lng: '',
    lastDonated: '',
  });

  // ======= Active Donor Selection (simulates logged-in donor) =======
  const [activeDonorId, setActiveDonorId] = useState(null);
  const activeDonor = donors.find(d => d.id === activeDonorId);

  // ======= Filter: show only pending requests matching active donor's blood group =======
  const relevantRequests = useMemo(() => {
    return requests
      .filter(r => r.status === 'Pending')
      .map(r => {
        // Calculate distance from active donor (or a default location)
        const donorLoc = activeDonor?.location || { lat: 19.076, lng: 72.877 };
        const dist = calculateDistance(
          donorLoc.lat, donorLoc.lng,
          r.location.lat, r.location.lng
        );
        return { ...r, distance: Math.round(dist * 10) / 10 };
      })
      .sort((a, b) => {
        // Sort: matching blood group first, then by urgency, then by distance
        const aMatch = activeDonor && a.bloodGroup === activeDonor.bloodGroup ? 0 : 1;
        const bMatch = activeDonor && b.bloodGroup === activeDonor.bloodGroup ? 0 : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;

        const urgencyOrder = { 'Critical': 0, 'Urgent': 1, 'Normal': 2 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return a.distance - b.distance;
      });
  }, [requests, activeDonor]);

  // ======= Handle Registration =======
  const handleRegister = (e) => {
    e.preventDefault();

    // Generate random location near hospital if not provided
    const lat = formData.lat
      ? parseFloat(formData.lat)
      : HOSPITAL_LOCATION.lat + (Math.random() - 0.5) * 0.1;
    const lng = formData.lng
      ? parseFloat(formData.lng)
      : HOSPITAL_LOCATION.lng + (Math.random() - 0.5) * 0.1;

    const newDonor = registerDonor({
      name: formData.name,
      bloodGroup: formData.bloodGroup,
      phone: formData.phone,
      location: { lat, lng },
      lastDonated: formData.lastDonated || null,
    });

    // Auto-select the new donor
    setActiveDonorId(newDonor.id);
    setShowForm(false);
    setFormData({
      name: '',
      bloodGroup: 'O+',
      phone: '',
      lat: '',
      lng: '',
      lastDonated: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ======= Handle Accept Request =======
  const handleAccept = (requestId) => {
    if (!activeDonorId) {
      alert('Please select a donor profile first to accept requests.');
      return;
    }
    acceptRequest(requestId, activeDonorId);
  };

  return (
    <div className="donor-page" id="donor-page">
      {/* Page Header */}
      <header className="page-header animate-fadeInUp">
        <div className="page-header-content">
          <h1>🤝 Donor Portal</h1>
          <p className="page-description">
            Register as a donor, view emergency requests, and save lives
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          id="toggle-register-form"
        >
          {showForm ? '✕ Close' : '+ Register as Donor'}
        </button>
      </header>

      {/* Registration Form (Collapsible) */}
      {showForm && (
        <div className="registration-section animate-scaleIn">
          <div className="card card-glass">
            <div className="card-header">
              <h2>📝 Donor Registration</h2>
              <p className="card-description">
                Join the BloodLink network and help save lives
              </p>
            </div>

            <form onSubmit={handleRegister} className="donor-form" id="donor-register-form">
              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="donor-name">Full Name</label>
                  <input
                    type="text"
                    id="donor-name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donor-blood">Blood Group</label>
                  <select
                    id="donor-blood"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    required
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="donor-phone">Phone (Optional)</label>
                  <input
                    type="tel"
                    id="donor-phone"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="donor-lat">Latitude (Optional)</label>
                  <input
                    type="number"
                    id="donor-lat"
                    name="lat"
                    step="any"
                    placeholder="e.g. 19.0760"
                    value={formData.lat}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donor-lng">Longitude (Optional)</label>
                  <input
                    type="number"
                    id="donor-lng"
                    name="lng"
                    step="any"
                    placeholder="e.g. 72.8777"
                    value={formData.lng}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="donor-last-donated">Last Donated</label>
                  <input
                    type="date"
                    id="donor-last-donated"
                    name="lastDonated"
                    value={formData.lastDonated}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <p className="form-hint">
                💡 If coordinates are left empty, a location near the hospital will be assigned for demo
              </p>

              <button type="submit" className="btn btn-success btn-lg" id="register-donor-btn">
                ✓ Register Donor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="donor-content">
        {/* Left: Donor Selector & List */}
        <div className="donor-list-section animate-fadeInUp delay-1">
          <div className="section-header">
            <h2>👥 Registered Donors</h2>
            <span className="donor-count">{stats.availableDonors} available</span>
          </div>

          {/* Active Donor Selector */}
          <div className="donor-selector">
            <label htmlFor="active-donor-select">Act as Donor:</label>
            <select
              id="active-donor-select"
              value={activeDonorId || ''}
              onChange={(e) => setActiveDonorId(e.target.value || null)}
            >
              <option value="">-- Select a donor profile --</option>
              {donors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.bloodGroup}) {d.available ? '✓' : '✗'}
                </option>
              ))}
            </select>
          </div>

          {/* Donor Cards */}
          <div className="donor-cards-list">
            {donors.map((donor, index) => (
              <div
                key={donor.id}
                className={`donor-card card animate-fadeInUp delay-${Math.min(index + 1, 6)} ${
                  activeDonorId === donor.id ? 'active-donor' : ''
                } ${!donor.available ? 'unavailable' : ''}`}
                onClick={() => setActiveDonorId(donor.id)}
                id={`donor-card-${donor.id}`}
              >
                <div className="donor-card-header">
                  <div className="donor-avatar">
                    {donor.name.charAt(0)}
                  </div>
                  <div className="donor-info">
                    <h4 className="donor-name">{donor.name}</h4>
                    <span className="donor-blood-badge">{donor.bloodGroup}</span>
                  </div>
                  <div className={`availability-dot ${donor.available ? 'available' : 'busy'}`}>
                    {donor.available ? '●' : '○'}
                  </div>
                </div>

                <div className="donor-meta">
                  {donor.phone && (
                    <span className="donor-meta-item">📱 {donor.phone}</span>
                  )}
                  <span className="donor-meta-item">
                    📍 {donor.location.lat.toFixed(4)}, {donor.location.lng.toFixed(4)}
                  </span>
                  {donor.lastDonated && (
                    <span className="donor-meta-item">
                      🩸 Last: {new Date(donor.lastDonated).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {activeDonorId === donor.id && (
                  <button
                    className={`btn btn-sm ${donor.available ? 'btn-outline' : 'btn-success'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDonorAvailability(donor.id);
                    }}
                    id={`toggle-availability-${donor.id}`}
                  >
                    {donor.available ? 'Set Unavailable' : 'Set Available'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Emergency Requests Feed */}
        <div className="request-feed-section animate-fadeInUp delay-2">
          <div className="section-header">
            <h2>🚨 Emergency Requests</h2>
            <span className="request-count">{relevantRequests.length} pending</span>
          </div>

          {activeDonor && (
            <div className="active-donor-banner">
              <span>Acting as: <strong>{activeDonor.name}</strong></span>
              <span className="donor-blood-badge">{activeDonor.bloodGroup}</span>
              <span className={`availability-status ${activeDonor.available ? '' : 'unavailable-text'}`}>
                {activeDonor.available ? '✓ Available' : '✗ Unavailable'}
              </span>
            </div>
          )}

          {relevantRequests.length === 0 ? (
            <div className="empty-state card card-glass">
              <div className="empty-icon">📭</div>
              <h3>No Pending Requests</h3>
              <p>
                {requests.length === 0
                  ? 'No emergency requests yet. Check back or create one from the Hospital Dashboard.'
                  : 'All requests have been assigned or completed.'}
              </p>
            </div>
          ) : (
            <div className="request-feed">
              {relevantRequests.map((request, index) => {
                const urgency = getUrgencyDetails(request.urgency);
                const isMatch = activeDonor && request.bloodGroup === activeDonor.bloodGroup;

                return (
                  <div
                    key={request.id}
                    className={`request-feed-card card animate-fadeInUp delay-${Math.min(index + 1, 6)} ${
                      request.urgency === 'Critical' ? 'critical-glow' : ''
                    } ${isMatch ? 'match-highlight' : ''}`}
                    id={`feed-request-${request.id}`}
                  >
                    {isMatch && (
                      <div className="match-badge">
                        ✨ Blood Group Match!
                      </div>
                    )}

                    <div className="feed-card-header">
                      <div className="feed-blood-info">
                        <span className="blood-type">{request.bloodGroup}</span>
                        <span className="blood-units">{request.units} units needed</span>
                      </div>
                      <span className={`badge ${urgency.className}`}>
                        {urgency.icon} {urgency.label}
                      </span>
                    </div>

                    <div className="feed-card-details">
                      <p><span>🏥</span> {request.hospitalName}</p>
                      <p><span>📍</span> {request.distance} km away</p>
                      <p><span>🕐</span> {new Date(request.createdAt).toLocaleTimeString()}</p>
                    </div>

                    <div className="feed-card-actions">
                      {activeDonor && activeDonor.available && isMatch ? (
                        <button
                          className="btn btn-success"
                          onClick={() => handleAccept(request.id)}
                          id={`accept-request-${request.id}`}
                        >
                          ✓ Accept Request
                        </button>
                      ) : activeDonor && !isMatch ? (
                        <span className="mismatch-label">
                          Blood group mismatch
                        </span>
                      ) : activeDonor && !activeDonor.available ? (
                        <span className="mismatch-label">
                          You are currently unavailable
                        </span>
                      ) : (
                        <span className="mismatch-label">
                          Select a donor profile to respond
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
